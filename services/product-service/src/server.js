require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Product = require("./models/product.model");
const { startGrpcServer } = require("./grpc");

const app = express();

app.use(express.json());

// API kiem tra Product Service
app.get("/health", (req, res) => {
    res.json({
        service: "product-service",
        status: "OK",
    });
});

// API lay danh sach san pham
app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find(
            {},
            { _id: 0, __v: 0 }
        ).sort({ pid: 1 });

        res.status(200).json(products);
    } catch (error) {
        console.error("Get products error:", error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// Ket noi MongoDB va khoi dong server
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Product Service connected to MongoDB");

        // Khoi dong gRPC Server
        startGrpcServer();

        const PORT = process.env.PORT || 3003;

        app.listen(PORT, () => {
            console.log("Product Service running on port " + PORT);
        });
    } catch (error) {
        console.error("Failed to start Product Service:", error);
        process.exit(1);
    }
}

startServer();
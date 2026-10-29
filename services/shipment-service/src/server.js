
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const Shipment = require("./models/Shipment");

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
    res.status(200).json({
        service: "shipment-service",
        status: "OK"
    });
});

app.get("/api/shipments/order/:oid", async (req, res) => {
    try {
        const oid = Number(req.params.oid);

        if (!Number.isInteger(oid) || oid <= 0) {
            return res.status(400).json({
                message: "Invalid order ID"
            });
        }

        const shipment = await Shipment.findOne({ oid })
            .select("-__v");

        if (!shipment) {
            return res.status(404).json({
                message: "Shipment not found"
            });
        }

        return res.status(200).json({
            message: "Shipment found",
            shipment
        });
    } catch (error) {
        console.error("Get shipment error:", error);

        return res.status(500).json({
            message: "Failed to get shipment"
        });
    }
});

async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        console.log("Shipment Service connected to MongoDB");

        const PORT = process.env.PORT || 3005;

        app.listen(PORT, () => {
            console.log("Shipment Service running on port " + PORT);
        });
    } catch (error) {
        console.error("Failed to start Shipment Service:", error);
        process.exit(1);
    }
}

startServer();

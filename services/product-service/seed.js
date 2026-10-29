require("dotenv").config();

const mongoose = require("mongoose");
const Product = require("./src/models/product.model");

async function seedProducts() {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        console.log("Connected to MongoDB");

        const products = [
            {
                pid: 1,
                pname: "iPhone 15",
                price: 20000000,
                quantity: 10,
            },
            {
                pid: 2,
                pname: "Laptop Dell Inspiron",
                price: 16000000,
                quantity: 8,
            },
            {
                pid: 3,
                pname: "Samsung Galaxy S24",
                price: 18000000,
                quantity: 15,
            },
        ];

        for (const product of products) {
            await Product.updateOne(
                { pid: product.pid },
                { $setOnInsert: product },
                { upsert: true }
            );
        }

        console.log("Seed products completed successfully!");
    } catch (error) {
        console.error("Seed error:", error);
    } finally {
        await mongoose.disconnect();
    }
}

seedProducts();
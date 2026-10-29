
require("dotenv").config();

const mongoose = require("mongoose");
const { Kafka } = require("kafkajs");
const Shipment = require("./models/Shipment");

const kafka = new Kafka({
    clientId: "shipment-service",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(",")
});

const consumer = kafka.consumer({
    groupId: process.env.KAFKA_GROUP_ID || "shipment-service-group"
});

async function startConsumer() {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("Shipment Consumer connected to MongoDB");

    await consumer.connect();

    console.log("Shipment Consumer connected to Kafka");

    await consumer.subscribe({
        topic: process.env.KAFKA_TOPIC || "order-created",
        fromBeginning: true
    });

    await consumer.run({
        eachMessage: async ({ message }) => {
            const order = JSON.parse(message.value.toString());

            if (!Number.isInteger(order.oid) ||
                !Number.isInteger(order.uid)) {
                console.error("Invalid order event:", order);
                return;
            }

            const shipment = await Shipment.findOneAndUpdate(
                { oid: order.oid },
                {
                    $setOnInsert: {
                        oid: order.oid,
                        uid: order.uid,
                        status: "PENDING"
                    }
                },
                {
                    upsert: true,
                    new: true
                }
            );

            console.log(
                "Shipment processed for order:",
                shipment.oid,
                "Status:",
                shipment.status
            );
        }
    });
}

startConsumer().catch(async (error) => {
    console.error("Shipment Consumer error:", error);
    await consumer.disconnect().catch(() => { });
    await mongoose.disconnect().catch(() => { });
    process.exit(1);
});

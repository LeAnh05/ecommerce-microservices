require("dotenv").config();

const { Kafka } = require("kafkajs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const kafka = new Kafka({
    clientId: "customer-service",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const consumer = kafka.consumer({
    groupId: "customer-service-group",
});

async function startKafkaConsumer() {
    await consumer.connect();

    await consumer.subscribe({
        topic: "user-registered",
        fromBeginning: true,
    });

    console.log("Customer Service connected to Kafka");

    await consumer.run({
        eachMessage: async ({ message }) => {
            const user = JSON.parse(message.value.toString());

            await prisma.customer.upsert({
                where: { uid: user.uid },
                update: {
                    fullname: user.fullname,
                },
                create: {
                    uid: user.uid,
                    fullname: user.fullname,
                    mid: 1,
                    score: 0,
                },
            });

            console.log("Customer created/updated:", user.uid);
        },
    });
}

module.exports = { startKafkaConsumer };
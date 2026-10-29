
require("dotenv").config();

const { Kafka } = require("kafkajs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const kafka = new Kafka({
    clientId: "order-service",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(",")
});

const producer = kafka.producer();

async function publishPendingEvents() {
    const events = await prisma.outboxEvent.findMany({
        where: {
            published: false
        },
        orderBy: {
            id: "asc"
        }
    });

    for (const event of events) {
        await producer.send({
            topic: "order-created",
            messages: [
                {
                    key: String(event.aggregateId),
                    value: JSON.stringify(event.payload)
                }
            ]
        });

        await prisma.outboxEvent.update({
            where: {
                id: event.id
            },
            data: {
                published: true,
                publishedAt: new Date()
            }
        });

        console.log(
            "Published OrderCreated event for order:",
            event.aggregateId
        );
    }
}

async function startPublisher() {
    try {
        await prisma.$connect();
        await producer.connect();

        console.log("Outbox Publisher connected to PostgreSQL and Kafka");
        console.log("Checking pending events every 5 seconds");

        while (true) {
            try {
                await publishPendingEvents();
            } catch (error) {
                console.error("Publishing error:", error);
            }

            await new Promise((resolve) => setTimeout(resolve, 5000));
        }
    } catch (error) {
        console.error("Outbox Publisher error:", error);
        process.exitCode = 1;
    } finally {
        await producer.disconnect();
        await prisma.$disconnect();
    }
}

startPublisher();

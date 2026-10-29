const { Kafka } = require("kafkajs");

const kafka = new Kafka({
    clientId: "auth-service",
    brokers: (process.env.KAFKA_BROKERS || "localhost:9092").split(","),
});

const producer = kafka.producer();

async function connectKafka() {
    await producer.connect();
    console.log("Auth Service connected to Kafka");
}

async function publishUserRegistered(user) {
    await producer.send({
        topic: "user-registered",
        messages: [
            {
                key: String(user.uid),
                value: JSON.stringify({
                    uid: user.uid,
                    username: user.username,
                    fullname: user.fullname,
                }),
            },
        ],
    });

    console.log("Published user-registered event:", user.uid);
}

module.exports = {
    connectKafka,
    publishUserRegistered,
};
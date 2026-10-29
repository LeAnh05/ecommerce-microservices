require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { startKafkaConsumer } = require("./kafka");
const { startGrpcServer } = require("./grpc");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Kiem tra JWT
function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized - Token required",
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized - Invalid or expired token",
        });
    }
}

// Kiem tra Service
app.get("/health", (req, res) => {
    res.json({
        service: "customer-service",
        status: "OK",
    });
});

// Lay thong tin Customer
app.get("/api/customers/:uid", verifyToken, async (req, res) => {
    try {
        const uid = Number(req.params.uid);

        if (!Number.isInteger(uid) || uid <= 0) {
            return res.status(400).json({ message: "Invalid UID" });
        }

        if (Number(req.user.uid) !== uid) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const customer = await prisma.customer.findUnique({
            where: { uid },
            include: { membership: true },
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
            });
        }

        res.json({
            uid: customer.uid,
            fullname: customer.fullname,
            score: customer.score,
            mid: customer.mid,
            membership: customer.membership.mname,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Lay diem va Membership
app.get("/api/customers/:uid/membership", verifyToken, async (req, res) => {
    try {
        const uid = Number(req.params.uid);

        if (!Number.isInteger(uid) || uid <= 0) {
            return res.status(400).json({ message: "Invalid UID" });
        }

        if (Number(req.user.uid) !== uid) {
            return res.status(403).json({ message: "Forbidden" });
        }

        const customer = await prisma.customer.findUnique({
            where: { uid },
            include: { membership: true },
        });

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found",
            });
        }

        res.json({
            uid: customer.uid,
            score: customer.score,
            mid: customer.mid,
            membership: customer.membership.mname,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal server error" });
    }
});

// Khoi dong Customer Service
async function startServer() {
    try {
        await prisma.$connect();
        console.log("Customer Service connected to PostgreSQL");

        await startKafkaConsumer();

        // Khoi dong gRPC
        startGrpcServer();

        const PORT = process.env.PORT || 3002;

        app.listen(PORT, () => {
            console.log("Customer Service running on port " + PORT);
        });
    } catch (error) {
        console.error("Failed to start Customer Service:", error);
        process.exit(1);
    }
}

startServer();
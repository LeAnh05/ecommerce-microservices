require("dotenv").config();

const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const { connectKafka, publishUserRegistered } = require("./kafka");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "OK",
        service: "auth-service",
    });
});

// Register
app.post("/api/auth/register", async (req, res) => {
    try {
        const { username, fullname, password } = req.body;

        if (
            typeof username !== "string" ||
            !username.trim() ||
            typeof fullname !== "string" ||
            !fullname.trim() ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Username, fullname and password are required",
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { username },
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                fullname,
                password: hashedPassword,
                roleid: 1,
            },
        });

        await publishUserRegistered(user);

        res.status(201).json({
            message: "Register successful",
            user: {
                uid: user.uid,
                username: user.username,
                fullname: user.fullname,
                roleid: user.roleid,
            },
        });
    } catch (error) {
        console.error(error);

        if (error.code === "P2002") {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

// Login
app.post("/api/auth/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (
            typeof username !== "string" ||
            !username ||
            typeof password !== "string" ||
            !password
        ) {
            return res.status(400).json({
                message: "Username and password are required",
            });
        }

        const user = await prisma.user.findUnique({
            where: { username },
            include: { role: true },
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const validPassword = await bcrypt.compare(
            password,
            user.password
        );

        if (!validPassword) {
            return res.status(401).json({
                message: "Invalid username or password",
            });
        }

        const token = jwt.sign(
            {
                uid: user.uid,
                role: user.role.rolename,
            },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.status(200).json({
            message: "Login successful",
            token,
            user: {
                uid: user.uid,
                username: user.username,
                fullname: user.fullname,
                role: user.role.rolename,
            },
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: "Internal server error",
        });
    }
});

const PORT = process.env.PORT || 3001;

async function startServer() {
    try {
        await connectKafka();

        app.listen(PORT, () => {
            console.log(`Auth Service is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start Auth Service:", error);
        process.exit(1);
    }
}

startServer();
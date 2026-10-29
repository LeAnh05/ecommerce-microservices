
require("dotenv").config();

const express = require("express");
const { PrismaClient } = require("@prisma/client");

const verifyToken = require("./middleware/auth.middleware");
const { validateOrderItems } = require("./domain/validateOrder");
const { discountPercent } = require("./domain/discountPolicy");
const { computeTotals } = require("./domain/money");
const {
    getMembershipScore,
    getProduct,
    updateStock
} = require("./grpc-helper");

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        service: "order-service",
        status: "OK"
    });
});

// Kiem tra JWT
app.get("/api/orders/test-auth", verifyToken, (req, res) => {
    res.status(200).json({
        message: "JWT valid",
        uid: req.user.uid,
        role: req.user.role
    });
});

// Hoan tra ton kho khi co loi
async function rollbackStock(updatedItems) {
    for (const item of [...updatedItems].reverse()) {
        try {
            await updateStock(item.pid, -item.qty);
        } catch (error) {
            console.error("Stock rollback failed:", error);
        }
    }
}

// Tao don hang
app.post("/api/orders", verifyToken, async (req, res) => {
    const uid = req.user.uid;
    const items = req.body?.items;

    const validation = validateOrderItems(items);

    if (!validation.valid) {
        return res.status(400).json({
            message: validation.message
        });
    }

    try {
        // Lay diem Membership
        const membership = await getMembershipScore(uid);
        const percent = discountPercent(membership.score);

        const lines = [];

        // Lay thong tin san pham
        for (const item of items) {
            const product = await getProduct(item.pid);

            if (!product || product.pid !== item.pid) {
                return res.status(404).json({
                    message: "Product not found",
                    pid: item.pid
                });
            }

            if (product.quantity < item.qty) {
                return res.status(400).json({
                    message: "Insufficient stock",
                    pid: item.pid
                });
            }

            lines.push({
                pid: item.pid,
                qty: item.qty,
                unit_price: product.price
            });
        }

        // Tinh tong tien
        const totals = computeTotals(lines, percent);

        // Tru ton kho
        const updatedItems = [];

        for (const line of lines) {
            let result;

            try {
                result = await updateStock(line.pid, line.qty);
            } catch (error) {
                await rollbackStock(updatedItems);
                throw error;
            }

            if (!result.success) {
                await rollbackStock(updatedItems);

                return res.status(400).json({
                    message: "Insufficient stock",
                    pid: line.pid
                });
            }

            updatedItems.push(line);
        }

        try {
            // Luu Order, OrderDetail va OutboxEvent
            const order = await prisma.$transaction(async (tx) => {
                const createdOrder = await tx.order.create({
                    data: {
                        uid,
                        total: totals.gross,
                        discount: percent,
                        finalTotal: totals.total_amount,
                        status: "PENDING",
                        details: {
                            create: lines.map(line => ({
                                pid: line.pid,
                                qty: line.qty,
                                unit_price: line.unit_price
                            }))
                        }
                    },
                    include: {
                        details: true
                    }
                });

                // Luu su kien cho Kafka
                await tx.outboxEvent.create({
                    data: {
                        eventType: "OrderCreated",
                        aggregateId: createdOrder.oid,
                        payload: {
                            oid: createdOrder.oid,
                            uid: createdOrder.uid,
                            discount: percent,
                            total_amount: totals.total_amount,
                            items: lines
                        },
                        published: false
                    }
                });

                return createdOrder;
            });

            return res.status(201).json({
                message: "Order created successfully",
                oid: order.oid,
                uid: order.uid,
                discount: percent,
                gross: totals.gross,
                total_amount: totals.total_amount,
                status: order.status,
                items: lines
            });
        } catch (dbError) {
            await rollbackStock(updatedItems);
            throw dbError;
        }
    } catch (error) {
        console.error("Create order error:", error);

        return res.status(500).json({
            message: "Failed to create order"
        });
    }
});

// Ket noi PostgreSQL va khoi dong server
async function startServer() {
    try {
        await prisma.$connect();

        console.log("Order Service connected to PostgreSQL");

        const PORT = process.env.PORT || 3004;

        app.listen(PORT, () => {
            console.log("Order Service running on port " + PORT);
        });
    } catch (error) {
        console.error("Failed to start Order Service:", error);
        process.exit(1);
    }
}

startServer();

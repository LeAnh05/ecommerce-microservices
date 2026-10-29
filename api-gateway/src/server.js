
require("dotenv").config();

const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const verifyToken = require("./middleware/auth.middleware");

const app = express();

const PORT = process.env.PORT || 3000;

const services = [
    {
        path: "/api/auth",
        target: process.env.AUTH_SERVICE_URL,
        protected: false
    },
    {
        path: "/api/customers",
        target: process.env.CUSTOMER_SERVICE_URL,
        protected: true
    },
    {
        path: "/api/products",
        target: process.env.PRODUCT_SERVICE_URL,
        protected: false
    },
    {
        path: "/api/orders",
        target: process.env.ORDER_SERVICE_URL,
        protected: true
    },
    {
        path: "/api/shipments",
        target: process.env.SHIPMENT_SERVICE_URL,
        protected: true
    }
];

// Health Check
app.get("/health", (req, res) => {
    res.status(200).json({
        service: "api-gateway",
        status: "OK"
    });
});

// Cau hinh proxy cho tung service
for (const service of services) {
    if (!service.target) {
        throw new Error(`Missing target for ${service.path}`);
    }

    const matchPath = (pathname) =>
        pathname === service.path ||
        pathname.startsWith(service.path + "/");

    // Kiem tra JWT truoc khi chuyen request
    if (service.protected) {
        app.use((req, res, next) => {
            if (matchPath(req.path)) {
                return verifyToken(req, res, next);
            }

            next();
        });
    }

    // Chuyen request den service tuong ung
    app.use(
        createProxyMiddleware({
            pathFilter: matchPath,
            target: service.target,
            changeOrigin: true
        })
    );
}

// Route khong ton tai
app.use((req, res) => {
    res.status(404).json({
        message: "API route not found",
        path: req.originalUrl
    });
});

app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
});

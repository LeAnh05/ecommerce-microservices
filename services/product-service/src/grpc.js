require("dotenv").config();

const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const Product = require("./models/product.model");

const PROTO_PATH = path.join(
    __dirname,
    "../../../shared/proto/product.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const productProto = grpc.loadPackageDefinition(
    packageDefinition
).product;

// Lay thong tin mot san pham
async function getProduct(call, callback) {
    try {
        const pid = call.request.pid;

        const product = await Product.findOne({ pid });

        if (!product) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "Product not found",
            });
        }

        callback(null, {
            pid: product.pid,
            pname: product.pname,
            price: product.price,
            quantity: product.quantity,
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
}

// Lay danh sach san pham
async function listProducts(call, callback) {
    try {
        const products = await Product.find().sort({ pid: 1 });

        callback(null, {
            products: products.map((product) => ({
                pid: product.pid,
                pname: product.pname,
                price: product.price,
                quantity: product.quantity,
            })),
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
}

// Tru so luong ton kho
async function updateStock(call, callback) {
    try {
        const { pid, qty } = call.request;

        if (!Number.isInteger(qty) || qty <= 0) {
            return callback({
                code: grpc.status.INVALID_ARGUMENT,
                message: "Quantity must be greater than 0",
            });
        }

        const product = await Product.findOneAndUpdate(
            { pid, quantity: { $gte: qty } },
            { $inc: { quantity: -qty } },
            { new: true }
        );

        if (!product) {
            return callback(null, {
                success: false,
                message: "Product not found or insufficient stock",
            });
        }

        callback(null, {
            success: true,
            message: "Stock updated successfully",
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
}

// Khoi dong gRPC Server
function startGrpcServer() {
    const server = new grpc.Server();

    server.addService(productProto.ProductService.service, {
        GetProduct: getProduct,
        ListProducts: listProducts,
        UpdateStock: updateStock,
    });

    const GRPC_PORT = process.env.GRPC_PORT || 50053;

    server.bindAsync(
        "0.0.0.0:" + GRPC_PORT,
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error("Product gRPC error:", error);
                return;
            }

            console.log(
                "Product gRPC Server running on port " + port
            );
        }
    );
}

module.exports = { startGrpcServer };
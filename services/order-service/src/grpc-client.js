require("dotenv").config();

const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

function loadProto(filename, packageName) {
    const protoPath = path.join(
        __dirname,
        "../../../shared/proto",
        filename
    );

    const packageDefinition = protoLoader.loadSync(protoPath, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
    });

    return grpc.loadPackageDefinition(
        packageDefinition
    )[packageName];
}

// Customer Service gRPC
const customerProto = loadProto(
    "customer.proto",
    "customer"
);

const customerClient = new customerProto.CustomerService(
    process.env.CUSTOMER_GRPC_URL || "localhost:50052",
    grpc.credentials.createInsecure()
);

// Product Service gRPC
const productProto = loadProto(
    "product.proto",
    "product"
);

const productClient = new productProto.ProductService(
    process.env.PRODUCT_GRPC_URL || "localhost:50053",
    grpc.credentials.createInsecure()
);

module.exports = {
    customerClient,
    productClient,
};
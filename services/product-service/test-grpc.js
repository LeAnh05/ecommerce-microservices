const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(
    __dirname,
    "../../shared/proto/product.proto"
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

const client = new productProto.ProductService(
    "localhost:50053",
    grpc.credentials.createInsecure()
);

// Kiem tra so luong ton kho truoc khi cap nhat
client.GetProduct({ pid: 1 }, (error, before) => {
    if (error) {
        console.error("GetProduct Error:", error.message);
        client.close();
        return;
    }

    console.log("Before UpdateStock:", before);

    // Tru 2 san pham
    client.UpdateStock({ pid: 1, qty: 2 }, (error, result) => {
        if (error) {
            console.error("UpdateStock Error:", error.message);
            client.close();
            return;
        }

        console.log("UpdateStock result:", result);

        // Kiem tra lai so luong ton kho
        client.GetProduct({ pid: 1 }, (error, after) => {
            if (error) {
                console.error("GetProduct Error:", error.message);
            } else {
                console.log("After UpdateStock:", after);
            }

            client.close();
        });
    });
});
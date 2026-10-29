const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = path.join(
    __dirname,
    "../../shared/proto/customer.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

const client = new customerProto.CustomerService(
    "localhost:50052",
    grpc.credentials.createInsecure()
);

// Kiem tra GetCustomer
client.GetCustomer({ uid: 3 }, (error, response) => {
    if (error) {
        console.error("GetCustomer Error:", error.message);
    } else {
        console.log("GetCustomer result:", response);
    }

    // Kiem tra GetMembershipScore
    client.GetMembershipScore({ uid: 3 }, (error, response) => {
        if (error) {
            console.error("GetMembershipScore Error:", error.message);
        } else {
            console.log("GetMembershipScore result:", response);
        }

        client.close();
    });
});
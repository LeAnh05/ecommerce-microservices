require("dotenv").config();

const path = require("path");
const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const PROTO_PATH = path.join(
    __dirname,
    "../../../shared/proto/customer.proto"
);

const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

const customerProto = grpc.loadPackageDefinition(packageDefinition).customer;

// Lay thong tin Customer
async function getCustomer(call, callback) {
    try {
        const uid = call.request.uid;

        const customer = await prisma.customer.findUnique({
            where: { uid },
        });

        if (!customer) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "Customer not found",
            });
        }

        callback(null, {
            uid: customer.uid,
            fullname: customer.fullname,
            mid: customer.mid,
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
}

// Lay diem va Membership
async function getMembershipScore(call, callback) {
    try {
        const uid = call.request.uid;

        const customer = await prisma.customer.findUnique({
            where: { uid },
            include: { membership: true },
        });

        if (!customer) {
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "Customer not found",
            });
        }

        callback(null, {
            score: customer.score,
            mid: customer.mid,
            membership_name: customer.membership.mname,
        });
    } catch (error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        });
    }
}

function startGrpcServer() {
    const server = new grpc.Server();

    server.addService(customerProto.CustomerService.service, {
        GetCustomer: getCustomer,
        GetMembershipScore: getMembershipScore,
    });

    server.bindAsync(
        "0.0.0.0:50052",
        grpc.ServerCredentials.createInsecure(),
        (error, port) => {
            if (error) {
                console.error("Customer gRPC error:", error);
                return;
            }

            console.log("Customer gRPC Server running on port " + port);
        }
    );
}

module.exports = { startGrpcServer };
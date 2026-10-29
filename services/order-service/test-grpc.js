const {
    customerClient,
    productClient,
} = require("./src/grpc-client");

// Kiem tra lay diem Membership cua khach hang
customerClient.GetMembershipScore(
    { uid: 3 },
    (error, response) => {
        if (error) {
            console.error("Customer gRPC error:", error.message);
        } else {
            console.log("===== CUSTOMER MEMBERSHIP =====");
            console.log(response);
        }
    }
);

// Kiem tra lay thong tin san pham
productClient.GetProduct(
    { pid: 1 },
    (error, response) => {
        if (error) {
            console.error("Product gRPC error:", error.message);
        } else {
            console.log("===== PRODUCT INFORMATION =====");
            console.log(response);
        }
    }
);
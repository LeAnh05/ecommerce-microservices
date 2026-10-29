
const { customerClient, productClient } = require("./grpc-client");

// Chuyen loi goi gRPC callback sang Promise
function callGrpc(client, method, data) {
    return new Promise((resolve, reject) => {
        client[method](data, (error, response) => {
            if (error) {
                return reject(error);
            }

            resolve(response);
        });
    });
}

// Lay diem Membership cua khach hang
async function getMembershipScore(uid) {
    return await callGrpc(
        customerClient,
        "GetMembershipScore",
        { uid }
    );
}

// Lay thong tin san pham
async function getProduct(pid) {
    return await callGrpc(
        productClient,
        "GetProduct",
        { pid }
    );
}

// Cap nhat so luong ton kho
async function updateStock(pid, qty) {
    return await callGrpc(
        productClient,
        "UpdateStock",
        { pid, qty }
    );
}

module.exports = {
    getMembershipScore,
    getProduct,
    updateStock
};

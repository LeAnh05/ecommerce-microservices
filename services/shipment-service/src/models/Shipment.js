
const mongoose = require("mongoose");

const shipmentSchema = new mongoose.Schema(
    {
        oid: {
            type: Number,
            required: true,
            unique: true
        },

        uid: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: ["PENDING", "SHIPPING", "DELIVERED", "CANCELLED"],
            default: "PENDING"
        },

        createdAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        collection: "shipments"
    }
);

module.exports = mongoose.model("Shipment", shipmentSchema);

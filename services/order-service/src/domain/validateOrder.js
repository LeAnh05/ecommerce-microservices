
function validateOrderItems(items) {
    if (!Array.isArray(items) || items.length === 0) {
        return {
            valid: false,
            message: "Order must contain at least one product"
        };
    }

    const productIds = new Set();

    for (const item of items) {
        if (
            !item ||
            !Number.isInteger(item.pid) ||
            item.pid <= 0
        ) {
            return {
                valid: false,
                message: "Invalid product ID"
            };
        }

        if (
            !Number.isInteger(item.qty) ||
            item.qty <= 0
        ) {
            return {
                valid: false,
                message: "Product quantity must be a positive integer"
            };
        }

        if (productIds.has(item.pid)) {
            return {
                valid: false,
                message: "Duplicate product ID in order"
            };
        }

        productIds.add(item.pid);
    }

    return {
        valid: true,
        message: "Valid order items"
    };
}

module.exports = { validateOrderItems };

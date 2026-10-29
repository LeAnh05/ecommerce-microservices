
const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Access token required"
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (!Number.isInteger(decoded.uid)) {
            return res.status(401).json({
                message: "Invalid token"
            });
        }

        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            message: "Invalid or expired token"
        });
    }
}

module.exports = verifyToken;

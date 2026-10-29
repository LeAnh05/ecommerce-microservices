const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            message: "Unauthorized: Token is required",
        });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized: Token is required",
        });
    }

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET,
            { algorithms: ["HS256"] }
        );

        if (!Number.isInteger(decoded.uid) || decoded.uid <= 0) {
            return res.status(401).json({
                message: "Unauthorized: Invalid token",
            });
        }

        req.user = {
            uid: decoded.uid,
            role: decoded.role,
        };

        next();
    } catch (error) {
        return res.status(401).json({
            message: "Unauthorized: Invalid or expired token",
        });
    }
}

module.exports = verifyToken;
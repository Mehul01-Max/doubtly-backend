const jwt = require("jsonwebtoken");

const userMiddleware = (req, res, next) => {
    try {
        const headers = req.headers['authorization'];
        const token = headers.split(' ')[1];
        if (!token) {
            res.status(401).json({
                message: "Authentication token required"
            }) 
        }
        const verify = jwt.verify(token, process.env.JWT_SECRET);
        if (!verify) {
            res.status(401).json({
                message: "Invalid Authentication token"
            })
        }
        req.userId = verify.userId;
        next();
    }
    catch(e) {
        if (e.name === "TokenExpiredError") {
            return res.status(401).json({
                message: "token expired"
            })
        }
        else if (e.name === "JsonWebTokenError") {
            return res.status(401).json({
                message: "invalid authentication token"
            })
        }
        console.error("auth middleware error: ", e);
        res.status(500).json({
            message: "authentication error"
        })
    }
}

module.exports = { userMiddleware }
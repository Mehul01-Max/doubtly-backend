const jwt = require("jsonwebtoken");
const userMiddleware = (req, res, next) => {
  try {
    const headers = req.headers["authorization"];
    const refreshToken = req.cookies.refreshToken;
    const token = headers.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Authentication token required",
      });
    }
    const verify = jwt.verify(token, process.env.JWT_SECRET);
    if (!verify) {
      return res.status(401).json({
        message: "Invalid Authentication token",
      });
    }
    const refreshVerify = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
    if (!refreshVerify) {
      return res.status(400).json({
        message: "Invalid Refresh token",
      });
    }
    req.userId = verify.userId;
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "token expired",
      });
    } else if (e.name === "JsonWebTokenError") {
      console.log(e);
      return res.status(401).json({
        message: "invalid authentication token",
      });
    }
    console.error("auth middleware error: ", e);
    return res.status(500).json({
      message: "authentication error",
    });
  }
};

module.exports = { userMiddleware };

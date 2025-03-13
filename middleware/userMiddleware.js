const jwt = require("jsonwebtoken");

const userMiddleware = async (req, res, next) => {
  try {
    const headers = req.headers["authorization"];
    if (!headers) {
      return res.status(401).json({
        message: "Authorization header required",
      });
    }

    const token = headers.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        message: "Authentication token required",
      });
    }

    try {
      const verify = jwt.verify(token, process.env.JWT_SECRET);
      req.userId = verify.userId;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
          return res.status(401).json({
            message: "Access token expired and no refresh token available",
          });
        }

        try {
          const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);
          const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "1m" }
          );

          // Set the new token in response header
          res.setHeader("New-Access-Token", newAccessToken);

          req.userId = decoded.userId;
          next();
        } catch (refreshError) {
          return res.status(401).json({
            message: "Refresh token invalid or expired, please login again",
          });
        }
      } else {
        return res.status(401).json({
          message: "Invalid authentication token",
        });
      }
    }
  } catch (e) {
    console.error("auth middleware error: ", e);
    return res.status(500).json({
      message: "Authentication error",
    });
  }
};

module.exports = { userMiddleware };

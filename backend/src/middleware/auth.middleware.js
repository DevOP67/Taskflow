const { verifyToken } = require("../utils/jwt");
const { errorResponse } = require("../utils/response");
const prisma = require("../config/database");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(res, "Access denied. No token provided.", 401);
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    // Fetch fresh user from DB to ensure account still active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true, role: true },
    });

    if (!user) return errorResponse(res, "User not found or token invalid.", 401);

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return errorResponse(res, "Token expired. Please log in again.", 401);
    }
    return errorResponse(res, "Invalid token.", 401);
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return errorResponse(res, "Forbidden. You do not have permission to perform this action.", 403);
    }
    next();
  };
};

module.exports = { authenticate, authorize };

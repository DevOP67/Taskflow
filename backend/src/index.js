require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const logger = require("./utils/logger");

const authRoutes = require("./routes/auth.routes");
const taskRoutes = require("./routes/task.routes");
const userRoutes = require("./routes/user.routes");

const app = express();

// ─── Security Middleware ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || "*", credentials: true }));

// ─── Rate Limiting ─────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { success: false, message: "Too many requests, please try again later." },
});
app.use("/api/", limiter);

// ─── General Middleware ────────────────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined", { stream: { write: (msg) => logger.info(msg.trim()) } }));

// ─── API Docs ──────────────────────────────────────────────────
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));

// ─── Health Check ──────────────────────────────────────────────
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// ─── API v1 Routes ─────────────────────────────────────────────
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/tasks", taskRoutes);
app.use("/api/v1/users", userRoutes);

// ─── 404 Handler ──────────────────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method}`);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`🚀 TaskFlow API running on http://localhost:${PORT}`);
  logger.info(`📚 Swagger docs at http://localhost:${PORT}/api/docs`);
});

module.exports = app;

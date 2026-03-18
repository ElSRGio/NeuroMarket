/**
 * Express Application Factory
 */
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const investmentRoutes = require("./routes/investment.routes");
const reportsRoutes = require("./routes/reports.routes");
const municipiosRoutes = require("./routes/municipios.routes");
const path = require("path");

const app = express();

function getAllowedOrigins() {
  const envOrigins = process.env.FRONTEND_URLS || process.env.FRONTEND_URL || "";
  const parsed = envOrigins
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);

  if (parsed.length > 0) return parsed;
  return [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://neuromarket-web-portal.onrender.com",
  ];
}

const allowedOrigins = getAllowedOrigins();

// Security & parsing
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);
app.use(express.json({ limit: "10mb" }));

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "neuromarket-api", version: "2.0" });
});

// Routes
// Start uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use("/api/v2/auth", authRoutes);
app.use("/api/v2/admin", adminRoutes);
app.use("/api/v2/investment", investmentRoutes);
app.use("/api/v2/municipios", municipiosRoutes);
app.use("/api/v2/reports", reportsRoutes);

// 404
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[ERROR]", err.message);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

module.exports = app;

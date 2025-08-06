// backend/server.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import your YouTube routes
const youtubeRoutes = require("./routes/youtube");

// Middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like curl/postman) or local testing
      if (
        !origin ||
        origin.includes("localhost") ||
        origin.includes("127.0.0.1")
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Add logging middleware
app.use((req, res, next) => {
  console.log(
    `${new Date().toISOString()} - ${req.method} ${req.path}${
      req.query && Object.keys(req.query).length
        ? " - Query: " + JSON.stringify(req.query)
        : ""
    }`
  );
  next();
});

// ===== API ROUTES =====
// Use your YouTube routes under /api prefix
app.use("/api", youtubeRoutes);

// Test endpoint
app.get("/api/test", (req, res) => {
  console.log("Test endpoint hit");
  res.json({
    message: "API is working!",
    timestamp: new Date().toISOString(),
    availableRoutes: [
      "GET /api/health",
      "GET /api/test",
      "GET /api/audios?playlistId=...",
      "GET /api/videos?playlistId=...",
    ],
  });
});

// ===== STATIC FILES AND HTML ROUTES =====
// Serve static files from frontend folder
app.use(express.static(path.join(__dirname, "../frontend")));

// HTML routes
app.get("/", (req, res) => {
  console.log("Serving index.html");
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/audios", (req, res) => {
  console.log("Serving audios.html");
  res.sendFile(path.join(__dirname, "../frontend/audios.html"));
});

app.get("/videos", (req, res) => {
  console.log("Serving vids.html");
  res.sendFile(path.join(__dirname, "../frontend/vids.html"));
});

// ===== ERROR HANDLING =====
// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({
    error: "Internal Server Error",
    details: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// 404 handler - MUST BE LAST
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.path}`);
  res.status(404).json({
    error: "Route not found",
    path: req.path,
    method: req.method,
    availableRoutes: [
      "GET /api/health",
      "GET /api/test",
      "GET /api/audios?playlistId=...",
      "GET /api/videos?playlistId=...",
      "GET /",
      "GET /audios",
      "GET /videos",
    ],
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Access your site at: http://localhost:${PORT}`);
  console.log(`📺 Audio page at: http://localhost:${PORT}/audios`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(
    `🎵 Test audios API: http://localhost:${PORT}/api/audios?playlistId=PLEPUNw4tYLWXESnlHMz1nbqAtvHU75yim`
  );
  console.log(
    `🎥 Test videos API: http://localhost:${PORT}/api/videos?playlistId=PLEPUNw4tYLWXESnlHMz1nbqAtvHU75yim`
  );

  console.log("\n📋 Available routes:");
  console.log("   GET /api/health");
  console.log("   GET /api/test");
  console.log("   GET /api/audios?playlistId=...");
  console.log("   GET /api/videos?playlistId=...");
  console.log("   GET /");
  console.log("   GET /audios");
  console.log("   GET /videos");
});

module.exports = app;

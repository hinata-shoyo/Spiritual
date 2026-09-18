// backend/index.js
const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from frontend directory with caching
app.use(express.static(path.join(__dirname, "../frontend"), {
  maxAge: '7d',
  etag: true,
  lastModified: true,
  setHeaders: function (res, filePath) {
    // HTML should always be revalidated so deploys are picked up immediately
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    }
    // Code assets get a short cache; bump the ?v= query on change to bust it
    else if (/\.(css|js)$/.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=3600, must-revalidate');
    }
  }
}));

// Import routes
const youtubeRoutes = require("./routes/youtube");
const photosRoutes = require("./routes/photos");
const archiveRoutes = require("./routes/archive");

// Use routes
app.use("/api", youtubeRoutes);
app.use("/api/photos", photosRoutes);
app.use("/api/archive", archiveRoutes);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({ message: "Backend is working!" });
});

// Serve HTML files
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

app.get("/audios", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/audios.html"));
});

app.get("/videos", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/vids.html"));
});

app.get("/gallery", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/gallery.html"));
});

app.get("/books", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/books.html"));
});

app.get("/events", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/events.html"));
});

// Catch-all route for SPA
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Access your site at: http://localhost:${PORT}`);
  console.log(`📺 Audio page at: http://localhost:${PORT}/audios`);
  console.log(`🔍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Test endpoint: http://localhost:${PORT}/api/test`);
  console.log(`📷 Photos API: http://localhost:${PORT}/api/photos`);

  console.log(`📋 Available routes:`);
  console.log(`   GET /api/health`);
  console.log(`   GET /api/test`);
  console.log(`   GET /api/audios?playlistId=...`);
  console.log(`   GET /api/videos?playlistId=...`);
  console.log(`   GET /api/photos`);
  console.log(`   GET /`);
  console.log(`   GET /audios`);
  console.log(`   GET /videos`);
  console.log(`   GET /gallery`);
});

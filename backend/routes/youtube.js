// backend/routes/youtube.js
const express = require("express");
const axios = require("axios");
require("dotenv").config();

const router = express.Router();

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Validation middleware
const validatePlaylistRequest = (req, res, next) => {
  const { playlistId } = req.query;

  if (!playlistId) {
    return res.status(400).json({
      error: "Missing playlistId parameter",
      example: "?playlistId=PLEPUNw4tYLWXESnlHMz1nbqAtvHU75yim",
    });
  }

  if (!YOUTUBE_API_KEY) {
    console.error("YouTube API key is not configured");
    return res.status(500).json({
      error: "Server configuration error: YouTube API key missing",
    });
  }

  next();
};

// Videos endpoint
router.get("/videos", validatePlaylistRequest, async (req, res) => {
  const { playlistId, pageToken = "", maxResults = 6 } = req.query;

  console.log(
    `Fetching videos for playlist: ${playlistId}, pageToken: ${pageToken}, maxResults: ${maxResults}`
  );

  const url = `https://www.googleapis.com/youtube/v3/playlistItems`;
  const params = {
    part: "snippet",
    playlistId: playlistId,
    maxResults: parseInt(maxResults),
    key: YOUTUBE_API_KEY,
    ...(pageToken && { pageToken }),
  };

  try {
    const response = await axios.get(url, { params });

    if (!response.data || !response.data.items) {
      throw new Error("Invalid response from YouTube API");
    }

    console.log(`Successfully fetched ${response.data.items.length} videos`);
    res.json(response.data);
  } catch (error) {
    console.error("YouTube API error (videos):", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 403) {
      res.status(403).json({
        error: "YouTube API quota exceeded or invalid API key",
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        error: "Playlist not found",
      });
    } else {
      res.status(500).json({
        error: "Failed to fetch videos",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
});

// Audios endpoint (FIXED: changed from /audio to /audios to match frontend)
router.get("/audios", validatePlaylistRequest, async (req, res) => {
  const { playlistId, pageToken = "" } = req.query;

  console.log(
    `Fetching audios for playlist: ${playlistId}, pageToken: ${pageToken}`
  );

  const url = `https://www.googleapis.com/youtube/v3/playlistItems`;
  const params = {
    part: "snippet",
    playlistId: playlistId,
    maxResults: MAX_RESULTS,
    key: YOUTUBE_API_KEY,
    ...(pageToken && { pageToken }),
  };

  try {
    const response = await axios.get(url, { params });

    if (!response.data || !response.data.items) {
      throw new Error("Invalid response from YouTube API");
    }

    console.log(`Successfully fetched ${response.data.items.length} audios`);
    res.json(response.data);
  } catch (error) {
    console.error("YouTube API error (audios):", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });

    if (error.response?.status === 403) {
      res.status(403).json({
        error: "YouTube API quota exceeded or invalid API key",
      });
    } else if (error.response?.status === 404) {
      res.status(404).json({
        error: "Playlist not found",
      });
    } else {
      res.status(500).json({
        error: "Failed to fetch audios",
        details:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!YOUTUBE_API_KEY,
    routes: ["/videos", "/audios", "/health"],
  });
});

module.exports = router;

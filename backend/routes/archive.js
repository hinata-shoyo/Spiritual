const express = require("express");
const axios = require("axios");
const router = express.Router();

// Internet Archive API base URL
const IA_API_BASE = "https://archive.org/metadata";

// Swarn Dev Ji collection identifier
const COLLECTION_ID = "swarndevji";

/**
 * Get all audio files from the Swarn Dev Ji collection
 */
router.get("/audios", async (req, res) => {
  try {
    console.log("Fetching audio files from Internet Archive...");

    // Fetch metadata for the collection
    const metadataUrl = `${IA_API_BASE}/${COLLECTION_ID}`;
    const response = await axios.get(metadataUrl);

    if (!response.data || !response.data.files) {
      throw new Error("No files found in the collection");
    }

    // Filter for audio files and transform the data
    const audioFiles = response.data.files
      .filter((file) => {
        // Filter for audio files (mp3, ogg, etc.)
        const isAudio = /\.(mp3|ogg|wav|m4a|flac)$/i.test(file.name);
        // Exclude very small files (likely not actual audio)
        const hasReasonableSize = file.size && file.size > 100000; // > 100KB
        return isAudio && hasReasonableSize;
      })
      .map((file) => {
        // Extract date from filename if possible
        const dateMatch = file.name.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
        let date = null;
        if (dateMatch) {
          const [, day, month, year] = dateMatch;
          date = new Date(year, month - 1, day);
        }

        // Create a clean title from filename
        let title = file.name
          .replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "") // Remove extension
          .replace(/^\d+-/, "") // Remove leading numbers and dash
          .replace(/_/g, " ") // Replace underscores with spaces
          .replace(/([A-Z])/g, " $1") // Add space before capital letters
          .trim();

        // If title is too long, truncate it
        if (title.length > 60) {
          title = title.substring(0, 60) + "...";
        }

        return {
          id: file.name,
          title: title || "Spiritual Discourse",
          description: `Duration: ${Math.round(file.length || 0)} seconds`,
          url: `https://archive.org/download/${COLLECTION_ID}/${encodeURIComponent(
            file.name
          )}`,
          thumbnail: `https://archive.org/services/img/${COLLECTION_ID}`,
          duration: file.length || 0,
          size: file.size || 0,
          format: file.format || "mp3",
          date: date,
          dateString: date
            ? date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : null,
          creator: "Swarn Dev Ji",
          collection: "Spiritual Discourses",
        };
      })
      .sort((a, b) => {
        // Sort by date if available, otherwise by filename
        if (a.date && b.date) {
          return b.date - a.date; // Newest first
        }
        return a.title.localeCompare(b.title);
      });

    console.log(`Found ${audioFiles.length} audio files`);

    res.json({
      success: true,
      totalCount: audioFiles.length,
      audios: audioFiles,
      collection: {
        id: COLLECTION_ID,
        title: "Swarn Dev Ji Parvachans",
        description:
          "Spiritual discourses and sermons by Guru Swarn Dev Ji of Karnal",
        url: `https://archive.org/details/${COLLECTION_ID}`,
      },
    });
  } catch (error) {
    console.error("Error fetching audio files from Internet Archive:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audio files",
      details: error.message,
    });
  }
});

/**
 * Get a specific audio file by ID
 */
router.get("/audios/:audioId", async (req, res) => {
  try {
    const { audioId } = req.params;

    // Fetch metadata for the collection
    const metadataUrl = `${IA_API_BASE}/${COLLECTION_ID}`;
    const response = await axios.get(metadataUrl);

    if (!response.data || !response.data.files) {
      throw new Error("No files found in the collection");
    }

    // Find the specific audio file
    const audioFile = response.data.files.find((file) => file.name === audioId);

    if (!audioFile) {
      return res.status(404).json({
        success: false,
        error: "Audio file not found",
      });
    }

    // Transform the data similar to the list endpoint
    const dateMatch = audioFile.name.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    let date = null;
    if (dateMatch) {
      const [, day, month, year] = dateMatch;
      date = new Date(year, month - 1, day);
    }

    let title = audioFile.name
      .replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "")
      .replace(/^\d+-/, "")
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim();

    const audio = {
      id: audioFile.name,
      title: title || "Spiritual Discourse",
      description: `Duration: ${Math.round(audioFile.length || 0)} seconds`,
      url: `https://archive.org/download/${COLLECTION_ID}/${encodeURIComponent(
        audioFile.name
      )}`,
      thumbnail: `https://archive.org/services/img/${COLLECTION_ID}`,
      duration: audioFile.length || 0,
      size: audioFile.size || 0,
      format: audioFile.format || "mp3",
      date: date,
      dateString: date
        ? date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })
        : null,
      creator: "Swarn Dev Ji",
      collection: "Spiritual Discourses",
    };

    res.json({
      success: true,
      audio: audio,
    });
  } catch (error) {
    console.error("Error fetching audio file from Internet Archive:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audio file",
      details: error.message,
    });
  }
});

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Internet Archive API is working",
    collection: COLLECTION_ID,
    endpoints: [
      "GET /api/archive/audios - Get all audio files",
      "GET /api/archive/audios/:id - Get specific audio file",
      "GET /api/archive/health - Health check",
    ],
  });
});

module.exports = router;

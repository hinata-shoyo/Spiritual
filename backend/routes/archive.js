const express = require("express");
const axios = require("axios");
const router = express.Router();

// Internet Archive API base URL
const IA_API_BASE = process.env.IA_API_BASE || "https://archive.org/metadata";

// Swarn Dev Ji collection identifier
const COLLECTION_ID = "swarndevji";

// Public Google Drive copies used as a fallback when Internet Archive is down.
// The manifest was extracted from:
//   https://drive.google.com/drive/folders/1bfvLV58hnxdnvg39ydbSZVOWL3zK4m5m
//   https://drive.google.com/drive/folders/1v-ttTuwMR8EtjGnX-1lomLi3_fspMY97
const DRIVE_FALLBACK_FILES = require("../drive-fallback.json");
const DRIVE_URL_PREFIX = "https://drive.usercontent.google.com/download?id=";

// Simple in-memory cache
let cache = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

// Format a duration in seconds as M:SS (or H:MM:SS for long recordings)
function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.round(Number(totalSeconds) || 0));
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n) => String(n).padStart(2, "0");
  return hrs > 0
    ? `${hrs}:${pad(mins)}:${pad(secs)}`
    : `${mins}:${pad(secs)}`;
}

// Derive a title and a date from a file name (shared by both sources)
function buildAudioRecord(fileName) {
  const dateMatch = fileName.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  let date = null;
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    date = new Date(year, month - 1, day);
  }

  let title = fileName
    .replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "")
    .replace(/^\d+-/, "")
    .replace(/_/g, " ")
    .replace(/([A-Z])/g, " $1")
    .trim();

  if (title.length > 60) {
    title = title.substring(0, 60) + "...";
  }

  return {
    id: fileName,
    title: title || "Spiritual Discourse",
    date: date,
    dateString: date
      ? date.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : null,
  };
}

// Newest discourses first, then alphabetical
function sortByDateDesc(a, b) {
  if (a.date && b.date) {
    return b.date - a.date;
  }
  return a.title.localeCompare(b.title);
}

async function fetchFromInternetArchive() {
  const metadataUrl = `${IA_API_BASE}/${COLLECTION_ID}`;
  const response = await axios.get(metadataUrl, { timeout: 5000 });

  if (!response.data || !response.data.files) {
    throw new Error("No files found in the collection");
  }

  const audioFiles = response.data.files
    .filter((file) => {
      const isAudio = /\.(mp3|ogg|wav|m4a|flac)$/i.test(file.name);
      const hasReasonableSize = file.size && file.size > 100000;
      return isAudio && hasReasonableSize;
    })
    .map((file) => {
      const record = buildAudioRecord(file.name);
      return {
        ...record,
        description: `Duration: ${formatDuration(file.length)}`,
        url: `https://archive.org/download/${COLLECTION_ID}/${encodeURIComponent(
          file.name
        )}`,
        thumbnail: `https://archive.org/services/img/${COLLECTION_ID}`,
        duration: file.length || 0,
        size: file.size || 0,
        format: file.format || "mp3",
        creator: "Swarn Dev Ji",
        collection: "Spiritual Discourses",
      };
    })
    .sort(sortByDateDesc);

  return {
    success: true,
    source: "internet-archive",
    totalCount: audioFiles.length,
    audios: audioFiles,
    collection: {
      id: COLLECTION_ID,
      title: "Swarn Dev Ji Parvachans",
      description:
        "Spiritual discourses and sermons by Guru Swarn Dev Ji of Karnal",
      url: `https://archive.org/details/${COLLECTION_ID}`,
    },
  };
}

// Fallback: serve the public Google Drive copies when Internet Archive is down
function fetchFromDriveFallback() {
  const audioFiles = DRIVE_FALLBACK_FILES.map((file) => {
    const record = buildAudioRecord(file.name);
    return {
      ...record,
      url: `${DRIVE_URL_PREFIX}${file.fileId}&export=view`,
      thumbnail: null,
      duration: 0,
      size: 0,
      format: String(file.name.split(".").pop()).toLowerCase() || "mp3",
      creator: "Swarn Dev Ji",
      collection: "Spiritual Discourses",
    };
  }).sort(sortByDateDesc);

  return {
    success: true,
    source: "google-drive",
    totalCount: audioFiles.length,
    audios: audioFiles,
    collection: {
      id: COLLECTION_ID,
      title: "Swarn Dev Ji Parvachans",
      description:
        "Spiritual discourses and sermons by Guru Swarn Dev Ji of Karnal (Google Drive fallback)",
      url: "https://drive.google.com/drive/folders/1bfvLV58hnxdnvg39ydbSZVOWL3zK4m5m",
    },
  };
}

async function fetchAndProcessAudios() {
  const now = Date.now();
  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return cache;
  }

  let result;
  try {
    result = await fetchFromInternetArchive();
  } catch (error) {
    console.error(
      "Internet Archive unreachable, falling back to Google Drive:",
      error.message
    );
    result = fetchFromDriveFallback();
  }

  cache = result;
  cacheTimestamp = now;
  return result;
}

/**
 * Get all audio files from the Swarn Dev Ji collection,
 * with a Google Drive fallback when Internet Archive is unreachable.
 */
router.get("/audios", async (req, res) => {
  try {
    const data = await fetchAndProcessAudios();
    res.json(data);
  } catch (error) {
    console.error("Unable to load audio archives:", error.message);
    res.status(503).json({
      success: false,
      error: "Audio archives are unreachable",
      details:
        "Neither the Internet Archive nor the Google Drive fallback could be reached.",
    });
  }
});

/**
 * Get a specific audio file by ID
 */
router.get("/audios/:audioId", async (req, res) => {
  try {
    const { audioId } = req.params;
    const data = await fetchAndProcessAudios();
    const audio = data.audios.find((a) => a.id === audioId);

    if (!audio) {
      return res.status(404).json({
        success: false,
        error: "Audio file not found",
      });
    }

    res.json({
      success: true,
      audio: audio,
    });
  } catch (error) {
    console.error("Unable to load audio archives:", error.message);
    res.status(503).json({
      success: false,
      error: "Audio archives are unreachable",
      details:
        "Neither the Internet Archive nor the Google Drive fallback could be reached.",
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
    fallback: {
      enabled: DRIVE_FALLBACK_FILES.length > 0,
      source: "Google Drive",
      files: DRIVE_FALLBACK_FILES.length,
    },
    endpoints: [
      "GET /api/archive/audios - Get all audio files",
      "GET /api/archive/audios/:id - Get specific audio file",
      "GET /api/archive/health - Health check",
    ],
  });
});

module.exports = router;
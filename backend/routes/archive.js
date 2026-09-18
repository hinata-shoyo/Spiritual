const express = require("express");
const router = express.Router();

// Public Google Drive folders containing the Swarn Dev Ji audio collection:
//   https://drive.google.com/drive/folders/1bfvLV58hnxdnvg39ydbSZVOWL3zK4m5m
//   https://drive.google.com/drive/folders/1v-ttTuwMR8EtjGnX-1lomLi3_fspMY97
const DRIVE_FILES = require("../drive-audios.json");
const DRIVE_URL_PREFIX = "https://drive.usercontent.google.com/download?id=";

// Simple in-memory cache
let cache = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cacheTimestamp = 0;

// Derive a title and a date from a file name
function buildAudioRecord(fileName) {
  const dateMatch = fileName.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
  let date = null;
  if (dateMatch) {
    const [, day, month, year] = dateMatch;
    date = new Date(year, month - 1, day);
  }

  let title = fileName
    .replace(/\.(mp3|ogg|wav|m4a|flac)$/i, "")
    .replace(/^(\d+)-/, "$1 - ")
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

function fetchFromGoogleDrive() {
  const audioFiles = DRIVE_FILES.map((file) => {
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
      id: "drive-pravachan",
      title: "Swarn Dev Ji Parvachans",
      description:
        "Spiritual discourses and sermons by Guru Swarn Dev Ji of Karnal",
      url: "https://drive.google.com/drive/folders/1bfvLV58hnxdnvg39ydbSZVOWL3zK4m5m",
    },
  };
}

function fetchAndProcessAudios() {
  const now = Date.now();
  if (cache && now - cacheTimestamp < CACHE_TTL) {
    return cache;
  }

  const result = fetchFromGoogleDrive();
  cache = result;
  cacheTimestamp = now;
  return result;
}

/**
 * Get all audio files from the Google Drive folders
 */
router.get("/audios", (req, res) => {
  res.json(fetchAndProcessAudios());
});

/**
 * Get a specific audio file by ID
 */
router.get("/audios/:audioId", (req, res) => {
  const { audioId } = req.params;
  const data = fetchAndProcessAudios();
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
});

/**
 * Health check endpoint
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Google Drive audio API is working",
    source: "Google Drive",
    files: DRIVE_FILES.length,
    endpoints: [
      "GET /api/archive/audios - Get all audio files",
      "GET /api/archive/audios/:id - Get specific audio file",
      "GET /api/archive/health - Health check",
    ],
  });
});

module.exports = router;
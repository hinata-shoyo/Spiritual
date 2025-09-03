const express = require("express");
const axios = require("axios");
const router = express.Router();

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

// Validate Cloudinary configuration
const validateCloudinaryConfig = (req, res, next) => {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return res.status(500).json({
      error:
        "Cloudinary configuration missing. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in your .env file.",
    });
  }
  next();
};

// Get photos from Cloudinary
router.get("/photos", validateCloudinaryConfig, async (req, res) => {
  try {
    const { maxResults = 20, nextCursor } = req.query;

    // Build Cloudinary API URL
    const baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image`;
    const params = new URLSearchParams({
      max_results: maxResults,
      type: "upload",
      // prefix: "guruji-gallery/", // Commented out to look in root folder
    });

    if (nextCursor) {
      params.append("next_cursor", nextCursor);
    }

    // Make request to Cloudinary
    const response = await axios.get(`${baseUrl}?${params}`, {
      auth: {
        username: CLOUDINARY_API_KEY,
        password: CLOUDINARY_API_SECRET,
      },
    });

    // Transform Cloudinary response to our format
    const photos = response.data.resources.map((resource) => ({
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail: resource.secure_url.replace(
        "/upload/",
        "/upload/c_thumb,w_300,h_300,g_face/"
      ),
      title: resource.public_id
        .split("/")
        .pop()
        .replace(/_/g, " ")
        .replace(/\.[^/.]+$/, ""),
      description:
        resource.context?.caption || "Spiritual moment captured in time",
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
    }));

    res.json({
      photos,
      nextCursor: response.data.next_cursor,
      totalCount: response.data.resources.length,
    });
  } catch (error) {
    console.error("Error fetching photos from Cloudinary:", error);
    res.status(500).json({
      error: "Failed to fetch photos from Cloudinary",
      details: error.message,
    });
  }
});

// Get a single photo by ID
router.get("/photos/:photoId", validateCloudinaryConfig, async (req, res) => {
  try {
    const { photoId } = req.params;

    // Build Cloudinary API URL for single resource
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/${photoId}`;

    const response = await axios.get(url, {
      auth: {
        username: CLOUDINARY_API_KEY,
        password: CLOUDINARY_API_SECRET,
      },
    });

    const resource = response.data;
    const photo = {
      id: resource.public_id,
      url: resource.secure_url,
      thumbnail: resource.secure_url.replace(
        "/upload/",
        "/upload/c_thumb,w_300,h_300,g_face/"
      ),
      title: resource.public_id
        .split("/")
        .pop()
        .replace(/_/g, " ")
        .replace(/\.[^/.]+$/, ""),
      description:
        resource.context?.caption || "Spiritual moment captured in time",
      width: resource.width,
      height: resource.height,
      format: resource.format,
      created_at: resource.created_at,
    };

    res.json(photo);
  } catch (error) {
    console.error("Error fetching photo from Cloudinary:", error);
    res.status(500).json({
      error: "Failed to fetch photo from Cloudinary",
      details: error.message,
    });
  }
});

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "Photos API",
    cloudinary: {
      configured: !!(
        CLOUDINARY_CLOUD_NAME &&
        CLOUDINARY_API_KEY &&
        CLOUDINARY_API_SECRET
      ),
      cloudName: CLOUDINARY_CLOUD_NAME ? "Configured" : "Missing",
    },
  });
});

module.exports = router;

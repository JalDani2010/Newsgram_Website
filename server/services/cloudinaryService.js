const cloudinary = require("cloudinary").v2
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Configure multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "newsapp",
    allowed_formats: ["jpg", "jpeg", "png", "gif", "webp"],
    transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }],
  },
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
})

class CloudinaryService {
  // Upload single image
  uploadSingle(fieldName) {
    return upload.single(fieldName)
  }

  // Upload multiple images
  uploadMultiple(fieldName, maxCount = 2) {
    return upload.array(fieldName, maxCount)
  }

  // Delete image by public_id
  async deleteImage(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId)
      return result
    } catch (error) {
      console.error("Cloudinary delete error:", error)
      throw error
    }
  }

  // Upload image from URL
  async uploadFromUrl(imageUrl, options = {}) {
    try {
      const result = await cloudinary.uploader.upload(imageUrl, {
        folder: "newsapp",
        ...options,
      })
      return result
    } catch (error) {
      console.error("Cloudinary upload from URL error:", error)
      throw error
    }
  }

  // Generate optimized URL
  generateUrl(publicId, options = {}) {
    return cloudinary.url(publicId, {
      quality: "auto",
      fetch_format: "auto",
      ...options,
    })
  }

  // Generate thumbnail URL
  generateThumbnail(publicId, width = 300, height = 200) {
    return cloudinary.url(publicId, {
      width,
      height,
      crop: "fill",
      quality: "auto",
      fetch_format: "auto",
    })
  }
}

module.exports = new CloudinaryService()

const { BlobServiceClient } = require("@azure/storage-blob");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

// Set up Azure Blob Storage client
const blobServiceClient = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING);
const containerClient = blobServiceClient.getContainerClient("media"); // Replace 'media' with your container name

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store file in memory

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        if (ext !== ".jpg" && ext !== ".jpeg" && ext !== ".png" && ext !== ".mp4") {
            return cb(new Error("Only .jpg, .jpeg, .png, and .mp4 files are allowed"), false);
        }
        cb(null, true);
    }
});

// Function to upload file to Azure Blob Storage
const uploadToBlob = async (file) => {
    const blobName = `${Date.now()}-${file.originalname}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);
    
    const uploadBlobResponse = await blockBlobClient.upload(file.buffer, file.buffer.length);
    console.log(`Upload block blob ${blobName} successfully`, uploadBlobResponse.requestId);
    
    return blockBlobClient.url; // Return the URL of the uploaded media
};

module.exports = { upload, uploadToBlob };

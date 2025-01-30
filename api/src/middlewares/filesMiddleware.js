import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// To resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /\.(jpeg|jpg|png|gif|pdf|doc|docx|pptx)$/i;
  if (allowedExtensions.test(file.originalname)) {
    cb(null, true);
  } else {
    cb(new Error("File type not supported"));
  }
};

// Define the destination folder
const UPLOADS_FOLDER = path.join(__dirname, "../uploads");

// Ensure the uploads folder exists, or create it
if (!fs.existsSync(UPLOADS_FOLDER)) {
  fs.mkdirSync(UPLOADS_FOLDER, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOADS_FOLDER); // Save files to the uploads folder
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname); // Generate a unique filename
  },
});

const upload = multer({ storage, fileFilter });

// Function to delete old files
const deleteOldFiles = () => {
  const expiryTime = 60 * 60 * 1000; // 1 hour (in milliseconds)
  fs.readdir(UPLOADS_FOLDER, (err, files) => {
    if (err) return console.error("Error reading uploads folder:", err);

    files.forEach((file) => {
      const filePath = path.join(UPLOADS_FOLDER, file);
      fs.stat(filePath, (err, stats) => {
        if (err) return console.error("Error getting file stats:", err);

        if (Date.now() - stats.mtimeMs > expiryTime) {
          fs.unlink(filePath, (err) => {
            if (err) console.error("Error deleting file:", err);
            else console.log(`Deleted old file: ${file}`);
          });
        }
      });
    });
  });
};

// Run file cleanup every 10 minutes
setInterval(deleteOldFiles, 10 * 60 * 1000);

export default upload;

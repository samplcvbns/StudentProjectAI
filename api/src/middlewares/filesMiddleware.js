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
const UPLOADS_FOLDER = path.join(__dirname, '../uploads');

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
    cb(null, Date.now() + '-' + file.originalname); // Generate a unique filename
  },
});

 const upload = multer({ storage, fileFilter });
 
 export default upload

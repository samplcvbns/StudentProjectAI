import { Client, Storage } from "node-appwrite";
import File from "../models/fileModel.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// To resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_WRITE_PROJECT_ID = process.env.APP_WRITE_PROJECT_ID;
const APP_WRITE_API_KEY = process.env.APP_WRITE_API_KEY;
const APP_WRITE_ENDPOINT = process.env.APP_WRITE_ENDPOINT;
const APP_WRITE_BUCKET_ID = process.env.APP_WRITE_BUCKET_ID;
console.log(
  APP_WRITE_PROJECT_ID,
  APP_WRITE_API_KEY,
  APP_WRITE_ENDPOINT,
  APP_WRITE_BUCKET_ID
);

// Initialize Appwrite Client
const client = new Client()
  .setEndpoint(APP_WRITE_ENDPOINT) // Replace with your Appwrite endpoint
  .setProject(APP_WRITE_PROJECT_ID) // Replace with your project ID
  .setKey(APP_WRITE_API_KEY); // Replace with your API key

const storage = new Storage(client);

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    console.log("File received:", file);

    // Use fs.createReadStream for the file path
    const fileStream = fs.createReadStream(file.path);

    // Upload file to Appwrite storage
    const uploadedFile = await storage.createFile(
      APP_WRITE_BUCKET_ID, // Replace with your storage bucket ID
      "unique()", // Unique ID for the file
      fileStream, // Stream the file
      file.originalname // Set original file name (optional)
    );

    console.log("Uploaded file details:", uploadedFile);

    // Generate a public URL for the uploaded file
    const fileUrl = `${APP_WRITE_ENDPOINT}/storage/buckets/${uploadFile.APP_WRITE_BUCKET_ID}/files/${uploadedFile.$id}/view?project=${APP_WRITE_PROJECT_ID}`;

    // Save file details in MongoDB
    const newFile = new File({
      filename: file.originalname,
      url: fileUrl,
    });

    await newFile.save();

    // Send response
    res.status(200).send({
      message: "File uploaded successfully",
      fileUrl: fileUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send({ message: error });
  }
};

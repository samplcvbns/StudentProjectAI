import { createClient } from "@supabase/supabase-js";
import File from "../models/fileModel.js";
import fs from "fs";
import dotenv from "dotenv";
import crypto from "crypto";
import path from "path";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;
const ENCRYPTION_SECRET = process.env.FILE_ENCRYPTION_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);
const algorithm = "aes-256-cbc";
const key = crypto.scryptSync(ENCRYPTION_SECRET, "salt", 32);

// Function to Encrypt File
function encryptFile(buffer) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
  return { encryptedData: encrypted, iv };
}

// Function to Decrypt File
function decryptFile(encryptedBuffer, iv) {
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(iv, "hex")
  );
  const decrypted = Buffer.concat([
    decipher.update(encryptedBuffer),
    decipher.final(),
  ]);
  return decrypted;
}

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    const user_id = req.user.id;

    if (!file) return res.status(400).send({ message: "No file uploaded" });
    if (!user_id)
      return res.status(400).send({ message: "User ID is required" });

    // Read file as binary buffer
    const fileBuffer = fs.readFileSync(file.path);

    // Encrypt file before upload
    const { encryptedData, iv } = encryptFile(fileBuffer);

    // Change file extension to .enc.pdf
    const encryptedFilename = `${file.originalname}.enc.pdf`;

    // Upload encrypted file to Supabase
    const { data, error } = await supabase.storage
      .from("student-project-ai")
      .upload(`pdf/${encryptedFilename}`, encryptedData, {
        contentType: "application/pdf", // Keep as PDF
        cacheControl: "3600",
        upsert: true,
      });

    if (error) throw new Error(error.message);

    // Generate a signed public URL
    const { data: publicUrl, error: urlError } = supabase.storage
      .from("student-project-ai")
      .getPublicUrl(`pdf/${encryptedFilename}`);

    if (urlError) throw new Error(urlError.message);

    // Save file metadata in MongoDB
    const newFile = new File({
      filename: encryptedFilename,
      url: publicUrl.publicUrl,
      user_id,
      iv: iv.toString("hex"), // Store IV for later decryption
    });
    await newFile.save();

    res.status(200).send({
      message: "File uploaded and encrypted successfully",
      fileUrl: publicUrl.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send({ message: error.message });
  }
};


export const downloadFile = async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    // Fetch file metadata from MongoDB using ID
    const fileRecord = await File.findOne({ _id: id, user_id });
    if (!fileRecord) return res.status(404).send({ message: "File not found" });

    const filename = fileRecord.filename;

    // Get file from Supabase
    const { data, error } = await supabase.storage
      .from("student-project-ai")
      .download(`pdf/${filename}`);

    if (error) {
      console.error("Supabase download error:", error);
      throw new Error(error.message);
    }

    if (!data) {
      throw new Error("No data received from Supabase");
    }

    // Convert ReadableStream to Buffer
    const arrayBuffer = await data.arrayBuffer();
    if (!arrayBuffer)
      throw new Error("Failed to convert file data to ArrayBuffer");

    const encryptedBuffer = Buffer.from(arrayBuffer);

    // Ensure IV exists
    if (!fileRecord.iv) {
      throw new Error("IV is missing from file metadata in MongoDB");
    }

    // Decrypt file
    const decryptedBuffer = decryptFile(encryptedBuffer, fileRecord.iv);

    // Get the current directory path using import.meta.url and fix the path
    const currentDir = path.dirname(new URL(import.meta.url).pathname); // Get current directory of the file
    const srcDir = path.resolve(currentDir, ".."); // Navigate to the parent directory (src folder)

    // Fix the path to avoid the extra "C:\" at the beginning
    const downloadDir = path.join(srcDir, "downloads"); // Downloads folder inside src

    // Ensure the downloads directory exists
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true }); // Create the directory if it doesn't exist
    }

    // Define output file path
    const outputPath = path.join(downloadDir, filename.replace(".enc", ""));

    // Save decrypted buffer as a PDF file
    fs.writeFileSync(outputPath, decryptedBuffer);

    console.log(`File saved at: ${outputPath}`);

    // Send decrypted file as response
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${filename.replace(".enc", "")}`
    );
    res.setHeader("Content-Type", "application/pdf");
    res.send(decryptedBuffer);
  } catch (error) {
    console.error("Error downloading file:", error);
    res.status(500).send({ message: error.message });
  }
};



//GET ALL FILES OF A USER
export const getUserFiles = async (req, res) => {
  try {
    const user_id = req.user.id; // Extract user ID from token

    if (!user_id) {
      return res.status(400).send({ message: "User ID is required" });
    }

    // Fetch files uploaded by the authenticated user
    const userFiles = await File.find({ user_id });

    res.status(200).json({ files: userFiles });
  } catch (error) {
    console.error("Error fetching user files:", error);
    res.status(500).send({ message: error.message });
  }
};

//GET JUST ONE FILE OF A USER
export const getUserFile = async (req, res) => {
  try {
    const user_id = req.user.id; // Extract user ID from token
    const { fileId } = req.params; // Get file ID from request params

    if (!fileId) {
      return res.status(400).send({ message: "File ID is required" });
    }

    // Fetch the file that belongs to the authenticated user
    const file = await File.findOne({ _id: fileId, user_id });

    if (!file) {
      return res.status(404).send({ message: "File not found" });
    }

    res.status(200).json({ file });
  } catch (error) {
    console.error("Error fetching file:", error);
    res.status(500).send({ message: error.message });
  }
};

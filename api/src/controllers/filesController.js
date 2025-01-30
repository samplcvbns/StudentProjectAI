import { createClient } from "@supabase/supabase-js";
import File from "../models/fileModel.js";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_API_KEY = process.env.SUPABASE_API_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_API_KEY);

export const uploadFile = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).send({ message: "No file uploaded" });
    }

    // Read file as binary buffer
    const fileBuffer = fs.readFileSync(file.path);
    
    // Upload to Supabase storage bucket
    const { data, error } = await supabase.storage
      .from("student-project-ai")
      .upload(`pdf/${file.originalname}`, fileBuffer, {
        contentType: "application/pdf",
        cacheControl: "3600",
        upsert: true,
        contentEncoding: "identity",
      });

    if (error) {
      console.error("Upload error:", error.message);
      throw new Error(error.message);
    }

    // Generate a signed public URL
    const { data: publicUrl, error: urlError } = supabase.storage
      .from("student-project-ai")
      .getPublicUrl(`pdf/${file.originalname}`);

    if (urlError) {
      console.error("Error generating public URL:", urlError.message);
      throw new Error(urlError.message);
    }

    // Save file details in MongoDB
    const newFile = new File({
      filename: file.originalname,
      url: publicUrl.publicUrl,
    });
    await newFile.save();

    res.status(200).send({
      message: "File uploaded successfully",
      fileUrl: publicUrl.publicUrl,
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).send({ message: error.message });
  }
};

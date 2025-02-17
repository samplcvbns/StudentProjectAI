import express from "express";
import axios from "axios";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import authRoute from "./routes/authRoute.js";
import filesRoute from "./routes/filesRoute.js";
import User from "./models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const nodemonConfigPath = path.resolve("nodemon.json");
const nodemonConfig = JSON.parse(fs.readFileSync(nodemonConfigPath, "utf-8"));

const app = express();
const PORT = 5000;
const AI_SERVICE_URL = process.env.AI_SERVICE_URL;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const connection = mongoose.connect(process.env.MONGODB_URI);

connection.then(() => {
  console.log("MongoDB Connected");
});

connection.catch((err) => {
  console.log(err);
});

app.use("/api/auth", authRoute);
app.use("/api/files", filesRoute);

app.get("/", async (req, res) => {
  try {
    const aiResponse = await axios.get(`${AI_SERVICE_URL}/ai`);
    res.json({ message: "Hello from Node AI!", aiResponse: aiResponse.data });
  } catch (error) {
    res.status(500).json({ error: "Failed to connect to AI service" });
  }
});

app.listen(PORT, () => {
  console.log(`Node API is running on http://localhost:${PORT}`);
});

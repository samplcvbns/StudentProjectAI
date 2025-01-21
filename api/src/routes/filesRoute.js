import express from "express";
import {uploadFile } from "../controllers/filesController.js";
import upload from "../middlewares/filesMiddleware.js";

const router = express.Router();

router.post("/upload-file", upload.single("file"), uploadFile);

export default router;
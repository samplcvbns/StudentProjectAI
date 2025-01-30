import express from "express";
import { getUserFile, getUserFiles, uploadFile, downloadFile } from "../controllers/filesController.js";
import upload from "../middlewares/filesMiddleware.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/upload-file", verifyToken, upload.single("file"), uploadFile);
router.get("/my-files", verifyToken, getUserFiles);
router.get("/my-files/:fileId", verifyToken, getUserFile);
router.get("/download-file/:id", verifyToken, downloadFile);
export default router;

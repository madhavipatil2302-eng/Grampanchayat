
import OllamaSetup from "../Ollama/Ollama.js";
import OllamaComplint, { AnalyzeComplaintFile } from "../Ollama/OllamaComplint.js";
import { TrackComplint } from "../Controllers/ComplintController.js";
import express from "express";
import complaintUpload from "../Uploadfile/complaintUpload.js";

const router = express.Router();

router.post("/user-ai", OllamaSetup);
router.post("/complint-file-ai", complaintUpload.single("file"), AnalyzeComplaintFile);
router.post("/complint-ai", complaintUpload.array("files", 5), OllamaComplint);

router.post("/track-complint", TrackComplint);

export default router;

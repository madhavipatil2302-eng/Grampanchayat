
import OllamaSetup from "../Ollama/Ollama.js";
import express from "express";

const router = express.Router();

router.post("/user-ai", OllamaSetup);

export default router;
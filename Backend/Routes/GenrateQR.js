import {GetQRCode} from "../Controllers/GenrateQRCode.js";
import express from "express";

const router= express.Router();

router.post("/grampanchayat/generate-qr",GetQRCode);

export default router;
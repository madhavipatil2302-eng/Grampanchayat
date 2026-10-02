import express from "express";
import { GetAllNotificationComplints } from "../Controllers/Notificationcontroller.js";


const router = express.Router();

router.get("/get-all-notification-complints", GetAllNotificationComplints);

export default router;
import express from "express";
import { GetAllRoleManagement, RateOfComplint } from "../Controllers/homecontroller.js";

const router = express.Router();

router.get("/get-all-role-managements", GetAllRoleManagement);
router.get("/complaint-rates", RateOfComplint);

export default router;


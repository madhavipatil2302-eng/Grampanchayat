import express from "express";
import { AdminLogin, AdminLoginPage, CheckIpAccess, EmailVirify, ForGatePassword } from "../Controllers/logincontroller.js";
import { GetProfile, UpdateProfile } from "../Controllers/profilecontroller.js";
import { roleManagement } from "../Controllers/roleManagement.js";
import { VerifyToken } from "../Middleware/auth.js";
import upload from "../Uploadfile/fileupload.js";
import { Ratelimiting } from "../Controllers/Ratelimiting.js";
const router = express.Router();

router.get("/admin/login", AdminLoginPage);
router.get("/ip-access", CheckIpAccess);
router.post("/admin/verify-email",Ratelimiting, EmailVirify);
router.post("/forget-password", ForGatePassword);
router.post("/admin/login",Ratelimiting, AdminLogin);
router.get("/admin/profile", VerifyToken, GetProfile);
router.patch("/admin/profile", VerifyToken, UpdateProfile);
router.post(
  "/admin/manage-role",
  VerifyToken,
  upload.fields([
    { name: "profilePhoto", maxCount: 1 },
    { name: "signature", maxCount: 1 },
  ]),
  roleManagement
);

// Old route kept for testing/backward compatibility.
router.post("/login/emailverify", EmailVirify);

export default router;

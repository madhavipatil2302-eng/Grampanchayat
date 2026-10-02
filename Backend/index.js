import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import homeRouter from "./Routes/homerout.js";
import loginRouter from "./Routes/loginroute.js";
import moduleDataRouter from "./Routes/moduleDataRoute.js";
import noticeBoardRouter from "./Routes/noticeBoardRoute.js";
import permissionRouter from "./Routes/permissionroute.js";
import ollamaRouter from "./Routes/Ollama.js";
import notificationRouter from "./Routes/notification.js";
import emergencyRouter from "./Routes/EmergencyRoute.js";
import propertyTaxRouter from "./Routes/propertyTaxRoute.js";
import  GennerateQRRouter  from "./Routes/GenrateQR.js";
import http from "http";
import { initializeSocket } from "./Controllers/Soketio.js";
import { BlockedIp } from "./Middleware/blockedIp.js";
export const app = express();

app.set("view engine", "ejs");

const PORT = process.env.PORT || 8000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("views", path.join(__dirname, "view"));
app.set("trust proxy", true);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Expose-Headers", "X-QR-Record-Id, X-QR-UPI-ID");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  return next();
});
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend server is running.",
  });
});

app.use("/api", BlockedIp);
app.use("/api", loginRouter);
app.use("/api", homeRouter);
app.use("/api", permissionRouter);
app.use("/api", moduleDataRouter);
app.use("/api", noticeBoardRouter);
app.use("/api", ollamaRouter);
app.use("/api", notificationRouter);
app.use("/api", emergencyRouter);
app.use("/api", propertyTaxRouter);
app.use("/api", GennerateQRRouter);

const server = http.createServer(app);
initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch((error) => {
    console.log("MongoDB connection error", error.message);
  });

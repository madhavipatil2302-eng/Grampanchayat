import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import multer from "multer";

const backendDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const uploadDirectory = path.join(backendDirectory, "public", "uploads");
const allowedDocumentTypes = new Set([
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        mkdir(uploadDirectory, { recursive: true })
            .then(() => callback(null, uploadDirectory))
            .catch(callback);
    },
    filename: (req, file, callback) => {
        callback(null, `${Date.now()}-${randomUUID()}${path.extname(file.originalname).toLowerCase()}`);
    },
});

const complaintUpload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, callback) => {
        if (file.mimetype.startsWith("image/") || allowedDocumentTypes.has(file.mimetype)) {
            return callback(null, true);
        }

        return callback(new Error("Only image, PDF, and Word files are allowed."));
    },
});

export default complaintUpload;
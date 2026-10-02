// // import multer from "multer";
// // import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // const uploadDir = path.join(__dirname, "..", "public", "uploads");

// // fs.mkdirSync(uploadDir, { recursive: true });


// // const storage = multer.diskStorage({

// //     destination: (req, file, cb) => {


// //         cb(null, uploadDir)

// //     },
// //     filename: (req, file, cb) => {

// //         const safeName = file.originalname.replace(/\s+/g, "-");
// //         const extension = path.extname(safeName);
// //         const baseName = path.basename(safeName, extension);

// //         cb(null, `${Date.now()}-${baseName}${extension}`)
// //     }


// // });

// // const Upload = multer({

// //     storage: storage,
// //     limits: {
// //         fileSize: 2 * 1024 * 1024
// //     },
// //     fileFilter: (req, file, cb) => {

// //         if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
// //             cb(null, true)
// //         }
// //         else {
// //             cb(new Error("Invalid file type"))
// //         }
// //     }
// // });

// // export default Upload;


// import { S3Client } from "@aws-sdk/client-s3";
// import dotenv from "dotenv";
// import multerS3 from "multer-s3";
// import multer from "multer";
// import fs from "fs";
// import path from "path";
// import { fileURLToPath } from "url";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const uploadDir = path.join(__dirname, "..", "public", "uploads");

// fs.mkdirSync(uploadDir, { recursive: true });

// const hasAwsConfig = Boolean(
//   process.env.AWS_BUCKET_NAME &&
//   process.env.AWS_REGION &&
//   process.env.AWS_ACCESS_KEY_ID &&
//   process.env.AWS_SECRET_ACCESS_KEY
// );

// const s3 = hasAwsConfig
//   ? new S3Client({
//       region: process.env.AWS_REGION,
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       },
//     })
//   : null;

// const localStorage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, uploadDir),
//   filename: (req, file, cb) => {
//     const safeName = file.originalname.replace(/\s+/g, "-");
//     const extension = path.extname(safeName);
//     const baseName = path.basename(safeName, extension);
//     cb(null, `${Date.now()}-${baseName}${extension}`);
//   },
// });

// export const s3Storage = multerS3({
//   s3,
//   bucket: process.env.AWS_BUCKET_NAME,
//   contentType: multerS3.AUTO_CONTENT_TYPE,
//   metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
//   key: (req, file, cb) => {
//     const safeName = file.originalname.replace(/\s+/g, "-");
//     cb(null, `${Date.now()}-${safeName}`);
//   },
// });

// const upload = multer({
//   storage: hasAwsConfig ? s3Storage : localStorage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedMimeTypes = [
//       "image/jpeg",
//       "image/png",
//       "image/jpg",
//       "image/webp",
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (allowedMimeTypes.includes(file.mimetype)) {
//       cb(null, true);
//       return;
//     }

//     cb(new Error("Only image, PDF, and Word files are allowed."));
//   },
// });

// export default upload;

// import { S3Client } from "@aws-sdk/client-s3";
// import multerS3 from "multer-s3";
// import multer from "multer";
// import fs from "fs";
// // import path from "path";
// // import { fileURLToPath } from "url";
// import dotenv from "dotenv";

// dotenv.config();

// // const __filename = fileURLToPath(import.meta.url);
// // const __dirname = path.dirname(__filename);
// // const uploadDir = path.join(__dirname, "..", "public", "uploads");

// // fs.mkdirSync(uploadDir, { recursive: true });

// // const hasAwsConfig = Boolean(
// //   process.env.AWS_BUCKET_NAME &&
// //   process.env.AWS_REGION &&
// //   process.env.AWS_ACCESS_KEY_ID &&
// //   process.env.AWS_SECRET_ACCESS_KEY
// // );

// const s3 =  new S3Client({
//       region: process.env.AWS_REGION,
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//       },
//     })
// // const localStorage = multer.diskStorage({
// //   destination: (req, file, cb) => cb(null, uploadDir),
// //   filename: (req, file, cb) => {
// //     const safeName = file.originalname.replace(/\s+/g, "-");
// //     const extension = path.extname(safeName);
// //     const baseName = path.basename(safeName, extension);
// //     cb(null, `${Date.now()}-${baseName}${extension}`);
// //   },
// // });

// const s3Storage = multerS3({
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
//   storage: s3Storage,
//   limits: { fileSize: 5 * 1024 * 1024 },
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/pdf",
//       "application/msword",
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//     ];

//     if (file.mimetype.startsWith("image/") || allowedTypes.includes(file.mimetype)) {
//       return cb(null, true);
//     }

//     return cb(new Error("Only image, PDF, and Word files are allowed."));
//   },
// });

// export default upload;


 import { S3Client } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

const s3= new S3Client({

  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },

})

export const storage = multerS3({
 s3,
 bucket:process.env.AWS_BUCKET_NAME,
 key:function(req,res,cb){

try{
  cb(null,Date.now().toString() + "-" + res.originalname);
 }
 catch(error)
 {

 return cb(console.log("Error in file upload",error),null);
 }

 }

});



const upload= multer({

  storage:storage,
  limits:{fileSize:5*1024*1024},
  fileFilter:(req,file,cb)=>{
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (file.mimetype.startsWith("image/") || allowedTypes.includes(file.mimetype)) {
      return cb(null, true);
    }

    return cb(new Error("Only image, PDF, and Word files are allowed."));
  },

});

export default upload;



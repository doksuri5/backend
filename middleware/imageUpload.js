import multer from "multer";
import multerS3 from "multer-s3";
import { v4 as uuid } from "uuid";
import mime from "mime-types";
import s3Client from "../aws.js";

const uploadProfileImg = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET_NAME,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      const extension = mime.extension(file.mimetype);
      cb(null, `profile/${uuid()}.${extension}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (["image/png", "image/jpeg", "image/jpg"].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only JPEG, PNG and JPG are allowed"), false);
    }
  },
  limits: {
    fileSize: 1024 * 1024 * 5, // 5MB
  },
});

export default uploadProfileImg;

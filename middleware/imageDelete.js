import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import s3Client from "../aws.js";

const deleteFileFromS3 = async (fileKey) => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(deleteParams));
    console.log("Delete Success", fileKey);
  } catch (err) {
    console.error("Error", err);
  }
};

export default deleteFileFromS3;

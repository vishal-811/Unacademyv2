import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

dotenv.config();

const Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    secretAccessKey: process.env.SECRET_KEY!,
    accessKeyId: process.env.ACCESS_KEY!,
  },
});

const bucket_name = process.env.BUCKET_NAME;

export async function UploadToS3(fileName: string) {
  fileName = fileName.split(".")[0];
  const folderPath = path.resolve(__dirname, "../../uploads/images");

  try {
    const files = await fs.promises.readdir(folderPath);

    for await (const file of files) {
      const imagePath = path.join(folderPath, file);

      const imgStream = fs.createReadStream(imagePath);

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket_name,
        Key: fileName + "/" + file,
        Body: imgStream,
        ContentType: "image/jpeg",
      });

      await Client.send(putObjectCommand);
    }
    console.log("All files uploaded to S3 successfully.");
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in uploading to s3:", error.message);
    }
  }
}

export async function GetPreSignedUrl(fileName: string) {
  fileName = fileName.split(".")[0];
  console.log("the file Name is", fileName);
  const command = new GetObjectCommand({
    Bucket: bucket_name,
    Key: fileName,
  });

  const preSignedUrl = await getSignedUrl(Client, command, {
    expiresIn: 3000,
  });
  return preSignedUrl;
}

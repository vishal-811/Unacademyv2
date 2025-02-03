import {
  S3Client,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import path from "path";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const Client = new S3Client({
  region: process.env.REGION,
  credentials: {
    secretAccessKey: process.env.SECRET_KEY!,
    accessKeyId: process.env.ACCESS_KEY!,
  },
});

const bucket_name = process.env.BUCKET_NAME;

export async function UploadToS3(RoomId: string) {
  const folderPath = path.resolve(__dirname, "../../uploads/images");
   
  const imgurl : string[] = [] ;
  try {
    const files = await fs.promises.readdir(folderPath);

    for await (const file of files) {
      const imagePath = path.join(folderPath, file);
      const imgId = file.split(".")[0];
      const imgStream = fs.createReadStream(imagePath);

      const putObjectCommand = new PutObjectCommand({
        Bucket: bucket_name,
        Key: RoomId + "/" + file,
        Body: imgStream,
        ContentType: "image/jpeg",
      });

      await Client.send(putObjectCommand);
      imgurl.push(imgId);
    }
    
    return imgurl;
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error in uploading to s3:", error.message);
    }
  }
}
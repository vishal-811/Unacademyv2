import {
    CompleteMultipartUploadCommand,
    CreateMultipartUploadCommand,
    S3Client,
    UploadPartCommand,
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
  const partSize = 5 * 1024 * 1024; 
  
  export async function UploadToS3(fileName: string) {
    fileName = fileName.split(".")[0];
    const folderPath = path.resolve(__dirname, "../../uploads/images");
  
    try {
      const files = await fs.promises.readdir(folderPath);
      console.log("Files found in the folder:", files);
  
      for await (const file of files) {
        const imagePath = path.join(folderPath, file);
        const stats = await fs.promises.stat(imagePath);
        const fileSize = stats.size;
  
        if (fileSize < partSize) {
          const imgStream = fs.createReadStream(imagePath);
  
          const putObjectCommand = new PutObjectCommand({
            Bucket: bucket_name,
            Key: fileName + "/" + file,
            Body: imgStream,
          });
  
          await Client.send(putObjectCommand);
          console.log(`Uploaded small file ${file} to S3.`);
        } else {
          const multiPartUploadcommand = new CreateMultipartUploadCommand({
            Bucket: bucket_name,
            Key: fileName + "/" + file,
          });
  
          const multiPartUploadStart = await Client.send(multiPartUploadcommand);
  
          let partNumber = 1;
          const parts: { ETag: string; PartNumber: number }[] = [];
  
          const imgStream = fs.createReadStream(imagePath, { highWaterMark: partSize });
  
          const uploadPartCommand = new UploadPartCommand({
            Bucket: bucket_name,
            Key: fileName + "/" + file,
            Body: imgStream,
            PartNumber: partNumber,
            UploadId: multiPartUploadStart.UploadId,
          });
  
          const uploadResponse = await Client.send(uploadPartCommand);
  
          if (uploadResponse.ETag) {
            parts.push({
              ETag: uploadResponse.ETag!,
              PartNumber: partNumber,
            });
          } else {
            console.error(`Failed to upload part ${partNumber} for file ${file}`);
            return;
          }
  
          const multiPartUploadDoneCommand = new CompleteMultipartUploadCommand({
            Bucket: bucket_name,
            Key: fileName + "/" + file,
            UploadId: multiPartUploadStart.UploadId,
            MultipartUpload: {
              Parts: parts,
            },
          });
  
          await Client.send(multiPartUploadDoneCommand);
          console.log(`Multipart upload completed for file ${file}.`);
        }
      }
  
      console.log("All files uploaded to S3 successfully.");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error in uploading to s3:", error.message);
      }
    }
  }
  

export async function GetPreSignedUrl (fileName : string){
    fileName = fileName.split(".")[0];
    console.log("the file Name is", fileName);
    const command = new GetObjectCommand({
        Bucket : bucket_name,
        Key : fileName
    })

    const preSignedUrl = await getSignedUrl(Client,command,{
        expiresIn : 3000
    })
    return preSignedUrl;
}
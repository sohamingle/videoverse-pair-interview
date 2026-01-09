// import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

// // ✅ Initialize S3 client
// const s3 = new S3Client({
//     forcePathStyle: true,
//     region: process.env.AWS_REGION!,
//     endpoint: process.env.AWS_S3_ENDPOINT!,
//     credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//     },
// });

// const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!;

// // ✅ Upload file buffer to S3
// export const uploadToS3 = async (fileBuffer: Buffer, key: string, contentType: string) => {
//     const command = new PutObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: key,
//         Body: fileBuffer,
//         ContentType: contentType,
//     });

//     await s3.send(command);

//     return key;
// };

// // ✅ Delete file from S3
// export const deleteFromS3 = async (key: string) => {
//     const command = new DeleteObjectCommand({
//         Bucket: BUCKET_NAME,
//         Key: key,
//     });
//     await s3.send(command);
//     return true;
// };

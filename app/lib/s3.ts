// import { S3Client } from "@aws-sdk/client-s3";

// const R2_API = process.env.R2_API;
// const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
// const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
// const BUCKET_NAME = process.env.R2_BUCKET_NAME;

// if (!R2_API || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
//     throw new Error("Missing environment variables for S3 client config.")
// }

// const S3 = new S3Client({
//     region: "auto",
//     endpoint: R2_API,
//     credentials: {
//         accessKeyId: ACCESS_KEY_ID,
//         secretAccessKey: SECRET_ACCESS_KEY,
//     },
//     // compatibility for R2
//     requestChecksumCalculation: "WHEN_REQUIRED",
//     responseChecksumValidation: "WHEN_REQUIRED",
// });

// export async function deleteImage(uploaderId: string, filename: string) {

// }
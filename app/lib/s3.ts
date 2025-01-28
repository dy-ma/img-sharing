"use server"

import { PutObjectCommand, S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_API = process.env.R2_API;
const ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const BUCKET_NAME = process.env.R2_BUCKET_NAME;

if (!R2_API || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET_NAME) {
    throw new Error("Missing environment variables for S3 client config.")
}

const S3 = new S3Client({
    region: "auto",
    endpoint: R2_API,
    credentials: {
        accessKeyId: ACCESS_KEY_ID,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
    // compatibility for R2
    requestChecksumCalculation: "WHEN_REQUIRED",
    responseChecksumValidation: "WHEN_REQUIRED",
});

export async function generatePresignedUrl(filename: string): Promise<string> {
    const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({ Bucket: BUCKET_NAME, Key: filename }),
        { expiresIn: 3600 }
    )

    return signedUrl;
}

export async function generatePresignedGetUrl(filename: string): Promise<string> {
    const signedUrl = await getSignedUrl(
        S3,
        new GetObjectCommand({Bucket: BUCKET_NAME, Key: filename}),
        { expiresIn: 3600 }
    )
    return signedUrl;
}

export async function deleteImageFromS3(filename: string): Promise<boolean> {
    const input = {
        Bucket: BUCKET_NAME, // Ensure the correct environment variable is used
        Key: filename,
    };

    try {
        const command = new DeleteObjectCommand(input);
        await S3.send(command);
        
        // Check if the delete was successful
        return true
    } catch (error) {
        console.error("Error deleting image from S3: ", error);
        return false;
    }
}
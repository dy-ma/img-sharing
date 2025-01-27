import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifySession } from "@/app/lib/dal";

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

function generateFilenameWithExtension(set_name: string, original: string): string {
    const extension = original.split('.').pop();
    const random = `${uuidv4()}`;
    return `${set_name}/${random}.${extension}`;
}

const PresignRequestSchema = z.object({
    setId: z.string(),
    setName: z.string(),
    files: z.array(
        z.object({
            originalName: z.string(),
            mimeType: z.string()
        })
    )
})

async function generatePresignedUrl(filename: string): Promise<string> {
    // Expires in 1 hour
    const signedUrl = await getSignedUrl(
        S3,
        new PutObjectCommand({ Bucket: BUCKET_NAME, Key: filename }),
        { expiresIn: 3600 }
    )

    return signedUrl;
}

export async function POST(req: NextRequest) {
    const session = await verifySession();

    try {
        // Parse and validate request body
        const body = await req.json();
        const parsedBody = PresignRequestSchema.parse(body);

        // Access validated fields
        const { setId, setName, files } = parsedBody;

        // TODO: Check if user has upload permissions

        const urls = await Promise.all(
            files.map(async (file) => {
                const filename = generateFilenameWithExtension(setName, file.originalName);
                const presignedUrl = await generatePresignedUrl(filename);

                return {
                    setId: setId,
                    originalName: file.originalName,
                    presignedUrl: presignedUrl,
                    filename: filename
                }
            })
        )

        return NextResponse.json({ urls });
    } catch (error) {
        if (error instanceof z.ZodError) {
            console.log(error.errors);
            return NextResponse.json(
                { error: "Invalid Request", details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        )
    }
}
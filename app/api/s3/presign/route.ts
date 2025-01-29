import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { verifySession } from "@/lib/dal";
import { generatePresignedUrl } from "@/lib/s3";

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

export async function POST(req: NextRequest) {
    const session = await verifySession();
    if (!session.isAuth) {
        return NextResponse.json({ error: "Unauthorized"}, { status: 401 })
    }

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
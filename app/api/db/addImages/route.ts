import { verifySession } from "@/app/lib/dal";
import { Image, addImagesToSet } from "@/app/lib/queries";
import { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const session = await verifySession();
        if (!session) {
            return new Response("Unauthorized", { status: 401 });
        }

        const response = await req.json();
        
        if (!Array.isArray(response) || response.length === 0) {
            return new Response("Invalid image array", { status: 400});
        }

        const images: Image[] = response.map((url: { setId: string, originalName: string, presignedUrl: string, filename: string }) => {
            return {
                set_id: url.setId,
                filename: url.filename, // Using the 'filename' property from the response
                uploader: session.userId, // Assuming 'session.userId' holds the user id
            };
        });

        await addImagesToSet(images); // Call the function to add images to the database
        return new Response("Images added successfully!", { status: 200 });
    } catch (error: any) {
        console.error("Error in POST handler:", error);
        return new Response(`Error: ${error.message || error}`, { status: 500 });
    }
}
"use server"

import { addImageToSet, Image } from "@/app/lib/queries";
import { NextRequest, NextResponse } from "next/server";
import { verifySession } from "@/app/lib/dal";

export async function POST(req: NextRequest) {
    const session = await verifySession();

    const { setId, fileName } = await req.json();

    if (!setId || !fileName) {
        return NextResponse.json(
            { error: "Set name or filename is missing." }, { status: 400 }
        );
    }

    if (!session.isAuth) {
        return NextResponse.json(
            { error: "User is not signed in." }, { status: 401 }
        )
    }

    const image: Image = {
        set_id: setId,
        filename: fileName,
        uploader: session.userId!
    }
    const id = await addImageToSet(image);
    if (id) {
        return NextResponse.json({ success: true, imageId: String(id) });
    } else {
        return NextResponse.json(
            { error: "An error occurred adding the image to the set." }, { status: 500 }
        );
    }
}
import { NextRequest, NextResponse } from "next/server";

// Get metadata of the image with id
export async function GET(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, {status: 200})
}
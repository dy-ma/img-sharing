import { NextRequest, NextResponse } from "next/server";

// Get an array of presigned urls
export async function POST(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 })
}
import { NextRequest, NextResponse } from "next/server";

// Create a record for an image
export async function POST(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 })
}
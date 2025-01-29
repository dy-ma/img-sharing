import { NextRequest, NextResponse } from "next/server";

// Create a new set
export async function POST(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 })
}


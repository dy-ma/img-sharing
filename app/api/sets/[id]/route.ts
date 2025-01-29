import { NextRequest, NextResponse } from "next/server";

// Get set metadata
export async function GET(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 })
}

// Delete a set
export async function DELETE(req: NextRequest): Promise<NextResponse> {
    return new NextResponse(null, { status: 200 })
}
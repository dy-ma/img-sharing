"use server"

import { NextResponse } from "next/server";
import { generateAvailableSetName } from "@/app/lib/queries";

export async function GET() {
  const name = await generateAvailableSetName();
  if (name) {
    return NextResponse.json({ name });
  } else {
    return NextResponse.json({ error: "Failed to generate name. "}, { status: 500 });
  }
}
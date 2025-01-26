"use server"

import { neon } from "@neondatabase/serverless";
import { NextRequest, NextResponse } from "next/server";

const generateAvailableName = 
`WITH new_name AS (
  SELECT
    CONCAT(
      (SELECT word FROM words ORDER BY RANDOM() LIMIT 1), '-',
      (SELECT word FROM words ORDER BY RANDOM() LIMIT 1), '-',
      (SELECT word FROM words ORDER BY RANDOM() LIMIT 1)
    ) AS random_name
)
SELECT random_name FROM new_name
WHERE NOT EXISTS (
  SELECT 1 
  FROM sets WHERE name = random_name
)
LIMIT 1;`

export async function GET(req: NextRequest) {
    const sql = neon(`${process.env.DB_DATABASE_URL}`);

    try {
        let name = null;

        while (!name) {
            const response = await sql(generateAvailableName);
            if (response.length === 1) {
                name = response[0].random_name;
            }
        }

        return NextResponse.json({ name });
        
    } catch (err) {
        console.error("Error generating unique name: ", err);
        return NextResponse.json({ error: "Failed to generate name" }, { status: 500 });
    }



}
"use server"

import { neon } from "@neondatabase/serverless";

const sql = neon(`${process.env.DB_DATABASE_URL}`);

export async function generateAvailableSetName(): Promise<string> {
    const query = `
    WITH new_name AS (
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
    LIMIT 1;`;

    try {
        let name = null;
        while (!name) {
            const response = await sql(query);
            if (response.length === 1) {
                name = response[0].random_name;
            }
        }
        return name;
    } catch (error) {
        console.error("Error generating unique name: ", error);
        return "";
    }
}

export async function createSet(setName: string, userId: string): Promise<number | null> {
    const query = "INSERT INTO sets (name, uploader) VALUES ($1, $2) RETURNING id";
    try {
        const response = await sql(query, [setName, userId]);
        return response[0]?.id || null
    } catch (error) {
        console.error("Error creating set: ", error);
        return null
    }
}

export async function addImageToSet(setId: string, fileName: string, userId: string): Promise<number | null> {
    const query = "INSERT INTO images (set_id, filename, uploader) VALUES ($1, $2, $3) RETURNING id";
    try {
        const response = await sql(query, [setId, fileName, userId]);
        return response[0]?.id || null
    } catch (error) {
        console.error("Adding image to set:", error);
        return null
    }
}
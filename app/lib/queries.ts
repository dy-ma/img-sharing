"use server"

import { neon } from "@neondatabase/serverless";

export type Set = {
    id: string
    name: string
    size: number
}

export type Image = {
    set_id: string
    filename: string // uuid + extension
    uploader: string 
}

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

export async function addImageToSet(image: Image): Promise<number | null> {
    const query = "INSERT INTO images (set_id, filename, uploader) VALUES ($1, $2, $3) RETURNING id";
    try {
        const response = await sql(query, [image.set_id, image.filename, image.uploader]);
        if (response.length === 0) {
            throw new Error(`Failed to insert image with filename ${image.filename}`);
        }
        return response[0]?.id || null;
    } catch (error: any) {
        console.error("Error adding image to set:", error.message || error);
        throw new Error(`Failed to add image to set: ${image.filename}`);
    }
}

export async function addImagesToSet(images: Image[]) {
    const errors: string[] = []; // To collect any errors during image insertion

    for (let image of images) {
        try {
            const result = await addImageToSet(image);
            if (!result) {
                errors.push(`Failed to add image with filename ${image.filename}`);
            }
        } catch (error: any) {
            console.error("Error adding image to set:", error);
            errors.push(`Failed to add image with filename ${image.filename}: ${error.message || error}`);
        }
    }

    if (errors.length > 0) {
        throw new Error(`Some images failed to be added: ${errors.join(', ')}`);
    }
}

export async function getSets(userId: string): Promise<Set[]> {
    const query = `
        SELECT 
            sets.id as id,
            sets.name as name,
            COUNT(images.id) AS size
        FROM sets
        LEFT JOIN images
        ON sets.id = images.set_id
        WHERE sets.uploader = $1 
        GROUP BY sets.id, sets.name`


        try {
            const response = await sql(query, [userId]);
            return response as Set[];
        } catch (error) {
            console.error("Error fetching user sets with image counts:", error);
            return []
        }
}

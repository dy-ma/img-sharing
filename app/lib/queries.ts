"use server"

import { neon } from "@neondatabase/serverless";
import { deleteImageFromS3 } from "./s3";

export type Set = {
    id: string
    name: string
    size?: number
    uploader?: string
    created_at: Date
    token?: string
}

export type Image = {
    id?: string
    set_id: string
    filename: string // uuid + extension
    uploader: string 
}

export type User = {
    id: string
    email: string
    name: string
}

const URL = process.env.DB_DATABASE_URL
if (!URL) {
    throw new Error("Database Connection String not defined")
}

const sql = neon(URL);

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

    for (const image of images) {
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
            COUNT(images.id) AS size,
            sets.created_at
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

export async function deleteImage(set_id: string, filename: string): Promise<boolean> {
    const query = `DELETE FROM images
    WHERE set_id = $1 AND filename = $2`;

    try {
        // Deleting from the database
        const response = await sql(query, [set_id, filename]);

        console.log(response)

        // Deleting from S3
        const deletedS3 = await deleteImageFromS3(filename);
        
        // Return true only if both deletions succeeded
        return deletedS3;
    } catch (error) {
        console.error("Error deleting image: ", error);
        return false;
    }
}

export async function deleteSet(set_id: string): Promise<boolean> {
    try {
        const query = "SELECT filename FROM images WHERE set_id = $1";
        const images = await sql(query, [set_id]);

        if (images.length === 0) {
            return false;
        }

        const deleteResults = await Promise.all(
            images.map((image) => deleteImage(set_id, image.filename))
        );

        if (!deleteResults.every(result => result)) {
            console.error(`Some images failed to delete for set: ${set_id}`);
            return false;
        }

        const deleteSetQuery = "DELETE FROM sets WHERE id = $1";
        const deleteSetResponse = await sql(deleteSetQuery, [set_id]);

        if (deleteSetResponse.length > 0) {
            console.error(`Failed to delete set with id: ${set_id}`)
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error deleting set: ", error);
        return false
    }
}

export async function getSetMetadata(set_name: string): Promise<Set> {
    const query = "SELECT * FROM sets WHERE name = $1";
    const response = await sql(query, [set_name]);

    if (response.length != 1) {
        throw new Error("Set not Found");
    }

    return response[0] as Set;
}

export async function getImagesInSet(set_id: string): Promise<Image[]> {
    const query = "SELECT * FROM images WHERE set_id = $1";
    const response = await sql(query, [set_id]);

    if (response.length <= 0) {
        throw new Error("No images found");
    }
    
    return response as Image[];
}

export async function getUser(id: string): Promise<User> {
    const query = "SELECT id, email, name FROM users WHERE id = $1";
    const response = await sql(query, [id]);
    
    if (response.length < 0) {
        throw new Error("User not found");
    }
    
    return response[0] as User;
}

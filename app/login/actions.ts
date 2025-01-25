"use server";
import { z } from "zod";
import { createSession, deleteSession } from "../lib/session";
import { redirect } from "next/navigation";
import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";

const loginSchema = z.object({
    email: z.string().email({ message: "Invalid email address"}).trim(),
    password: z
        .string()
        .min(6, { message: "Password must be at least 6 characters" })
        .trim(),
})

export async function login(prevState: any, formData: FormData) {
    const result = loginSchema.safeParse(Object.fromEntries(formData));

    if (!result.success) {
        return {
            errors: result.error.flatten().fieldErrors,
        };
    }

    const {email, password} = result.data;

    const sql = neon(`${process.env.DB_DATABASE_URL}`);
    const response = await sql("SELECT id, name, password_hash FROM users WHERE email = ($1)", [email]);

    if (response.length === 0) {
        return {
            errors: {
                email: ["User not found"],
            }
        };
    }

    const db_user_record = response[0];

    const match = await bcrypt.compare(password, db_user_record.password_hash);

    if (!match) {
        return {
            errors: {
                email: ["Invalid email or password"],
            },
        };
    }

    await createSession(db_user_record.id);

    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
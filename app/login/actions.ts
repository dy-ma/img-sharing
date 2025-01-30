"use server";
import { z } from "zod";
import { createSession, deleteSession } from "../../lib/session";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

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

    const user = await prisma.user.findUnique({
        where: {
            email: email
        }
    })

    if (!user) {
        return {
            errors: {
                email: [`No account found with email: ${email}`],
            }
        }
    }

    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
        return {
            errors: {
                email: ["Invalid email or password"],
            },
        };
    }

    await createSession(String(user.id));

    redirect("/dashboard");
}

export async function logout() {
    await deleteSession();
    redirect("/login");
}
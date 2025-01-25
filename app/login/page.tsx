"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react"
import { login } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function Login() {
    const [state, loginAction] = useActionState(login, undefined);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full">
            <h1 className="text-4xl font-bold mb-10">Login</h1>
            <form action={loginAction} className="flex min-w-64 flex-col gap-4">
                {/* Email Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email
                    </Label>
                    <Input id="email" name="email" placeholder="Email" />
                    {state?.errors?.email && <p className="text-sm text-red-500">{state.errors.email}</p>}
                </div>

                {/* Password Field */}
                <div className="flex flex-col gap-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                        Password
                    </Label>
                    <Input id="password" name="password" type="password" placeholder="Password" />
                    {state?.errors?.password && <p className="text-sm text-red-500">{state.errors.password}</p>}
                </div>

                {/* Submit Button */}
                <SubmitButton />
            </form>
        </div>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <Button disabled={pending} type="submit">
            Login
        </Button>
    )
}

export default function Page() {
    return (
        <Login />
    )
}
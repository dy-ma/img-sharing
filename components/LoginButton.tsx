
import { verifySession } from "@/lib/dal";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { logout } from "@/app/login/actions";

export default async function LoginButton() {
    const session = await verifySession();

    return (
        <>
            {session.isAuth == true ?
                <Button onClick={logout}>Sign Out</Button>
                : <Button asChild><Link href="/login">Sign In</Link></Button>
            }
        </>
    )
}
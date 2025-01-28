import { Button } from "@/components/ui/button"
import { logout } from "../login/actions"
import { verifySession } from "../lib/dal"
import Link from "next/link";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await verifySession();
    return (
        <div>
            <header className="flex justify-between p-4">
                <h1 className="text-xl font-semibold">ImgShare</h1>
                {session.isAuth == true ?
                    <Button onClick={logout}>Sign Out</Button>
                    : <Button asChild><Link href="/login">Sign In</Link></Button>
                }
            </header>
            {/* Main Content */}
            {children}
        </div>
    )
}
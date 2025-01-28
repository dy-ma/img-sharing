"use server"

import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";
import { columns } from "./columns";
import { DataTable } from "./datatable";
import Link from "next/link";
import { Set, getSets } from "@/app/lib/queries";
import { verifySession } from "../lib/dal";

export default async function Dashboard() {
    const session = await verifySession()

    let sets: Set[] = []
    if (session.isAuth) {
        sets = await getSets(session.userId!);
    }

    return (
        <div className="container mx-auto py-10">
            <div className="flex gap-2 mb-2">
                <Button asChild>
                    <Link href="/dashboard/upload">Add Set</Link>
                </Button>
                <Button onClick={logout}>Sign Out</Button>
            </div>
            <DataTable columns={columns} data={sets} />
        </div>
    )
}
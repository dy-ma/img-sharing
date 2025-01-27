"use server"

import { Button } from "@/components/ui/button";
// import { logout } from "../login/actions";
import { columns } from "./columns";
import { DataTable } from "./datatable";
import Link from "next/link";
import { getSets } from "@/app/lib/queries";

export default async function Dashboard() {
    const sets = await getSets();
    // console.log(sets)

    return (
        <div className="container mx-auto py-10">
            <Button asChild>
                <Link href="/dashboard/upload">Add Set</Link>
            </Button>
            <DataTable columns={columns} data={sets}/>
        </div>
    )
}
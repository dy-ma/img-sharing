"use server"

import { Button } from "@/components/ui/button";
import { columns } from "./columns";
import { DataTable } from "./datatable";
import Link from "next/link";
import { Set } from "@/lib/queries";
import { verifySession } from "../../lib/dal";
import { Plus } from "lucide-react";

export default async function Dashboard() {
    const session = await verifySession()

    let sets: Set[] = []

    return (
        <div className="container mx-auto py-10">
            <div className="flex mb-2 justify-between items-end p-2">
                <h1 className="font-semibold text-xl">Sets</h1>
                <Button asChild variant="outline">
                    <Link href="/dashboard/upload" aria-label="Add Set">
                        <Plus className="h-4 w-4" />
                    </Link>
                </Button>
            </div>
            <div className="p-2">
                <DataTable columns={columns} data={sets} />
            </div>
        </div>
    )
}
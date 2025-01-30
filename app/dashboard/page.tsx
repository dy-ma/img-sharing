"use server"

import { columns } from "./columns";
import { DataTable } from "./datatable";
import type { Set } from "@prisma/client";
import { verifySession } from "../../lib/dal";
import { prisma } from "@/lib/db";
import AddSetButton from "./AddSetButton";
import { getRandomIds } from "@/lib/utils";

export default async function Dashboard() {
    const session = await verifySession()

    const sets: Set[] = await prisma.set.findMany({
        where: {
            uploader_id: Number(session.userId)
        }
    })

    const random_words = await prisma.word.findMany({
        where: {
            id: { in: getRandomIds(1, 100, 3) }
        }
    });
    const random_set_name = random_words.map(word => word.word).join('-');

    return (
        <div className="container mx-auto py-10">
            <div className="flex mb-2 justify-between items-end p-2">
                <h1 className="font-semibold text-xl">Sets</h1>
                <AddSetButton initialSetname={random_set_name} />
            </div>
            <div className="p-2">
                <DataTable columns={columns} data={sets} />
            </div>
        </div>
    )
}
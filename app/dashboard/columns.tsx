"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Set } from "@/app/lib/queries";

export const columns: ColumnDef<Set>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "size",
        header: "Size",
    },
]
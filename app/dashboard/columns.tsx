"use client"

import { ColumnDef } from "@tanstack/react-table";
// import { Badge } from "@/components/ui/badge";

export type PhotoSet = {
    id: string
    name: string
    size: number
    status: "uploading" | "live" | "failed" | "expired"
    tag?: string
}

export const columns: ColumnDef<PhotoSet>[] = [
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "size",
        header: "Size",
    },
    {
        accessorKey: "status",
        header: "Status",
    },
    {
        accessorKey: "tag",
        header: "Tag"
    }
]
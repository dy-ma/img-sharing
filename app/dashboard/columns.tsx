"use client"

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type PhotoSet = {
    id: string
    name: string
    size: number
    status: "uploading" | "live" | "failed" | "expired"
    tag?: string
}

function StatusTag(tag?: string) {
    switch (tag) {
        case "uploading":
            return <Badge>Uploading</Badge>
        case "live":
            return <Badge>Live</Badge>
        case "failed":
            return <Badge variant="destructive">Failed</Badge>
        case "expired":
            return <Badge variant="outline">Expired</Badge>
        default:
            return <></>
    }
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
        cell: ({row}: any) => {
            const status = row.getValue("status")
            return StatusTag(status);
        }
    },
    {
        accessorKey: "tag",
        header: "Tag"
    }
]
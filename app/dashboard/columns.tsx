"use client"

import { Set } from "@/app/lib/queries";
import { ColumnDef } from "@tanstack/react-table";

import Link from "next/link";

export const columns: ColumnDef<Set>[] = [
    {
        accessorKey: "name",
        header: "Name",
        cell: ({row}) => {
            const set = row.original;
            return (
                <Link 
                    href={`/set/${set.name}`}
                    className="text-decoration-line"
                >
                    {set.name}
                </Link>
            )
        }
    },
    {
        accessorKey: "size",
        header: "Size",
    },
    {
        accessorKey: "created_at",
        header: "Expires in",
        cell: ({ row }) => {
            const set = row.original;

            // Calculate remaining days
            const expirationDate = new Date(set.created_at.getTime() + 12096e5);
            const timeRemaining = expirationDate.getTime() - Date.now();
            const daysRemaining = timeRemaining / (1000 * 60 * 60 * 24)
            return (
                <span>{Math.round(daysRemaining)} days</span>
            )
        }
    }
]
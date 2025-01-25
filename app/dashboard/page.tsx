import { Button } from "@/components/ui/button";
import { logout } from "../login/actions";
import { PhotoSet, columns } from "./columns";
import { DataTable } from "./datatable";

async function getData(): Promise<PhotoSet[]> {
    return [

        {
            id: "123as43",
            name: "name1",
            size: 34,
            status: "live"
        },
        {
            id: "12324bn",
            name: "name2",
            size: 10,
            status: "uploading",
            tag: "122345"
        },
        {
            id: "99999",
            name: "name3",
            size: 10000,
            status: "failed",
            tag: "99"
        },
        {
            id: "4444",
            name: "name4",
            size: 23,
            status: "expired",
            tag: "122345"
        }
    ]
}

export default async function Dashboard() {
    const data = await getData();

    return (
        <div className="container mx-auto py-10">
            <DataTable columns={columns} data={data}/>
        </div>
    )
}
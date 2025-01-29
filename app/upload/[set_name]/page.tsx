import { prisma } from "@/lib/db";

export default async function name(
    { params }: { params: Promise<{ set_name: string }> }
) {
    const { set_name } = await params;
    const set = await prisma.set.findUnique({
        where: {
            name: set_name
        }
    })

    if (!set) {
        return (
            <div className="flex justify-center items-center w-full min-h-screen">
                <h1 className="text-4xl">404 - Set not found</h1>
            </div>
        )
    }

    return (
        <div className="flex justify-center items-center w-full min-h-screen">
            nice
        </div>
    )
}
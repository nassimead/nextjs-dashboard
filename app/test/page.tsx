
import { auth } from "@/auth"

export default async function Page() {

    const session = await auth();

    return (
        <p>Test Page [{session?.user?.name}]</p>
    )
}
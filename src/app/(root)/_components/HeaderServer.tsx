import { currentUser } from "@clerk/nextjs/server";

async function HeaderServer() {
    const user = await currentUser();

    return {
        userId: user?.id,
        userEmail: user?.emailAddresses[0]?.emailAddress,
    };
}

export default HeaderServer;
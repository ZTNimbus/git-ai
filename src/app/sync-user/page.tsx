import { auth, clerkClient } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { db } from "~/server/db";

async function SyncUser() {
  const { userId } = await auth();

  if (!userId) throw new Error("User not found");

  const client = await clerkClient();
  const user = await client.users.getUser(userId);
  const { firstName, lastName, imageUrl, emailAddresses } = user;

  if (!emailAddresses[0]?.emailAddress) return notFound();

  //We know this is 100% type-safe thanks to Clerk, therefore we can safely ignore it
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  await db.user.upsert({
    where: { emailAddress: emailAddresses[0]?.emailAddress ?? "" },

    update: {
      imageUrl,
      firstName,
      lastName,
    },

    create: {
      id: userId,
      firstName,
      lastName,
      imageUrl,
      emailAddress: emailAddresses[0]?.emailAddress ?? "",
    },
  });

  return redirect("/dashboard");
}

export default SyncUser;

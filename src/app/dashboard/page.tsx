"use client";

import { useUser } from "@clerk/nextjs";

function Dashboard() {
  const { user } = useUser();
  return <div>{user?.fullName}</div>;
}

export default Dashboard;

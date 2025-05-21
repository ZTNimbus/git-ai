import { UserButton } from "@clerk/nextjs";
import type { PropsWithChildren } from "react";
import { SidebarProvider } from "~/components/ui/sidebar";
import AppSidebar from "./app-sidebar";

function SidebarLayout({ children }: PropsWithChildren) {
  return (
    <SidebarProvider>
      <AppSidebar />

      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar p flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* <SearchBar /> */}

          <div className="ml-auto"></div>

          <UserButton />
        </div>

        <div className="h-4">
          <div className="border-sidebar-border bg-sidebar h-[calc(100vh-8rem)] overflow-y-scroll rounded-md border p-4 shadow"></div>
        </div>
      </main>
    </SidebarProvider>
  );
}

export default SidebarLayout;

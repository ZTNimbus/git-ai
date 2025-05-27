import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Git AI - Your Repo Assistant",
  description:
    "Git AI is a powerful AI tool that can analyse any Github repository. Ask AI anything about your repo and never lose yourself inside a huge codebase ever again. Git AI also comes with Meeting analysis where you can upload an audio file of the meeting you missed in order to anaylse it with AI and auto-generate keypoints of the meeting.",
  icons: [{ rel: "icon", url: "/icon.svg" }],
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter-sans",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" className={`${inter.variable}`}>
        <body>
          <TRPCReactProvider>{children}</TRPCReactProvider>
        </body>
      </html>
      <Toaster richColors />
    </ClerkProvider>
  );
}

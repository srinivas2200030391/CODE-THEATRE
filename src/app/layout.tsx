import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import ConvexClientProvider from "@/components/providers/ConvexClientProvider";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Code-Theatre", // Updated title
  description: "An online code editor for sharing snippets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <title>Code-Theatre</title>

          <link rel="icon" href="/code-theatre.svg" />{" "}
          {/* Update favicon path */}
        </head>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-tr from-gray-900 to-gray-500 text-gray-100 flex flex-col`}
        >
          <ConvexClientProvider>
            <div className="flex-1">{children}</div> {/* Ensures content takes full height */}
          </ConvexClientProvider>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}

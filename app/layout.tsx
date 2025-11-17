import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "FlowPlay | AI Playlist Converter",
  description: "Convert playlists between platforms with AI."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
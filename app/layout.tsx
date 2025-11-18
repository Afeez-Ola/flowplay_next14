import type { Metadata } from "next";
import "./globals.css";

import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ReactNode } from "react";
import { Sofia_Sans } from "next/font/google";

const sofia = Sofia_Sans({ subsets: ["latin"], weight: ["300","400","500","600","700"] });

export const metadata: Metadata = {
  title: "FlowPlay | AI Playlist Converter",
  description: "Convert playlists between platforms with AI."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={sofia.className}>
      <body className="relative flex flex-col min-h-screen overflow-hidden text-white bg-gradient-to-br from-slate-950 via-black to-slate-900 backdrop-blur-xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute rounded-full w-96 h-96 bg-green-600/20 blur-3xl animate-pulse-slow" style={{ top: "-10%", left: "-10%" }} />
          <div className="absolute rounded-full w-96 h-96 bg-red-600/20 blur-3xl animate-pulse" style={{ bottom: "-15%", right: "-5%" }} />
          <div className="absolute w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-3xl animate-pulse-mid" style={{ top: "30%", left: "50%" }} />
        </div>
        <Navbar />
        <main className="flex-1 py-10">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
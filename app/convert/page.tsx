"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import dynamic from "next/dynamic";
import ConversionWizard from "@/components/ConversionWizard";

// Lazy-load Lottie to avoid SSR issues
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ConvertPage() {
  return (
    <div className="relative flex items-start justify-center min-h-screen px-6 pt-32">

      {/* Background Blobs */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute w-[600px] h-[600px] bg-green-500/20 rounded-full blur-[150px] animate-pulse-slow left-[-20%] top-[-10%]" />
        <div className="absolute w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[150px] animate-pulse-mid right-[-15%] bottom-[-5%]" />
        <div className="absolute w-[700px] h-[700px] bg-purple-600/10 rounded-full blur-[180px] animate-pulse-slower left-[40%] top-[30%]" />
      </div>

      {/* Vinyl Spin Behind Panel */}
      <motion.div
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute w-[450px] h-[450px] opacity-[0.08] -z-10 top-20 right-10 hidden md:block"
      >
        <Image
          src="/vinyl.png"
          alt="vinyl"
          width={450}
          height={450}
          className="select-none"
        />
      </motion.div>

      {/* Conversion Panel */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-2xl p-6 overflow-hidden border shadow-xl bg-slate-900/40 backdrop-blur-xl border-white/10 rounded-2xl"
      >

        {/* Floating Particles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute text-5xl animate-float text-white/10" style={{ top: "5%", left: "10%" }}>♪</div>
          <div className="absolute text-6xl animate-float-slow text-white/10" style={{ top: "40%", left: "85%" }}>♫</div>
          <div className="absolute text-4xl animate-float text-white/10" style={{ top: "75%", left: "20%" }}>♬</div>
        </div>

        {/* Header */}
        <div className="mb-6 space-y-3 text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text">
              Convert Your Playlist
            </span>
          </h1>
          <p className="text-sm text-slate-300">
            Transform your playlist across Spotify, Apple Music, YouTube Music & more.
          </p>
        </div>

        {/* Conversion Wizard Component */}
        <ConversionWizard />

      </motion.div>
    </div>
  );
}
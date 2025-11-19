'use client';

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 z-50 w-full">
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="relative flex items-center justify-between h-16 px-4 border-b shadow-xl backdrop-blur-xl bg-slate-900/40 border-white/10 md:px-8"
      >
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 group"
        >
          <div className="relative w-8 h-8 overflow-hidden rounded-lg shadow-lg shadow-emerald-500/20 transition-transform duration-300 group-hover:scale-110">
             <img src="/logo.png" alt="FlowPlay Logo" className="w-full h-full object-cover" />
          </div>
          <span className="text-lg font-bold tracking-wide text-transparent bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text">
            FlowPlay
          </span>
        </Link>

        {/* Desktop Links */}
        <div className="items-center hidden gap-8 text-sm md:flex">
          <Link
            href="#features"
            className="transition-colors duration-200 hover:text-green-400"
          >
            Features
          </Link>

          <Link
            href="#how"
            className="transition-colors duration-200 hover:text-green-400"
          >
            How it works
          </Link>

          {/* Platform indicators */}
          <div className="flex items-center gap-3">
            <span className="px-2 py-1 text-xs text-green-400 border rounded-md bg-green-500/20 border-green-400/30">
              Spotify ✔
            </span>
            <span className="px-2 py-1 text-xs text-red-400 border rounded-md bg-red-500/20 border-red-400/30">
              YouTube
            </span>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="text-xl text-white md:hidden"
          onClick={() => setOpen(!open)}
        >
          ☰
        </button>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col gap-4 px-6 py-4 text-sm border-b shadow-lg md:hidden backdrop-blur-xl bg-slate-900/70 border-white/10"
          >
            <Link
              href="#features"
              onClick={() => setOpen(false)}
              className="hover:text-green-400"
            >
              Features
            </Link>

            <Link
              href="#how"
              onClick={() => setOpen(false)}
              className="hover:text-green-400"
            >
              How it works
            </Link>

            {/* Mobile indicators */}
            <div className="flex gap-3 mt-2">
              <span className="px-2 py-1 text-xs text-green-400 border rounded-md bg-green-500/20 border-green-400/30">
                Spotify ✔
              </span>
              <span className="px-2 py-1 text-xs text-red-400 border rounded-md bg-red-500/20 border-red-400/30">
                YouTube
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
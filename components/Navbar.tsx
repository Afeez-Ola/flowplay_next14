'use client';
import Link from "next/link";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-slate-800 bg-slate-950">
      <nav className="container flex h-16 items-center justify-between">
        <Link href="/" className="text-sm font-semibold">FlowPlay</Link>
        <button className="md:hidden" onClick={() => setOpen(!open)}>☰</button>
        <div className="hidden md:flex gap-6 text-sm">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
        </div>
      </nav>
      {open && (
        <div className="md:hidden container py-3 text-sm flex flex-col gap-3">
          <Link href="#features">Features</Link>
          <Link href="#how">How it works</Link>
        </div>
      )}
    </header>
  );
}
"use client";

import React from "react";
import Link from "next/link";
import { MoveRight } from "lucide-react";

const Navbar = () => {
    return (
        <nav className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-6 bg-black/50 backdrop-blur-md border-b border-white/10">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center font-bold text-white italic">
                    CX
                </div>
                <span className="text-xl font-bold tracking-tighter text-white">CUBEX</span>
            </div>

            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
                <Link href="#" className="hover:text-white transition-colors">Solver</Link>
                <Link href="#" className="hover:text-white transition-colors">Timer</Link>
                <Link href="#" className="hover:text-white transition-colors">Learn</Link>
                <Link href="#" className="hover:text-white transition-colors">Leaderboard</Link>
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-sm font-bold rounded-full hover:bg-neutral-200 transition-colors">
                Get Started <MoveRight size={16} />
            </button>
        </nav>
    );
};

export default Navbar;

"use client";

import React, { useState, useEffect } from 'react';
import Navbar from "@/components/Navbar";
import Timer from "@/components/timer/Timer";
import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";
import { generateScramble } from "@/lib/scramble";
import { RefreshCw, History, Trash2, Trophy } from "lucide-react";
import { toast } from "react-toastify";
import { solveApi } from "@/api/solve.api";
import { leaderboardApi } from "@/api/leaderboard.api";

export default function TimerPage() {
    const [scramble, setScramble] = useState("");
    const [history, setHistory] = useState<{ time: number, scramble: string, date: Date }[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [isSolving, setIsSolving] = useState(false);
    const [userId, setUserId] = useState<string>("");
    const [lastPercentile, setLastPercentile] = useState<number | null>(null);

    useEffect(() => {
        setIsClient(true);
        setScramble(generateScramble());

        // Retrieve or Generate Mock ID (In real app, get from Auth Context)
        let id = localStorage.getItem('cubex_user_id');
        if (!id) {
            // Generate a consistent ID for this browser
            id = 'demo-user-' + Math.random().toString(36).substr(2, 6);
            localStorage.setItem('cubex_user_id', id);
        }
        setUserId(id);
    }, []);

    const handleNewScramble = () => {
        setScramble(generateScramble());
    };

    const handleStart = () => {
        setIsSolving(true);
        setLastPercentile(null);
    };

    const handleStop = async (time: number) => {
        setIsSolving(false);
        const newSolve = { time, scramble, date: new Date() };
        setHistory(prev => [newSolve, ...prev]);

        // Backend Integration
        try {
            // 1. Save Solve
            if (userId) {
                await solveApi.saveSolve({ userId, time: Math.round(time), scramble });

                // 2. Fetch Percentile
                const rankData = await leaderboardApi.getUserRank(userId);

                if (rankData.percentile) {
                    setLastPercentile(rankData.percentile);
                    toast.success(`Whoa! Top ${rankData.percentile}% of the World! 🏆`);
                } else if (rankData.rank) {
                    toast.info(`Rank #${rankData.rank} globally!`);
                }
            } else {
                console.warn("Solve not saved: userId is missing");
            }

        } catch (error) {
            console.error("Backend Error:", error);
        }

        handleNewScramble();
    };

    const formatTime = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        const milliseconds = Math.floor((ms % 1000) / 10);
        if (minutes > 0) return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
        return `${seconds}.${milliseconds.toString().padStart(2, '0')}`;
    };

    if (!isClient) return null;

    return (
        <div className="relative min-h-screen w-full bg-black text-white overflow-hidden flex flex-col">
            <Navbar />

            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
                <BackgroundRippleEffect rows={35} cols={70} cellSize={50} />
            </div>

            <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">

                {/* Timer (Circular) */}
                <div className="mb-20">
                    <Timer onStart={handleStart} onStop={handleStop} className="scale-110 md:scale-125" percentile={lastPercentile} />
                </div>

                {/* Session Stats */}
                <div className={`absolute bottom-8 right-8 w-64 bg-black/50 backdrop-blur-md border border-white/10 rounded-xl p-4 hidden md:block transition-opacity duration-500 ${isSolving ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-neutral-400">
                            <History size={16} /> Session
                        </div>
                        <button onClick={() => setHistory([])} className="text-neutral-600 hover:text-red-400 transition-colors">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                        {history.map((solve, i) => (
                            <div key={i} className="flex justify-between text-sm hover:bg-white/5 p-1 rounded">
                                <span className="text-neutral-500 font-mono">{(history.length - i).toString().padStart(2, '0')}</span>
                                <span className="font-mono font-bold text-white">{formatTime(solve.time)}</span>
                            </div>
                        ))}
                        {history.length === 0 && <div className="text-xs text-neutral-600 text-center py-4">No solves yet</div>}
                    </div>
                </div>
            </main>
        </div>
    );
}

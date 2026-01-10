'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle, RotateCcw } from 'lucide-react';
import Image from 'next/image';
import { useCube } from "@/context/CubeContext";
import { Phase } from '@/api/cube.api';

function SolutionContent() {
    const { solutionPhases: phases } = useCube();
    const router = useRouter();

    if (!phases || phases.length === 0) {
        return (
            <div className="min-h-screen bg-black/95 text-foreground p-8 flex flex-col items-center justify-center relative overflow-hidden">
                <div className="animate-in fade-in zoom-in duration-500 text-center space-y-6">
                    <h1 className="text-3xl font-black tracking-tighter text-white">No Solution Found</h1>
                    <p className="text-muted-foreground">Please solve a cube first to see the instructions.</p>
                    <Button onClick={() => router.push('/solver/manual')} className="bg-primary hover:bg-primary/90">
                        Go to Solver
                    </Button>
                </div>
            </div>
        );
    }

    const totalMoves = phases.reduce((acc: number, p: Phase) => acc + p.moves.length, 0);

    return (
        <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-10 pt-10 pb-20 px-6">
            {/* Header */}
            <div className="text-center space-y-4 mt-22" >
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    Solution Found
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Follow the steps below to solve your cube layer by layer.
                </p>
            </div>

            {/* Notation & Orientation Guide */}
            <div className="w-full grid md:grid-cols-2 gap-6">
                {/* Notation */}
                <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <HelpCircle className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Algorithm Guide</h2>
                            <p className="text-neutral-400 text-sm">Notation Symbols</p>
                        </div>
                    </div>

                    <div className="relative w-full aspect-video bg-white rounded-xl overflow-hidden p-2">
                        <Image
                            src="/assets/learn/rubik-guide.png"
                            alt="Rubik's Cube Notation Guide"
                            fill
                            className="object-contain"
                        />
                    </div>
                </div>

                {/* Orientation */}
                <div className="bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <RotateCcw className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Starting Orientation</h2>
                            <p className="text-neutral-400 text-sm">How to hold your cube</p>
                        </div>
                    </div>

                    <div className="space-y-4 text-neutral-300">
                        <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                            <p className="text-sm leading-relaxed">
                                <strong className="text-white">Crucial:</strong> Hold the cube exactly as you painted it on the input screen.
                            </p>
                        </div>

                        <ul className="space-y-3">
                            <li className="flex gap-3 text-sm">
                                <div className="w-5 h-5 rounded bg-white/20 border border-white/50 flex-shrink-0" />
                                <span><strong className="text-white">Front:</strong> Face the <span className="text-white">White</span> center towards you.</span>
                            </li>
                            <li className="flex gap-3 text-sm">
                                <div className="w-5 h-5 rounded bg-blue-500/20 border border-blue-500/50 flex-shrink-0" />
                                <span><strong className="text-white">Top:</strong> Keep the <span className="text-blue-400">Blue</span> center on top.</span>
                            </li>
                        </ul>

                        <p className="text-xs text-neutral-500 italic">
                            All moves in the phases below (R, U, F, etc.) are relative to this fixed position. Do not rotate the entire cube while performing the steps!
                        </p>
                    </div>
                </div>
            </div>

            {/* Total Summary & Action */}
            <div className="w-full flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <div className="space-y-1">
                    <h2 className="text-xl font-bold text-white">Full Solution</h2>
                    <p className="text-neutral-400 text-sm">{totalMoves} total moves • 7 Phases</p>
                </div>
                <Button
                    variant="outline"
                    onClick={() => router.push('/solver/manual')}
                    className="border-white/10 hover:bg-white/5"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Solve Another
                </Button>
            </div>

            {/* Phase Cards */}
            <div className="w-full flex flex-col gap-8">
                {phases.map((phase: Phase, phaseIdx: number) => (
                    phase.moves.length > 0 && (
                        <div key={phaseIdx} className="w-full bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 shadow-2xl">
                            <div className="flex flex-col gap-6">
                                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold border border-blue-500/30">
                                            {phaseIdx + 1}
                                        </div>
                                        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">{phase.name}</h2>
                                    </div>
                                    <span className="text-neutral-500 text-sm font-mono">{phase.moves.length} moves</span>
                                </div>

                                <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-10 gap-2 md:gap-3">
                                    {phase.moves.map((move: string, i: number) => (
                                        <div
                                            key={i}
                                            className="aspect-square flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                                        >
                                            <span className="text-xl md:text-2xl font-black text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all">
                                                {move}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )
                ))}
            </div>


        </div>
    );
}

export default function SolutionPage() {
    return (
        <div className="min-h-screen bg-black/95 text-foreground flex flex-col items-center relative overflow-x-hidden">
            {/* Background Effects */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

            <Navbar />

            <Suspense fallback={<div className="text-white pt-40">Loading solution...</div>}>
                <SolutionContent />
            </Suspense>
        </div>
    );
}

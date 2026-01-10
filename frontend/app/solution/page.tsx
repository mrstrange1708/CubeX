'use client';

import React, { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import Image from 'next/image';

function SolutionContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const movesParam = searchParams.get('moves');

    // Parse moves: "R U R'" -> ["R", "U", "R'"]
    const moves = movesParam ? movesParam.split(',') : [];

    return (
        <div className="z-10 w-full max-w-5xl flex flex-col items-center gap-10 pt-10 pb-20 px-6">
            {/* Header */}
            <div className="text-center space-y-4">
                <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                    Solution Found
                </h1>
                <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                    Follow these steps carefully to solve your cube.
                </p>
            </div>

            {/* Solution Card */}
            <div className="w-full bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                <div className="flex flex-col gap-8">
                    <div className="flex items-center justify-between border-b border-white/10 pb-6">
                        <div className="space-y-1">
                            <h2 className="text-2xl font-bold text-white">Sequence</h2>
                            <p className="text-neutral-400 text-sm">{moves.length} moves • Face front (Green normally)</p>
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

                    <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3 md:gap-4">
                        {moves.map((move, i) => (
                            <div
                                key={i}
                                className="aspect-square flex flex-col items-center justify-center bg-white/5 hover:bg-white/10 rounded-xl border border-white/5 transition-all group"
                            >
                                <span className="text-2xl md:text-3xl font-black text-blue-400 group-hover:text-blue-300 group-hover:scale-110 transition-all">
                                    {move}
                                </span>
                                <span className="text-[10px] text-neutral-500 font-mono mt-1">
                                    {i + 1}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Notation Guide */}
            <div className="w-full bg-neutral-900/50 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-10 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                        <HelpCircle className="w-6 h-6 text-purple-400" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">Notation Guide</h2>
                        <p className="text-neutral-400 text-sm">Understanding the moves</p>
                    </div>
                </div>

                <div className="relative w-full aspect-[2/1] md:aspect-[3/1] bg-white rounded-xl overflow-hidden p-4">
                    <Image
                        src="/rubik-guide.png"
                        alt="Rubik's Cube Notation Guide"
                        fill
                        className="object-contain"
                    />
                </div>
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

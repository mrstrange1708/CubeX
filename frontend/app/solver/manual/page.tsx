'use client';

import React, { useState } from 'react';
import { CubeNet, CubeState, FaceKey } from '@/components/solver/CubeNet';
import { ColorPicker, CubeColor } from '@/components/solver/ColorPicker';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';

// Initial solved state
const initialCubeState: CubeState = {
    U: Array(9).fill('white'),
    L: Array(9).fill('orange'),
    F: Array(9).fill('green'),
    R: Array(9).fill('red'),
    B: Array(9).fill('blue'),
    D: Array(9).fill('yellow'),
};

export default function SolvePage() {
    const [cubeState, setCubeState] = useState<CubeState>(initialCubeState);
    const [selectedColor, setSelectedColor] = useState<CubeColor>('white');

    const handleStickerClick = (face: FaceKey, index: number) => {
        // If it's the center piece (index 4), typically we don't change it as it defines the face color
        // But for a flexible painter, we can allow it, or restrict it. 
        // Standard Rubik's cube centers are fixed relative to each other.
        // Let's allow changing it for now to be flexible, but maybe warn or just allow it.
        // Actually, usually tools fix the center to guide the user.
        // Let's STRICTLY enforce centers?
        // "U" is usually White, "D" Yellow, etc. 
        // If we want to allow users to paint however they hold the cube, we might not want to lock centers.
        // However, the net implies a specific orientation (U/L/F/R/B/D).
        // Let's just allow painting everything for simplicity in V1 for the user to map their cube.

        setCubeState(prev => ({
            ...prev,
            [face]: prev[face].map((c, i) => i === index ? selectedColor : c)
        }));
    };

    const handeReset = () => {
        setCubeState(initialCubeState);
    };

    const handleSolve = () => {
        console.log("Solve requested", cubeState);
        // TODO: Send to backend
    };

    return (
        <div className="min-h-screen bg-black/95 text-foreground p-8 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            {/* Navbar */}
            <Navbar />


            <div className="z-10 w-full max-w-6xl flex flex-col items-center gap-12 pt-20">
                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-white to-white/50 bg-clip-text text-transparent">
                        Cube Solver
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-xl mx-auto">
                        Paint your cube's colors onto the net below. Ensure the orientation matches.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-16 items-center justify-center w-full">
                    {/* Left: Controls */}
                    <div className="flex flex-col gap-8 order-2 lg:order-1">
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorSelect={setSelectedColor}
                        />

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handeReset}
                                className="w-full border-white/10 hover:bg-white/5 hover:text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSolve}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                            >
                                <Play className="w-4 h-4 mr-2" />
                                Solve Cube
                            </Button>
                        </div>
                    </div>

                    {/* Right: Cube Net */}
                    <div className="order-1 lg:order-2 scale-110 lg:scale-125 transform origin-center">
                        <CubeNet
                            cubeState={cubeState}
                            onStickerClick={handleStickerClick}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

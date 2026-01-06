'use client';

import React, { useState } from 'react';
import { CubeNet, CubeState, FaceKey } from '@/components/solver/CubeNet';
import { ColorPicker, CubeColor } from '@/components/solver/ColorPicker';
import { Button } from '@/components/ui/button';
import { RotateCcw, Play } from 'lucide-react';
import Navbar from '@/components/Navbar';


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
    const [solution, setSolution] = useState<string[]>([]);
    const [isSolving, setIsSolving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStickerClick = (face: FaceKey, index: number) => {
        setCubeState(prev => ({
            ...prev,
            [face]: prev[face].map((c, i) => i === index ? selectedColor : c)
        }));
    };

    const handeReset = () => {
        setCubeState(initialCubeState);
        setSolution([]);
        setError(null);
    };

    const handleSolve = async () => {
        setIsSolving(true);
        setError(null);
        setSolution([]);
        try {
            const response = await fetch('http://localhost:7777/solve', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(cubeState),
            });

            const data = await response.json();

            if (!response.ok || !data.valid) {
                throw new Error(data.error || 'Failed to solve cube');
            }

            if (data.solution) {
                setSolution(data.solution);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred');
        } finally {
            setIsSolving(false);
        }
    };

    return (
        <div className="min-h-screen bg-black/95 text-foreground p-8 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
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
                    <div className="flex flex-col gap-8 order-2 lg:order-1 min-w-[300px]">
                        <ColorPicker
                            selectedColor={selectedColor}
                            onColorSelect={setSelectedColor}
                        />

                        {error && (
                            <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center">
                                {error}
                            </div>
                        )}

                        {solution.length > 0 && (
                            <div className="p-6 bg-primary/5 border border-primary/10 rounded-xl space-y-3">
                                <h3 className="text-lg font-semibold text-primary">Solution Found!</h3>
                                <div className="flex flex-wrap gap-2">
                                    {solution.map((move, i) => (
                                        <span key={i} className="px-3 py-1 bg-white/5 rounded-md font-mono font-bold text-white/80">
                                            {move}
                                        </span>
                                    ))}
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    {solution.length} moves • Follow sequence L to R
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 justify-center">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={handeReset}
                                disabled={isSolving}
                                className="w-full border-white/10 hover:bg-white/5 hover:text-white"
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                Reset
                            </Button>
                            <Button
                                size="lg"
                                onClick={handleSolve}
                                disabled={isSolving}
                                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25"
                            >
                                {isSolving ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                        Solving...
                                    </div>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Solve Cube
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>

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

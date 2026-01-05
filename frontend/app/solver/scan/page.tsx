import React from 'react';
import Navbar from '@/components/Navbar';
import { Camera, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function ScanPage() {
    return (
        <div className="min-h-screen bg-black/95 text-foreground flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Ambient Glow */}
            <div className="absolute top-[20%] left-[20%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

            <Navbar />

            <div className="z-10 text-center space-y-6 max-w-lg px-6">
                <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                        <Camera className="w-10 h-10 text-white/50" />
                    </div>
                </div>

                <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Camera Scan
                </h1>

                <p className="text-muted-foreground text-lg">
                    This feature is currently under development. Soon you'll be able to scan your cube directly with your camera!
                </p>

                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3 text-left">
                    <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                    <p className="text-yellow-200/80 text-sm">
                        For now, please use the <strong>Manual Input</strong> mode to solve your cube.
                    </p>
                </div>

                <div className="pt-4">
                    <Button asChild className="bg-white text-black hover:bg-neutral-200">
                        <Link href="/solver/manual">
                            Go to Manual Input
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}

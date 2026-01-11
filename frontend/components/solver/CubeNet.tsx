import React from 'react';
import { cn } from '@/lib/utils';
import { CubeColor } from './ColorPicker';


export type FaceKey = 'U' | 'R' | 'F' | 'D' | 'L' | 'B';

export type CubeState = Record<FaceKey, CubeColor[]>;

interface CubeNetProps {
    cubeState: CubeState;
    onStickerClick: (face: FaceKey, index: number) => void;
}

const colorMap: Record<CubeColor, string> = {
    white: 'bg-white',
    yellow: 'bg-yellow-400',
    red: 'bg-red-600',
    orange: 'bg-orange-500',
    blue: 'bg-blue-600',
    green: 'bg-green-600',
};

const FaceGrid = ({
    face,
    colors,
    onStickerClick
}: {
    face: FaceKey;
    colors: CubeColor[];
    onStickerClick: (face: FaceKey, index: number) => void;
}) => {
    return (
        <div className="grid grid-cols-3 gap-1 p-1 bg-black/20 rounded-md border border-white/5 backdrop-blur-sm">
            {colors.map((color, idx) => (
                <button
                    key={`${face}-${idx}`}
                    onClick={() => onStickerClick(face, idx)}
                    className={cn(
                        "w-8 h-8 sm:w-10 sm:h-10 rounded-sm transition-all duration-200 hover:opacity-90 hover:scale-105 active:scale-95",
                        colorMap[color],
                        "border border-white/10 shadow-sm"
                    )}
                    aria-label={`Face ${face} sticker ${idx}`}
                />
            ))}

            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-black/50 drop-shadow-md uppercase">{face}</span>
            </div>
        </div>
    );
};

export function CubeNet({ cubeState, onStickerClick }: CubeNetProps) {

    return (
        <div className="flex flex-col items-center gap-2 p-4 animate-in fade-in zoom-in duration-500">
            {/* Row 1: U (Top) */}
            <div className="grid grid-cols-4 gap-2">
                <div className="col-start-2">
                    <FaceGrid face="U" colors={cubeState.U} onStickerClick={onStickerClick} />
                </div>
            </div>

            {/* Row 2: L, F, R, B (The standard 4-face row) */}
            <div className="grid grid-cols-4 gap-2">
                <FaceGrid face="L" colors={cubeState.L} onStickerClick={onStickerClick} />
                <FaceGrid face="F" colors={cubeState.F} onStickerClick={onStickerClick} />
                <FaceGrid face="R" colors={cubeState.R} onStickerClick={onStickerClick} />
                <FaceGrid face="B" colors={cubeState.B} onStickerClick={onStickerClick} />
            </div>

            {/* Row 3: D (Bottom) */}
            <div className="grid grid-cols-4 gap-2">
                <div className="col-start-2">
                    <FaceGrid face="D" colors={cubeState.D} onStickerClick={onStickerClick} />
                </div>
            </div>

            <div className="text-xs text-neutral-500 mt-4 flex gap-4 font-mono">
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-white" /> WHITE (Top)</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-600" /> GREEN (Front)</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 bg-yellow-400" /> YELLOW (Bottom)</span>
            </div>
        </div>
    );
}

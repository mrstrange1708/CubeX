import React from 'react';
import { cn } from '@/lib/utils';
import { CubeColor } from './ColorPicker';

// Type for the entire cube state: 6 faces * 9 stickers = 54 blocks
// We can index them by face and index 0-8, or a flat array.
// For the net, structured by Face is easier.
// Faces: U (Up), R (Right), F (Front), D (Down), L (Left), B (Back)
// Standard color scheme request:
// U: White, D: Yellow, F: Green, B: Blue, R: Red, L: Orange

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
            {/* Center label for debugging/clarity - optional */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 hover:opacity-100 transition-opacity">
                <span className="text-xs font-bold text-black/50 drop-shadow-md uppercase">{face}</span>
            </div>
        </div>
    );
};

export function CubeNet({ cubeState, onStickerClick }: CubeNetProps) {
    // Standard 2D Net Layout (Cross)
    //       U
    //     L F R B
    //       D

    return (
        <div className="flex flex-col items-center gap-2 p-4 animate-in fade-in zoom-in duration-500">
            {/* Top Row: U */}
            <div className="grid grid-cols-4 gap-2">
                <div className="col-start-2">
                    <FaceGrid face="U" colors={cubeState.U} onStickerClick={onStickerClick} />
                </div>
            </div>

            {/* Middle Row: L, F, R, B */}
            <div className="grid grid-cols-4 gap-2">
                <FaceGrid face="L" colors={cubeState.L} onStickerClick={onStickerClick} />
                <FaceGrid face="F" colors={cubeState.F} onStickerClick={onStickerClick} />
                <FaceGrid face="R" colors={cubeState.R} onStickerClick={onStickerClick} />
                <FaceGrid face="B" colors={cubeState.B} onStickerClick={onStickerClick} />
            </div>

            {/* Bottom Row: D */}
            <div className="grid grid-cols-4 gap-2">
                <div className="col-start-2">
                    <FaceGrid face="D" colors={cubeState.D} onStickerClick={onStickerClick} />
                </div>
            </div>
        </div>
    );
}

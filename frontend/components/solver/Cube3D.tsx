"use client";

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, PerspectiveCamera, Float } from '@react-three/drei';
import * as THREE from 'three';
import { Play, RotateCcw, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

import { CubeState } from './CubeNet';

const COLORS = {
    U: '#FFFFFF', // White
    D: '#FFFF00', // Yellow
    F: '#22C55E', // Green
    B: '#2563EB', // Blue
    L: '#F97316', // Orange
    R: '#DC2626', // Red
    G: '#111111', // Dark Gray (internal)
};

const COLOR_VALS: Record<string, string> = {
    white: '#FFFFFF',
    yellow: '#FFFF00',
    green: '#22C55E',
    blue: '#2563EB',
    orange: '#F97316',
    red: '#DC2626',
};

interface MoveConfig {
    axis: 'x' | 'y' | 'z';
    layer: number; // -1, 0, or 1
    angle: number; // Math.PI / 2 or -Math.PI / 2
}

const MOVE_MAP: Record<string, MoveConfig> = {
    'U': { axis: 'y', layer: 1, angle: -Math.PI / 2 },
    "U'": { axis: 'y', layer: 1, angle: Math.PI / 2 },
    'U2': { axis: 'y', layer: 1, angle: -Math.PI },
    "U2'": { axis: 'y', layer: 1, angle: Math.PI },
    'D': { axis: 'y', layer: -1, angle: Math.PI / 2 },
    "D'": { axis: 'y', layer: -1, angle: -Math.PI / 2 },
    'D2': { axis: 'y', layer: -1, angle: Math.PI },
    "D2'": { axis: 'y', layer: -1, angle: -Math.PI },
    'L': { axis: 'x', layer: -1, angle: Math.PI / 2 },
    "L'": { axis: 'x', layer: -1, angle: -Math.PI / 2 },
    'L2': { axis: 'x', layer: -1, angle: Math.PI },
    "L2'": { axis: 'x', layer: -1, angle: -Math.PI },
    'R': { axis: 'x', layer: 1, angle: -Math.PI / 2 },
    "R'": { axis: 'x', layer: 1, angle: Math.PI / 2 },
    'R2': { axis: 'x', layer: 1, angle: -Math.PI },
    "R2'": { axis: 'x', layer: 1, angle: Math.PI },
    'F': { axis: 'z', layer: 1, angle: -Math.PI / 2 },
    "F'": { axis: 'z', layer: 1, angle: Math.PI / 2 },
    'F2': { axis: 'z', layer: 1, angle: -Math.PI },
    "F2'": { axis: 'z', layer: 1, angle: Math.PI },
    'B': { axis: 'z', layer: -1, angle: Math.PI / 2 },
    "B'": { axis: 'z', layer: -1, angle: -Math.PI / 2 },
    'B2': { axis: 'z', layer: -1, angle: Math.PI },
    "B2'": { axis: 'z', layer: -1, angle: -Math.PI },
};

function getInverseMove(move: string): string {
    if (move.endsWith("'")) return move.slice(0, -1);
    if (move.endsWith("2")) return move + "'";
    return move + "'";
}

function Sticker({ position, rotation, color }: { position: THREE.Vector3, rotation: THREE.Euler, color: string }) {
    return (
        <mesh position={position} rotation={rotation}>
            <boxGeometry args={[0.85, 0.85, 0.02]} />
            <meshStandardMaterial
                color={color}
                roughness={0.1}
                metalness={0.5}
                emissive={color}
                emissiveIntensity={0.1}
            />
        </mesh>
    );
}

function Cubelet({ pos, colors }: { pos: THREE.Vector3, colors: any }) {
    return (
        <group position={pos}>
            {/* Main Core */}
            <RoundedBox args={[0.98, 0.98, 0.98]} radius={0.05} smoothness={4}>
                <meshStandardMaterial color="#050505" roughness={0.3} metalness={0.8} />
            </RoundedBox>

            {/* Stickers */}
            {colors.top !== COLORS.G && <Sticker position={new THREE.Vector3(0, 0.49, 0)} rotation={new THREE.Euler(-Math.PI / 2, 0, 0)} color={colors.top} />}
            {colors.bottom !== COLORS.G && <Sticker position={new THREE.Vector3(0, -0.49, 0)} rotation={new THREE.Euler(Math.PI / 2, 0, 0)} color={colors.bottom} />}
            {colors.front !== COLORS.G && <Sticker position={new THREE.Vector3(0, 0, 0.49)} rotation={new THREE.Euler(0, 0, 0)} color={colors.front} />}
            {colors.back !== COLORS.G && <Sticker position={new THREE.Vector3(0, 0, -0.49)} rotation={new THREE.Euler(0, Math.PI, 0)} color={colors.back} />}
            {colors.left !== COLORS.G && <Sticker position={new THREE.Vector3(-0.49, 0, 0)} rotation={new THREE.Euler(0, -Math.PI / 2, 0)} color={colors.left} />}
            {colors.right !== COLORS.G && <Sticker position={new THREE.Vector3(0.49, 0, 0)} rotation={new THREE.Euler(0, Math.PI / 2, 0)} color={colors.right} />}
        </group>
    );
}

function AnimatedCube({ moves, currentMove, initialState, animationSpeed = 0.2, onFinishMove }: {
    moves: string[],
    currentMove: number,
    initialState?: CubeState,
    animationSpeed?: number,
    onFinishMove?: () => void
}) {
    const groupRef = useRef<THREE.Group>(null);
    const pivotRef = useRef<THREE.Group>(null);
    const [internalIdx, setInternalIdx] = useState(-1);
    const [activeAnim, setActiveAnim] = useState<MoveConfig | null>(null);
    const progress = useRef(0);

    const cubelets = useMemo(() => {
        const items = [];
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    const colors = {
                        top: COLORS.G,
                        bottom: COLORS.G,
                        front: COLORS.G,
                        back: COLORS.G,
                        left: COLORS.G,
                        right: COLORS.G,
                    };

                    if (!initialState) {
                        if (y === 1) colors.top = COLORS.U;
                        if (y === -1) colors.bottom = COLORS.D;
                        if (z === 1) colors.front = COLORS.F;
                        if (z === -1) colors.back = COLORS.B;
                        if (x === -1) colors.left = COLORS.L;
                        if (x === 1) colors.right = COLORS.R;
                    } else {
                        if (y === 1) colors.top = COLOR_VALS[initialState.U[(z + 1) * 3 + (x + 1)]] || COLORS.G;
                        if (y === -1) colors.bottom = COLOR_VALS[initialState.D[(1 - z) * 3 + (x + 1)]] || COLORS.G;
                        if (z === 1) colors.front = COLOR_VALS[initialState.F[(1 - y) * 3 + (x + 1)]] || COLORS.G;
                        if (z === -1) colors.back = COLOR_VALS[initialState.B[(1 - y) * 3 + (1 - x)]] || COLORS.G;
                        if (x === -1) colors.left = COLOR_VALS[initialState.L[(1 - y) * 3 + (z + 1)]] || COLORS.G;
                        if (x === 1) colors.right = COLOR_VALS[initialState.R[(1 - y) * 3 + (1 - z)]] || COLORS.G;
                    }

                    items.push({
                        id: `${x},${y},${z}`,
                        pos: new THREE.Vector3(x, y, z),
                        colors
                    });
                }
            }
        }
        return items;
    }, [initialState]);

    useEffect(() => {
        if (activeAnim) return; // Wait for current animation

        if (currentMove > internalIdx) {
            // Forward
            const move = moves[internalIdx + 1];
            const config = MOVE_MAP[move];
            if (config && groupRef.current && pivotRef.current) {
                pivotRef.current.rotation.set(0, 0, 0);
                pivotRef.current.updateMatrixWorld();

                const toRotate: THREE.Object3D[] = [];
                groupRef.current.children.forEach(c => {
                    const worldPos = new THREE.Vector3();
                    c.getWorldPosition(worldPos);
                    if (Math.round(worldPos[config.axis]) === config.layer) toRotate.push(c);
                });

                toRotate.forEach(obj => pivotRef.current?.attach(obj));
                setActiveAnim(config);
                progress.current = 0;
                setInternalIdx(prev => prev + 1);
            }
        } else if (currentMove < internalIdx) {
            // Backward
            const move = moves[internalIdx];
            const invMove = getInverseMove(move);
            const config = MOVE_MAP[invMove];
            if (config && groupRef.current && pivotRef.current) {
                pivotRef.current.rotation.set(0, 0, 0);
                pivotRef.current.updateMatrixWorld();

                const toRotate: THREE.Object3D[] = [];
                groupRef.current.children.forEach(c => {
                    const worldPos = new THREE.Vector3();
                    c.getWorldPosition(worldPos);
                    if (Math.round(worldPos[config.axis]) === config.layer) toRotate.push(c);
                });

                toRotate.forEach(obj => pivotRef.current?.attach(obj));
                setActiveAnim(config);
                progress.current = 0;
                setInternalIdx(prev => prev - 1);
            }
        }
    }, [currentMove, internalIdx, moves, activeAnim]);

    useFrame(() => {
        if (activeAnim && pivotRef.current && groupRef.current) {
            const { axis, angle } = activeAnim;
            const step = angle * animationSpeed;
            pivotRef.current.rotation[axis] += step;
            progress.current += Math.abs(step);

            if (progress.current >= Math.abs(angle)) {
                pivotRef.current.rotation[axis] = angle;
                pivotRef.current.updateMatrixWorld();

                const detached: THREE.Object3D[] = [];
                pivotRef.current.children.slice().forEach(obj => detached.push(obj));
                detached.forEach(obj => groupRef.current?.attach(obj));

                setActiveAnim(null);
                if (onFinishMove) onFinishMove();
            }
        }
    });

    return (
        <>
            <group ref={groupRef}>
                {cubelets.map(c => <Cubelet key={c.id} pos={c.pos} colors={c.colors} />)}
            </group>
            <group ref={pivotRef} />
        </>
    );
}

export default function Cube3D({ moves = [], currentMove = -1, initialState, showScramble = true }: {
    moves?: string[],
    currentMove?: number,
    initialState?: CubeState,
    showScramble?: boolean
}) {
    const [scrambleMoves, setScrambleMoves] = useState<string[]>([]);
    const [isScrambling, setIsScrambling] = useState(false);
    const [totalMoves, setTotalMoves] = useState<string[]>([]);
    const [activeIdx, setActiveIdx] = useState(-1);

    useEffect(() => {
        setTotalMoves([...scrambleMoves, ...moves]);
        if (currentMove >= 0) {
            setActiveIdx(scrambleMoves.length + currentMove);
        } else {
            setActiveIdx(scrambleMoves.length - 1);
        }
    }, [moves, scrambleMoves, currentMove]);

    const handleScramble = () => {
        if (isScrambling) return;
        const basic = ['U', 'D', 'L', 'R', 'F', 'B'];
        const suffixes = ['', "'", '2'];
        const newMoves = Array.from({ length: 15 }, () => {
            const face = basic[Math.floor(Math.random() * basic.length)];
            const suffix = suffixes[Math.floor(Math.random() * suffixes.length)];
            return face + suffix;
        });
        setScrambleMoves(prev => [...prev, ...newMoves]);
        setIsScrambling(true);
    };

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="w-full h-[550px] relative bg-gradient-to-b from-neutral-950 to-neutral-900 rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                <Canvas shadows gl={{ antialias: true, stencil: true }}>
                    <PerspectiveCamera makeDefault position={[7, 7, 7]} fov={40} />
                    <OrbitControls enablePan={false} minDistance={5} maxDistance={15} makeDefault />

                    <ambientLight intensity={1.5} />
                    <pointLight position={[10, 10, 10]} intensity={2.5} />
                    <pointLight position={[-10, -10, -10]} intensity={1.5} color="#2563EB" />
                    <spotLight position={[0, 10, 0]} angle={0.3} penumbra={1} intensity={3} castShadow />

                    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.5}>
                        <AnimatedCube
                            moves={totalMoves}
                            currentMove={activeIdx}
                            initialState={initialState}
                            animationSpeed={isScrambling ? 0.3 : 0.15}
                            onFinishMove={() => {
                                if (activeIdx === totalMoves.length - 1) setIsScrambling(false);
                            }}
                        />
                    </Float>
                </Canvas>

                {/* Premium Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    <div className="px-4 py-1.5 bg-blue-500/10 backdrop-blur-xl rounded-full border border-blue-500/20 flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Quantum Render</span>
                    </div>
                    <div className="px-4 py-1.5 bg-white/5 backdrop-blur-xl rounded-full border border-white/10 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest">System Ready</span>
                    </div>
                </div>

                {/* Current Move Indicator */}
                {activeIdx >= 0 && activeIdx < totalMoves.length && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Executing Move</span>
                        <div className="min-w-[80px] h-16 bg-white/5 backdrop-blur-3xl rounded-2xl border border-white/10 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                            <span className="text-4xl font-black text-white tracking-tighter">
                                {totalMoves[activeIdx]}
                            </span>
                        </div>
                    </div>
                )}

                <div className="absolute bottom-6 right-6 flex gap-3">
                    {showScramble && (
                        <Button
                            onClick={handleScramble}
                            disabled={isScrambling}
                            className="h-12 px-6 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md text-white font-bold group transition-all"
                        >
                            <RotateCcw className={`w-4 h-4 mr-2 group-hover:rotate-180 transition-transform duration-500 ${isScrambling ? 'animate-spin' : ''}`} />
                            Scramble
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

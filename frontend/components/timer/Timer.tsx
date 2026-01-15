"use client";

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import CircularTimer from './CircularTimer';

interface TimerProps {
    onStart?: () => void;
    onStop?: (time: number) => void;
    className?: string;
    isScrambled?: boolean;
    percentile?: number | null;
}

type TimerState = 'IDLE' | 'HOLDING' | 'READY' | 'RUNNING' | 'STOPPED';

export default function Timer({ onStart, onStop, className, isScrambled = false, percentile }: TimerProps) {
    const [time, setTime] = useState(0);
    const [state, setState] = useState<TimerState>('IDLE');

    // Refs for mutable values accessed in stable listeners
    const stateRef = useRef<TimerState>('IDLE');
    const onStartRef = useRef(onStart);
    const onStopRef = useRef(onStop);

    // Animation Refs
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const holdStartRef = useRef<number>(0);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Sync Props/State to Refs
    useEffect(() => { stateRef.current = state; }, [state]);
    useEffect(() => { onStartRef.current = onStart; }, [onStart]);
    useEffect(() => { onStopRef.current = onStop; }, [onStop]);

    // Animation Loop (Stable)
    const animate = useCallback(() => {
        const now = performance.now();
        setTime(now - startTimeRef.current);
        requestRef.current = requestAnimationFrame(animate);
    }, []);

    // Keyboard Listeners (Stable, attached once)
    useEffect(() => {
        const handleDown = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                e.preventDefault();
                if (e.repeat) return; // Prevent key repeat from resetting hold timer

                const currentState = stateRef.current; // Read fresh state from ref

                if (currentState === 'RUNNING') {
                    // Stop Logic
                    cancelAnimationFrame(requestRef.current);
                    const finalTime = performance.now() - startTimeRef.current;
                    setTime(finalTime);
                    setState('STOPPED');
                    if (onStopRef.current) onStopRef.current(finalTime);
                } else if (currentState === 'IDLE' || currentState === 'STOPPED') {
                    // Start Hold Logic
                    setState('HOLDING');
                    holdStartRef.current = Date.now();

                    // Wait 300ms to become READY
                    timeoutRef.current = setTimeout(() => {
                        setState('READY');
                    }, 300);
                }
            }
        };

        const handleUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                const currentState = stateRef.current; // Read fresh state from ref

                if (currentState === 'READY') {
                    // Start Logic
                    startTimeRef.current = performance.now();
                    setState('RUNNING');
                    requestRef.current = requestAnimationFrame(animate);
                    if (onStartRef.current) onStartRef.current();
                } else if (currentState === 'HOLDING') {
                    // Released too early (Reset)
                    setState('IDLE');
                    if (timeoutRef.current) clearTimeout(timeoutRef.current);
                } else if (currentState === 'STOPPED') {
                    // Reset to Idle
                    setState('IDLE');
                    setTime(0);
                }
            }
        };

        window.addEventListener('keydown', handleDown);
        window.addEventListener('keyup', handleUp);

        // Cleanup
        return () => {
            window.removeEventListener('keydown', handleDown);
            window.removeEventListener('keyup', handleUp);
            cancelAnimationFrame(requestRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [animate]); // animate is stable

    return (
        <div className={cn("flex flex-col items-center justify-center select-none", className)}>
            <CircularTimer time={time} state={state} percentile={percentile} />
        </div>
    );
}

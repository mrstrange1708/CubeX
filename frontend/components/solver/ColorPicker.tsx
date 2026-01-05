import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export type CubeColor = 'white' | 'yellow' | 'red' | 'orange' | 'blue' | 'green';

interface ColorPickerProps {
    selectedColor: CubeColor;
    onColorSelect: (color: CubeColor) => void;
}

const colors: { value: CubeColor; label: string; class: string }[] = [
    { value: 'white', label: 'White', class: 'bg-white' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-400' },
    { value: 'red', label: 'Red', class: 'bg-red-600' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-600' },
    { value: 'green', label: 'Green', class: 'bg-green-600' },
];

export function ColorPicker({ selectedColor, onColorSelect }: ColorPickerProps) {
    return (
        <div className="flex flex-col items-center gap-4 p-6 bg-card rounded-2xl border border-border/5 shadow-xl backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground/80 tracking-tight">Select Color</h3>
            <div className="flex gap-3 flex-wrap justify-center">
                {colors.map((color) => (
                    <button
                        key={color.value}
                        onClick={() => onColorSelect(color.value)}
                        className={cn(
                            "w-12 h-12 rounded-xl transition-all duration-300 transform hover:scale-110 focus:outline-none ring-2 ring-transparent ring-offset-2 ring-offset-background",
                            color.class,
                            selectedColor === color.value && "ring-primary scale-110 shadow-lg shadow-primary/20"
                        )}
                        aria-label={`Select ${color.label}`}
                    >
                        {selectedColor === color.value && (
                            <Check className={cn(
                                "w-6 h-6 mx-auto",
                                color.value === 'white' || color.value === 'yellow' ? "text-black" : "text-white"
                            )} />
                        )}
                        <span className="sr-only">{color.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}

"use client";

import React, { useState } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { NOTES_SHARP, type Note, getIslandsNodes } from "@/lib/music";
import { ArrowLeft, Settings2, Map as MapIcon, Music2 } from "lucide-react";
import Link from "next/link";

export default function FretboardPage() {
    const [rootNote, setRootNote] = useState<Note | null>("A"); // Default to A to match lesson
    const [viewMode, setViewMode] = useState<'intervals' | 'notes' | 'islands'>('intervals');

    const islandNodes = (viewMode === 'islands' && rootNote) ? getIslandsNodes(rootNote) : [];

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Header */}
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                        <Music2 className="w-6 h-6 text-primary" />
                        The Fretboard Mapper
                    </h1>
                </div>
                <button className="p-2 hover:bg-white/5 rounded-full">
                    <Settings2 className="w-5 h-5 opacity-70" />
                </button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col p-6 gap-8 overflow-hidden h-full relative">

                {/* Controls */}
                <div className="flex flex-wrap items-center gap-6 p-4 bg-zinc-900/80 backdrop-blur border border-white/5 rounded-2xl shadow-xl z-10 w-fit mx-auto">
                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest pl-1">Root Key</span>
                        <div className="flex gap-1 flex-wrap justify-center">
                            {NOTES_SHARP.map(note => (
                                <button
                                    key={note}
                                    onClick={() => setRootNote(rootNote === note ? null : note)}
                                    className={`
                                w-8 h-8 rounded-lg text-xs font-bold transition-all relative overflow-hidden
                                ${rootNote === note
                                            ? "bg-primary text-black shadow-lg scale-110 z-10 ring-2 ring-primary ring-offset-2 ring-offset-zinc-900"
                                            : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"}
                            `}
                                >
                                    {note}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="h-10 w-px bg-white/10 hidden md:block" />

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-widest pl-1">Visualization</span>
                        <div className="flex gap-2 bg-zinc-950/50 p-1 rounded-xl border border-white/5">
                            <button
                                onClick={() => setViewMode('intervals')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'intervals' ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Intervals
                            </button>
                            <button
                                onClick={() => setViewMode('notes')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${viewMode === 'notes' ? "bg-zinc-800 text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                Note Names
                            </button>
                            <button
                                onClick={() => setViewMode('islands')}
                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'islands' ? "bg-secondary text-white shadow-md" : "text-zinc-500 hover:text-zinc-300"}`}
                            >
                                <MapIcon className="w-3 h-3" />
                                Islands (R-3-5)
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fretboard Container */}
                <div className="flex-1 flex flex-col justify-center items-center overflow-auto min-h-[300px]">
                    <Fretboard
                        rootNote={rootNote}
                        showIntervals={viewMode === 'intervals' || viewMode === 'islands'}
                        showNotes={viewMode === 'notes'}
                        selectedNotes={viewMode === 'islands' ? islandNodes : []}
                        tuning={["E", "A", "D", "G", "B", "E"]}
                        frets={17}
                    />

                    {/* Dynamic Helper Text */}
                    <div className="mt-8 h-8 text-center">
                        {viewMode === 'islands' && rootNote && (
                            <p className="text-secondary animate-pulse font-medium text-sm">
                                Highlighting Octave Centers for {rootNote}: Showing Roots, 3rds, and 5ths (Shells).
                            </p>
                        )}
                    </div>
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-8 pb-4 text-[10px] font-bold uppercase tracking-wider text-zinc-500 bg-zinc-950/80 p-4 rounded-full border border-white/5 w-fit mx-auto backdrop-blur-md">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--interval-root)] shadow-sm" /> Root
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--interval-3)] shadow-sm" /> 3rd (Emotion)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--interval-5)] shadow-sm" /> 5th (Stability)
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-[var(--interval-7)] shadow-sm" /> 7th (Tension)
                    </div>
                </div>

            </main>
        </div>
    );
}

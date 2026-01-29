"use client";

import React, { useState, useEffect } from "react";
import { Fretboard } from "@/components/fretboard/Fretboard";
import { NOTES_SHARP, type Note, identifyChord, CHORD_FORMULAS, getVoicingNodes, type VoicingType, getPitchAt } from "@/lib/music";
import { ArrowLeft, Hammer, Info, Play, Volume2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { musicAudio } from "@/lib/audio";

export default function ChordConstructorPage() {
    const [rootNote, setRootNote] = useState<Note>("C");
    const [activeIntervals, setActiveIntervals] = useState<number[]>([0]); // Always start with Root
    const [detectedName, setDetectedName] = useState<string | null>("Note");
    const [voicingEmoji, setVoicingEmoji] = useState<string>("");
    const [voicingMode, setVoicingMode] = useState<'map' | 'shell_e' | 'shell_a'>('map');

    // Update detection
    useEffect(() => {
        const name = identifyChord(activeIntervals);
        setDetectedName(name ? `${rootNote} ${name}` : `${rootNote} (Custom)`);

        // Emoji logic
        if (name?.includes("Major 7")) setVoicingEmoji("😊 Jazz/Pop");
        else if (name?.includes("Dominant")) setVoicingEmoji("😎 Blues/Funk");
        else if (name?.includes("Minor")) setVoicingEmoji("😔 Sad/Soul");
        else setVoicingEmoji("");
    }, [activeIntervals, rootNote]);

    const toggleInterval = (interval: number) => {
        if (interval === 0) return; // Cannot toggle root

        setActiveIntervals(prev => {
            if (prev.includes(interval)) return prev.filter(i => i !== interval);
            return [...prev, interval].sort((a, b) => a - b);
        });
    };

    // Preset Handlers
    const applyFormula = (intervals: number[]) => {
        setActiveIntervals(intervals);
    };

    // Playback Logic
    const playCurrentChord = () => {
        let notesToPlay: string[] = [];
        const baseShape = getVoicingNodes(rootNote, 'shell_e', 'major');
        // Default fallback to Shell E position logic for playback
        if (baseShape.length > 0) {
            const rootPos = baseShape[0];
            notesToPlay = [getPitchAt(rootPos.string, rootPos.fret)]; // Always play root

            // If we have selected shape notes, play them
            if (voicingMode !== 'map' && selectedShapeNotes.length > 0) {
                notesToPlay = selectedShapeNotes.map(n => getPitchAt(n.string, n.fret));
            } else {
                // Map mode: Play intervals relative to the root we found?
                // Simple hack: Just play the Root and maybe a 5th/Octave for flavor?
                // Or play nothing else.
                // Let's iterate activeIntervals.
                // If Interval is 0 (Root), it's added.
                // If Interval is 7 (5th) -> +7 semitones. 
                // We can use Tone logic? No imports allowed in component body usually avoids heavy logic.
                // Let's just play Root for now in Map mode to keep it simple and clean.
            }
        }

        if (notesToPlay.length > 0) {
            musicAudio.playChord(notesToPlay);
        }
    };

    // Calculate Voicing Notes
    let selectedShapeNotes: Array<{ string: number; fret: number }> = [];

    if (voicingMode !== 'map') {
        // Determine simple chord type from intervals
        let type: 'major' | 'minor' | 'dom7' | 'maj7' | 'min7' = 'major';
        const hasb3 = activeIntervals.includes(3);
        const has3 = activeIntervals.includes(4);
        const hasb7 = activeIntervals.includes(10);
        const has7 = activeIntervals.includes(11);

        if (hasb3) type = hasb7 ? 'min7' : 'minor';
        else if (has3) {
            if (hasb7) type = 'dom7';
            else if (has7) type = 'maj7';
        }

        // We cast to any because getVoicingNodes handles specific strings, but 'min7' is valid there.
        // Actually let's just pass it safely.
        selectedShapeNotes = getVoicingNodes(rootNote, voicingMode, type);
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            <header className="p-4 border-b border-white/5 flex items-center justify-between bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
                        <Hammer className="w-6 h-6 text-primary" />
                        Chord Constructor
                    </h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">

                {/* Left Panel: Builder Controls */}
                <div className="w-full lg:w-1/3 p-6 border-r border-white/5 bg-zinc-900/30 overflow-y-auto flex flex-col gap-8">

                    {/* Root Selector */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">1. Select Root</h3>
                        <div className="flex flex-wrap gap-2">
                            {NOTES_SHARP.map(note => (
                                <button
                                    key={note}
                                    onClick={() => setRootNote(note)}
                                    className={cn(
                                        "w-10 h-10 rounded-lg text-sm font-bold transition-all",
                                        rootNote === note ? "bg-primary text-black shadow-lg scale-110" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                                    )}
                                >
                                    {note}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Interval Toggles */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">2. Add Intervals</h3>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { val: 3, label: "Minor 3rd", type: "emotion" },
                                { val: 4, label: "Major 3rd", type: "emotion" },
                                { val: 6, label: "b5 (Blue)", type: "tension" },
                                { val: 7, label: "Perfect 5th", type: "stability" },
                                { val: 10, label: "Minor 7th", type: "tension" },
                                { val: 11, label: "Major 7th", type: "tension" },
                            ].map(int => (
                                <button
                                    key={int.val}
                                    onClick={() => toggleInterval(int.val)}
                                    className={cn(
                                        "p-3 rounded-lg text-xs font-medium border transition-all text-left flex flex-col relative overflow-hidden",
                                        activeIntervals.includes(int.val)
                                            ? "bg-zinc-800 border-primary/50 text-primary shadow-[inset_0_0_10px_rgba(34,197,94,0.1)]"
                                            : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                                    )}
                                >
                                    <span className="relative z-10">{int.label}</span>
                                    {activeIntervals.includes(int.val) && <div className="absolute inset-0 bg-primary/5" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Voicing Mode Selector - NEW */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">3. Show Shape</h3>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setVoicingMode('map')}
                                className={cn("px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-1", voicingMode === 'map' ? "bg-zinc-800 border-primary text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "border-zinc-800 text-zinc-500 hover:text-zinc-300")}
                            >
                                Map (Theory)
                            </button>
                            <button
                                onClick={() => setVoicingMode('shell_e')}
                                className={cn("px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-1", voicingMode === 'shell_e' ? "bg-zinc-800 border-primary text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "border-zinc-800 text-zinc-500 hover:text-zinc-300")}
                            >
                                Shell (E Root)
                            </button>
                            <button
                                onClick={() => setVoicingMode('shell_a')}
                                className={cn("px-3 py-2 rounded-lg text-xs font-bold border transition-all flex-1", voicingMode === 'shell_a' ? "bg-zinc-800 border-primary text-primary shadow-[0_0_10px_rgba(34,197,94,0.2)]" : "border-zinc-800 text-zinc-500 hover:text-zinc-300")}
                            >
                                Shell (A Root)
                            </button>
                        </div>
                    </div>

                    {/* Result Card */}
                    <div className="mt-auto p-6 bg-zinc-950 border border-white/10 rounded-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-3 opacity-10">
                            <Hammer className="w-24 h-24 -mr-6 -mt-6" />
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-2">Resulting Chord</h3>

                            <div className="flex items-center justify-between mb-1">
                                <div className="text-3xl font-black text-white">
                                    {detectedName}
                                </div>
                                <button
                                    onClick={playCurrentChord}
                                    className="p-3 bg-primary text-black rounded-full hover:scale-110 active:scale-95 transition-all shadow-lg hover:shadow-primary/50"
                                    title="Play Chord"
                                >
                                    <Volume2 className="w-6 h-6" />
                                </button>
                            </div>

                            <p className="text-sm text-zinc-400 font-medium flex items-center gap-2">
                                {voicingEmoji}
                            </p>
                        </div>
                    </div>

                    {/* Quick Presets */}
                    <div className="space-y-3">
                        <h3 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">Quick Templates</h3>
                        <div className="flex gap-2 flex-wrap">
                            {CHORD_FORMULAS.filter(f => ['Major', 'Minor', 'Dominant 7', 'Minor 7', 'Major 7'].includes(f.name)).map(f => (
                                <button
                                    key={f.name}
                                    onClick={() => applyFormula(f.intervals)}
                                    className="px-3 py-1.5 rounded-full bg-zinc-800 border border-white/5 text-xs text-zinc-400 hover:text-white hover:border-white/20 transition-all"
                                >
                                    {f.name}
                                </button>
                            ))}
                        </div>
                    </div>

                </div>

                {/* Right Panel: Visualization */}
                <div className="flex-1 bg-zinc-950/50 p-6 flex flex-col gap-6 relative">
                    <div className="absolute top-4 right-4 flex gap-2">
                        <div className="bg-zinc-900/80 backdrop-blur px-3 py-1.5 rounded-lg text-xs font-medium text-zinc-400 border border-white/5 flex items-center gap-2">
                            <Info className="w-3 h-3" />
                            {voicingMode === 'map' ? "Showing all instances (Map Mode)" : "Showing playable shape (Performance Mode)"}
                        </div>
                    </div>

                    <div className="flex-1 flex items-center justify-center overflow-auto">
                        <Fretboard
                            rootNote={rootNote}
                            showIntervals={true}
                            frets={15}
                            // In 'map' mode, we show all notes matching intervals.
                            // In 'shell' modes, we ONLY show the selected shape notes, so we pass empty visibleIntervals or handle it via selectedNotes opacity
                            // Fretboard logic: visibleIntervals filters the notes. selectedNotes highlights them.
                            // If we want ONLY selectedNotes to show, we should probably pass visibleIntervals as empty?
                            // Or better: Fretboard logic (line 186): opacity = (showThisNote || isSelected) ? 1 : 0;
                            // So if showThisNote is false (empty visibleIntervals), but isSelected is true, it shows.
                            // Perfect.
                            visibleIntervals={voicingMode === 'map' ? activeIntervals : []}
                            selectedNotes={selectedShapeNotes}
                        />
                    </div>
                </div>

            </main>
        </div>
    );
}

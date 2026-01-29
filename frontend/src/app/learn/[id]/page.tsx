"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, ChevronLeft, ChevronRight, CheckCircle, Play, Info } from 'lucide-react';
import { notFound, useParams } from 'next/navigation';
import { LESSONS, LessonSection } from '@/data/lessons';
import { Fretboard } from '@/components/fretboard/Fretboard';
import { getVoicingNodes, getPitchAt, identifyChord } from '@/lib/music';
import { musicAudio } from '@/lib/audio';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

export default function LessonPage() {
    const params = useParams();
    const lessonId = params.id as string;
    const lesson = LESSONS.find(l => l.id === lessonId);

    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);

    if (!lesson) {
        return <div className="p-10 text-center text-zinc-500">Lesson not found</div>;
    }

    const currentSection = lesson.sections[currentSectionIndex];
    const isFirst = currentSectionIndex === 0;
    const isLast = currentSectionIndex === lesson.sections.length - 1;

    // --- Tool Logic (Derived from Configuration) ---
    const toolConfig = currentSection.toolConfig || {};
    const rootNote = toolConfig.rootNote || 'C';
    const activeIntervals = toolConfig.intervals || [0];
    const mode = toolConfig.mode || 'map'; // 'map', 'shell_e', etc

    // Calculate Notes to Display
    const { visibleIntervals, selectedNotes } = useMemo(() => {
        let visible: number[] = [];
        let selected: Array<{ string: number; fret: number }> = [];

        if (mode === 'map') {
            // Check if we are doing a "Constructor" style map (show intervals)
            visible = activeIntervals;
        } else {
            // Shell / Triad Mode
            // Calculate specific shapes using music.ts logic
            // We need to guess simple 'type' for getVoicingNodes ('major', 'minor', etc)
            let type: any = 'major';
            const hasb3 = activeIntervals.includes(3);
            const hasb7 = activeIntervals.includes(10);
            const has7 = activeIntervals.includes(11);

            if (hasb3) type = hasb7 ? 'min7' : 'minor';
            else if (has7) type = 'maj7';
            else if (hasb7) type = 'dom7';

            selected = getVoicingNodes(rootNote, mode as any, type);
        }
        return { visibleIntervals: visible, selectedNotes: selected };
    }, [rootNote, activeIntervals, mode]);

    // Audio Playback
    const playExample = () => {
        let notesToPlay: string[] = [];
        if (selectedNotes.length > 0) {
            notesToPlay = selectedNotes.map(n => getPitchAt(n.string, n.fret));
        } else {
            // If just intervals (Map), let's find the Root Note position and play it?
            // Or just play the "Concept" (e.g. interval).
            // Hard to automate perfectly without context.
            // Let's rely on user clicking fretboard for map. 
            // Or just play Root + Interval.
        }

        if (notesToPlay.length > 0) {
            musicAudio.playChord(notesToPlay);
        }
    };

    return (
        <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
            {/* Header */}
            <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-zinc-950/50">
                <div className="flex items-center gap-4">
                    <Link href="/learn" className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">{lesson.title}</h1>
                        <h2 className="text-lg font-bold text-white">{currentSection.title}</h2>
                    </div>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-2">
                    {lesson.sections.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "w-2 h-2 rounded-full transition-all",
                                i === currentSectionIndex ? "bg-purple-500 scale-125" :
                                    i < currentSectionIndex ? "bg-purple-500/50" : "bg-zinc-800"
                            )}
                        />
                    ))}
                </div>
            </header>

            <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">

                {/* Left: Content */}
                <div className="w-full lg:w-1/3 p-8 border-r border-white/5 bg-zinc-900/30 overflow-y-auto flex flex-col">
                    <div className="prose prose-invert prose-p:text-zinc-300 prose-headings:text-white max-w-none flex-1">
                        <ReactMarkdown>{currentSection.content}</ReactMarkdown>
                    </div>

                    <div className="mt-8 pt-8 border-t border-white/5 flex justify-between items-center">
                        <button
                            disabled={isFirst}
                            onClick={() => setCurrentSectionIndex(i => i - 1)}
                            className="flex items-center gap-2 text-zinc-500 hover:text-white disabled:opacity-30 disabled:hover:text-zinc-500 transition-colors"
                        >
                            <ChevronLeft className="w-4 h-4" /> Previous
                        </button>

                        <button
                            onClick={() => {
                                if (!isLast) setCurrentSectionIndex(i => i + 1);
                                else {
                                    // Finish
                                    window.location.href = '/learn';
                                }
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 transition-all shadow-lg hover:shadow-purple-500/20"
                        >
                            {isLast ? "Finish Lesson" : "Next Step"} <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Right: Interactive Tool */}
                <div className="flex-1 bg-black relative flex flex-col items-center justify-center p-8">

                    {/* Tool Wrapper */}
                    <div className="w-full max-w-5xl">
                        {/* Hint / Description */}
                        {toolConfig.description && (
                            <div className="mb-6 flex items-center gap-3 bg-zinc-900/80 border border-white/10 p-4 rounded-xl text-zinc-300 backdrop-blur-md max-w-xl mx-auto shadow-2xl">
                                <Info className="w-5 h-5 text-purple-400 shrink-0" />
                                <p className="text-sm">{toolConfig.description}</p>
                            </div>
                        )}

                        <Fretboard
                            rootNote={rootNote}
                            showIntervals={true}
                            visibleIntervals={visibleIntervals}
                            selectedNotes={selectedNotes}
                        />

                        {/* Play Button if relevant */}
                        {selectedNotes.length > 0 && (
                            <div className="mt-8 flex justify-center">
                                <button
                                    onClick={playExample}
                                    className="flex items-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-white font-bold transition-all"
                                >
                                    <Play className="w-5 h-5 fill-white" /> Hear Interaction
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

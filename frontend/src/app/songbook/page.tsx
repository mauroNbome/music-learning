"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Wand2, Music, Mic2, Piano, Guitar, Plus, Library, Save, ExternalLink, X, Trash2 } from 'lucide-react';
import { analyzeSong, getSongs, saveSong, deleteSong } from '@/lib/api';
import { Song } from '@/types/song';
import { cn } from '@/lib/utils';
import { transposeChord } from '@/lib/music';
import { toast } from 'sonner';

export default function SongbookPage() {
    // Modes: 'library' | 'editor' | 'view'
    const [mode, setMode] = useState<'library' | 'editor' | 'view'>('library');
    const [viewTab, setViewTab] = useState<'analysis' | 'performance'>('performance');

    // Delete Confirmation State
    const [songToDelete, setSongToDelete] = useState<string | null>(null);

    // Performance State
    const [transpose, setTranspose] = useState(0);
    const [fontSize, setFontSize] = useState(16);
    const [isAutoScrolling, setIsAutoScrolling] = useState(false);
    const [scrollSpeed, setScrollSpeed] = useState(1);

    // Data
    const [savedSongs, setSavedSongs] = useState<Song[]>([]);
    const [currentSong, setCurrentSong] = useState<Song | null>(null);
    const [rawText, setRawText] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // View Settings (for Smart Chart)
    const [viewMode, setViewMode] = useState<'guitar' | 'piano' | 'vocal'>('guitar');

    // Load songs on mount
    useEffect(() => {
        loadLibrary();
    }, []);

    // Auto-Scroll Logic
    useEffect(() => {
        let scrollInterval: NodeJS.Timeout;
        if (isAutoScrolling) {
            scrollInterval = setInterval(() => {
                window.scrollBy(0, scrollSpeed);
            }, 50);
        }
        return () => clearInterval(scrollInterval);
    }, [isAutoScrolling, scrollSpeed]);

    const loadLibrary = async () => {
        try {
            const songs = await getSongs();
            setSavedSongs(songs);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAnalyze = async () => {
        if (!rawText.trim()) return;
        setIsLoading(true);
        const promise = analyzeSong(rawText);

        toast.promise(promise, {
            loading: 'Analyzing harmony & structure...',
            success: (result: Song) => {
                setCurrentSong(result);
                setMode('view');
                if (!result.performance_lines?.length) setViewTab('analysis');
                else setViewTab('performance');
                return `Analysis complete! Key: ${result.key_signature}`;
            },
            error: (err: any) => {
                console.error(err);
                return "Analysis failed. Check your API key or backend.";
            }
        });

        promise.finally(() => setIsLoading(false));
    };

    const handleSave = async () => {
        if (!currentSong) return;

        toast.promise(
            async () => {
                const saved = await saveSong(currentSong);
                await loadLibrary();
                setCurrentSong(saved); // Update state with the new ID to hide the button
            },
            {
                loading: 'Saving to library...',
                success: 'Song saved to your Songbook!',
                error: 'Failed to save song.'
            }
        );
    };

    const confirmDelete = async (id: string) => {
        toast.promise(
            async () => {
                await deleteSong(id);
                await loadLibrary();
                setSongToDelete(null);
            },
            {
                loading: 'Deleting song...',
                success: 'Song deleted forever.',
                error: 'Could not delete song.'
            }
        );
    };

    const handleDeleteClick = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSongToDelete(id);
    };

    // Helper to render performance line with transposed chords
    const renderPerformanceLine = (line: string, idx: number) => {
        const parts = line.split(/(\[[^\]]+\])/g);
        return (
            <div key={idx} className="whitespace-pre-wrap font-mono leading-relaxed mb-1" style={{ fontSize: `${fontSize}px` }}>
                {parts.map((part, i) => {
                    if (part.startsWith('[') && part.endsWith(']')) {
                        const chord = part.slice(1, -1);
                        const transposed = transposeChord(chord, transpose);
                        return (
                            <span key={i} className="text-cyan-400 font-bold">
                                {transposed}
                            </span>
                        );
                    }
                    return <span key={i} className="text-zinc-300">{part}</span>;
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center relative">
            {/* Delete Confirmation Modal */}
            {songToDelete && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-zinc-900 border border-white/10 p-6 rounded-2xl shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <h3 className="text-xl font-bold text-white mb-2">Delete Song?</h3>
                        <p className="text-zinc-400 mb-6">
                            Are you sure you want to delete this song? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setSongToDelete(null)}
                                className="px-4 py-2 rounded-lg font-bold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => confirmDelete(songToDelete)}
                                className="px-4 py-2 rounded-lg font-bold text-white bg-red-600 hover:bg-red-500 transition-colors shadow-lg shadow-red-900/20"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="w-full max-w-6xl p-6 flex items-center justify-between border-b border-white/5 bg-zinc-950/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <button
                        onClick={() => setMode('library')}
                        className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent flex items-center gap-2"
                    >
                        <Music className="w-6 h-6 text-cyan-400" />
                        The Jam Station <span className="text-xs text-zinc-500 font-mono border border-zinc-800 px-1 rounded">V2</span>
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    {/* View Switcher */}
                    {mode === 'view' && (
                        <div className="hidden md:flex bg-zinc-900 border border-white/10 p-1 rounded-lg mr-4">
                            <button
                                onClick={() => setViewTab('performance')}
                                className={cn("px-3 py-1 rounded text-sm font-bold transition-all", viewTab === 'performance' ? "bg-cyan-600 text-white" : "text-zinc-400 hover:text-white")}
                            >
                                Performance
                            </button>
                            <button
                                onClick={() => setViewTab('analysis')}
                                className={cn("px-3 py-1 rounded text-sm font-bold transition-all", viewTab === 'analysis' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-white")}
                            >
                                Deep Analysis
                            </button>
                        </div>
                    )}

                    {/* Editor Button */}
                    {mode !== 'editor' && (
                        <button
                            onClick={() => { setMode('editor'); setRawText(''); setCurrentSong(null); }}
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-all"
                        >
                            <Plus className="w-4 h-4" /> <span className="hidden sm:inline">New Song</span>
                        </button>
                    )}

                    {/* Save Button (Smart Logic: Only for unsaved songs) */}
                    {mode === 'view' && currentSong && !currentSong.id && (
                        <button
                            onClick={handleSave}
                            className="bg-green-600 hover:bg-green-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 text-sm transition-all shadow-lg shadow-green-900/20"
                        >
                            <Save className="w-4 h-4" /> <span className="hidden sm:inline">Save to Library</span>
                        </button>
                    )}
                </div>
            </header>

            {/* VIEW TABS (Mobile only) */}
            {mode === 'view' && (
                <div className="md:hidden w-full flex bg-zinc-900 border-b border-white/5 sticky top-[88px] z-40">
                    <button
                        onClick={() => setViewTab('performance')}
                        className={cn("flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all", viewTab === 'performance' ? "border-cyan-500 text-cyan-400" : "border-transparent text-zinc-500")}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setViewTab('analysis')}
                        className={cn("flex-1 py-3 text-sm font-bold text-center border-b-2 transition-all", viewTab === 'analysis' ? "border-purple-500 text-purple-400" : "border-transparent text-zinc-500")}
                    >
                        Deep Analysis
                    </button>
                </div>
            )}

            {/* PERFORMANCE CONTROLS (Sticky) */}
            {mode === 'view' && viewTab === 'performance' && (
                <div className="w-full bg-zinc-900/90 border-b border-white/5 backdrop-blur-md sticky top-[88px] md:top-[88px] z-40 p-2 flex flex-wrap justify-center gap-4 animate-in slide-in-from-top-2">
                    {/* Transpose */}
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                        <button onClick={() => setTranspose(t => t - 1)} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white font-mono font-bold w-10 text-center">-</button>
                        <span className="text-cyan-400 font-bold w-8 text-center">{transpose > 0 ? `+${transpose}` : transpose}</span>
                        <button onClick={() => setTranspose(t => t + 1)} className="p-2 hover:bg-white/10 rounded text-zinc-400 hover:text-white font-mono font-bold w-10 text-center">+</button>
                    </div>

                    {/* Font Size */}
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 px-3 border border-white/5">
                        <span className="text-xs text-zinc-500 uppercase font-bold">Size</span>
                        <input
                            type="range" min="12" max="32"
                            value={fontSize}
                            onChange={(e) => setFontSize(parseInt(e.target.value))}
                            className="w-20 accent-cyan-500 cursor-pointer"
                        />
                    </div>

                    {/* Auto Scroll */}
                    <div className="flex items-center gap-2 bg-black/40 rounded-lg p-1 border border-white/5">
                        <button
                            onClick={() => setIsAutoScrolling(!isAutoScrolling)}
                            className={cn("px-3 py-1.5 rounded font-bold text-xs uppercase flex items-center gap-2 transition-all", isAutoScrolling ? "bg-green-500 text-black" : "bg-white/5 text-zinc-400 hover:text-white")}
                        >
                            {isAutoScrolling ? "Stop" : "Scroll"}
                        </button>
                        {isAutoScrolling && (
                            <input
                                type="range" min="1" max="5" step="0.5"
                                value={scrollSpeed}
                                onChange={(e) => setScrollSpeed(parseFloat(e.target.value))}
                                className="w-16 accent-green-500 cursor-pointer"
                            />
                        )}
                    </div>
                </div>
            )}

            <main className="w-full max-w-6xl p-6 flex-1">

                {/* LIBRARY MODE */}
                {mode === 'library' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center gap-2 mb-8">
                            <Library className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-2xl font-bold text-white">Your Songbook</h2>
                        </div>

                        {savedSongs.length === 0 ? (
                            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                                <p className="text-zinc-500 mb-4">No songs saved yet.</p>
                                <button
                                    onClick={() => setMode('editor')}
                                    className="text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-2 mx-auto"
                                >
                                    <Plus className="w-4 h-4" /> Add your first song
                                </button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {savedSongs.map((s, i) => (
                                    <div key={i} className="relative group p-6 bg-zinc-900/50 border border-white/5 hover:border-cyan-500/30 rounded-xl transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-cyan-900/10 cursor-pointer"
                                        onClick={() => { setCurrentSong(s); setMode('view'); setViewTab(s.performance_lines ? 'performance' : 'analysis'); }}
                                    >
                                        <div className="pr-8">
                                            <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-1">{s.title}</h3>
                                            <p className="text-zinc-400 text-sm mb-4">{s.artist}</p>
                                            <div className="flex items-center justify-between text-xs text-zinc-600 uppercase tracking-widest font-bold">
                                                <span>{s.key_signature}</span>
                                                <span className="bg-zinc-800 px-2 py-1 rounded text-zinc-500">{s.sections.length} Sections</span>
                                            </div>
                                        </div>

                                        {/* Delete Button (Z-Index Fixed + Large Hit Area) */}
                                        <div
                                            className="absolute top-0 right-0 p-4 z-50 rounded-tr-xl rounded-bl-xl hover:bg-white/5 transition-all"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                console.log("Delete clicked for", s.id);
                                                if (s.id) handleDeleteClick(e, s.id);
                                                else alert("Error: Song ID missing");
                                            }}
                                        >
                                            <button
                                                className="p-2 text-zinc-500 hover:text-red-500 bg-zinc-900/80 hover:bg-red-500/10 border border-transparent hover:border-red-500/30 rounded-full transition-all shadow-sm backdrop-blur-sm"
                                                title="Delete Song"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* EDITOR MODE */}
                {mode === 'editor' && (
                    <div className="max-w-3xl mx-auto animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center mb-8">
                            <h2 className="text-4xl font-bold text-white mb-2">Analysis Studio</h2>
                            <p className="text-zinc-400">Paste lyrics & chords. Our DeepSeek AI will analyze harmony & voice leading.</p>
                        </div>

                        <textarea
                            value={rawText}
                            onChange={(e) => setRawText(e.target.value)}
                            placeholder="Paste your song here..."
                            className="w-full h-96 bg-zinc-900/50 border border-white/10 rounded-xl p-6 text-mono text-sm focus:outline-none focus:border-cyan-500/50 transition-all resize-none shadow-inner"
                        />

                        <button
                            onClick={handleAnalyze}
                            disabled={isLoading || !rawText}
                            className="w-full mt-6 py-4 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-900/20"
                        >
                            {isLoading ? "Thinking Deeply..." : <><Wand2 className="w-5 h-5" /> Analyze Harmony</>}
                        </button>
                    </div>
                )}

                {/* VIEW MODE */}
                {mode === 'view' && currentSong && (
                    <div className="animate-in fade-in slide-in-from-bottom-10 duration-700 pb-40 text-left">

                        {/* PERFORMANCE TAB */}
                        {viewTab === 'performance' && (
                            <div className="max-w-4xl mx-auto bg-zinc-950 border border-zinc-900 shadow-2xl rounded-xl p-6 md:p-12 min-h-[80vh]">
                                <div className="text-center mb-12">
                                    <h1 className="text-4xl md:text-5xl font-black text-white mb-2">{currentSong.title}</h1>
                                    <p className="text-xl text-cyan-500 font-medium">{currentSong.artist}</p>
                                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                                        <span className="text-xs text-zinc-500 uppercase tracking-widest">Key</span>
                                        <span className="text-sm font-bold text-white">{currentSong.key_signature}</span>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    {currentSong.performance_lines?.map((line, idx) => (
                                        renderPerformanceLine(line, idx)
                                    )) || (
                                            <div className="text-center py-20">
                                                <p className="text-zinc-500 italic mb-4">
                                                    No performance data available for this song.
                                                </p>
                                                <button onClick={() => setViewTab('analysis')} className="text-cyan-400 hover:text-white underline">
                                                    Switch to Deep Analysis
                                                </button>
                                            </div>
                                        )}
                                </div>
                            </div>
                        )}

                        {/* ANALYSIS TAB (Smart Chart) */}
                        {viewTab === 'analysis' && (
                            <div>
                                {/* Song Header */}
                                <div className="mb-8 p-8 bg-gradient-to-r from-zinc-900 to-black border border-white/5 rounded-3xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-32 bg-cyan-500/5 blur-[100px] rounded-full pointing-events-none" />
                                    <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                                        <div>
                                            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{currentSong.title}</h2>
                                            <p className="text-xl text-cyan-400 font-medium">{currentSong.artist}</p>
                                        </div>
                                        <div className="text-right">
                                            <div className="flex gap-2 bg-zinc-900 border border-white/10 p-1 rounded-lg">
                                                <button onClick={() => setViewMode('guitar')} className={cn("p-2 rounded md:px-3 md:py-1 text-xs font-bold flex items-center gap-2", viewMode === 'guitar' ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-500 hover:text-white")}>
                                                    <Guitar className="w-3 h-3" /> <span className="hidden md:inline">Gtr</span>
                                                </button>
                                                <button onClick={() => setViewMode('piano')} className={cn("p-2 rounded md:px-3 md:py-1 text-xs font-bold flex items-center gap-2", viewMode === 'piano' ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-500 hover:text-white")}>
                                                    <Piano className="w-3 h-3" /> <span className="hidden md:inline">Pno</span>
                                                </button>
                                                <button onClick={() => setViewMode('vocal')} className={cn("p-2 rounded md:px-3 md:py-1 text-xs font-bold flex items-center gap-2", viewMode === 'vocal' ? "bg-cyan-500/20 text-cyan-400" : "text-zinc-500 hover:text-white")}>
                                                    <Mic2 className="w-3 h-3" /> <span className="hidden md:inline">Vox</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Sections */}
                                <div className="space-y-8">
                                    {currentSong.sections.map((section, idx) => (
                                        <div key={idx} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 md:p-8 relative overflow-hidden group hover:border-white/10 transition-all">
                                            <div className="flex items-center gap-4 mb-6 border-b border-white/5 pb-4">
                                                <h3 className="text-sm font-bold uppercase tracking-widest text-zinc-400">
                                                    {section.name}
                                                </h3>
                                                <span className="text-xs font-bold text-zinc-600 bg-zinc-950 px-2 py-1 rounded border border-white/5">
                                                    {section.key}
                                                </span>
                                            </div>

                                            {/* Chords Grid */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                                {section.chords.map((chord, cIdx) => (
                                                    <div key={cIdx} className="bg-black/40 p-5 rounded-xl border border-white/5 hover:border-cyan-500/30 transition-all group/chord relative">

                                                        {/* Chord Header */}
                                                        <div className="flex items-baseline justify-between mb-2">
                                                            <span className="text-3xl font-black text-white">{chord.raw}</span>
                                                            {chord.function && <span className="text-xs font-black text-zinc-600 bg-zinc-900 px-1.5 py-0.5 rounded">{chord.function}</span>}
                                                        </div>

                                                        {/* Primary Info */}
                                                        <div className="space-y-2 mb-3">
                                                            <p className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
                                                                <span className="w-1 h-1 rounded-full bg-zinc-600" />
                                                                {chord.quality}
                                                            </p>
                                                            {viewMode === 'guitar' && chord.recommended_scale && (
                                                                <p className="text-[10px] text-cyan-400/80 font-mono leading-tight bg-cyan-950/20 p-1.5 rounded border border-cyan-900/30">
                                                                    {chord.recommended_scale}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Deep Analysis (Voice Leading / Subs) */}
                                                        {(chord.substitution || chord.voice_leading) && (
                                                            <div className="pt-3 border-t border-white/5 mt-auto">
                                                                {viewMode === 'piano' && chord.voice_leading && (
                                                                    <div className="mb-2">
                                                                        <span className="text-[9px] uppercase tracking-widest text-purple-400 font-bold block mb-0.5">Voice Leading</span>
                                                                        <p className="text-[10px] text-zinc-400 leading-snug">{chord.voice_leading}</p>
                                                                    </div>
                                                                )}
                                                                {viewMode === 'guitar' && chord.substitution && (
                                                                    <div>
                                                                        <span className="text-[9px] uppercase tracking-widest text-orange-400 font-bold block mb-0.5">Reharm Idea</span>
                                                                        <p className="text-[10px] text-zinc-400 leading-snug">{chord.substitution}</p>
                                                                    </div>
                                                                )}
                                                                {/* Allow Vocal view to see simplified tips */}
                                                                {viewMode === 'vocal' && (
                                                                    <p className="text-[10px] text-zinc-500 italic">Target Root: {chord.root}</p>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

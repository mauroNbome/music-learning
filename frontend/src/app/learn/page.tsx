"use client";

import Link from "next/link";
import { ArrowLeft, BookOpen, GraduationCap, ChevronRight } from "lucide-react";
import { LESSONS } from "@/data/lessons";
import { cn } from "@/lib/utils";

export default function LearnPage() {
    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center">
            {/* Header */}
            <header className="w-full max-w-5xl p-6 flex items-center gap-4">
                <Link href="/" className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-purple-400" />
                    Visual Jazz Academy
                </h1>
            </header>

            {/* Content */}
            <main className="w-full max-w-5xl p-6 grid gap-6">

                {/* Hero */}
                <div className="p-8 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-white/5 shadow-2xl backdrop-blur-sm">
                    <h2 className="text-2xl font-bold mb-4 text-white">Master the Fretboard</h2>
                    <p className="text-zinc-300 max-w-2xl mb-6">
                        Forget dry theory books. This interactive curriculum connects your eyes, ears, and hands
                        to the geometry of music. Start from the atoms (Intervals) and build up to Jazz improvisation.
                    </p>
                </div>

                {/* Lesson Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {LESSONS.map((lesson, index) => (
                        <Link
                            href={`/learn/${lesson.id}`}
                            key={lesson.id}
                            className="group relative flex flex-col bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)] overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <BookOpen className="w-24 h-24 -mr-8 -mt-8 rotate-12" />
                            </div>

                            <div className="relative z-10 flex flex-col h-full">
                                <span className={cn(
                                    "px-2 py-1 rounded text-xs font-bold w-fit mb-3",
                                    lesson.difficulty === 'Beginner' ? "bg-green-500/10 text-green-400" :
                                        lesson.difficulty === 'Intermediate' ? "bg-yellow-500/10 text-yellow-400" :
                                            "bg-red-500/10 text-red-400"
                                )}>
                                    {lesson.difficulty}
                                </span>

                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors">
                                    {lesson.title}
                                </h3>

                                <p className="text-sm text-zinc-400 mb-6 flex-1">
                                    {lesson.description}
                                </p>

                                <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 group-hover:text-white transition-colors mt-auto">
                                    Start Lesson <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

            </main>
        </div>
    );
}

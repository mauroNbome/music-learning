import Link from "next/link";
import { Music2, BrainCircuit, Hammer, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 gap-12 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">

      {/* Hero Section */}
      <div className="text-center space-y-4 max-w-2xl">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tighter bg-gradient-to-br from-white to-zinc-500 bg-clip-text text-transparent">
          Master the Matrix
        </h1>
        <p className="text-xl text-zinc-400 font-light">
          Unlock the logic behind the music. No rote memorization, just patterns.
        </p>
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl">

        {/* Tool Card 1: Fretboard Mapper */}
        <Link href="/fretboard" className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-primary/50 transition-all hover:shadow-[0_0_30px_rgba(34,197,94,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Music2 className="w-32 h-32 ml-10 -mt-10" />
          </div>
          <div className="flex flex-col h-full gap-4">
            <div className="p-3 bg-primary/10 w-fit rounded-lg text-primary">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">The Fretboard Mapper</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Visualize intervals, geometric shapes, and "islands" of safety across the neck.
              </p>
            </div>
            <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-primary">
              Open Tool <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

        {/* Tool Card 2: Visual Jazz Academy */}
        <Link href="/learn" className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-purple-500/50 transition-all hover:shadow-[0_0_30px_rgba(168,85,247,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <BrainCircuit className="w-32 h-32 ml-10 -mt-10" />
          </div>
          <div className="flex flex-col h-full gap-4">
            <div className="p-3 bg-purple-500/10 w-fit rounded-lg text-purple-400">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-purple-400 transition-colors">Visual Jazz Academy</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                A structured interactive curriculum. From Intervals to Jazz Improvisation.
              </p>
            </div>
            <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-purple-400">
              Start Learning <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

        {/* Tool Card 3: Chord Constructor */}
        <Link href="/chord-constructor" className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-yellow-500/50 transition-all hover:shadow-[0_0_30px_rgba(234,179,8,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Hammer className="w-32 h-32 ml-10 -mt-10" />
          </div>
          <div className="flex flex-col h-full gap-4">
            <div className="p-3 bg-zinc-800 w-fit rounded-lg text-yellow-500">
              <Hammer className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-yellow-500 transition-colors">Chord Constructor</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Build sophisticated jazz voicings using shell chord logic and formula detection.
              </p>
            </div>
            <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-yellow-500">
              Open Tool <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

        {/* Tool Card 4: AI Songbook */}
        <Link href="/songbook" className="group relative overflow-hidden bg-zinc-900/50 border border-white/5 rounded-2xl p-6 hover:border-cyan-500/50 transition-all hover:shadow-[0_0_30px_rgba(6,182,212,0.1)]">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Music2 className="w-32 h-32 ml-10 -mt-10" />
          </div>
          <div className="flex flex-col h-full gap-4">
            <div className="p-3 bg-cyan-500/10 w-fit rounded-lg text-cyan-400">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2 group-hover:text-cyan-400 transition-colors">The Jam Station</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                AI Musical Director. Paste raw text, get functional harmony and functional band arrangement.
              </p>
            </div>
            <div className="mt-auto flex items-center text-xs font-bold uppercase tracking-widest text-zinc-500 group-hover:text-cyan-400">
              Enter Studio <ArrowRight className="w-4 h-4 ml-2" />
            </div>
          </div>
        </Link>

      </div>
    </div>
  );
}

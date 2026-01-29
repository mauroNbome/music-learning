import React, { useMemo } from "react";
import { cn } from "@/lib/utils";
import { NOTES_SHARP, getNoteAt, getPitchAt, getInterval, INTERVALS, type Note } from "@/lib/music";
import { musicAudio } from "@/lib/audio";

interface FretboardProps {
    tuning?: Note[];
    frets?: number;
    rootNote?: Note | null;
    showIntervals?: boolean;
    showNotes?: boolean;
    visibleIntervals?: number[]; // Array of semitones to show relative to root
    onNoteClick?: (note: Note, stringIndex: number, fret: number) => void;
    selectedNotes?: Array<{ string: number; fret: number }>; // For highlighting specific patterns
}

export function Fretboard({
    tuning = ["E", "A", "D", "G", "B", "E"],
    frets = 15,
    rootNote,
    showIntervals = true,
    showNotes = true,
    visibleIntervals,
    onNoteClick,
    selectedNotes = [],
}: FretboardProps) {
    // Config
    const stringCount = tuning.length;
    // Calculate dimensions
    // We'll use a viewBox. 
    // Width = frets * fretWidth
    // Height = strings * stringHeight

    const FRET_WIDTH = 60;
    const STRING_GAP = 40;
    const NUT_WIDTH = 10;
    const BOARD_PADDING_X = 50; // Increased to fit labels
    const BOARD_PADDING_Y = 20;

    const boardWidth = (frets * FRET_WIDTH) + NUT_WIDTH + (BOARD_PADDING_X * 2);
    const boardHeight = ((stringCount - 1) * STRING_GAP) + (BOARD_PADDING_Y * 2);

    // Inlays (Dots)
    const singleDots = [3, 5, 7, 9, 15, 17, 19, 21];
    const doubleDots = [12, 24];

    // Helper to get Y position of a string (0-indexed from tuning array)
    // tuning[0] is Low E. User drew it at bottom. 
    // SVG grid: 0 is top.
    // So if we want Low E at bottom, stringIndex 0 should be at specific Y.
    // Let's map tuning array to visual strings.
    // tuning = [E, A, D, G, B, E] -> Indices 0, 1, 2, 3, 4, 5
    // If we render index 0 at Y = (5 * GAP), index 5 at Y = 0.
    const getStringY = (index: number) => {
        // Invert index for visual bottom-heavy Low E
        return (stringCount - 1 - index) * STRING_GAP + BOARD_PADDING_Y;
    };

    return (
        <div className="w-full overflow-x-auto p-4 bg-zinc-950 rounded-xl shadow-2xl border border-zinc-900">
            <svg
                width={boardWidth}
                height={boardHeight}
                viewBox={`0 0 ${boardWidth} ${boardHeight}`}
                className="mx-auto"
                style={{ minWidth: "800px" }}
            >
                {/* String Labels */}
                {/* String Labels */}
                {tuning.map((note, i) => {
                    const y = getStringY(i);
                    // High E string is the last element in standard tuning array. (Index 5)
                    const displayNote = (i === tuning.length - 1 && note === 'E') ? 'e' : note;

                    return (
                        <text
                            key={`label-${i}`}
                            x={BOARD_PADDING_X - 15}
                            y={y}
                            dy={5}
                            textAnchor="end"
                            fill="#71717a" // Zinc 500
                            fontSize={14}
                            fontWeight="bold"
                            className="select-none font-mono"
                        >
                            {displayNote}
                        </text>
                    );
                })}

                {/* Fretboard Background (Wood) */}
                <rect
                    x={BOARD_PADDING_X}
                    y={BOARD_PADDING_Y - 10}
                    width={boardWidth - (BOARD_PADDING_X * 2) - 0} // Fix width calculation?? Logic seems ok previously? 
                    // Previously: width={boardWidth - (BOARD_PADDING_X * 2)}
                    // boardWidth includes 2*Padding. So this is correct.
                    height={(stringCount - 1) * STRING_GAP + 20}
                    fill="var(--fretboard-wood)"
                    rx={4}
                />

                {/* Frets */}
                {Array.from({ length: frets + 1 }).map((_, i) => {
                    const x = BOARD_PADDING_X + NUT_WIDTH + (i * FRET_WIDTH);
                    // Nut (Fret 0)
                    if (i === 0) {
                        return (
                            <rect
                                key={`nut`}
                                x={BOARD_PADDING_X}
                                y={BOARD_PADDING_Y - 10}
                                width={NUT_WIDTH}
                                height={(stringCount - 1) * STRING_GAP + 20}
                                fill="#d4d4d8" // Zinc 300
                            />
                        );
                    }
                    return (
                        <line
                            key={`fret-${i}`}
                            x1={x}
                            y1={BOARD_PADDING_Y - 10}
                            x2={x}
                            y2={boardHeight - BOARD_PADDING_Y + 10}
                            stroke="#52525b" // Zinc 600
                            strokeWidth={2}
                        />
                    );
                })}

                {/* Inlays */}
                {singleDots.filter(f => f <= frets).map(fret => (
                    <circle
                        key={`dot-${fret}`}
                        cx={BOARD_PADDING_X + NUT_WIDTH + ((fret - 0.5) * FRET_WIDTH)}
                        cy={boardHeight / 2}
                        r={8}
                        fill="var(--fretboard-inlay)"
                        opacity={0.8}
                    />
                ))}
                {doubleDots.filter(f => f <= frets).map(fret => (
                    <g key={`doubledot-${fret}`}>
                        <circle
                            cx={BOARD_PADDING_X + NUT_WIDTH + ((fret - 0.5) * FRET_WIDTH)}
                            cy={boardHeight / 2 - STRING_GAP}
                            r={8}
                            fill="var(--fretboard-inlay)"
                            opacity={0.8}
                        />
                        <circle
                            cx={BOARD_PADDING_X + NUT_WIDTH + ((fret - 0.5) * FRET_WIDTH)}
                            cy={boardHeight / 2 + STRING_GAP}
                            r={8}
                            fill="var(--fretboard-inlay)"
                            opacity={0.8}
                        />
                    </g>
                ))}

                {/* Strings */}
                {tuning.map((root, i) => {
                    const y = getStringY(i);
                    return (
                        <g key={`string-${i}`}>
                            <line
                                x1={BOARD_PADDING_X}
                                y1={y}
                                x2={boardWidth - BOARD_PADDING_X}
                                y2={y}
                                stroke="var(--string)"
                                strokeWidth={1 + (i * 0.5)} // Thicker for lower strings (i=0 is Low E)
                                opacity={0.9}
                            />
                        </g>
                    );
                })}

                {/* Interactive Zones (Notes) */}
                {tuning.map((stringRoot, stringIdx) => {
                    const y = getStringY(stringIdx);
                    return Array.from({ length: frets + 1 }).map((_, fretIdx) => {
                        const x = fretIdx === 0
                            ? BOARD_PADDING_X + (NUT_WIDTH / 2)
                            : BOARD_PADDING_X + NUT_WIDTH + ((fretIdx - 0.5) * FRET_WIDTH);

                        const currentNote = getNoteAt(stringIdx, fretIdx);

                        // Determine styling based on state
                        let isRoot = false;
                        let interval = -1;
                        let showThisNote = false;

                        if (rootNote) {
                            interval = getInterval(rootNote, currentNote);
                            if (interval === 0) isRoot = true;

                            // Only show if it's relevant (Scale logic would go here, for now show all if root selected?)
                            // If visibleIntervals prop is provided, use that. Otherwise default to major scale + b7?
                            // Or default to standard R, 3, 5, 7.

                            const intervalsToShow = visibleIntervals || [0, 3, 4, 7, 10, 11];
                            if (intervalsToShow.includes(interval)) showThisNote = true;
                        }

                        // Check if explicitly selected
                        const isSelected = selectedNotes.some(n => n.string === stringIdx && n.fret === fretIdx);

                        let opacity = (showThisNote || isSelected) ? 1 : 0;
                        const intervalInfo = INTERVALS[interval];

                        // Dynamic Color
                        let fill = "#3f3f46"; // Default Zinc 700
                        let text = "";
                        let textColor = "#fff";

                        if (intervalInfo) {
                            fill = intervalInfo.colorVar || fill;
                            text = showIntervals ? intervalInfo.short : currentNote;
                        }
                        if (!rootNote && showNotes) {
                            text = currentNote;
                            if (isSelected) {
                                fill = "var(--primary)";
                                opacity = 1; // Show if selected
                            } else {
                                opacity = 0; // Hide by default if no root selected? 
                                // Maybe show ghost notes on hover?
                            }
                        }

                        // Always render a transparent hit area
                        return (
                            <g
                                key={`note-${stringIdx}-${fretIdx}`}
                                className="cursor-pointer group"
                                onClick={() => {
                                    // Play Sound
                                    const pitch = getPitchAt(stringIdx, fretIdx);
                                    musicAudio.playNote(pitch, "2n");

                                    // Parent Callback
                                    onNoteClick?.(currentNote, stringIdx, fretIdx);
                                }}
                            >
                                {/* Hit Box */}
                                <circle cx={x} cy={y} r={18} fill="transparent" />

                                {/* Visible Note Circle */}
                                <circle
                                    cx={x}
                                    cy={y}
                                    r={14}
                                    fill={fill}
                                    className={cn("transition-all duration-300",
                                        (opacity === 0) ? "opacity-0 group-hover:opacity-20 scale-50 group-hover:scale-100" : "opacity-100 drop-shadow-[0_0_8px_currentColor]"
                                    )}
                                />

                                {/* Text */}
                                <text
                                    x={x}
                                    y={y}
                                    dy={4}
                                    textAnchor="middle"
                                    fill={textColor}
                                    fontSize={10}
                                    fontWeight="bold"
                                    pointerEvents="none"
                                    className={cn("transition-opacity", (opacity === 0) ? "opacity-0 group-hover:opacity-100" : "opacity-100")}
                                >
                                    {text}
                                </text>
                            </g>
                        );
                    });
                })}
            </svg>
        </div>
    );
}

export type Note = string;
export type Interval = number; // Semitones

export const NOTES_SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
export const NOTES_FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

export const TUNING_STANDARD = ['E', 'A', 'D', 'G', 'B', 'E']; // Low to High (Strings 6 to 1)

// Map intervals to semantic names and colors
export const INTERVALS: Record<number, { name: string; short: string; colorVar: string }> = {
    0: { name: 'Root', short: 'R', colorVar: 'var(--interval-root)' }, // Unison
    1: { name: 'Minor 2nd', short: 'b2', colorVar: 'var(--interval-default)' },
    2: { name: 'Major 2nd', short: '2', colorVar: 'var(--interval-default)' },
    3: { name: 'Minor 3rd', short: 'b3', colorVar: 'var(--interval-3)' },
    4: { name: 'Major 3rd', short: '3', colorVar: 'var(--interval-3)' },
    5: { name: 'Perfect 4th', short: '4', colorVar: 'var(--interval-default)' },
    6: { name: 'Tritone', short: 'b5', colorVar: 'var(--interval-default)' },
    7: { name: 'Perfect 5th', short: '5', colorVar: 'var(--interval-5)' },
    8: { name: 'Minor 6th', short: 'b6', colorVar: 'var(--interval-default)' },
    9: { name: 'Major 6th', short: '6', colorVar: 'var(--interval-default)' },
    10: { name: 'Minor 7th', short: 'b7', colorVar: 'var(--interval-7)' },
    11: { name: 'Major 7th', short: '7', colorVar: 'var(--interval-7)' },
};

export const GRID_SIZE = {
    strings: 6,
    frets: 15, // Display 0-15
};

/**
 * Get the note at a specific string and fret.
 * @param stringIndex 0-based index from global TUNING_STANDARD (0 = Low E, 5 = High E)
 * @param fret Fret number (0 = open)
 */
export function getNoteAt(stringIndex: number, fret: number): Note {
    const openNote = TUNING_STANDARD[stringIndex];
    const openNoteIndex = NOTES_SHARP.indexOf(openNote);
    const noteIndex = (openNoteIndex + fret) % 12;
    return NOTES_SHARP[noteIndex];
}

/**
 * Get scientific pitch notation (e.g., "C4", "E2") for a specific position.
 * Used for Audio Engine.
 */
export function getPitchAt(stringIndex: number, fret: number): string {
    const note = getNoteAt(stringIndex, fret);
    // Base Semitone Distance from C0 (Midi-like)
    // E2=28, A2=33, D3=38, G3=43, B3=47, E4=52
    const openPitchValues = [28, 33, 38, 43, 47, 52];

    const currentPitchValue = openPitchValues[stringIndex] + fret;
    const octave = Math.floor(currentPitchValue / 12);

    return `${note}${octave}`;
}

/**
 * Calculate interval between two notes (semitones).
 */
export function getInterval(root: Note, target: Note): number {
    const rootIndex = NOTES_SHARP.indexOf(root);
    const targetIndex = NOTES_SHARP.indexOf(target);
    let interval = targetIndex - rootIndex;
    if (interval < 0) interval += 12;
    return interval;
}

export function getNoteFromInterval(root: Note, interval: number): Note {
    const rootIndex = NOTES_SHARP.indexOf(root);
    const targetIndex = (rootIndex + interval) % 12;
    return NOTES_SHARP[targetIndex];
}

// Helper to get all fret positions for a note
export function getFretPositions(note: Note): Array<{ string: number; fret: number }> {
    const positions: Array<{ string: number; fret: number }> = [];
    TUNING_STANDARD.forEach((openNote, stringIdx) => {
        // Find first instance on this string
        const openIndex = NOTES_SHARP.indexOf(openNote);
        const targetIndex = NOTES_SHARP.indexOf(note);
        let firstFret = targetIndex - openIndex;
        if (firstFret < 0) firstFret += 12;

        // Add all instances up to fret 24
        for (let f = firstFret; f <= 24; f += 12) {
            positions.push({ string: stringIdx, fret: f });
        }
    });
    return positions;
}

// Logic for "Islands" (Octave Centers) specific to user's diagram
export function getIslandsNodes(root: Note): Array<{ string: number; fret: number }> {
    const relevantIntervals = [0, 4, 7]; // R, 3, 5
    const islandNodes: Array<{ string: number; fret: number }> = [];

    TUNING_STANDARD.forEach((_, sIdx) => {
        for (let f = 0; f <= 18; f++) {
            const note = getNoteAt(sIdx, f);
            const interval = getInterval(root, note);
            if (relevantIntervals.includes(interval)) {
                islandNodes.push({ string: sIdx, fret: f });
            }
        }
    });

    return islandNodes;
}

// --- Chord Logic ---

export interface ChordFormula {
    name: string;
    intervals: number[];
}

export const CHORD_FORMULAS: ChordFormula[] = [
    { name: "Major", intervals: [0, 4, 7] },
    { name: "Minor", intervals: [0, 3, 7] },
    { name: "Diminished", intervals: [0, 3, 6] },
    { name: "Augmented", intervals: [0, 4, 8] },
    { name: "Major 7", intervals: [0, 4, 7, 11] }, // R, 3, 5, 7
    { name: "Dominant 7", intervals: [0, 4, 7, 10] }, // R, 3, 5, b7
    { name: "Minor 7", intervals: [0, 3, 7, 10] }, // R, b3, 5, b7
    { name: "Half Diminished (m7b5)", intervals: [0, 3, 6, 10] },
];

export function identifyChord(intervals: number[]): string | null {
    // Sort and dedup
    const unique = Array.from(new Set(intervals)).sort((a, b) => a - b);

    // Naive Check
    for (const formula of CHORD_FORMULAS) {
        // Check if formula intervals are a subset of provided intervals. 
        // Actually exact match for now is safer, or at least formula must be present.
        // Let's do exact match of core tones (Shells usually omit 5th, but let's require essential defining tones)

        // Exact match check
        const isMatch = formula.intervals.length === unique.length &&
            formula.intervals.every((val, index) => val === unique[index]);
        if (isMatch) return formula.name;
    }

    // Special Case: Shells (Omitted 5th)
    // Maj7 Shell: R, 3, 7 (0, 4, 11)
    if (hasIntervals(unique, [0, 4, 11]) && !unique.includes(7)) return "Major 7 (Shell)";
    if (hasIntervals(unique, [0, 3, 10]) && !unique.includes(7)) return "Minor 7 (Shell)";
    if (hasIntervals(unique, [0, 4, 10]) && !unique.includes(7)) return "Dominant 7 (Shell)";

    return "Unknown Shape";
}

function hasIntervals(source: number[], target: number[]): boolean {
    return target.every(t => source.includes(t));
}

// --- Voicing Shapes ---

export type VoicingType = 'triad_e' | 'triad_a' | 'shell_e' | 'shell_a' | 'triad_str123';

export function getVoicingNodes(root: Note, type: VoicingType, chordType: 'major' | 'minor' | 'dom7' | 'maj7' | 'min7'): Array<{ string: number; fret: number }> {
    const nodes: Array<{ string: number; fret: number }> = [];
    const rootPositions = getFretPositions(root);

    // Filter relevant root
    // Shell E: Root on Str 0 (Low E).
    if (type === 'shell_e') {
        const r = rootPositions.find(p => p.string === 0 && p.fret <= 12);
        if (!r) return [];
        nodes.push(r);

        // Shell: Root + 7th + 3rd (Standard Jazz Shell) OR Root + 3rd + 7th.
        // E String Root Shape Usually:
        // Root (Str 6)
        // 7th (Str 4, same fret or -1 or +1?) -> Dom7 (b7) is same fret on Str 4.
        // 3rd (Str 3, +1 fret for Major, same for Minor).

        // Logic:
        // R (Str 6, Fret X)
        // P5 (Str 5, Fret X+2) -> OMITTED in Shell
        // b7 (Str 4, Fret X). Maj7 (Str 4, Fret X+1).
        // 3M (Str 3, Fret X+1). 3m (Str 3, Fret X).

        let seventhFretOffset = 0; // Default b7 (same fret as root on Str 4)
        if (chordType === 'maj7') seventhFretOffset = 1;

        let thirdFretOffset = 1; // Default 3M (fret +1 on Str 3)
        if (chordType === 'minor' || chordType === 'min7') thirdFretOffset = 0;

        nodes.push({ string: 2, fret: r.fret + seventhFretOffset }); // D String (Index 2) is the 7th? Wait.
        // Tuning: E A D G B E
        // Idx:    0 1 2 3 4 5
        // Root Str 0 (E).
        // +2 Str -> Str 2 (D). Perfect 4th from A? No.
        // E -> A (P4) -> D (P4). 
        // Interval E to D is m7 (+10 semitones).
        // So Same Fret on String 2 (D) is indeed a m7 (b7) relative to String 0 (E). CORRECT.

        nodes.push({ string: 2, fret: r.fret + (chordType === 'maj7' ? 1 : 0) }); // The 7th

        // The 3rd is on String 3 (G).
        // Interval E to G is m3 (+3 semitones).
        // So Same Fret on String 3 (G) is a m3 (b3) relative to E.
        // Major 3rd would be +1 fret.
        nodes.push({ string: 3, fret: r.fret + (['major', 'maj7', 'dom7'].includes(chordType) ? 1 : 0) }); // The 3rd

    } else if (type === 'shell_a') {
        const r = rootPositions.find(p => p.string === 1 && p.fret <= 12); // A String (Index 1)
        if (!r) return [];
        nodes.push(r);

        // A String Root Shape:
        // R (Str 1)
        // 3rd is on Str 2 (D). 
        // A -> D is P4.
        // A open to D open is 5 semitones. 
        // Wait. E->A is 5. A->D is 5. D->G is 5. G->B is 4. B->E is 5.
        // Interval A to D is P4 (+5 semitones).
        // 3M is 4 semitones. So -1 fret.
        // 3m is 3 semitones. So -2 frets.

        // 7th is on Str 3 (G).
        // A -> G is m7 (+10 semitones). 
        // So Same Fret is b7.

        // Visual shape usually:
        // Root (Str 1, Fret X)
        // 3M (Str 2, Fret X-1). 3m (Str 2, Fret X-2?? No that's hard reach).
        // Wait, typical C7 shape (Root A string):
        // C (Str 1, Fret 3).
        // E (3M) (Str 2, Fret 2) -> -1 fret. Correct.
        // Bb (b7) (Str 3, Fret 3) -> Same fret. Correct.

        const thirdOffset = ['major', 'maj7', 'dom7'].includes(chordType) ? -1 : -2; // -1 for Maj, -2 for Min (if physically possible)
        const seventhOffset = chordType === 'maj7' ? 1 : 0; // 0 for b7, +1 for 7

        nodes.push({ string: 2, fret: r.fret + thirdOffset });
        if (['dom7', 'maj7', 'min7'].includes(chordType)) {
            nodes.push({ string: 3, fret: r.fret + seventhOffset });
        }
    }

    // Triads 1-2-3 (User's notes)
    // Shapes: Root on 1 (Shape Fa), Root on 2 (Shape Re), Root on 3 (Shape La).
    // We can auto-detect closest comfortable position or return all 3?

    return nodes;
}

// --- Transposition Logic ---

export function transposeChord(chord: string, semitones: number): string {
    if (!chord) return chord;

    // Regex to separate Root (and optional accidental) from the rest
    // Matches: [A-G] followed optionally by [#b]
    const match = chord.match(/^([A-G][#b]?)(.*)$/);
    if (!match) return chord; // Return original if unknown format (e.g. N.C.)

    const root = match[1];
    const suffix = match[2];

    // Determine current index
    let index = NOTES_SHARP.indexOf(root);
    if (index === -1) index = NOTES_FLAT.indexOf(root);
    if (index === -1) return chord; // Should not happen if regex matched

    // Calculate new index
    let newIndex = (index + semitones) % 12;
    if (newIndex < 0) newIndex += 12;

    // Choose target array (Sharp or Flat) based on simple heuristic or random access
    // For simplicity, we default to SHARPS unless the new key suggests FLATS.
    // Ideally we'd pass the target Key Signature to this function, but for MVP:
    const newRoot = NOTES_SHARP[newIndex];

    return newRoot + suffix;
}

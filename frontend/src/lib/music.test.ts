import { describe, it, expect } from 'vitest';
import {
    getNoteAt,
    getInterval,
    identifyChord,
    getIslandsNodes,
    getVoicingNodes,
    NOTES_SHARP
} from './music';

describe('Music Logic', () => {

    describe('getNoteAt', () => {
        it('should correctly calculate open strings', () => {
            // Standard Tuning: E A D G B E
            expect(getNoteAt(0, 0)).toBe('E'); // Low E
            expect(getNoteAt(1, 0)).toBe('A');
            expect(getNoteAt(2, 0)).toBe('D');
            expect(getNoteAt(3, 0)).toBe('G');
            expect(getNoteAt(4, 0)).toBe('B');
            expect(getNoteAt(5, 0)).toBe('E'); // High E
        });

        it('should correctly calculate fretted notes', () => {
            expect(getNoteAt(0, 1)).toBe('F'); // Low E string, 1st fret
            expect(getNoteAt(0, 12)).toBe('E'); // Low E string, 12th fret (Octave)
            expect(getNoteAt(1, 2)).toBe('B'); // A string, 2nd fret
            expect(getNoteAt(4, 1)).toBe('C'); // B string, 1st fret
        });
    });

    describe('getInterval', () => {
        it('should calculate intervals correctly', () => {
            expect(getInterval('C', 'C')).toBe(0); // Unison
            expect(getInterval('C', 'E')).toBe(4); // Major 3rd
            expect(getInterval('C', 'G')).toBe(7); // Perfect 5th
            expect(getInterval('A', 'C')).toBe(3); // Minor 3rd (A -> B -> C = 2? No. A->A#->B->C = 3)
            // A(9) -> C(0). 0-9 = -9. +12 = 3. Correct.
            expect(getInterval('G', 'C')).toBe(5); // Perfect 4th (G->G#->A->A#->B->C = 5)
        });
    });

    describe('identifyChord', () => {
        it('should identify basic triads', () => {
            expect(identifyChord([0, 4, 7])).toBe('Major'); // C E G
            expect(identifyChord([0, 3, 7])).toBe('Minor'); // C Eb G
            expect(identifyChord([0, 3, 6])).toBe('Diminished');
        });

        it('should identify 7th chords', () => {
            expect(identifyChord([0, 4, 7, 10])).toBe('Dominant 7');
            expect(identifyChord([0, 4, 7, 11])).toBe('Major 7');
            expect(identifyChord([0, 3, 7, 10])).toBe('Minor 7');
        });

        it('should identify shell chords (omitted 5th)', () => {
            expect(identifyChord([0, 4, 10])).toBe('Dominant 7 (Shell)');
            expect(identifyChord([0, 3, 10])).toBe('Minor 7 (Shell)');
            expect(identifyChord([0, 4, 11])).toBe('Major 7 (Shell)');
        });

        it('should handle scrambled input', () => {
            expect(identifyChord([7, 0, 4])).toBe('Major'); // Order shouldn't matter
        });
    });

    describe('Islands Logic (Octave Centers)', () => {
        it('should return R-3-5 clusters for a given Root', () => {
            // Root 'A' (Str 0, Fret 5)
            // Island should include R(5), 3(Str 1, Fret 4?), 5(Str 1, Fret 7?).
            // Wait, logic in getIslandsNodes returns ALL R,3,5 notes properly?

            const nodes = getIslandsNodes('A');
            // Check if it includes A on Low E (Fret 5)
            expect(nodes).toContainEqual({ string: 0, fret: 5 });

            // Check major 3rd of A (C#)
            // On low E string, C# is fret 9.
            expect(nodes).toContainEqual({ string: 0, fret: 9 });

            // Check 5th of A (E)
            // On low E string, E is fret 0 and 12.
            expect(nodes).toContainEqual({ string: 0, fret: 0 });
            expect(nodes).toContainEqual({ string: 0, fret: 12 });
        });
    });

    describe('Voicing Shapes', () => {
        it('should calculate Shell E shapes correctly', () => {
            // Root G (Str 0, Fret 3)
            // Shell E for G Dominant 7:
            // R (Str 0, Fret 3)
            // b7 (Str 2, Fret 3) -> F
            // 3M (Str 3, Fret 4) -> B

            const nodes = getVoicingNodes('G', 'shell_e', 'dom7');
            expect(nodes).toContainEqual({ string: 0, fret: 3 }); // Root
            expect(nodes).toContainEqual({ string: 2, fret: 3 }); // b7
            expect(nodes).toContainEqual({ string: 3, fret: 4 }); // 3M
        });

        it('should calculate Shell A shapes correctly', () => {
            // Root C (Str 1, Fret 3)
            // Shell A for C Dominant 7:
            // R (Str 1, Fret 3)
            // 3M (Str 2, Fret 2) -> E (-1 fret)
            // b7 (Str 3, Fret 3) -> Bb (same fret)

            const nodes = getVoicingNodes('C', 'shell_a', 'dom7');
            expect(nodes).toContainEqual({ string: 1, fret: 3 }); // Root
            expect(nodes).toContainEqual({ string: 2, fret: 2 }); // 3M
            expect(nodes).toContainEqual({ string: 3, fret: 3 }); // b7
        });

        it('should calculate Shell A Minor 7 correctly', () => {
            // Root C (Str 1, Fret 3)
            // Min 7:
            // 3m (Str 2, Fret 1) -> Eb (-2 frets)
            // b7 (Str 3, Fret 3) -> Bb (same fret)

            const nodes = getVoicingNodes('C', 'shell_a', 'min7');
            expect(nodes).toContainEqual({ string: 1, fret: 3 }); // Root
            expect(nodes).toContainEqual({ string: 2, fret: 1 }); // 3m
            expect(nodes).toContainEqual({ string: 3, fret: 3 }); // b7
        });
    });

});

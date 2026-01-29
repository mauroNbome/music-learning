import { Note } from "@/lib/music";

export interface LessonSection {
    id: string;
    title: string;
    content: string; // Markdown supported

    // Tool Configuration for this section
    tool: 'fretboard' | 'constructor';
    toolConfig?: {
        rootNote?: Note;
        intervals?: number[]; // For Fretboard or Constructor
        mode?: 'map' | 'shell_e' | 'shell_a'; // For Constructor
        description?: string; // Floating hint
    };
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
    sections: LessonSection[];
}

export const LESSONS: Lesson[] = [
    {
        id: 'intervals-101',
        title: 'Level 1: The Atoms (Intervals)',
        description: 'Music is distance. Learn the "Shapes" of sound before you build chords.',
        difficulty: 'Beginner',
        sections: [
            {
                id: 'intro',
                title: 'The Concept of Distance',
                content: `
### What is an Interval?
In music, an **Interval** is simply the distance between two notes. 

Just like geometry, these distances have **fixed shapes** on the guitar fretboard. If you memorize the shape, you can play it anywhere.
                `,
                tool: 'fretboard',
                toolConfig: {
                    rootNote: 'C',
                    intervals: [0], // Just Root
                    description: "This is a Root Note (C). Click it to hear it."
                }
            },
            {
                id: 'perfect-5th',
                title: 'The Perfect 5th (Power)',
                content: `
### The Power Chord Shape
The **Perfect 5th** is the most stable interval in music. It sounds strong, open, and powerful.

On the guitar, it's always **one string down, two frets over**.
(Visual Tip: It looks like a Knight's move in Chess).
                `,
                tool: 'fretboard',
                toolConfig: {
                    rootNote: 'C',
                    intervals: [0, 7], // Root + 5th
                    description: "Root (Red) + 5th (Blue). The Power Chord."
                }
            },
            {
                id: 'major-3rd',
                title: 'The Major 3rd (Happy)',
                content: `
### The Source of "Happy"
The **Major 3rd** defines a Major chord. It sounds bright and resolved.

On the guitar, it's usually **one string down, one fret back**.
Note how it's visually "closer" than the 5th.
                `,
                tool: 'fretboard',
                toolConfig: {
                    rootNote: 'C',
                    intervals: [0, 4], // Root + 3M
                    description: "Root + Major 3rd. Notice the diagonal shape."
                }
            }
        ]
    },
    {
        id: 'triads-101',
        title: 'Level 2: The Molecules (Triads)',
        description: 'Stacking intervals to build the fundamental blocks of harmony.',
        difficulty: 'Beginner',
        sections: [
            {
                id: 'major-triad',
                title: 'Building Major',
                content: `
### The Major Formula
A Major Triad is: **Root + Major 3rd + Perfect 5th**.

1. Start with Root.
2. Add the "Happy" 3rd.
3. Add the "Power" 5th.
                `,
                tool: 'constructor',
                toolConfig: {
                    rootNote: 'C',
                    intervals: [0, 4, 7],
                    mode: 'map',
                    description: "C Major Triad. Standard Closed Voicing."
                }
            }
        ]
    },
    {
        id: 'shells-101',
        title: 'Level 3: Jazz Shells',
        description: 'Play like a pro by stripping away the non-essentials.',
        difficulty: 'Intermediate',
        sections: [
            {
                id: 'shell-concept',
                title: 'Why Shells?',
                content: `
### Less is More
In Jazz, you often play with a bassist and pianist. If you play huge 6-string barre chords, you clash with them.

**Shell Voicings** play only the:
1. **Root** (Defines the chord name)
2. **3rd** (Defines Major/Minor)
3. **7th** (Defines Function)

We skip the 5th!
                `,
                tool: 'constructor',
                toolConfig: {
                    rootNote: 'C',
                    intervals: [0],
                    mode: 'shell_e',
                    description: "Switching to Shell Mode..."
                }
            },
            {
                id: 'shell-major7',
                title: 'Major 7 Shell (E String)',
                content: `
### The E-String Shape
Root on Low E.
7th on D String.
3rd on G String.

Notice how compact this is. It leaves room for melody!
                 `,
                tool: 'constructor',
                toolConfig: {
                    rootNote: 'G',
                    intervals: [0, 4, 11], // Maj7
                    mode: 'shell_e',
                    description: "G Major 7 Shell. Root on Low E."
                }
            }
        ]
    }
];

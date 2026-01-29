import * as Tone from 'tone';

// Professional "Smooth" Guitar/Keys Tone
// Using a PolySynth with effects chain to create a spacious, dreamy sound.

class AudioManager {
    private synth: Tone.PolySynth | null = null;
    private reverb: Tone.Reverb | null = null;
    private chorus: Tone.Chorus | null = null;
    private limiter: Tone.Limiter | null = null;
    private initialized = false;

    async init() {
        if (this.initialized) return;

        // 1. Start Audio Context (must be triggered by user interaction first technically, but we handle it lazily)
        await Tone.start();

        // 2. Create Effects Chain
        // Limiter to prevent harsh clipping on big chords
        this.limiter = new Tone.Limiter(-1);

        // Reverb for "Space" (Dreamy feel)
        this.reverb = new Tone.Reverb({
            decay: 3,
            wet: 0.3,
            preDelay: 0.01
        });

        // Chorus for "Width" and "Smoothness" (wobbly warmth)
        this.chorus = new Tone.Chorus({
            frequency: 1.5,
            delayTime: 3.5,
            depth: 0.7,
            wet: 0.1
        }).start();

        // 3. Create Synth
        // using FMSynth for a bell-like, clean electric piano/guitar hybrid tone
        this.synth = new Tone.PolySynth(Tone.FMSynth, {
            harmonicity: 3,
            modulationIndex: 3.5,
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.001,
                decay: 0.3,
                sustain: 0.3,
                release: 1.5
            },
            modulation: { type: 'triangle' },
            modulationEnvelope: {
                attack: 0.002,
                decay: 0.2,
                sustain: 0.1,
                release: 0.5
            }
        });

        // 4. Connect Chain: Synth -> Chorus -> Reverb -> Limiter -> Output
        this.synth.chain(this.chorus, this.reverb, this.limiter, Tone.Destination);

        // Adjust Volume
        this.synth.volume.value = -6;

        this.initialized = true;
    }

    /**
     * Plays a single note
     * @param note Frequency or Note name (e.g. "C4")
     * @param duration Duration (e.g. "8n")
     */
    playNote(note: string, duration: string = '2n') {
        this.ensureInit();
        // Add random velocity for "human" feel
        const velocity = 0.5 + Math.random() * 0.3;
        this.synth?.triggerAttackRelease(note, duration, undefined, velocity);
    }

    /**
     * Plays a strummed chord
     * @param notes Array of notes (e.g. ["C4", "E4", "G4"])
     * @param staggerMs Milliseconds delay between notes for "strum" effect
     */
    playChord(notes: string[], staggerMs: number = 30) {
        this.ensureInit();
        const now = Tone.now();

        notes.forEach((note, index) => {
            // Stagger start times for "strumming" (Human feel)
            // Strum direction usually Low to High, assume input sorted or random?
            // Let's assume input is random, but strumming usually is consistent.
            // We'll strum in order of array.
            const time = now + (index * (staggerMs / 1000));
            const velocity = 0.5 + Math.random() * 0.3;
            // Longer duration for chords to ring out
            this.synth?.triggerAttackRelease(note, "1n", time, velocity);
        });
    }

    private ensureInit() {
        if (!this.initialized) {
            this.init().catch(e => console.error("Audio init failed", e));
        }
    }
}

// Export Singleton
export const musicAudio = new AudioManager();

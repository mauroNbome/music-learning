export interface SongChord {
    raw: string;
    root: string;
    quality: string;
    function?: string;
    recommended_scale?: string;
    voice_leading?: string;
    substitution?: string;
}

export interface SongSection {
    name: string;
    key: string;
    chords: SongChord[];
    lyrics?: string;
    emotion?: string;
}

export interface Song {
    id?: string;
    title: string;
    artist: string;
    key_signature: string;
    estimated_tempo?: string;
    sections: SongSection[];
    overall_sentiment: string;
    performance_lines?: string[];
}

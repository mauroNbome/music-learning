import { Song } from "@/types/song";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";
console.log("🎵 API CONFIG:", { env: process.env.NEXT_PUBLIC_API_URL, resolved: API_URL });

export async function analyzeSong(rawText: string): Promise<Song> {
    const response = await fetch(`${API_URL}/songbook/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw_text: rawText }),
    });

    if (!response.ok) {
        throw new Error("Failed to analyze song");
    }

    return response.json();
}

export async function getSongs(): Promise<Song[]> {
    const response = await fetch(`${API_URL}/songbook/`);
    if (!response.ok) throw new Error("Failed to fetch songs");
    return response.json();
}

export async function deleteSong(id: string): Promise<void> {
    const res = await fetch(`${API_URL}/songbook/${id}`, {
        method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete song');
}

export async function saveSong(song: Song): Promise<Song> {
    const response = await fetch(`${API_URL}/songbook/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(song),
    });
    if (!response.ok) throw new Error("Failed to save song");
    return response.json();
}

export async function getSongById(id: string): Promise<Song> {
    const response = await fetch(`${API_URL}/songbook/${id}`);
    if (!response.ok) throw new Error("Failed to fetch song");
    return response.json();
}

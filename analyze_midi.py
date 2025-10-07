#!/usr/bin/env python3
"""
Analyze MIDI files and extract chord progressions
"""
import mido
import sys
from collections import defaultdict

# MIDI note to note name mapping
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_note_name(midi_num):
    """Convert MIDI number to note name with octave"""
    octave = (midi_num // 12) - 1
    note = NOTE_NAMES[midi_num % 12]
    return f"{note}{octave}"

def analyze_midi_file(filepath):
    """Analyze a MIDI file and extract chord information"""
    print(f"\n{'='*60}")
    print(f"Analyzing: {filepath}")
    print(f"{'='*60}\n")
    
    mid = mido.MidiFile(filepath)
    
    # Print basic info
    print(f"Type: {mid.type}")
    print(f"Ticks per beat: {mid.ticks_per_beat}")
    print(f"Number of tracks: {len(mid.tracks)}")
    print(f"Length: {mid.length:.2f} seconds\n")
    
    # Analyze each track
    for i, track in enumerate(mid.tracks):
        print(f"\n--- Track {i}: {track.name} ---")
        
        # Collect note events
        current_time = 0
        notes_by_time = defaultdict(list)
        active_notes = {}
        
        for msg in track:
            current_time += msg.time
            
            if msg.type == 'note_on' and msg.velocity > 0:
                active_notes[msg.note] = current_time
                notes_by_time[current_time].append(msg.note)
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                if msg.note in active_notes:
                    del active_notes[msg.note]
        
        # Print chords grouped by time
        if notes_by_time:
            print(f"\nChords found (time: notes):")
            for time in sorted(notes_by_time.keys())[:20]:  # First 20 events
                notes = notes_by_time[time]
                note_names = [midi_to_note_name(n) for n in sorted(notes)]
                print(f"  Time {time:6d}: {', '.join(note_names)} (MIDI: {notes})")
        else:
            print("  No note events found")
    
    print(f"\n{'='*60}\n")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 analyze_midi.py <midi_file1> [midi_file2] ...")
        sys.exit(1)
    
    for filepath in sys.argv[1:]:
        try:
            analyze_midi_file(filepath)
        except Exception as e:
            print(f"Error analyzing {filepath}: {e}")

#!/usr/bin/env python3
"""
Convert MIDI files to Chord Progression Studio JSON format
Preserves exact MIDI notes and timing
"""
import mido
import json
import sys
from collections import defaultdict

# MIDI note to note name mapping
NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

def midi_to_note_name(midi_num):
    """Convert MIDI number to note name with octave"""
    octave = (midi_num // 12) - 1
    note = NOTE_NAMES[midi_num % 12]
    return f"{note}{octave}"

def detect_chord_symbol(midi_notes):
    """Try to detect chord symbol from MIDI notes"""
    if not midi_notes:
        return "?"
    
    # Sort notes
    notes = sorted(midi_notes)
    root_midi = notes[0]
    root_name = NOTE_NAMES[root_midi % 12]
    
    # Calculate intervals from root
    intervals = [(n - root_midi) % 12 for n in notes]
    intervals_set = set(intervals)
    
    # Detect chord quality
    if intervals_set == {0, 3, 7}:
        return f"{root_name}m"  # Minor
    elif intervals_set == {0, 4, 7}:
        return root_name  # Major
    elif intervals_set == {0, 3, 6}:
        return f"{root_name}dim"  # Diminished
    elif intervals_set == {0, 4, 8}:
        return f"{root_name}aug"  # Augmented
    elif intervals_set == {0, 5, 7}:
        return f"{root_name}sus4"  # Sus4
    elif intervals_set == {0, 2, 7}:
        return f"{root_name}sus2"  # Sus2
    elif intervals_set == {0, 4, 7, 10}:
        return f"{root_name}7"  # Dominant 7th
    elif intervals_set == {0, 4, 7, 11}:
        return f"{root_name}maj7"  # Major 7th
    elif intervals_set == {0, 3, 7, 10}:
        return f"{root_name}m7"  # Minor 7th
    else:
        # Unknown chord, just use root
        return root_name

def midi_to_json(filepath, bars_per_beat=4, ticks_per_bar=None):
    """Convert MIDI file to JSON format"""
    mid = mido.MidiFile(filepath)
    
    # Auto-detect ticks per bar if not specified
    if ticks_per_bar is None:
        ticks_per_bar = mid.ticks_per_beat * bars_per_beat
    
    print(f"Converting: {filepath}")
    print(f"Ticks per beat: {mid.ticks_per_beat}")
    print(f"Ticks per bar: {ticks_per_bar}")
    
    # Collect all note events
    current_time = 0
    chords_by_bar = defaultdict(list)
    active_notes = {}
    
    for track in mid.tracks:
        current_time = 0
        for msg in track:
            current_time += msg.time
            
            if msg.type == 'note_on' and msg.velocity > 0:
                bar_num = (current_time // ticks_per_bar) + 1
                if msg.note not in active_notes:
                    active_notes[msg.note] = bar_num
                    
                    # Add note to this bar's chord
                    if msg.note not in chords_by_bar[bar_num]:
                        chords_by_bar[bar_num].append(msg.note)
            
            elif msg.type == 'note_off' or (msg.type == 'note_on' and msg.velocity == 0):
                if msg.note in active_notes:
                    del active_notes[msg.note]
    
    # Build progression
    progression = []
    for bar_num in sorted(chords_by_bar.keys()):
        midi_notes = sorted(chords_by_bar[bar_num])
        note_names = [midi_to_note_name(n) for n in midi_notes]
        symbol = detect_chord_symbol(midi_notes)
        
        # Detect inversions
        if len(midi_notes) >= 3:
            root_note = midi_notes[0] % 12
            lowest_note = midi_notes[0] % 12
            if root_note != lowest_note:
                # This is an inversion
                bass_name = NOTE_NAMES[lowest_note]
                symbol = f"{symbol}/{bass_name}"
        
        chord = {
            "symbol": symbol,
            "root": NOTE_NAMES[midi_notes[0] % 12] if midi_notes else "C",
            "quality": symbol.replace(NOTE_NAMES[midi_notes[0] % 12], "") if midi_notes else "",
            "midiNotes": midi_notes,
            "noteNames": note_names
        }
        
        progression.append({
            "barNum": bar_num,
            "chords": [chord]
        })
    
    # Build JSON output
    output = {
        "version": "3.0",
        "progression": progression,
        "bpm": 120,
        "loopStart": 1,
        "loopEnd": len(progression)
    }
    
    return output

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 midi_to_json.py <midi_file1> [midi_file2] ...")
        print("\nConverts MIDI files to Chord Progression Studio JSON format")
        sys.exit(1)
    
    all_progressions = []
    
    for filepath in sys.argv[1:]:
        try:
            result = midi_to_json(filepath)
            all_progressions.extend(result["progression"])
            print(f"✓ Converted {len(result['progression'])} bars from {filepath}\n")
        except Exception as e:
            print(f"✗ Error converting {filepath}: {e}\n")
    
    # Combine all progressions
    if all_progressions:
        # Renumber bars sequentially
        for i, bar in enumerate(all_progressions):
            bar["barNum"] = i + 1
        
        combined = {
            "version": "3.0",
            "progression": all_progressions,
            "bpm": 120,
            "loopStart": 1,
            "loopEnd": len(all_progressions)
        }
        
        # Output JSON
        output_file = "combined_progression.json"
        with open(output_file, 'w') as f:
            json.dump(combined, f, indent=2)
        
        print(f"\n✓ Saved {len(all_progressions)} bars to {output_file}")
        print(f"\nPreview:")
        for bar in all_progressions[:8]:  # Show first 8 bars
            chord = bar["chords"][0]
            print(f"  Bar {bar['barNum']}: {chord['symbol']} - {chord['noteNames']}")
    else:
        print("No bars converted!")

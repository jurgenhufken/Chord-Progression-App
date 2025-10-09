/**
 * Channel 2 Follow Mode - POC Module
 * 
 * Generates MIDI patterns that follow the chord progression
 * Patterns: broken chord, arpeggio up/down, block chords
 */

class Channel2FollowMode {
    constructor(app) {
        this.app = app;
        this.enabled = false;
        
        // Available patterns
        this.patterns = {
            'broken_chord': {
                name: 'Broken Chord',
                description: 'C-E-G-C pattern',
                generate: this.generateBrokenChord.bind(this)
            },
            'arpeggio_up': {
                name: 'Arpeggio Up',
                description: 'Ascending arpeggio',
                generate: this.generateArpeggioUp.bind(this)
            },
            'arpeggio_down': {
                name: 'Arpeggio Down',
                description: 'Descending arpeggio',
                generate: this.generateArpeggioDown.bind(this)
            },
            'alberti': {
                name: 'Alberti Bass',
                description: 'C-G-E-G pattern',
                generate: this.generateAlberti.bind(this)
            },
            'block': {
                name: 'Block Chord',
                description: 'All notes together',
                generate: this.generateBlock.bind(this)
            },
            'waltz': {
                name: 'Waltz Bass',
                description: 'Root - chord - chord',
                generate: this.generateWaltz.bind(this)
            }
        };
        
        // Current settings
        this.currentPattern = 'broken_chord';
        this.octave = 0; // Octave shift (-2 to +2)
        this.velocity = 80; // Base velocity (0-127)
        this.humanize = 0.05; // Timing humanization (0-0.2)
    }
    
    /**
     * Enable Follow Mode
     */
    enable() {
        this.enabled = true;
        console.log('🎵 Follow Mode ENABLED');
    }
    
    /**
     * Disable Follow Mode
     */
    disable() {
        this.enabled = false;
        console.log('🎵 Follow Mode DISABLED');
    }
    
    /**
     * Set pattern type
     */
    setPattern(patternName) {
        if (this.patterns[patternName]) {
            this.currentPattern = patternName;
            console.log(`🎵 Pattern set to: ${this.patterns[patternName].name}`);
        }
    }
    
    /**
     * Generate notes for a chord
     * @param {Object} chord - { root, type, midiNotes }
     * @param {number} barDuration - Duration of bar in seconds
     * @returns {Array} Array of { midi, start, duration, velocity }
     */
    generateNotes(chord, barDuration) {
        if (!chord || !chord.midiNotes || chord.midiNotes.length === 0) {
            console.warn('⚠️ Follow Mode: No chord notes provided');
            return [];
        }
        
        const pattern = this.patterns[this.currentPattern];
        if (!pattern) {
            console.error('❌ Follow Mode: Invalid pattern:', this.currentPattern);
            return [];
        }
        
        // Get unique sorted notes
        const chordNotes = [...new Set(chord.midiNotes)].sort((a, b) => a - b);
        
        // Apply octave shift
        const shiftedNotes = chordNotes.map(n => n + (this.octave * 12));
        
        // Generate pattern
        const notes = pattern.generate(shiftedNotes, barDuration);
        
        // Apply humanization
        if (this.humanize > 0) {
            notes.forEach(note => {
                const randomOffset = (Math.random() - 0.5) * this.humanize;
                note.start += randomOffset;
                note.start = Math.max(0, note.start); // Don't go negative
            });
        }
        
        console.log(`🎵 Generated ${notes.length} notes (${pattern.name})`);
        return notes;
    }
    
    /**
     * Pattern: Broken Chord (C-E-G-C)
     */
    generateBrokenChord(chordNotes, barDuration) {
        const notes = [];
        const noteCount = Math.min(4, chordNotes.length + 1);
        const noteLength = barDuration / noteCount;
        
        // C-E-G-C pattern
        for (let i = 0; i < noteCount; i++) {
            const noteIdx = i < chordNotes.length ? i : 0; // Last note = root again
            notes.push({
                midi: chordNotes[noteIdx],
                start: i * noteLength,
                duration: noteLength * 0.9, // 90% to create slight gap
                velocity: this.velocity
            });
        }
        
        return notes;
    }
    
    /**
     * Pattern: Arpeggio Up (C-E-G-C-E-G...)
     */
    generateArpeggioUp(chordNotes, barDuration) {
        const notes = [];
        const notesPerBar = 8; // 8th notes
        const noteLength = barDuration / notesPerBar;
        
        for (let i = 0; i < notesPerBar; i++) {
            const noteIdx = i % chordNotes.length;
            notes.push({
                midi: chordNotes[noteIdx],
                start: i * noteLength,
                duration: noteLength * 0.8,
                velocity: this.velocity - (i % 4) * 5 // Slight velocity variation
            });
        }
        
        return notes;
    }
    
    /**
     * Pattern: Arpeggio Down (C-G-E-C-G-E...)
     */
    generateArpeggioDown(chordNotes, barDuration) {
        const notes = [];
        const notesPerBar = 8;
        const noteLength = barDuration / notesPerBar;
        const reversed = [...chordNotes].reverse();
        
        for (let i = 0; i < notesPerBar; i++) {
            const noteIdx = i % reversed.length;
            notes.push({
                midi: reversed[noteIdx],
                start: i * noteLength,
                duration: noteLength * 0.8,
                velocity: this.velocity - (i % 4) * 5
            });
        }
        
        return notes;
    }
    
    /**
     * Pattern: Alberti Bass (C-G-E-G)
     */
    generateAlberti(chordNotes, barDuration) {
        const notes = [];
        
        if (chordNotes.length < 3) {
            // Fallback to broken chord
            return this.generateBrokenChord(chordNotes, barDuration);
        }
        
        const noteLength = barDuration / 4;
        const pattern = [
            chordNotes[0],                    // Root
            chordNotes[chordNotes.length - 1], // Top note
            chordNotes[1],                    // Middle note
            chordNotes[chordNotes.length - 1]  // Top note again
        ];
        
        pattern.forEach((midi, i) => {
            notes.push({
                midi,
                start: i * noteLength,
                duration: noteLength * 0.9,
                velocity: this.velocity
            });
        });
        
        return notes;
    }
    
    /**
     * Pattern: Block Chord (all notes together)
     */
    generateBlock(chordNotes, barDuration) {
        const notes = [];
        const duration = barDuration * 0.95; // Hold for most of the bar
        
        chordNotes.forEach((midi, idx) => {
            notes.push({
                midi,
                start: 0,
                duration,
                velocity: this.velocity - (idx * 3) // Slight velocity layering
            });
        });
        
        return notes;
    }
    
    /**
     * Pattern: Waltz Bass (Root - Chord - Chord)
     */
    generateWaltz(chordNotes, barDuration) {
        const notes = [];
        const beatLength = barDuration / 3; // 3/4 time
        
        // Beat 1: Root note (low)
        notes.push({
            midi: chordNotes[0],
            start: 0,
            duration: beatLength * 0.9,
            velocity: this.velocity + 10 // Accent
        });
        
        // Beat 2 & 3: Chord (higher notes)
        const upperNotes = chordNotes.slice(1);
        for (let beat = 1; beat < 3; beat++) {
            upperNotes.forEach((midi, idx) => {
                notes.push({
                    midi,
                    start: beat * beatLength,
                    duration: beatLength * 0.8,
                    velocity: this.velocity - 10 - (idx * 3)
                });
            });
        }
        
        return notes;
    }
    
    /**
     * Get list of available patterns
     */
    getPatternList() {
        return Object.entries(this.patterns).map(([key, pattern]) => ({
            key,
            name: pattern.name,
            description: pattern.description
        }));
    }
}

// Export to global scope
window.Channel2FollowMode = Channel2FollowMode;

console.log('✅ Channel2FollowMode module loaded');

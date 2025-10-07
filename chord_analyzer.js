// Advanced Chord Analyzer for Pattern Generation
// Analyzes MIDI notes to determine chord type, root, scale, and available notes

class ChordAnalyzer {
    constructor() {
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        
        // Chord templates (intervals from root)
        this.chordTemplates = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],
            'sus2': [0, 2, 7],
            'sus4': [0, 5, 7],
            '7': [0, 4, 7, 10],
            'maj7': [0, 4, 7, 11],
            'm7': [0, 3, 7, 10],
            'dim7': [0, 3, 6, 9]
        };
        
        // Scale templates
        this.scaleTemplates = {
            'major': [0, 2, 4, 5, 7, 9, 11],
            'minor': [0, 2, 3, 5, 7, 8, 10],
            'harmonic_minor': [0, 2, 3, 5, 7, 8, 11],
            'melodic_minor': [0, 2, 3, 5, 7, 9, 11],
            'dorian': [0, 2, 3, 5, 7, 9, 10],
            'phrygian': [0, 1, 3, 5, 7, 8, 10],
            'lydian': [0, 2, 4, 6, 7, 9, 11],
            'mixolydian': [0, 2, 4, 5, 7, 9, 10],
            'locrian': [0, 1, 3, 5, 6, 8, 10]
        };
    }
    
    /**
     * Analyze MIDI notes to determine chord properties
     * @param {Array<number>} midiNotes - Array of MIDI note numbers
     * @returns {Object} Chord analysis with root, quality, scale, etc.
     */
    analyzeChord(midiNotes) {
        if (!midiNotes || midiNotes.length === 0) {
            return null;
        }
        
        // Sort notes
        const sortedNotes = [...midiNotes].sort((a, b) => a - b);
        
        // Get pitch classes (0-11)
        const pitchClasses = sortedNotes.map(n => n % 12);
        const uniquePitches = [...new Set(pitchClasses)];
        
        // Try each note as potential root
        let bestMatch = null;
        let bestScore = 0;
        
        for (const rootPitch of uniquePitches) {
            // Calculate intervals from this root
            const intervals = uniquePitches.map(p => (p - rootPitch + 12) % 12).sort((a, b) => a - b);
            
            // Try to match with chord templates
            for (const [quality, template] of Object.entries(this.chordTemplates)) {
                const score = this.matchScore(intervals, template);
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = {
                        root: rootPitch,
                        rootName: this.noteNames[rootPitch],
                        quality: quality,
                        intervals: intervals,
                        pitchClasses: uniquePitches,
                        bassNote: sortedNotes[0] % 12,
                        isInversion: (sortedNotes[0] % 12) !== rootPitch
                    };
                }
            }
        }
        
        if (!bestMatch) {
            // Unknown chord, use lowest note as root
            bestMatch = {
                root: sortedNotes[0] % 12,
                rootName: this.noteNames[sortedNotes[0] % 12],
                quality: 'unknown',
                intervals: uniquePitches.map(p => (p - sortedNotes[0] % 12 + 12) % 12).sort((a, b) => a - b),
                pitchClasses: uniquePitches,
                bassNote: sortedNotes[0] % 12,
                isInversion: false
            };
        }
        
        // Determine scale
        bestMatch.scale = this.determineScale(bestMatch.root, bestMatch.quality);
        bestMatch.scaleNotes = this.getScaleNotes(bestMatch.root, bestMatch.scale);
        
        // Add inversion info
        if (bestMatch.isInversion) {
            const bassName = this.noteNames[bestMatch.bassNote];
            bestMatch.symbol = `${bestMatch.rootName}${bestMatch.quality === 'major' ? '' : bestMatch.quality}/${bassName}`;
        } else {
            bestMatch.symbol = `${bestMatch.rootName}${bestMatch.quality === 'major' ? '' : bestMatch.quality}`;
        }
        
        return bestMatch;
    }
    
    /**
     * Calculate match score between intervals and template
     */
    matchScore(intervals, template) {
        let score = 0;
        for (const interval of template) {
            if (intervals.includes(interval)) {
                score += 1;
            }
        }
        // Penalize extra notes
        score -= (intervals.length - template.length) * 0.5;
        return score;
    }
    
    /**
     * Determine appropriate scale for chord
     */
    determineScale(root, quality) {
        if (quality === 'minor' || quality === 'm7') {
            return 'minor';
        } else if (quality === 'major' || quality === '7' || quality === 'maj7') {
            return 'major';
        } else if (quality === 'dim' || quality === 'dim7') {
            return 'locrian';
        } else if (quality === 'aug') {
            return 'major';
        } else {
            return 'major'; // default
        }
    }
    
    /**
     * Get all notes in a scale
     */
    getScaleNotes(root, scaleName) {
        const template = this.scaleTemplates[scaleName] || this.scaleTemplates['major'];
        return template.map(interval => (root + interval) % 12);
    }
    
    /**
     * Get chord tones (notes that are in the chord)
     */
    getChordTones(analysis) {
        if (!analysis) return [];
        return analysis.pitchClasses;
    }
    
    /**
     * Get available tensions (scale notes not in chord)
     */
    getAvailableTensions(analysis) {
        if (!analysis) return [];
        const chordTones = new Set(analysis.pitchClasses);
        return analysis.scaleNotes.filter(note => !chordTones.has(note));
    }
    
    /**
     * Analyze entire progression
     */
    analyzeProgression(progression) {
        return progression.map(bar => {
            const chord = bar.chords[0];
            const analysis = this.analyzeChord(chord.midiNotes);
            return {
                barNum: bar.barNum,
                originalSymbol: chord.symbol,
                analysis: analysis,
                midiNotes: chord.midiNotes
            };
        });
    }
}

// Export for use in main app
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ChordAnalyzer;
}

/**
 * Improved Chord Detector - POC Module
 * 
 * Features:
 * - Inversion detection (E-G-C → C/E)
 * - Confidence scoring
 * - Alternative chord suggestions
 * - Better interval matching
 */

class ImprovedChordDetector {
    constructor() {
        // Chord templates with intervals from root
        this.chordTemplates = {
            'major': [0, 4, 7],
            'minor': [0, 3, 7],
            'dim': [0, 3, 6],
            'aug': [0, 4, 8],
            'sus2': [0, 2, 7],
            'sus4': [0, 5, 7],
            'maj7': [0, 4, 7, 11],
            'min7': [0, 3, 7, 10],
            '7': [0, 4, 7, 10],
            'dim7': [0, 3, 6, 9],
            'maj9': [0, 4, 7, 11, 14],
            'min9': [0, 3, 7, 10, 14],
            '9': [0, 4, 7, 10, 14]
        };
        
        // Note names for display
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    }
    
    /**
     * Main detection method
     * @param {number[]} midiNotes - Array of MIDI note numbers
     * @returns {Object} { symbol, confidence, alternatives, root, type, inversion }
     */
    detect(midiNotes) {
        if (!midiNotes || midiNotes.length === 0) {
            return { symbol: '', confidence: 0, alternatives: [], root: null, type: null };
        }
        
        // Remove duplicates and sort
        const uniqueNotes = [...new Set(midiNotes)].sort((a, b) => a - b);
        
        // Normalize to pitch classes (0-11)
        const pitchClasses = uniqueNotes.map(n => n % 12);
        const uniquePitches = [...new Set(pitchClasses)].sort((a, b) => a - b);
        
        console.log('🔍 Detecting chord from pitches:', uniquePitches.map(p => this.noteNames[p]));
        
        // Try all possible roots
        const candidates = [];
        
        for (const root of uniquePitches) {
            const intervals = this.getIntervalsFromRoot(uniquePitches, root);
            const match = this.matchChordTemplate(intervals);
            
            if (match) {
                const confidence = this.calculateConfidence(intervals, match.template);
                candidates.push({
                    root,
                    type: match.type,
                    intervals,
                    confidence,
                    inversion: match.inversion
                });
            }
        }
        
        // Sort by confidence
        candidates.sort((a, b) => b.confidence - a.confidence);
        
        if (candidates.length === 0) {
            // Fallback: just show root note
            const root = uniquePitches[0];
            return {
                symbol: this.noteNames[root],
                confidence: 0.3,
                alternatives: [],
                root,
                type: null,
                inversion: 0
            };
        }
        
        // Best match
        const best = candidates[0];
        const symbol = this.formatChordSymbol(best);
        
        // Alternatives (top 3)
        const alternatives = candidates.slice(1, 4).map(c => this.formatChordSymbol(c));
        
        console.log(`✅ Detected: ${symbol} (confidence: ${(best.confidence * 100).toFixed(0)}%)`);
        if (alternatives.length > 0) {
            console.log(`   Alternatives: ${alternatives.join(', ')}`);
        }
        
        return {
            symbol,
            confidence: best.confidence,
            alternatives,
            root: best.root,
            type: best.type,
            inversion: best.inversion
        };
    }
    
    /**
     * Get intervals from a given root
     */
    getIntervalsFromRoot(pitchClasses, root) {
        return pitchClasses.map(pc => {
            let interval = pc - root;
            if (interval < 0) interval += 12;
            return interval;
        }).sort((a, b) => a - b);
    }
    
    /**
     * Match intervals against chord templates
     */
    matchChordTemplate(intervals) {
        let bestMatch = null;
        let bestScore = 0;
        let inversion = 0;
        
        // Try each chord type
        for (const [type, template] of Object.entries(this.chordTemplates)) {
            // Try different inversions
            for (let inv = 0; inv < template.length; inv++) {
                const rotated = this.rotateIntervals(template, inv);
                const score = this.compareIntervals(intervals, rotated);
                
                if (score > bestScore) {
                    bestScore = score;
                    bestMatch = { type, template, inversion: inv };
                }
            }
        }
        
        return bestScore > 0.5 ? bestMatch : null;
    }
    
    /**
     * Rotate intervals for inversion checking
     */
    rotateIntervals(template, rotation) {
        if (rotation === 0) return template;
        
        const rotated = [];
        for (let i = 0; i < template.length; i++) {
            const idx = (i + rotation) % template.length;
            let interval = template[idx] - template[rotation];
            if (interval < 0) interval += 12;
            rotated.push(interval);
        }
        return rotated.sort((a, b) => a - b);
    }
    
    /**
     * Compare two interval sets
     */
    compareIntervals(intervals1, intervals2) {
        const tolerance = 1; // Allow 1 semitone difference
        let matches = 0;
        
        for (const int1 of intervals1) {
            for (const int2 of intervals2) {
                if (Math.abs(int1 - int2) <= tolerance) {
                    matches++;
                    break;
                }
            }
        }
        
        // Score based on matches
        const maxLen = Math.max(intervals1.length, intervals2.length);
        return matches / maxLen;
    }
    
    /**
     * Calculate confidence score
     */
    calculateConfidence(intervals, template) {
        // Perfect match = 1.0
        // Close match = 0.8
        // Fuzzy match = 0.6
        
        let exactMatches = 0;
        let closeMatches = 0;
        
        for (const int of intervals) {
            if (template.includes(int)) {
                exactMatches++;
            } else {
                // Check if close (within 1 semitone)
                const hasClose = template.some(t => Math.abs(t - int) === 1);
                if (hasClose) closeMatches++;
            }
        }
        
        const exactScore = exactMatches / template.length;
        const closeScore = closeMatches / template.length * 0.5;
        
        return Math.min(exactScore + closeScore, 1.0);
    }
    
    /**
     * Format chord symbol for display
     */
    formatChordSymbol(candidate) {
        const rootName = this.noteNames[candidate.root];
        
        if (!candidate.type) {
            return rootName;
        }
        
        // Format chord type
        let typeStr = '';
        switch (candidate.type) {
            case 'major': typeStr = ''; break;
            case 'minor': typeStr = 'm'; break;
            case 'dim': typeStr = 'dim'; break;
            case 'aug': typeStr = 'aug'; break;
            case 'sus2': typeStr = 'sus2'; break;
            case 'sus4': typeStr = 'sus4'; break;
            case 'maj7': typeStr = 'maj7'; break;
            case 'min7': typeStr = 'm7'; break;
            case '7': typeStr = '7'; break;
            case 'dim7': typeStr = 'dim7'; break;
            case 'maj9': typeStr = 'maj9'; break;
            case 'min9': typeStr = 'm9'; break;
            case '9': typeStr = '9'; break;
            default: typeStr = candidate.type;
        }
        
        // Add inversion notation if needed
        let inversionStr = '';
        if (candidate.inversion > 0) {
            // For now, just show root position
            // Could add /bass notation later
        }
        
        return rootName + typeStr + inversionStr;
    }
}

// Export to global scope for app.js to use
window.ImprovedChordDetector = ImprovedChordDetector;

console.log('✅ ImprovedChordDetector module loaded');

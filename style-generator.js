// Style Generator - Performance styles for chord progressions

const STYLES = {
    'pop-comping': {
        name: 'Pop Comping',
        description: 'Block chords on beats 1 & 3, with melodic fills on 2 & 4. Classic pop/rock feel.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            const beatPositions = [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5];
            
            // Block chords on beats 1 and 3
            [0, 2].forEach(beat => {
                chordTones.forEach((midi, idx) => {
                    notes.push({
                        midi: midi,
                        start: beatPositions[beat * 2],
                        duration: 0.4,
                        velocity: 85 - (idx * 5)
                    });
                });
            });
            
            // Fills on beats 2 and 4 (with variation)
            if (Math.random() * 100 < variation) {
                [1, 3].forEach(beat => {
                    const midi = chordTones[Math.floor(Math.random() * chordTones.length)];
                    notes.push({
                        midi: midi + 12,
                        start: beatPositions[beat * 2],
                        duration: 0.2,
                        velocity: 75
                    });
                });
            }
            
            return notes;
        }
    },
    
    'techno-arp': {
        name: 'Techno Arp',
        description: '16th note arpeggios with rhythmic accents. Perfect for electronic music.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            const sortedTones = [...chordTones].sort((a, b) => a - b);
            const notesPerBeat = 4; // 16th notes
            
            for (let i = 0; i < 16; i++) {
                const toneIndex = i % sortedTones.length;
                const midi = sortedTones[toneIndex];
                const start = i * 0.25;
                
                // Accent on beats
                const isAccent = i % 4 === 0;
                const velocity = isAccent ? 95 : 70;
                
                // Skip some notes based on variation
                if (Math.random() * 100 > variation && !isAccent) continue;
                
                notes.push({
                    midi: midi,
                    start: start,
                    duration: 0.2,
                    velocity: velocity
                });
            }
            
            return notes;
        }
    },
    
    'jazz-voicings': {
        name: 'Jazz Voicings',
        description: 'Rootless voicings with syncopated comping. Jazz club vibes.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            
            // Use upper voicings (skip root)
            const voicing = chordTones.length > 2 ? chordTones.slice(1) : chordTones;
            
            // Syncopated hits
            const hitPositions = [0, 1.5, 2.5, 3.75];
            
            hitPositions.forEach((pos, idx) => {
                // Skip some hits based on variation
                if (Math.random() * 100 > variation && idx > 0) return;
                
                voicing.forEach((midi, voiceIdx) => {
                    notes.push({
                        midi: midi,
                        start: pos,
                        duration: 0.3,
                        velocity: 80 - (voiceIdx * 5)
                    });
                });
            });
            
            return notes;
        }
    },
    
    'piano-ballad': {
        name: 'Piano Ballad',
        description: 'Arpeggiated patterns with sustain. Emotional and flowing.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            const sortedTones = [...chordTones].sort((a, b) => a - b);
            
            // Arpeggio pattern: up and down
            const pattern = [...sortedTones, ...sortedTones.slice().reverse()];
            const stepDuration = 4 / pattern.length;
            
            pattern.forEach((midi, idx) => {
                notes.push({
                    midi: midi,
                    start: idx * stepDuration,
                    duration: stepDuration * 1.5, // Overlap for sustain
                    velocity: 75 + (Math.random() * 10)
                });
            });
            
            return notes;
        }
    },
    
    'edm-plucks': {
        name: 'EDM Plucks',
        description: 'Syncopated pluck patterns with off-beat accents. Dance floor ready.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            
            // Off-beat pattern
            const positions = [0.5, 1, 1.5, 2.5, 3, 3.5];
            
            positions.forEach(pos => {
                // Random note from chord
                const midi = chordTones[Math.floor(Math.random() * chordTones.length)];
                
                // Skip based on variation
                if (Math.random() * 100 > variation) return;
                
                notes.push({
                    midi: midi + 12, // Octave up
                    start: pos,
                    duration: 0.15,
                    velocity: 90
                });
            });
            
            return notes;
        }
    },
    
    'funk-stabs': {
        name: 'Funk Stabs',
        description: 'Short, punchy chord stabs with ghost notes. Funky and tight.',
        generate: function(chordTones, barIndex, variation) {
            const notes = [];
            
            // Main stabs on 1 and 3.5
            const stabPositions = [0, 2.75];
            
            stabPositions.forEach(pos => {
                chordTones.forEach((midi, idx) => {
                    notes.push({
                        midi: midi,
                        start: pos,
                        duration: 0.1, // Very short
                        velocity: 95 - (idx * 5)
                    });
                });
            });
            
            // Ghost notes based on variation
            if (Math.random() * 100 < variation) {
                [1, 2, 3].forEach(beat => {
                    const midi = chordTones[0];
                    notes.push({
                        midi: midi,
                        start: beat + 0.25,
                        duration: 0.05,
                        velocity: 50 // Quiet ghost note
                    });
                });
            }
            
            return notes;
        }
    }
};

// Export for use in app.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { STYLES };
}

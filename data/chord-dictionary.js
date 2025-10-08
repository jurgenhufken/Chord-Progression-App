// Extended Chord Dictionary
// Based on chord_app_design with additional voicings

export const CHORD_TEMPLATES = [
  // Triads
  { name: "maj",    intervals: [0, 4, 7],        quality: "major" },
  { name: "min",    intervals: [0, 3, 7],        quality: "minor" },
  { name: "dim",    intervals: [0, 3, 6],        quality: "diminished" },
  { name: "aug",    intervals: [0, 4, 8],        quality: "augmented" },
  { name: "sus2",   intervals: [0, 2, 7],        quality: "suspended" },
  { name: "sus4",   intervals: [0, 5, 7],        quality: "suspended" },
  { name: "5",      intervals: [0, 7],           quality: "power" },
  
  // Seventh Chords
  { name: "7",      intervals: [0, 4, 7, 10],    quality: "dominant" },
  { name: "maj7",   intervals: [0, 4, 7, 11],    quality: "major" },
  { name: "m7",     intervals: [0, 3, 7, 10],    quality: "minor" },
  { name: "mMaj7",  intervals: [0, 3, 7, 11],    quality: "minor" },
  { name: "dim7",   intervals: [0, 3, 6, 9],     quality: "diminished" },
  { name: "m7b5",   intervals: [0, 3, 6, 10],    quality: "half-diminished" },
  { name: "7sus4",  intervals: [0, 5, 7, 10],    quality: "suspended" },
  
  // Sixth Chords
  { name: "6",      intervals: [0, 4, 7, 9],     quality: "major" },
  { name: "m6",     intervals: [0, 3, 7, 9],     quality: "minor" },
  { name: "6add9",  intervals: [0, 4, 7, 9, 14], quality: "major" },
  
  // Extended Chords (9th)
  { name: "add9",   intervals: [0, 4, 7, 14],    quality: "major" },
  { name: "madd9",  intervals: [0, 3, 7, 14],    quality: "minor" },
  { name: "9",      intervals: [0, 4, 7, 10, 14], quality: "dominant" },
  { name: "m9",     intervals: [0, 3, 7, 10, 14], quality: "minor" },
  { name: "maj9",   intervals: [0, 4, 7, 11, 14], quality: "major" },
  { name: "9sus4",  intervals: [0, 5, 7, 10, 14], quality: "suspended" },
  
  // Extended Chords (11th)
  { name: "11",     intervals: [0, 4, 7, 10, 14, 17], quality: "dominant" },
  { name: "m11",    intervals: [0, 3, 7, 10, 14, 17], quality: "minor" },
  { name: "maj11",  intervals: [0, 4, 7, 11, 14, 17], quality: "major" },
  
  // Extended Chords (13th)
  { name: "13",     intervals: [0, 4, 7, 10, 14, 17, 21], quality: "dominant" },
  { name: "m13",    intervals: [0, 3, 7, 10, 14, 17, 21], quality: "minor" },
  { name: "maj13",  intervals: [0, 4, 7, 11, 14, 17, 21], quality: "major" },
  
  // Altered Chords
  { name: "7b5",    intervals: [0, 4, 6, 10],    quality: "altered" },
  { name: "7#5",    intervals: [0, 4, 8, 10],    quality: "altered" },
  { name: "7b9",    intervals: [0, 4, 7, 10, 13], quality: "altered" },
  { name: "7#9",    intervals: [0, 4, 7, 10, 15], quality: "altered" },
  { name: "alt",    intervals: [0, 4, 6, 10, 13], quality: "altered" }, // 7b5b9
];

// Chord quality characteristics for voicing suggestions
export const QUALITY_CHARACTERISTICS = {
  major: {
    brightness: 1.0,
    tension: 0.2,
    stability: 0.9,
    suggestedVoicings: ["root", "third", "fifth", "octave"]
  },
  minor: {
    brightness: 0.4,
    tension: 0.3,
    stability: 0.8,
    suggestedVoicings: ["root", "third", "fifth", "seventh"]
  },
  dominant: {
    brightness: 0.7,
    tension: 0.7,
    stability: 0.4,
    suggestedVoicings: ["root", "third", "seventh", "ninth"]
  },
  diminished: {
    brightness: 0.3,
    tension: 0.9,
    stability: 0.2,
    suggestedVoicings: ["root", "third", "fifth", "seventh"]
  },
  augmented: {
    brightness: 0.9,
    tension: 0.8,
    stability: 0.3,
    suggestedVoicings: ["root", "third", "fifth"]
  },
  suspended: {
    brightness: 0.6,
    tension: 0.5,
    stability: 0.5,
    suggestedVoicings: ["root", "fourth", "fifth"]
  },
  "half-diminished": {
    brightness: 0.4,
    tension: 0.8,
    stability: 0.3,
    suggestedVoicings: ["root", "third", "fifth", "seventh"]
  },
  altered: {
    brightness: 0.5,
    tension: 1.0,
    stability: 0.1,
    suggestedVoicings: ["root", "third", "seventh", "altered"]
  },
  power: {
    brightness: 0.8,
    tension: 0.1,
    stability: 0.7,
    suggestedVoicings: ["root", "fifth", "octave"]
  }
};

// Helper to find chord template by name
export function getChordTemplate(name) {
  return CHORD_TEMPLATES.find(t => t.name === name);
}

// Helper to get quality characteristics
export function getQualityInfo(quality) {
  return QUALITY_CHARACTERISTICS[quality] || QUALITY_CHARACTERISTICS.major;
}

// Helper to detect chord from pitch classes
export function detectChord(pitchClasses) {
  const sorted = [...pitchClasses].sort((a, b) => a - b);
  const root = sorted[0];
  const intervals = sorted.map(pc => (pc - root + 12) % 12);
  
  // Find best matching template
  for (const template of CHORD_TEMPLATES) {
    if (arraysEqual(intervals, template.intervals)) {
      return {
        root: root,
        template: template,
        quality: template.quality
      };
    }
  }
  
  return null;
}

function arraysEqual(a, b) {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx]);
}

// Melody • 8-Bar Phrase
// Continuous melodic phrase across 8 bars

export const meta = {
  id: "melody_8bar_phrase",
  humanName: "Melody • 8-Bar Phrase",
  category: "melody",
  style: "melody",
  feelTags: ["melodic", "continuous", "phrased"],
  description: "Continuous melodic line that develops across 8 bars, following chord changes."
};

export const config = {
  noteDensity: { sparse: 8, medium: 16, dense: 24, verydense: 32 },
  voicingTemplate: ["root", "third", "fifth", "seventh"],
  velocityProfile: [85, 88, 90, 92, 90, 88, 85, 82], // Phrase contour
  timingOffsets: [0.0, 0.0, 0.0, 0.0],
  swing: 0.02,
  humanize: { timing: 0.2, velocity: 0.15 },
  syncopation: 0.3,
  spread: 2.0,
  legato: 0.6,
  octaveJitter: 0.1,
  // Special flag for 8-bar pattern
  multiBarPattern: true,
  patternLength: 8
};

// This generates a continuous pattern across multiple bars
export function generateMultiBar({ allChordTones, density, bpm, numBars = 8 }) {
  const notes = [];
  const notesPerBar = config.noteDensity[density] || 16;
  const totalNotes = notesPerBar * numBars;
  const stepDuration = numBars / totalNotes;
  
  // Create a melodic contour across all bars
  for (let i = 0; i < totalNotes; i++) {
    const barIndex = Math.floor(i / notesPerBar);
    const noteInBar = i % notesPerBar;
    
    // Get chord tones for current bar
    const chordTones = allChordTones[barIndex];
    if (!chordTones) continue;
    
    const voicedNotes = applyVoicing(chordTones, config.voicingTemplate);
    
    // Create melodic movement (not just cycling)
    let noteIndex;
    if (noteInBar === 0) {
      // Start of bar: use root or fifth
      noteIndex = Math.random() > 0.5 ? 0 : 2;
    } else if (noteInBar === notesPerBar - 1) {
      // End of bar: resolve to root or third
      noteIndex = Math.random() > 0.5 ? 0 : 1;
    } else {
      // Middle: melodic movement
      noteIndex = Math.floor(Math.random() * voicedNotes.length);
    }
    
    const midi = voicedNotes[noteIndex % voicedNotes.length];
    
    // Velocity follows phrase contour
    const phrasePosition = i / totalNotes;
    const velocityIndex = Math.floor(phrasePosition * config.velocityProfile.length);
    const velocity = config.velocityProfile[velocityIndex] || 85;
    
    // Timing
    const timingOffset = config.timingOffsets[i % config.timingOffsets.length] || 0;
    
    notes.push({
      barIndex: barIndex,
      midi: midi,
      start: (i * stepDuration) + timingOffset,
      duration: stepDuration * config.legato,
      velocity: velocity
    });
  }
  
  return notes;
}

function applyVoicing(chordTones, template) {
  const { midiNotes } = chordTones;
  const sortedMidi = [...midiNotes].sort((a, b) => a - b);
  const root = sortedMidi[0];
  
  const pcMap = {};
  sortedMidi.forEach(midi => {
    const interval = (midi - root) % 12;
    if (!pcMap[interval]) {
      pcMap[interval] = midi;
    }
  });
  
  const notes = [];
  
  template.forEach(voicing => {
    let midiNote = null;
    
    switch(voicing) {
      case 'root':
        midiNote = pcMap[0] || root;
        break;
      case 'third':
        midiNote = pcMap[4] || pcMap[3] || sortedMidi[1] || root;
        break;
      case 'fifth':
        midiNote = pcMap[7] || sortedMidi[2] || root;
        break;
      case 'seventh':
        midiNote = pcMap[10] || pcMap[11] || sortedMidi[3] || root;
        break;
      default:
        midiNote = sortedMidi[notes.length % sortedMidi.length];
    }
    
    if (midiNote) {
      notes.push(midiNote + 12); // One octave up for melody
    }
  });
  
  return notes;
}

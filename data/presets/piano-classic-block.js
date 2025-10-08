// Piano • Classic Block
// Traditional piano block chords with gentle top-note emphasis

export const meta = {
  id: "piano_classic_block",
  humanName: "Piano • Classic Block",
  category: "piano",
  style: "piano",
  feelTags: ["warm", "homophonic", "classical"],
  description: "Traditional piano block chords with gentle top-note emphasis for sustained harmony."
};

export const config = {
  noteDensity: { sparse: 2, medium: 4, dense: 6, verydense: 8 },
  voicingTemplate: ["root", "third", "fifth", "octave"],
  velocityProfile: [96, 84, 78, 88],
  timingOffsets: [0.0, 0.012, 0.018, 0.009],
  swing: 0.04,
  humanize: { timing: 0.25, velocity: 0.2 },
  syncopation: 0.1,
  spread: 1.0,
  legato: 0.85,
  octaveJitter: 0.0
};

export function generate({ chordTones, density, bpm }) {
  const notes = [];
  const notesPerBar = config.noteDensity[density] || 4;
  const stepDuration = 1.0 / notesPerBar;
  
  // Get voicing from chord tones
  const voicedNotes = applyVoicing(chordTones, config.voicingTemplate);
  
  // Generate rhythm
  for (let i = 0; i < notesPerBar; i++) {
    const noteIndex = i % voicedNotes.length;
    const midi = voicedNotes[noteIndex];
    const timingOffset = config.timingOffsets[i % config.timingOffsets.length] || 0;
    const velocity = config.velocityProfile[i % config.velocityProfile.length] || 80;
    
    notes.push({
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
  const notes = [];
  
  template.forEach((voicing, index) => {
    const noteIndex = index % sortedMidi.length;
    let midiNote = sortedMidi[noteIndex];
    
    if (voicing === 'octave') {
      midiNote = sortedMidi[0] + 12;
    }
    
    notes.push(midiNote);
  });
  
  return notes;
}

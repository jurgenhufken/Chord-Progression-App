// Jazz • II-V-I Comping
// Syncopated jazz comping with swing feel

export const meta = {
  id: "jazz_ii_v_i",
  humanName: "Jazz • II-V-I Comp",
  category: "piano",
  style: "jazz",
  feelTags: ["swing", "syncopated", "sophisticated"],
  description: "Syncopated jazz comping with swing eighth notes and voice leading."
};

export const config = {
  noteDensity: { sparse: 3, medium: 6, dense: 9, verydense: 12 },
  voicingTemplate: ["root", "third", "seventh"],
  velocityProfile: [88, 82, 76, 84, 78, 72],
  timingOffsets: [0.0, 0.08, 0.04, 0.08, 0.02, 0.06], // Swing feel
  swing: 0.08,
  humanize: { timing: 0.3, velocity: 0.25 },
  syncopation: 0.4,
  spread: 1.2,
  legato: 0.25, // Short, staccato
  octaveJitter: 0.1
};

export function generate({ chordTones, density, bpm }) {
  const notes = [];
  const notesPerBar = config.noteDensity[density] || 6;
  const stepDuration = 1.0 / notesPerBar;
  
  const voicedNotes = applyVoicing(chordTones, config.voicingTemplate);
  
  // Jazz comping hits (syncopated)
  const hits = [0, 1.5, 3.0]; // Off-beat emphasis
  
  hits.forEach((hitTime, hitIdx) => {
    voicedNotes.forEach((midi, noteIdx) => {
      const swing = hitIdx > 0 ? config.swing : 0;
      const velocity = config.velocityProfile[(hitIdx * 3 + noteIdx) % config.velocityProfile.length];
      
      notes.push({
        midi: midi,
        start: hitTime / 4 + swing,
        duration: 0.25 * config.legato,
        velocity: velocity
      });
    });
  });
  
  return notes;
}

function applyVoicing(chordTones, template) {
  const { midiNotes } = chordTones;
  const sortedMidi = [...midiNotes].sort((a, b) => a - b);
  const notes = [];
  
  template.forEach((voicing, index) => {
    const noteIndex = index % sortedMidi.length;
    notes.push(sortedMidi[noteIndex]);
  });
  
  return notes;
}

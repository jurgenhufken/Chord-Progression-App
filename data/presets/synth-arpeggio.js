// Synth • Arpeggio Up
// Classic synth arpeggio pattern

export const meta = {
  id: "synth_arpeggio",
  humanName: "Synth • Arpeggio Up",
  category: "synth_arpeggio",
  style: "arpeggio",
  feelTags: ["electronic", "rhythmic", "energetic"],
  description: "Ascending arpeggio pattern perfect for EDM and electronic music."
};

export const config = {
  noteDensity: { sparse: 4, medium: 8, dense: 16, verydense: 32 },
  voicingTemplate: ["root", "third", "fifth", "octave"],
  velocityProfile: [85, 88, 90, 92],
  timingOffsets: [0.0, 0.0, 0.0, 0.0],
  swing: 0.0,
  humanize: { timing: 0.05, velocity: 0.1 },
  syncopation: 0.0,
  spread: 2.0,
  legato: 0.3,
  octaveJitter: 0.0
};

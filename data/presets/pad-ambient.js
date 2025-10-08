// Pad • Ambient Swell
// Slow, sustained pad chords

export const meta = {
  id: "pad_ambient",
  humanName: "Pad • Ambient Swell",
  category: "pads",
  style: "pad",
  feelTags: ["atmospheric", "sustained", "ethereal"],
  description: "Long, sustained chords for ambient and cinematic music."
};

export const config = {
  noteDensity: { sparse: 1, medium: 2, dense: 4, verydense: 8 },
  voicingTemplate: ["root", "third", "fifth", "seventh", "ninth"],
  velocityProfile: [60, 58, 56, 54, 52],
  timingOffsets: [0.0, 0.05, 0.1, 0.15, 0.2],
  swing: 0.0,
  humanize: { timing: 0.1, velocity: 0.05 },
  syncopation: 0.0,
  spread: 2.0,
  legato: 1.0,
  octaveJitter: 0.0
};

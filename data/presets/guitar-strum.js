// Guitar • Acoustic Strum
// Natural acoustic guitar strumming

export const meta = {
  id: "guitar_strum",
  humanName: "Guitar • Acoustic Strum",
  category: "guitar_strum",
  style: "strumming",
  feelTags: ["organic", "folk", "warm"],
  description: "Natural acoustic guitar strumming pattern with slight timing variations."
};

export const config = {
  noteDensity: { sparse: 4, medium: 8, dense: 12, verydense: 16 },
  voicingTemplate: ["root", "third", "fifth", "octave"],
  velocityProfile: [80, 75, 70, 75, 78, 72, 68, 74],
  timingOffsets: [0.0, 0.015, 0.022, 0.01, 0.0, 0.018, 0.024, 0.012],
  swing: 0.05,
  humanize: { timing: 0.35, velocity: 0.3 },
  syncopation: 0.15,
  spread: 1.5,
  legato: 0.6,
  octaveJitter: 0.2
};

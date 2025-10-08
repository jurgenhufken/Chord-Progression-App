// Bass • Root Fifth Pulse
// Simple root-fifth bass pattern

export const meta = {
  id: "bass_root_fifth",
  humanName: "Bass • Root Fifth Pulse",
  category: "bass",
  style: "bass",
  feelTags: ["steady", "foundational", "simple"],
  description: "Alternating root and fifth notes for solid bass foundation."
};

export const config = {
  noteDensity: { sparse: 2, medium: 4, dense: 8, verydense: 16 },
  voicingTemplate: ["root_low", "fifth_low"],
  velocityProfile: [90, 85, 88, 82],
  timingOffsets: [0.0, 0.0, 0.0, 0.0],
  swing: 0.0,
  humanize: { timing: 0.15, velocity: 0.15 },
  syncopation: 0.0,
  spread: 1.0,
  legato: 0.7,
  octaveJitter: 0.0
};

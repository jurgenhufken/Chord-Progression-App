// Preset Loader
// Dynamically loads and manages preset modules

export class PresetLoader {
  constructor() {
    this.presets = new Map();
    this.categories = new Set();
  }
  
  async loadPreset(modulePath) {
    try {
      const module = await import(modulePath);
      const preset = {
        ...module.meta,
        config: module.config,
        generate: module.generate
      };
      
      this.presets.set(preset.id, preset);
      this.categories.add(preset.category);
      
      return preset;
    } catch (error) {
      console.error(`Failed to load preset: ${modulePath}`, error);
      return null;
    }
  }
  
  async loadAll(presetPaths) {
    const promises = presetPaths.map(path => this.loadPreset(path));
    const results = await Promise.all(promises);
    return results.filter(p => p !== null);
  }
  
  getPreset(id) {
    return this.presets.get(id);
  }
  
  getByCategory(category) {
    return Array.from(this.presets.values())
      .filter(p => p.category === category);
  }
  
  getAllPresets() {
    return Array.from(this.presets.values());
  }
  
  getCategories() {
    return Array.from(this.categories);
  }
}

// Preset registry - add new presets here
export const PRESET_REGISTRY = [
  './presets/piano-classic-block.js',
  './presets/jazz-ii-v-i.js',
  './presets/bass-root-fifth.js',
  './presets/synth-arpeggio.js',
  './presets/pad-ambient.js',
  './presets/guitar-strum.js',
];

// Helper to convert old JSON format to new module format
export function convertLegacyPreset(jsonPreset) {
  return {
    meta: {
      id: jsonPreset.id,
      humanName: jsonPreset.humanName,
      category: jsonPreset.category,
      style: jsonPreset.style,
      feelTags: jsonPreset.feelTags || [],
      description: jsonPreset.description || ''
    },
    config: {
      noteDensity: jsonPreset.noteDensity,
      voicingTemplate: jsonPreset.voicingTemplate,
      velocityProfile: jsonPreset.velocityProfile,
      timingOffsets: jsonPreset.timingOffsets,
      swing: jsonPreset.swing,
      humanize: jsonPreset.humanize,
      syncopation: jsonPreset.syncopation,
      spread: jsonPreset.spread,
      legato: jsonPreset.legato,
      octaveJitter: jsonPreset.octaveJitter
    }
  };
}

# Channel 2 Preset Development Guide

## 📁 File Structure

Each preset is a separate JavaScript module with:
- **Metadata** (name, category, description)
- **Configuration** (voicing, rhythm, dynamics)
- **Generator function** (creates notes from chords)

## 🎨 Creating a New Preset

### 1. Create a new file: `your-preset-name.js`

```javascript
// Your Preset Name
// Short description of the style

export const meta = {
  id: "your_preset_id",
  humanName: "Category • Preset Name",
  category: "piano", // piano, guitar, bass, synth, melody, pads, percussive
  style: "your_style",
  feelTags: ["tag1", "tag2", "tag3"],
  description: "Detailed description of what this preset does."
};

export const config = {
  // How many notes per bar at each density level
  noteDensity: { 
    sparse: 2, 
    medium: 4, 
    dense: 6, 
    verydense: 8 
  },
  
  // Which chord tones to use (in order)
  voicingTemplate: ["root", "third", "fifth", "octave"],
  
  // Velocity for each note (0-127)
  velocityProfile: [96, 84, 78, 88],
  
  // Timing offset for each note (in beats, can be negative)
  timingOffsets: [0.0, 0.012, 0.018, 0.009],
  
  // Swing amount (0.0 = straight, 0.08 = light swing)
  swing: 0.04,
  
  // Humanization (random variation)
  humanize: { 
    timing: 0.25,  // Max timing variation in ms
    velocity: 0.2  // Max velocity variation (0-1)
  },
  
  // Syncopation level (0.0 = on-beat, 1.0 = max syncopation)
  syncopation: 0.1,
  
  // Octave spread (1.0 = normal, 2.0 = two octaves)
  spread: 1.0,
  
  // Note length (0.0 = staccato, 1.0 = full legato)
  legato: 0.85,
  
  // Random octave jumps (0.0 = none, 1.0 = frequent)
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
    
    // Handle special voicings
    if (voicing === 'octave') {
      midiNote = sortedMidi[0] + 12;
    }
    
    notes.push(midiNote);
  });
  
  return notes;
}
```

### 2. Register your preset

Add your preset to `preset-loader.js`:

```javascript
export const PRESET_REGISTRY = [
  './presets/piano-classic-block.js',
  './presets/jazz-ii-v-i.js',
  './presets/your-preset-name.js', // Add here
];
```

### 3. Test your preset

1. Refresh the app
2. Open the preset browser
3. Your preset should appear in the correct category
4. Test with different chord progressions and density levels

## 🎵 Voicing Template Options

Available voicing keywords:
- `root` - Lowest note of the chord
- `third` - Second note (major/minor 3rd)
- `fifth` - Third note (perfect 5th)
- `seventh` - Fourth note (7th)
- `ninth` - Root + 14 semitones
- `fourth` - Root + 5 semitones
- `sixth` - Root + 9 semitones
- `octave` - Root + 12 semitones

Modifiers:
- `root_low` - Root one octave lower
- `fifth_low` - Fifth one octave lower
- `root_high` - Root one octave higher

## 🎨 Style Categories

### Piano
- Block chords, arpeggios, Alberti bass
- Classical, jazz, contemporary styles

### Guitar
- Strumming patterns, fingerpicking
- Acoustic, electric, flamenco styles

### Bass
- Walking bass, root-fifth patterns
- Funk, jazz, rock styles

### Synth
- Arpeggios, pads, sequences
- EDM, ambient, retro styles

### Melody
- Lead lines, counter-melodies
- Scalar runs, motivic development

### Pads
- Sustained chords, swells
- Ambient, cinematic styles

### Percussive
- Rhythmic chord hits
- Funk, Latin, dance styles

## 💡 Tips

1. **Start Simple**: Copy an existing preset and modify it
2. **Test Often**: Try your preset with different chord progressions
3. **Use Humanization**: Small timing/velocity variations sound more natural
4. **Consider Context**: Think about genre, tempo, and mood
5. **Document Well**: Clear descriptions help users find the right preset

## 🎯 Examples

### Staccato Piano
```javascript
legato: 0.2,  // Very short notes
velocityProfile: [100, 95, 90, 85],  // Consistent, bright
```

### Swung Jazz
```javascript
swing: 0.08,  // Triplet feel
timingOffsets: [0.0, 0.08, 0.04, 0.08],  // Off-beat emphasis
```

### Ambient Pad
```javascript
legato: 1.0,  // Full sustain
velocityProfile: [60, 55, 50, 55],  // Soft, even
noteDensity: { sparse: 1, medium: 2, dense: 3 },  // Sparse
```

## 🚀 Advanced Techniques

### Custom Rhythm Patterns
Override the simple loop with custom hit times:

```javascript
const hits = [0, 0.5, 1.5, 2.0, 3.0];  // Custom rhythm
hits.forEach(hitTime => {
  // Generate notes at specific times
});
```

### Chord-Aware Voicing
Check chord quality and adjust voicing:

```javascript
if (chordTones.quality === 'dominant') {
  // Use rootless voicing for dominant chords
  template = ["third", "seventh", "ninth"];
}
```

### Dynamic Velocity
Adjust velocity based on position:

```javascript
const velocity = 80 + (i / notesPerBar) * 20;  // Crescendo
```

---

Happy preset creating! 🎵

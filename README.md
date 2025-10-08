# 🎶 Chord Progression App

This project started as a personal hobby tool: I'm a musician who often hears songs or chord progressions in my head, usually at the wrong time — at work, on the train, in daily life. Opening a full DAW (Ableton, Logic, Cubase…) just to sketch an idea is slow and kills the flow.

So I built this app as a **musical sketchpad**: a lightweight way to type chords, instantly hear them, experiment a little, and later bring the idea into a DAW.

**It's not a replacement for a DAW.**  
It's the step *before* the DAW: a place to capture the spark before it fades.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

---

## ✨ Current Features

### 🎼 Pattern System
- **16 Patterns** organized in 4x4 matrix (A1-D4)
- **8 bars per pattern** with automatic distribution
- **Chain Mode** for seamless pattern playback
- **Loop Chain** for continuous cycling through patterns
- Visual feedback for filled patterns
- Centralized bar numbering system

### 🎹 Chord Progression Engine
- **Type chords in text form** (`|Am|F|C|G|`) and play them instantly
- **Advanced chord parser** supporting 40+ chord types
- **Piano roll visualization** with MIDI notes
- **Copy/paste functionality** for quick editing
- **Multiple chords per bar** (sub-chords)
- **Music theory analysis** (intervals, key detection, Roman numerals)

### 🥁 Drum Sequencer
- **4 Tracks**: Kick, Snare, Hi-Hat, Clap
- **16-step sequencer** per bar
- **Random Beat Generator** with true randomness
- Per-bar drum patterns
- Visual step highlighting during playback
- **MIDI Export** (General MIDI format)

### 🎚️ Professional Mixer
- 2-channel mixer (Piano + Drums)
- **VU Meters** with gradient visualization (green→yellow→red)
- **Horizontal faders** with dB range (-60 to +6 dB)
- **Numeric dB input** fields (Ableton-style)
- **Mute buttons** per channel
- Real-time meter animation
- Toggleable section at bottom of screen

### 🎵 Audio Engine & Effects
- Powered by **Tone.js**
- Polyphonic synthesis for chords
- **Filter** (Lowpass/Highpass/Bandpass with cutoff and resonance)
- **Effects** (Delay and Reverb with wet/dry controls)
- **Full ADSR Controls** (Attack, Decay, Sustain, Release)
- **Arpeggiator** (Up, Down, Up-Down, Random patterns)
- BPM control (60-200)
- Volume control in dB

### 🎨 Channel 2 Pattern Generator (NEW!)
- **15+ professional presets** across 7 categories (Piano, Guitar, Bass, Synth, Melody, Pads, Percussive)
- **Live audio preview** with looping
- **Smart voicing** that uses actual chord tones from piano roll
- **Apply to Current or All patterns** (8 or 16 bars)
- **Optional mute** for main channel during preview
- **Non-destructive preview** (piano roll stays intact)
- **Density controls** (Sparse/Medium/Dense/Very Dense)
- **Octave range** (1-3 octaves)

### 💾 Export & Save
- **Export to MIDI** for DAW integration
- **Save/Load projects** as JSON
- **Autosave** functionality
- Shareable links (planned)

---

## 🎯 Why This Exists

Musicians often need to:

1. **Catch ideas quickly** → a phone recording is messy, but chords in context are clear
2. **Experiment freely** → a DAW project feels heavy; this is a sandbox
3. **Learn by playing** → beginners can see what arpeggiators or effects do without a big setup
4. **Collaborate** → send a chord sketch to a friend and jam on it later

This app helps in all those cases.

---

## 👥 Who It's For

- **Hobby musicians** who want to sketch ideas on the go
- **Songwriters** who hear progressions and want them stored in usable form
- **Producers** who need a quick "lab" to test harmonic ideas without cluttering their DAW
- **Composers** who sometimes get stuck and want quick variations or modulations
- **Beginners** who want to see and hear piano rolls, effects and sequencing without the DAW learning curve

---

## 🚧 Status

This is still a **work in progress** — I build it for fun and for my own songwriting workflow.

- Code is intentionally simple (HTML, CSS, JS) so it can run anywhere
- Features like shareable links, AI chord suggestions, and more sequencing options are on the roadmap
- The Channel 2 preset system was recently added for quick arrangement ideas

---

## 💡 Vision & Roadmap

The long-term idea is that this could grow into:

### 🎓 Learning Tool
- Interactive tutorials for chord theory
- Visual explanations of what effects/arps/sequencers do
- "Why does this progression work?" analysis

### 🎹 Serious Sketchpad
- AI-assisted chord suggestions and variations
- Genre-specific preset packs (Jazz, EDM, Lo-fi, etc.)
- Advanced MIDI editing (velocity curves, humanization)
- Multi-track arrangement (drums, bass, melody)

### 🔌 Integration
- VST/AU plugin version that drives your DAW directly
- Hardware MIDI controller support
- Direct export to Ableton/Logic/FL Studio projects
- Cloud sync and collaboration features

### 🌐 Community
- User-created preset sharing/marketplace
- Collaborative jam sessions (real-time multi-user)
- Song idea gallery and voting system

---

## 🚀 Recent Updates

### Channel 2 Preset System (Latest)
- **15+ professional patterns** across 7 categories
- **Live audio preview** with looping
- **Smart voicing** that uses actual chord tones (no forced 7ths)
- **Apply to Current or All patterns** (8 or 16 bars)
- **Optional mute** for main channel during preview
- **Non-destructive preview** (piano roll stays intact)

---

## 🚀 Quick Start

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser (or use a local server)
3. Start creating chord progressions!

### Local Server (Recommended)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Right-click index.html → "Open with Live Server"
```

### Usage
1. **Enter chords**: Type `|Am|F|C|G|` in the input field
2. **Parse**: Click "Parse" button
3. **Play**: Press the play button or spacebar
4. **Browse Patterns**: Click "🎨 Browse Patterns" to explore presets
5. **Export**: Click "Export MIDI" to save for your DAW

### 💾 File Management
- **Save/Load Projects**: Save as JSON, load anytime
- **Professional Toolbar**: File and Edit menus with shortcuts
- **Export MIDI**: Export to MIDI for DAW integration

### 🎛️ Audio Engine
- **Soft Synthesizer**: Warm, non-intrusive sound (Tone.js)
- **Filter**: Lowpass/Highpass/Bandpass with cutoff and resonance
- **Effects**: Delay and Reverb with wet/dry controls
- **Full ADSR Controls**: Attack, Decay, Sustain, Release
- **Arpeggiator**: Up, Down, Up-Down, Random patterns with speed control
- **BPM Control**: 60-200 BPM range
- **Volume Control**: Real-time adjustment

### 🎼 Music Theory Analysis
- **Interval Analysis**: Recognize dyads and their harmonic qualities
- **Chord Recognition**: Automatic chord detection from notes
- **Key Detection**: Detect the key of your progression
- **Roman Numeral Analysis**: See chord functions (I, IV, V, etc.)
- **Use Case Suggestions**: Get suggestions for interval usage

### 🎨 Visual Feedback
- **Smooth Playhead**: 60fps animation with perfect sync
- **Note Highlighting**: Notes light up as playhead hits them
- **Bar Highlighting**: Current bar is visually marked
- **Click Preview**: Click any bar to preview its chords

### 🎼 Chord Support
Supports all common chord types:
- Major: `C`, `Cmaj7`, `C6`, `Cadd9`
- Minor: `Cm`, `Cm7`, `Cm9`
- Dominant: `C7`, `C9`, `C11`, `C13`
- Diminished: `Cdim`, `Cdim7`
- Augmented: `Caug`, `C+`
- Suspended: `Csus2`, `Csus4`, `C7sus4`
- Half-diminished: `Cm7b5`, `Cø7`

## 🚀 Quick Start

### Installation
1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start creating chord progressions!

### Usage
1. **Enter chords**: Type `|Am|F|C|G|` in the input field
2. **Parse**: Click "Parse" button
3. **Play**: Press the play button or spacebar
4. **Export**: Click "Export MIDI" to save for your DAW

### Notation Format
```
|Am|F|C|G|           # One chord per bar
|Am F|C G|Dm G|C|    # Multiple chords per bar
```

## 🎯 Example Progressions

```
# Pop progression
|C|G|Am|F|

# Jazz progression
|Dm7|G7|Cmaj7|Fmaj7|

# Complex progression
|Am F|C G|Dm7 G7|Cmaj7|
```

## 🛠️ Tech Stack

- **Vanilla JavaScript** (no frameworks, runs anywhere)
- **Tone.js** for audio synthesis and effects
- **HTML5 Canvas** for piano roll visualization
- **LocalStorage** for autosave
- **MIDI.js** for MIDI file export
- **CSS Grid** for responsive layout

### Browser Support
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (basic functionality)

## 📦 Files

```
chord-progression-app/
├── index.html          # Main HTML
├── styles.css          # Styling
├── app.js             # Application logic
├── VERSION.txt        # Version info
├── README.md          # This file
└── .gitignore         # Git ignore rules
```

## ⌨️ Keyboard Shortcuts

### Playback
- `Space`: Play/Pause
- `Esc`: Stop playback

### Edit Mode (✏️ button must be ON)
- `Ctrl+Z`: Undo
- `Ctrl+Y` or `Ctrl+Shift+Z`: Redo
- `Ctrl+C`: Copy selected notes
- `Ctrl+V`: Paste (then click ruler to paste location)
- `Ctrl+A`: Select all notes
- `Delete`: Delete selected notes
- `Esc`: Deselect all

### File Operations
- Via toolbar: File → New, Open, Save, Save As, Export MIDI

## 🔧 Development

### Local Server
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .
```

### Making Changes
1. Edit files
2. Refresh browser (Ctrl+F5 for hard refresh)
3. Test thoroughly before committing

## 📝 Version History

### Version 3.0 (Current - Stable) 🎉
**Major Update - Professional Edition**
- ✅ **File Management**: Save/Load projects as JSON
- ✅ **Professional Toolbar**: File and Edit menus
- ✅ **Undo/Redo**: Full history with Ctrl+Z/Ctrl+Y
- ✅ **Vertical Ruler**: Bar numbers for navigation
- ✅ **Loop Range Slider**: Visual loop control
- ✅ **Context Menu**: Right-click for Cut/Copy/Paste/Delete
- ✅ **Filter & Effects**: Lowpass/Highpass filter, Delay, Reverb
- ✅ **Arpeggiator**: Multiple patterns and speeds
- ✅ **Music Theory Analysis**: Intervals, chords, key detection
- ✅ **Dyad Support**: 2-note intervals with harmonic analysis
- ✅ **Transpose**: Transpose selected notes or entire song
- ✅ **Box Selection**: Drag to select multiple notes
- ✅ **Dynamic Piano Roll**: Auto-adjusts to note range

### Version 2.0
- ✅ Flexible grid layout (any number of bars)
- ✅ Perfect alignment between chords and piano roll
- ✅ Smooth playhead with 60fps animation
- ✅ Works with multiple chords per bar
- ✅ MIDI export functionality

## 🤝 Contributing

This is a personal hobby project, but contributions are welcome! If you have ideas for:
- New presets or patterns
- UI/UX improvements
- Bug fixes or optimizations
- Feature suggestions

Feel free to open an issue or pull request.

## 📄 License

MIT License - feel free to fork, modify, and use for your own projects!

## 💬 Feedback

If you use this tool and find it helpful (or have suggestions), I'd love to hear about it! This started as a personal need, but I hope it can be useful to others as well.

## 🙏 Acknowledgments

Built with:
- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- Modern web standards (ES6+, CSS Grid, Canvas API)

---

*For now, it's just a hobby project — but one I hope can be useful to others as well.* 🎵

**Made for musicians, by musicians** 🎹

[Report Bug](../../issues) · [Request Feature](../../issues)

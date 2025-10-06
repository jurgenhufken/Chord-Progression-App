# 🎹 Chord Progression Studio v1.0

A professional DAW-style chord progression and music production application with advanced pattern sequencing, drum programming, and mixing capabilities.

![Version](https://img.shields.io/badge/version-1.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Status](https://img.shields.io/badge/status-production-success)

## ✨ Features

### 🎼 Pattern System
- **16 Patterns** organized in 4x4 matrix (A1-D4)
- **8 bars per pattern** with automatic distribution
- **Chain Mode** for seamless pattern playback
- **Loop Chain** for continuous cycling through patterns
- Visual feedback for filled patterns
- Centralized bar numbering system

### 🎹 Chord Progression Engine
- Advanced chord parser supporting:
  - Major, minor, sus2, sus4
  - 7th, maj7, m7, dim7
  - Diminished, augmented
  - Add9, add11, 6th chords
- Piano roll visualization with MIDI notes
- Copy/paste functionality
- Multiple chords per bar (sub-chords)
- Default 32-bar progression included

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

### 🎵 Audio Engine
- Powered by **Tone.js**
- Polyphonic synthesis for chords
- Individual drum sounds
- Seamless pattern switching (no audio glitches)
- BPM control (60-200)
- Volume control in dB
- Arpeggiator support

### 🌐 Optie 2: Met Lokale Server (Aanbevolen voor beste performance)
```bash
# Optie A: Python (als je Python hebt)
python -m http.server 8000

# Optie B: Node.js (als je Node hebt)
npx serve .

# Optie C: VS Code Live Server
# Rechtermuisknop op index.html → "Open with Live Server"
```
Dan open: `http://localhost:8000`

### 📦 Wat je NIET nodig hebt:
- ❌ Geen npm install
- ❌ Geen build process
- ❌ Geen dependencies installeren
- ❌ Geen configuratie
- ✅ **Gewoon 3 bestanden en het werkt!**

## ✨ Features (Version 3.0)

### 🎹 Core Functionality
- **Flexible Grid Layout**: Handle any number of bars (not limited to 8)
- **Excel-like Interface**: Unified grid with perfect alignment
- **Piano Roll**: Visual MIDI note display directly under chord grid
- **Vertical Ruler**: Bar numbers for easy navigation and paste targets
- **Real-time Playback**: Continuous note playback with smooth playhead
- **Loop Range**: Visual loop slider with adjustable start/end points
- **Edit Mode**: Click, drag, box-select, copy/paste notes
- **Context Menu**: Right-click for Cut, Copy, Paste, Delete
- **Undo/Redo**: Full undo/redo support (Ctrl+Z/Ctrl+Y)

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

## 🛠️ Technical Details

### Technologies
- **Tone.js**: Web Audio API synthesis
- **Pure JavaScript**: No frameworks, maximum performance
- **CSS Grid**: Modern, responsive layout
- **requestAnimationFrame**: Smooth 60fps animations

### Architecture
```
app.js              # Main application logic
├── ChordParser     # Parse chord notation
├── Synthesizer     # Audio synthesis (Tone.js)
├── Grid Builder    # Dynamic grid generation
├── Playhead        # Smooth animation engine
└── MIDI Export     # MIDI file generation
```

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

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for any purpose.

## 🎵 Use Cases

- **Songwriting**: Quickly sketch chord progressions
- **Music Production**: Export to DAW for full production
- **Practice**: Learn and practice chord progressions
- **Teaching**: Demonstrate chord theory
- **AI Integration**: Perfect for AI-assisted composition

## 🙏 Acknowledgments

Built with:
- [Tone.js](https://tonejs.github.io/) - Web Audio framework
- Modern web standards (ES6+, CSS Grid)

---

**Made for musicians, by musicians** 🎹

[Report Bug](../../issues) · [Request Feature](../../issues)

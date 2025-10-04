# 🎵 Chord Progression Studio

A professional web application for quickly creating, testing, and exporting chord progressions. Perfect for musicians who want to rapidly develop ideas and export them to their DAW.

![Version](https://img.shields.io/badge/version-2.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Status](https://img.shields.io/badge/status-stable-success.svg)

## ✨ Features

### 🎹 Core Functionality
- **Flexible Grid Layout**: Handle any number of bars (not limited to 8)
- **Excel-like Interface**: Unified grid with perfect alignment
- **Piano Roll**: Visual MIDI note display directly under chord grid
- **Real-time Playback**: Continuous note playback with smooth playhead
- **MIDI Export**: Professional MIDI file export for DAW integration

### 🎛️ Audio Engine
- **Soft Synthesizer**: Warm, non-intrusive sound
- **Full ADSR Controls**: Attack, Decay, Sustain, Release
- **Continuous Playback**: Notes sustain for full duration
- **BPM Control**: 60-200 BPM range
- **Volume Control**: Real-time adjustment

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

## 🎮 Keyboard Shortcuts

- `Space`: Play/Pause
- `Esc`: Stop playback

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

### Version 2.0 (Current - Stable)
- ✅ Flexible grid layout (any number of bars)
- ✅ Perfect alignment between chords and piano roll
- ✅ Smooth playhead with 60fps animation
- ✅ Playhead-driven note highlighting
- ✅ Works with multiple chords per bar
- ✅ MIDI export functionality
- ✅ Professional UI design

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

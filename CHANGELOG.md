# Changelog - Chord Progression Studio

## Version 1.0.1 (2025-10-07) - CURRENT VERSION ✅

### Fixed
- **Piano Roll Visibility**: Restored piano roll display after overflow CSS issues
  - Fixed `.grid-wrapper` overflow from `hidden` to `visible !important`
  - Fixed `.grid-area` overflow to `overflow-y: auto` for proper scrolling
  - Piano roll now displays correctly with vertical scrolling
  
### Working Features
✅ **16-Pattern System**: A1-D4 matrix, each pattern holds 8 bars
✅ **Pattern Chaining**: Seamless playback across patterns
✅ **Piano Roll**: Fully visible with MIDI note display
✅ **Drum Sequencer**: 4 tracks (Kick, Snare, Hi-Hat, Clap) with 16-step sequencer
✅ **Random Beat Generator**: True randomness with varied patterns
✅ **Professional Mixer**: 2 channels (Piano + Drums) with VU meters
✅ **dB Faders**: Horizontal faders (-60 to +6 dB) with numeric input
✅ **Mute Controls**: Per-channel mute buttons
✅ **MIDI Export**: Drum patterns export to General MIDI format
✅ **32-Bar Default Progression**: Auto-loaded on startup

### Known Issues to Address Next
- VU meters continue animating when channel is muted (cosmetic)
- Scrolling is on entire grid-area instead of confined to grid-wrapper

### Technical Changes
- Modified CSS overflow properties on 3 key containers
- Removed sticky positioning that was causing rendering issues
- Set minimum height on grid-wrapper to ensure visibility

---

## Version 1.0.0 (2025-10-06) - Initial Release

### Major Features Added
- **Pattern System**: 16 patterns (4x4 matrix A1-D4)
- **Pattern Chaining**: Auto-advance through filled patterns
- **Loop Chain**: Continuous loop through all patterns
- **Random Beat Generator**: Generate unique drum patterns
- **Professional Mixer**: VU meters with gradient visualization
- **dB-based Volume Control**: Industry-standard dB scaling
- **MIDI Export**: Export drum patterns to .mid files

### Core Functionality
- Chord progression parser (pipe-delimited format)
- Piano roll visualization
- Real-time playback with Tone.js
- BPM control (60-200)
- Arpeggiator support
- Music theory analysis
- Dark theme with cyan accents

---

## Session Summary - What Happened

### The Problem
After implementing all v1.0 features (patterns, mixer, etc.), the piano roll became invisible due to CSS overflow issues. Multiple containers had `overflow: hidden` which prevented the piano roll from displaying.

### The Journey
1. **Started with**: Fully working app at commit 747e6bf
2. **Added features**: Pattern system, mixer, random beats (commit cfa1161)
3. **Bug introduced**: Piano roll disappeared due to overflow CSS
4. **Debugging attempts**: 
   - Tried multiple git checkouts
   - Added console logging
   - Modified overflow properties
   - Attempted sticky positioning (made it worse)
5. **Solution found**: Set `.grid-wrapper` to `overflow: visible` and `.grid-area` to `overflow-y: auto`

### Files Modified
- `app.js`: Pattern system logic, buildGrid fixes, debug logs
- `index.html`: Pattern matrix UI, mixer UI, 32-bar default progression
- `styles.css`: Overflow fixes, mixer styling, pattern button styling

### Lessons Learned
- `overflow: hidden` on parent containers hides child content
- Sticky positioning can cause rendering issues in CSS Grid
- Always test CSS changes thoroughly before committing
- Debug with console.log to verify JavaScript is working before blaming CSS

### Statistics
- **Total debugging time**: ~2 hours
- **Lines changed**: 95 insertions, 33 deletions
- **Commits during session**: 2 (cfa1161, b88583e)
- **Git checkouts attempted**: 4
- **Final status**: ✅ WORKING

---

## Git History

```bash
b88583e - fix: restore piano roll visibility with proper overflow handling (HEAD)
cfa1161 - feat: complete chord progression studio v1.0 with advanced features
747e6bf - Align piano roll and drum sequencer; add styles backup (LAST KNOWN GOOD)
6a4ca0a - Implement follow playhead mode and dynamic bar width
8b80050 - v3.2 - Professional Drum Sequencer with Zoom, Playheads & Auto-Sync
9a3dd73 - v3.0 - Horizontal Drum Sequencer + Advanced Features Spec
```

---

## How to Build From Scratch

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari)
- Optional: Local web server (Python, Node.js, or VS Code Live Server)

### Installation
```bash
# Clone the repository
git clone <repo-url>
cd Chord-Progression-App

# No build step needed - pure HTML/CSS/JS!
```

### Running
```bash
# Option 1: Open directly
open index.html

# Option 2: With local server (recommended)
python -m http.server 8000
# Then open http://localhost:8000
```

### File Structure
```
Chord-Progression-App/
├── index.html          # Main HTML structure (762 lines)
├── app.js             # Core application logic (5592 lines)
├── styles.css         # Complete styling (1933 lines)
├── README.md          # Documentation
└── CHANGELOG.md       # This file
```

### Key Dependencies (CDN)
- Tone.js v14.8.49 (audio synthesis)
- midi-writer-js v2.1.4 (MIDI export)

---

## Next Steps (Roadmap v2.0)

### Planned Features
1. **Fix VU Meters**: Stop animation when channel is muted
2. **Sticky Chord Row**: Keep chord row visible while scrolling piano roll
3. **Advanced Drum Effects**: Per-step modulation, effect buses, routing
4. **Hypnotic Effects**: Delay, reverb, filter, distortion buses
5. **LFO Modulation**: Modulate effect parameters
6. **Visual Routing Diagram**: Show effect routing graphically

### Technical Improvements
- Optimize grid rendering performance
- Add keyboard shortcuts for pattern switching
- Implement undo/redo for pattern edits
- Add pattern copy/paste functionality

---

**Current Status**: ✅ Production Ready (with minor cosmetic issues)
**Version**: 1.0.1
**Last Updated**: October 7, 2025 00:52 CET
**Maintainer**: Cascade AI Assistant + Jurgen

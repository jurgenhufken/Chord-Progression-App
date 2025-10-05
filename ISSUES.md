# Known Issues - Chord Progression Studio

## 🐛 Active Issues

### 1. Keyboard Shortcut Cmd+Z Not Working
**Status:** Open  
**Priority:** Medium  
**Description:**  
- Menu "Undo" button works correctly
- Keyboard shortcut Cmd+Z (macOS) does not trigger undo
- Event listener is registered but may be blocked or not firing
- Console logs show handleKeyboard is called but undo doesn't execute

**Steps to Reproduce:**
1. Make a change (e.g., split a bar)
2. Press Cmd+Z
3. Nothing happens (but menu Edit → Undo works)

**Expected Behavior:**
- Cmd+Z should trigger undo (same as menu button)
- Cmd+Shift+Z should trigger redo

**Technical Notes:**
- Event listener: `document.addEventListener('keydown', (e) => this.handleKeyboard(e))`
- Check for metaKey (Cmd on Mac) is in place: `(e.ctrlKey || e.metaKey)`
- Input field blocking works correctly
- Need to debug why event doesn't reach undo() function

---

### 2. Trailing Visualizer Missing
**Status:** Open  
**Priority:** Low  
**Description:**  
- No visual feedback for note trails during playback
- Would be nice to have a trailing effect showing recently played notes

**Proposed Solution:**
- Add CSS animation for note fade-out after playing
- Or add a trail line following the playhead
- Similar to DAW-style playback visualization

**Technical Notes:**
- Could use CSS transitions on `.note-block.playing` class
- Add `.note-block.recently-played` class with fade animation
- Remove class after animation completes

---

## ✅ Resolved Issues

### Multi-Chord Sub-Bars Support
**Status:** Resolved  
**Resolved:** 2025-10-05  
**Description:** Implemented full support for multiple chords per bar with sub-bar UI, selection, editing, and playback.

### Undo/Redo for All Operations
**Status:** Resolved  
**Resolved:** 2025-10-05  
**Description:** All bar and chord operations now call `saveState()` for undo/redo support.

### Sub-Chord Note Highlighting During Playback
**Status:** Resolved  
**Resolved:** 2025-10-05  
**Description:** Notes now highlight per sub-chord during playback instead of entire bar.

---

## 📝 Feature Requests

### 1. Keyboard Shortcuts Documentation
- Add in-app help panel showing all keyboard shortcuts
- Tooltips on buttons showing shortcuts

### 2. Export Options
- Export to MIDI file
- Export to audio (WAV/MP3)
- Export chord chart as PDF

### 3. Collaboration Features
- Share progression via URL
- Real-time collaboration
- Version history

---

## 🔧 Technical Debt

### Code Organization
- Consider splitting app.js into modules (too large: 4000+ lines)
- Separate concerns: UI, Audio, Analysis, Storage

### Performance
- Optimize buildGrid() - rebuilds entire grid on every change
- Consider virtual scrolling for large progressions

### Browser Compatibility
- Test on Firefox, Safari, Edge
- AudioContext warnings on page load (Tone.js)

---

**Last Updated:** 2025-10-05  
**Version:** 1.0.0

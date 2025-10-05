// Chord Progression Studio - Version 3.0 - Full MIDI Editor
class ChordProgressionApp {
    constructor() {
        this.progression = [];
        this.originalProgression = []; // Store original state
        this.isModified = false;
        this.synth = null;
        this.isPlaying = false;
        this.currentBar = 0;
        this.bpm = 120;
        this.loopEnabled = true; // Default ON
        
        // Arpeggiator
        this.arpEnabled = false;
        this.arpPattern = 'up';
        this.arpSpeed = '1/8';
        this.arpOctaves = 1;
        this.arpTrigger = 'retrigger';
        this.arpMode = 'run';  // Default to Run (Continuous)
        this.arpSequenceIndex = 0;
        this.currentArpNote = null;  // Track current arp note for highlighting
        this.arpVisualizer = true;  // Visualizer on by default
        this.lastHitNote = null;  // Track last hit to prevent duplicates
        this.playheadElement = null;
        this.playheadAnimationId = null;
        this.playStartTime = 0;
        
        // View settings
        this.showPianoRoll = true;
        this.pianoRange = 'auto'; // 'auto' or 'full'
        
        // Suggestions
        this.currentSuggestionBar = null;
        this.selectedBassNote = null;
        this.notePreviewEnabled = true;
        this.loopStart = 1;
        this.loopEnd = 4;
        
        // Edit mode state
        this.editMode = false;
        this.selectedNotes = new Set();
        this.clipboard = [];
        this.pasteTargetBar = null;
        this.isDragging = false;
        this.draggedNote = null;
        this.dragStartX = 0;
        this.dragStartY = 0;
        
        // Undo/Redo
        this.undoStack = [];
        this.redoStack = [];
        this.maxUndoSteps = 50;
        
        // Project management
        this.currentFileName = null;
        
        // Box selection
        this.isBoxSelecting = false;
        this.boxSelectStart = null;
        this.selectionBox = null;
        
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        this.init();
    }

    init() {
        this.setupSynth();
        this.setupEventListeners();
        this.parseChords();
        
        // Set loop button active by default
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) loopBtn.classList.add('active');
        
        // Initialize loop slider
        this.initLoopSlider();
    }

    initLoopSlider() {
        const track = document.getElementById('loopSliderTrack');
        const range = document.getElementById('loopSliderRange');
        const handleStart = document.getElementById('loopHandleStart');
        const handleEnd = document.getElementById('loopHandleEnd');
        
        if (!track || !range) return;
        
        let dragging = null;
        
        const updateSlider = () => {
            const totalBars = this.progression.length;
            if (totalBars === 0) return;
            
            // Calculate based on actual grid width (80px label + 120px per bar)
            const gridWidth = 80 + (totalBars * 120);
            track.style.width = gridWidth + 'px';
            
            const barWidth = 120;
            const startPos = 80 + ((this.loopStart - 1) * barWidth);
            const endPos = 80 + (this.loopEnd * barWidth);
            
            range.style.left = startPos + 'px';
            range.style.width = (endPos - startPos) + 'px';
            
            // Update labels
            const labels = document.getElementById('loopSliderLabels');
            if (labels) {
                labels.innerHTML = '';
                labels.style.width = gridWidth + 'px';
                for (let i = 1; i <= totalBars; i++) {
                    const label = document.createElement('span');
                    label.textContent = i;
                    labels.appendChild(label);
                }
            }
            
            // Update input fields
            document.getElementById('loopStart').value = this.loopStart;
            document.getElementById('loopEnd').value = this.loopEnd;
            
            // Rebuild grid to show highlights
            this.buildGrid();
        };
        
        handleStart.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            dragging = 'start';
        });
        
        handleEnd.addEventListener('mousedown', (e) => {
            e.stopPropagation();
            e.preventDefault();
            dragging = 'end';
        });
        
        range.addEventListener('mousedown', (e) => {
            if (e.target === range || e.target.classList.contains('loop-slider-range')) {
                e.preventDefault();
                dragging = 'range';
                this.dragStartX = e.clientX;
                this.dragStartLoopStart = this.loopStart;
                this.dragStartLoopEnd = this.loopEnd;
            }
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            e.preventDefault();
            
            const barWidth = 120;
            const labelWidth = 80;
            const gridContainer = document.getElementById('gridContainer');
            if (!gridContainer) return;
            
            const gridRect = gridContainer.getBoundingClientRect();
            const mouseX = e.clientX - gridRect.left;
            
            if (dragging === 'start') {
                // Calculate which bar we're over
                const barIndex = Math.floor((mouseX - labelWidth) / barWidth);
                const newStart = Math.max(1, Math.min(this.loopEnd, barIndex + 1));
                if (newStart !== this.loopStart) {
                    this.loopStart = newStart;
                    updateSlider();
                }
            } else if (dragging === 'end') {
                // Calculate which bar we're over
                const barIndex = Math.floor((mouseX - labelWidth) / barWidth);
                const newEnd = Math.max(this.loopStart, Math.min(this.progression.length, barIndex + 1));
                if (newEnd !== this.loopEnd) {
                    this.loopEnd = newEnd;
                    updateSlider();
                }
            } else if (dragging === 'range') {
                const deltaX = e.clientX - this.dragStartX;
                const deltaBars = Math.round(deltaX / barWidth);
                if (deltaBars !== 0) {
                    const rangeSize = this.dragStartLoopEnd - this.dragStartLoopStart;
                    const newStart = Math.max(1, Math.min(this.progression.length - rangeSize, this.dragStartLoopStart + deltaBars));
                    this.loopStart = newStart;
                    this.loopEnd = newStart + rangeSize;
                    updateSlider();
                }
            }
        });
        
        document.addEventListener('mouseup', () => {
            dragging = null;
        });
        
        // Initial update
        updateSlider();
        
        // Store update function for later use
        this.updateLoopSlider = updateSlider;
    }

    buildVerticalRuler() {
        const ruler = document.getElementById('verticalRuler');
        if (!ruler) return;
        
        ruler.innerHTML = '';
        
        this.progression.forEach((bar, i) => {
            const rulerBar = document.createElement('div');
            rulerBar.className = 'ruler-bar';
            rulerBar.textContent = i + 1;
            rulerBar.dataset.barIndex = i;
            rulerBar.style.width = this.barWidth + 'px'; // Match grid bar width EXACTLY
            rulerBar.style.minWidth = this.barWidth + 'px';
            rulerBar.style.maxWidth = this.barWidth + 'px';
            
            // Click to paste or select
            rulerBar.addEventListener('click', () => {
                if (this.clipboard.length > 0) {
                    this.setPasteTarget(i);
                    document.querySelectorAll('.ruler-bar').forEach(c => c.classList.remove('paste-target'));
                } else {
                    this.selectBarNotes(i);
                }
            });
            
            ruler.appendChild(rulerBar);
        });
    }

    setupSynth() {
        // Create effects chain with more aggressive settings
        this.filter = new Tone.Filter({
            frequency: 5000,  // Start lower for more noticeable effect
            type: 'lowpass',
            rolloff: -24,     // Steeper rolloff for more dramatic effect
            Q: 1
        });
        
        this.delay = new Tone.FeedbackDelay({
            delayTime: 0,
            feedback: 0,
            wet: 0
        });
        
        this.reverb = new Tone.Reverb({
            decay: 2,
            wet: 0
        });
        
        // Create synth with richer harmonics for better filter response
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { 
                type: 'triangle',  // Triangle = soft, warm sound (default)
                partials: [1, 0.5, 0.3, 0.2]  // Add harmonics
            },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.9,
                release: 0.3
            },
            filterEnvelope: {
                attack: 0.01,
                decay: 0.2,
                sustain: 0.5,
                release: 0.5,
                baseFrequency: 200,
                octaves: 4
            }
        });
        
        // Connect: Synth → Filter → Delay → Reverb → Destination
        this.synth.connect(this.filter);
        this.filter.connect(this.delay);
        this.delay.connect(this.reverb);
        this.reverb.toDestination();
        
        this.synth.volume.value = -20;
    }

    setupEventListeners() {
        document.getElementById('parseBtn').addEventListener('click', () => this.parseChords());
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('loopBtn').addEventListener('click', () => this.toggleLoop());
        document.getElementById('bpmInput').addEventListener('change', (e) => {
            this.bpm = parseInt(e.target.value);
            Tone.Transport.bpm.value = this.bpm;
        });
        document.getElementById('volume').addEventListener('input', (e) => {
            this.synth.volume.value = (e.target.value - 100) * 0.5;
        });
        document.getElementById('waveform')?.addEventListener('change', (e) => {
            this.synth.set({ oscillator: { type: e.target.value } });
        });
        document.getElementById('attack').addEventListener('input', (e) => {
            this.synth.set({ envelope: { attack: parseFloat(e.target.value) } });
        });
        document.getElementById('decay')?.addEventListener('input', (e) => {
            this.synth.set({ envelope: { decay: parseFloat(e.target.value) } });
        });
        document.getElementById('sustain')?.addEventListener('input', (e) => {
            this.synth.set({ envelope: { sustain: parseFloat(e.target.value) } });
        });
        document.getElementById('release').addEventListener('input', (e) => {
            this.synth.set({ envelope: { release: parseFloat(e.target.value) } });
        });
        
        // Filter controls
        document.getElementById('filterCutoff')?.addEventListener('input', (e) => {
            this.filter.frequency.value = parseFloat(e.target.value);
        });
        document.getElementById('filterResonance')?.addEventListener('input', (e) => {
            this.filter.Q.value = parseFloat(e.target.value);
        });
        document.getElementById('filterType')?.addEventListener('change', (e) => {
            this.filter.type = e.target.value;
        });
        
        // Effects controls
        document.getElementById('delayTime')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.delay.delayTime.value = value;
            this.delay.wet.value = value > 0 ? 0.5 : 0;
        });
        document.getElementById('delayFeedback')?.addEventListener('input', (e) => {
            this.delay.feedback.value = parseFloat(e.target.value);
        });
        document.getElementById('reverbWet')?.addEventListener('input', (e) => {
            this.reverb.wet.value = parseFloat(e.target.value);
        });
        
        document.getElementById('exportMidi').addEventListener('click', () => this.exportMidi());
        
        // View controls
        document.getElementById('togglePianoRoll')?.addEventListener('click', () => this.togglePianoRollView());
        document.getElementById('pianoRange')?.addEventListener('change', (e) => {
            this.pianoRange = e.target.value;
            this.buildGrid();
        });
        
        // New edit mode controls
        document.getElementById('toggleEditMode')?.addEventListener('click', () => this.toggleEditMode());
        document.getElementById('toggleOriginal')?.addEventListener('click', () => this.toggleOriginalModified());
        document.getElementById('clearAll')?.addEventListener('click', () => this.clearAllNotes());
        document.getElementById('addBar')?.addEventListener('click', () => this.addBar());
        
        // Transpose
        document.getElementById('transposeDown12')?.addEventListener('click', () => this.transpose(-12));
        document.getElementById('transposeDown1')?.addEventListener('click', () => this.transpose(-1));
        document.getElementById('transposeUp1')?.addEventListener('click', () => this.transpose(1));
        document.getElementById('transposeUp12')?.addEventListener('click', () => this.transpose(12));
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        
        // Suggestions panel
        document.getElementById('closeSuggestions')?.addEventListener('click', () => this.closeSuggestionsPanel());
        document.getElementById('previewBuilding')?.addEventListener('click', () => this.previewBuildingChord());
        
        // Note preview toggle
        document.getElementById('notePreview')?.addEventListener('change', (e) => {
            this.notePreviewEnabled = e.target.checked;
        });
        
        // Loop range
        document.getElementById('loopStart')?.addEventListener('change', (e) => {
            this.loopStart = Math.max(1, parseInt(e.target.value));
            // Ensure end is not before start
            if (this.loopEnd < this.loopStart) {
                this.loopEnd = this.loopStart;
                document.getElementById('loopEnd').value = this.loopEnd;
            }
        });
        document.getElementById('loopEnd')?.addEventListener('change', (e) => {
            this.loopEnd = Math.max(this.loopStart, parseInt(e.target.value));
        });
        
        // Arpeggiator
        document.getElementById('arpEnabled')?.addEventListener('change', (e) => {
            this.arpEnabled = e.target.checked;
        });
        document.getElementById('arpVisualizer')?.addEventListener('change', (e) => {
            this.arpVisualizer = e.target.checked;
        });
        document.getElementById('arpPattern')?.addEventListener('change', (e) => {
            this.arpPattern = e.target.value;
        });
        document.getElementById('arpSpeed')?.addEventListener('change', (e) => {
            this.arpSpeed = e.target.value;
        });
        document.getElementById('arpOctaves')?.addEventListener('change', (e) => {
            this.arpOctaves = parseInt(e.target.value);
        });
        document.getElementById('arpTrigger')?.addEventListener('change', (e) => {
            this.arpTrigger = e.target.value;
        });
        document.getElementById('arpMode')?.addEventListener('change', (e) => {
            this.arpMode = e.target.value;
            this.arpSequenceIndex = 0; // Reset sequence on mode change
        });
        
        // Box selection on grid - use capture phase to intercept before other handlers
        const gridContainer = document.getElementById('gridContainer');
        if (gridContainer) {
            gridContainer.addEventListener('mousedown', (e) => this.handleGridMouseDown(e), true); // true = capture phase
            gridContainer.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        }
        
        // Context menu actions
        document.getElementById('contextCut')?.addEventListener('click', () => {
            this.copySelectedNotes();
            this.deleteSelectedNotes();
            this.hideContextMenu();
        });
        document.getElementById('contextCopy')?.addEventListener('click', () => {
            this.copySelectedNotes();
            this.hideContextMenu();
        });
        document.getElementById('contextPaste')?.addEventListener('click', () => {
            if (this.contextMenuTargetBar !== null) {
                this.pasteTargetBar = this.contextMenuTargetBar;
                this.pasteNotes();
            }
            this.hideContextMenu();
        });
        document.getElementById('contextDelete')?.addEventListener('click', () => {
            this.deleteSelectedNotes();
            this.hideContextMenu();
        });
        
        // Hide context menu on click outside
        document.addEventListener('click', () => this.hideContextMenu());
        
        // Menu actions
        document.getElementById('menuNew')?.addEventListener('click', () => this.newProject());
        document.getElementById('menuOpen')?.addEventListener('click', () => this.openProject());
        document.getElementById('menuSave')?.addEventListener('click', () => this.saveProject());
        document.getElementById('menuSaveAs')?.addEventListener('click', () => this.saveProjectAs());
        document.getElementById('menuExportMidi')?.addEventListener('click', () => this.exportMidi());
        document.getElementById('menuUndo')?.addEventListener('click', () => this.undo());
        document.getElementById('menuRedo')?.addEventListener('click', () => this.redo());
        document.getElementById('menuCopy')?.addEventListener('click', () => this.copySelectedNotes());
        document.getElementById('menuPaste')?.addEventListener('click', () => console.log('Use ruler to paste'));
        document.getElementById('menuDelete')?.addEventListener('click', () => this.deleteSelectedNotes());
        
        // File input
        document.getElementById('fileInput')?.addEventListener('change', (e) => this.handleFileOpen(e));
    }

    handleGridMouseDown(e) {
        if (!this.editMode) return;
        
        // Check if clicking on a note block or chord cell
        if (e.target.classList.contains('note-block')) return;
        if (e.target.classList.contains('chord-cell')) return;
        if (e.target.classList.contains('chord-label')) return;
        if (e.target.classList.contains('bar-num')) return;
        if (e.target.classList.contains('chord-edit-btn')) return;
        if (e.target.classList.contains('bar-delete-btn')) return;
        
        // Only start on piano cells or grid labels
        if (!e.target.classList.contains('piano-cell') && !e.target.classList.contains('grid-label')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Clear previous selection if not holding Ctrl
        if (!e.ctrlKey && !e.metaKey) {
            this.deselectAllNotes();
        }
        
        this.isBoxSelecting = true;
        this.boxSelectStart = { x: e.clientX, y: e.clientY };
        
        // Create selection box element
        this.selectionBox = document.createElement('div');
        this.selectionBox.style.cssText = 'position: fixed; border: 2px dashed #00d4ff; background: rgba(0,212,255,0.1); pointer-events: none; z-index: 9999;';
        document.body.appendChild(this.selectionBox);
        
        document.addEventListener('mousemove', this.handleBoxSelectMove);
        document.addEventListener('mouseup', this.handleBoxSelectEnd);
    }

    handleBoxSelectMove = (e) => {
        if (!this.isBoxSelecting || !this.selectionBox) return;
        
        const startX = Math.min(this.boxSelectStart.x, e.clientX);
        const startY = Math.min(this.boxSelectStart.y, e.clientY);
        const width = Math.abs(e.clientX - this.boxSelectStart.x);
        const height = Math.abs(e.clientY - this.boxSelectStart.y);
        
        this.selectionBox.style.left = startX + 'px';
        this.selectionBox.style.top = startY + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';
    }

    handleBoxSelectEnd = (e) => {
        if (!this.isBoxSelecting) return;
        
        // Get all notes within selection box
        const boxRect = this.selectionBox.getBoundingClientRect();
        
        document.querySelectorAll('.note-block').forEach(noteBlock => {
            const noteRect = noteBlock.getBoundingClientRect();
            
            // Check if note intersects with selection box
            if (!(noteRect.right < boxRect.left || 
                  noteRect.left > boxRect.right || 
                  noteRect.bottom < boxRect.top || 
                  noteRect.top > boxRect.bottom)) {
                // Note is within selection
                noteBlock.classList.add('selected');
                const key = `${noteBlock.dataset.midi}-${noteBlock.dataset.barIndex}-${noteBlock.dataset.chordIndex}`;
                this.selectedNotes.add(key);
            }
        });
        
        // Cleanup
        if (this.selectionBox) {
            document.body.removeChild(this.selectionBox);
            this.selectionBox = null;
        }
        document.removeEventListener('mousemove', this.handleBoxSelectMove);
        document.removeEventListener('mouseup', this.handleBoxSelectEnd);
        this.isBoxSelecting = false;
        this.boxSelectStart = null;
        
        console.log('Selected notes:', this.selectedNotes.size);
    }

    handleKeyboard(e) {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (!this.editMode) return; // Only work in edit mode
        
        // Ctrl+Z - Undo
        if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Y or Ctrl+Shift+Z - Redo
        else if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
            e.preventDefault();
            this.redo();
        }
        // Ctrl+C - Copy
        else if (e.ctrlKey && e.key === 'c') {
            e.preventDefault();
            this.copySelectedNotes();
        }
        // Ctrl+V - Paste
        else if (e.ctrlKey && e.key === 'v') {
            e.preventDefault();
            console.log('Press Shift+Click on a bar to paste');
        }
        // Delete key
        else if (e.key === 'Delete') {
            e.preventDefault();
            this.deleteSelectedNotes();
        }
        // Ctrl+A - Select all
        else if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            this.selectAllNotes();
        }
        // Escape - Deselect
        else if (e.key === 'Escape') {
            this.deselectAllNotes();
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('toggleEditMode');
        if (btn) {
            btn.textContent = this.editMode ? '🔒 Lock' : '✏️ Edit';
            btn.classList.toggle('active', this.editMode);
        }
        
        // Update cursor on piano cells
        document.querySelectorAll('.piano-cell').forEach(cell => {
            cell.style.cursor = this.editMode ? 'crosshair' : 'default';
        });
        
        if (!this.editMode) {
            this.deselectAllNotes();
        }
    }

    toggleOriginalModified() {
        if (this.originalProgression.length === 0) return;
        
        this.isModified = !this.isModified;
        
        if (this.isModified) {
            // Show modified version
            this.buildGrid();
        } else {
            // Show original version
            const temp = JSON.parse(JSON.stringify(this.progression));
            this.progression = JSON.parse(JSON.stringify(this.originalProgression));
            this.buildGrid();
            this.progression = temp;
        }
        
        const btn = document.getElementById('toggleOriginal');
        if (btn) {
            btn.textContent = this.isModified ? '📝 Modified' : '📄 Original';
        }
    }

    clearAllNotes() {
        if (!confirm('Clear all notes? This will remove all chords.')) return;
        
        this.progression = this.progression.map(bar => ({
            ...bar,
            chords: []
        }));
        
        this.buildGrid();
    }

    togglePianoRollView() {
        this.showPianoRoll = !this.showPianoRoll;
        const btn = document.getElementById('togglePianoRoll');
        if (btn) {
            btn.textContent = this.showPianoRoll ? '👁️ Piano Roll' : '🙈 Piano Roll';
            btn.classList.toggle('active', this.showPianoRoll);
        }
        this.buildGrid();
    }

    changeZoom(octaves) {
        this.octaveRange = octaves;
        this.buildGrid();
    }

    parseChords() {
        const input = document.getElementById('chordInput').value;
        const bars = input.split('|').filter(b => b.trim());
        
        this.progression = bars.map((bar, i) => {
            const chords = bar.trim().split(/\s+/).filter(c => c);
            return {
                barNum: i + 1,
                chords: chords.map(c => this.parseChord(c))
            };
        });
        
        this.originalProgression = JSON.parse(JSON.stringify(this.progression));
        this.isModified = false;
        
        // Auto-adjust loop range to match progression length
        this.loopStart = 1;
        this.loopEnd = this.progression.length;
        document.getElementById('loopStart').value = this.loopStart;
        document.getElementById('loopEnd').value = this.loopEnd;
        
        this.buildGrid();
        this.analyzeProgression();
        if (this.updateLoopSlider) this.updateLoopSlider();
    }
    
    parseChord(symbol) {
        const rootMatch = symbol.match(/^([A-G][#b]?)/);
        if (!rootMatch) return null;
        
        const root = rootMatch[1];
        const quality = symbol.slice(root.length);
        
        const rootNote = this.noteMap(root);
        const intervals = this.getIntervals(quality);
        const midiNotes = intervals.map(i => 60 + rootNote + i);
        
        return {
            symbol,
            root,
            quality,
            midiNotes,
            noteNames: midiNotes.map(m => this.midiToNote(m))
        };
    }

    noteMap(note) {
        const map = { 'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 
                     'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 
                     'A#': 10, 'Bb': 10, 'B': 11 };
        return map[note] || 0;
    }

    getIntervals(quality) {
        const intervals = {
            '': [0, 4, 7], 'm': [0, 3, 7], '7': [0, 4, 7, 10],
            'm7': [0, 3, 7, 10], 'maj7': [0, 4, 7, 11], 'dim': [0, 3, 6],
            'aug': [0, 4, 8], 'sus4': [0, 5, 7], 'sus2': [0, 2, 7]
        };
        return intervals[quality] || intervals[''];
    }

    midiToNote(midi) {
        const octave = Math.floor(midi / 12) - 1;
        const note = this.noteNames[midi % 12];
        return note + octave;
    }

    buildGrid() {
        const container = document.getElementById('gridContainer');
        container.innerHTML = '';
        
        const numBars = Math.max(this.progression.length, 1);
        
        // FIXED bar width - never changes
        this.barWidth = 120;
        container.style.gridTemplateColumns = `80px repeat(${numBars}, ${this.barWidth}px)`;
        
        // Calculate actual note range
        let actualNumNotes = 0;
        let minMidi = 0;
        let maxMidi = 127;
        
        if (this.showPianoRoll) {
            if (this.pianoRange === 'full') {
                // Full MIDI range (C0 to C8)
                minMidi = 12; // C0
                maxMidi = 108; // C8
                actualNumNotes = maxMidi - minMidi + 1;
            } else {
                // Auto: smart range based on actual notes
                minMidi = 127;
                maxMidi = 0;
                this.progression.forEach(bar => {
                    bar.chords.forEach(chord => {
                        if (chord && chord.midiNotes) {
                            chord.midiNotes.forEach(note => {
                                minMidi = Math.min(minMidi, note);
                                maxMidi = Math.max(maxMidi, note);
                            });
                        }
                    });
                });
                minMidi = Math.max(0, minMidi - 6);
                maxMidi = Math.min(127, maxMidi + 6);
                actualNumNotes = maxMidi - minMidi + 1;
            }
        }
        
        // Set grid rows (chord row + piano roll)
        if (this.showPianoRoll && actualNumNotes > 0) {
            container.style.gridTemplateRows = `80px repeat(${actualNumNotes}, 20px)`;
        } else {
            container.style.gridTemplateRows = `80px`;
        }
        
        // Playhead
        this.playheadElement = document.createElement('div');
        this.playheadElement.className = 'playhead';
        this.playheadElement.style.left = '80px';
        this.playheadElement.style.display = 'none';
        container.appendChild(this.playheadElement);
        
        // Build vertical ruler
        this.buildVerticalRuler();
        
        // Chord row
        this.addCell(container, 'Chords', 'grid-label');
        this.progression.forEach((bar, i) => {
            const cell = this.addCell(container, '', 'grid-cell chord-cell');
            cell.dataset.barIndex = i;
            
            // Highlight loop range
            const barNum = i + 1;
            if (barNum >= this.loopStart && barNum <= this.loopEnd) {
                cell.style.boxShadow = 'inset 0 0 0 3px rgba(0, 212, 255, 0.3)';
            }
            
            // Delete bar button
            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = '×';
            deleteBtn.className = 'bar-delete-btn';
            deleteBtn.style.cssText = 'position: absolute; top: 4px; right: 24px; width: 20px; height: 20px; border-radius: 50%; background: rgba(244,67,54,0.8); border: none; color: white; cursor: pointer; opacity: 0; transition: opacity 0.2s;';
            deleteBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteBar(i);
            };
            cell.appendChild(deleteBtn);
            cell.addEventListener('mouseenter', () => deleteBtn.style.opacity = '1');
            cell.addEventListener('mouseleave', () => deleteBtn.style.opacity = '0');
            
            const barNumLabel = document.createElement('div');
            barNumLabel.className = 'bar-num';
            barNumLabel.textContent = bar.barNum;
            cell.appendChild(barNumLabel);
            
            const chordText = bar.chords.map(c => c.symbol).join(' ');
            const chordLabel = document.createElement('div');
            chordLabel.textContent = chordText || '-';
            chordLabel.className = 'chord-label';
            cell.appendChild(chordLabel);
            
            // Add chord input helper button
            const editBtn = document.createElement('button');
            editBtn.textContent = '+';
            editBtn.className = 'chord-edit-btn';
            editBtn.onclick = (e) => {
                e.stopPropagation();
                this.showChordInputHelper(i);
            };
            cell.appendChild(editBtn);
            
            cell.addEventListener('click', (e) => {
                if (e.shiftKey && this.clipboard.length > 0) {
                    // Shift+Click = Set paste target
                    this.setPasteTarget(i);
                } else if (bar.chords.length === 0 || !bar.chords[0]) {
                    // Empty bar - show suggestions
                    this.showSuggestionsPanel(i);
                } else {
                    // Has chord - preview it and analyze
                    this.previewBar(i);
                    this.analyzeChord(bar.chords[0]);
                }
            });
        });
        
        // Piano roll rows (only if enabled)
        if (this.showPianoRoll) {
            let minMidi, maxMidi, actualNumNotes;
            
            if (this.pianoRange === 'full') {
                minMidi = 12; // C0
                maxMidi = 108; // C8
                actualNumNotes = maxMidi - minMidi + 1;
            } else {
                // Find min and max MIDI notes in progression
                minMidi = 127;
                maxMidi = 0;
                this.progression.forEach(bar => {
                    bar.chords.forEach(chord => {
                        if (chord && chord.midiNotes) {
                            chord.midiNotes.forEach(note => {
                                minMidi = Math.min(minMidi, note);
                                maxMidi = Math.max(maxMidi, note);
                            });
                        }
                    });
                });
                
                // Add padding
                minMidi = Math.max(0, minMidi - 6);
                maxMidi = Math.min(127, maxMidi + 6);
                actualNumNotes = maxMidi - minMidi + 1;
            }
            
            for (let noteIdx = 0; noteIdx < actualNumNotes; noteIdx++) {
                const midiNote = maxMidi - noteIdx;
                const noteName = this.midiToNote(midiNote);
                const isWhite = this.whiteKeys.includes(noteName.slice(0, -1));
                
                this.addCell(container, noteName, 'grid-label');
                
                this.progression.forEach((bar, barIdx) => {
                    const cell = this.addCell(container, '', `grid-cell piano-cell ${isWhite ? 'white' : 'black'}`);
                    cell.dataset.midi = midiNote;
                    cell.dataset.barIndex = barIdx;
                    
                    // Make cell clickable in edit mode
                    cell.addEventListener('click', (e) => {
                        if (!this.isBoxSelecting) {
                            this.handlePianoCellClick(e, midiNote, barIdx);
                        }
                    });
                    
                    // Add existing notes
                    bar.chords.forEach((chord, chordIdx) => {
                        if (chord && chord.midiNotes.includes(midiNote)) {
                            this.addNoteBlock(cell, midiNote, barIdx, chordIdx, bar.chords.length, chord.symbol);
                        }
                    });
                });
            }
        }
    }

    addCell(container, content, className) {
        const cell = document.createElement('div');
        cell.className = className;
        if (content) cell.textContent = content;
        container.appendChild(cell);
        return cell;
    }

    addNoteBlock(cell, midiNote, barIdx, chordIdx, totalChords, symbol) {
        const noteBlock = document.createElement('div');
        noteBlock.className = 'note-block';
        noteBlock.dataset.midi = midiNote;
        noteBlock.dataset.barIndex = barIdx;
        noteBlock.dataset.chordIndex = chordIdx;
        
        const width = 100 / totalChords;
        const left = chordIdx * width;
        noteBlock.style.width = `${width - 2}%`;
        noteBlock.style.left = `${left}%`;
        
        // Add resize handles
        if (this.editMode) {
            const leftHandle = document.createElement('div');
            leftHandle.className = 'resize-handle resize-left';
            leftHandle.addEventListener('mousedown', (e) => this.handleResizeStart(e, noteBlock, 'left'));
            noteBlock.appendChild(leftHandle);
            
            const rightHandle = document.createElement('div');
            rightHandle.className = 'resize-handle resize-right';
            rightHandle.addEventListener('mousedown', (e) => this.handleResizeStart(e, noteBlock, 'right'));
            noteBlock.appendChild(rightHandle);
        }
        
        // Make note selectable and draggable
        noteBlock.addEventListener('click', (e) => this.handleNoteClick(e, noteBlock));
        noteBlock.addEventListener('mousedown', (e) => this.handleNoteMouseDown(e, noteBlock));
        
        cell.appendChild(noteBlock);
        return noteBlock;
    }

    handleResizeStart(e, noteBlock, side) {
        e.stopPropagation();
        e.preventDefault();
        
        this.isResizing = true;
        this.resizingNote = noteBlock;
        this.resizeSide = side;
        this.resizeStartX = e.clientX;
        this.resizeStartWidth = noteBlock.offsetWidth;
        this.resizeStartLeft = noteBlock.offsetLeft;
        
        document.addEventListener('mousemove', this.handleResizeMove);
        document.addEventListener('mouseup', this.handleResizeEnd);
        
        noteBlock.style.cursor = side === 'left' ? 'w-resize' : 'e-resize';
    }

    handleResizeMove = (e) => {
        if (!this.isResizing || !this.resizingNote) return;
        
        const deltaX = e.clientX - this.resizeStartX;
        const parentWidth = this.resizingNote.parentElement.offsetWidth;
        const deltaPercent = (deltaX / parentWidth) * 100;
        
        if (this.resizeSide === 'right') {
            // Resize from right
            const newWidth = this.resizeStartWidth + deltaX;
            if (newWidth > 20) { // Minimum width
                this.resizingNote.style.width = `${(newWidth / parentWidth) * 100}%`;
            }
        } else {
            // Resize from left
            const newWidth = this.resizeStartWidth - deltaX;
            const newLeft = this.resizeStartLeft + deltaX;
            if (newWidth > 20) { // Minimum width
                this.resizingNote.style.width = `${(newWidth / parentWidth) * 100}%`;
                this.resizingNote.style.left = `${(newLeft / parentWidth) * 100}%`;
            }
        }
    }

    handleResizeEnd = (e) => {
        if (!this.isResizing) return;
        
        this.resizingNote.style.cursor = 'pointer';
        
        // Cleanup
        document.removeEventListener('mousemove', this.handleResizeMove);
        document.removeEventListener('mouseup', this.handleResizeEnd);
        this.isResizing = false;
        this.resizingNote = null;
        
        // Note: For now, resize is just visual
        // To make it functional, we'd need to track note duration in the data model
        console.log('Resize complete - duration tracking not yet implemented');
    }

    handlePianoCellClick(e, midiNote, barIdx) {
        if (!this.editMode) {
            // Preview note even when not in edit mode
            if (this.notePreviewEnabled) {
                this.playNote(midiNote);
            }
            return;
        }
        
        // Toggle note at this position
        this.toggleNoteAtPosition(midiNote, barIdx);
    }
    
    playNote(midiNote) {
        if (!this.notePreviewEnabled) return;
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        this.synth.triggerAttackRelease(freq, '8n');
    }

    handlePianoCellMouseDown(e, midiNote, barIdx) {
        if (!this.editMode) return;
        // Could implement drag-to-create multiple notes
    }

    handleNoteClick(e, noteBlock) {
        e.stopPropagation();
        
        const midi = parseInt(noteBlock.dataset.midi);
        
        if (!this.editMode) {
            // Preview note
            this.playNote(midi);
            return;
        }
        
        // In edit mode: Toggle selection
        const key = `${noteBlock.dataset.midi}-${noteBlock.dataset.barIndex}-${noteBlock.dataset.chordIndex}`;
        
        if (e.ctrlKey || e.metaKey) {
            // Multi-select with Ctrl
            noteBlock.classList.toggle('selected');
            if (noteBlock.classList.contains('selected')) {
                this.selectedNotes.add(key);
            } else {
                this.selectedNotes.delete(key);
            }
        } else {
            // Single selection (deselect others)
            this.deselectAllNotes();
            noteBlock.classList.add('selected');
            this.selectedNotes.add(key);
        }
        
        console.log('Selected notes:', this.selectedNotes.size);
        this.analyzeSelection();
    }

    handleNoteMouseDown(e, noteBlock) {
        if (!this.editMode) return;
        
        e.preventDefault();
        this.isDragging = true;
        this.draggedNote = noteBlock;
        this.dragStartX = e.clientX;
        this.dragStartY = e.clientY;
        
        // Add global mouse move and up listeners
        document.addEventListener('mousemove', this.handleMouseMove);
        document.addEventListener('mouseup', this.handleMouseUp);
        
        noteBlock.style.opacity = '0.5';
        noteBlock.style.cursor = 'grabbing';
    }

    handleMouseMove = (e) => {
        if (!this.isDragging || !this.draggedNote) return;
        
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Visual feedback during drag
        this.draggedNote.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    }

    handleMouseUp = (e) => {
        if (!this.isDragging || !this.draggedNote) return;
        
        // Calculate new position
        const deltaX = e.clientX - this.dragStartX;
        const deltaY = e.clientY - this.dragStartY;
        
        // Reset visual
        this.draggedNote.style.opacity = '1';
        this.draggedNote.style.cursor = 'pointer';
        this.draggedNote.style.transform = '';
        
        // Calculate which bar and note the drag ended on
        const barWidth = 120;
        const noteHeight = 20;
        const newBarOffset = Math.round(deltaX / barWidth);
        const newNoteOffset = Math.round(deltaY / noteHeight);
        
        if (newBarOffset !== 0 || newNoteOffset !== 0) {
            this.moveNote(this.draggedNote, newBarOffset, newNoteOffset);
        }
        
        // Cleanup
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        this.isDragging = false;
        this.draggedNote = null;
    }

    moveNote(noteBlock, barOffset, noteOffset) {
        const oldMidi = parseInt(noteBlock.dataset.midi);
        const oldBarIdx = parseInt(noteBlock.dataset.barIndex);
        const oldChordIdx = parseInt(noteBlock.dataset.chordIndex);
        
        const newMidi = oldMidi - noteOffset; // Negative because grid goes top to bottom
        const newBarIdx = oldBarIdx + barOffset;
        
        // Validate new position
        if (newBarIdx < 0 || newBarIdx >= this.progression.length) return;
        if (newMidi < 0 || newMidi > 127) return;
        
        // Remove from old position
        const oldBar = this.progression[oldBarIdx];
        const oldChord = oldBar.chords[oldChordIdx];
        if (oldChord) {
            const noteIndex = oldChord.midiNotes.indexOf(oldMidi);
            if (noteIndex !== -1) {
                oldChord.midiNotes.splice(noteIndex, 1);
                oldChord.noteNames.splice(noteIndex, 1);
                
                if (oldChord.midiNotes.length === 0) {
                    oldBar.chords.splice(oldChordIdx, 1);
                } else {
                    oldChord.symbol = this.recognizeChord(oldChord.midiNotes);
                }
            }
        }
        
        // Add to new position
        const newBar = this.progression[newBarIdx];
        if (newBar.chords.length === 0) {
            newBar.chords = [{
                symbol: '?',
                root: '',
                quality: '',
                midiNotes: [newMidi],
                noteNames: [this.midiToNote(newMidi)]
            }];
        } else {
            const newChord = newBar.chords[0];
            newChord.midiNotes.push(newMidi);
            newChord.midiNotes.sort((a, b) => a - b);
            newChord.noteNames = newChord.midiNotes.map(m => this.midiToNote(m));
            newChord.symbol = this.recognizeChord(newChord.midiNotes);
        }
        
        this.buildGrid();
        this.analyzeProgression(); // Update analysis after transpose
    }

    toggleNoteAtPosition(midiNote, barIdx) {
        this.saveState();
        const bar = this.progression[barIdx];
        
        // Check if note exists in any chord
        let noteFound = false;
        bar.chords.forEach((chord, chordIdx) => {
            const noteIndex = chord.midiNotes.indexOf(midiNote);
            if (noteIndex !== -1) {
                // Remove note
                chord.midiNotes.splice(noteIndex, 1);
                chord.noteNames.splice(noteIndex, 1);
                
                if (chord.midiNotes.length === 0) {
                    // Remove empty chord
                    bar.chords.splice(chordIdx, 1);
                } else {
                    // Update chord symbol
                    chord.symbol = this.recognizeChord(chord.midiNotes);
                }
                noteFound = true;
            }
        });
        
        if (!noteFound) {
            // Add note
            if (bar.chords.length === 0) {
                // Create new chord
                bar.chords = [{
                    symbol: '?',
                    root: '',
                    quality: '',
                    midiNotes: [midiNote],
                    noteNames: [this.midiToNote(midiNote)]
                }];
            } else {
                // Add to first chord
                const chord = bar.chords[0];
                chord.midiNotes.push(midiNote);
                chord.midiNotes.sort((a, b) => a - b);
                chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                
                // Recognize chord
                chord.symbol = this.recognizeChord(chord.midiNotes);
            }
        }
        
        this.buildGrid();
        this.analyzeProgression(); // Update analysis after note change
    }

    recognizeChord(midiNotes) {
        if (!midiNotes || midiNotes.length === 0) return '?';
        if (midiNotes.length === 1) return this.midiToNote(midiNotes[0]).replace(/\d+/, '');
        
        const sorted = [...midiNotes].sort((a, b) => a - b);
        const root = sorted[0];
        const intervals = sorted.map(note => (note - root) % 12).sort((a, b) => a - b);
        
        const rootName = this.midiToNote(root).replace(/\d+/, '');
        
        // Handle 2-note intervals (dyads)
        if (midiNotes.length === 2) {
            const interval = intervals[1];
            const dyads = {
                1: rootName + ' min2',
                2: rootName + ' maj2', 
                3: rootName + ' min3',
                4: rootName + ' maj3',
                5: rootName + '5 (4th)',
                7: rootName + '5 (Perfect)',
                8: rootName + ' min6',
                9: rootName + ' maj6',
                10: rootName + ' min7',
                11: rootName + ' maj7',
                12: rootName + ' oct'
            };
            return dyads[interval] || rootName + ' +' + interval;
        }
        
        const intervalString = intervals.join(',');
        const chordPatterns = {
            '0,4,7': '', '0,3,7': 'm', '0,4,7,10': '7',
            '0,3,7,10': 'm7', '0,4,7,11': 'maj7', '0,3,6': 'dim',
            '0,4,8': 'aug', '0,5,7': 'sus4', '0,2,7': 'sus2'
        };
        
        const quality = chordPatterns[intervalString] || '?';
        return rootName + quality;
    }

    deleteSelectedNotes() {
        if (this.selectedNotes.size === 0) return;
        this.saveState();
        
        this.selectedNotes.forEach(noteKey => {
            const [midi, barIdx, chordIdx] = noteKey.split('-').map(Number);
            const bar = this.progression[barIdx];
            const chord = bar.chords[chordIdx];
            
            if (chord) {
                const noteIndex = chord.midiNotes.indexOf(midi);
                if (noteIndex !== -1) {
                    chord.midiNotes.splice(noteIndex, 1);
                    chord.noteNames.splice(noteIndex, 1);
                    
                    if (chord.midiNotes.length === 0) {
                        bar.chords.splice(chordIdx, 1);
                    } else {
                        chord.symbol = this.recognizeChord(chord.midiNotes);
                    }
                }
            }
        });
        
        this.selectedNotes.clear();
        this.buildGrid();
        this.analyzeProgression();
    }

    copySelectedNotes() {
        this.clipboard = Array.from(this.selectedNotes).map(key => {
            const [midi, barIdx, chordIdx] = key.split('-').map(Number);
            return { 
                midi, 
                barIdx, 
                chordIdx,
                midiNote: midi,
                noteName: this.midiToNote(midi)
            };
        });
        console.log('Copied', this.clipboard.length, 'notes - Shift+Click a bar to paste');
        this.showPasteHint();
    }

    showPasteHint() {
        // Highlight all ruler bars as paste targets
        document.querySelectorAll('.ruler-bar').forEach(cell => {
            cell.classList.add('paste-target');
        });
        setTimeout(() => {
            document.querySelectorAll('.ruler-bar').forEach(cell => {
                cell.classList.remove('paste-target');
            });
        }, 2000);
    }

    selectBarNotes(barIndex) {
        // Deselect all first
        this.deselectAllNotes();
        
        // Select all notes in this bar
        document.querySelectorAll(`.note-block[data-bar-index="${barIndex}"]`).forEach(block => {
            block.classList.add('selected');
            this.selectedNotes.add(`${block.dataset.midi}-${block.dataset.barIndex}-${block.dataset.chordIndex}`);
        });
        
        console.log('Selected', this.selectedNotes.size, 'notes from bar', barIndex + 1);
    }

    setPasteTarget(barIndex) {
        this.pasteTargetBar = barIndex;
        this.pasteNotes();
    }

    pasteNotes() {
        if (this.clipboard.length === 0 || this.pasteTargetBar === null) return;
        this.saveState();
        
        const targetBar = this.progression[this.pasteTargetBar];
        
        // Create or get first chord in target bar
        if (targetBar.chords.length === 0) {
            targetBar.chords = [{
                symbol: '?',
                root: '',
                quality: '',
                midiNotes: [],
                noteNames: []
            }];
        }
        
        const targetChord = targetBar.chords[0];
        
        // Add all copied notes
        this.clipboard.forEach(item => {
            if (!targetChord.midiNotes.includes(item.midiNote)) {
                targetChord.midiNotes.push(item.midiNote);
                targetChord.noteNames.push(item.noteName);
            }
        });
        
        // Sort and recognize chord
        targetChord.midiNotes.sort((a, b) => a - b);
        targetChord.symbol = this.recognizeChord(targetChord.midiNotes);
        
        this.pasteTargetBar = null;
        this.buildGrid();
        this.analyzeProgression();
        
        console.log('Pasted', this.clipboard.length, 'notes');
    }

    selectAllNotes() {
        document.querySelectorAll('.note-block').forEach(block => {
            block.classList.add('selected');
            this.selectedNotes.add(`${block.dataset.midi}-${block.dataset.barIndex}-${block.dataset.chordIndex}`);
        });
    }

    deselectAllNotes() {
        document.querySelectorAll('.note-block.selected').forEach(block => {
            block.classList.remove('selected');
        });
        this.selectedNotes.clear();
    }

    handleContextMenu(e) {
        if (!this.editMode) return;
        
        e.preventDefault();
        
        // Check if right-clicking on a bar or notes
        let targetBar = null;
        if (e.target.classList.contains('chord-cell') || e.target.closest('.chord-cell')) {
            const cell = e.target.classList.contains('chord-cell') ? e.target : e.target.closest('.chord-cell');
            targetBar = parseInt(cell.dataset.barIndex);
        } else if (e.target.classList.contains('piano-cell')) {
            targetBar = parseInt(e.target.dataset.barIndex);
        }
        
        this.contextMenuTargetBar = targetBar;
        
        // Show context menu at mouse position
        const menu = document.getElementById('contextMenu');
        menu.style.display = 'block';
        menu.style.left = e.pageX + 'px';
        menu.style.top = e.pageY + 'px';
        
        // Enable/disable paste based on clipboard
        const pasteItem = document.getElementById('contextPaste');
        if (pasteItem) {
            pasteItem.style.opacity = this.clipboard.length > 0 ? '1' : '0.5';
            pasteItem.style.cursor = this.clipboard.length > 0 ? 'pointer' : 'not-allowed';
        }
    }

    hideContextMenu() {
        const menu = document.getElementById('contextMenu');
        if (menu) menu.style.display = 'none';
    }

    saveState() {
        // Save current state to undo stack
        const state = JSON.parse(JSON.stringify(this.progression));
        this.undoStack.push(state);
        
        // Limit undo stack size
        if (this.undoStack.length > this.maxUndoSteps) {
            this.undoStack.shift();
        }
        
        // Clear redo stack when new action is performed
        this.redoStack = [];
    }

    undo() {
        if (this.undoStack.length === 0) {
            console.log('Nothing to undo');
            return;
        }
        
        // Save current state to redo stack
        this.redoStack.push(JSON.parse(JSON.stringify(this.progression)));
        
        // Restore previous state
        this.progression = this.undoStack.pop();
        
        this.buildGrid();
        this.analyzeProgression();
        console.log('Undo');
    }

    redo() {
        if (this.redoStack.length === 0) {
            console.log('Nothing to redo');
            return;
        }
        
        // Save current state to undo stack
        this.undoStack.push(JSON.parse(JSON.stringify(this.progression)));
        
        // Restore redo state
        this.progression = this.redoStack.pop();
        
        this.buildGrid();
        this.analyzeProgression();
        console.log('Redo');
    }

    newProject() {
        if (confirm('Create new project? Unsaved changes will be lost.')) {
            this.progression = [{ barNum: 1, chords: [] }];
            this.currentFileName = null;
            this.undoStack = [];
            this.redoStack = [];
            this.buildGrid();
            this.analyzeProgression();
            console.log('New project created');
        }
    }

    saveProject() {
        const projectData = {
            version: '3.0',
            progression: this.progression,
            bpm: this.bpm,
            loopStart: this.loopStart,
            loopEnd: this.loopEnd
        };
        
        const json = JSON.stringify(projectData, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = this.currentFileName || 'chord-progression.json';
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('Project saved');
    }

    saveProjectAs() {
        const filename = prompt('Enter filename:', 'chord-progression.json');
        if (filename) {
            this.currentFileName = filename.endsWith('.json') ? filename : filename + '.json';
            this.saveProject();
        }
    }

    openProject() {
        document.getElementById('fileInput').click();
    }

    handleFileOpen(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const projectData = JSON.parse(event.target.result);
                
                // Load progression
                this.progression = projectData.progression || projectData;
                this.bpm = projectData.bpm || 120;
                this.loopStart = projectData.loopStart || 1;
                this.loopEnd = projectData.loopEnd || this.progression.length;
                
                // Update UI
                document.getElementById('bpmInput').value = this.bpm;
                document.getElementById('loopStart').value = this.loopStart;
                document.getElementById('loopEnd').value = this.loopEnd;
                
                this.currentFileName = file.name;
                this.undoStack = [];
                this.redoStack = [];
                
                this.buildGrid();
                this.analyzeProgression();
                
                console.log('Project loaded:', file.name);
            } catch (error) {
                alert('Error loading file: ' + error.message);
            }
        };
        reader.readAsText(file);
        
        // Reset file input
        e.target.value = '';
    }

    showChordInputHelper(barIdx) {
        const chordSymbol = prompt('Enter chord symbol (e.g., Am, Cmaj7, Dm7):');
        if (!chordSymbol) return;
        
        const chord = this.parseChord(chordSymbol);
        if (!chord) {
            alert('Invalid chord symbol');
            return;
        }
        
        // Add chord to bar
        if (!this.progression[barIdx].chords) {
            this.progression[barIdx].chords = [];
        }
        this.progression[barIdx].chords.push(chord);
        
        this.buildGrid();
    }

    // ... (rest of the methods: play, stop, animatePlayhead, exportMidi, etc. - same as before)
    
    async togglePlay() {
        if (this.isPlaying) {
            this.stop();
        } else {
            await this.play();
        }
    }

    async play() {
        await Tone.start();
        this.isPlaying = true;
        this.currentBar = Math.max(0, this.loopStart - 1); // Start from loop start
        Tone.Transport.bpm.value = this.bpm;
        
        const barDuration = (60 / this.bpm) * 4;
        const barWidth = 120;
        const totalDuration = this.progression.length * barDuration;
        
        const gridContainer = document.getElementById('gridContainer');
        const gridRect = gridContainer.getBoundingClientRect();
        const startPos = gridRect.left + 80;
        
        this.playheadElement.style.display = 'block';
        
        this.playStartTime = performance.now();
        this.animatePlayhead(startPos, barWidth, totalDuration);
        
        const playBar = () => {
            if (!this.isPlaying) return;
            
            if (this.currentBar >= this.progression.length) {
                this.stop();
                return;
            }
            
            const bar = this.progression[this.currentBar];
            const chordDuration = barDuration / bar.chords.length;
            
            // Highlight current bar and its notes
            this.highlightBar(this.currentBar);
            this.highlightCurrentBarNotes(this.currentBar);
            
            bar.chords.forEach((chord, idx) => {
                setTimeout(() => {
                    if (chord && chord.midiNotes) {
                        if (this.arpEnabled) {
                            this.playArpeggio(chord.midiNotes, chordDuration);
                        } else {
                            const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
                            // Play for FULL duration - notes sustain until next chord/bar
                            this.synth.triggerAttackRelease(freqs, chordDuration);
                        }
                    }
                }, idx * chordDuration * 1000);
            });
            
            this.currentBar++;
            
            // Check if we should loop
            const loopEndBar = Math.min(this.loopEnd, this.progression.length);
            
            if (this.currentBar >= loopEndBar) {
                if (this.loopEnabled) {
                    this.currentBar = Math.max(0, this.loopStart - 1); // Loop back to loop start
                    setTimeout(playBar, barDuration * 1000);
                } else {
                    this.stop(); // Stop at loop end
                }
            } else {
                setTimeout(playBar, barDuration * 1000);
            }
        };
        
        playBar();
    }

    toggleLoop() {
        this.loopEnabled = !this.loopEnabled;
        const btn = document.getElementById('loopBtn');
        if (btn) {
            btn.classList.toggle('active', this.loopEnabled);
        }
    }

    playArpeggio(midiNotes, duration) {
        // Expand notes with octaves
        let arpNotes = [...midiNotes];
        for (let oct = 1; oct < this.arpOctaves; oct++) {
            arpNotes = arpNotes.concat(midiNotes.map(n => n + (12 * oct)));
        }
        
        // Sort and apply pattern
        arpNotes.sort((a, b) => a - b);
        
        let sequence = [];
        switch (this.arpPattern) {
            case 'up':
                sequence = arpNotes;
                break;
            case 'down':
                sequence = [...arpNotes].reverse();
                break;
            case 'updown':
                sequence = [...arpNotes, ...[...arpNotes].reverse().slice(1, -1)];
                break;
            case 'random':
                sequence = arpNotes.sort(() => Math.random() - 0.5);
                break;
        }
        
        // Calculate note duration based on speed
        const speedMap = { '1/16': 16, '1/8': 8, '1/4': 4 };
        const notesPerBeat = speedMap[this.arpSpeed];
        const noteDuration = (60 / this.bpm) / (notesPerBeat / 4); // in seconds
        
        // Trigger mode affects note length
        let noteLength;
        if (this.arpTrigger === 'retrigger') {
            noteLength = noteDuration * 0.8;
        } else {
            noteLength = noteDuration * 0.99;
        }
        
        // Mode: Per Chord vs Run (continuous)
        if (this.arpMode === 'chord') {
            // Per Chord: restart sequence for each chord
            this.arpSequenceIndex = 0;
            sequence.forEach((note, i) => {
                setTimeout(() => {
                    const freq = Tone.Frequency(note, 'midi').toFrequency();
                    this.synth.triggerAttackRelease(freq, noteLength);
                    // Trigger visualizer for this note
                    if (this.arpVisualizer) {
                        this.showArpHit(note);
                    }
                }, i * noteDuration * 1000);
            });
        } else {
            // Run: continue sequence across chords
            const numNotesToPlay = Math.floor(duration / noteDuration);
            for (let i = 0; i < numNotesToPlay; i++) {
                const note = sequence[this.arpSequenceIndex % sequence.length];
                setTimeout(() => {
                    const freq = Tone.Frequency(note, 'midi').toFrequency();
                    this.synth.triggerAttackRelease(freq, noteLength);
                    // Trigger visualizer for this note
                    if (this.arpVisualizer) {
                        this.showArpHit(note);
                    }
                }, i * noteDuration * 1000);
                this.arpSequenceIndex++;
            }
        }
    }

    animatePlayhead(startPos, barWidth, totalDuration) {
        const animate = (currentTime) => {
            if (!this.isPlaying) return;
            
            const elapsed = (currentTime - this.playStartTime) / 1000;
            const loopDuration = ((this.loopEnd - this.loopStart + 1) / this.progression.length) * totalDuration;
            let progress = elapsed / loopDuration;
            
            // Loop the playhead if loop is enabled
            if (this.loopEnabled && progress >= 1) {
                this.playStartTime = currentTime; // Reset start time
                progress = 0;
            } else {
                progress = Math.min(progress, 1);
            }
            
            const gridContainer = document.getElementById('gridContainer');
            const gridRect = gridContainer.getBoundingClientRect();
            const currentStartPos = gridRect.left + 80;
            
            // Calculate position within loop range
            const loopStartPos = currentStartPos + ((this.loopStart - 1) * barWidth);
            const loopWidth = (this.loopEnd - this.loopStart + 1) * barWidth;
            const position = loopStartPos + (progress * loopWidth);
            
            this.playheadElement.style.left = position + 'px';
            
            if (progress < 1 || this.loopEnabled) {
                this.playheadAnimationId = requestAnimationFrame(animate);
            }
        };
        
        this.playheadAnimationId = requestAnimationFrame(animate);
    }

    showArpHit(midiNote) {
        // === DEBUG ANALYSIS ===
        const playheadRect = this.playheadElement.getBoundingClientRect();
        const playheadLeft = playheadRect.left;
        const playheadRight = playheadRect.right;
        const playheadWidth = playheadRect.width;
        const playheadCenterX = playheadLeft + (playheadWidth / 2);
        
        // Get Y position
        const gridContainer = document.getElementById('gridContainer');
        if (!gridContainer) return;
        
        let yPos;
        const pianoCell = document.querySelector(`.piano-cell[data-midi="${midiNote}"]`);
        
        if (pianoCell) {
            const cellRect = pianoCell.getBoundingClientRect();
            yPos = cellRect.top + (cellRect.height / 2);
        } else {
            const gridRect = gridContainer.getBoundingClientRect();
            yPos = gridRect.bottom - ((midiNote - 36) * 20) - 100;
        }
        
        // Create marker - SMALLER and ON TOP of playhead
        const size = 20; // Smaller = easier to see center
        const markerLeft = playheadCenterX - (size / 2);
        const markerRight = markerLeft + size;
        const markerCenterX = markerLeft + (size / 2);
        
        // === ANALYSIS ===
        const diff = markerCenterX - playheadCenterX;
        console.group('🔍 ARP HIT DEBUG - ' + this.midiToNote(midiNote));
        console.log('Playhead:');
        console.log('  left:', playheadLeft.toFixed(2));
        console.log('  right:', playheadRight.toFixed(2));
        console.log('  width:', playheadWidth.toFixed(2));
        console.log('  center:', playheadCenterX.toFixed(2));
        console.log('Marker:');
        console.log('  left:', markerLeft.toFixed(2));
        console.log('  right:', markerRight.toFixed(2));
        console.log('  size:', size);
        console.log('  center:', markerCenterX.toFixed(2));
        console.log('DIFFERENCE:', diff.toFixed(2), 'px');
        if (Math.abs(diff) < 0.1) {
            console.log('✅ PERFECT ALIGNMENT!');
        } else if (diff > 0) {
            console.log('❌ Marker is', diff.toFixed(2), 'px to the RIGHT');
        } else {
            console.log('❌ Marker is', Math.abs(diff).toFixed(2), 'px to the LEFT');
        }
        console.groupEnd();
        
        // Create marker - NO MARGINS, NO PADDING, NO OFFSETS
        const marker = document.createElement('div');
        marker.className = 'arp-hit-marker';
        marker.style.position = 'fixed';
        marker.style.top = (yPos - size/2) + 'px';
        marker.style.left = markerLeft + 'px';
        marker.style.width = size + 'px';
        marker.style.height = size + 'px';
        marker.style.margin = '0';
        marker.style.padding = '0';
        marker.style.border = 'none';
        marker.style.background = 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,215,0,1) 30%, rgba(255,69,0,1) 70%, transparent 100%)';
        marker.style.zIndex = '10000';
        marker.style.boxShadow = '0 0 30px rgba(255,215,0,1), 0 0 60px rgba(255,165,0,0.8)';
        marker.style.borderRadius = '50%';
        marker.style.animation = 'arpBurst 0.3s ease-out';
        marker.style.pointerEvents = 'none';
        marker.style.boxSizing = 'border-box';
        
        document.body.appendChild(marker);
        
        // Auto-remove after animation
        const removeTimer = setTimeout(() => {
            if (marker.parentNode) {
                marker.remove();
            }
        }, 300);
        
        // Store timer for cleanup
        marker.dataset.removeTimer = removeTimer;
    }

    stop() {
        this.isPlaying = false;
        this.currentBar = 0;
        this.synth.releaseAll();
        this.clearHighlights();
        
        if (this.playheadAnimationId) {
            cancelAnimationFrame(this.playheadAnimationId);
            this.playheadAnimationId = null;
        }
        
        // Remove all arp hit markers immediately
        document.querySelectorAll('.arp-hit-marker').forEach(marker => {
            // Clear any pending remove timers
            if (marker.dataset.removeTimer) {
                clearTimeout(parseInt(marker.dataset.removeTimer));
            }
            marker.remove();
        });
        
        this.playheadElement.style.display = 'none';
    }

    highlightBar(barIdx) {
        document.querySelectorAll('.chord-cell').forEach((cell, idx) => {
            cell.classList.toggle('playing', idx === barIdx);
        });
    }

    highlightCurrentBarNotes(barIndex) {
        // Remove previous highlights (but not arp highlights)
        document.querySelectorAll('.note-block.playing:not(.arp-playing)').forEach(note => {
            note.classList.remove('playing');
        });
        
        // Highlight all notes in current bar
        if (barIndex >= 0 && barIndex < this.progression.length) {
            document.querySelectorAll(`.note-block[data-bar-index="${barIndex}"]`).forEach(note => {
                note.classList.add('playing');
            });
        }
    }

    highlightArpNote(midiNote) {
        if (!this.arpVisualizer) return;
        
        // Find the note block at the playhead position that matches this MIDI note
        const gridContainer = document.getElementById('gridContainer');
        if (!gridContainer) return;
        
        const playheadPos = parseFloat(this.playheadElement.style.left);
        
        // Find all note blocks with this MIDI note
        document.querySelectorAll(`.note-block[data-midi="${midiNote}"]`).forEach(noteBlock => {
            const noteRect = noteBlock.getBoundingClientRect();
            const gridRect = gridContainer.getBoundingClientRect();
            
            const noteLeft = noteRect.left - gridRect.left;
            const noteRight = noteRect.right - gridRect.left;
            
            // Check if playhead is over this note
            if (playheadPos >= noteLeft && playheadPos <= noteRight) {
                // Create explosion effect at playhead position
                noteBlock.classList.add('arp-hit');
                
                setTimeout(() => {
                    noteBlock.classList.remove('arp-hit');
                }, 200);
            }
        });
    }

    clearHighlights() {
        document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
    }

    previewBar(barIdx) {
        const bar = this.progression[barIdx];
        bar.chords.forEach(chord => {
            if (chord && chord.midiNotes) {
                const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
                this.synth.triggerAttackRelease(freqs, '4n');
            }
        });
    }

    exportMidi() {
        // Simple MIDI file builder (no external library needed)
        const createMidiFile = () => {
            const header = [0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xE0];
            const trackHeader = [0x4D, 0x54, 0x72, 0x6B];
            
            const events = [];
            let time = 0;
            const ticksPerBeat = 480;
            const beatsPerBar = 4;
            
            // Add tempo event
            const tempo = Math.round(60000000 / this.bpm);
            events.push(0x00, 0xFF, 0x51, 0x03, (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF);
            
            // Add each bar's chords
            this.progression.forEach((bar) => {
                bar.chords.forEach((chord) => {
                    if (chord && chord.midiNotes && chord.midiNotes.length > 0) {
                        const chordsInBar = bar.chords.length;
                        const duration = Math.round((beatsPerBar / chordsInBar) * ticksPerBeat);
                        
                        // Note ON for all notes in chord
                        chord.midiNotes.forEach(midiNote => {
                            events.push(0x00, 0x90, midiNote, 0x50); // Note ON
                        });
                        
                        // Note OFF after duration
                        const deltaTime = this.encodeVariableLength(duration);
                        chord.midiNotes.forEach((midiNote, idx) => {
                            if (idx === 0) {
                                events.push(...deltaTime, 0x80, midiNote, 0x00);
                            } else {
                                events.push(0x00, 0x80, midiNote, 0x00);
                            }
                        });
                    }
                });
            });
            
            // End of track
            events.push(0x00, 0xFF, 0x2F, 0x00);
            
            // Track length
            const trackLength = events.length;
            const trackLengthBytes = [
                (trackLength >> 24) & 0xFF,
                (trackLength >> 16) & 0xFF,
                (trackLength >> 8) & 0xFF,
                trackLength & 0xFF
            ];
            
            return new Uint8Array([...header, ...trackHeader, ...trackLengthBytes, ...events]);
        };
        
        try {
            const midiData = createMidiFile();
            const blob = new Blob([midiData], { type: 'audio/midi' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chord-progression.mid';
            a.click();
            URL.revokeObjectURL(url);
            console.log('✅ MIDI exported!');
        } catch (error) {
            console.error('MIDI Export Error:', error);
            alert('Error: ' + error.message);
        }
    }
    
    encodeVariableLength(value) {
        const bytes = [];
        bytes.unshift(value & 0x7F);
        value >>= 7;
        while (value > 0) {
            bytes.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        return bytes;
    }

    addBar() {
        this.progression.push({
            barNum: this.progression.length + 1,
            chords: []
        });
        this.buildGrid();
        this.analyzeProgression();
    }

    deleteBar(index) {
        if (this.progression.length <= 1) {
            alert('Cannot delete the last bar!');
            return;
        }
        if (!confirm(`Delete bar ${index + 1}?`)) return;
        
        this.progression.splice(index, 1);
        // Renumber bars
        this.progression.forEach((bar, i) => {
            bar.barNum = i + 1;
        });
        this.buildGrid();
        this.analyzeProgression();
    }

    transpose(semitones) {
        this.saveState();
        if (this.selectedNotes.size > 0) {
            // Transpose selected notes
            this.selectedNotes.forEach(noteKey => {
                const [midi, barIdx, chordIdx] = noteKey.split('-').map(Number);
                const bar = this.progression[barIdx];
                const chord = bar.chords[chordIdx];
                
                if (chord) {
                    const noteIndex = chord.midiNotes.indexOf(midi);
                    if (noteIndex !== -1) {
                        const newMidi = Math.max(0, Math.min(127, midi + semitones));
                        chord.midiNotes[noteIndex] = newMidi;
                        chord.noteNames[noteIndex] = this.midiToNote(newMidi);
                    }
                    // Update chord symbol
                    chord.symbol = this.recognizeChord(chord.midiNotes);
                }
            });
            this.selectedNotes.clear();
        } else {
            // Transpose all notes
            this.progression.forEach(bar => {
                bar.chords.forEach(chord => {
                    if (chord && chord.midiNotes) {
                        chord.midiNotes = chord.midiNotes.map(note => 
                            Math.max(0, Math.min(127, note + semitones))
                        );
                        chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                        chord.symbol = this.recognizeChord(chord.midiNotes);
                    }
                });
            });
        }
        
        this.buildGrid();
    }

    // Suggestions Panel
    showSuggestionsPanel(barIndex) {
        this.currentSuggestionBar = barIndex;
        const panel = document.getElementById('suggestionsPanel');
        panel.style.display = 'block';
        
        // Generate suggestions based on context
        this.generateSuggestions(barIndex);
    }

    closeSuggestionsPanel() {
        document.getElementById('suggestionsPanel').style.display = 'none';
        this.currentSuggestionBar = null;
        this.selectedBassNote = null;
    }

    generateSuggestions(barIndex) {
        // Get previous chord for context
        let previousChord = null;
        for (let i = barIndex - 1; i >= 0; i--) {
            if (this.progression[i].chords.length > 0) {
                previousChord = this.progression[i].chords[0];
                break;
            }
        }
        
        // Generate chord suggestions based on key (C major for now)
        const suggestions = this.getChordSuggestions(previousChord);
        
        // Populate suggestions
        const container = document.getElementById('chordSuggestions');
        container.innerHTML = '';
        
        suggestions.forEach(chord => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = chord.symbol;
            btn.onclick = () => this.applySuggestion(chord);
            container.appendChild(btn);
        });
        
        // Populate bass notes
        this.populateBassNotes();
        
        // Populate chord types
        this.populateChordTypes();
    }

    getChordSuggestions(previousChord) {
        // Simple music theory: suggest common progressions in C major
        // This is a basic implementation - can be made much smarter
        const suggestions = [
            { symbol: 'C', root: 'C', quality: '' },
            { symbol: 'Am', root: 'A', quality: 'm' },
            { symbol: 'F', root: 'F', quality: '' },
            { symbol: 'G', root: 'G', quality: '' },
            { symbol: 'Dm', root: 'D', quality: 'm' },
            { symbol: 'Em', root: 'E', quality: 'm' }
        ];
        
        return suggestions;
    }

    populateBassNotes() {
        const container = document.getElementById('bassNotes');
        container.innerHTML = '';
        
        const notes = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        notes.forEach(note => {
            const btn = document.createElement('button');
            btn.className = 'note-btn';
            btn.textContent = note;
            btn.onclick = () => this.selectBassNote(note);
            container.appendChild(btn);
        });
    }

    populateChordTypes() {
        const container = document.getElementById('chordTypes');
        container.innerHTML = '';
        
        const types = [
            { label: 'Major', quality: '' },
            { label: 'Minor', quality: 'm' },
            { label: 'Dom7', quality: '7' },
            { label: 'Maj7', quality: 'maj7' },
            { label: 'Min7', quality: 'm7' },
            { label: 'Sus4', quality: 'sus4' }
        ];
        
        types.forEach(type => {
            const btn = document.createElement('button');
            btn.className = 'type-btn';
            btn.textContent = type.label;
            btn.dataset.quality = type.quality;
            btn.onclick = () => {
                // Highlight selected
                document.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                // Build chord
                this.buildChord(type.quality);
            };
            container.appendChild(btn);
        });
    }

    selectBassNote(note) {
        this.selectedBassNote = note;
        
        // Highlight selected
        document.querySelectorAll('.note-btn').forEach(btn => {
            btn.classList.toggle('active', btn.textContent === note);
        });
        
        // Preview the note
        if (this.notePreviewEnabled) {
            const midiNote = 48 + this.noteToNumber(note); // Bass octave
            this.playNote(midiNote);
        }
    }

    previewBuildingChord() {
        if (!this.selectedBassNote) {
            alert('Please select a bass note first!');
            return;
        }
        
        // Get selected chord type
        const selectedType = document.querySelector('.type-btn.active');
        const quality = selectedType ? selectedType.dataset.quality || '' : '';
        
        const symbol = this.selectedBassNote + quality;
        const chord = this.parseChord(symbol);
        
        if (chord && chord.midiNotes) {
            const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
            this.synth.triggerAttackRelease(freqs, '2n');
        }
    }

    buildChord(quality) {
        if (!this.selectedBassNote) {
            alert('Please select a bass note first!');
            return;
        }
        
        const symbol = this.selectedBassNote + quality;
        const chord = this.parseChord(symbol);
        
        if (chord && this.currentSuggestionBar !== null) {
            this.applySuggestion(chord);
        }
    }

    applySuggestion(chord) {
        if (this.currentSuggestionBar === null) return;
        
        // Apply chord to the bar
        this.progression[this.currentSuggestionBar].chords = [chord];
        
        // Rebuild grid
        this.buildGrid();
        
        // Close panel
        this.closeSuggestionsPanel();
        
        // Preview the chord
        this.previewBar(this.currentSuggestionBar);
    }

    // Music Theory Analysis
    analyzeProgression() {
        const analysis = document.getElementById('progressionAnalysis');
        if (!analysis) return;
        
        // Detect key
        const detectedKey = this.detectKey();
        
        // Get all chords
        const allChords = [];
        this.progression.forEach(bar => {
            bar.chords.forEach(chord => {
                if (chord && chord.symbol) allChords.push(chord);
            });
        });
        
        if (allChords.length === 0) {
            analysis.innerHTML = 'No chords to analyze';
            return;
        }
        
        // Build analysis
        let html = `<div class="analysis-highlight">Detected Key: ${detectedKey.key} ${detectedKey.scale}</div><br>`;
        html += `<strong>Progression:</strong> ${allChords.map(c => c.symbol).join(' → ')}<br><br>`;
        
        // Roman numeral analysis
        html += `<strong>Roman Numerals:</strong><br>`;
        allChords.forEach((chord, i) => {
            const roman = this.getRomanNumeral(chord, detectedKey);
            html += `${chord.symbol} = <span class="analysis-highlight">${roman}</span>`;
            if (i < allChords.length - 1) html += ' → ';
        });
        
        analysis.innerHTML = html;
    }

    detectKey() {
        // Simple key detection based on chord roots
        const roots = [];
        this.progression.forEach(bar => {
            bar.chords.forEach(chord => {
                if (chord && chord.root) {
                    roots.push(this.noteMap(chord.root));
                }
            });
        });
        
        if (roots.length === 0) return { key: 'C', scale: 'Major' };
        
        // Count occurrences
        const counts = {};
        roots.forEach(r => counts[r] = (counts[r] || 0) + 1);
        
        // Most common root is likely the tonic
        const tonic = parseInt(Object.keys(counts).reduce((a, b) => counts[a] > counts[b] ? a : b));
        const keyName = this.noteNames[tonic];
        
        // Determine major or minor based on chord qualities
        let majorCount = 0;
        let minorCount = 0;
        this.progression.forEach(bar => {
            bar.chords.forEach(chord => {
                if (chord && chord.quality) {
                    if (chord.quality.includes('m')) minorCount++;
                    else majorCount++;
                }
            });
        });
        
        const scale = minorCount > majorCount ? 'Minor' : 'Major';
        return { key: keyName, scale, tonic };
    }

    getRomanNumeral(chord, detectedKey) {
        if (!chord || !chord.root) return '?';
        
        const chordRoot = this.noteMap(chord.root);
        const tonic = detectedKey.tonic;
        const interval = (chordRoot - tonic + 12) % 12;
        
        const majorNumerals = ['I', 'bII', 'II', 'bIII', 'III', 'IV', '#IV', 'V', 'bVI', 'VI', 'bVII', 'VII'];
        let numeral = majorNumerals[interval];
        
        // Adjust for chord quality
        if (chord.quality && chord.quality.includes('m')) {
            numeral = numeral.toLowerCase();
        }
        if (chord.quality && chord.quality.includes('dim')) {
            numeral = numeral.toLowerCase() + '°';
        }
        if (chord.quality && chord.quality.includes('7')) {
            numeral += '7';
        }
        
        return numeral;
    }

    analyzeSelection() {
        const analysis = document.getElementById('selectionAnalysis');
        if (!analysis) return;
        
        if (this.selectedNotes.size === 0) {
            analysis.innerHTML = 'Click a chord or select notes to analyze';
            return;
        }
        
        // Get selected notes
        const notes = Array.from(this.selectedNotes).map(key => {
            const [midi] = key.split('-').map(Number);
            return midi;
        }).sort((a, b) => a - b);
        
        let html = `<strong>Selected Notes:</strong> ${notes.map(n => this.midiToNote(n)).join(', ')}<br><br>`;
        
        if (notes.length === 2) {
            // Dyad/Interval analysis - crucial for bass lines, power chords, leads
            const interval = notes[1] - notes[0];
            const intervalName = this.getIntervalName(interval);
            html += `<strong>Interval:</strong> <span class="analysis-highlight">${intervalName}</span> (${interval} semitones)<br><br>`;
            
            // Harmonic analysis
            const harmonicQuality = this.getHarmonicQuality(interval);
            html += `<strong>Harmonic Quality:</strong> ${harmonicQuality}<br><br>`;
            
            // Use cases
            html += `<strong>Common Uses:</strong><br>`;
            const useCases = this.getIntervalUseCases(interval);
            html += useCases.map(use => `• ${use}`).join('<br>');
        } else if (notes.length >= 3) {
            // Chord analysis
            const chordName = this.recognizeChord(notes);
            html += `<strong>Chord:</strong> <span class="analysis-highlight">${chordName}</span><br>`;
            
            // Intervals from root
            html += `<strong>Intervals from root:</strong><br>`;
            notes.forEach((note, i) => {
                if (i > 0) {
                    const interval = note - notes[0];
                    html += `${this.getIntervalName(interval)} `;
                }
            });
        }
        
        analysis.innerHTML = html;
    }

    getIntervalName(semitones) {
        const intervals = {
            0: 'Unison', 1: 'Minor 2nd', 2: 'Major 2nd', 3: 'Minor 3rd',
            4: 'Major 3rd', 5: 'Perfect 4th', 6: 'Tritone', 7: 'Perfect 5th',
            8: 'Minor 6th', 9: 'Major 6th', 10: 'Minor 7th', 11: 'Major 7th',
            12: 'Octave'
        };
        return intervals[semitones % 12] || `${semitones} semitones`;
    }

    getHarmonicQuality(semitones) {
        const mod = semitones % 12;
        const qualities = {
            0: '<span class="analysis-success">Perfect Consonance</span>',
            1: '<span class="analysis-warning">Dissonant (Cluster)</span>',
            2: '<span class="analysis-highlight">Tension & Release</span>',
            3: '<span class="analysis-highlight">Minor/Sad</span>',
            4: '<span class="analysis-success">Major/Happy</span>',
            5: '<span class="analysis-success">Consonant (Suspended)</span>',
            6: '<span class="analysis-warning">Maximum Tension (Tritone)</span>',
            7: '<span class="analysis-success">Perfect Consonance (Power Chord!)</span>',
            8: '<span class="analysis-highlight">Minor 6th (Melancholic)</span>',
            9: '<span class="analysis-success">Major 6th (Bright)</span>',
            10: '<span class="analysis-highlight">Dominant (Bluesy)</span>',
            11: '<span class="analysis-success">Major 7th (Jazzy/Dreamy)</span>',
            12: '<span class="analysis-success">Octave (Reinforcement)</span>'
        };
        return qualities[mod] || 'Complex';
    }

    getIntervalUseCases(semitones) {
        const mod = semitones % 12;
        const uses = {
            0: ['Unison doubling', 'Reinforcement'],
            1: ['Cluster chords', 'Avant-garde'],
            2: ['Sus2 chords', 'Melodic movement'],
            3: ['Minor chords', 'Sad melodies'],
            4: ['Major chords', 'Happy melodies'],
            5: ['Sus4 chords', 'Power chords (with 5th)', 'Tension'],
            6: ['Tritone substitution', 'Jazz', 'Metal riffs'],
            7: ['Power chords (Rock/Metal!)', 'Bass lines', 'Strong foundation'],
            8: ['Minor 6th chords', 'Dorian mode'],
            9: ['Major 6th chords', 'Country', 'Folk'],
            10: ['Dominant 7th', 'Blues', 'Funk bass lines'],
            11: ['Major 7th chords', 'Jazz', 'Neo-soul'],
            12: ['Octave bass lines', 'Synth leads', 'Reinforcement']
        };
        return uses[mod] || ['Experimental'];
    }

    analyzeChord(chord) {
        const analysis = document.getElementById('selectionAnalysis');
        if (!analysis || !chord) return;
        
        let html = `<strong>Chord:</strong> <span class="analysis-highlight">${chord.symbol}</span><br><br>`;
        html += `<strong>Notes:</strong> ${chord.noteNames.join(', ')}<br><br>`;
        
        if (chord.midiNotes && chord.midiNotes.length >= 2) {
            html += `<strong>Intervals from root:</strong><br>`;
            chord.midiNotes.forEach((note, i) => {
                if (i > 0) {
                    const interval = note - chord.midiNotes[0];
                    html += `${this.getIntervalName(interval)}<br>`;
                }
            });
        }
        
        // Detect key and show roman numeral
        const detectedKey = this.detectKey();
        const roman = this.getRomanNumeral(chord, detectedKey);
        html += `<br><strong>Function in ${detectedKey.key} ${detectedKey.scale}:</strong> <span class="analysis-highlight">${roman}</span>`;
        
        analysis.innerHTML = html;
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new ChordProgressionApp();
});

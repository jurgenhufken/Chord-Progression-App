// Chord Progression Studio - Version 3.0 - Full MIDI Editor
class ChordProgressionApp {
    constructor() {
        this.selectedBar = null;
        this.clipboard = [];
        this.isModified = false;
        this.synth = null;
        this.isPlaying = false;
        this.currentBar = 0;
        this.bpm = 120;
        this.loopEnabled = true; // Default ON
        this.loopSliderTotalWidth = 0;
        this.loopSliderScrollLinked = false;
        this.syncingSliderScroll = false;
        this.syncingGridScroll = false;
        
        // Modulation system
        this.modulation = {
            lfo1: { rate: 0.25, depth: 0.5, waveform: 'sine', phase: 0 },
            lfo2: { rate: 0.125, depth: 0.75, waveform: 'triangle', phase: 0 },
            routing: {}, // { ParamName: 'lfo1' or 'lfo2' }
            learningMode: false,
            learningLFO: null, // 'lfo1' or 'lfo2'
            startTime: 0 // Track when playback started
        };
        
        // Start LFO meter animation
        this.startLFOMeterAnimation();
        
        // Drum sequencer
        this.drumPatterns = {}; // { barIndex: { kick: { steps: [0,0,1,...], velocity: [...], duration: [...], gate: [...], ratchet: [...] } } }
        this.drumSounds = null;
        this.drumRouting = {}; // { drumKey: { delay: 0.5, reverb: 0.3, distortion: 0 } }
        this.currentDrumStep = 0;
        this.drumClipboard = null;
        this.selectedDrumTrack = null; // For showing parameters
        this.drumZoom = 2; // Default 2x zoom
        this.drumFollowPlayhead = false; // Default OFF
        this.followPlayhead = false; // Follow mode OFF by default
        this.linkScroll = true; // Link piano roll and drum sequencer scroll
        
        // Pattern system
        this.patterns = {}; // { 'A1': { progression: [...], drumPatterns: {...}, notes: {...}, channel2Notes: {...} } }
        this.currentPattern = 'A1';
        
        // Channel 2 state
        this.channel2Notes = {}; // { barIndex: [{ midi: 60, start: 0, duration: 0.5 }, ...] }
        this.channel2Synth = null;
        this.progressionAnalysis = null; // Cached chord analysis
        this.channel2Source = 'chords'; // 'chords' or 'midi'
        this.channel2Style = 'arpeggio';
        this.channel2Pattern = 'up';
        this.channel2Density = 'medium';
        this.channel2OctaveRange = 1;
        this.channel2Presets = []; // Loaded from data/channel2Presets.json
        this.channel2CurrentPreset = null; // Active preset object
        this.songMode = false; // false = pattern mode, true = song mode
        this.chainPatterns = true; // Chain all filled patterns in sequence (default ON)
        this.loopChain = true; // Loop back to first pattern after last (default ON)
        this.autoRandomBeats = false; // Auto-generate random beats per pattern
        this.mutePiano = false; // Mute piano/synth output
        this.muteChannel2 = false; // Mute Channel 2 output
        this.muteDrums = false; // Mute drum output
        this.songArrangement = []; // ['A1', 'A2', 'B1', 'A1', ...]
        this.currentSongStep = 0;
        this.arpEnabled = false;
        this.arpPattern = 'up';
        this.arpSpeed = '1/8';
        this.arpOctaves = 1;
        this.arpTrigger = 'retrigger';
        this.arpMode = 'run';  // Default to Run (Continuous)
        this.arpSequenceIndex = 0;
        
        // Channel 2 Arpeggiator
        this.channel2ArpEnabled = false;
        this.channel2ArpReplace = true; // true = replace pattern, false = layer with pattern
        this.channel2ArpPattern = 'up';
        this.channel2ArpSpeed = '1/8';
        this.channel2ArpOctaves = 1;
        this.channel2ArpTrigger = 'retrigger';
        this.channel2ArpMode = 'run';
        this.channel2ArpSequenceIndex = 0;
        this.currentArpNote = null;  // Track current arp note for highlighting
        this.arpVisualizer = true;  // Visualizer on by default
        this.lastHitNote = null;  // Track last hit to prevent duplicates
        this.playheadElement = null;
        this.playheadAnimationId = null;
        this.playStartTime = 0;
        this.playStartBar = 0;
        
        // View settings
        this.showPianoRoll = true;
        this.showChannel2 = false; // Channel 2 OFF by default
        this.channel2Mode = 'separate'; // 'overlay' or 'separate' - separate by default
        this.pianoRange = 'auto'; // 'auto' or 'full'
        
        // === POC MODULES (NEW!) ===
        this.channel2PlaybackMode = 'direct'; // 'direct' | 'follow' | 'style'
        if (window.ImprovedChordDetector) {
            this.chordDetectorV2 = new window.ImprovedChordDetector();
            console.log('✅ POC: ImprovedChordDetector initialized');
        }
        if (window.Channel2FollowMode) {
            this.followMode = new window.Channel2FollowMode(this);
            console.log('✅ POC: Channel2FollowMode initialized');
        }
        if (window.ModeSwitcher) {
            this.modeSwitcher = new window.ModeSwitcher(this);
            console.log('✅ POC: ModeSwitcher initialized');
        }
        
        // Suggestions
        this.currentSuggestionBar = null;
        this.selectedBassNote = null;
        this.notePreviewEnabled = true;
        this.loopStart = 1;
        this.loopEnd = 4;
        this.maxLoopBars = 8;
        
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
        
        // Selected bar for playback start
        this.selectedBar = null;
        
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        this.init();
    }

    init() {
        this.setupSynth();
        this.setupEventListeners();
        this.buildPatternMatrix();
        
        // Update UI to reflect default Channel 2 state
        const ch2Btn = document.getElementById('toggleChannel2');
        const ch2ModeBtn = document.getElementById('toggleChannel2Mode');
        if (ch2Btn) {
            ch2Btn.textContent = '🎶 Channel 2';
            ch2Btn.classList.remove('active');
        }
        if (ch2ModeBtn) {
            ch2ModeBtn.style.display = 'none';
            ch2ModeBtn.textContent = '📊 Separate';
            ch2ModeBtn.classList.remove('active');
        }

        this.updateChannel2SyncStatus();
        
        // Set loop button active by default
        const loopBtn = document.getElementById('loopBtn');
        if (loopBtn) loopBtn.classList.add('active');
        
        // Load default progression from MIDI files (async)
        // initLoopSlider will be called after progression is loaded
        this.loadDefaultProgression();
    }
    
    loadDefaultProgression() {
        // Load exact MIDI notes from combined_progression.json
        // These are the EXACT notes from the MIDI files - no interpretation!
        fetch('combined_progression.json')
            .then(response => response.json())
            .then(data => {
                this.progression = data.progression;
                this.originalProgression = JSON.parse(JSON.stringify(this.progression));
                
                // Set loop range
                this.loopStart = 1;
                this.loopEnd = 8; // First pattern (A1)
                
                // Update UI
                const loopStartInput = document.getElementById('loopStart');
                const loopEndInput = document.getElementById('loopEnd');
                if (loopStartInput) loopStartInput.value = this.loopStart;
                if (loopEndInput) loopEndInput.value = this.loopEnd;
                
                // Split into patterns
                this.parseProgressionIntoPatterns();
                
                this.buildGrid();
                this.buildDrumGrid();
                this.updateDrumZoom();
                this.analyzeProgression();
                
                // Generate Channel 2 pattern if enabled
                if (this.showChannel2) {
                    this.generateChannel2Pattern();
                    // Rebuild grid to show Channel 2 notes
                    this.buildGrid();
                } else {
                    this.updateChannel2SyncStatus();
                }
                
                // Initialize loop slider AFTER progression is loaded
                this.initLoopSlider();
                
                // Force update loop slider after a short delay
                setTimeout(() => {
                    if (this.updateLoopSlider) {
                        this.updateLoopSlider();
                    }
                }, 100);
                
                console.log('✓ Loaded', this.progression.length, 'bars with exact MIDI notes from file');
                console.log('Loop range:', this.loopStart, '-', this.loopEnd);
                
                // Load Channel 2 presets
                this.loadChannel2Presets();
            })
            .catch(error => {
                console.error('Could not load combined_progression.json:', error);
                // Fallback to parseChords if file not found
                this.parseChords();
                
                // Still load presets
                this.loadChannel2Presets();
            });
    }
    
    loadChannel2Presets() {
        fetch('data/channel2Presets-v2.json')
            .then(res => res.json())
            .then(data => {
                this.channel2Presets = data.presets || [];
                console.log(`✅ Loaded ${this.channel2Presets.length} Channel 2 presets`);
                
                // Populate UI dropdowns
                this.populateChannel2PresetUI();
            })
            .catch(error => {
                console.warn('Could not load Channel 2 presets:', error);
                this.channel2Presets = [];
            });
    }
    
    populateChannel2PresetUI() {
        const presetSelect = document.getElementById('channel2Preset');
        const categorySelect = document.getElementById('channel2Category');
        
        if (!presetSelect || !categorySelect) return;
        
        // Extract unique categories
        const categories = [...new Set(this.channel2Presets.map(p => p.category))];
        
        // Populate category dropdown
        categorySelect.innerHTML = '<option value="all" selected>All Categories</option>';
        categories.forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            categorySelect.appendChild(opt);
        });
        
        // Populate preset dropdown (initially all)
        this.updatePresetDropdown('all');
        
        // Event listeners
        categorySelect.addEventListener('change', (e) => {
            this.updatePresetDropdown(e.target.value);
        });
        
        presetSelect.addEventListener('change', (e) => {
            this.applyChannel2Preset(e.target.value);
        });
    }
    
    updatePresetDropdown(category) {
        const presetSelect = document.getElementById('channel2Preset');
        if (!presetSelect) return;
        
        const filtered = category === 'all' 
            ? this.channel2Presets 
            : this.channel2Presets.filter(p => p.category === category);
        
        presetSelect.innerHTML = '<option value="" selected>-- Manual Mode --</option>';
        
        filtered.forEach(preset => {
            const opt = document.createElement('option');
            opt.value = preset.id;
            opt.textContent = preset.humanName;
            presetSelect.appendChild(opt);
        });
    }
    
    applyChannel2Preset(presetId) {
        if (!presetId) {
            this.channel2CurrentPreset = null;
            this.showChannel2Status('🎛️ Manual mode enabled', 'info');
            console.log('🎛️ Manual mode enabled');
            this.updateChannel2Display();
            return;
        }
        
        const preset = this.channel2Presets.find(p => p.id === presetId);
        if (!preset) {
            console.warn('Preset not found:', presetId);
            this.showChannel2Status('⚠️ Preset not found', 'error');
            return;
        }
        
        this.channel2CurrentPreset = preset;
        console.log('🎨 Applied preset:', preset.humanName);
        this.showChannel2Status(`🎨 Applied: ${preset.humanName}`, 'success');
        
        // Apply preset settings
        this.channel2Style = preset.style;
        this.channel2Pattern = preset.defaultPattern;
        this.channel2Density = 'medium'; // Use preset's noteDensity later
        this.channel2OctaveRange = Math.round(preset.spread || 1);
        
        // Update display
        this.updateChannel2Display();
        
        // Regenerate with preset
        this.channel2Notes = {};
        this.progressionAnalysis = null;
        this.generateChannel2Pattern();
        this.buildGrid();
    }
    
    parseProgressionIntoPatterns() {
        // Split progression into 8-bar patterns
        const patternNames = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4'];
        this.patterns = {};
        
        for (let i = 0; i < this.progression.length; i += 8) {
            const patternBars = this.progression.slice(i, i + 8);
            const patternName = patternNames[Math.floor(i / 8)];
            
            if (patternName && patternBars.length > 0) {
                this.patterns[patternName] = {
                    progression: patternBars,
                    drumPatterns: {},
                    notes: {}
                };
                
                const btn = document.querySelector(`.pattern-btn[data-pattern="${patternName}"]`);
                if (btn) btn.classList.add('has-data');
            }
        }
        
        this.currentPattern = 'A1';
        console.log('Loaded default progression with', this.progression.length, 'bars');
    }

    initLoopSlider() {
        const track = document.getElementById('loopSliderTrack');
        const range = document.getElementById('loopSliderRange');
        const handleStart = document.getElementById('loopHandleStart');
        const handleEnd = document.getElementById('loopHandleEnd');
        const container = track ? track.parentElement : null;
        const gridWrapper = document.querySelector('.grid-wrapper');

        if (!track || !range || !container) return;

        let dragging = null;

        const MAX_LOOP_BARS = this.maxLoopBars || 8;

        const getBarWidth = () => {
            if (this.barWidth && this.barWidth > 0) return this.barWidth;
            const cssWidth = getComputedStyle(document.documentElement).getPropertyValue('--bar-width');
            const parsed = parseFloat(cssWidth);
            return Number.isFinite(parsed) && parsed > 0 ? parsed : 140;
        };

        const clampLoopBounds = (totalBars) => {
            if (totalBars <= 0) return;

            const rawStart = Number.isFinite(this.loopStart) ? Math.floor(this.loopStart) : 1;
            const rawEnd = Number.isFinite(this.loopEnd) ? Math.floor(this.loopEnd) : rawStart;

            let start = Math.min(rawStart, rawEnd);
            let end = Math.max(rawStart, rawEnd);

            let desiredLength = Math.max(1, end - start + 1);
            desiredLength = Math.min(MAX_LOOP_BARS, desiredLength);

            const maxStart = Math.max(1, totalBars - desiredLength + 1);
            start = Math.max(1, Math.min(start, maxStart));
            end = Math.min(totalBars, start + desiredLength - 1);

            this.loopStart = start;
            this.loopEnd = end;
        };

        const autoScrollWhileDragging = (clientX) => {
            if (!dragging || !container) return;
            const parentRect = container.getBoundingClientRect();
            const threshold = 32;
            if (clientX > parentRect.right - threshold) {
                const delta = container.clientWidth * 0.15;
                container.scrollLeft = Math.min(container.scrollWidth - container.clientWidth, container.scrollLeft + delta);
            } else if (clientX < parentRect.left + threshold) {
                const delta = container.clientWidth * 0.15;
                container.scrollLeft = Math.max(0, container.scrollLeft - delta);
            }
        };

        const updateSlider = () => {
            const totalBars = this.progression.length || 0;

            if (totalBars === 0) {
                this.loopSliderTotalWidth = 0;
                range.style.left = '0px';
                range.style.width = '0px';
                track.style.width = '0px';
                track.style.minWidth = '0px';
                const labels = document.getElementById('loopSliderLabels');
                if (labels) {
                    labels.innerHTML = '';
                    labels.style.width = '0px';
                    labels.style.minWidth = '0px';
                }
                return;
            }

            clampLoopBounds(totalBars);

            const barWidth = getBarWidth();
            const gridWidth = Math.max(barWidth, totalBars * barWidth);
            this.loopSliderTotalWidth = gridWidth;

            track.style.width = gridWidth + 'px';
            track.style.minWidth = gridWidth + 'px';

            const barsSelected = Math.max(1, this.loopEnd - this.loopStart + 1);
            const startPos = (this.loopStart - 1) * barWidth;
            range.style.left = startPos + 'px';
            range.style.width = (barsSelected * barWidth) + 'px';

            const labels = document.getElementById('loopSliderLabels');
            if (labels) {
                labels.innerHTML = '';
                labels.style.width = gridWidth + 'px';
                labels.style.minWidth = gridWidth + 'px';
                for (let i = 1; i <= totalBars; i++) {
                    const label = document.createElement('span');
                    label.textContent = i;
                    labels.appendChild(label);
                }
            }

            const loopStartInput = document.getElementById('loopStart');
            const loopEndInput = document.getElementById('loopEnd');
            if (loopStartInput) loopStartInput.value = this.loopStart;
            if (loopEndInput) loopEndInput.value = this.loopEnd;

            this.suppressLoopSliderUpdate = true;
            this.buildGrid();
            this.suppressLoopSliderUpdate = false;

            if (gridWrapper && !this.syncingSliderScroll) {
                const targetScroll = gridWrapper.scrollLeft;
                if (Math.abs(container.scrollLeft - targetScroll) > 1) {
                    this.syncingGridScroll = true;
                    container.scrollLeft = targetScroll;
                    requestAnimationFrame(() => {
                        this.syncingGridScroll = false;
                    });
                }
            }
        };

        const beginDrag = (type, startX) => {
            dragging = type;
            this.dragStartX = startX;
            this.dragStartLoopStart = this.loopStart;
            this.dragStartLoopEnd = this.loopEnd;
        };

        const attachPointerStart = (element, type) => {
            if (!element) return;

            element.addEventListener('mousedown', (e) => {
                e.preventDefault();
                e.stopPropagation();
                beginDrag(type, e.clientX);
            });

            element.addEventListener('touchstart', (e) => {
                if (e.touches.length !== 1) return;
                e.preventDefault();
                e.stopPropagation();
                beginDrag(type, e.touches[0].clientX);
            }, { passive: false });
        };

        attachPointerStart(handleStart, 'start');
        attachPointerStart(handleEnd, 'end');
        attachPointerStart(range, 'range');

        const handlePointerMove = (clientX) => {
            if (!dragging) return;

            autoScrollWhileDragging(clientX);

            const barWidth = getBarWidth();
            if (barWidth <= 0) return;

            const totalBars = this.progression.length;
            if (!totalBars) return;

            const trackRect = track.getBoundingClientRect();
            const totalWidth = this.loopSliderTotalWidth || (totalBars * barWidth);
            const scrollOffset = container ? container.scrollLeft : 0;
            const relativeX = Math.max(0, Math.min(clientX - trackRect.left + scrollOffset, totalWidth));

            if (dragging === 'start') {
                const barIndex = Math.floor(relativeX / barWidth);
                const minStart = Math.max(1, this.loopEnd - MAX_LOOP_BARS + 1);
                const newStart = Math.max(minStart, Math.min(this.loopEnd, barIndex + 1));
                if (newStart !== this.loopStart) {
                    this.loopStart = newStart;
                    updateSlider();
                }
            } else if (dragging === 'end') {
                const barIndex = Math.floor(relativeX / barWidth);
                const maxEnd = Math.min(totalBars, this.loopStart + MAX_LOOP_BARS - 1);
                const newEnd = Math.max(this.loopStart, Math.min(maxEnd, barIndex + 1));
                if (newEnd !== this.loopEnd) {
                    this.loopEnd = newEnd;
                    updateSlider();
                }
            } else if (dragging === 'range') {
                const deltaX = clientX - this.dragStartX;
                const deltaBars = Math.round(deltaX / barWidth);
                if (deltaBars !== 0) {
                    let rangeSize = Math.max(0, this.dragStartLoopEnd - this.dragStartLoopStart);
                    rangeSize = Math.min(rangeSize, MAX_LOOP_BARS - 1);
                    const maxStart = Math.max(1, totalBars - rangeSize);
                    const desiredStart = this.dragStartLoopStart + deltaBars;
                    const newStart = Math.max(1, Math.min(maxStart, desiredStart));
                    if (newStart !== this.loopStart) {
                        this.loopStart = newStart;
                        this.loopEnd = Math.min(totalBars, newStart + rangeSize);
                        updateSlider();
                    }
                }
            }
        };

        const pointerMove = (clientX) => {
            handlePointerMove(clientX);
        };

        const stopDrag = () => {
            dragging = null;
        };

        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            e.preventDefault();
            pointerMove(e.clientX);
        });

        document.addEventListener('touchmove', (e) => {
            if (!dragging || e.touches.length === 0) return;
            e.preventDefault();
            pointerMove(e.touches[0].clientX);
        }, { passive: false });

        document.addEventListener('mouseup', stopDrag);
        document.addEventListener('touchend', stopDrag);
        document.addEventListener('touchcancel', stopDrag);

        if (container && gridWrapper && !this.loopSliderScrollLinked) {
            container.addEventListener('scroll', () => {
                if (this.syncingGridScroll) return;
                this.syncingSliderScroll = true;
                if (gridWrapper.scrollLeft !== container.scrollLeft) {
                    gridWrapper.scrollLeft = container.scrollLeft;
                }
                requestAnimationFrame(() => {
                    this.syncingSliderScroll = false;
                });
            });

            gridWrapper.addEventListener('scroll', () => {
                if (this.syncingSliderScroll) return;
                this.syncingGridScroll = true;
                if (container.scrollLeft !== gridWrapper.scrollLeft) {
                    container.scrollLeft = gridWrapper.scrollLeft;
                }
                requestAnimationFrame(() => {
                    this.syncingGridScroll = false;
                });
            });

            this.loopSliderScrollLinked = true;
        }

        updateSlider();

        this.updateLoopSlider = updateSlider;

        if (!this.loopSliderResizeHandler) {
            this.loopSliderResizeHandler = () => {
                if (this.updateLoopSlider) {
                    this.updateLoopSlider();
                }
            };
            window.addEventListener('resize', this.loopSliderResizeHandler);
        }
    }

    buildVerticalRuler() {
        const ruler = document.getElementById('verticalRuler');
        if (!ruler) return;
        
        ruler.innerHTML = '';
        
        this.progression.forEach((bar, i) => {
            const rulerBar = document.createElement('div');
            rulerBar.className = 'ruler-bar';
            rulerBar.textContent = bar.barNum;
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
        
        // Create drum sounds
        this.createDrumSounds();
        
        // Create Channel 2 delay
        this.channel2Delay = new Tone.FeedbackDelay({
            delayTime: 0,
            feedback: 0,
            wet: 0
        });
        
        // Create Channel 2 synth (for main playback AND preview)
        this.channel2Synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { 
                type: 'sawtooth'  // Rich sound for melodies
            },
            envelope: {
                attack: 0.02,
                decay: 0.3,
                sustain: 0.4,
                release: 0.8
            }
        });
        
        // Chain: Channel2 Synth -> Channel2 Delay -> Reverb -> Master
        this.channel2Synth.connect(this.channel2Delay);
        this.channel2Delay.connect(this.reverb);
        this.reverb.toDestination();
        this.channel2Synth.volume.value = -25;
        
        // Track MIDI source: 'main' = Channel 2 pattern, 'preview' = Style preview
        this.channel2MidiSource = 'main';
        this.stylePreviewNotes = []; // Store preview notes separately
        
        this.synth.volume.value = -20;
    }

    setupEventListeners() {
        document.getElementById('parseBtn')?.addEventListener('click', () => {
            this.parseChords();
        });
        
        document.getElementById('parseWithBeats')?.addEventListener('click', () => {
            // DEBUG: Save progression before
            const beforeBars9to16 = JSON.parse(JSON.stringify(this.progression.slice(8, 16)));
            console.log('BEFORE Parse+Beats - Bars 9-16:', beforeBars9to16.map(b => ({
                bar: b.barNum,
                notes: b.chords[0].midiNotes
            })));
            
            // Only parse if textarea has content
            const textarea = document.getElementById('chordInput');
            if (textarea && textarea.value.trim()) {
                this.parseChords();
            }
            
            // Generate beats for all patterns
            Object.keys(this.patterns).forEach(patternId => {
                this.generateRandomBeatForPatternSilent(patternId);
            });
            
            // Load beats for current pattern
            if (this.patterns[this.currentPattern]) {
                this.drumPatterns = JSON.parse(JSON.stringify(this.patterns[this.currentPattern].drumPatterns));
                this.buildDrumGrid();
            }
            
            // DEBUG: Check progression after
            const afterBars9to16 = this.progression.slice(8, 16);
            console.log('AFTER Parse+Beats - Bars 9-16:', afterBars9to16.map(b => ({
                bar: b.barNum,
                notes: b.chords[0].midiNotes
            })));
            
            // Compare
            let changed = false;
            beforeBars9to16.forEach((before, i) => {
                const after = afterBars9to16[i];
                const beforeNotes = JSON.stringify(before.chords[0].midiNotes);
                const afterNotes = JSON.stringify(after.chords[0].midiNotes);
                if (beforeNotes !== afterNotes) {
                    console.warn(`⚠️ Bar ${after.barNum} CHANGED: ${beforeNotes} → ${afterNotes}`);
                    changed = true;
                }
            });
            
            if (!changed) {
                console.log('✓ No changes to bars 9-16');
            }
            
            console.log('Generated beats for all patterns');
        });
        
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
            const value = parseFloat(e.target.value);
            this.synth.set({ envelope: { attack: value } });
            document.getElementById('attackValue').textContent = value.toFixed(2) + 's';
        });
        document.getElementById('decay')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.synth.set({ envelope: { decay: value } });
            document.getElementById('decayValue').textContent = value.toFixed(2) + 's';
        });
        document.getElementById('sustain')?.addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.synth.set({ envelope: { sustain: value } });
            document.getElementById('sustainValue').textContent = value.toFixed(2);
        });
        document.getElementById('release').addEventListener('input', (e) => {
            const value = parseFloat(e.target.value);
            this.synth.set({ envelope: { release: value } });
            document.getElementById('releaseValue').textContent = value.toFixed(2) + 's';
        });
        
        // Synth presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadSynthPreset(btn.dataset.preset);
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
        
        // Drum presets
        document.querySelectorAll('.drum-preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.loadDrumPreset(btn.dataset.pattern);
            });
        });
        
        // Drum actions
        document.getElementById('drumCopy')?.addEventListener('click', () => this.copyDrumBar());
        document.getElementById('drumPaste')?.addEventListener('click', () => this.pasteDrumBar());
        document.getElementById('drumFillRange')?.addEventListener('click', () => this.fillDrumRange());
        document.getElementById('drumAutoFill')?.addEventListener('click', () => this.autoFillDrums());
        
        // Drum zoom
        document.getElementById('drumZoom')?.addEventListener('change', (e) => {
            this.drumZoom = parseInt(e.target.value);
            this.updateDrumZoom();
        });
        
        // Follow playhead toggles
        document.getElementById('followPlayhead')?.addEventListener('change', (e) => {
            this.followPlayhead = e.target.checked;
        });
        
        document.getElementById('drumFollowPlayhead')?.addEventListener('change', (e) => {
            this.drumFollowPlayhead = e.target.checked;
        });
        
        // Link scroll toggle
        document.getElementById('linkScroll')?.addEventListener('change', (e) => {
            this.linkScroll = e.target.checked;
        });
        
        // Song mode toggle
        document.getElementById('toggleSongMode')?.addEventListener('click', () => {
            this.songMode = !this.songMode;
            const btn = document.getElementById('toggleSongMode');
            if (btn) {
                btn.textContent = this.songMode ? '🎹 Pattern Mode' : '🎵 Song Mode';
                btn.classList.toggle('active', this.songMode);
            }
            // Rebuild to apply scroll settings
            this.buildGrid();
            this.buildDrumGrid();
            console.log('Song mode:', this.songMode);
        });
        
        // Chain patterns toggle
        document.getElementById('chainPatterns')?.addEventListener('change', (e) => {
            this.chainPatterns = e.target.checked;
            console.log('Chain patterns:', this.chainPatterns);
        });
        
        // Loop chain toggle
        document.getElementById('loopChain')?.addEventListener('change', (e) => {
            this.loopChain = e.target.checked;
            console.log('Loop chain:', this.loopChain);
        });
        
        // Auto random beats toggle
        document.getElementById('autoRandomBeats')?.addEventListener('change', (e) => {
            this.autoRandomBeats = e.target.checked;
            console.log('Auto random beats:', this.autoRandomBeats);
            
            if (this.autoRandomBeats) {
                // Generate random beat for current pattern if it doesn't have one
                this.generateRandomBeatForPattern(this.currentPattern);
            }
        });
        
        // Mute buttons
        document.getElementById('mutePiano')?.addEventListener('click', (e) => {
            this.mutePiano = !this.mutePiano;
            e.target.classList.toggle('active', this.mutePiano);
            console.log('Mute piano:', this.mutePiano);
        });
        
        document.getElementById('muteDrums')?.addEventListener('click', (e) => {
            this.muteDrums = !this.muteDrums;
            e.target.classList.toggle('active', this.muteDrums);
            console.log('Mute drums:', this.muteDrums);
        });
        
        // Volume sliders (dB)
        document.getElementById('pianoVolume')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            this.synth.volume.value = db;
            document.getElementById('pianoDb').value = db.toFixed(1);
        });
        
        document.getElementById('pianoDb')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            this.synth.volume.value = db;
            document.getElementById('pianoVolume').value = db;
        });
        
        document.getElementById('drumVolume')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            // Update all drum sounds volume
            Object.values(this.drumSounds).forEach(sound => {
                if (sound && sound.volume) {
                    sound.volume.value = db;
                }
            });
            document.getElementById('drumDb').value = db.toFixed(1);
        });
        
        document.getElementById('drumDb')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            // Update all drum sounds volume
            Object.values(this.drumSounds).forEach(sound => {
                if (sound && sound.volume) {
                    sound.volume.value = db;
                }
            });
            document.getElementById('drumVolume').value = db;
        });
        
        // Channel 2 volume controls
        document.getElementById('channel2Volume')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.volume.value = db;
            }
            document.getElementById('channel2Db').value = db.toFixed(1);
        });
        
        document.getElementById('channel2Db')?.addEventListener('input', (e) => {
            const db = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.volume.value = db;
            }
            document.getElementById('channel2Volume').value = db;
        });
        
        // Mute buttons
        document.getElementById('muteChannel2')?.addEventListener('click', (e) => {
            this.muteChannel2 = !this.muteChannel2;
            e.target.classList.toggle('active', this.muteChannel2);
            if (this.channel2Synth) {
                this.channel2Synth.volume.value = this.muteChannel2 ? -Infinity : parseFloat(document.getElementById('channel2Volume').value);
            }
        });
        
        // Channel 2 Synth controls
        document.getElementById('channel2Waveform')?.addEventListener('change', (e) => {
            if (this.channel2Synth) {
                this.channel2Synth.set({ oscillator: { type: e.target.value } });
            }
        });
        
        document.getElementById('channel2Attack')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.set({ envelope: { attack: val } });
            }
            document.getElementById('channel2AttackValue').textContent = val.toFixed(2) + 's';
        });
        
        document.getElementById('channel2Decay')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.set({ envelope: { decay: val } });
            }
            document.getElementById('channel2DecayValue').textContent = val.toFixed(2) + 's';
        });
        
        document.getElementById('channel2Sustain')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.set({ envelope: { sustain: val } });
            }
            document.getElementById('channel2SustainValue').textContent = val.toFixed(2);
        });
        
        document.getElementById('channel2Release')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Synth) {
                this.channel2Synth.set({ envelope: { release: val } });
            }
            document.getElementById('channel2ReleaseValue').textContent = val.toFixed(2) + 's';
        });
        
        // Channel 2 Effects
        document.getElementById('channel2DelayTime')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Delay) {
                this.channel2Delay.delayTime.value = val;
                this.channel2Delay.wet.value = val > 0 ? 0.5 : 0;
            }
        });
        
        document.getElementById('channel2DelayFeedback')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            if (this.channel2Delay) {
                this.channel2Delay.feedback.value = val;
            }
        });
        
        document.getElementById('channel2Reverb')?.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            // Channel 2 reverb is controlled by adjusting the main reverb wet when Channel 2 plays
            // For now, this is informational - actual implementation would need a separate reverb send
            console.log('Channel 2 reverb:', val);
        });
        
        // Channel 2 Arpeggiator
        document.getElementById('channel2ArpEnabled')?.addEventListener('change', (e) => {
            this.channel2ArpEnabled = e.target.checked;
        });
        document.getElementById('channel2ArpReplace')?.addEventListener('change', (e) => {
            this.channel2ArpReplace = e.target.checked;
        });
        document.getElementById('channel2ArpVisualizer')?.addEventListener('change', (e) => {
            this.channel2ArpVisualizer = e.target.checked;
        });
        document.getElementById('channel2ArpPattern')?.addEventListener('change', (e) => {
            this.channel2ArpPattern = e.target.value;
        });
        document.getElementById('channel2ArpSpeed')?.addEventListener('change', (e) => {
            this.channel2ArpSpeed = e.target.value;
        });
        document.getElementById('channel2ArpOctaves')?.addEventListener('input', (e) => {
            this.channel2ArpOctaves = parseInt(e.target.value);
        });
        document.getElementById('channel2ArpTrigger')?.addEventListener('change', (e) => {
            this.channel2ArpTrigger = e.target.value;
        });
        document.getElementById('channel2ArpMode')?.addEventListener('change', (e) => {
            this.channel2ArpMode = e.target.value;
        });
        
        // Channel 2 Pattern Generator controls
        document.getElementById('channel2PatternEnabled')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                this.generateChannel2Pattern();
                this.buildGrid();
            } else {
                this.clearChannel2Pattern();
                this.buildGrid();
            }
        });
        
        // Channel 2 Mute toggle (affects ALL channel 2 playback)
        document.getElementById('channel2Mute')?.addEventListener('change', (e) => {
            if (this.channel2Synth) {
                this.channel2Synth.volume.value = e.target.checked ? -Infinity : -25;
            }
            console.log(`🔇 Channel 2 ${e.target.checked ? 'MUTED' : 'UNMUTED'}`);
        });
        
        // Debounce timer for auto-regenerate
        this.channel2RegenerateTimer = null;
        
        // Setup preset menu
        this.setupPresetMenu();
        
        // Setup style generator section
        this.setupStyleGenerator();
        
        // === POC: Mode Switcher Event Listeners ===
        document.querySelectorAll('input[name="ch2mode"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (this.modeSwitcher) {
                    this.modeSwitcher.setMode(e.target.value);
                    this.channel2PlaybackMode = e.target.value;
                    console.log(`🔀 Channel 2 mode: ${e.target.value}`);
                }
            });
        });
        
        // Follow Mode pattern selector
        document.getElementById('followModePattern')?.addEventListener('change', (e) => {
            if (this.followMode) {
                this.followMode.setPattern(e.target.value);
                console.log(`🎵 Follow Mode pattern: ${e.target.value}`);
            }
        });
        
        const autoRegenerate = (changeName) => {
            // Clear any pending regeneration
            if (this.channel2RegenerateTimer) {
                clearTimeout(this.channel2RegenerateTimer);
            }
            
            // Show feedback
            this.showChannel2Status(`🔄 ${changeName} changed, updating...`, 'info');
            
            // Debounce: wait 300ms before regenerating
            this.channel2RegenerateTimer = setTimeout(() => {
                this.channel2Notes = {};
                this.progressionAnalysis = null;
                this.generateChannel2Pattern();
                this.buildGrid();
                this.showChannel2Status(`✅ Pattern updated with ${changeName}`, 'success');
            }, 300);
        };
        
        // Source radio buttons
        document.querySelectorAll('input[name="channel2Source"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.channel2Source = e.target.value;
                this.updateChannel2Display();
                autoRegenerate('Source');
            });
        });
        
        document.getElementById('channel2Style')?.addEventListener('change', (e) => {
            this.channel2Style = e.target.value;
            
            // Update pattern options based on style
            this.updateChannel2PatternOptions();
            
            autoRegenerate('Style');
        });
        
        document.getElementById('channel2Pattern')?.addEventListener('change', (e) => {
            this.channel2Pattern = e.target.value;
            autoRegenerate('Pattern');
        });
        
        document.getElementById('channel2Density')?.addEventListener('change', (e) => {
            this.channel2Density = e.target.value;
            this.updateChannel2Display();
            autoRegenerate('Density');
        });
        
        document.getElementById('channel2OctaveRange')?.addEventListener('change', (e) => {
            this.channel2OctaveRange = parseInt(e.target.value);
            this.updateChannel2Display();
            autoRegenerate('Octave Range');
        });
        
        const regenerateBtn = document.getElementById('regenerateChannel2');
        if (regenerateBtn) {
            regenerateBtn.addEventListener('click', () => {
                // Visual feedback
                regenerateBtn.textContent = '⏳...';
                regenerateBtn.disabled = true;
                
                setTimeout(() => {
                    // Clear old pattern first to force regeneration
                    this.channel2Notes = {};
                    this.progressionAnalysis = null;
                    
                    this.generateChannel2Pattern();
                    this.buildGrid();
                    
                    // Reset button
                    regenerateBtn.textContent = '🔄 Current';
                    regenerateBtn.disabled = false;
                }, 100);
            });
        }
        
        const regenerateAllBtn = document.getElementById('regenerateAllChannel2');
        if (regenerateAllBtn) {
            regenerateAllBtn.addEventListener('click', () => {
                // Visual feedback
                regenerateAllBtn.textContent = '⏳ Processing...';
                regenerateAllBtn.disabled = true;
                this.showChannel2Status('🔄 Regenerating all patterns...', 'info');
                
                setTimeout(() => {
                    let regeneratedCount = 0;
                    const currentPattern = this.currentPattern;
                    
                    // Save current pattern first
                    this.saveCurrentPattern();
                    
                    // Regenerate for all patterns that have progression
                    Object.keys(this.patterns).forEach(patternId => {
                        const pattern = this.patterns[patternId];
                        if (pattern && pattern.progression && pattern.progression.length > 0) {
                            console.log(`🔄 Regenerating Channel 2 for pattern ${patternId}...`);
                            
                            // Temporarily load this pattern
                            this.progression = JSON.parse(JSON.stringify(pattern.progression));
                            this.channel2Notes = {};
                            this.progressionAnalysis = null;
                            
                            // Generate new Channel 2 pattern
                            this.generateChannel2Pattern();
                            
                            // Save back to pattern
                            this.patterns[patternId].channel2Notes = JSON.parse(JSON.stringify(this.channel2Notes));
                            
                            regeneratedCount++;
                        }
                    });
                    
                    // Restore current pattern
                    this.loadPattern(currentPattern);
                    
                    // Reset button
                    regenerateAllBtn.textContent = '🔄 All Patterns';
                    regenerateAllBtn.disabled = false;
                    
                    this.showChannel2Status(`✅ Regenerated Channel 2 for ${regeneratedCount} patterns!`, 'success');
                }, 100);
            });
        }
        
        const syncBtn = document.getElementById('syncChannel2');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                const progressionBars = this.progression.length;
                const channel2Bars = Object.keys(this.channel2Notes).length;
                
                // Check if notes actually exist (not just empty object)
                const hasActualNotes = Object.values(this.channel2Notes).some(notes => notes && notes.length > 0);
                
                if (channel2Bars === progressionBars && hasActualNotes) {
                    this.showChannel2Status('✅ Already synced!', 'success');
                    return;
                }
                
                // Visual feedback
                syncBtn.textContent = '⏳ Syncing...';
                syncBtn.disabled = true;
                this.showChannel2Status('🔄 Generating pattern...', 'info');
                
                setTimeout(() => {
                    // Force regenerate to match progression
                    this.channel2Notes = {};
                    this.progressionAnalysis = null;
                    this.generateChannel2Pattern();
                    this.buildGrid();
                    
                    // Reset button
                    syncBtn.textContent = '🔗 Sync to Progression';
                    syncBtn.disabled = false;
                    
                    const totalNotes = Object.values(this.channel2Notes).reduce((sum, notes) => sum + (notes?.length || 0), 0);
                    this.showChannel2Status(`✅ Synced! Generated ${Object.keys(this.channel2Notes).length} bars with ${totalNotes} notes.`, 'success');
                }, 100);
            });
        }
        
        // Initialize Channel 2 pattern options
        this.updateChannel2PatternOptions();
        
        // Start meter animation
        this.startMeterAnimation();
        
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
        
        // MIDI Export
        document.getElementById('exportMidiCurrent')?.addEventListener('click', () => this.exportMidi(false));
        document.getElementById('exportMidiAll')?.addEventListener('click', () => this.exportMidi(true));
        document.getElementById('exportChannel2MidiCurrent')?.addEventListener('click', () => this.exportChannel2Midi(false));
        document.getElementById('exportChannel2MidiAll')?.addEventListener('click', () => this.exportChannel2Midi(true));
        document.getElementById('exportDrumMidiCurrent')?.addEventListener('click', () => this.exportDrumMidi(false));
        document.getElementById('exportDrumMidiAll')?.addEventListener('click', () => this.exportDrumMidi(true));
        
        // View controls
        document.getElementById('togglePianoRoll')?.addEventListener('click', () => this.togglePianoRollView());
        document.getElementById('toggleChannel2')?.addEventListener('click', () => this.toggleChannel2View());
        document.getElementById('toggleChannel2Mode')?.addEventListener('click', () => this.toggleChannel2Mode());
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
        
        // Chord Designer - Quality buttons
        document.querySelectorAll('.quality-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // Remove active from all buttons
                document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                // Add active to clicked button
                e.target.classList.add('active');
                // Update chord display
                this.updateChordDisplay();
                // Auto-apply if locked
                if (document.getElementById('chordLock').checked) {
                    this.applyChordToSelectedBar();
                }
            });
        });
        
        // Root Note dropdown
        document.getElementById('rootNoteSelect')?.addEventListener('change', () => {
            this.updateChordDisplay();
            if (document.getElementById('chordLock').checked) {
                this.applyChordToSelectedBar();
            }
        });
        
        // Arpeggio step buttons
        document.getElementById('arpeggioUp')?.addEventListener('click', () => this.stepArpeggio(1));
        document.getElementById('arpeggioDown')?.addEventListener('click', () => this.stepArpeggio(-1));
        
        // Voice count buttons
        document.getElementById('voicesUp')?.addEventListener('click', () => this.stepVoiceCount(1));
        document.getElementById('voicesDown')?.addEventListener('click', () => this.stepVoiceCount(-1));
        
        // Root Note step buttons
        document.getElementById('rootUp')?.addEventListener('click', () => this.stepRootNote(1));
        document.getElementById('rootDown')?.addEventListener('click', () => this.stepRootNote(-1));
        
        // Octave dropdown
        document.getElementById('octaveSelect')?.addEventListener('change', () => {
            if (document.getElementById('chordLock').checked) {
                this.applyChordToSelectedBar();
            }
        });
        
        // Octave step buttons
        document.getElementById('octaveUp')?.addEventListener('click', () => this.stepOctave(1));
        document.getElementById('octaveDown')?.addEventListener('click', () => this.stepOctave(-1));
        
        // Inversion dropdown
        document.getElementById('inversionSelect')?.addEventListener('change', () => {
            if (document.getElementById('chordLock').checked) {
                this.applyChordToSelectedBar();
            }
        });
        
        // Inversion step buttons
        document.getElementById('inversionUp')?.addEventListener('click', () => this.stepInversion(1));
        document.getElementById('inversionDown')?.addEventListener('click', () => this.stepInversion(-1));
        
        // Bass Note dropdown
        document.getElementById('bassNoteSelect')?.addEventListener('change', () => {
            this.updateChordDisplay();
            if (document.getElementById('chordLock').checked) {
                this.applyChordToSelectedBar();
            }
        });
        
        // Scale dropdown
        document.getElementById('scaleSelect')?.addEventListener('change', () => {
            console.log('Scale changed to:', document.getElementById('scaleSelect').value);
        });
        
        // Lock toggle
        document.getElementById('chordLock')?.addEventListener('change', (e) => {
            if (e.target.checked) {
                console.log('🔒 Chord Designer locked - changes will auto-apply');
            } else {
                console.log('🔓 Chord Designer unlocked');
            }
        });
        
        document.getElementById('applyChord')?.addEventListener('click', () => this.applyChordToSelectedBar());
        
        // Modulation Matrix
        document.getElementById('openModMatrix')?.addEventListener('click', () => this.openModMatrix());
        document.getElementById('closeModMatrix')?.addEventListener('click', () => this.closeModMatrix());
        this.setupModulationControls();
        
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
            if (Number.isNaN(this.loopStart)) this.loopStart = 1;
            // Ensure end is not before start
            if (this.loopEnd < this.loopStart) {
                this.loopEnd = this.loopStart;
                const loopEndInput = document.getElementById('loopEnd');
                if (loopEndInput) loopEndInput.value = this.loopEnd;
            }
            const maxLength = (this.maxLoopBars || 8) - 1;
            if (this.loopEnd - this.loopStart > maxLength) {
                this.loopEnd = this.loopStart + maxLength;
            }
            if (this.updateLoopSlider) this.updateLoopSlider();
        });
        document.getElementById('loopEnd')?.addEventListener('change', (e) => {
            this.loopEnd = Math.max(this.loopStart, parseInt(e.target.value));
            if (Number.isNaN(this.loopEnd)) this.loopEnd = this.loopStart;
            const maxEnd = this.loopStart + (this.maxLoopBars || 8) - 1;
            if (this.loopEnd > maxEnd) {
                this.loopEnd = Math.min(maxEnd, this.progression.length || this.loopEnd);
            }
            if (this.updateLoopSlider) this.updateLoopSlider();
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
        this.boxSelectionBase = new Set(this.selectedNotes);
        this.boxSelectionTemp = new Set(this.selectedNotes);
        this.lastTouchedNotes = null;
        document.querySelectorAll('.note-block.box-preview').forEach(block => block.classList.remove('box-preview'));
        
        // Create selection box element
        this.selectionBox = document.createElement('div');
        this.selectionBox.style.cssText = 'position: fixed; border: 2px dashed #00d4ff; background: rgba(0,212,255,0.1); pointer-events: none; z-index: 9999;';
        document.body.appendChild(this.selectionBox);
        
        document.addEventListener('mousemove', this.handleBoxSelectMove);
        document.addEventListener('mouseup', this.handleBoxSelectEnd);
    }

    handleBoxSelectMove = (e) => {
        if (!this.isBoxSelecting) return;

        const startX = Math.min(this.boxSelectStart.x, e.clientX);
        const startY = Math.min(this.boxSelectStart.y, e.clientY);
        const width = Math.abs(e.clientX - this.boxSelectStart.x);
        const height = Math.abs(e.clientY - this.boxSelectStart.y);

        this.selectionBox.style.left = startX + 'px';
        this.selectionBox.style.top = startY + 'px';
        this.selectionBox.style.width = width + 'px';
        this.selectionBox.style.height = height + 'px';

        const boxRect = this.selectionBox.getBoundingClientRect();
        const touchedMidis = new Set();
        const currentKeys = new Set();
        const selectedMidiNotes = [];

        document.querySelectorAll('.note-block').forEach(noteBlock => {
            const noteRect = noteBlock.getBoundingClientRect();

            if (!(noteRect.right < boxRect.left ||
                  noteRect.left > boxRect.right ||
                  noteRect.bottom < boxRect.top ||
                  noteRect.top > boxRect.bottom)) {
                const midi = parseInt(noteBlock.dataset.midi, 10);
                touchedMidis.add(midi);

                if (!this.lastTouchedNotes || !this.lastTouchedNotes.has(midi)) {
                    this.playNote(midi);
                }

                const key = `${noteBlock.dataset.midi}-${noteBlock.dataset.barIndex}-${noteBlock.dataset.chordIndex}`;
                currentKeys.add(key);

                if (!selectedMidiNotes.includes(midi)) {
                    selectedMidiNotes.push(midi);
                }
            }
        });

        this.lastTouchedNotes = touchedMidis;

        const combinedSelection = new Set(this.boxSelectionBase || []);
        currentKeys.forEach(key => combinedSelection.add(key));
        this.boxSelectionTemp = combinedSelection;

        document.querySelectorAll('.note-block.box-preview').forEach(block => block.classList.remove('box-preview'));
        currentKeys.forEach(key => {
            const [midi, barIdx, chordIdx] = key.split('-');
            const selector = `.note-block[data-midi="${midi}"][data-bar-index="${barIdx}"][data-chord-index="${chordIdx}"]`;
            const block = document.querySelector(selector);
            if (block && !this.boxSelectionBase?.has(key)) {
                block.classList.add('box-preview');
            }
        });

        if (selectedMidiNotes.length > 0) {
            selectedMidiNotes.forEach(midi => this.playNote(midi));
        }
    }

    handleBoxSelectEnd = () => {
        if (!this.isBoxSelecting) return;

        this.isBoxSelecting = false;

        if (this.selectionBox) {
            document.body.removeChild(this.selectionBox);
            this.selectionBox = null;
        }

        document.removeEventListener('mousemove', this.handleBoxSelectMove);
        document.removeEventListener('mouseup', this.handleBoxSelectEnd);

        if (this.boxSelectionTemp) {
            this.selectedNotes = new Set(this.boxSelectionTemp);
        }

        document.querySelectorAll('.note-block.box-preview').forEach(block => block.classList.remove('box-preview'));
        this.updateNoteSelection();

        if (this.selectedNotes.size > 0) {
            const barIndices = Array.from(this.selectedNotes).map(key => parseInt(key.split('-')[1], 10));
            if (barIndices.length > 0) {
                const firstBarIdx = Math.min(...barIndices);
                this.selectBar(firstBarIdx);
            }
        }

        this.boxSelectStart = null;
        this.boxSelectionBase = null;
        this.boxSelectionTemp = null;
        this.lastTouchedNotes = null;
    }

    handleKeyboard(e) {
        console.log('handleKeyboard called:', e.key, 'target:', e.target.tagName, 'metaKey:', e.metaKey, 'ctrlKey:', e.ctrlKey);
        
        // Don't intercept ANY shortcuts in input fields
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            console.log('Blocked - in input field');
            // Only allow Escape to work
            if (e.key === 'Escape') {
                this.deselectAllNotes();
            }
            return;
        }
        
        // Escape works in main app
        if (e.key === 'Escape') {
            this.deselectAllNotes();
            return;
        }
        
        if (!this.editMode) return; // Only work in edit mode
        
        console.log('Key pressed:', e.key, 'Selected notes:', this.selectedNotes.size);
        
        // Ctrl+Z or Cmd+Z - Undo (only if not in input field)
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            console.log('Undo triggered, target:', e.target.tagName);
            e.preventDefault();
            this.undo();
        }
        // Ctrl+Y or Ctrl+Shift+Z or Cmd+Shift+Z - Redo (only if not in input field)
        else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
            console.log('Redo triggered, target:', e.target.tagName);
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
        // Delete or Backspace key
        else if (e.key === 'Delete' || e.key === 'Backspace') {
            e.preventDefault();
            this.deleteSelectedNotes();
        }
        // Ctrl+A - Select all
        else if (e.ctrlKey && e.key === 'a') {
            e.preventDefault();
            this.selectAllNotes();
        }
        // Arrow keys - Move selected notes
        else if (e.key === 'ArrowUp') {
            e.preventDefault();
            this.moveSelectedNotes(0, 1); // Up = +1 semitone
        }
        else if (e.key === 'ArrowDown') {
            e.preventDefault();
            this.moveSelectedNotes(0, -1); // Down = -1 semitone
        }
        else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            this.moveSelectedNotes(-1, 0); // Left = -1 bar
        }
        else if (e.key === 'ArrowRight') {
            e.preventDefault();
            this.moveSelectedNotes(1, 0); // Right = +1 bar
        }
    }

    toggleEditMode() {
        this.editMode = !this.editMode;
        const btn = document.getElementById('toggleEditMode');
        if (btn) {
            btn.textContent = this.editMode ? '🔒 Lock' : '✏️ Edit';
            btn.classList.toggle('active', this.editMode);
            // Remove focus from button so keyboard shortcuts work
            btn.blur();
        }

        // Rebuild grid so note blocks update their handles/listeners for the new mode
        this.buildGrid();

        // Update cursor on piano cells
        document.querySelectorAll('.piano-cell').forEach(cell => {
            cell.style.cursor = this.editMode ? 'crosshair' : 'default';
        });

        if (this.editMode) {
            // Restore visual selection after rebuild
            this.updateNoteSelection();
        } else {
            this.deselectAllNotes();
        }
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

    toggleChannel2View() {
        this.showChannel2 = !this.showChannel2;
        const btn = document.getElementById('toggleChannel2');
        const modeBtn = document.getElementById('toggleChannel2Mode');

        if (btn) {
            btn.textContent = this.showChannel2 ? '🎶 Channel 2 ON' : '🎶 Channel 2';
            btn.classList.toggle('active', this.showChannel2);
        }

        // Show/hide mode toggle button
        if (modeBtn) {
            modeBtn.style.display = this.showChannel2 ? 'inline-block' : 'none';
            modeBtn.classList.toggle('active', this.showChannel2 && this.channel2Mode === 'separate');
            if (this.showChannel2) {
                modeBtn.textContent = this.channel2Mode === 'separate' ? '📊 Separate' : '🔗 Overlay';
            }
        }

        if (this.showChannel2) {
            console.log('Channel 2 activated! 🎵');
            this.generateChannel2Pattern();
        } else {
            console.log('Channel 2 deactivated');
            this.clearChannel2Pattern();
        }
        
        this.buildGrid();
    }

    toggleChannel2Mode() {
        this.channel2Mode = this.channel2Mode === 'overlay' ? 'separate' : 'overlay';
        const btn = document.getElementById('toggleChannel2Mode');
        if (btn) {
            btn.textContent = this.channel2Mode === 'separate' ? '📊 Separate' : '🔗 Overlay';
            btn.classList.toggle('active', this.channel2Mode === 'separate');
        }
        
        console.log('Channel 2 mode:', this.channel2Mode);
        this.buildGrid();
    }

    updateChannel2SyncStatus() {
        const statusEl = document.getElementById('channel2SyncStatus');
        if (!statusEl) return;

        if (!this.showChannel2) {
            statusEl.textContent = '🚫 Channel 2 uit';
            statusEl.style.color = '#888';
            return;
        }

        const progressionBars = this.progression.length;

        // Count only bars with actual notes
        const barsWithNotes = Object.keys(this.channel2Notes).filter(barIdx => {
            const notes = this.channel2Notes[barIdx];
            return notes && notes.length > 0;
        }).length;
        
        const totalNotes = Object.values(this.channel2Notes).reduce((sum, notes) => sum + (notes?.length || 0), 0);
        
        if (totalNotes === 0) {
            statusEl.textContent = '⚠️ No pattern';
            statusEl.style.color = '#ff6b35';
        } else if (barsWithNotes >= progressionBars) {
            statusEl.textContent = `✅ Synced (${totalNotes} notes)`;
            statusEl.style.color = '#4CAF50';
        } else {
            statusEl.textContent = `⚠️ Out of sync (${barsWithNotes}/${progressionBars} bars)`;
            statusEl.style.color = '#ff9800';
        }
    }
    
    showChannel2Status(message, type = 'info') {
        const statusMsg = document.getElementById('channel2StatusMessage');
        if (!statusMsg) return;
        
        // Set color based on type
        const colors = {
            'success': '#4CAF50',
            'error': '#ff6b35',
            'warning': '#ff9800',
            'info': '#00d4ff'
        };
        
        statusMsg.textContent = message;
        statusMsg.style.color = colors[type] || colors.info;
        statusMsg.style.display = 'block';
        
        // Auto-hide after 3 seconds
        setTimeout(() => {
            statusMsg.style.display = 'none';
        }, 3000);
    }

    setupPresetMenu() {
        const menuBtn = document.getElementById('channel2PresetSelector');
        const closeBtn = document.getElementById('closePresetMenu');
        const overlay = document.getElementById('channel2PresetOverlay');
        const searchInput = document.getElementById('channel2PresetSearch');
        const treeViewSelect = document.getElementById('channel2TreeView');
        const randomBtn = document.getElementById('randomChannel2');
        const applyCurrentBtn = document.getElementById('applyPresetCurrentBtn');
        const applyAllBtn = document.getElementById('applyPresetAllBtn');
        
        // Selected preset tracking
        this.selectedPresetForModal = null;
        
        // Open menu
        menuBtn?.addEventListener('click', () => {
            this.openPresetMenu();
        });
        
        // Close menu
        closeBtn?.addEventListener('click', () => {
            this.closePresetMenu();
        });
        
        overlay?.addEventListener('click', () => {
            this.closePresetMenu();
        });
        
        // Search
        searchInput?.addEventListener('input', (e) => {
            this.filterPresets(e.target.value);
        });
        
        // Tree view change
        treeViewSelect?.addEventListener('change', (e) => {
            this.buildTreeNav(e.target.value);
        });
        
        // Random button
        randomBtn?.addEventListener('click', () => {
            this.selectRandomPreset();
        });
        
        // Apply buttons
        applyCurrentBtn?.addEventListener('click', () => {
            this.stopPreview();
            this.applyModalPreset(false); // Current pattern only (8 bars)
        });
        
        applyAllBtn?.addEventListener('click', () => {
            this.stopPreview();
            this.applyModalPreset(true); // All patterns (16 bars)
        });
        
        // Sync modal settings with sidebar on change
        document.getElementById('channel2ModalSource')?.addEventListener('change', (e) => {
            this.channel2Source = e.target.value;
        });
        
        document.getElementById('channel2ModalDensity')?.addEventListener('change', (e) => {
            this.channel2Density = e.target.value;
        });
        
        document.getElementById('channel2ModalOctaves')?.addEventListener('change', (e) => {
            this.channel2OctaveRange = parseInt(e.target.value);
        });
    }
    
    initializeStyles() {
        return {
            'pop-basic': {
                name: 'Pop Basic',
                description: 'Block chord patterns with melodic fills (4-bar phrase)',
                phraseLength: 4,
                generate: (allChordTones, phraseIndex, variation) => {
                    // Complete 4-bar performance
                    const notes = [];
                    const barsInPhrase = Math.min(4, allChordTones.length);
                    
                    for (let bar = 0; bar < barsInPhrase; bar++) {
                        const chordTones = allChordTones[bar] || [];
                        const barStart = bar * 4;
                        
                        // Bar 1-3: Whole notes
                        if (bar < 3) {
                            chordTones.slice(0, 3).forEach((midi, idx) => {
                                notes.push({ 
                                    midi, 
                                    start: barStart, 
                                    duration: 3.8, 
                                    velocity: 85 - (idx * 5) 
                                });
                            });
                        }
                        
                        // Bar 4: Add melodic fill
                        if (bar === 3 && variation > 30) {
                            chordTones.slice(0, 3).forEach((midi, idx) => {
                                notes.push({ midi, start: barStart, duration: 1.5, velocity: 85 - (idx * 5) });
                            });
                            if (chordTones[0]) {
                                notes.push({ midi: chordTones[0] + 2, start: barStart + 2, duration: 0.5, velocity: 80 });
                                notes.push({ midi: chordTones[1] || chordTones[0], start: barStart + 2.5, duration: 0.5, velocity: 75 });
                                notes.push({ midi: chordTones[2] || chordTones[0], start: barStart + 3, duration: 0.5, velocity: 80 });
                            }
                        }
                    }
                    return notes;
                }
            },
            'techno-arp': {
                name: 'Techno Arp',
                description: '16th note arpeggios with rhythmic accents. Perfect for electronic music.',
                generate: (chordTones, barIndex, variation) => {
                    const notes = [];
                    const sorted = [...chordTones].sort((a, b) => a - b);
                    for (let i = 0; i < 16; i++) {
                        const midi = sorted[i % sorted.length];
                        const isAccent = i % 4 === 0;
                        if (Math.random() * 100 > variation && !isAccent) continue;
                        notes.push({ midi, start: i * 0.25, duration: 0.2, velocity: isAccent ? 95 : 70 });
                    }
                    return notes;
                }
            },
            'jazz-ii-v-i': {
                name: 'Jazz Comp II–V–I',
                description: 'Swinging II-V-I progressions with syncopation',
                generate: (chordTones, barIndex, variation) => {
                    const notes = [];
                    const voicing = chordTones.length > 2 ? chordTones.slice(0, 3) : chordTones;
                    const swing = 0.08;
                    const hits = [0, 1.5 + swing, 3 + swing * 0.5];
                    hits.forEach((pos, hitIdx) => {
                        voicing.forEach((midi, idx) => {
                            notes.push({ midi, start: pos, duration: 0.25, velocity: 88 - (idx * 8) - (hitIdx * 3) });
                        });
                    });
                    return notes;
                }
            },
            'baroque-cadence': {
                name: 'Baroque',
                description: 'Classical cadence patterns with voice leading',
                generate: (chordTones, barIndex, variation) => {
                    const notes = [];
                    const sorted = [...chordTones].sort((a, b) => a - b);
                    // Arpeggiated pattern
                    sorted.forEach((midi, idx) => {
                        notes.push({ midi, start: idx * 0.5, duration: 0.4, velocity: 80 });
                    });
                    // Add passing tone
                    if (variation > 40 && sorted.length > 1) {
                        notes.push({ midi: sorted[0] + 1, start: 2, duration: 0.2, velocity: 70 });
                    }
                    return notes;
                }
            }
        };
    }
    
    setupStyleGenerator() {
        // Style parameters
        this.styleParams = {
            currentStyle: 'pop-basic',
            phraseLength: 4,
            variation: 50,
            octave: 0
        };
        
        // Style definitions
        this.styles = this.initializeStyles();
        
        // Style card selection
        const styleCards = document.querySelectorAll('.style-card');
        const styleSelector = document.getElementById('styleSelector');
        const styleDescription = document.getElementById('styleDescription');
        
        const styleDescriptions = {
            'pop-basic': '🎸 Pop Basic - Block chord patterns with melodic fills',
            'techno-arp': '🔊 Techno Arp - 16th note arpeggios with rhythmic accents',
            'jazz-ii-v-i': '🎺 Jazz Comp - Swinging II-V-I progressions with syncopation',
            'baroque-cadence': '🎻 Baroque - Classical cadence patterns with voice leading'
        };
        
        const selectStyle = (styleId) => {
            this.styleParams.currentStyle = styleId;
            
            // Update card selection
            styleCards.forEach(card => {
                if (card.dataset.style === styleId) {
                    card.style.border = '2px solid #00d4ff';
                    card.style.background = 'rgba(0, 212, 255, 0.15)';
                    card.style.boxShadow = '0 0 15px rgba(0, 212, 255, 0.3)';
                } else {
                    card.style.border = '2px solid #333';
                    card.style.background = '#1a1a2e';
                    card.style.boxShadow = 'none';
                }
            });
            
            // Update hidden selector
            if (styleSelector) styleSelector.value = styleId;
            
            // Update description
            if (styleDescription) {
                styleDescription.textContent = styleDescriptions[styleId] || styleId;
            }
            
            // Auto-update preview
            this.updateStylePreview();
        };
        
        // Card click handlers
        styleCards.forEach(card => {
            card.addEventListener('click', () => {
                selectStyle(card.dataset.style);
            });
        });
        
        // Initialize first card as selected
        if (styleCards.length > 0) {
            selectStyle(styleCards[0].dataset.style);
        }
        
        // Fallback for selector change
        styleSelector?.addEventListener('change', (e) => {
            selectStyle(e.target.value);
        });
        
        // Initialize description and preview
        if (styleDescription) {
            const style = this.styles[this.styleParams.currentStyle];
            styleDescription.textContent = style ? style.description : '';
        }
        // Delay initial preview until progression is loaded
        setTimeout(() => this.updateStylePreview(), 100);
        
        // Phrase length slider
        document.getElementById('stylePhraseSlider')?.addEventListener('input', (e) => {
            this.styleParams.phraseLength = parseInt(e.target.value);
            document.getElementById('stylePhraseLength').textContent = e.target.value + ' bars';
            this.updateStylePreview();
        });
        
        // Variation slider
        document.getElementById('styleVariationSlider')?.addEventListener('input', (e) => {
            this.styleParams.variation = parseInt(e.target.value);
            document.getElementById('styleVariation').textContent = e.target.value + '%';
            this.updateStylePreview();
        });
        
        // Octave slider
        document.getElementById('styleOctaveSlider')?.addEventListener('input', (e) => {
            this.styleParams.octave = parseInt(e.target.value);
            document.getElementById('styleOctave').textContent = e.target.value;
            this.updateStylePreview();
        });
        
        // Preview button
        document.getElementById('stylePreviewBtn')?.addEventListener('click', async () => {
            // CRITICAL: Ensure Tone.js context is started
            if (Tone.context.state !== 'running') {
                await Tone.context.resume();
                console.log('🎵 Audio context resumed');
            }
            
            // Start audio context
            await Tone.start();
            console.log('🎵 Tone.js started, context state:', Tone.context.state);
            
            this.previewStyle();
        });
        
        // Stop button
        document.getElementById('styleStopBtn')?.addEventListener('click', () => {
            this.stopStylePreview();
        });
        
        // Apply buttons
        document.getElementById('styleApplyCurrent')?.addEventListener('click', () => {
            this.applyStyle(false);
        });
        
        document.getElementById('styleApplyAll')?.addEventListener('click', () => {
            this.applyStyle(true);
        });
        
        // Randomize button
        document.getElementById('styleRandomize')?.addEventListener('click', () => {
            this.randomizeStyle();
        });
    }
    
    updateStylePreview() {
        // Update visual preview only (no audio)
        const notes = this.generateStylePattern();
        
        if (notes.length === 0) {
            console.warn('No notes generated for preview');
            return;
        }
        
        console.log(`🎨 Updated preview: ${notes.length} notes`);
        this.drawStylePreview(notes);
    }
    
    previewStyle() {
        console.log('🎹 Previewing style:', this.styleParams.currentStyle);
        
        // Generate preview pattern
        const notes = this.generateStylePattern();
        
        if (notes.length === 0) {
            console.warn('❌ No notes generated for preview');
            return;
        }
        
        console.log(`✅ Generated ${notes.length} preview notes`);
        
        // Store preview notes
        this.stylePreviewNotes = notes;
        
        // Draw preview
        this.drawStylePreview(notes);
        
        // SWITCH MIDI SOURCE TO PREVIEW
        this.channel2MidiSource = 'preview';
        this.channel2PreviewActive = true; // Block main playback
        console.log('🔀 MIDI SOURCE: PREVIEW (main playback blocked)');
        
        // Update UI indicator
        const indicator = document.getElementById('channel2MidiSource');
        if (indicator) {
            indicator.textContent = '🎹 MIDI SOURCE: PREVIEW';
            indicator.style.background = 'rgba(255, 165, 0, 0.1)';
            indicator.style.borderLeftColor = '#ff9800';
            indicator.style.color = '#ff9800';
        }
        
        // Start preview loop
        this.playStylePreview(notes);
    }
    
    generateStylePattern() {
        const style = this.styles[this.styleParams.currentStyle];
        if (!style) {
            console.error('Style not found:', this.styleParams.currentStyle);
            return [];
        }
        
        if (!this.progression || this.progression.length === 0) {
            console.warn('No progression loaded yet');
            return [];
        }
        
        console.log('Generating style pattern:', this.styleParams.currentStyle);
        console.log('Phrase length:', this.styleParams.phraseLength);
        console.log('Progression length:', this.progression.length);
        
        // Collect all chord tones for the phrase
        const allChordTones = [];
        const barsToGenerate = Math.min(this.styleParams.phraseLength, this.progression.length);
        
        for (let barIdx = 0; barIdx < barsToGenerate; barIdx++) {
            const bar = this.progression[barIdx];
            const chordTonesObj = this.getChordTonesForBar(bar);
            
            if (!chordTonesObj || !chordTonesObj.midiNotes || chordTonesObj.midiNotes.length === 0) {
                console.warn('No chord tones for bar', barIdx);
                allChordTones.push([60, 64, 67]); // Default to C major if missing
                continue;
            }
            
            // Apply octave shift
            let chordTones = chordTonesObj.midiNotes.map(m => m + (this.styleParams.octave * 12));
            console.log(`Bar ${barIdx}: ${chordTones.length} chord tones (${chordTones.length}) ${JSON.stringify(chordTones)}`);
            
            allChordTones.push(chordTones);
        }
        
        // Generate complete phrase with all bars at once
        const notes = style.generate(allChordTones, 0, this.styleParams.variation);
        
        console.log(`✅ Generated ${notes.length} notes from ${allChordTones.length} bars`);
        return notes;
    }
    
    drawStylePreview(notes) {
        const canvas = document.getElementById('stylePreview');
        if (!canvas) return;
        
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        
        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        const totalBeats = this.styleParams.phraseLength * 4;
        
        // Draw notes
        ctx.fillStyle = '#00d4ff';
        notes.forEach(note => {
            const x = (note.start / totalBeats) * canvas.width;
            const y = canvas.height - ((note.midi - 48) / 36) * canvas.height;
            const width = Math.max((note.duration / totalBeats) * canvas.width, 2);
            ctx.fillRect(x, y - 2, width, 4);
        });
        
        // Draw bar lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 1; i < this.styleParams.phraseLength; i++) {
            const x = (i * 4 / totalBeats) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
    }
    
    playStylePreview(notes) {
        if (!this.channel2Synth) {
            console.error('❌ Channel 2 synth not initialized!');
            return;
        }
        
        console.log(`🎵 Playing ${notes.length} preview notes on Channel 2 synth`);
        
        // Ensure synth is not muted
        const muteCheckbox = document.getElementById('channel2Mute');
        if (muteCheckbox?.checked) {
            console.warn('⚠️ Channel 2 is MUTED - unmute to hear preview!');
        }
        
        console.log(`🎵 Synth volume: ${this.channel2Synth.volume.value}dB`);
        console.log(`🎵 Context state: ${Tone.context.state}`);
        console.log(`🎵 Transport state: ${Tone.Transport.state}`);
        
        // Reset transport to clean state
        Tone.Transport.stop();
        Tone.Transport.cancel();
        Tone.Transport.position = 0;
        Tone.Transport.bpm.value = this.bpm;
        
        const barDuration = (60 / this.bpm) * 4; // 4 beats per bar
        const totalDuration = this.styleParams.phraseLength * barDuration;
        
        console.log(`⏱️ Tempo: ${this.bpm}bpm, Bar: ${barDuration.toFixed(2)}s, Total: ${totalDuration.toFixed(2)}s`);
        console.log(`📋 First 5 notes:`, notes.slice(0, 5).map(n => `MIDI${n.midi} @${n.start.toFixed(2)}b dur${n.duration.toFixed(2)}b`));
        
        // TEST: Trigger immediate note to verify synth works
        console.log('🧪 TEST: Triggering immediate note C4 (MIDI 60)');
        this.channel2Synth.triggerAttackRelease(Tone.Frequency(60, 'midi'), 0.5, '+0.1', 0.8);
        
        // Schedule notes directly without Part
        notes.forEach((note, idx) => {
            const time = (note.start / 4) * barDuration;
            const duration = (note.duration / 4) * barDuration;
            
            if (idx < 3) {
                console.log(`📋 Note ${idx}: time=${time.toFixed(2)}s, midi=${note.midi}, dur=${duration.toFixed(2)}s`);
            }
            
            const scheduleId = Tone.Transport.schedule((schedTime) => {
                console.log(`🎹 Preview CALLBACK: MIDI ${note.midi} at ${schedTime.toFixed(3)}s (now: ${Tone.now().toFixed(3)})`);
                try {
                    this.channel2Synth.triggerAttackRelease(
                        Tone.Frequency(note.midi, 'midi'),
                        duration,
                        schedTime,
                        note.velocity / 127
                    );
                    console.log(`✅ Triggered successfully`);
                } catch (err) {
                    console.error(`❌ Trigger failed:`, err);
                }
            }, time);
            
            if (idx < 3) {
                console.log(`📌 Scheduled note ${idx} at ${time.toFixed(2)}s, scheduleId:`, scheduleId);
            }
        });
        
        // Loop
        Tone.Transport.scheduleRepeat(() => {
            console.log('🔁 Preview loop restart');
            notes.forEach((note) => {
                const time = (note.start / 4) * barDuration;
                const duration = (note.duration / 4) * barDuration;
                Tone.Transport.schedule((schedTime) => {
                    this.channel2Synth.triggerAttackRelease(
                        Tone.Frequency(note.midi, 'midi'),
                        duration,
                        schedTime,
                        note.velocity / 127
                    );
                }, time);
            });
        }, totalDuration, totalDuration);
        
        console.log('▶️ Starting preview transport in 0.1s...');
        const startTime = Tone.now() + 0.1;
        Tone.Transport.start(startTime);
        
        setTimeout(() => {
            console.log(`✅ Transport started! State: ${Tone.Transport.state}, Position: ${Tone.Transport.seconds.toFixed(2)}s`);
        }, 200);
        
        // Store reference for stopping
        this.stylePreviewLoop = { notes, totalDuration };
    }
    
    stopStylePreview() {
        console.log('⏹️ Stopping style preview');
        
        // SWITCH BACK TO MAIN MIDI SOURCE
        this.channel2MidiSource = 'main';
        this.channel2PreviewActive = false; // Unblock main playback
        console.log('🔀 MIDI SOURCE: MAIN (main playback restored)');
        
        // Update UI indicator
        const indicator = document.getElementById('channel2MidiSource');
        if (indicator) {
            indicator.textContent = '🎹 MIDI SOURCE: MAIN';
            indicator.style.background = 'rgba(0, 255, 0, 0.1)';
            indicator.style.borderLeftColor = '#2ecc71';
            indicator.style.color = '#2ecc71';
        }
        
        // Stop and clear transport
        Tone.Transport.stop();
        Tone.Transport.cancel();
        
        // Release all channel 2 synth voices
        if (this.channel2Synth) {
            this.channel2Synth.releaseAll();
        }
        
        this.stylePreviewLoop = null;
        this.stylePreviewNotes = [];
    }
    
    applyStyle(applyAll = false) {
        console.log(`🎹 Applying style: ${this.styleParams.currentStyle} (${applyAll ? 'ALL' : 'CURRENT'})`);
        
        const notes = this.generateStylePattern();
        
        if (notes.length === 0) {
            console.warn('No notes to apply');
            return;
        }
        
        // Convert to channel2Notes format
        this.channel2Notes = {};
        
        notes.forEach(note => {
            const barIdx = Math.floor(note.start / 4);
            const relativeStart = (note.start % 4) / 4; // 0-1 within bar
            
            if (!this.channel2Notes[barIdx]) {
                this.channel2Notes[barIdx] = [];
            }
            
            this.channel2Notes[barIdx].push({
                midi: note.midi,
                start: relativeStart,
                duration: note.duration,
                velocity: note.velocity
            });
        });
        
        this.buildGrid();
        this.updateChannel2SyncStatus();
        console.log(`✅ Applied style to ${Object.keys(this.channel2Notes).length} bars`);
    }
    
    randomizeStyle() {
        const styles = Object.keys(this.styles);
        this.styleParams.currentStyle = styles[Math.floor(Math.random() * styles.length)];
        this.styleParams.variation = Math.floor(Math.random() * 100);
        this.styleParams.octave = Math.floor(Math.random() * 5) - 2;
        
        // Update UI
        document.getElementById('styleSelector').value = this.styleParams.currentStyle;
        document.getElementById('styleVariationSlider').value = this.styleParams.variation;
        document.getElementById('styleVariation').textContent = this.styleParams.variation + '%';
        document.getElementById('styleOctaveSlider').value = this.styleParams.octave;
        document.getElementById('styleOctave').textContent = this.styleParams.octave;
        
        const style = this.styles[this.styleParams.currentStyle];
        document.getElementById('styleDescription').textContent = style.description;
        
        console.log(`🎲 Randomized: ${this.styleParams.currentStyle}`);
        
        // Auto-preview
        this.previewStyle();
    }
    
    previewGenerative() {
        // Stop existing preview first
        if (this.generativePreviewLoop) {
            this.generativePreviewLoop.stop();
            this.generativePreviewLoop.dispose();
            this.generativePreviewLoop = null;
        }
        
        const canvas = document.getElementById('generativePreview');
        canvas.style.display = 'block';
        const ctx = canvas.getContext('2d');
        
        // Clear canvas
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Generate preview notes
        const previewNotes = this.generateGenerativePreview();
        
        console.log(`Generated ${previewNotes.length} preview notes`);
        if (previewNotes.length > 0) {
            console.log('First note:', previewNotes[0]);
        }
        
        // Draw notes
        ctx.fillStyle = '#00d4ff';
        previewNotes.forEach(note => {
            const x = (note.start / this.generativeParams.phraseLength) * canvas.width;
            const y = canvas.height - ((note.midi - 48) / 36) * canvas.height;
            const width = (note.duration / this.generativeParams.phraseLength) * canvas.width;
            
            ctx.fillRect(x, y - 2, Math.max(width, 2), 4);
        });
        
        // Draw bar lines
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        for (let i = 1; i < this.generativeParams.phraseLength; i++) {
            const x = (i / this.generativeParams.phraseLength) * canvas.width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Play audio preview
        this.playGenerativePreview(previewNotes);
    }
    
    playGenerativePreview(notes) {
        // Stop any existing preview
        if (this.generativePreviewLoop) {
            this.generativePreviewLoop.stop();
            this.generativePreviewLoop.dispose();
            this.generativePreviewLoop = null;
        }
        
        // Mute normal playback
        this.generativePreviewActive = true;
        
        // Use Channel 2 synth
        if (!this.channel2Synth) {
            console.warn('Channel 2 synth not initialized');
            return;
        }
        
        // Schedule notes (filter out invalid notes)
        const phraseLength = this.generativeParams.phraseLength;
        const validNotes = notes.filter(n => n.midi && n.duration && n.velocity);
        
        if (validNotes.length === 0) {
            console.warn('No valid notes to preview');
            return;
        }
        
        // Convert notes to Tone.js format (bars to seconds)
        const barDuration = Tone.Time('1m').toSeconds();
        
        const part = new Tone.Part((time, note) => {
            if (note.midi && note.duration) {
                this.channel2Synth.triggerAttackRelease(
                    Tone.Frequency(note.midi, 'midi'),
                    note.duration * barDuration,
                    time,
                    (note.velocity || 80) / 127
                );
            }
        }, validNotes.map(n => ({
            time: n.start * barDuration,
            midi: n.midi,
            duration: n.duration,
            velocity: n.velocity || 80
        })));
        
        part.loop = true;
        part.loopEnd = phraseLength * barDuration;
        part.start(0);
        
        this.generativePreviewLoop = part;
        
        // Start transport if not playing
        if (Tone.Transport.state !== 'started') {
            Tone.Transport.start();
        }
    }
    
    stopGenerativePreview() {
        if (this.generativePreviewLoop) {
            this.generativePreviewLoop.stop();
            this.generativePreviewLoop.dispose();
            this.generativePreviewLoop = null;
        }
        
        // Unmute normal playback
        this.generativePreviewActive = false;
    }
    
    updateChannel2Envelope(shortEnvelope) {
        if (!this.channel2Synth) return;
        
        if (shortEnvelope) {
            // Short, tight envelope - no release tail
            this.channel2Synth.set({
                envelope: {
                    attack: 0.001,
                    decay: 0.05,
                    sustain: 0.9,
                    release: 0.01
                }
            });
            console.log('✂️ Short envelope enabled');
        } else {
            // Normal envelope with release
            this.channel2Synth.set({
                envelope: {
                    attack: 0.02,
                    decay: 0.1,
                    sustain: 0.3,
                    release: 0.5
                }
            });
            console.log('🎵 Normal envelope restored');
        }
    }
    
    generateGenerativePreview() {
        const notes = [];
        const barsToPreview = Math.min(this.generativeParams.phraseLength, this.progression.length);
        
        for (let barIdx = 0; barIdx < barsToPreview; barIdx++) {
            const bar = this.progression[barIdx];
            const chordTonesObj = this.getChordTonesForBar(bar);
            if (!chordTonesObj) continue;
            
            const chordTones = chordTonesObj.midiNotes || [];
            if (chordTones.length === 0) continue;
            
            // Determine note divisions based on features
            let notesPerBar = this.generativeParams.density;
            if (this.generativeFeatures['8ths']) notesPerBar = 8;
            if (this.generativeFeatures['16ths']) notesPerBar = 16;
            if (this.generativeFeatures.triplets) notesPerBar = 12; // 3 per beat
            
            const stepDuration = 1.0 / notesPerBar;
            let previousNote = notes.length > 0 ? notes[notes.length - 1].midi : null;
            
            const nextChordTonesObj = barIdx < barsToPreview - 1 ? 
                this.getChordTonesForBar(this.progression[barIdx + 1]) : null;
            const nextChordTones = nextChordTonesObj ? nextChordTonesObj.midiNotes : null;
            
            // Arpeggio mode
            let arpIndex = 0;
            const sortedChordTones = [...chordTones].sort((a, b) => a - b);
            
            for (let i = 0; i < notesPerBar; i++) {
                // Random rests feature
                if (this.generativeFeatures.rests && Math.random() < 0.3) {
                    continue;
                }
                
                // Skip intervals feature (every N notes)
                if (this.generativeFeatures.intervals && i % 3 === 1) {
                    continue;
                }
                
                let midi;
                
                // Arpeggio modes
                if (this.generativeFeatures.arp_up) {
                    midi = sortedChordTones[arpIndex % sortedChordTones.length];
                    arpIndex++;
                } else if (this.generativeFeatures.arp_down) {
                    midi = sortedChordTones[sortedChordTones.length - 1 - (arpIndex % sortedChordTones.length)];
                    arpIndex++;
                } else {
                    // Random note from chord
                    midi = chordTones[Math.floor(Math.random() * chordTones.length)];
                }
                
                if (midi) {
                    // Apply octave shift
                    midi += (this.generativeParams.octaveShift * 12);
                    
                    // Calculate note start position in bars (absolute time)
                    let noteStart = barIdx + (i * stepDuration);
                    
                    // Swing timing feature
                    if (this.generativeFeatures.swing && i % 2 === 1) {
                        noteStart += stepDuration * 0.15;
                    }
                    
                    // Apply syncopation (shift timing)
                    if (this.generativeParams.syncopation > 0 && Math.random() * 100 < this.generativeParams.syncopation) {
                        noteStart += stepDuration * 0.25;
                    }
                    
                    // Note length
                    let noteDuration = this.generativeParams.noteLength;
                    
                    // Velocity variation feature
                    let velocity = 85;
                    if (this.generativeFeatures.velocity) {
                        velocity = Math.floor(Math.random() * 40) + 60; // 60-100
                    }
                    
                    previousNote = midi;
                    notes.push({
                        midi: midi,
                        start: noteStart,
                        duration: noteDuration,
                        velocity: velocity
                    });
                    
                    // Chord stacks feature - add harmony notes
                    if (this.generativeFeatures.chords && Math.random() < 0.4) {
                        const intervals = [3, 4, 7]; // 3rd, 4th, 5th
                        const interval = intervals[Math.floor(Math.random() * intervals.length)];
                        notes.push({
                            midi: midi + interval,
                            start: noteStart,
                            duration: noteDuration,
                            velocity: velocity - 10
                        });
                    }
                }
            }
        }
        
        return notes;
    }
    
    applyGenerative(applyAll = false) {
        console.log(`🎲 Applying generative pattern... (${applyAll ? 'ALL' : 'CURRENT'})`);
        
        // Stop preview
        this.stopGenerativePreview();
        
        if (applyAll) {
            // Apply to all patterns
            const currentPattern = this.currentPattern;
            
            Object.keys(this.patterns).forEach(patternId => {
                this.currentPattern = patternId;
                const pattern = this.patterns[patternId];
                if (pattern && pattern.progression) {
                    this.progression = pattern.progression;
                    
                    // Generate for this pattern
                    this.generateGenerativeForPattern();
                    
                    // Save to pattern
                    pattern.channel2Notes = JSON.parse(JSON.stringify(this.channel2Notes));
                    console.log(`  ✅ Applied to ${patternId}`);
                }
            });
            
            // Restore original pattern
            const restorePattern = this.patterns[currentPattern];
            if (restorePattern) {
                this.progression = restorePattern.progression;
                this.channel2Notes = restorePattern.channel2Notes || {};
                this.currentPattern = currentPattern;
            }
            
            this.buildGrid();
            this.updateChannel2SyncStatus();
            console.log(`✅ Applied generative to ALL patterns`);
        } else {
            // Apply to current pattern only
            this.generateGenerativeForPattern();
            this.buildGrid();
            this.updateChannel2SyncStatus();
            console.log(`✅ Applied generative to current pattern`);
        }
    }
    
    generateGenerativeForPattern() {
        // Apply the generated pattern to channel 2
        this.channel2Notes = {};
        
        const barsToGenerate = Math.min(this.generativeParams.phraseLength, this.progression.length);
        
        for (let barIdx = 0; barIdx < barsToGenerate; barIdx++) {
            this.channel2Notes[barIdx] = [];
            const bar = this.progression[barIdx];
            const chordTonesObj = this.getChordTonesForBar(bar);
            if (!chordTonesObj) continue;
            
            const chordTones = chordTonesObj.midiNotes || [];
            if (chordTones.length === 0) continue;
            
            // Determine note divisions based on features
            let notesPerBar = this.generativeParams.density;
            if (this.generativeFeatures['8ths']) notesPerBar = 8;
            if (this.generativeFeatures['16ths']) notesPerBar = 16;
            if (this.generativeFeatures.triplets) notesPerBar = 12;
            
            const stepDuration = 1.0 / notesPerBar;
            let previousNote = barIdx > 0 && this.channel2Notes[barIdx - 1].length > 0 ? 
                this.channel2Notes[barIdx - 1][this.channel2Notes[barIdx - 1].length - 1].midi : null;
            
            const nextChordTonesObj = barIdx < barsToGenerate - 1 ? 
                this.getChordTonesForBar(this.progression[barIdx + 1]) : null;
            const nextChordTones = nextChordTonesObj ? nextChordTonesObj.midiNotes : null;
            
            // Arpeggio mode
            let arpIndex = 0;
            const sortedChordTones = [...chordTones].sort((a, b) => a - b);
            
            for (let i = 0; i < notesPerBar; i++) {
                // Random rests feature
                if (this.generativeFeatures.rests && Math.random() < 0.3) {
                    continue;
                }
                
                // Skip intervals feature
                if (this.generativeFeatures.intervals && i % 3 === 1) {
                    continue;
                }
                
                let midi;
                
                // Arpeggio modes
                if (this.generativeFeatures.arp_up) {
                    midi = sortedChordTones[arpIndex % sortedChordTones.length];
                    arpIndex++;
                } else if (this.generativeFeatures.arp_down) {
                    midi = sortedChordTones[sortedChordTones.length - 1 - (arpIndex % sortedChordTones.length)];
                    arpIndex++;
                } else {
                    // Random note from chord
                    midi = chordTones[Math.floor(Math.random() * chordTones.length)];
                }
                
                if (midi) {
                    // Apply octave shift
                    midi += (this.generativeParams.octaveShift * 12);
                    
                    // Calculate note start position (relative to bar)
                    let noteStart = i * stepDuration;
                    
                    // Swing timing feature
                    if (this.generativeFeatures.swing && i % 2 === 1) {
                        noteStart += stepDuration * 0.15;
                    }
                    
                    // Apply syncopation
                    if (this.generativeParams.syncopation > 0 && Math.random() * 100 < this.generativeParams.syncopation) {
                        noteStart += stepDuration * 0.25;
                    }
                    
                    // Note length
                    let noteDuration = this.generativeParams.noteLength;
                    
                    // Velocity variation feature
                    let velocity = 85;
                    if (this.generativeFeatures.velocity) {
                        velocity = Math.floor(Math.random() * 40) + 60;
                    }
                    
                    previousNote = midi;
                    this.channel2Notes[barIdx].push({
                        midi: midi,
                        start: noteStart,
                        duration: noteDuration,
                        velocity: velocity
                    });
                    
                    // Chord stacks feature
                    if (this.generativeFeatures.chords && Math.random() < 0.4) {
                        const intervals = [3, 4, 7];
                        const interval = intervals[Math.floor(Math.random() * intervals.length)];
                        this.channel2Notes[barIdx].push({
                            midi: midi + interval,
                            start: noteStart,
                            duration: noteDuration,
                            velocity: velocity - 10
                        });
                    }
                }
            }
        }
    }
    
    randomizeGenerativeParams() {
        this.generativeParams.stepwise = Math.floor(Math.random() * 60) + 40; // 40-100
        this.generativeParams.density = Math.floor(Math.random() * 29) + 2; // 2-30
        this.generativeParams.randomness = Math.floor(Math.random() * 50) + 10; // 10-60
        this.generativeParams.noteLength = (Math.random() * 3.5) + 0.2; // 0.2-3.7 bars
        this.generativeParams.syncopation = Math.floor(Math.random() * 60); // 0-60
        this.generativeParams.octaveShift = Math.floor(Math.random() * 5) - 2; // -2 to 2
        
        // Update UI
        document.getElementById('stepwiseMotion').value = this.generativeParams.stepwise;
        document.getElementById('stepwiseValue').textContent = this.generativeParams.stepwise + '%';
        document.getElementById('generativeDensity').value = this.generativeParams.density;
        document.getElementById('densityValue').textContent = this.generativeParams.density;
        document.getElementById('randomness').value = this.generativeParams.randomness;
        document.getElementById('randomnessValue').textContent = this.generativeParams.randomness + '%';
        document.getElementById('noteLength').value = this.generativeParams.noteLength.toFixed(1);
        document.getElementById('noteLengthValue').textContent = this.generativeParams.noteLength.toFixed(1) + ' bars';
        document.getElementById('syncopation').value = this.generativeParams.syncopation;
        document.getElementById('syncopationValue').textContent = this.generativeParams.syncopation + '%';
        document.getElementById('octaveShift').value = this.generativeParams.octaveShift;
        document.getElementById('octaveShiftValue').textContent = this.generativeParams.octaveShift;
        
        // Auto-preview
        this.previewGenerative();
    }
    
    openPresetMenu() {
        const menu = document.getElementById('channel2PresetMenu');
        const overlay = document.getElementById('channel2PresetOverlay');
        
        if (menu && overlay) {
            menu.style.display = 'flex';
            overlay.style.display = 'block';
            
            // Sync modal settings with sidebar
            document.getElementById('channel2ModalSource').value = this.channel2Source;
            document.getElementById('channel2ModalDensity').value = this.channel2Density;
            document.getElementById('channel2ModalOctaves').value = this.channel2OctaveRange;
            
            // Build tree and cards
            this.buildTreeNav('category');
            this.showAllPresetCards();
        }
    }
    
    closePresetMenu() {
        const modal = document.getElementById('channel2PresetMenu');
        const overlay = document.getElementById('channel2PresetOverlay');
        if (modal) modal.style.display = 'none';
        if (overlay) overlay.style.display = 'none';
        
        // Stop preview when closing
        this.stopPreview();
        
        // Restore previous state if preview was active
        if (this.previewState) {
            this.channel2CurrentPreset = this.previewState.previousPreset;
            this.channel2Notes = this.previewState.previousNotes;
            this.previewState = null;
            this.buildGrid();
        }
    }
    
    buildTreeNav(view) {
        const treeContainer = document.getElementById('channel2TreeNav');
        if (!treeContainer) {
            console.warn('Tree container not found');
            return;
        }
        
        console.log(`Building tree nav with ${this.channel2Presets.length} presets`);
        treeContainer.innerHTML = '';
        
        if (this.channel2Presets.length === 0) {
            treeContainer.innerHTML = '<div style="color: #888; padding: 1rem;">No presets loaded</div>';
            return;
        }
        
        if (view === 'category') {
            // Group by category
            const categories = {};
            this.channel2Presets.forEach(preset => {
                if (!categories[preset.category]) {
                    categories[preset.category] = [];
                }
                categories[preset.category].push(preset);
            });
            
            console.log('Categories:', Object.keys(categories));
            
            // All presets option
            const allItem = this.createTreeItem('📊 All', this.channel2Presets.length, () => {
                this.showAllPresetCards();
            });
            treeContainer.appendChild(allItem);
            
            // Category items
            Object.keys(categories).sort().forEach(cat => {
                const catItem = this.createTreeItem(
                    this.getCategoryIcon(cat) + ' ' + cat.replace(/_/g, ' '),
                    categories[cat].length,
                    () => {
                        this.showPresetsByCategory(cat);
                    },
                    categories[cat]
                );
                treeContainer.appendChild(catItem);
            });
        }
        // Add other views later (feel, density, era, flat)
    }
    
    getCategoryIcon(category) {
        const icons = {
            'piano': '🎹',
            'guitar_strum': '🎸',
            'bass': '🎸',
            'synth_arpeggio': '🎵',
            'pads': '🎹',
            'melody': '🎶',
            'staccato': '⚡',
            'ostinato': '🔁',
            'percussive': '🥁',
            'experimental': '🎲'
        };
        return icons[category] || '🎵';
    }
    
    createTreeItem(label, count, onClick, children = null) {
        const item = document.createElement('div');
        item.style.marginBottom = '0.25rem';
        
        const header = document.createElement('div');
        header.style.cssText = 'padding: 0.5rem; cursor: pointer; border-radius: 4px; display: flex; justify-content: space-between; align-items: center;';
        header.innerHTML = `
            <span>${children ? '▶ ' : ''}${label}</span>
            <span style="color: #666; font-size: 0.85rem;">(${count})</span>
        `;
        
        header.addEventListener('click', onClick);
        
        header.addEventListener('mouseenter', () => {
            header.style.background = '#2a2a2a';
        });
        
        header.addEventListener('mouseleave', () => {
            header.style.background = 'transparent';
        });
        
        item.appendChild(header);
        
        // Add children if expandable
        if (children) {
            const childContainer = document.createElement('div');
            childContainer.style.cssText = 'display: none; padding-left: 1rem; margin-top: 0.25rem;';
            
            children.forEach(preset => {
                const childItem = document.createElement('div');
                childItem.style.cssText = 'padding: 0.25rem 0.5rem; cursor: pointer; border-radius: 4px; font-size: 0.85rem;';
                childItem.textContent = '• ' + preset.humanName.split('•')[1].trim();
                
                childItem.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectPresetInModal(preset.id);
                });
                
                childItem.addEventListener('mouseenter', () => {
                    childItem.style.background = '#2a2a2a';
                });
                
                childItem.addEventListener('mouseleave', () => {
                    childItem.style.background = 'transparent';
                });
                
                childContainer.appendChild(childItem);
            });
            
            item.appendChild(childContainer);
            
            // Toggle expand/collapse
            let expanded = false;
            header.addEventListener('click', () => {
                expanded = !expanded;
                childContainer.style.display = expanded ? 'block' : 'none';
                header.querySelector('span').textContent = (expanded ? '▼ ' : '▶ ') + label;
            });
        }
        
        return item;
    }
    
    showAllPresetCards() {
        this.showPresetCards(this.channel2Presets);
    }
    
    showPresetsByCategory(category) {
        const filtered = this.channel2Presets.filter(p => p.category === category);
        this.showPresetCards(filtered);
    }
    
    showPresetCards(presets) {
        const listContainer = document.getElementById('channel2PresetList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        presets.forEach(preset => {
            const card = document.createElement('div');
            card.style.cssText = 'background: #0a0a0a; border: 2px solid transparent; border-radius: 8px; padding: 1rem; cursor: pointer; transition: all 0.2s; display: flex; flex-direction: column; height: 180px;';
            card.dataset.presetId = preset.id;
            
            // Check if selected
            if (this.selectedPresetForModal?.id === preset.id) {
                card.style.borderColor = '#00d4ff';
                card.style.background = '#1a2a3a';
            }
            
            // Icon
            const icon = document.createElement('div');
            icon.style.cssText = 'font-size: 2rem; margin-bottom: 0.5rem;';
            icon.textContent = this.getCategoryIcon(preset.category);
            card.appendChild(icon);
            
            // Name
            const name = document.createElement('div');
            name.style.cssText = 'font-weight: bold; font-size: 0.9rem; margin-bottom: 0.5rem; flex: 1;';
            name.textContent = preset.humanName.split('•')[1]?.trim() || preset.humanName;
            card.appendChild(name);
            
            // Tags
            const tags = document.createElement('div');
            tags.style.cssText = 'font-size: 0.75rem; color: #666;';
            tags.textContent = preset.feelTags.slice(0, 2).join(' • ');
            card.appendChild(tags);
            
            // Click handler
            card.addEventListener('click', () => {
                this.selectPresetInModal(preset.id);
            });
            
            // Hover effect
            card.addEventListener('mouseenter', () => {
                if (this.selectedPresetForModal?.id !== preset.id) {
                    card.style.borderColor = '#00d4ff';
                }
            });
            
            card.addEventListener('mouseleave', () => {
                if (this.selectedPresetForModal?.id !== preset.id) {
                    card.style.borderColor = 'transparent';
                }
            });
            
            listContainer.appendChild(card);
        });
    }
    
    selectPresetInModal(presetId) {
        const preset = this.channel2Presets.find(p => p.id === presetId);
        if (!preset) return;
        
        this.selectedPresetForModal = preset;
        
        // Update modal settings with preset defaults
        document.getElementById('channel2ModalSource').value = 'midi'; // Always use MIDI for better tuning
        document.getElementById('channel2ModalDensity').value = 'medium';
        document.getElementById('channel2ModalOctaves').value = Math.round(preset.spread || 1);
        
        // Re-render current view
        const currentCards = Array.from(document.querySelectorAll('#channel2PresetList [data-preset-id]'));
        currentCards.forEach(card => {
            if (card.dataset.presetId === presetId) {
                card.style.borderColor = '#00d4ff';
                card.style.background = '#1a2a3a';
            } else {
                card.style.borderColor = 'transparent';
                card.style.background = '#0a0a0a';
            }
        });
        
        // LIVE PREVIEW: Generate and show immediately
        this.previewPreset(preset);
    }
    
    previewPreset(preset) {
        // Store previous state for restore (only once)
        if (!this.previewState) {
            this.previewState = {
                previousPreset: this.channel2CurrentPreset,
                previousNotes: JSON.parse(JSON.stringify(this.channel2Notes))
            };
        }
        
        // Apply preset temporarily
        this.channel2CurrentPreset = preset;
        this.channel2Source = document.getElementById('channel2ModalSource').value;
        this.channel2Density = document.getElementById('channel2ModalDensity').value;
        this.channel2OctaveRange = parseInt(document.getElementById('channel2ModalOctaves').value);
        
        // Generate preview (only first 2 bars for speed)
        const previewNotes = {};
        const notesPerBar = preset.noteDensity[this.channel2Density] || 4;
        
        for (let barIndex = 0; barIndex < Math.min(2, this.progression.length); barIndex++) {
            const bar = this.progression[barIndex];
            previewNotes[barIndex] = [];
            
            const chordTones = this.getChordTonesForBar(bar);
            if (!chordTones || chordTones.length === 0) continue;
            
            const voicedNotes = this.applyVoicingTemplate(chordTones, preset.voicingTemplate);
            const stepDuration = 1.0 / notesPerBar;
            
            for (let i = 0; i < notesPerBar; i++) {
                const noteIndex = i % voicedNotes.length;
                const midi = voicedNotes[noteIndex];
                const timingOffset = preset.timingOffsets && preset.timingOffsets[i % preset.timingOffsets.length] || 0;
                const velocity = preset.velocityProfile && preset.velocityProfile[i % preset.velocityProfile.length] || 80;
                
                previewNotes[barIndex].push({
                    midi: midi,
                    start: (i * stepDuration) + timingOffset,
                    duration: stepDuration * (preset.legato || 0.8),
                    velocity: velocity
                });
            }
        }
        
        // Play preview (don't update grid - keep original visible)
        this.playPreviewLoop(previewNotes);
    }
    
    generatePreviewNotes(numBars = 2) {
        this.channel2Notes = {};
        
        if (!this.channel2CurrentPreset || !this.channel2CurrentPreset.voicingTemplate) {
            return;
        }
        
        const preset = this.channel2CurrentPreset;
        const notesPerBar = preset.noteDensity[this.channel2Density] || 4;
        
        // Generate only first few bars for preview
        for (let barIndex = 0; barIndex < Math.min(numBars, this.progression.length); barIndex++) {
            const bar = this.progression[barIndex];
            this.channel2Notes[barIndex] = [];
            
            const chordTones = this.getChordTonesForBar(bar);
            if (!chordTones || chordTones.length === 0) continue;
            
            const voicedNotes = this.applyVoicingTemplate(chordTones, preset.voicingTemplate);
            const stepDuration = 1.0 / notesPerBar;
            
            for (let i = 0; i < notesPerBar; i++) {
                const noteIndex = i % voicedNotes.length;
                const midi = voicedNotes[noteIndex];
                const timingOffset = preset.timingOffsets && preset.timingOffsets[i % preset.timingOffsets.length] || 0;
                const velocity = preset.velocityProfile && preset.velocityProfile[i % preset.velocityProfile.length] || 80;
                
                this.channel2Notes[barIndex].push({
                    midi: midi,
                    start: (i * stepDuration) + timingOffset,
                    duration: stepDuration * (preset.legato || 0.8),
                    velocity: velocity
                });
            }
        }
    }
    
    playPreviewLoop(previewNotes) {
        if (!this.channel2Synth) return;
        
        // Stop any current preview
        this.stopPreview();
        
        // Check if we should mute main Channel 2
        const muteCheckbox = document.getElementById('muteMainDuringPreview');
        if (muteCheckbox && muteCheckbox.checked) {
            this.channel2PreviewActive = true;
        }
        
        const barDuration = (60 / this.bpm) * 4; // 4 beats
        const numBars = Object.keys(previewNotes).length;
        if (numBars === 0) return;
        
        // Play loop
        const playLoop = () => {
            Object.keys(previewNotes).forEach(barIdx => {
                const notes = previewNotes[barIdx];
                const barOffset = parseInt(barIdx) * barDuration;
                
                notes.forEach(note => {
                    const startTime = Tone.now() + barOffset + (note.start * barDuration);
                    const duration = note.duration * barDuration;
                    const freq = Tone.Frequency(note.midi, 'midi').toFrequency();
                    
                    this.channel2Synth.triggerAttackRelease(freq, duration, startTime, note.velocity / 127);
                });
            });
            
            // Schedule next loop
            this.previewLoopTimeout = setTimeout(playLoop, numBars * barDuration * 1000);
        };
        
        playLoop();
    }
    
    stopPreview() {
        if (this.previewLoopTimeout) {
            clearTimeout(this.previewLoopTimeout);
            this.previewLoopTimeout = null;
        }
        
        // Unmute main Channel 2
        this.channel2PreviewActive = false;
    }
    
    applyModalPreset(applyAll = false) {
        if (!this.selectedPresetForModal) {
            this.showChannel2Status('⚠️ Please select a preset first', 'warning');
            return;
        }
        
        // Get settings from modal
        this.channel2Source = document.getElementById('channel2ModalSource').value;
        this.channel2Density = document.getElementById('channel2ModalDensity').value;
        this.channel2OctaveRange = parseInt(document.getElementById('channel2ModalOctaves').value);
        
        // Apply preset permanently
        this.channel2CurrentPreset = this.selectedPresetForModal;
        
        if (applyAll) {
            // Generate for ALL patterns
            console.log('🔄 Applying to ALL patterns...');
            const currentPattern = this.currentPattern;
            
            // Apply to each pattern
            Object.keys(this.patterns).forEach(patternId => {
                // Switch to pattern
                this.currentPattern = patternId;
                const pattern = this.patterns[patternId];
                if (pattern && pattern.progression) {
                    this.progression = pattern.progression;
                    
                    // Generate for this pattern
                    if (this.channel2CurrentPreset && this.channel2CurrentPreset.voicingTemplate) {
                        this.generateFromPreset();
                    } else {
                        this.generateChannel2Pattern();
                    }
                    
                    // Save to pattern
                    pattern.channel2Notes = JSON.parse(JSON.stringify(this.channel2Notes));
                    pattern.channel2Settings = {
                        source: this.channel2Source,
                        style: this.channel2Style,
                        pattern: this.channel2Pattern,
                        density: this.channel2Density,
                        octaveRange: this.channel2OctaveRange
                    };
                    
                    console.log(`  ✅ Applied to ${patternId}: ${Object.keys(this.channel2Notes).length} bars`);
                }
            });
            
            // Restore original pattern (this will reload channel2Notes from the pattern)
            const restorePattern = this.patterns[currentPattern];
            if (restorePattern) {
                this.progression = restorePattern.progression;
                this.channel2Notes = restorePattern.channel2Notes || {};
                this.currentPattern = currentPattern;
            }
            
            // Update display and sync status
            this.buildGrid();
            this.updateChannel2Display();
            this.updateChannel2SyncStatus();
            
            console.log(`✅ Applied preset to ALL patterns: ${this.selectedPresetForModal.humanName}`);
        } else {
            // Generate for current pattern only (8 bars)
            if (this.channel2CurrentPreset && this.channel2CurrentPreset.voicingTemplate) {
                this.generateFromPreset(8); // Limit to 8 bars
            } else {
                this.generateChannel2PatternLimited(8);
            }
            console.log(`✅ Applied preset to CURRENT pattern (8 bars): ${this.selectedPresetForModal.humanName}`);
        }
        
        // Clear preview state
        this.previewState = null;
        
        // Sync sidebar
        document.querySelectorAll('input[name="channel2Source"]').forEach(radio => {
            radio.checked = radio.value === this.channel2Source;
        });
        document.getElementById('channel2Density').value = this.channel2Density;
        document.getElementById('channel2OctaveRange').value = this.channel2OctaveRange;
        
        // Update display
        this.updateChannel2Display();
        
        // Close modal
        this.closePresetMenu();
    }
    
    generateChannel2PatternLimited(maxBars) {
        this.channel2Notes = {};
        
        if (!this.channel2CurrentPreset || !this.channel2CurrentPreset.voicingTemplate) {
            return;
        }
        
        const preset = this.channel2CurrentPreset;
        const notesPerBar = preset.noteDensity[this.channel2Density] || 4;
        
        for (let barIndex = 0; barIndex < Math.min(maxBars, this.progression.length); barIndex++) {
            const bar = this.progression[barIndex];
            this.channel2Notes[barIndex] = [];
            
            const chordTones = this.getChordTonesForBar(bar);
            if (!chordTones || chordTones.length === 0) continue;
            
            const voicedNotes = this.applyVoicingTemplate(chordTones, preset.voicingTemplate);
            const stepDuration = 1.0 / notesPerBar;
            
            for (let i = 0; i < notesPerBar; i++) {
                const noteIndex = i % voicedNotes.length;
                const midi = voicedNotes[noteIndex];
                const timingOffset = preset.timingOffsets && preset.timingOffsets[i % preset.timingOffsets.length] || 0;
                const velocity = preset.velocityProfile && preset.velocityProfile[i % preset.velocityProfile.length] || 80;
                
                this.channel2Notes[barIndex].push({
                    midi: midi,
                    start: (i * stepDuration) + timingOffset,
                    duration: stepDuration * (preset.legato || 0.8),
                    velocity: velocity
                });
            }
        }
        
        this.buildGrid();
    }
    
    populatePresetMenu() {
        const listContainer = document.getElementById('channel2PresetList');
        if (!listContainer) return;
        
        listContainer.innerHTML = '';
        
        // Group presets by category
        const categories = {};
        this.channel2Presets.forEach(preset => {
            if (!categories[preset.category]) {
                categories[preset.category] = [];
            }
            categories[preset.category].push(preset);
        });
        
        // Render each category
        Object.keys(categories).sort().forEach(category => {
            const categoryDiv = document.createElement('div');
            categoryDiv.style.marginBottom = '1rem';
            
            // Category header
            const header = document.createElement('div');
            header.style.cssText = 'font-weight: bold; color: #00d4ff; margin-bottom: 0.5rem; text-transform: uppercase; font-size: 0.9rem;';
            header.textContent = category.replace(/_/g, ' ');
            categoryDiv.appendChild(header);
            
            // Presets in category
            categories[category].forEach(preset => {
                const presetItem = document.createElement('div');
                presetItem.style.cssText = 'background: #0a0a0a; padding: 0.75rem; margin-bottom: 0.5rem; border-radius: 4px; cursor: pointer; border: 2px solid transparent; transition: all 0.2s;';
                presetItem.dataset.presetId = preset.id;
                
                // Check if active
                if (this.channel2CurrentPreset && this.channel2CurrentPreset.id === preset.id) {
                    presetItem.style.borderColor = '#00d4ff';
                    presetItem.style.background = '#1a2a3a';
                }
                
                // Preset name
                const name = document.createElement('div');
                name.style.cssText = 'font-weight: bold; margin-bottom: 0.25rem;';
                name.textContent = preset.humanName + (this.channel2CurrentPreset?.id === preset.id ? ' ✓' : '');
                presetItem.appendChild(name);
                
                // Preset description
                const desc = document.createElement('div');
                desc.style.cssText = 'font-size: 0.85rem; color: #888;';
                desc.textContent = preset.description;
                presetItem.appendChild(desc);
                
                // Tags
                const tags = document.createElement('div');
                tags.style.cssText = 'font-size: 0.75rem; color: #666; margin-top: 0.25rem;';
                tags.textContent = preset.feelTags.join(' • ');
                presetItem.appendChild(tags);
                
                // Click handler
                presetItem.addEventListener('click', () => {
                    this.applyChannel2Preset(preset.id);
                    this.closePresetMenu();
                });
                
                // Hover effect
                presetItem.addEventListener('mouseenter', () => {
                    if (this.channel2CurrentPreset?.id !== preset.id) {
                        presetItem.style.borderColor = '#00d4ff';
                    }
                });
                
                presetItem.addEventListener('mouseleave', () => {
                    if (this.channel2CurrentPreset?.id !== preset.id) {
                        presetItem.style.borderColor = 'transparent';
                    }
                });
                
                categoryDiv.appendChild(presetItem);
            });
            
            listContainer.appendChild(categoryDiv);
        });
    }
    
    filterPresets(query) {
        const items = document.querySelectorAll('#channel2PresetList [data-preset-id]');
        const lowerQuery = query.toLowerCase();
        
        items.forEach(item => {
            const text = item.textContent.toLowerCase();
            item.style.display = text.includes(lowerQuery) ? 'block' : 'none';
        });
    }
    
    selectRandomPreset() {
        if (this.channel2Presets.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.channel2Presets.length);
        const randomPreset = this.channel2Presets[randomIndex];
        
        this.applyChannel2Preset(randomPreset.id);
        this.showChannel2Status(`🎲 Random: ${randomPreset.humanName}`, 'success');
    }
    
    updateChannel2Display() {
        const displayEl = document.getElementById('channel2CurrentDisplay');
        const detailsEl = document.getElementById('channel2CurrentDetails');
        
        if (displayEl) {
            if (this.channel2CurrentPreset) {
                displayEl.textContent = this.channel2CurrentPreset.humanName;
            } else {
                displayEl.textContent = `${this.channel2Style} • ${this.channel2Pattern}`;
            }
        }
        
        if (detailsEl) {
            const densityLabels = {
                'sparse': 'Sparse',
                'medium': 'Medium',
                'dense': 'Dense',
                'verydense': 'Very Dense'
            };
            detailsEl.textContent = `${densityLabels[this.channel2Density]} density • ${this.channel2OctaveRange} Octave${this.channel2OctaveRange > 1 ? 's' : ''}`;
        }
    }
    
    updateStylesBySource() {
        const styleSelect = document.getElementById('channel2Style');
        if (!styleSelect) return;
        
        const chordStyles = [
            { value: 'piano', label: '🎹 Piano' },
            { value: 'strumming', label: '🎸 Guitar' },
            { value: 'bass', label: '🎸 Bass' },
            { value: 'arpeggio', label: '🎵 Arpeggio' },
            { value: 'pads', label: '🎹 Pads' }
        ];
        
        const midiStyles = [
            { value: 'melody', label: '🎶 Melody' },
            { value: 'staccato', label: '⚡ Staccato' },
            { value: 'ostinato', label: '🔁 Ostinato' }
        ];
        
        const styles = this.channel2Source === 'chords' ? chordStyles : midiStyles;
        
        styleSelect.innerHTML = '';
        styles.forEach(style => {
            const opt = document.createElement('option');
            opt.value = style.value;
            opt.textContent = style.label;
            styleSelect.appendChild(opt);
        });
        
        // Set first style as default
        this.channel2Style = styles[0].value;
        styleSelect.value = this.channel2Style;
        
        // Update patterns for new style
        this.updateChannel2PatternOptions();
    }
    
    updateChannel2PatternOptions() {
        const patternSelect = document.getElementById('channel2Pattern');
        if (!patternSelect) return;
        
        // Define available patterns per style
        const stylePatterns = {
            'arpeggio': [
                { value: 'up', label: '↑ Up' },
                { value: 'down', label: '↓ Down' },
                { value: 'updown', label: '↕ Up-Down' },
                { value: 'pendulum', label: '⟲ Pendulum' },
                { value: 'random', label: '🎲 Random' }
            ],
            'melody': [], // No patterns (random by nature)
            'ostinato': [
                { value: 'up', label: '↑ Forward' },
                { value: 'down', label: '↓ Backward' },
                { value: 'random', label: '🎲 Random Order' }
            ],
            'pads': [], // No patterns (sustained)
            'bass': [
                { value: 'up', label: '↑ Root Up' },
                { value: 'down', label: '↓ Root Down' },
                { value: 'random', label: '🎲 Walking Bass' }
            ],
            'staccato': [
                { value: 'up', label: '↑ Up' },
                { value: 'down', label: '↓ Down' },
                { value: 'updown', label: '↕ Up-Down' },
                { value: 'random', label: '🎲 Random' }
            ],
            'strumming': [
                { value: 'down', label: '↓ Down Strum' },
                { value: 'up', label: '↑ Up Strum' },
                { value: 'updown', label: '↕ Down-Up Strum' },
                { value: 'random', label: '🎲 Random Strum' }
            ],
            'piano': [
                { value: 'block', label: '🎹 Block Chords' },
                { value: 'broken', label: '🎼 Broken Chords' },
                { value: 'alberti', label: '🎵 Alberti Bass' },
                { value: 'waltz', label: '💃 Waltz (1-2-3)' }
            ]
        };
        
        const patterns = stylePatterns[this.channel2Style] || [];
        
        // Save current selection
        const currentValue = patternSelect.value;
        
        // Clear and repopulate
        patternSelect.innerHTML = '';
        
        if (patterns.length === 0) {
            // No patterns available for this style
            const option = document.createElement('option');
            option.value = 'default';
            option.textContent = '(Auto)';
            patternSelect.appendChild(option);
            patternSelect.disabled = true;
            this.channel2Pattern = 'default';
        } else {
            patternSelect.disabled = false;
            patterns.forEach(p => {
                const option = document.createElement('option');
                option.value = p.value;
                option.textContent = p.label;
                patternSelect.appendChild(option);
            });
            
            // Restore selection if still valid, otherwise use first option
            if (patterns.find(p => p.value === currentValue)) {
                patternSelect.value = currentValue;
                this.channel2Pattern = currentValue;
            } else {
                patternSelect.value = patterns[0].value;
                this.channel2Pattern = patterns[0].value;
            }
        }
    }

    generateChannel2Pattern() {
        if (!this.progression || this.progression.length === 0) {
            console.log('No progression to analyze');
            this.updateChannel2SyncStatus();
            return;
        }

        console.log('🎵 Generating Channel 2 pattern...');
        console.log('- Preset:', this.channel2CurrentPreset?.humanName || 'None');
        console.log('- Source:', this.channel2Source);
        console.log('- Style:', this.channel2Style);
        console.log('- Pattern:', this.channel2Pattern);
        console.log('- Density:', this.channel2Density);
        console.log('- Progression bars:', this.progression.length);

        // Generate pattern based on settings
        this.channel2Notes = {};
        
        // If preset is selected, use preset-based generation
        if (this.channel2CurrentPreset && this.channel2CurrentPreset.voicingTemplate) {
            this.generateFromPreset();
            return;
        }
        
        // Determine notes per bar based on density (updated ranges)
        const notesPerBar = {
            'sparse': 3,      // 2-4 notes/bar
            'medium': 6,      // 4-8 notes/bar
            'dense': 12,      // 8-16 notes/bar
            'verydense': 24   // 16-32 notes/bar
        }[this.channel2Density];
        
        this.progression.forEach((bar, barIndex) => {
            let baseNotes = []; // Pitch classes (0-11)
            let baseMidiOctave = 60; // C4
            
            if (this.channel2Source === 'midi') {
                // Source: Use existing MIDI notes from Channel 1
                const midiNotes = [];
                bar.chords.forEach(chord => {
                    if (chord && chord.midiNotes) {
                        midiNotes.push(...chord.midiNotes);
                    }
                });
                
                if (midiNotes.length === 0) {
                    console.log(`No MIDI notes in bar ${barIndex}`);
                    return;
                }
                
                // Convert to pitch classes and find average octave
                const avgMidi = midiNotes.reduce((a, b) => a + b, 0) / midiNotes.length;
                baseMidiOctave = Math.floor(avgMidi / 12) * 12;
                
                // Get unique pitch classes
                baseNotes = [...new Set(midiNotes.map(m => m % 12))].sort((a, b) => a - b);
                
            } else {
                // Source: Use chord analysis
                if (!this.progressionAnalysis) {
                    const analyzer = new ChordAnalyzer();
                    this.progressionAnalysis = analyzer.analyzeProgression(this.progression);
                }
                
                const analysis = this.progressionAnalysis[barIndex];
                if (!analysis || !analysis.analysis) return;
                
                const chordTones = analysis.analysis.pitchClasses || [];
                const scaleNotes = analysis.analysis.scaleNotes || [];
                
                // Style determines which notes to use
                if (this.channel2Style === 'arpeggio') {
                    // Only chord tones
                    baseNotes = [...chordTones];
                } else if (this.channel2Style === 'melody') {
                    // Chord tones + scale notes
                    baseNotes = [...chordTones, ...scaleNotes].filter((note, index, arr) => arr.indexOf(note) === index);
                } else if (this.channel2Style === 'ostinato') {
                    // Repeating pattern with chord tones
                    baseNotes = chordTones.slice(0, 3); // First 3 chord tones
                } else if (this.channel2Style === 'pads') {
                    // Sustained chord tones
                    baseNotes = [...chordTones];
                }
                
                baseNotes.sort((a, b) => a - b);
            }
            
            // Convert pitch classes to MIDI notes in the base octave
            let availableNotes = baseNotes.map(pc => baseMidiOctave + pc);
            
            // Expand to multiple octaves if needed
            if (this.channel2OctaveRange > 1) {
                const expandedNotes = [];
                for (let octave = 0; octave < this.channel2OctaveRange; octave++) {
                    baseNotes.forEach(pc => {
                        expandedNotes.push(baseMidiOctave + pc + (octave * 12));
                    });
                }
                availableNotes = expandedNotes.sort((a, b) => a - b);
            }
            
            // Apply pattern
            let melodyNotes = [...availableNotes];
            if (this.channel2Pattern === 'down') {
                melodyNotes.reverse();
            } else if (this.channel2Pattern === 'updown') {
                const up = [...melodyNotes];
                const down = [...melodyNotes].reverse().slice(1, -1);
                melodyNotes = [...up, ...down];
            } else if (this.channel2Pattern === 'pendulum') {
                // Pendulum: up, down, up, down...
                const pattern = [];
                for (let i = 0; i < notesPerBar; i++) {
                    pattern.push(i % 2 === 0 ? melodyNotes[i % melodyNotes.length] : melodyNotes[melodyNotes.length - 1 - (i % melodyNotes.length)]);
                }
                melodyNotes = pattern;
            } else if (this.channel2Pattern === 'random') {
                // Fisher-Yates shuffle
                for (let i = melodyNotes.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [melodyNotes[i], melodyNotes[j]] = [melodyNotes[j], melodyNotes[i]];
                }
            }
            // 'up' pattern stays as-is (sorted ascending)
            
            // Generate notes based on style
            this.channel2Notes[barIndex] = [];
            const stepDuration = 1.0 / notesPerBar;
            
            if (this.channel2Style === 'pads') {
                // Pads: Long sustained notes (all at once)
                melodyNotes.slice(0, Math.min(3, melodyNotes.length)).forEach((midi) => {
                    this.channel2Notes[barIndex].push({
                        midi: midi,
                        start: 0,
                        duration: 1.0
                    });
                });
            } else if (this.channel2Style === 'melody') {
                // Melody: Random note selection with varied rhythm
                for (let i = 0; i < notesPerBar; i++) {
                    const noteIndex = Math.floor(Math.random() * melodyNotes.length);
                    const varyDuration = Math.random() > 0.5;
                    this.channel2Notes[barIndex].push({
                        midi: melodyNotes[noteIndex],
                        start: i * stepDuration,
                        duration: varyDuration ? stepDuration * 1.2 : stepDuration * 0.6
                    });
                }
            } else if (this.channel2Style === 'ostinato') {
                // Ostinato: Repeating short pattern (3-4 notes)
                const patternLength = Math.min(4, melodyNotes.length);
                const ostPattern = melodyNotes.slice(0, patternLength);
                for (let i = 0; i < notesPerBar; i++) {
                    this.channel2Notes[barIndex].push({
                        midi: ostPattern[i % ostPattern.length],
                        start: i * stepDuration,
                        duration: stepDuration * 0.75
                    });
                }
            } else if (this.channel2Style === 'bass') {
                // Bass: Use lowest notes with longer duration
                const bassNotes = melodyNotes.slice(0, Math.min(3, melodyNotes.length));
                const bassNotesPerBar = Math.min(notesPerBar, 4); // Max 4 bass notes
                const bassDuration = 1.0 / bassNotesPerBar;
                for (let i = 0; i < bassNotesPerBar; i++) {
                    this.channel2Notes[barIndex].push({
                        midi: bassNotes[i % bassNotes.length] - 12, // One octave lower
                        start: i * bassDuration,
                        duration: bassDuration * 0.9
                    });
                }
            } else if (this.channel2Style === 'staccato') {
                // Staccato: Short, punchy notes
                for (let i = 0; i < notesPerBar; i++) {
                    const noteIndex = i % melodyNotes.length;
                    this.channel2Notes[barIndex].push({
                        midi: melodyNotes[noteIndex],
                        start: i * stepDuration,
                        duration: stepDuration * 0.3 // Very short
                    });
                }
            } else if (this.channel2Style === 'strumming') {
                // Strumming: Quick succession of notes (like guitar strum)
                const strumsPerBar = Math.min(notesPerBar, 8);
                const strumDuration = 1.0 / strumsPerBar;
                
                for (let s = 0; s < strumsPerBar; s++) {
                    const strumStart = s * strumDuration;
                    let strumNotes = [...melodyNotes];
                    
                    // Apply strum direction
                    if (this.channel2Pattern === 'up') {
                        strumNotes.reverse(); // Low to high
                    } else if (this.channel2Pattern === 'updown') {
                        strumNotes = s % 2 === 0 ? strumNotes : [...strumNotes].reverse();
                    } else if (this.channel2Pattern === 'random') {
                        strumNotes.sort(() => Math.random() - 0.5);
                    }
                    // 'down' is default (high to low)
                    
                    const noteDelay = 0.015; // 15ms delay between notes
                    strumNotes.forEach((midi, idx) => {
                        this.channel2Notes[barIndex].push({
                            midi: midi,
                            start: strumStart + (idx * noteDelay),
                            duration: strumDuration * 0.7
                        });
                    });
                }
            } else if (this.channel2Style === 'piano') {
                // Piano: Different chord patterns
                const chordsPerBar = Math.min(notesPerBar, 4);
                const chordDuration = 1.0 / chordsPerBar;
                const chordNotes = melodyNotes.slice(0, Math.min(4, melodyNotes.length));
                
                if (this.channel2Pattern === 'block' || !this.channel2Pattern) {
                    // Block chords (all notes together)
                    for (let c = 0; c < chordsPerBar; c++) {
                        chordNotes.forEach((midi) => {
                            this.channel2Notes[barIndex].push({
                                midi: midi,
                                start: c * chordDuration,
                                duration: chordDuration * 0.9
                            });
                        });
                    }
                } else if (this.channel2Pattern === 'broken') {
                    // Broken chords (notes in sequence)
                    for (let c = 0; c < chordsPerBar; c++) {
                        const noteTime = chordDuration / chordNotes.length;
                        chordNotes.forEach((midi, idx) => {
                            this.channel2Notes[barIndex].push({
                                midi: midi,
                                start: (c * chordDuration) + (idx * noteTime),
                                duration: noteTime * 0.8
                            });
                        });
                    }
                } else if (this.channel2Pattern === 'alberti') {
                    // Alberti bass pattern: low-high-mid-high
                    const albertiPattern = [0, 2, 1, 2]; // Indices
                    const noteTime = chordDuration / 4;
                    for (let c = 0; c < chordsPerBar; c++) {
                        albertiPattern.forEach((idx, step) => {
                            if (chordNotes[idx]) {
                                this.channel2Notes[barIndex].push({
                                    midi: chordNotes[idx],
                                    start: (c * chordDuration) + (step * noteTime),
                                    duration: noteTime * 0.8
                                });
                            }
                        });
                    }
                } else if (this.channel2Pattern === 'waltz') {
                    // Waltz: bass-chord-chord (1-2-3)
                    for (let c = 0; c < chordsPerBar; c++) {
                        const beatTime = chordDuration / 3;
                        // Beat 1: Bass note
                        this.channel2Notes[barIndex].push({
                            midi: chordNotes[0],
                            start: c * chordDuration,
                            duration: beatTime * 0.9
                        });
                        // Beat 2 & 3: Chord
                        for (let beat = 1; beat < 3; beat++) {
                            chordNotes.slice(1).forEach((midi) => {
                                this.channel2Notes[barIndex].push({
                                    midi: midi,
                                    start: (c * chordDuration) + (beat * beatTime),
                                    duration: beatTime * 0.8
                                });
                            });
                        }
                    }
                }
            } else {
                // Arpeggio: Sequential pattern through all notes
                for (let i = 0; i < notesPerBar; i++) {
                    const noteIndex = i % melodyNotes.length;
                    this.channel2Notes[barIndex].push({
                        midi: melodyNotes[noteIndex],
                        start: i * stepDuration,
                        duration: stepDuration * 0.8
                    });
                }
            }
        });
        
        // Validate generated pattern
        const totalNotes = Object.values(this.channel2Notes).reduce((sum, notes) => sum + notes.length, 0);
        console.log(`✅ Generated Channel 2 pattern: ${Object.keys(this.channel2Notes).length} bars, ${totalNotes} notes total`);
        
        // Show feedback to user
        const statusEl = document.getElementById('channel2SyncStatus');
        if (statusEl && totalNotes > 0) {
            statusEl.textContent = `✅ Generated ${totalNotes} notes`;
            statusEl.style.color = '#4CAF50';
            setTimeout(() => this.updateChannel2SyncStatus(), 2000);
        }
        
        this.updateChannel2SyncStatus();
    }

    generateFromPreset(maxBars = null) {
        const preset = this.channel2CurrentPreset;
        
        // Check if this is a multi-bar pattern preset
        if (preset.multiBarPattern) {
            return this.generateMultiBarPattern(maxBars);
        }
        
        const notesPerBar = preset.noteDensity[this.channel2Density] || 4;
        
        console.log(`🎹 generateFromPreset called:`);
        console.log(`  - maxBars: ${maxBars}`);
        console.log(`  - progression.length: ${this.progression.length}`);
        console.log(`  - preset: ${preset.humanName}`);
        console.log(`  - voicing: [${preset.voicingTemplate.join(', ')}]`);
        
        const barsToGenerate = maxBars ? Math.min(maxBars, this.progression.length) : this.progression.length;
        console.log(`  - Will generate: ${barsToGenerate} bars`);
        
        // Clear existing notes first!
        this.channel2Notes = {};
        
        for (let barIndex = 0; barIndex < barsToGenerate; barIndex++) {
            const bar = this.progression[barIndex];
            this.channel2Notes[barIndex] = [];
            
            // Get chord tones from the bar
            const chordTones = this.getChordTonesForBar(bar);
            if (!chordTones || chordTones.length === 0) return;
            
            // Apply voicing template to create notes
            const voicedNotes = this.applyVoicingTemplate(chordTones, preset.voicingTemplate);
            
            // Check if preset uses generative algorithm
            if (preset.generative && preset.generativeType === 'melody') {
                // Use generative melody algorithm
                const notesPerBar = preset.noteDensity[this.channel2Density] || 8;
                const stepDuration = 1.0 / notesPerBar;
                let previousNote = null;
                
                const nextChordTones = barIndex < barsToGenerate - 1 ? 
                    this.getChordTonesForBar(this.progression[barIndex + 1]) : null;
                
                for (let i = 0; i < notesPerBar; i++) {
                    const position = i === 0 ? 0 : (i === notesPerBar - 1 ? 'end' : i);
                    const midi = this.generateMelody(chordTones, previousNote, nextChordTones, position);
                    previousNote = midi;
                    
                    const velocity = preset.velocityProfile[i % preset.velocityProfile.length] || 85;
                    
                    this.channel2Notes[barIndex].push({
                        midi: midi,
                        start: i * stepDuration,
                        duration: stepDuration * preset.legato,
                        velocity: velocity
                    });
                }
            } else if (preset.generative && preset.walkingBass) {
                // Use generative walking bass algorithm
                const nextChordTones = barIndex < barsToGenerate - 1 ? 
                    this.getChordTonesForBar(this.progression[barIndex + 1]) : null;
                
                for (let beat = 0; beat < 4; beat++) {
                    const midi = this.generateWalkingBass(chordTones, nextChordTones, beat);
                    const velocity = preset.velocityProfile[beat] || 85;
                    
                    this.channel2Notes[barIndex].push({
                        midi: midi,
                        start: beat / 4,
                        duration: 0.22,
                        velocity: velocity
                    });
                }
            } else if (preset.rhythmPattern && preset.rhythmPattern.length > 0) {
                // Use defined rhythm pattern (like walking bass, melody phrases)
                preset.rhythmPattern.forEach((note, idx) => {
                    let midi;
                    
                    // Select note based on noteChoice
                    switch(note.noteChoice) {
                        case 'root':
                            midi = voicedNotes[0];
                            break;
                        case 'third':
                            midi = voicedNotes[Math.min(1, voicedNotes.length - 1)];
                            break;
                        case 'fifth':
                            midi = voicedNotes[Math.min(2, voicedNotes.length - 1)];
                            break;
                        case 'seventh':
                            midi = voicedNotes[Math.min(3, voicedNotes.length - 1)];
                            break;
                        case 'approach':
                            // Chromatic approach to next chord's root
                            if (barIndex < barsToGenerate - 1) {
                                const nextBar = this.progression[barIndex + 1];
                                const nextChordTones = this.getChordTonesForBar(nextBar);
                                if (nextChordTones) {
                                    const nextVoiced = this.applyVoicingTemplate(nextChordTones, preset.voicingTemplate);
                                    midi = nextVoiced[0] - 1; // Half step below next root
                                } else {
                                    midi = voicedNotes[0] - 1;
                                }
                            } else {
                                midi = voicedNotes[0] - 1; // Fallback
                            }
                            break;
                        default:
                            midi = voicedNotes[idx % voicedNotes.length];
                    }
                    
                    const velocity = preset.velocityProfile[idx % preset.velocityProfile.length] || 80;
                    
                    this.channel2Notes[barIndex].push({
                        midi: midi,
                        start: note.beat / 4,
                        duration: note.duration,
                        velocity: velocity
                    });
                });
            } else {
                // Fallback: simple cycling through notes
                const stepDuration = 1.0 / notesPerBar;
                
                for (let i = 0; i < notesPerBar; i++) {
                    const noteIndex = i % voicedNotes.length;
                    const midi = voicedNotes[noteIndex];
                    
                    const timingOffset = preset.timingOffsets && preset.timingOffsets[i % preset.timingOffsets.length] || 0;
                    const velocity = preset.velocityProfile && preset.velocityProfile[i % preset.velocityProfile.length] || 80;
                    
                    this.channel2Notes[barIndex].push({
                        midi: midi,
                        start: (i * stepDuration) + timingOffset,
                        duration: stepDuration * (preset.legato || 0.8),
                        velocity: velocity
                    });
                }
            }
        }
        
        const totalNotes = Object.values(this.channel2Notes).reduce((sum, notes) => sum + notes.length, 0);
        console.log(`✅ Generated ${totalNotes} notes from preset "${preset.humanName}"`);
        
        this.buildGrid();
    }
    
    generateMultiBarPattern(maxBars = null) {
        const preset = this.channel2CurrentPreset;
        const patternLength = preset.patternLength || 8;
        const barsToGenerate = maxBars ? Math.min(maxBars, this.progression.length) : this.progression.length;
        
        console.log(`🎵 Generating multi-bar pattern (${patternLength} bars)`);
        
        // Clear existing notes first!
        this.channel2Notes = {};
        
        // Collect all chord tones for the pattern
        const allChordTones = [];
        for (let i = 0; i < Math.min(patternLength, barsToGenerate); i++) {
            const bar = this.progression[i];
            const chordTones = this.getChordTonesForBar(bar);
            allChordTones.push(chordTones);
        }
        
        // Generate continuous pattern across bars
        const notesPerBar = preset.noteDensity[this.channel2Density] || 16;
        const totalNotes = notesPerBar * patternLength;
        const stepDuration = 1.0 / notesPerBar;
        
        for (let i = 0; i < totalNotes; i++) {
            const barIndex = Math.floor(i / notesPerBar);
            if (barIndex >= barsToGenerate) break;
            
            const noteInBar = i % notesPerBar;
            const chordTones = allChordTones[barIndex];
            if (!chordTones) continue;
            
            if (!this.channel2Notes[barIndex]) {
                this.channel2Notes[barIndex] = [];
            }
            
            const voicedNotes = this.applyVoicingTemplate(chordTones, preset.voicingTemplate);
            
            // Melodic movement logic
            let noteIndex;
            if (noteInBar === 0) {
                noteIndex = 0; // Start with root
            } else if (noteInBar === notesPerBar - 1) {
                noteIndex = Math.random() > 0.5 ? 0 : 1; // Resolve
            } else {
                noteIndex = Math.floor(Math.random() * voicedNotes.length);
            }
            
            const midi = voicedNotes[noteIndex % voicedNotes.length] + 12; // Octave up for melody
            
            // Phrase contour velocity
            const phrasePosition = i / totalNotes;
            const velocityIndex = Math.floor(phrasePosition * preset.velocityProfile.length);
            const velocity = preset.velocityProfile[velocityIndex] || 85;
            
            const timingOffset = preset.timingOffsets[i % preset.timingOffsets.length] || 0;
            
            this.channel2Notes[barIndex].push({
                midi: midi,
                start: (noteInBar * stepDuration) + timingOffset,
                duration: stepDuration * preset.legato,
                velocity: velocity
            });
        }
        
        const totalNotes2 = Object.values(this.channel2Notes).reduce((sum, notes) => sum + notes.length, 0);
        console.log(`✅ Generated ${totalNotes2} notes in ${patternLength}-bar phrase`);
        
        this.buildGrid();
    }
    
    getChordTonesForBar(bar) {
        // Priority 1: Get from piano roll (Channel 1 notes) - "Pianoroll is truth"
        if (bar.notes && bar.notes.length > 0) {
            const midiNotes = [...new Set(bar.notes.map(n => n.midi))].sort((a, b) => a - b);
            const pitchClasses = [...new Set(midiNotes.map(m => m % 12))];
            const avgMidi = midiNotes.reduce((a, b) => a + b, 0) / midiNotes.length;
            const baseOctave = Math.floor(avgMidi / 12);
            
            console.log(`✓ Using piano roll notes for bar: ${midiNotes.join(', ')}`);
            return { pitchClasses, baseOctave, midiNotes };
        }
        
        // Priority 2: Fallback to chord definitions
        const midiNotes = [];
        bar.chords.forEach(chord => {
            if (chord && chord.midiNotes) {
                midiNotes.push(...chord.midiNotes);
            }
        });
        
        if (midiNotes.length === 0) {
            console.warn('⚠️ No notes in piano roll or chord definition for bar');
            return null;
        }
        
        // Get unique pitch classes
        const uniqueMidi = [...new Set(midiNotes)].sort((a, b) => a - b);
        const pitchClasses = [...new Set(uniqueMidi.map(m => m % 12))];
        
        // Find base octave
        const avgMidi = uniqueMidi.reduce((a, b) => a + b, 0) / uniqueMidi.length;
        const baseOctave = Math.floor(avgMidi / 12);
        
        console.log(`✓ Using chord definition for bar: ${uniqueMidi.join(', ')}`);
        return { pitchClasses, baseOctave, midiNotes: uniqueMidi };
    }
    
    applyVoicingTemplate(chordTones, template) {
        const { midiNotes } = chordTones;
        
        // Sort MIDI notes and get root
        const sortedMidi = [...midiNotes].sort((a, b) => a - b);
        const root = sortedMidi[0];
        
        // Create pitch class map (interval from root)
        const pcMap = {};
        sortedMidi.forEach(midi => {
            const interval = (midi - root) % 12;
            if (!pcMap[interval]) {
                pcMap[interval] = midi;
            }
        });
        
        const notes = [];
        
        template.forEach(voicing => {
            let midiNote = null;
            let octaveOffset = 0;
            let baseVoicing = voicing;
            
            // Handle octave modifiers
            if (voicing.endsWith('_low')) {
                octaveOffset = -1;
                baseVoicing = voicing.replace('_low', '');
            } else if (voicing.endsWith('_high')) {
                octaveOffset = 1;
                baseVoicing = voicing.replace('_high', '');
            }
            
            // Map voicing to interval
            switch(baseVoicing) {
                case 'root':
                    midiNote = pcMap[0] || root;
                    break;
                case 'third':
                    midiNote = pcMap[4] || pcMap[3] || sortedMidi[1] || root;
                    break;
                case 'fifth':
                    midiNote = pcMap[7] || sortedMidi[2] || root;
                    break;
                case 'seventh':
                case 'flat_seventh':
                    midiNote = pcMap[10] || pcMap[11] || sortedMidi[3] || root;
                    break;
                case 'ninth':
                    midiNote = (pcMap[2] || pcMap[1] || root) + 12;
                    break;
                case 'fourth':
                    midiNote = pcMap[5] || root + 5;
                    break;
                case 'sixth':
                    midiNote = pcMap[9] || root + 9;
                    break;
                case 'octave':
                    midiNote = root + 12;
                    break;
                default:
                    // Fallback: cycle through available notes
                    midiNote = sortedMidi[notes.length % sortedMidi.length];
            }
            
            if (midiNote) {
                notes.push(midiNote + (octaveOffset * 12));
            }
        });
        
        return notes;
    }
    
    clearChannel2Pattern() {
        this.channel2Notes = {};
        this.progressionAnalysis = null;
        this.updateChannel2SyncStatus();
    }
    
    // Generative melody/bass algorithm
    generateMelody(chordTones, previousNote = null, nextChordTones = null, position = 0) {
        if (!chordTones || !chordTones.midiNotes || chordTones.midiNotes.length === 0) {
            return null;
        }
        
        const voicedNotes = this.applyVoicingTemplate(chordTones, ['root', 'third', 'fifth', 'seventh']);
        
        if (!voicedNotes || voicedNotes.length === 0) {
            return null;
        }
        
        // Melodic rules
        if (position === 0) {
            // Start phrase: prefer 3rd or 5th
            const idx = Math.random() > 0.5 ? 1 : 2;
            return voicedNotes[Math.min(idx, voicedNotes.length - 1)] + 12;
        } else if (position === 'end') {
            // End phrase: resolve to root or 3rd
            const idx = Math.random() > 0.7 ? 0 : 1;
            return voicedNotes[Math.min(idx, voicedNotes.length - 1)] + 12;
        } else {
            // Middle: stepwise motion preferred
            if (previousNote) {
                // Find closest note (stepwise motion)
                const distances = voicedNotes.map(n => Math.abs((n + 12) - previousNote));
                const closestIdx = distances.indexOf(Math.min(...distances));
                
                // 70% chance stepwise, 30% chance leap
                if (Math.random() > 0.3) {
                    return voicedNotes[closestIdx] + 12;
                } else {
                    // Leap to different chord tone
                    const leapIdx = (closestIdx + Math.floor(Math.random() * 2) + 1) % voicedNotes.length;
                    return voicedNotes[leapIdx] + 12;
                }
            }
            // Random chord tone
            return voicedNotes[Math.floor(Math.random() * voicedNotes.length)] + 12;
        }
    }
    
    generateWalkingBass(chordTones, nextChordTones = null, beat = 0) {
        const voicedNotes = this.applyVoicingTemplate(chordTones, ['root_low', 'third_low', 'fifth_low', 'seventh_low']);
        
        // Walking bass rules
        switch(beat) {
            case 0:
                // Always start with root
                return voicedNotes[0];
            case 1:
                // 5th or 3rd
                return Math.random() > 0.6 ? voicedNotes[2] : voicedNotes[1];
            case 2:
                // 3rd or 7th
                return Math.random() > 0.5 ? voicedNotes[1] : voicedNotes[3];
            case 3:
                // Approach next chord
                if (nextChordTones) {
                    const nextVoiced = this.applyVoicingTemplate(nextChordTones, ['root_low']);
                    const nextRoot = nextVoiced[0];
                    // Chromatic approach (half step below)
                    return nextRoot - 1;
                }
                // Fallback: 5th
                return voicedNotes[2];
            default:
                return voicedNotes[beat % voicedNotes.length];
        }
    }

    changeZoom(octaves) {
        this.octaveRange = octaves;
        this.buildGrid();
    }

    loadPreset(presetName) {
        const presets = {
            'cm': `| Cm | G | G# | D# |
| Fm | C# | G | Cm |
| C | Fm | G# | G |
| E | Fm | G | D# |`,
            'am': `| Am | Dm | Gsus4 G | C |
| F | Dm | Bdim E7 | Am |
| Am | F | Dsus4 D | G |
| C | F | Gsus4 G | Am |
| Am | Dm | Gsus4 G | C |
| F | Dm | Bdim E7 | Am |
| Am | F | Dsus4 D | G |
| C | F | Gsus4 G | Am |`
        };
        
        const textarea = document.getElementById('chordInput');
        if (textarea && presets[presetName]) {
            textarea.value = presets[presetName];
            this.parseChords();
        }
    }
    
    parseChords() {
        const input = document.getElementById('chordInput').value;
        const lines = input.split('\n').filter(line => line.trim());
        
        // Collect all bars first
        const allBars = [];
        let barNum = 1;
        
        lines.forEach(line => {
            // Split by | and filter out empty strings
            const bars = line.split('|').map(s => s.trim()).filter(s => s);
            
            bars.forEach(barContent => {
                // Each bar can have multiple chords
                const chordSymbols = barContent.split(/\s+/).filter(c => c);
                const parsedChords = chordSymbols.map(c => this.parseChord(c)).filter(c => c);
                
                if (parsedChords.length > 0) {
                    allBars.push({
                        barNum: barNum++,
                        chords: parsedChords
                    });
                }
            });
        });
        
        // Split into patterns of 8 bars each
        const patternNames = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
        let patternIndex = 0;
        
        // Clear all patterns first
        this.patterns = {};
        
        // Remove all has-data classes
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.remove('has-data');
        });
        
        for (let i = 0; i < allBars.length; i += 8) {
            const patternBars = allBars.slice(i, i + 8);
            const patternName = patternNames[patternIndex];
            
            if (patternName && patternBars.length > 0) {
                // Keep original bar numbers (1-8, 9-16, 17-24, etc.)
                // Bar numbers are already set correctly in allBars
                
                this.patterns[patternName] = {
                    progression: patternBars,
                    drumPatterns: {},
                    notes: {}
                };
                
                // Mark pattern button as having data
                const btn = document.querySelector(`.pattern-btn[data-pattern="${patternName}"]`);
                if (btn) btn.classList.add('has-data');
                
                patternIndex++;
            }
        }
        
        // Load first pattern
        this.currentPattern = 'A1';
        if (this.patterns['A1']) {
            this.progression = JSON.parse(JSON.stringify(this.patterns['A1'].progression));
        } else {
            this.progression = allBars.slice(0, 8);
        }
        
        this.originalProgression = JSON.parse(JSON.stringify(this.progression));
        this.isModified = false;
        
        // Auto-adjust loop range to match progression length
        this.loopStart = 1;
        this.loopEnd = this.progression.length;
        document.getElementById('loopStart').value = this.loopStart;
        document.getElementById('loopEnd').value = this.loopEnd;
        
        this.buildGrid();
        this.buildDrumGrid();
        this.analyzeProgression();
        if (this.updateLoopSlider && !this.suppressLoopSliderUpdate) this.updateLoopSlider();
        
        console.log(`Parsed ${allBars.length} bars into ${patternIndex} patterns`);
        console.log('Pattern A1 bars:', this.patterns['A1'] ? this.patterns['A1'].progression.map(b => b.barNum) : 'empty');
        console.log('Pattern A2 bars:', this.patterns['A2'] ? this.patterns['A2'].progression.map(b => b.barNum) : 'empty');
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
        console.log('buildGrid() called, progression length:', this.progression.length);
        console.log('showPianoRoll:', this.showPianoRoll);
        
        const container = document.getElementById('gridContainer');
        container.innerHTML = '';
        
        const numBars = Math.max(this.progression.length, 1);

        // Calculate bar width so 8 bars fill the screen while adapting on small viewports
        const gridWrapper = document.querySelector('.grid-wrapper');
        const wrapperWidth = gridWrapper ? gridWrapper.clientWidth : 0;
        const availableWidth = Math.max(wrapperWidth - 80, 0); // Subtract label width safely
        const computedBarWidth = availableWidth > 0 ? Math.floor(availableWidth / 8) : 140;
        this.barWidth = Math.max(60, computedBarWidth); // Ensure bars remain visible even on very small screens

        // Update CSS variable
        document.documentElement.style.setProperty('--bar-width', `${this.barWidth}px`);

        // Enable scroll only in song mode with >8 bars
        if (gridWrapper) {
            const shouldScroll = this.songMode && numBars > 8;
            const totalGridWidth = 80 + (this.barWidth * numBars);
            const needsScroll = totalGridWidth > wrapperWidth;
            gridWrapper.style.overflowX = (shouldScroll || needsScroll) ? 'auto' : 'hidden';

            // Link scroll with drum sequencer
            if (!this.scrollListenerAdded) {
                gridWrapper.addEventListener('scroll', () => {
                    if (this.linkScroll && !this.isScrolling) {
                        this.isScrolling = true;
                        const drumWrapper = document.querySelector('.drum-grid-wrapper');
                        if (drumWrapper) {
                            drumWrapper.scrollLeft = gridWrapper.scrollLeft;
                        }
                        setTimeout(() => this.isScrolling = false, 50);
                    }
                });
                this.scrollListenerAdded = true;
            }
        }
        
        console.log('Bar width calculated:', this.barWidth, 'Bars:', numBars);
        
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
                // Auto: smart range based on actual notes (including Channel 2)
                minMidi = 127;
                maxMidi = 0;
                let hasNotes = false;
                
                this.progression.forEach((bar, barIdx) => {
                    bar.chords.forEach(chord => {
                        if (chord && chord.midiNotes) {
                            hasNotes = true;
                            chord.midiNotes.forEach(note => {
                                minMidi = Math.min(minMidi, note);
                                maxMidi = Math.max(maxMidi, note);
                            });
                        }
                    });
                    
                    // Also check Channel 2 notes for range calculation
                    if (this.showChannel2 && this.channel2Notes[barIdx]) {
                        this.channel2Notes[barIdx].forEach(note => {
                            if (note && note.midi) {
                                hasNotes = true;
                                minMidi = Math.min(minMidi, note.midi);
                                maxMidi = Math.max(maxMidi, note.midi);
                            }
                        });
                    }
                });
                
                if (!hasNotes) {
                    minMidi = 48; // C3
                    maxMidi = 84; // C6
                } else {
                    minMidi = Math.max(0, minMidi - 6);
                    maxMidi = Math.min(127, maxMidi + 6);
                }
                actualNumNotes = maxMidi - minMidi + 1;
            }
        }
        
        // Set grid rows (chord row + piano roll)
        if (this.showPianoRoll && actualNumNotes > 0) {
            container.style.gridTemplateRows = `80px repeat(${actualNumNotes}, 20px)`;
            console.log('Grid rows set for piano roll:', actualNumNotes, 'notes');
        } else {
            container.style.gridTemplateRows = `80px`;
            console.log('Grid rows set to chord only (no piano roll)');
        }
        
        // Universal Playhead - create once, spans entire viewport
        if (!this.playheadElement) {
            this.playheadElement = document.createElement('div');
            this.playheadElement.className = 'playhead';
            this.playheadElement.style.left = '80px';
            // Append to body for full viewport coverage
            document.body.appendChild(this.playheadElement);
        }
        
        // Build vertical ruler
        this.buildVerticalRuler();
        
        // Chord row rendered separately so it stays fixed
        const chordHeader = document.getElementById('chordHeader');
        if (chordHeader) {
            chordHeader.innerHTML = '';
        }
        
        const headerGrid = document.createElement('div');
        headerGrid.className = 'chord-header-grid';
        headerGrid.style.display = 'grid';
        headerGrid.style.gridTemplateColumns = `80px repeat(${numBars}, ${this.barWidth}px)`;
        headerGrid.style.alignItems = 'stretch';
        
        const labelCell = document.createElement('div');
        labelCell.className = 'grid-label chord-header-label';
        labelCell.textContent = 'Chords';
        headerGrid.appendChild(labelCell);
        
        this.progression.forEach((bar, i) => {
            const cell = document.createElement('div');
            cell.className = 'grid-cell chord-cell chord-header-fixed';
            cell.dataset.barIndex = i;
            
            // Highlight loop range
            const barNum = i + 1;
            if (barNum >= this.loopStart && barNum <= this.loopEnd) {
                cell.style.boxShadow = 'inset 0 0 0 3px rgba(0, 212, 255, 0.3)';
            }
            
            cell.style.display = 'flex';
            cell.style.flexDirection = 'column';
            cell.style.position = 'relative';
            
            const barNumLabel = document.createElement('div');
            barNumLabel.className = 'bar-num';
            barNumLabel.textContent = bar.barNum;
            barNumLabel.style.position = 'absolute';
            barNumLabel.style.top = '2px';
            barNumLabel.style.left = '2px';
            barNumLabel.style.zIndex = '10';
            cell.appendChild(barNumLabel);
            
            const topControls = document.createElement('div');
            topControls.className = 'bar-controls bar-controls-top';
            
            const delBarBtn = document.createElement('button');
            delBarBtn.textContent = 'Del Bar';
            delBarBtn.className = 'bar-control-btn bar-control-delete';
            delBarBtn.title = 'Delete this bar';
            delBarBtn.onclick = (e) => {
                e.stopPropagation();
                this.deleteBar(i);
            };
            topControls.appendChild(delBarBtn);
            
            const newBarBtn = document.createElement('button');
            newBarBtn.textContent = 'New Bar';
            newBarBtn.className = 'bar-control-btn';
            newBarBtn.title = 'Add new bar after this';
            newBarBtn.onclick = (e) => {
                e.stopPropagation();
                this.addBarAfter(i);
            };
            topControls.appendChild(newBarBtn);
            
            const splitBarBtn = document.createElement('button');
            splitBarBtn.textContent = 'Split';
            splitBarBtn.className = 'bar-control-btn';
            splitBarBtn.title = 'Split bar (add sub-chord)';
            splitBarBtn.onclick = (e) => {
                e.stopPropagation();
                this.splitBar(i);
            };
            topControls.appendChild(splitBarBtn);
            
            cell.appendChild(topControls);
            
            const subBarsContainer = document.createElement('div');
            subBarsContainer.style.display = 'flex';
            subBarsContainer.style.flex = '1';
            subBarsContainer.style.gap = '2px';
            
            bar.chords.forEach((chord, chordIdx) => {
                const subBar = document.createElement('div');
                subBar.className = 'sub-bar';
                subBar.style.flex = '1';
                subBar.style.display = 'flex';
                subBar.style.flexDirection = 'column';
                subBar.style.justifyContent = 'center';
                subBar.style.alignItems = 'center';
                subBar.style.border = '1px solid #333';
                subBar.style.borderRadius = '3px';
                subBar.style.padding = '4px';
                subBar.style.cursor = 'pointer';
                subBar.style.transition = 'all 0.2s';
                subBar.dataset.barIndex = i;
                subBar.dataset.chordIndex = chordIdx;
                
                const chordLabel = document.createElement('div');
                chordLabel.textContent = chord.symbol || '-';
                chordLabel.className = 'chord-label';
                chordLabel.style.fontSize = '0.9rem';
                subBar.appendChild(chordLabel);
                
                if (bar.chords.length > 1) {
                    const delSubBtn = document.createElement('button');
                    delSubBtn.textContent = '×';
                    delSubBtn.style.cssText = 'position: absolute; top: 2px; right: 2px; background: #ff4444; color: white; border: none; border-radius: 3px; width: 16px; height: 16px; font-size: 12px; cursor: pointer; padding: 0; line-height: 14px;';
                    delSubBtn.title = 'Delete this sub-chord';
                    delSubBtn.onclick = (e) => {
                        e.stopPropagation();
                        this.deleteSubBar(i, chordIdx);
                    };
                    subBar.style.position = 'relative';
                    subBar.appendChild(delSubBtn);
                }
                
                subBar.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.selectSubBar(i, chordIdx);
                });
                
                subBar.addEventListener('mouseenter', () => {
                    if (!subBar.classList.contains('selected-sub-bar')) {
                        subBar.style.background = 'rgba(0, 212, 255, 0.1)';
                    }
                });
                subBar.addEventListener('mouseleave', () => {
                    if (!subBar.classList.contains('selected-sub-bar')) {
                        subBar.style.background = '';
                    }
                });
                
                subBarsContainer.appendChild(subBar);
            });
            
            cell.appendChild(subBarsContainer);
            
            const bottomControls = document.createElement('div');
            bottomControls.className = 'bar-controls bar-controls-bottom';
            
            const copyNotesBtn = document.createElement('button');
            copyNotesBtn.textContent = 'Copy';
            copyNotesBtn.className = 'note-control-btn';
            copyNotesBtn.title = 'Copy notes from this bar';
            copyNotesBtn.onclick = (e) => {
                e.stopPropagation();
                this.copyBar(i);
            };
            bottomControls.appendChild(copyNotesBtn);
            
            const pasteNotesBtn = document.createElement('button');
            pasteNotesBtn.textContent = 'Paste';
            pasteNotesBtn.className = 'note-control-btn';
            pasteNotesBtn.title = 'Paste notes to this bar';
            pasteNotesBtn.onclick = (e) => {
                e.stopPropagation();
                this.setPasteTarget(i);
            };
            bottomControls.appendChild(pasteNotesBtn);
            
            const delNotesBtn = document.createElement('button');
            delNotesBtn.textContent = 'Clear';
            delNotesBtn.className = 'note-control-btn note-control-delete';
            delNotesBtn.title = 'Clear all notes from this bar';
            delNotesBtn.onclick = (e) => {
                e.stopPropagation();
                this.clearBarNotes(i);
            };
            bottomControls.appendChild(delNotesBtn);
            
            const addChordBtn = document.createElement('button');
            addChordBtn.textContent = 'Add';
            addChordBtn.className = 'note-control-btn';
            addChordBtn.title = 'Add chord';
            addChordBtn.onclick = (e) => {
                e.stopPropagation();
                this.showChordInputHelper(i);
            };
            bottomControls.appendChild(addChordBtn);
            
            cell.appendChild(bottomControls);
            
            cell.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.editChordText(i, cell);
            });
            
            cell.addEventListener('click', (e) => {
                if (e.target.classList.contains('chord-action-btn')) return;
                this.selectBar(i);
                if (!this.isPlaying && bar.chords.length > 0 && bar.chords[0]) {
                    this.previewBar(i);
                    this.analyzeChord(bar.chords[0]);
                }
            });
            
            headerGrid.appendChild(cell);
        });
        
        if (chordHeader) {
            chordHeader.appendChild(headerGrid);
        }
        
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
                let hasNotes = false;
                
                this.progression.forEach(bar => {
                    bar.chords.forEach(chord => {
                        if (chord && chord.midiNotes) {
                            hasNotes = true;
                            chord.midiNotes.forEach(note => {
                                minMidi = Math.min(minMidi, note);
                                maxMidi = Math.max(maxMidi, note);
                            });
                        }
                    });
                });
                
                // If no notes found, use default range
                if (!hasNotes) {
                    console.log('No notes found in progression, using default range');
                    minMidi = 48; // C3
                    maxMidi = 84; // C6
                } else {
                    // Add padding
                    minMidi = Math.max(0, minMidi - 6);
                    maxMidi = Math.min(127, maxMidi + 6);
                }
                actualNumNotes = maxMidi - minMidi + 1;
                console.log('Piano roll range:', minMidi, 'to', maxMidi, 'Notes:', actualNumNotes);
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
                    
                    // Add existing notes (Channel 1)
                    bar.chords.forEach((chord, chordIdx) => {
                        if (chord && chord.midiNotes.includes(midiNote)) {
                            this.addNoteBlock(cell, midiNote, barIdx, chordIdx, bar.chords.length, chord.symbol, 'channel1');
                        }
                    });
                    
                    // Add Channel 2 notes (if enabled and in overlay mode)
                    if (this.showChannel2 && this.channel2Mode === 'overlay' && this.channel2Notes[barIdx]) {
                        this.channel2Notes[barIdx].forEach((note, noteIdx) => {
                            if (note.midi === midiNote) {
                                this.addChannel2NoteBlock(cell, midiNote, barIdx, noteIdx, note);
                            }
                        });
                    }
                });
            }
        }
        
        // Add separate Channel 2 section if in separate mode
        if (this.showChannel2 && this.channel2Mode === 'separate') {
            // Calculate range if not already done
            let ch2MinMidi = minMidi || 48;
            let ch2MaxMidi = maxMidi || 84;
            let ch2NumNotes = actualNumNotes || (ch2MaxMidi - ch2MinMidi + 1);
            
            // If piano roll was off, calculate range from Channel 2 notes
            if (!this.showPianoRoll) {
                ch2MinMidi = 127;
                ch2MaxMidi = 0;
                Object.values(this.channel2Notes).forEach(notes => {
                    notes.forEach(note => {
                        ch2MinMidi = Math.min(ch2MinMidi, note.midi);
                        ch2MaxMidi = Math.max(ch2MaxMidi, note.midi);
                    });
                });
                ch2MinMidi = Math.max(0, ch2MinMidi - 6);
                ch2MaxMidi = Math.min(127, ch2MaxMidi + 6);
                ch2NumNotes = ch2MaxMidi - ch2MinMidi + 1;
            }
            
            this.buildChannel2Section(container, ch2MinMidi, ch2MaxMidi, ch2NumNotes);
        }
        
        // Restore selected bar visual state after rebuild
        if (this.selectedBar !== null && this.selectedBar !== undefined) {
            const cells = document.querySelectorAll('.chord-cell');
            if (cells[this.selectedBar]) {
                cells[this.selectedBar].style.border = '3px solid #00d4ff';
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

    addNoteBlock(cell, midiNote, barIdx, chordIdx, totalChords, symbol, channel = 'channel1') {
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

    addChannel2NoteBlock(cell, midiNote, barIdx, noteIdx, note) {
        const noteBlock = document.createElement('div');
        noteBlock.className = 'note-block channel2-note';
        noteBlock.dataset.midi = midiNote;
        noteBlock.dataset.barIndex = barIdx;
        noteBlock.dataset.noteIndex = noteIdx;
        noteBlock.dataset.channel = 'channel2';
        noteBlock.dataset.uniqueId = `ch2-${barIdx}-${noteIdx}`; // Unique ID for highlighting
        
        // Position based on note timing (start time within bar)
        const width = note.duration * 100; // Duration as percentage
        const left = note.start * 100; // Start time as percentage
        noteBlock.style.width = `${Math.max(width, 5)}%`; // Min 5% width
        noteBlock.style.left = `${left}%`;
        noteBlock.style.backgroundColor = '#ff6b35'; // Orange for Channel 2
        noteBlock.style.opacity = '0.8';
        
        cell.appendChild(noteBlock);
        return noteBlock;
    }

    buildChannel2Section(container, minMidi, maxMidi, actualNumNotes) {
        // Add Channel 2 header
        this.addCell(container, 'Channel 2', 'grid-label channel2-header-label');
        this.progression.forEach(() => {
            this.addCell(container, '', 'grid-cell channel2-header-cell');
        });
        
        // Add Channel 2 piano roll rows
        for (let noteIdx = 0; noteIdx < actualNumNotes; noteIdx++) {
            const midiNote = maxMidi - noteIdx;
            const noteName = this.midiToNote(midiNote);
            const isWhite = this.whiteKeys.includes(noteName.slice(0, -1));
            
            this.addCell(container, noteName, 'grid-label channel2-label');
            
            this.progression.forEach((bar, barIdx) => {
                const cell = this.addCell(container, '', `grid-cell piano-cell channel2-cell ${isWhite ? 'white' : 'black'}`);
                cell.dataset.midi = midiNote;
                cell.dataset.barIndex = barIdx;
                cell.dataset.channel = 'channel2';
                
                // Add Channel 2 notes
                if (this.channel2Notes[barIdx]) {
                    this.channel2Notes[barIdx].forEach((note, noteIdx) => {
                        if (note.midi === midiNote) {
                            this.addChannel2NoteBlock(cell, midiNote, barIdx, noteIdx, note);
                        }
                    });
                }
            });
        }
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
        
        // Check if note exists at this position
        const bar = this.progression[barIdx];
        let noteExists = false;
        let noteKey = null;
        
        bar.chords.forEach((chord, chordIdx) => {
            if (chord.midiNotes.includes(midiNote)) {
                noteExists = true;
                noteKey = `${midiNote}-${barIdx}-${chordIdx}`;
            }
        });
        
        if (noteExists) {
            // Note exists - select it instead of toggling
            if (!e.ctrlKey && !e.shiftKey) {
                this.deselectAllNotes();
            }
            this.selectedNotes.add(noteKey);
            this.updateNoteSelection();
            this.playNote(midiNote);
        } else {
            // Note doesn't exist - add it
            this.toggleNoteAtPosition(midiNote, barIdx);
        }
    }
    
    playNote(midiNote) {
        if (!this.notePreviewEnabled) return;
        const freq = Tone.Frequency(midiNote, 'midi').toFrequency();
        this.synth.triggerAttackRelease(freq, '8n');
        
        // Visual feedback - highlight the clicked note
        this.highlightClickedNote(midiNote);
    }
    
    highlightClickedNote(midiNote) {
        // Find all piano cells with this MIDI note
        const cells = document.querySelectorAll(`.piano-cell[data-midi="${midiNote}"]`);
        
        cells.forEach(cell => {
            // Add flash animation class
            cell.classList.add('note-flash');
            
            // Remove class after animation completes
            setTimeout(() => {
                cell.classList.remove('note-flash');
            }, 300);
        });
    }

    handlePianoCellMouseDown(e, midiNote, barIdx) {
        if (!this.editMode) return;
        // Could implement drag-to-create multiple notes
    }

    handleNoteClick(e, noteBlock) {
        e.stopPropagation();
        
        const midi = parseInt(noteBlock.dataset.midi);
        const barIdx = parseInt(noteBlock.dataset.barIndex);
        
        // Select the bar this note belongs to
        this.selectBar(barIdx);
        
        // Always play note sound when clicking
        this.playNote(midi);
        
        if (!this.editMode) {
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
        const barWidth = this.barWidth || 140;
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
        
        // Select this bar
        this.selectBar(barIdx);
        
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
                    // Re-sort and update chord symbol
                    chord.midiNotes.sort((a, b) => a - b);
                    chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                    chord.symbol = this.recognizeChord(chord.midiNotes);
                }
                noteFound = true;
            }
        });
        
        if (!noteFound) {
            // Add note - play sound when adding
            this.playNote(midiNote);
            
            let chordIdx = 0;
            if (bar.chords.length === 0) {
                // Create new chord
                bar.chords = [{
                    symbol: '?',
                    root: '',
                    quality: '',
                    midiNotes: [midiNote],
                    noteNames: [this.midiToNote(midiNote)]
                }];
                chordIdx = 0;
            } else {
                // Add to first chord
                const chord = bar.chords[0];
                chord.midiNotes.push(midiNote);
                chord.midiNotes.sort((a, b) => a - b);
                chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                
                // Recognize chord
                chord.symbol = this.recognizeChord(chord.midiNotes);
                chordIdx = 0;
            }
            
            // Rebuild grid first
            this.buildGrid();
            this.analyzeProgression();
            
            // Then select the newly added note
            const noteKey = `${midiNote}-${barIdx}-${chordIdx}`;
            this.selectedNotes.clear();
            this.selectedNotes.add(noteKey);
            this.updateNoteSelection();
            
            // Real-time sync chord builder
            this.syncChordBuilderFromBar(barIdx);
            this.selectBar(barIdx);
            return;
        }
        
        this.buildGrid();
        this.analyzeProgression(); // Update analysis after note change
        
        // Real-time sync after removing note
        this.syncChordBuilderFromBar(barIdx);
    }

    recognizeChord(midiNotes) {
        if (!midiNotes || midiNotes.length === 0) {
            return '?';
        }
        
        if (midiNotes.length === 1) {
            return this.midiToNote(midiNotes[0]); // Keep octave for single notes
        }
        
        const sorted = [...midiNotes].sort((a, b) => a - b);
        const root = sorted[0];
        const intervals = sorted.map(note => (note - root) % 12).sort((a, b) => a - b);
        const rootName = this.midiToNote(root).replace(/\d+/, '');
        
        // Handle 2-note intervals (dyads) - show with octaves
        if (midiNotes.length === 2) {
            const interval = intervals[1];
            const note1 = this.midiToNote(sorted[0]);
            const note2 = this.midiToNote(sorted[1]);
            const intervalNames = {
                1: 'min2',
                2: 'maj2', 
                3: 'min3',
                4: 'maj3',
                5: 'P4',
                6: 'tritone',
                7: 'P5',
                8: 'min6',
                9: 'maj6',
                10: 'min7',
                11: 'maj7',
                12: 'oct'
            };
            const intervalName = intervalNames[interval] || `+${interval}`;
            return `${note1}-${note2} (${intervalName})`;
        }
        
        const intervalString = intervals.join(',');
        
        // Detect inversions and determine actual chord
        let inversionSuffix = '';
        let actualQuality = '';
        
        const chordPatterns = {
            // Triads (root position)
            '0,4,7': { quality: '', inversion: 0 },           // Major
            '0,3,7': { quality: 'm', inversion: 0 },          // Minor
            '0,3,6': { quality: 'dim', inversion: 0 },        // Diminished
            '0,4,8': { quality: 'aug', inversion: 0 },        // Augmented
            '0,5,7': { quality: 'sus4', inversion: 0 },       // Sus4
            '0,2,7': { quality: 'sus2', inversion: 0 },       // Sus2
            
            // Triads (inversions)
            '0,3,8': { quality: '', inversion: 1 },           // Major 1st inv (e.g., E-G-C)
            '0,5,9': { quality: '', inversion: 2 },           // Major 2nd inv (e.g., G-C-E)
            '0,4,9': { quality: 'm', inversion: 1 },          // Minor 1st inv
            '0,5,8': { quality: 'm', inversion: 2 },          // Minor 2nd inv
            
            // 7th chords
            '0,4,7,10': { quality: '7', inversion: 0 },       // Dominant 7
            '0,4,7,11': { quality: 'maj7', inversion: 0 },    // Major 7
            '0,3,7,10': { quality: 'm7', inversion: 0 },      // Minor 7
            '0,3,6,9': { quality: 'dim7', inversion: 0 },     // Diminished 7
            '0,3,6,10': { quality: 'm7♭5', inversion: 0 },    // Half-diminished 7
            '0,4,8,10': { quality: 'aug7', inversion: 0 },    // Augmented 7
            
            // 6th chords
            '0,4,7,9': { quality: '6', inversion: 0 },        // Major 6
            '0,3,7,9': { quality: 'm6', inversion: 0 },       // Minor 6
            
            // 9th chords
            '0,4,7,10,14': { quality: '9', inversion: 0 },    // Dominant 9
            '0,4,7,11,14': { quality: 'maj9', inversion: 0 }, // Major 9
            '0,3,7,10,14': { quality: 'm9', inversion: 0 },   // Minor 9
            
            // Add chords
            '0,2,4,7': { quality: 'add9', inversion: 0 },     // Add9
            '0,4,5,7': { quality: 'add11', inversion: 0 },    // Add11
            
            // Other
            '0,7': { quality: '5', inversion: 0 },            // Power chord
        };
        
        const chordInfo = chordPatterns[intervalString];
        
        // If not found, show intervals for debugging
        if (!chordInfo) {
            console.log('Unknown chord pattern:', intervalString, 'for notes:', midiNotes);
            return rootName + '?';
        }
        
        actualQuality = chordInfo.quality;
        
        // Add inversion notation
        if (chordInfo.inversion === 1) {
            inversionSuffix = '/1';  // First inversion
        } else if (chordInfo.inversion === 2) {
            inversionSuffix = '/2';  // Second inversion
        } else if (chordInfo.inversion === 3) {
            inversionSuffix = '/3';  // Third inversion (for 7th chords)
        }
        
        return rootName + actualQuality + inversionSuffix;
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
        
        const targetBar = this.progression[this.pasteTargetBar];
        const targetBarIdx = this.pasteTargetBar;
        
        // Check if there are existing notes and if there will be conflicts
        const hasExistingNotes = targetBar.chords.length > 0 && targetBar.chords[0] && targetBar.chords[0].midiNotes.length > 0;
        
        if (hasExistingNotes) {
            // Check for conflicts
            const existingNotes = targetBar.chords[0].midiNotes;
            const hasConflicts = this.clipboard.some(item => existingNotes.includes(item.midiNote));
            
            if (hasConflicts) {
                // Show custom dialog with 3 options
                this.showPasteDialog(targetBarIdx);
                return; // Exit and wait for user choice
            } else {
                // No conflicts, just merge
                this.saveState();
            }
        } else {
            // No existing notes, just paste
            this.saveState();
            targetBar.chords = [{
                symbol: '?',
                root: '',
                quality: '',
                midiNotes: [],
                noteNames: []
            }];
        }
        
        this.executePaste(targetBarIdx, 'merge');
    }

    showPasteDialog(targetBarIdx) {
        // Create modal overlay
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); z-index: 10000; display: flex; align-items: center; justify-content: center;';
        
        const dialog = document.createElement('div');
        dialog.style.cssText = 'background: #2a2a2a; border: 2px solid #00d4ff; border-radius: 8px; padding: 2rem; max-width: 400px;';
        
        const title = document.createElement('h3');
        title.textContent = 'Paste Conflict';
        title.style.cssText = 'color: #00d4ff; margin: 0 0 1rem 0;';
        dialog.appendChild(title);
        
        const message = document.createElement('p');
        message.textContent = 'Target bar already has notes. How do you want to paste?';
        message.style.cssText = 'color: #fff; margin-bottom: 1.5rem;';
        dialog.appendChild(message);
        
        const buttonContainer = document.createElement('div');
        buttonContainer.style.cssText = 'display: flex; gap: 0.5rem; flex-direction: column;';
        
        // Replace button
        const replaceBtn = document.createElement('button');
        replaceBtn.textContent = 'Replace (clear existing, paste new)';
        replaceBtn.style.cssText = 'padding: 0.75rem; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
        replaceBtn.onclick = () => {
            document.body.removeChild(overlay);
            this.executePaste(targetBarIdx, 'replace');
        };
        buttonContainer.appendChild(replaceBtn);
        
        // Merge button
        const mergeBtn = document.createElement('button');
        mergeBtn.textContent = 'Merge (keep existing + add new)';
        mergeBtn.style.cssText = 'padding: 0.75rem; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: 600;';
        mergeBtn.onclick = () => {
            document.body.removeChild(overlay);
            this.executePaste(targetBarIdx, 'merge');
        };
        buttonContainer.appendChild(mergeBtn);
        
        // Cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.textContent = 'Cancel';
        cancelBtn.style.cssText = 'padding: 0.75rem; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;';
        cancelBtn.onclick = () => {
            document.body.removeChild(overlay);
            this.pasteTargetBar = null;
        };
        buttonContainer.appendChild(cancelBtn);
        
        dialog.appendChild(buttonContainer);
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }

    executePaste(targetBarIdx, mode) {
        const targetBar = this.progression[targetBarIdx];
        
        // Save state BEFORE making changes
        this.saveState();
        
        // Track which MIDI notes we're pasting
        const pastedMidiNotes = this.clipboard.map(item => item.midiNote);
        
        console.log('Pasting notes:', pastedMidiNotes, 'to bar', targetBarIdx, 'mode:', mode);
        console.log('Target bar before paste:', JSON.stringify(targetBar.chords));
        
        // Ensure we have a clean chord object
        const hasEmptyChord = targetBar.chords.length > 0 && 
                             targetBar.chords[0] && 
                             (!targetBar.chords[0].midiNotes || targetBar.chords[0].midiNotes.length === 0);
        
        if (mode === 'replace' || targetBar.chords.length === 0 || !targetBar.chords[0] || hasEmptyChord) {
            // Create fresh chord object (clears any "?" symbols)
            console.log('Creating fresh chord object');
            targetBar.chords = [{
                symbol: '',
                root: '',
                quality: '',
                midiNotes: [],
                noteNames: []
            }];
        } else {
            // For merge with existing notes
            console.log('Merging with existing chord');
            const existingChord = targetBar.chords[0];
            if (!existingChord.midiNotes) existingChord.midiNotes = [];
            if (!existingChord.noteNames) existingChord.noteNames = [];
        }
        
        const targetChord = targetBar.chords[0];
        const chordIdx = 0;
        
        // Add all copied notes
        this.clipboard.forEach(item => {
            if (!targetChord.midiNotes.includes(item.midiNote)) {
                targetChord.midiNotes.push(item.midiNote);
            }
        });
        
        // Sort MIDI notes
        targetChord.midiNotes.sort((a, b) => a - b);
        
        // Rebuild noteNames array from sorted MIDI notes
        targetChord.noteNames = targetChord.midiNotes.map(m => this.midiToNote(m));
        
        console.log('Before recognition - MIDI notes:', targetChord.midiNotes);
        console.log('Before recognition - Note names:', targetChord.noteNames);
        
        // Recognize chord
        const recognizedSymbol = this.recognizeChord(targetChord.midiNotes);
        targetChord.symbol = recognizedSymbol;
        
        console.log('Chord recognized:', recognizedSymbol, 'from MIDI notes:', targetChord.midiNotes);
        
        this.pasteTargetBar = null;
        
        // Clear selection BEFORE rebuilding
        this.selectedNotes.clear();
        
        this.buildGrid();
        this.analyzeProgression();
        
        // Sync chord designer with pasted bar
        this.syncChordBuilderFromBar(targetBarIdx);
        this.selectBar(targetBarIdx);
        
        // Switch to edit mode if not already
        if (!this.editMode) {
            this.toggleEditMode();
            console.log('Switched to Edit Mode for note selection');
        }
        
        // Select ONLY the pasted notes (after DOM update)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                // Remove all visual selection first
                document.querySelectorAll('.note-block.selected').forEach(block => {
                    block.classList.remove('selected');
                });
                
                // Select only notes that were in the clipboard
                document.querySelectorAll(`.note-block[data-bar-index="${targetBarIdx}"]`).forEach(block => {
                    const midi = parseInt(block.dataset.midi);
                    
                    // Only select if this MIDI note was in the clipboard
                    if (pastedMidiNotes.includes(midi)) {
                        const key = `${block.dataset.midi}-${block.dataset.barIndex}-${block.dataset.chordIndex}`;
                        this.selectedNotes.add(key);
                        block.classList.add('selected');
                        console.log('Selected pasted note:', key);
                    }
                });
                
                console.log('✅ Pasted and selected', this.selectedNotes.size, 'notes');
                console.log('✅ Edit mode active - use arrow keys to move, Delete to remove');
                console.log('✅ Chord Designer synced to bar', targetBarIdx + 1);
                console.log('selectedNotes:', Array.from(this.selectedNotes));
            });
        });
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

    updateNoteSelection() {
        // First, remove all selected classes
        document.querySelectorAll('.note-block').forEach(block => {
            block.classList.remove('selected');
        });
        
        // Then, add selected class to all notes in selectedNotes Set
        this.selectedNotes.forEach(noteKey => {
            const [midi, barIdx, chordIdx] = noteKey.split('-').map(Number);
            
            // Find the note block with matching data attributes
            const selector = `.note-block[data-midi="${midi}"][data-bar-index="${barIdx}"][data-chord-index="${chordIdx}"]`;
            const noteBlock = document.querySelector(selector);
            
            if (noteBlock) {
                noteBlock.classList.add('selected');
            }
        });
        
        console.log('Updated selection:', this.selectedNotes.size, 'notes selected');
        
        // Update interval analysis
        this.updateIntervalAnalysis();
    }

    updateIntervalAnalysis() {
        const intervalType = document.querySelector('.interval-type');
        const intervalSemitones = document.querySelector('.interval-semitones');
        const melodicInfo = document.getElementById('melodicInfo');
        
        console.log('updateIntervalAnalysis called, selected notes:', this.selectedNotes.size);
        
        if (!intervalType || !intervalSemitones || !melodicInfo) {
            console.log('Interval analysis elements not found!');
            return;
        }
        
        if (this.selectedNotes.size === 0) {
            intervalType.textContent = '-';
            intervalSemitones.textContent = '-';
            melodicInfo.textContent = 'Select notes to see interval analysis';
            return;
        }
        
        // Get MIDI notes from selection
        const midiNotes = Array.from(this.selectedNotes).map(key => {
            const [midi] = key.split('-').map(Number);
            return midi;
        }).sort((a, b) => a - b);
        
        // Also update the "Current Selection" in Music Theory Analysis panel
        const selectionAnalysis = document.getElementById('selectionAnalysis');
        
        if (midiNotes.length === 1) {
            const noteName = this.midiToNote(midiNotes[0]);
            intervalType.textContent = noteName.replace(/\d+/, '');
            intervalSemitones.textContent = `MIDI: ${midiNotes[0]}`;
            melodicInfo.textContent = `Single note: ${noteName}`;
            
            if (selectionAnalysis) {
                selectionAnalysis.innerHTML = `<strong>Selected Notes:</strong> ${noteName}`;
            }
            console.log('Updated interval display:', noteName, 'MIDI:', midiNotes[0]);
        } else if (midiNotes.length === 2) {
            const interval = midiNotes[1] - midiNotes[0];
            const intervalName = this.getIntervalName(interval);
            intervalType.textContent = intervalName;
            intervalSemitones.textContent = `${interval} semitones`;
            
            const note1 = this.midiToNote(midiNotes[0]);
            const note2 = this.midiToNote(midiNotes[1]);
            melodicInfo.textContent = `Dyad: ${note1} → ${note2}\nInterval: ${intervalName}`;
            
            if (selectionAnalysis) {
                selectionAnalysis.innerHTML = `<strong>Selected Notes:</strong> ${note1}, ${note2}<br><strong>Interval:</strong> ${intervalName}`;
            }
        } else {
            // Multiple notes - show as chord
            const root = this.midiToNote(midiNotes[0]).replace(/\d+/, '');
            const intervals = midiNotes.map(n => (n - midiNotes[0]) % 12);
            intervalType.textContent = `${midiNotes.length} notes`;
            intervalSemitones.textContent = `Intervals: ${intervals.join(', ')}`;
            
            const noteNames = midiNotes.map(m => this.midiToNote(m).replace(/\d+/, '')).join(', ');
            const noteNamesFull = midiNotes.map(m => this.midiToNote(m)).join(', ');
            melodicInfo.textContent = `Notes: ${noteNames}\nRoot: ${root}\nIntervals from root: ${intervals.join(', ')} semitones`;
            
            if (selectionAnalysis) {
                const chordSymbol = this.recognizeChord(midiNotes);
                const notesList = noteNamesFull.split(', ').join(', ');
                selectionAnalysis.innerHTML = `
                    <strong>Chord:</strong> ${chordSymbol}<br><br>
                    <strong>Notes:</strong> ${notesList}<br><br>
                    <strong>Intervals from root:</strong><br>
                    ${intervals.map((int, idx) => {
                        const intervalName = this.getIntervalName(int);
                        return `${noteNames.split(', ')[idx]}: ${intervalName}`;
                    }).join('<br>')}
                `;
            }
        }
    }

    getIntervalName(semitones) {
        const intervals = {
            0: 'Unison',
            1: 'Minor 2nd',
            2: 'Major 2nd',
            3: 'Minor 3rd',
            4: 'Major 3rd',
            5: 'Perfect 4th',
            6: 'Tritone',
            7: 'Perfect 5th',
            8: 'Minor 6th',
            9: 'Major 6th',
            10: 'Minor 7th',
            11: 'Major 7th',
            12: 'Octave'
        };
        return intervals[semitones] || `${semitones} semitones`;
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
        this.modulation.startTime = performance.now(); // Start LFO timer
        
        // Start from selected bar if set, otherwise from loop start
        if (this.selectedBar !== null) {
            this.currentBar = this.selectedBar;
        } else {
            this.currentBar = Math.max(0, this.loopStart - 1);
        }
        Tone.Transport.bpm.value = this.bpm;
        
        const barDuration = (60 / this.bpm) * 4;
        
        // Ensure barWidth is set
        if (!this.barWidth) {
            const gridWrapper = document.querySelector('.grid-wrapper');
            const availableWidth = gridWrapper ? gridWrapper.clientWidth - 80 : 1120;
            this.barWidth = Math.max(100, Math.floor(availableWidth / 8));
        }
        
        const barWidth = this.barWidth;
        const totalDuration = this.progression.length * barDuration;
        
        const gridContainer = document.getElementById('gridContainer');
        const gridRect = gridContainer.getBoundingClientRect();
        const startPos = gridRect.left + 80;
        
        this.playheadElement.style.display = 'block';
        
        this.playStartTime = performance.now();
        this.playStartBar = this.currentBar; // Remember which bar we started from
        this.animatePlayhead(startPos, barWidth, totalDuration);
        
        const playBar = () => {
            if (!this.isPlaying) return;
            
            if (this.currentBar >= this.progression.length) {
                this.stop();
                return;
            }
            
            const bar = this.progression[this.currentBar];
            const chordDuration = barDuration / bar.chords.length;
            
            // Highlight current bar
            this.highlightBar(this.currentBar);
            
            // Scroll drum sequencer to playhead
            this.scrollDrumToPlayhead();
            
            // Play drums for this bar
            this.playDrumPattern(this.currentBar, barDuration);
            
            // Play Channel 2 notes for this bar
            if (this.showChannel2 && !this.muteChannel2 && this.channel2Notes[this.currentBar]) {
                this.playChannel2Notes(this.currentBar, barDuration);
            }
            
            // If multiple chords in bar, highlight per sub-chord
            if (bar.chords.length > 1) {
                bar.chords.forEach((chord, chordIdx) => {
                    setTimeout(() => {
                        // Highlight only notes from this sub-chord
                        this.highlightSubChordNotes(this.currentBar, chordIdx);
                        
                        if (chord && chord.midiNotes && !this.mutePiano) {
                            if (this.arpEnabled) {
                                this.playArpeggio(chord.midiNotes, chordDuration);
                            } else {
                                const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
                                this.synth.triggerAttackRelease(freqs, chordDuration);
                            }
                        }
                    }, chordIdx * chordDuration * 1000);
                });
            } else {
                // Single chord - highlight all notes in bar
                this.highlightCurrentBarNotes(this.currentBar);
                
                bar.chords.forEach((chord, chordIdx) => {
                    setTimeout(() => {
                        if (chord && chord.midiNotes && !this.mutePiano) {
                            if (this.arpEnabled) {
                                this.playArpeggio(chord.midiNotes, chordDuration);
                            } else {
                                const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
                                this.synth.triggerAttackRelease(freqs, chordDuration);
                            }
                        }
                    }, chordIdx * chordDuration * 1000);
                });
            }
            
            // Wait for the FULL bar duration (all sub-chords) before moving to next bar
            setTimeout(() => {
                this.currentBar++;
                
                // Check if we should loop
                const loopEndBar = Math.min(this.loopEnd, this.progression.length);
                
                if (this.currentBar >= loopEndBar) {
                    // Check if we should chain to next pattern
                    if (this.chainPatterns && !this.songMode) {
                        const nextPattern = this.getNextFilledPattern();
                        if (nextPattern) {
                            console.log('🔗 Chaining to pattern:', nextPattern);
                            
                            // Save current pattern before switching
                            this.saveCurrentPattern();
                            
                            // Pre-load next pattern data without UI rebuild
                            if (this.patterns[nextPattern]) {
                                const pattern = this.patterns[nextPattern];
                                this.progression = JSON.parse(JSON.stringify(pattern.progression));
                                this.drumPatterns = JSON.parse(JSON.stringify(pattern.drumPatterns));
                                this.notes = pattern.notes ? JSON.parse(JSON.stringify(pattern.notes)) : {};
                                this.channel2Notes = pattern.channel2Notes ? JSON.parse(JSON.stringify(pattern.channel2Notes)) : {};
                                
                                // Restore Channel 2 settings
                                if (pattern.channel2Settings) {
                                    const settings = pattern.channel2Settings;
                                    this.channel2Source = settings.source;
                                    this.channel2Style = settings.style;
                                    this.channel2Pattern = settings.pattern;
                                    this.channel2Density = settings.density;
                                    this.channel2OctaveRange = settings.octaveRange;
                                    
                                    console.log('🔗 Restored Channel 2 settings:', settings);
                                }
                                
                                // Auto-generate Channel 2 if missing
                                if (this.progression.length > 0 && Object.keys(this.channel2Notes).length === 0 && this.showChannel2) {
                                    console.log('🎵 Auto-generating Channel 2 for chained pattern...');
                                    this.generateChannel2Pattern();
                                }
                            }
                            
                            // Update UI in background
                            this.currentPattern = nextPattern;
                            const label = document.getElementById('currentPatternLabel');
                            if (label) label.textContent = nextPattern;
                            
                            // Update pattern button states
                            document.querySelectorAll('.pattern-btn').forEach(btn => {
                                btn.classList.remove('active');
                            });
                            const activeBtn = document.querySelector(`.pattern-btn[data-pattern="${nextPattern}"]`);
                            if (activeBtn) activeBtn.classList.add('active');
                            
                            // Auto-generate random beat for new pattern if enabled
                            if (this.autoRandomBeats) {
                                this.generateRandomBeatForPattern(nextPattern);
                            }
                            
                            this.currentBar = 0;
                            // Continue playback seamlessly
                            this.playStartTime = performance.now();
                            this.playStartBar = 0;
                            
                            // Rebuild grid async to avoid blocking
                            requestAnimationFrame(() => {
                                this.buildGrid();
                                this.buildDrumGrid();
                            });
                            
                            playBar();
                            return;
                        } else if (!this.loopChain) {
                            // No next pattern and loop chain is OFF - stop
                            this.stop();
                            return;
                        }
                    }
                    
                    if (this.loopEnabled) {
                        this.currentBar = Math.max(0, this.loopStart - 1); // Loop back to loop start
                        playBar();
                    } else {
                        this.stop(); // Stop at loop end
                    }
                } else {
                    playBar();
                }
            }, barDuration * 1000);
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
            
            const gridContainer = document.getElementById('gridContainer');
            const gridRect = gridContainer.getBoundingClientRect();
            const currentStartPos = gridRect.left + 80;
            
            // Calculate which bar we're currently on and progress within that bar
            const barDuration = (60 / this.bpm) * 4;
            const elapsed = (currentTime - this.playStartTime) / 1000;
            
            // Calculate total bars played from start
            const totalBarsPlayed = elapsed / barDuration;
            const currentBarOffset = Math.floor(totalBarsPlayed);
            const progressInCurrentBar = totalBarsPlayed - currentBarOffset;
            
            // Calculate actual bar index considering loop
            let actualBar = this.playStartBar + currentBarOffset;
            
            // Handle looping
            if (this.loopEnabled) {
                const loopLength = this.loopEnd - this.loopStart + 1;
                const barsFromLoopStart = actualBar - (this.loopStart - 1);
                if (barsFromLoopStart >= loopLength) {
                    // Reset to loop start
                    const loopsCompleted = Math.floor(barsFromLoopStart / loopLength);
                    actualBar = (this.loopStart - 1) + (barsFromLoopStart % loopLength);
                    
                    // If we just looped, reset the start time
                    if (Math.floor((elapsed - barDuration * 0.01) / barDuration) !== currentBarOffset) {
                        this.playStartTime = currentTime - (progressInCurrentBar * barDuration * 1000);
                        this.playStartBar = this.loopStart - 1;
                    }
                }
            }
            
            // Calculate playhead position
            const actualBarWidth = this.barWidth || 140;
            
            if (this.followPlayhead) {
                // FOLLOW MODE: Smart scrolling like DAWs
                const gridWrapper = document.querySelector('.grid-wrapper');
                if (gridWrapper) {
                    const wrapperRect = gridWrapper.getBoundingClientRect();
                    const currentPos = (actualBar * actualBarWidth) + (progressInCurrentBar * actualBarWidth);
                    const totalWidth = this.progression.length * actualBarWidth;
                    const viewportWidth = wrapperRect.width;
                    
                    // Calculate playhead position based on scroll state
                    let playheadX;
                    let scrollPos = gridWrapper.scrollLeft;
                    
                    // Phase 1: Playhead moves to center (beginning)
                    if (currentPos < viewportWidth / 2) {
                        playheadX = wrapperRect.left + currentPos + 80;
                        scrollPos = 0;
                    }
                    // Phase 2: Playhead stays center, grid scrolls (middle)
                    else if (currentPos < totalWidth - viewportWidth / 2) {
                        playheadX = wrapperRect.left + (viewportWidth / 2);
                        scrollPos = currentPos - (viewportWidth / 2) + 80;
                    }
                    // Phase 3: Playhead moves to right (end)
                    else {
                        playheadX = wrapperRect.left + (currentPos - (totalWidth - viewportWidth)) + 80;
                        scrollPos = totalWidth - viewportWidth + 80;
                    }
                    
                    this.playheadElement.style.left = playheadX + 'px';
                    gridWrapper.scrollLeft = scrollPos;
                    
                    // Sync drum sequencer
                    const drumWrapper = document.querySelector('.drum-grid-wrapper');
                    if (drumWrapper) {
                        drumWrapper.scrollLeft = scrollPos;
                    }
                }
            } else {
                // STATIC MODE: Playhead moves, grid stays
                const barPosition = currentStartPos + (actualBar * actualBarWidth);
                const position = barPosition + (progressInCurrentBar * actualBarWidth);
                this.playheadElement.style.left = position + 'px';
            }
            
            // Continue animation if playing
            if (this.isPlaying) {
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
        
        // Drum playhead is now universal playhead
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
        
        // Highlight notes in current bar
        document.querySelectorAll('.note-block').forEach(note => {
            if (parseInt(note.dataset.barIndex) === barIndex) {
                note.classList.add('playing');
            }
        });
    }
    
    highlightSubChordNotes(barIndex, chordIndex) {
        // Remove previous highlights (but not arp highlights)
        document.querySelectorAll('.note-block.playing:not(.arp-playing)').forEach(note => {
            note.classList.remove('playing');
        });
        
        // Highlight only notes from this specific sub-chord
        document.querySelectorAll('.note-block').forEach(note => {
            const noteBarIdx = parseInt(note.dataset.barIndex);
            const noteChordIdx = parseInt(note.dataset.chordIndex);
            
            if (noteBarIdx === barIndex && noteChordIdx === chordIndex) {
                note.classList.add('playing');
            }
        });
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
        // Clear all highlights: chord cells, piano cells, drum steps, arp hits
        document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
        document.querySelectorAll('.note-flash').forEach(el => el.classList.remove('note-flash'));
        document.querySelectorAll('.arp-hit').forEach(el => el.classList.remove('arp-hit'));
        
        // Clear drum step highlights with timeout cleanup
        document.querySelectorAll('.drum-step.playing').forEach(el => {
            el.classList.remove('playing');
            if (el.highlightTimeout) {
                clearTimeout(el.highlightTimeout);
                delete el.highlightTimeout;
            }
        });
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

    exportMidi(allPatterns = false) {
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
            
            // Determine which progression to export
            let progressionToExport = [];
            if (allPatterns) {
                // Export all filled patterns
                Object.keys(this.patterns).forEach(patternId => {
                    const pattern = this.patterns[patternId];
                    if (pattern && pattern.progression && pattern.progression.length > 0) {
                        progressionToExport = progressionToExport.concat(pattern.progression);
                    }
                });
            } else {
                // Export current pattern only
                progressionToExport = this.progression;
            }
            
            // Add each bar's chords
            progressionToExport.forEach((bar) => {
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
            const filename = allPatterns ? 'channel1-all-patterns.mid' : `channel1-${this.currentPattern}.mid`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            console.log('✅ Channel 1 MIDI exported:', filename);
        } catch (error) {
            console.error('MIDI Export Error:', error);
            alert('Error: ' + error.message);
        }
    }

    exportChannel2Midi(allPatterns = false) {
        const createMidiFile = () => {
            const header = [0x4D, 0x54, 0x68, 0x64, 0x00, 0x00, 0x00, 0x06, 0x00, 0x00, 0x00, 0x01, 0x01, 0xE0];
            const trackHeader = [0x4D, 0x54, 0x72, 0x6B];
            
            const events = [];
            const ticksPerBeat = 480;
            const beatsPerBar = 4;
            
            // Add tempo event
            const tempo = Math.round(60000000 / this.bpm);
            events.push(0x00, 0xFF, 0x51, 0x03, (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF);
            
            // Determine which Channel 2 notes to export
            let notesToExport = {};
            if (allPatterns) {
                // Export ALL bars from current channel2Notes (entire progression)
                notesToExport = this.channel2Notes;
            } else {
                // Export current pattern only (8 bars)
                const barsPerPattern = 8;
                notesToExport = {};
                for (let i = 0; i < barsPerPattern; i++) {
                    if (this.channel2Notes[i]) {
                        notesToExport[i] = this.channel2Notes[i];
                    }
                }
                
                console.log('Current pattern:', this.currentPattern);
                console.log('Exporting bars:', Object.keys(notesToExport).length);
            }
            
            // Collect all events with absolute time
            const allEvents = [];
            
            console.log('📊 Channel 2 MIDI Export Debug:');
            console.log('Bars to export:', Object.keys(notesToExport).length);
            
            Object.keys(notesToExport).sort((a, b) => parseInt(a) - parseInt(b)).forEach(barIdx => {
                const notes = notesToExport[barIdx];
                if (notes && notes.length > 0) {
                    console.log(`Bar ${barIdx}: ${notes.length} notes`);
                    notes.forEach((note, idx) => {
                        // Calculate absolute tick position
                        const barStartTick = parseInt(barIdx) * beatsPerBar * ticksPerBeat;
                        const noteStartTick = barStartTick + Math.round(note.start * beatsPerBar * ticksPerBeat);
                        const noteDurationTicks = Math.round(note.duration * beatsPerBar * ticksPerBeat);
                        
                        if (idx === 0) {
                            console.log(`  First note: start=${note.start.toFixed(3)}, duration=${note.duration.toFixed(3)}, tick=${noteStartTick}`);
                        }
                        
                        // Add Note ON event
                        allEvents.push({ tick: noteStartTick, type: 'on', midi: note.midi });
                        
                        // Add Note OFF event
                        allEvents.push({ tick: noteStartTick + noteDurationTicks, type: 'off', midi: note.midi });
                    });
                }
            });
            
            console.log('Total events:', allEvents.length);
            
            // Sort all events by tick
            allEvents.sort((a, b) => a.tick - b.tick);
            
            // Convert to MIDI events with delta times
            let lastTick = 0;
            allEvents.forEach(event => {
                const delta = event.tick - lastTick;
                const deltaBytes = this.encodeVariableLength(delta);
                
                if (event.type === 'on') {
                    events.push(...deltaBytes, 0x90, event.midi, 0x60);
                } else {
                    events.push(...deltaBytes, 0x80, event.midi, 0x00);
                }
                
                lastTick = event.tick;
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
            const filename = allPatterns ? 'channel2-all-patterns.mid' : `channel2-${this.currentPattern}.mid`;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);
            console.log('✅ Channel 2 MIDI exported:', filename);
        } catch (error) {
            console.error('Channel 2 MIDI Export Error:', error);
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
        this.saveState();
        this.progression.push({
            barNum: this.progression.length + 1,
            chords: []
        });
        this.buildGrid();
        this.buildDrumGrid(); // Rebuild drum grid with new bar
        this.analyzeProgression();
    }

    deleteBar(index) {
        if (this.progression.length <= 1) {
            alert('Cannot delete the last bar!');
            return;
        }
        this.saveState();
        this.progression.splice(index, 1);
        
        // Delete corresponding drum pattern
        delete this.drumPatterns[index];
        
        // Shift drum patterns down
        const newPatterns = {};
        Object.keys(this.drumPatterns).forEach(key => {
            const barIdx = parseInt(key);
            if (barIdx > index) {
                newPatterns[barIdx - 1] = this.drumPatterns[barIdx];
            } else if (barIdx < index) {
                newPatterns[barIdx] = this.drumPatterns[barIdx];
            }
        });
        this.drumPatterns = newPatterns;
        
        // Don't renumber bars - keep original bar numbers from pattern
        // this.progression.forEach((bar, i) => {
        //     bar.barNum = i + 1;
        // });
        
        this.buildGrid();
        this.buildDrumGrid(); // Rebuild drum grid
        this.analyzeProgression();
    }
    
    clearBarNotes(index) {
        this.saveState();
        const bar = this.progression[index];
        bar.chords = [];
        this.buildGrid();
        this.analyzeProgression();
        console.log(`Cleared notes from bar ${index + 1}`);
    }
    
    splitBar(barIndex) {
        this.saveState();
        const bar = this.progression[barIndex];
        
        // Add a new empty chord to the bar
        bar.chords.push({
            symbol: '-',
            root: 'C',
            quality: '',
            midiNotes: [],
            noteNames: []
        });
        
        this.buildGrid();
        this.analyzeProgression();
        console.log(`Split bar ${barIndex + 1}, now has ${bar.chords.length} sub-chords`);
    }
    
    deleteSubBar(barIndex, chordIndex) {
        if (this.progression[barIndex].chords.length <= 1) {
            alert('Cannot delete the last sub-chord in a bar');
            return;
        }
        
        this.saveState();
        const bar = this.progression[barIndex];
        
        // Remove the chord at chordIndex
        bar.chords.splice(chordIndex, 1);
        
        // Reset selection if deleted chord was selected
        if (this.selectedBar === barIndex && this.selectedChordIndex === chordIndex) {
            this.selectedChordIndex = 0;
        }
        
        this.buildGrid();
        this.analyzeProgression();
        console.log(`Deleted sub-chord ${chordIndex} from bar ${barIndex + 1}`);
    }

    copyBar(index) {
        const bar = this.progression[index];
        if (!bar) return;
        
        // Copy all notes from all chords in this bar
        this.clipboard = [];
        bar.chords.forEach(chord => {
            if (chord && chord.midiNotes) {
                chord.midiNotes.forEach((midi, noteIdx) => {
                    this.clipboard.push({
                        midiNote: midi,
                        noteName: chord.noteNames[noteIdx]
                    });
                });
            }
        });
        
        console.log(`Copied bar ${index + 1} (${this.clipboard.length} notes)`);
        
        // Visual feedback
        const cell = document.querySelectorAll('.chord-cell')[index];
        if (cell) {
            cell.style.animation = 'copyFlash 0.3s';
            setTimeout(() => {
                cell.style.animation = '';
            }, 300);
        }
    }

    selectBar(index) {
        this.selectedBar = index;
        this.selectedChordIndex = 0; // Default to first chord
        
        // Update visual feedback
        document.querySelectorAll('.chord-cell').forEach((cell, idx) => {
            if (idx === index) {
                cell.style.border = '3px solid #00d4ff';
            } else {
                cell.style.border = '';
            }
        });
        
        // Sync chord builder
        this.syncChordBuilderFromBar(index);
    }
    
    selectSubBar(barIndex, chordIndex) {
        this.selectedBar = barIndex;
        this.selectedChordIndex = chordIndex;
        
        // Update drum grid for selected bar
        this.updateDrumGrid();
        
        // Update visual feedback for bar
        document.querySelectorAll('.chord-cell').forEach((cell, idx) => {
            if (idx === barIndex) {
                cell.style.border = '3px solid #00d4ff';
            } else {
                cell.style.border = '';
            }
        });
        
        // Update visual feedback for sub-bars
        document.querySelectorAll('.sub-bar').forEach(subBar => {
            const barIdx = parseInt(subBar.dataset.barIndex);
            const chordIdx = parseInt(subBar.dataset.chordIndex);
            
            if (barIdx === barIndex && chordIdx === chordIndex) {
                subBar.classList.add('selected-sub-bar');
                subBar.style.background = 'rgba(0, 212, 255, 0.2)';
                subBar.style.border = '2px solid #00d4ff';
            } else {
                subBar.classList.remove('selected-sub-bar');
                subBar.style.background = '';
                subBar.style.border = '1px solid #333';
            }
        });
        
        // Sync chord builder with selected sub-chord
        this.syncChordBuilderFromBar(barIndex, chordIndex);
        
        // Preview the chord
        const bar = this.progression[barIndex];
        if (bar && bar.chords[chordIndex]) {
            this.previewChord(bar.chords[chordIndex]);
        }
    }

    editChordText(barIndex, cellElement) {
        const bar = this.progression[barIndex];
        const currentText = bar.chords.map(c => c.symbol).join(' ') || '';
        
        // Create input element
        const input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        input.style.cssText = 'width: 100%; background: #1a1a1a; color: white; border: 2px solid #00d4ff; padding: 0.5rem; font-size: 1rem; text-align: center;';
        
        // Replace cell content temporarily
        const originalContent = cellElement.innerHTML;
        cellElement.innerHTML = '';
        cellElement.appendChild(input);
        input.focus();
        input.select();
        
        const finishEdit = () => {
            const newChordText = input.value.trim();
            
            if (newChordText) {
                // Parse the new chord(s)
                this.saveState();
                const chords = this.parseChordSymbols(newChordText.split(/\s+/));
                bar.chords = chords;
                
                // Rebuild grid to show changes
                this.buildGrid();
                this.analyzeProgression();
            } else {
                // Restore original if empty
                cellElement.innerHTML = originalContent;
            }
        };
        
        input.addEventListener('blur', finishEdit);
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                finishEdit();
            } else if (e.key === 'Escape') {
                cellElement.innerHTML = originalContent;
            }
        });
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

    moveSelectedNotes(barOffset, semitoneOffset) {
        if (this.selectedNotes.size === 0) return;
        
        this.saveState();
        
        // Collect notes to move
        const notesToMove = [];
        this.selectedNotes.forEach(noteKey => {
            const [midi, barIdx, chordIdx] = noteKey.split('-').map(Number);
            notesToMove.push({ midi, barIdx, chordIdx });
        });
        
        // Clear selection temporarily
        this.selectedNotes.clear();
        
        // Remove old notes and collect new positions
        const newNotes = [];
        notesToMove.forEach(({ midi, barIdx, chordIdx }) => {
            const bar = this.progression[barIdx];
            if (!bar) return;
            
            const chord = bar.chords[chordIdx];
            if (!chord) return;
            
            // Remove note from old position
            const noteIndex = chord.midiNotes.indexOf(midi);
            if (noteIndex !== -1) {
                chord.midiNotes.splice(noteIndex, 1);
                chord.noteNames.splice(noteIndex, 1);
                
                if (chord.midiNotes.length === 0) {
                    bar.chords.splice(chordIdx, 1);
                } else {
                    // Re-sort and update
                    chord.midiNotes.sort((a, b) => a - b);
                    chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                    chord.symbol = this.recognizeChord(chord.midiNotes);
                }
                
                // Calculate new position
                const newBarIdx = barIdx + barOffset;
                const newMidi = Math.max(0, Math.min(127, midi + semitoneOffset));
                
                // Check if new bar exists
                if (newBarIdx >= 0 && newBarIdx < this.progression.length) {
                    newNotes.push({ midi: newMidi, barIdx: newBarIdx });
                }
            }
        });
        
        // Add notes at new positions and track new note keys
        const newNoteKeys = [];
        newNotes.forEach(({ midi, barIdx }) => {
            const bar = this.progression[barIdx];
            let chordIdx = 0;
            
            if (bar.chords.length === 0) {
                // Create new chord
                const noteName = this.midiToNote(midi);
                bar.chords = [{
                    symbol: noteName, // Full note name WITH octave for single notes
                    root: '',
                    quality: '',
                    midiNotes: [midi],
                    noteNames: [noteName]
                }];
                chordIdx = 0;
            } else {
                // Add to first chord
                const chord = bar.chords[0];
                if (!chord.midiNotes.includes(midi)) {
                    chord.midiNotes.push(midi);
                }
                // Always re-sort and re-recognize (even if note existed)
                chord.midiNotes.sort((a, b) => a - b);
                chord.noteNames = chord.midiNotes.map(m => this.midiToNote(m));
                chord.symbol = this.recognizeChord(chord.midiNotes);
                chordIdx = 0;
            }
            
            // Track new note key for re-selection
            newNoteKeys.push(`${midi}-${barIdx}-${chordIdx}`);
        });
        
        this.buildGrid();
        
        // Re-select the moved notes at their new positions
        newNoteKeys.forEach(key => this.selectedNotes.add(key));
        this.updateNoteSelection(); // This calls updateIntervalAnalysis
        
        // Update chord builder for the target bar (real-time sync)
        if (newNotes.length > 0) {
            const targetBarIdx = newNotes[0].barIdx;
            this.syncChordBuilderFromBar(targetBarIdx);
            
            // Also select that bar visually (AFTER buildGrid)
            this.selectBar(targetBarIdx);
        }
        
        // Analyze progression AFTER selection update
        this.analyzeProgression();
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

    // Chord Designer Functions
    updateChordDisplay() {
        const root = document.getElementById('rootNoteSelect').value;
        const activeBtn = document.querySelector('.quality-btn.active');
        const quality = activeBtn ? activeBtn.dataset.quality : '';
        const bassNote = document.getElementById('bassNoteSelect').value;
        
        let chordSymbol = root + quality;
        if (bassNote) {
            chordSymbol += '/' + bassNote;
        }
        
        document.getElementById('chordDisplay').value = chordSymbol;
    }

    applyChordToSelectedBar() {
        console.log('applyChordToSelectedBar called, selectedBar:', this.selectedBar);
        
        if (this.selectedBar === null || this.selectedBar === undefined) {
            alert('Please select a bar first by clicking on a chord cell');
            return;
        }
        
        const root = document.getElementById('rootNoteSelect').value;
        const activeBtn = document.querySelector('.quality-btn.active');
        const quality = activeBtn ? activeBtn.dataset.quality : '';
        const bassNote = document.getElementById('bassNoteSelect').value;
        const octave = parseInt(document.getElementById('octaveSelect').value);
        const inversion = parseInt(document.getElementById('inversionSelect').value);
        
        console.log('Applying chord:', root, quality, 'octave:', octave, 'inversion:', inversion);
        
        if (!root) {
            alert('Please select a root note');
            return;
        }
        
        // Build chord symbol for MIDI conversion
        const baseChordSymbol = root + quality;
        
        // Convert to MIDI notes
        let midiNotes = this.chordSymbolToMidi(baseChordSymbol, octave);
        
        if (!midiNotes || midiNotes.length === 0) {
            alert('Could not build chord');
            return;
        }
        
        // Apply inversion
        if (inversion > 0 && midiNotes.length > inversion) {
            for (let i = 0; i < inversion; i++) {
                const lowestNote = midiNotes.shift();
                midiNotes.push(lowestNote + 12); // Move to next octave
            }
            midiNotes.sort((a, b) => a - b);
        }
        
        // Add bass note if specified
        if (bassNote) {
            const bassNoteMap = {
                'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
                'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
            };
            const bassMidi = bassNoteMap[bassNote] + ((octave - 1) * 12); // One octave lower
            if (!midiNotes.includes(bassMidi)) {
                midiNotes.unshift(bassMidi);
            }
        }
        
        // Apply to selected bar and chord
        this.saveState();
        const bar = this.progression[this.selectedBar];
        const chordIndex = this.selectedChordIndex || 0;
        
        // Build note names
        const noteNames = midiNotes.map(m => this.midiToNote(m));
        
        // Build chord symbol with inversion notation
        let chordSymbol = root + quality;
        if (inversion === 1) {
            chordSymbol += '/1';
        } else if (inversion === 2) {
            chordSymbol += '/2';
        } else if (inversion === 3) {
            chordSymbol += '/3';
        }
        
        // Update only the selected chord within the bar
        bar.chords[chordIndex] = {
            symbol: chordSymbol,
            root: root,
            quality: quality,
            midiNotes: midiNotes,
            noteNames: noteNames
        };
        
        // Play the chord notes
        midiNotes.forEach(midi => this.playNote(midi));
        
        this.buildGrid();
        this.analyzeProgression();
        
        // Force update chord designer display
        document.getElementById('chordDisplay').value = recognizedSymbol;
        
        // Sync chord designer from the updated bar
        this.syncChordBuilderFromBar(this.selectedBar);
    }

    chordSymbolToMidi(symbol, octave = 4) {
        // Parse chord symbol and convert to MIDI notes
        const noteMap = {
            'C': 0, 'C#': 1, 'D': 2, 'D#': 3, 'E': 4, 'F': 5,
            'F#': 6, 'G': 7, 'G#': 8, 'A': 9, 'A#': 10, 'B': 11
        };
        
        // Extract root note
        let root = symbol.match(/^[A-G]#?/)[0];
        let quality = symbol.substring(root.length);
        
        const rootMidi = noteMap[root] + (octave * 12);
        const notes = [rootMidi];
        
        // Add intervals based on quality
        if (quality === '' || quality === 'maj') {
            // Major: root, major 3rd, perfect 5th
            notes.push(rootMidi + 4, rootMidi + 7);
        } else if (quality === 'm') {
            // Minor: root, minor 3rd, perfect 5th
            notes.push(rootMidi + 3, rootMidi + 7);
        } else if (quality === '7') {
            // Dominant 7: root, major 3rd, perfect 5th, minor 7th
            notes.push(rootMidi + 4, rootMidi + 7, rootMidi + 10);
        } else if (quality === 'maj7') {
            // Major 7: root, major 3rd, perfect 5th, major 7th
            notes.push(rootMidi + 4, rootMidi + 7, rootMidi + 11);
        } else if (quality === 'm7') {
            // Minor 7: root, minor 3rd, perfect 5th, minor 7th
            notes.push(rootMidi + 3, rootMidi + 7, rootMidi + 10);
        } else if (quality === 'dim') {
            // Diminished: root, minor 3rd, diminished 5th
            notes.push(rootMidi + 3, rootMidi + 6);
        } else if (quality === 'aug') {
            // Augmented: root, major 3rd, augmented 5th
            notes.push(rootMidi + 4, rootMidi + 8);
        } else if (quality === 'sus4') {
            // Sus4: root, perfect 4th, perfect 5th
            notes.push(rootMidi + 5, rootMidi + 7);
        } else if (quality === 'sus2') {
            // Sus2: root, major 2nd, perfect 5th
            notes.push(rootMidi + 2, rootMidi + 7);
        }
        
        return notes;
    }

    syncChordBuilderFromBar(barIndex, chordIndex = 0) {
        // Update chord designer UI based on selected bar and chord
        const bar = this.progression[barIndex];
        const inversionSelect = document.getElementById('inversionSelect');
        
        // Use selectedChordIndex if available
        if (this.selectedChordIndex !== undefined) {
            chordIndex = this.selectedChordIndex;
        }
        
        if (!bar || !bar.chords || bar.chords.length === 0 || !bar.chords[chordIndex]) {
            // Clear chord designer
            document.getElementById('rootNoteSelect').value = 'C';
            document.getElementById('chordDisplay').value = '-';
            document.getElementById('bassNoteSelect').value = '';
            document.getElementById('voicesDisplay').textContent = '3';
            if (inversionSelect) {
                inversionSelect.value = '0';
                inversionSelect.style.color = '';
            }
            // Reset to Maj
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            document.querySelector('.quality-btn[data-quality=""]')?.classList.add('active');
            return;
        }
        
        const chord = bar.chords[chordIndex];
        
        // Update voice count display
        if (chord.midiNotes && chord.midiNotes.length > 0) {
            document.getElementById('voicesDisplay').textContent = chord.midiNotes.length;
            
            // Update octave display (from lowest note)
            const sortedNotes = [...chord.midiNotes].sort((a, b) => a - b);
            const lowestNote = this.midiToNote(sortedNotes[0]);
            const octave = lowestNote.match(/\d+/)[0];
            document.getElementById('octaveDisplay').textContent = octave;
            
            // Update arpeggio display (lowest note with inversion)
            const inversionLabel = chord.symbol.includes('/') ? chord.symbol.split('/')[1] : 'R';
            document.getElementById('arpeggioDisplay').textContent = `${lowestNote} (${inversionLabel})`;
        }
        
        // Handle single note (just root with octave)
        if (chord.midiNotes && chord.midiNotes.length === 1) {
            const fullNoteName = this.midiToNote(chord.midiNotes[0]); // e.g. "C4"
            const noteName = fullNoteName.replace(/\d+/, ''); // e.g. "C"
            const octave = fullNoteName.match(/\d+/)[0]; // e.g. "4"
            
            document.getElementById('rootNoteSelect').value = noteName;
            document.getElementById('chordDisplay').value = fullNoteName; // Show with octave
            // Clear quality buttons for single note
            document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
            console.log('Synced single note:', fullNoteName);
            return;
        }
        
        // Try to extract root and quality from symbol
        if (chord.symbol && chord.symbol !== '?') {
            const match = chord.symbol.match(/^([A-G]#?)(.*)$/);
            if (match) {
                const root = match[1];
                let quality = match[2];
                
                // Handle dyad intervals (e.g. "C min3", "G 5 (Perfect)")
                if (quality.includes('min2') || quality.includes('maj2') || 
                    quality.includes('min3') || quality.includes('maj3') ||
                    quality.includes('min6') || quality.includes('maj6') ||
                    quality.includes('min7') || quality.includes('maj7') ||
                    quality.includes('5 (') || quality.includes('oct')) {
                    // It's a dyad/interval - just show root
                    document.getElementById('rootNoteSelect').value = root;
                    document.getElementById('chordDisplay').value = chord.symbol;
                    document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                    console.log('Synced dyad/interval:', chord.symbol);
                    return;
                }
                
                // Update root dropdown
                const rootSelect = document.getElementById('rootNoteSelect');
                if (rootSelect) {
                    rootSelect.value = root;
                    console.log('Set root note to:', root, 'dropdown value:', rootSelect.value);
                }
                
                // Update quality button
                document.querySelectorAll('.quality-btn').forEach(b => b.classList.remove('active'));
                const qualityBtn = document.querySelector(`.quality-btn[data-quality="${quality}"]`);
                if (qualityBtn) {
                    qualityBtn.classList.add('active');
                } else {
                    // Default to Maj if quality not found
                    document.querySelector('.quality-btn[data-quality=""]')?.classList.add('active');
                }
                
                // Detect inversion from chord symbol
                let detectedInversion = 0;
                if (chord.symbol.includes('/1')) {
                    detectedInversion = 1;
                } else if (chord.symbol.includes('/2')) {
                    detectedInversion = 2;
                } else if (chord.symbol.includes('/3')) {
                    detectedInversion = 3;
                }
                
                // Update inversion dropdown
                if (inversionSelect) {
                    inversionSelect.value = detectedInversion.toString();
                    inversionSelect.style.color = ''; // Normal color when detected
                }
                
                // Update chord display
                document.getElementById('chordDisplay').value = chord.symbol;
                
                // Also update chord display via updateChordDisplay
                this.updateChordDisplay();
                
                console.log('Synced chord designer:', root, quality, 'inversion:', detectedInversion);
            }
        }
    }

    // Step functions for quick navigation
    stepArpeggio(direction) {
        // Get current chord from selected bar
        if (this.selectedBar === null || this.selectedBar === undefined) {
            return;
        }
        
        const bar = this.progression[this.selectedBar];
        const chordIndex = this.selectedChordIndex || 0;
        
        if (!bar || !bar.chords || bar.chords.length === 0 || !bar.chords[chordIndex]) {
            return;
        }
        
        const chord = bar.chords[chordIndex];
        if (!chord.midiNotes || chord.midiNotes.length === 0) {
            return;
        }
        
        // Get base chord intervals (without octave/inversion)
        const sortedNotes = [...chord.midiNotes].sort((a, b) => a - b);
        const baseRoot = sortedNotes[0] % 12; // C=0, C#=1, etc.
        const intervals = sortedNotes.map(n => (n - sortedNotes[0]) % 12).filter((v, i, a) => a.indexOf(v) === i).sort((a, b) => a - b);
        
        // Initialize state if needed
        if (this.arpeggioState === undefined) {
            this.arpeggioState = {
                octave: 4,
                inversion: 0,
                noteIndex: 0
            };
        }
        
        const state = this.arpeggioState;
        
        // Step through inversions and octaves (not individual notes)
        if (direction > 0) {
            state.inversion++;
            if (state.inversion >= intervals.length) {
                state.inversion = 0;
                state.octave++;
                if (state.octave > 6) state.octave = 2; // Wrap around
            }
        } else {
            state.inversion--;
            if (state.inversion < 0) {
                state.octave--;
                if (state.octave < 2) state.octave = 6; // Wrap around
                state.inversion = intervals.length - 1;
            }
        }
        
        // Build the chord with current inversion
        let chordNotes = [...intervals];
        for (let i = 0; i < state.inversion; i++) {
            const lowest = chordNotes.shift();
            chordNotes.push(lowest + 12);
        }
        chordNotes.sort((a, b) => a - b);
        
        // Build full chord MIDI notes
        const fullChord = chordNotes.map(interval => baseRoot + state.octave * 12 + interval);
        
        // Get display name (lowest note)
        const lowestNote = this.midiToNote(fullChord[0]);
        const invLabel = state.inversion === 0 ? 'R' : state.inversion;
        
        // Update display
        document.getElementById('arpeggioDisplay').textContent = `${lowestNote} (${invLabel})`;
        
        // Update the actual chord in the selected bar
        this.saveState();
        const noteNames = fullChord.map(m => this.midiToNote(m));
        
        // Build chord symbol with inversion notation
        const rootNoteName = this.midiToNote(sortedNotes[0]).replace(/\d+/, ''); // Original root without octave
        let chordSymbol = rootNoteName;
        if (chord.quality) {
            chordSymbol += chord.quality;
        }
        // Add inversion notation
        if (state.inversion > 0) {
            chordSymbol += `/${state.inversion}`;
        }
        
        // Play chord FIRST (before rebuild)
        fullChord.forEach(midi => this.playNote(midi));
        
        // Then update the chord data
        bar.chords[chordIndex] = {
            symbol: chordSymbol,
            root: chord.root || '',
            quality: chord.quality || '',
            midiNotes: fullChord,
            noteNames: noteNames
        };
        
        // Rebuild grid and analyze
        this.buildGrid();
        this.analyzeProgression();
        
        // Sync chord designer
        this.syncChordBuilderFromBar(this.selectedBar);
    }

    stepVoiceCount(direction) {
        // Add or remove notes from the current chord
        if (this.selectedBar === null || this.selectedBar === undefined) {
            return;
        }
        
        const bar = this.progression[this.selectedBar];
        const chordIndex = this.selectedChordIndex || 0;
        
        if (!bar || !bar.chords || bar.chords.length === 0 || !bar.chords[chordIndex]) {
            return;
        }
        
        const chord = bar.chords[chordIndex];
        if (!chord.midiNotes || chord.midiNotes.length === 0) {
            return;
        }
        
        this.saveState();
        const sortedNotes = [...chord.midiNotes].sort((a, b) => a - b);
        const root = sortedNotes[0];
        
        // Add or remove notes based on direction
        let newNotes = [...sortedNotes];
        
        if (direction > 0 && newNotes.length < 7) {
            // Add a note (extend the chord)
            // Add the next interval in the scale (3rd, 5th, 7th, 9th, 11th, 13th)
            const intervals = [0, 4, 7, 10, 14, 17, 21]; // Root, 3rd, 5th, 7th, 9th, 11th, 13th
            const currentIntervals = newNotes.map(n => (n - root) % 12);
            
            // Find next interval to add
            for (let interval of intervals) {
                if (!currentIntervals.includes(interval % 12)) {
                    const octaveAdjust = Math.floor(interval / 12) * 12;
                    newNotes.push(root + (interval % 12) + octaveAdjust);
                    break;
                }
            }
            newNotes.sort((a, b) => a - b);
        } else if (direction < 0 && newNotes.length > 1) {
            // Remove the highest note
            newNotes.pop();
        }
        
        // Play chord FIRST
        newNotes.forEach(midi => this.playNote(midi));
        
        // Update chord
        const noteNames = newNotes.map(m => this.midiToNote(m));
        const chordSymbol = this.recognizeChord(newNotes);
        
        bar.chords[chordIndex] = {
            symbol: chordSymbol,
            root: chord.root || '',
            quality: chord.quality || '',
            midiNotes: newNotes,
            noteNames: noteNames
        };
        
        // Update display
        document.getElementById('voicesDisplay').textContent = newNotes.length;
        
        // Rebuild and sync
        this.buildGrid();
        this.analyzeProgression();
        this.syncChordBuilderFromBar(this.selectedBar);
    }

    stepRootNote(direction) {
        const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        const rootSelect = document.getElementById('rootNoteSelect');
        const currentIndex = notes.indexOf(rootSelect.value);
        const newIndex = (currentIndex + direction + notes.length) % notes.length;
        rootSelect.value = notes[newIndex];
        
        // Update display
        document.getElementById('rootDisplay').textContent = notes[newIndex];
        
        this.updateChordDisplay();
        if (document.getElementById('chordLock').checked) {
            this.applyChordToSelectedBar();
        }
    }

    stepOctave(direction) {
        const octaveSelect = document.getElementById('octaveSelect');
        const current = parseInt(octaveSelect.value);
        const newValue = Math.max(2, Math.min(6, current + direction));
        octaveSelect.value = newValue;
        
        // Update display
        document.getElementById('octaveDisplay').textContent = newValue;
        
        if (document.getElementById('chordLock').checked) {
            this.applyChordToSelectedBar();
        }
    }

    stepInversion(direction) {
        const inversionSelect = document.getElementById('inversionSelect');
        const current = parseInt(inversionSelect.value);
        const newValue = Math.max(0, Math.min(3, current + direction));
        inversionSelect.value = newValue;
        
        // Update display
        const invLabels = ['0', '1', '2', '3'];
        document.getElementById('inversionDisplay').textContent = invLabels[newValue];
        
        if (document.getElementById('chordLock').checked) {
            this.applyChordToSelectedBar();
        }
    }

    // Modulation Matrix Functions
    setupModulationControls() {
        // LFO 1 controls
        document.getElementById('lfo1Rate')?.addEventListener('change', (e) => {
            this.modulation.lfo1.rate = parseFloat(e.target.value);
            this.updateModStatus();
        });
        
        document.getElementById('lfo1Depth')?.addEventListener('input', (e) => {
            this.modulation.lfo1.depth = parseInt(e.target.value) / 100;
            document.getElementById('lfo1DepthValue').textContent = e.target.value + '%';
        });
        
        // LFO 2 controls
        document.getElementById('lfo2Rate')?.addEventListener('change', (e) => {
            this.modulation.lfo2.rate = parseFloat(e.target.value);
            this.updateModStatus();
        });
        
        document.getElementById('lfo2Depth')?.addEventListener('input', (e) => {
            this.modulation.lfo2.depth = parseInt(e.target.value) / 100;
            document.getElementById('lfo2DepthValue').textContent = e.target.value + '%';
        });
        
        // Waveform buttons
        document.querySelectorAll('.wave-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lfo = btn.dataset.lfo;
                const wave = btn.dataset.wave;
                
                // Update active state
                document.querySelectorAll(`.wave-btn[data-lfo="${lfo}"]`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update modulation
                if (lfo === '1') {
                    this.modulation.lfo1.waveform = wave;
                } else {
                    this.modulation.lfo2.waveform = wave;
                }
                
                this.updateModStatus();
            });
        });
        
        // Learn buttons
        document.querySelectorAll('.learn-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const lfo = btn.dataset.lfo;
                this.startLearning(lfo);
            });
        });
        
        // Make Quick Controls mappable
        this.makeParameterMappable('rootDisplay', 'root');
        this.makeParameterMappable('octaveDisplay', 'octave');
        this.makeParameterMappable('inversionDisplay', 'inversion');
        this.makeParameterMappable('voicesDisplay', 'voices');
        
        // Make other controls mappable
        this.makeSliderMappable('filterCutoff', 'filterCutoff');
        this.makeSliderMappable('filterResonance', 'filterResonance');
        this.makeSliderMappable('volume', 'volume');
        this.makeSliderMappable('delayTime', 'delayTime');
        this.makeSliderMappable('delayFeedback', 'delayFeedback');
        this.makeSliderMappable('reverbWet', 'reverbWet');
    }
    
    makeSliderMappable(elementId, paramName) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        // Wrap slider in a clickable container
        const wrapper = document.createElement('div');
        wrapper.classList.add('mappable-param');
        wrapper.dataset.param = paramName;
        wrapper.style.display = 'inline-block';
        wrapper.style.width = '100%';
        
        element.parentNode.insertBefore(wrapper, element);
        wrapper.appendChild(element);
        
        wrapper.addEventListener('click', (e) => {
            if (this.modulation.learningMode) {
                e.preventDefault();
                e.stopPropagation();
                this.mapParameter(paramName);
            }
        });
    }
    
    makeParameterMappable(elementId, paramName) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.add('mappable-param');
        element.dataset.param = paramName;
        
        element.addEventListener('click', () => {
            if (this.modulation.learningMode) {
                this.mapParameter(paramName);
            }
        });
    }
    
    startLearning(lfo) {
        // Toggle learning mode
        if (this.modulation.learningMode && this.modulation.learningLFO === lfo) {
            this.stopLearning();
            return;
        }
        
        this.modulation.learningMode = true;
        this.modulation.learningLFO = lfo;
        
        // Update UI
        document.querySelectorAll('.learn-btn').forEach(btn => {
            btn.classList.remove('learning');
        });
        document.getElementById(`learn${lfo.toUpperCase()}`).classList.add('learning');
        
        document.getElementById('learnStatus').textContent = `🎯 Click a parameter to map to ${lfo.toUpperCase()}...`;
    }
    
    stopLearning() {
        this.modulation.learningMode = false;
        this.modulation.learningLFO = null;
        
        document.querySelectorAll('.learn-btn').forEach(btn => {
            btn.classList.remove('learning');
        });
        
        document.getElementById('learnStatus').textContent = '';
    }
    
    mapParameter(paramName) {
        if (!this.modulation.learningMode) return;
        
        const lfo = this.modulation.learningLFO;
        
        // Remove existing mapping for this param
        if (this.modulation.routing[paramName]) {
            delete this.modulation.routing[paramName];
        }
        
        // Add new mapping
        this.modulation.routing[paramName] = lfo;
        
        // Update UI
        document.getElementById('learnStatus').textContent = `✅ Mapped ${paramName} to ${lfo.toUpperCase()}`;
        
        // Update visual feedback
        document.querySelectorAll('.mappable-param').forEach(el => {
            if (el.dataset.param === paramName) {
                el.classList.add('mapped');
            }
        });
        
        this.updateActiveMappings();
        this.updateModStatus();
        this.stopLearning();
    }
    
    updateActiveMappings() {
        const mappings = Object.entries(this.modulation.routing);
        const container = document.getElementById('activeMappings');
        
        if (mappings.length === 0) {
            container.textContent = 'No mappings yet';
            container.style.color = '#888';
            return;
        }
        
        container.innerHTML = mappings.map(([param, lfo]) => 
            `<div style="display: flex; justify-content: space-between; padding: 0.25rem 0;">
                <span>${param}</span>
                <span style="color: #00d4ff;">${lfo.toUpperCase()}</span>
                <button onclick="app.unmapParameter('${param}')" style="background: #ff4444; border: none; color: white; padding: 0.1rem 0.4rem; border-radius: 3px; cursor: pointer;">×</button>
            </div>`
        ).join('');
        container.style.color = '#ccc';
    }
    
    unmapParameter(paramName) {
        delete this.modulation.routing[paramName];
        
        document.querySelectorAll('.mappable-param').forEach(el => {
            if (el.dataset.param === paramName) {
                el.classList.remove('mapped');
            }
        });
        
        this.updateActiveMappings();
        this.updateModStatus();
    }
    
    openModMatrix() {
        document.getElementById('modMatrixPanel').style.display = 'flex';
    }
    
    closeModMatrix() {
        document.getElementById('modMatrixPanel').style.display = 'none';
    }
    
    updateModStatus() {
        // Update widget status
        const getWaveLabel = (wave) => {
            if (wave === 'random') return 'Rnd';
            return wave.charAt(0).toUpperCase() + wave.slice(1, 3);
        };
        const lfo1Wave = getWaveLabel(this.modulation.lfo1.waveform);
        const lfo2Wave = getWaveLabel(this.modulation.lfo2.waveform);
        
        const rateToString = (rate) => {
            if (rate === 1) return '1';
            if (rate === 0.5) return '1/2';
            if (rate === 0.25) return '1/4';
            if (rate === 0.125) return '1/8';
            if (rate === 0.0625) return '1/16';
            return rate.toString();
        };
        
        document.getElementById('lfo1Status').textContent = `${rateToString(this.modulation.lfo1.rate)} ${lfo1Wave}`;
        document.getElementById('lfo2Status').textContent = `${rateToString(this.modulation.lfo2.rate)} ${lfo2Wave}`;
        
        const activeCount = Object.keys(this.modulation.routing).length;
        document.getElementById('modActiveCount').textContent = `${activeCount} active`;
    }
    
    getLFOValue(lfoName, time) {
        const lfo = this.modulation[lfoName];
        if (!lfo) return 0;
        
        // Calculate phase based on time and rate
        const phase = (time * lfo.rate + lfo.phase) % 1;
        
        // Generate waveform
        let value = 0;
        switch (lfo.waveform) {
            case 'sine':
                value = Math.sin(phase * Math.PI * 2);
                break;
            case 'triangle':
                value = phase < 0.5 ? (phase * 4 - 1) : (3 - phase * 4);
                break;
            case 'square':
                value = phase < 0.5 ? 1 : -1;
                break;
            case 'sawtooth':
                value = phase * 2 - 1;
                break;
            case 'random':
                // Sample & hold random - changes at each cycle
                value = (Math.sin(Math.floor(phase * 8) * 12345.6789) * 2) - 1;
                break;
        }
        
        return value * lfo.depth;
    }
    
    applyModulation(paramName, baseValue, time) {
        const routing = this.modulation.routing[paramName];
        if (!routing) return baseValue;
        
        const lfoValue = this.getLFOValue(routing, time);
        
        // Apply modulation based on parameter type
        switch (paramName) {
            case 'octave':
                // Modulate between 2-6
                return Math.round(Math.max(2, Math.min(6, baseValue + lfoValue * 2)));
            case 'inversion':
                // Modulate between 0-3
                return Math.round(Math.max(0, Math.min(3, baseValue + lfoValue * 2)));
            case 'voices':
                // Modulate between 1-7
                return Math.round(Math.max(1, Math.min(7, baseValue + lfoValue * 3)));
            case 'bpm':
                // Modulate BPM ±20%
                return Math.round(Math.max(60, Math.min(200, baseValue + lfoValue * baseValue * 0.2)));
            case 'filterCutoff':
                // Modulate filter cutoff 20Hz - 20000Hz
                return Math.max(20, Math.min(20000, baseValue + lfoValue * 5000));
            case 'filterResonance':
                // Modulate resonance 0-30
                return Math.max(0, Math.min(30, baseValue + lfoValue * 10));
            case 'volume':
                // Modulate volume 0-100
                return Math.max(0, Math.min(100, baseValue + lfoValue * 30));
            case 'delayTime':
            case 'delayFeedback':
            case 'reverbWet':
                // Modulate 0-1 range
                return Math.max(0, Math.min(1, baseValue + lfoValue * 0.3));
            default:
                return baseValue;
        }
    }
    
    startLFOMeterAnimation() {
        const updateMeters = () => {
            const currentTime = (performance.now() - this.modulation.startTime) / 1000;
            
            // Update LFO meters
            const lfo1Value = this.getLFOValue('lfo1', currentTime);
            const lfo1Percent = ((lfo1Value + 1) / 2) * 100; // Convert -1..1 to 0..100
            document.getElementById('lfo1Meter').style.width = lfo1Percent + '%';
            
            const lfo2Value = this.getLFOValue('lfo2', currentTime);
            const lfo2Percent = ((lfo2Value + 1) / 2) * 100;
            document.getElementById('lfo2Meter').style.width = lfo2Percent + '%';
            
            // Apply modulation to parameters during playback
            if (this.isPlaying) {
                this.applyLFOModulation(currentTime);
            }
            
            requestAnimationFrame(updateMeters);
        };
        
        requestAnimationFrame(updateMeters);
    }
    
    applyLFOModulation(time) {
        // Apply modulation to each mapped parameter
        Object.entries(this.modulation.routing).forEach(([param, lfo]) => {
            const element = document.getElementById(param);
            if (!element) return;
            
            const baseValue = parseFloat(element.value || element.textContent);
            const modulatedValue = this.applyModulation(param, baseValue, time);
            
            // Apply to actual parameter
            switch (param) {
                case 'filterCutoff':
                    if (this.filter) {
                        this.filter.frequency.value = modulatedValue;
                    }
                    break;
                case 'filterResonance':
                    if (this.filter) {
                        this.filter.Q.value = modulatedValue;
                    }
                    break;
                case 'volume':
                    if (this.synth) {
                        this.synth.volume.value = Tone.gainToDb(modulatedValue / 100);
                    }
                    break;
                case 'delayTime':
                    if (this.delay) {
                        this.delay.delayTime.value = modulatedValue;
                    }
                    break;
                case 'delayFeedback':
                    if (this.delay) {
                        this.delay.feedback.value = modulatedValue;
                    }
                    break;
                case 'reverbWet':
                    if (this.reverb) {
                        this.reverb.wet.value = modulatedValue;
                    }
                    break;
            }
        });
    }
    
    loadSynthPreset(presetName) {
        const presets = {
            pad: {
                waveform: 'sine',
                attack: 0.8,
                decay: 0.3,
                sustain: 0.7,
                release: 1.5,
                filterCutoff: 800,
                filterResonance: 2
            },
            lead: {
                waveform: 'sawtooth',
                attack: 0.01,
                decay: 0.2,
                sustain: 0.5,
                release: 0.3,
                filterCutoff: 3000,
                filterResonance: 5
            },
            bass: {
                waveform: 'square',
                attack: 0.01,
                decay: 0.1,
                sustain: 0.8,
                release: 0.2,
                filterCutoff: 400,
                filterResonance: 3
            },
            pluck: {
                waveform: 'triangle',
                attack: 0.001,
                decay: 0.3,
                sustain: 0.0,
                release: 0.5,
                filterCutoff: 2000,
                filterResonance: 1
            }
        };
        
        const preset = presets[presetName];
        if (!preset) return;
        
        // Apply preset to synth
        this.synth.set({
            oscillator: { type: preset.waveform },
            envelope: {
                attack: preset.attack,
                decay: preset.decay,
                sustain: preset.sustain,
                release: preset.release
            }
        });
        
        // Update UI
        document.getElementById('waveform').value = preset.waveform;
        document.getElementById('attack').value = preset.attack;
        document.getElementById('attackValue').textContent = preset.attack.toFixed(2) + 's';
        document.getElementById('decay').value = preset.decay;
        document.getElementById('decayValue').textContent = preset.decay.toFixed(2) + 's';
        document.getElementById('sustain').value = preset.sustain;
        document.getElementById('sustainValue').textContent = preset.sustain.toFixed(2);
        document.getElementById('release').value = preset.release;
        document.getElementById('releaseValue').textContent = preset.release.toFixed(2) + 's';
        document.getElementById('filterCutoff').value = preset.filterCutoff;
        document.getElementById('filterResonance').value = preset.filterResonance;
        
        // Apply filter settings
        this.filter.frequency.value = preset.filterCutoff;
        this.filter.Q.value = preset.filterResonance;
        
        console.log(`Loaded preset: ${presetName}`);
    }
    
    // Drum Sequencer Functions
    createDrumSounds() {
        this.drumSounds = {
            kick: new Tone.MembraneSynth({
                pitchDecay: 0.05,
                octaves: 10,
                oscillator: { type: 'sine' },
                envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: 'exponential' }
            }).toDestination(),
            
            snare: new Tone.NoiseSynth({
                noise: { type: 'white' },
                envelope: { attack: 0.001, decay: 0.2, sustain: 0 }
            }).toDestination(),
            
            hihat: new Tone.MetalSynth({
                frequency: 200,
                envelope: { attack: 0.001, decay: 0.1, release: 0.01 },
                harmonicity: 5.1,
                modulationIndex: 32,
                resonance: 4000,
                octaves: 1.5
            }).toDestination(),
            
            clap: new Tone.NoiseSynth({
                noise: { type: 'pink' },
                envelope: { attack: 0.001, decay: 0.15, sustain: 0 }
            }).toDestination()
        };
        
        // Set volumes
        this.drumSounds.kick.volume.value = -10;
        this.drumSounds.snare.volume.value = -15;
        this.drumSounds.hihat.volume.value = -20;
        this.drumSounds.clap.volume.value = -18;
    }
    
    buildDrumGrid() {
        const container = document.getElementById('drumGrid');
        if (!container) return;
        
        container.innerHTML = '';
        
        const drums = [
            { name: 'Kick', key: 'kick' },
            { name: 'Snare', key: 'snare' },
            { name: 'Hi-Hat', key: 'hihat' },
            { name: 'Clap', key: 'clap' }
        ];
        
        // Add bar numbers row
        const barNumbers = document.createElement('div');
        barNumbers.className = 'drum-bar-numbers';
        this.progression.forEach((bar, barIdx) => {
            const barNum = document.createElement('div');
            barNum.className = 'drum-bar-number';
            barNum.textContent = `Bar ${bar.barNum}`;
            barNumbers.appendChild(barNum);
        });
        container.appendChild(barNumbers);
        
        // Build each drum track horizontally across all bars
        drums.forEach(drum => {
            const track = document.createElement('div');
            track.className = 'drum-track';
            
            const label = document.createElement('div');
            label.className = 'drum-label';
            label.textContent = drum.name;
            track.appendChild(label);
            
            // Add steps for each bar
            this.progression.forEach((bar, barIdx) => {
                const barSteps = document.createElement('div');
                barSteps.className = 'drum-steps';
                
                // 16 steps per bar
                for (let i = 0; i < 16; i++) {
                    const step = document.createElement('div');
                    step.className = 'drum-step';
                    step.dataset.drum = drum.key;
                    step.dataset.bar = barIdx;
                    step.dataset.step = i;
                    
                    step.addEventListener('click', () => {
                        this.toggleDrumStep(drum.key, barIdx, i);
                    });
                    
                    barSteps.appendChild(step);
                }
                
                track.appendChild(barSteps);
            });
            
            container.appendChild(track);
        });
        
        this.updateDrumGrid();
        
        // Control drum wrapper scroll based on mode
        const drumWrapper = document.querySelector('.drum-grid-wrapper');
        if (drumWrapper) {
            // In pattern mode, no scroll. In song mode, scroll if >8 bars
            const shouldScroll = this.songMode && this.progression.length > 8;
            drumWrapper.style.overflowX = shouldScroll ? 'auto' : 'hidden';
        }
        
        // Link drum scroll with piano roll
        if (drumWrapper && !this.drumScrollListenerAdded) {
            drumWrapper.addEventListener('scroll', () => {
                if (this.linkScroll && !this.isScrolling) {
                    this.isScrolling = true;
                    const gridWrapper = document.querySelector('.grid-wrapper');
                    if (gridWrapper) {
                        gridWrapper.scrollLeft = drumWrapper.scrollLeft;
                    }
                    setTimeout(() => this.isScrolling = false, 50);
                }
            });
            this.drumScrollListenerAdded = true;
        }
    }
    
    toggleDrumStep(drum, barIndex, step) {
        if (!this.drumPatterns[barIndex]) {
            this.drumPatterns[barIndex] = {
                kick: new Array(16).fill(0),
                snare: new Array(16).fill(0),
                hihat: new Array(16).fill(0),
                clap: new Array(16).fill(0)
            };
        }
        
        this.drumPatterns[barIndex][drum][step] = this.drumPatterns[barIndex][drum][step] ? 0 : 1;
        this.updateDrumGrid();
    }
    
    updateDrumGrid() {
        document.querySelectorAll('.drum-step').forEach(step => {
            const drum = step.dataset.drum;
            const barIdx = parseInt(step.dataset.bar);
            const stepNum = parseInt(step.dataset.step);
            
            const pattern = this.drumPatterns[barIdx];
            
            if (pattern && pattern[drum] && pattern[drum][stepNum]) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    loadDrumPreset(presetName) {
        const barIndex = this.selectedBar || 0;
        
        const presets = {
            basic: {
                kick: [1,0,0,0, 1,0,0,0, 1,0,0,0, 1,0,0,0],
                snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                hihat: [1,0,1,0, 1,0,1,0, 1,0,1,0, 1,0,1,0],
                clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
            },
            funk: {
                kick: [1,0,0,1, 0,0,1,0, 0,1,0,0, 1,0,0,0],
                snare: [0,0,0,0, 1,0,0,1, 0,0,0,0, 1,0,0,0],
                hihat: [1,1,0,1, 1,1,0,1, 1,1,0,1, 1,1,0,1],
                clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
            },
            dnb: {
                kick: [1,0,0,0, 0,0,1,0, 0,0,1,0, 0,0,0,1],
                snare: [0,0,0,0, 1,0,0,0, 0,0,0,0, 1,0,0,0],
                hihat: [1,1,1,1, 1,1,1,1, 1,1,1,1, 1,1,1,1],
                clap: [0,0,0,0, 0,0,0,0, 0,0,0,0, 0,0,0,0]
            },
            clear: {
                kick: new Array(16).fill(0),
                snare: new Array(16).fill(0),
                hihat: new Array(16).fill(0),
                clap: new Array(16).fill(0)
            }
        };
        
        if (presets[presetName]) {
            this.drumPatterns[barIndex] = presets[presetName];
            this.updateDrumGrid();
        }
    }
    
    playChannel2Notes(barIndex, barDuration) {
        // Don't play if generative preview is active
        if (this.generativePreviewActive) return;
        
        // Don't play if preset preview is active
        if (this.channel2PreviewActive) return;
        
        // === POC: Check Follow Mode ===
        if (this.channel2PlaybackMode === 'follow' && this.followMode) {
            const bar = this.progression[barIndex];
            if (bar) {
                const chord = this.getChordTonesForBar(bar);
                if (chord && chord.midiNotes && chord.midiNotes.length > 0) {
                    const notes = this.followMode.generateNotes(chord, barDuration);
                    if (notes && notes.length > 0) {
                        this.playFollowModeNotes(notes, barDuration);
                        return; // Skip normal playback
                    }
                }
            }
        }
        
        const notes = this.channel2Notes[barIndex];
        if (!notes || notes.length === 0) return;
        
        // If Channel 2 Arpeggiator is enabled
        if (this.channel2ArpEnabled) {
            // Collect all unique MIDI notes in this bar
            const uniqueMidi = [...new Set(notes.map(n => n.midi))].sort((a, b) => a - b);
            
            if (uniqueMidi.length > 0) {
                this.playChannel2Arpeggio(uniqueMidi, barDuration);
            }
            
            // If NOT replacing, also play the original pattern
            if (!this.channel2ArpReplace) {
                notes.forEach((note, noteIdx) => {
                    const startTime = note.start * barDuration * 1000;
                    const duration = note.duration * barDuration;
                    
                    setTimeout(() => {
                        if (this.isPlaying && this.channel2Synth) {
                            const freq = Tone.Frequency(note.midi, 'midi').toFrequency();
                            this.channel2Synth.triggerAttackRelease(freq, duration);
                            this.highlightChannel2Note(barIndex, noteIdx, duration * 1000);
                        }
                    }, startTime);
                });
            }
        } else {
            // Play notes as-is (Pattern Generator mode)
            notes.forEach((note, noteIdx) => {
                const startTime = note.start * barDuration * 1000;
                const duration = note.duration * barDuration;
                
                setTimeout(() => {
                    if (this.isPlaying && this.channel2Synth) {
                        const freq = Tone.Frequency(note.midi, 'midi').toFrequency();
                        this.channel2Synth.triggerAttackRelease(freq, duration);
                        this.highlightChannel2Note(barIndex, noteIdx, duration * 1000);
                    }
                }, startTime);
            });
        }
    }

    // === POC: Helper method for Follow Mode ===
    playFollowModeNotes(notes, barDuration) {
        notes.forEach(note => {
            const startTime = note.start * 1000; // Convert to ms
            const duration = note.duration;
            
            setTimeout(() => {
                if (this.isPlaying && this.channel2Synth) {
                    const freq = Tone.Frequency(note.midi, 'midi').toFrequency();
                    this.channel2Synth.triggerAttackRelease(freq, duration, undefined, note.velocity / 127);
                }
            }, startTime);
        });
    }

    playChannel2Arpeggio(midiNotes, duration) {
        // Similar to Channel 1 arpeggiator but for Channel 2
        const speedMap = { '1/16': 16, '1/8': 8, '1/4': 4 };
        const steps = speedMap[this.channel2ArpSpeed] || 8;
        const stepDuration = duration / steps;
        
        // Expand notes with octaves
        let expandedNotes = [...midiNotes];
        for (let oct = 1; oct < this.channel2ArpOctaves; oct++) {
            expandedNotes = expandedNotes.concat(midiNotes.map(n => n + (12 * oct)));
        }
        
        // Apply pattern
        let sequence = [...expandedNotes];
        if (this.channel2ArpPattern === 'down') {
            sequence.reverse();
        } else if (this.channel2ArpPattern === 'updown') {
            sequence = [...sequence, ...sequence.slice().reverse()];
        } else if (this.channel2ArpPattern === 'random') {
            sequence = sequence.sort(() => Math.random() - 0.5);
        }
        
        // Play arpeggio
        for (let i = 0; i < steps; i++) {
            const noteIndex = this.channel2ArpMode === 'run' 
                ? (this.channel2ArpSequenceIndex + i) % sequence.length
                : i % sequence.length;
            const midi = sequence[noteIndex];
            
            setTimeout(() => {
                if (this.isPlaying && this.channel2Synth) {
                    const freq = Tone.Frequency(midi, 'midi').toFrequency();
                    this.channel2Synth.triggerAttackRelease(freq, stepDuration * 0.9);
                }
            }, i * stepDuration * 1000);
        }
        
        // Update sequence index for continuous mode
        if (this.channel2ArpMode === 'run') {
            this.channel2ArpSequenceIndex = (this.channel2ArpSequenceIndex + steps) % sequence.length;
        }
    }

    highlightChannel2Note(barIndex, noteIdx, duration) {
        // TODO/ISSUE: Channel 2 note highlighting shows multiple notes lit up at once
        // This happens because note duration (0.4s) overlaps with next note timing (0.5s)
        // Need to either: 1) Reduce note duration, 2) Clear previous highlights, or 3) Adjust visual feedback
        
        // Find the Channel 2 note block using unique ID
        const uniqueId = `ch2-${barIndex}-${noteIdx}`;
        const noteBlocks = document.querySelectorAll(`.note-block.channel2-note[data-unique-id="${uniqueId}"]`);
        
        if (noteBlocks.length === 0) {
            // Fallback: try to find by bar and note index without unique-id
            const allChannel2Notes = document.querySelectorAll(`.note-block.channel2-note[data-bar-index="${barIndex}"][data-note-index="${noteIdx}"]`);
            allChannel2Notes.forEach(block => {
                block.classList.add('playing');
                setTimeout(() => {
                    block.classList.remove('playing');
                }, duration);
            });
        } else {
            noteBlocks.forEach(block => {
                block.classList.add('playing');
                setTimeout(() => {
                    block.classList.remove('playing');
                }, duration);
            });
        }
    }

    playDrumPattern(barIndex, barDuration) {
        const pattern = this.drumPatterns[barIndex];
        if (!pattern) return;
        
        const stepDuration = barDuration / 16; // 16 steps per bar
        const barWidth = this.barWidth || 140;
        
        // Drum playhead is now handled by universal playhead
        
        // Play each drum track
        Object.keys(pattern).forEach(drumKey => {
            const steps = pattern[drumKey];
            
            steps.forEach((active, stepIndex) => {
                if (active) {
                    const delay = stepIndex * stepDuration * 1000; // Convert to ms
                    
                    setTimeout(() => {
                        // Play drum sound (only if not muted)
                        if (this.drumSounds[drumKey] && !this.muteDrums) {
                            if (drumKey === 'kick') {
                                this.drumSounds.kick.triggerAttackRelease('C1', '16n');
                            } else {
                                this.drumSounds[drumKey].triggerAttackRelease('16n');
                            }
                        }
                        
                        // Highlight step with barIndex
                        this.highlightDrumStep(drumKey, barIndex, stepIndex);
                    }, delay);
                }
            });
        });
    }
    
    // Removed - using universal playhead now
    
    highlightDrumStep(drum, barIndex, step) {
        // Clear previous highlight for this drum with timeout cleanup
        document.querySelectorAll(`.drum-step[data-drum="${drum}"].playing`).forEach(el => {
            el.classList.remove('playing');
            if (el.highlightTimeout) {
                clearTimeout(el.highlightTimeout);
                delete el.highlightTimeout;
            }
        });
        
        // Highlight current step in current bar
        const stepEl = document.querySelector(`.drum-step[data-drum="${drum}"][data-bar="${barIndex}"][data-step="${step}"]`);
        if (stepEl) {
            stepEl.classList.add('playing');
            
            // Remove highlight after step duration (match timing)
            const barDuration = (60 / this.bpm) * 4;
            const stepDuration = (barDuration / 16) * 1000; // Convert to ms
            
            stepEl.highlightTimeout = setTimeout(() => {
                stepEl.classList.remove('playing');
                delete stepEl.highlightTimeout;
            }, Math.min(stepDuration * 0.8, 200)); // 80% of step or max 200ms
        }
    }
    
    copyDrumBar() {
        const barIndex = this.selectedBar !== null ? this.selectedBar : 0;
        const pattern = this.drumPatterns[barIndex];
        
        if (pattern) {
            this.drumClipboard = JSON.parse(JSON.stringify(pattern));
            console.log(`Copied drum pattern from bar ${barIndex + 1}`);
        } else {
            alert('No drum pattern in selected bar to copy');
        }
    }
    
    pasteDrumBar() {
        if (!this.drumClipboard) {
            alert('No drum pattern copied yet');
            return;
        }
        
        const barIndex = this.selectedBar !== null ? this.selectedBar : 0;
        this.drumPatterns[barIndex] = JSON.parse(JSON.stringify(this.drumClipboard));
        this.updateDrumGrid();
        console.log(`Pasted drum pattern to bar ${barIndex + 1}`);
    }
    
    fillDrumRange() {
        if (!this.drumClipboard) {
            alert('No drum pattern copied yet. Copy a bar first!');
            return;
        }
        
        const start = prompt('Fill from bar number:', '1');
        const end = prompt('Fill to bar number:', this.progression.length.toString());
        
        if (!start || !end) return;
        
        const startBar = parseInt(start) - 1;
        const endBar = parseInt(end) - 1;
        
        if (startBar < 0 || endBar >= this.progression.length || startBar > endBar) {
            alert('Invalid range!');
            return;
        }
        
        for (let i = startBar; i <= endBar; i++) {
            this.drumPatterns[i] = JSON.parse(JSON.stringify(this.drumClipboard));
        }
        
        this.updateDrumGrid();
        console.log(`Filled drum pattern from bar ${startBar + 1} to ${endBar + 1}`);
    }
    
    autoFillDrums() {
        const pattern = this.drumPatterns[0]; // Bar 1
        
        if (!pattern) {
            alert('No drum pattern in bar 1 to copy!');
            return;
        }
        
        // Copy bar 1 to all bars
        for (let i = 0; i < this.progression.length; i++) {
            this.drumPatterns[i] = JSON.parse(JSON.stringify(pattern));
        }
        
        // Update visual grid
        this.updateDrumGrid();
        console.log('Auto-filled all bars with bar 1 pattern');
    }
    
    updateDrumZoom() {
        // Drum zoom is now controlled by CSS variable --bar-width
        // No need to update here - it's already 240px (2x)
    }
    
    scrollDrumToPlayhead() {
        if (!this.drumFollowPlayhead || !this.isPlaying) return;
        
        const wrapper = document.querySelector('.drum-grid-wrapper');
        if (!wrapper) return;
        
        const barWidth = this.barWidth || 140;
        const scrollPos = this.currentBar * barWidth - (wrapper.clientWidth / 2) + (barWidth / 2);
        
        wrapper.scrollTo({
            left: Math.max(0, scrollPos),
            behavior: 'smooth'
        });
    }
    
    toggleSection(sectionId) {
        const section = document.getElementById(sectionId);
        const toggle = document.getElementById(sectionId.replace('Content', 'Toggle'));
        
        if (section) {
            const isHidden = section.style.display === 'none';
            section.style.display = isHidden ? 'block' : 'none';
            if (toggle) {
                toggle.textContent = isHidden ? '▼' : '▶';
            }
        }
    }
    
    getNextFilledPattern() {
        const patternOrder = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4', 'D1', 'D2', 'D3', 'D4'];
        const currentIndex = patternOrder.indexOf(this.currentPattern);
        
        // Find next filled pattern
        for (let i = currentIndex + 1; i < patternOrder.length; i++) {
            if (this.patterns[patternOrder[i]]) {
                return patternOrder[i];
            }
        }
        
        // Loop back to first filled pattern
        for (let i = 0; i <= currentIndex; i++) {
            if (this.patterns[patternOrder[i]]) {
                return patternOrder[i];
            }
        }
        
        return null;
    }
    
    generateRandomBeatForPattern(patternId) {
        this.generateRandomBeatForPatternSilent(patternId);
        this.updateDrumGrid();
        console.log('Generated random beat for pattern:', patternId);
    }
    
    generateRandomBeatForPatternSilent(patternId) {
        if (!this.patterns[patternId]) return;
        
        const numBars = this.patterns[patternId].progression.length;
        const tempDrumPatterns = {};
        
        // Use true random for different results each time
        const random = () => Math.random();
        
        // Generate different beat patterns
        for (let barIdx = 0; barIdx < numBars; barIdx++) {
            tempDrumPatterns[barIdx] = {
                kick: new Array(16).fill(0),
                snare: new Array(16).fill(0),
                hihat: new Array(16).fill(0),
                clap: new Array(16).fill(0)
            };
            
            // Kick: on beats 1 and 3 (always), sometimes on other beats
            tempDrumPatterns[barIdx].kick[0] = 1;
            tempDrumPatterns[barIdx].kick[8] = 1;
            if (random() > 0.7) tempDrumPatterns[barIdx].kick[4] = 1;
            if (random() > 0.8) tempDrumPatterns[barIdx].kick[12] = 1;
            if (random() > 0.85) tempDrumPatterns[barIdx].kick[6] = 1;
            if (random() > 0.9) tempDrumPatterns[barIdx].kick[14] = 1;
            
            // Snare: on beats 2 and 4 (always), sometimes variations
            tempDrumPatterns[barIdx].snare[4] = 1;
            tempDrumPatterns[barIdx].snare[12] = 1;
            if (random() > 0.8) tempDrumPatterns[barIdx].snare[2] = 1;
            if (random() > 0.85) tempDrumPatterns[barIdx].snare[10] = 1;
            
            // Hi-hat: varied patterns
            const hihatDensity = random();
            for (let i = 0; i < 16; i++) {
                if (hihatDensity > 0.7) {
                    // Dense pattern (16th notes with gaps)
                    if (random() > 0.2) tempDrumPatterns[barIdx].hihat[i] = 1;
                } else if (hihatDensity > 0.4) {
                    // Medium pattern (8th notes)
                    if (i % 2 === 0 && random() > 0.3) tempDrumPatterns[barIdx].hihat[i] = 1;
                } else {
                    // Sparse pattern (quarter notes)
                    if (i % 4 === 0 && random() > 0.4) tempDrumPatterns[barIdx].hihat[i] = 1;
                }
            }
            
            // Clap: occasional accents
            if (random() > 0.7) tempDrumPatterns[barIdx].clap[6] = 1;
            if (random() > 0.75) tempDrumPatterns[barIdx].clap[14] = 1;
            if (random() > 0.85) tempDrumPatterns[barIdx].clap[2] = 1;
            if (random() > 0.9) tempDrumPatterns[barIdx].clap[10] = 1;
        }
        
        // Save to pattern
        this.patterns[patternId].drumPatterns = tempDrumPatterns;
    }
    
    exportDrumMidi(allPatterns = false) {
        // General MIDI drum map
        const drumMap = {
            kick: 36,   // C1 - Bass Drum
            snare: 38,  // D1 - Snare
            hihat: 42,  // F#1 - Closed Hi-Hat
            clap: 39    // D#1 - Hand Clap
        };
        
        // Create MIDI file structure
        const ppq = 480; // Pulses per quarter note
        const ticksPerStep = ppq / 4; // 16th note = 1/4 of quarter note
        
        // MIDI header
        const header = [
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, 0x00,             // Format 0
            0x00, 0x01,             // 1 track
            (ppq >> 8) & 0xFF, ppq & 0xFF // Ticks per quarter note
        ];
        
        // Track events
        const events = [];
        
        // Tempo: 120 BPM = 500000 microseconds per quarter note
        const tempo = Math.floor(60000000 / this.bpm);
        events.push([0, 0xFF, 0x51, 0x03, (tempo >> 16) & 0xFF, (tempo >> 8) & 0xFF, tempo & 0xFF]);
        
        // Determine which drum patterns to export
        let patternsToExport = [];
        if (allPatterns) {
            // Export all filled patterns
            Object.keys(this.patterns).forEach(patternId => {
                const pattern = this.patterns[patternId];
                if (pattern && pattern.drumPatterns) {
                    Object.keys(pattern.drumPatterns).forEach(barIdx => {
                        patternsToExport.push(pattern.drumPatterns[barIdx]);
                    });
                }
            });
        } else {
            // Export current pattern only
            for (let barIdx = 0; barIdx < this.progression.length; barIdx++) {
                if (this.drumPatterns[barIdx]) {
                    patternsToExport.push(this.drumPatterns[barIdx]);
                }
            }
        }
        
        // Add drum notes
        patternsToExport.forEach((pattern, barIdx) => {
            if (!pattern) return;
            
            Object.keys(drumMap).forEach(drumKey => {
                const midiNote = drumMap[drumKey];
                const steps = pattern[drumKey];
                if (!steps) return;
                
                steps.forEach((active, stepIdx) => {
                    if (active) {
                        const tick = (barIdx * 16 + stepIdx) * ticksPerStep;
                        const duration = ticksPerStep;
                        
                        // Note on
                        events.push([tick, 0x99, midiNote, 100]); // Channel 10, velocity 100
                        // Note off
                        events.push([tick + duration, 0x89, midiNote, 0]);
                    }
                });
            });
        });
        
        // Sort events by time
        events.sort((a, b) => a[0] - b[0]);
        
        // Convert to delta times and encode
        const trackData = [];
        let lastTick = 0;
        
        events.forEach(event => {
            const tick = event[0];
            const delta = tick - lastTick;
            lastTick = tick;
            
            // Variable length quantity encoding
            const deltaBytes = this.encodeVLQ(delta);
            trackData.push(...deltaBytes);
            trackData.push(...event.slice(1));
        });
        
        // End of track
        trackData.push(0x00, 0xFF, 0x2F, 0x00);
        
        // Track header
        const trackHeader = [
            0x4D, 0x54, 0x72, 0x6B, // "MTrk"
            (trackData.length >> 24) & 0xFF,
            (trackData.length >> 16) & 0xFF,
            (trackData.length >> 8) & 0xFF,
            trackData.length & 0xFF
        ];
        
        // Combine all
        const midiData = new Uint8Array([...header, ...trackHeader, ...trackData]);
        
        // Download
        const blob = new Blob([midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const filename = allPatterns ? 'drums-all-patterns.mid' : `drums-${this.currentPattern}.mid`;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('✅ Drums MIDI exported:', filename);
    }
    
    encodeVLQ(value) {
        // Variable Length Quantity encoding for MIDI
        const bytes = [];
        bytes.push(value & 0x7F);
        value >>= 7;
        
        while (value > 0) {
            bytes.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        
        return bytes;
    }
    
    startMeterAnimation() {
        const pianoMeter = document.getElementById('pianoMeter');
        const channel2Meter = document.getElementById('channel2Meter');
        const drumMeter = document.getElementById('drumMeter');
        
        let pianoLevel = 0;
        let channel2Level = 0;
        let drumLevel = 0;
        
        setInterval(() => {
            // Simulate meter activity during playback
            if (this.isPlaying) {
                // Piano meter - random activity
                pianoLevel = Math.random() * 60 + 20; // 20-80%
                
                // Channel 2 meter - only active if Channel 2 is enabled and not muted
                if (this.showChannel2 && !this.muteChannel2) {
                    channel2Level = Math.random() * 50 + 30; // 30-80%
                } else {
                    channel2Level *= 0.8;
                }
                
                // Drum meter - random activity
                drumLevel = Math.random() * 70 + 10; // 10-80%
            } else {
                // Decay when not playing
                pianoLevel *= 0.8;
                channel2Level *= 0.8;
                drumLevel *= 0.8;
            }
            
            if (pianoMeter) pianoMeter.style.height = `${pianoLevel}%`;
            if (channel2Meter) channel2Meter.style.height = `${channel2Level}%`;
            if (drumMeter) drumMeter.style.height = `${drumLevel}%`;
        }, 50);
    }
    
    buildPatternMatrix() {
        const container = document.getElementById('patternMatrix');
        if (!container) return;
        
        const rows = ['A', 'B', 'C', 'D'];
        const cols = [1, 2, 3, 4];
        
        rows.forEach(row => {
            cols.forEach(col => {
                const patternId = `${row}${col}`;
                const btn = document.createElement('button');
                btn.className = 'pattern-btn';
                btn.textContent = patternId;
                btn.dataset.pattern = patternId;
                
                if (patternId === 'A1') {
                    btn.classList.add('active');
                }
                
                btn.addEventListener('click', () => this.switchPattern(patternId));
                container.appendChild(btn);
            });
        });
    }
    
    switchPattern(patternId) {
        console.log('🔄 Switching to pattern:', patternId);
        console.log('Before save - Current pattern:', this.currentPattern);
        console.log('Before save - Channel 2 bars:', Object.keys(this.channel2Notes).length);
        console.log('Before save - Settings:', {
            style: this.channel2Style,
            pattern: this.channel2Pattern,
            source: this.channel2Source
        });
        
        // Save current pattern
        this.saveCurrentPattern();
        
        // Load new pattern
        this.currentPattern = patternId;
        this.loadPattern(patternId);
        
        // Update UI
        document.querySelectorAll('.pattern-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.pattern === patternId);
        });
        
        const label = document.getElementById('currentPatternLabel');
        if (label) label.textContent = patternId;
    }
    
    saveCurrentPattern() {
        this.patterns[this.currentPattern] = {
            progression: JSON.parse(JSON.stringify(this.progression)),
            drumPatterns: JSON.parse(JSON.stringify(this.drumPatterns)),
            notes: this.notes ? JSON.parse(JSON.stringify(this.notes)) : {},
            channel2Notes: this.channel2Notes ? JSON.parse(JSON.stringify(this.channel2Notes)) : {},
            // Save Channel 2 settings
            channel2Settings: {
                source: this.channel2Source,
                style: this.channel2Style,
                pattern: this.channel2Pattern,
                density: this.channel2Density,
                octaveRange: this.channel2OctaveRange
            }
        };
        
        console.log(`💾 Saved pattern ${this.currentPattern}:`, {
            bars: this.progression.length,
            drumBars: Object.keys(this.drumPatterns).length,
            channel2Bars: Object.keys(this.channel2Notes).length,
            channel2Style: this.channel2Style,
            channel2Pattern: this.channel2Pattern
        });
        
        // Mark pattern as having data
        const btn = document.querySelector(`.pattern-btn[data-pattern="${this.currentPattern}"]`);
        if (btn) btn.classList.add('has-data');
    }
    
    loadPattern(patternId) {
        console.log(`📂 Loading pattern ${patternId}...`);
        console.log('Pattern exists?', !!this.patterns[patternId]);
        
        if (this.patterns[patternId]) {
            const pattern = this.patterns[patternId];
            console.log('Pattern data:', {
                hasProg: !!pattern.progression,
                hasDrums: !!pattern.drumPatterns,
                hasChannel2: !!pattern.channel2Notes,
                hasSettings: !!pattern.channel2Settings,
                channel2Bars: pattern.channel2Notes ? Object.keys(pattern.channel2Notes).length : 0
            });
            
            // Load existing pattern with original bar numbers
            this.progression = JSON.parse(JSON.stringify(pattern.progression));
            this.drumPatterns = JSON.parse(JSON.stringify(pattern.drumPatterns));
            this.notes = pattern.notes ? JSON.parse(JSON.stringify(pattern.notes)) : {};
            this.channel2Notes = pattern.channel2Notes ? JSON.parse(JSON.stringify(pattern.channel2Notes)) : {};
            
            console.log('After load - Channel 2 bars:', Object.keys(this.channel2Notes).length);
            
            // Restore Channel 2 settings
            if (pattern.channel2Settings) {
                const settings = pattern.channel2Settings;
                console.log('Restoring settings:', settings);
                
                this.channel2Source = settings.source;
                this.channel2Style = settings.style;
                this.channel2Pattern = settings.pattern;
                this.channel2Density = settings.density;
                this.channel2OctaveRange = settings.octaveRange;
                
                // Update UI controls
                const sourceEl = document.getElementById('channel2Source');
                const styleEl = document.getElementById('channel2Style');
                const densityEl = document.getElementById('channel2Density');
                const octaveEl = document.getElementById('channel2OctaveRange');
                
                if (sourceEl) sourceEl.value = this.channel2Source;
                if (styleEl) styleEl.value = this.channel2Style;
                if (densityEl) densityEl.value = this.channel2Density;
                if (octaveEl) octaveEl.value = this.channel2OctaveRange;
                
                // Update pattern options for this style
                this.updateChannel2PatternOptions();
                
                const patternEl = document.getElementById('channel2Pattern');
                if (patternEl) patternEl.value = this.channel2Pattern;
            } else {
                console.warn('⚠️ No channel2Settings found in pattern!');
            }
            
            console.log(`✅ Loaded pattern ${patternId}:`, {
                bars: this.progression.length,
                drumBars: Object.keys(this.drumPatterns).length,
                channel2Bars: Object.keys(this.channel2Notes).length,
                channel2Style: this.channel2Style,
                channel2Pattern: this.channel2Pattern
            });
        } else {
            // Empty pattern - no bars
            this.progression = [];
            this.drumPatterns = {};
            this.notes = {};
            this.channel2Notes = {};
            
            console.log('📂 Loaded empty pattern:', patternId);
        }
        
        this.buildGrid();
        this.buildDrumGrid();
        this.analyzeProgression();
        
        // Auto-generate Channel 2 pattern if progression exists but no Channel 2 notes
        if (this.progression.length > 0 && Object.keys(this.channel2Notes).length === 0 && this.showChannel2) {
            console.log('🎵 Auto-generating Channel 2 pattern for new pattern...');
            this.generateChannel2Pattern();
        }
        
        this.updateChannel2SyncStatus();
        
        // Debug: show current bar numbers
        console.log('Current progression bar numbers:', this.progression.map(b => b.barNum));
    }
}

// Initialize
let app; // Global reference for inline event handlers
document.addEventListener('DOMContentLoaded', () => {
    app = new ChordProgressionApp();
    
    // Expose UI helpers for Performance Layer
    window.UI = {
        getPhraseLength: () => app.styleParams?.phraseLength || 4,
        getVariation: () => (app.styleParams?.variation || 50) / 100,
        getOctave: () => app.styleParams?.octave || 0,
        getSelectedStyleName: () => {
            const styleId = app.styleParams?.currentStyle || 'pop-basic';
            const style = app.styles?.[styleId];
            return style?.name || styleId;
        }
    };
    
    // Expose adapter interface for Performance Layer
    window.App = {
        lengthBars: app.progression?.length || 8,
        getNotes: () => {
            // Convert progression to note format for chord detection
            const notes = [];
            app.progression.forEach((bar, barIdx) => {
                if (bar.midiNotes && bar.midiNotes.length > 0) {
                    bar.midiNotes.forEach(midi => {
                        notes.push({
                            pitch: midi,
                            start: barIdx * 4, // Bar start in beats
                            end: (barIdx + 1) * 4, // Bar end
                            vel: 90
                        });
                    });
                }
            });
            return notes;
        },
        getTempo: () => app.tempo || 120,
        beatsPerBar: () => 4,
        scheduleNoteOn: (pitch, vel, time) => {
            if (app.channel2Synth) {
                app.channel2Synth.triggerAttack(Tone.Frequency(pitch, 'midi'), time, vel / 127);
            }
        },
        scheduleNoteOff: (pitch, time) => {
            if (app.channel2Synth) {
                app.channel2Synth.triggerRelease(Tone.Frequency(pitch, 'midi'), time);
            }
        },
        transportStart: () => {
            if (Tone.Transport.state !== 'started') {
                Tone.Transport.start();
            }
        },
        transportStop: () => {
            if (Tone.Transport.state === 'started') {
                Tone.Transport.stop();
            }
        },
        killAllVoices: () => {
            app.channel2Synth?.releaseAll();
            app.synth?.releaseAll();
        }
    };
});

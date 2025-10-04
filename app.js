// Chord Progression Studio - Clean Implementation
class ChordProgressionApp {
    constructor() {
        this.progression = [];
        this.synth = null;
        this.isPlaying = false;
        this.currentBar = 0;
        this.bpm = 120;
        this.playheadElement = null;
        this.playheadAnimationId = null;
        this.playStartTime = 0;
        
        this.noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.whiteKeys = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
        
        this.init();
    }

    init() {
        this.setupSynth();
        this.setupEventListeners();
        this.parseChords();
    }

    setupSynth() {
        this.synth = new Tone.PolySynth(Tone.Synth, {
            oscillator: { type: 'sine' },
            envelope: {
                attack: 0.01,
                decay: 0.1,
                sustain: 0.9,
                release: 0.3
            }
        }).toDestination();
        
        this.synth.volume.value = -20;
    }

    setupEventListeners() {
        document.getElementById('parseBtn').addEventListener('click', () => this.parseChords());
        document.getElementById('playBtn').addEventListener('click', () => this.togglePlay());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('bpmInput').addEventListener('change', (e) => {
            this.bpm = parseInt(e.target.value);
            Tone.Transport.bpm.value = this.bpm;
        });
        document.getElementById('volume').addEventListener('input', (e) => {
            this.synth.volume.value = (e.target.value - 100) * 0.5;
        });
        document.getElementById('attack').addEventListener('input', (e) => {
            this.synth.set({ envelope: { attack: parseFloat(e.target.value) } });
        });
        document.getElementById('release').addEventListener('input', (e) => {
            this.synth.set({ envelope: { release: parseFloat(e.target.value) } });
        });
        document.getElementById('exportMidi').addEventListener('click', () => this.exportMidi());
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
        
        this.buildGrid();
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
        
        const numBars = this.progression.length;
        const numNotes = 36; // 3 octaves
        
        // Set grid template
        container.style.gridTemplateColumns = `80px repeat(${numBars}, 120px)`;
        container.style.gridTemplateRows = `80px repeat(${numNotes}, 20px)`;
        
        // Create playhead
        this.playheadElement = document.createElement('div');
        this.playheadElement.className = 'playhead';
        this.playheadElement.style.left = '80px';
        this.playheadElement.style.display = 'none'; // Hidden by default
        container.appendChild(this.playheadElement);
        
        // Header row - Chord cells
        this.addCell(container, 'Chords', 'grid-label');
        this.progression.forEach((bar, i) => {
            const cell = this.addCell(container, '', 'grid-cell chord-cell');
            cell.dataset.barIndex = i;
            
            const barNum = document.createElement('div');
            barNum.className = 'bar-num';
            barNum.textContent = bar.barNum;
            cell.appendChild(barNum);
            
            const chordText = bar.chords.map(c => c.symbol).join(' ');
            const chordLabel = document.createElement('div');
            chordLabel.textContent = chordText;
            cell.appendChild(chordLabel);
            
            cell.addEventListener('click', () => this.previewBar(i));
        });
        
        // Piano roll rows
        for (let noteIdx = 0; noteIdx < numNotes; noteIdx++) {
            const midiNote = 84 - noteIdx; // Start from C6 down
            const noteName = this.midiToNote(midiNote);
            const isWhite = this.whiteKeys.includes(noteName.slice(0, -1));
            
            // Note label
            this.addCell(container, noteName, 'grid-label');
            
            // Note cells for each bar
            this.progression.forEach((bar, barIdx) => {
                const cell = this.addCell(container, '', `grid-cell piano-cell ${isWhite ? 'white' : 'black'}`);
                cell.dataset.midi = midiNote;
                cell.dataset.barIndex = barIdx;
                
                // Add notes from chords
                bar.chords.forEach((chord, chordIdx) => {
                    if (chord && chord.midiNotes.includes(midiNote)) {
                        const noteBlock = document.createElement('div');
                        noteBlock.className = 'note-block';
                        noteBlock.dataset.midi = midiNote;
                        noteBlock.dataset.barIndex = barIdx;
                        
                        const width = 100 / bar.chords.length;
                        const left = chordIdx * width;
                        noteBlock.style.width = `${width - 2}%`;
                        noteBlock.style.left = `${left}%`;
                        noteBlock.textContent = chord.symbol;
                        
                        cell.appendChild(noteBlock);
                    }
                });
            });
        }
    }

    addCell(container, content, className) {
        const cell = document.createElement('div');
        cell.className = className;
        if (content) cell.textContent = content;
        container.appendChild(cell);
        return cell;
    }

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
        this.currentBar = 0;
        Tone.Transport.bpm.value = this.bpm;
        
        const barDuration = (60 / this.bpm) * 4; // 4 beats per bar in seconds
        const barWidth = 120;
        const totalDuration = this.progression.length * barDuration; // in seconds
        
        // Calculate start position based on grid container
        const gridContainer = document.getElementById('gridContainer');
        const gridRect = gridContainer.getBoundingClientRect();
        const startPos = gridRect.left + 80; // Grid left + label width
        
        // Show playhead
        this.playheadElement.style.display = 'block';
        
        // Start playhead animation
        this.playStartTime = performance.now();
        this.animatePlayhead(startPos, barWidth, totalDuration);
        
        const playBar = () => {
            if (!this.isPlaying || this.currentBar >= this.progression.length) {
                this.stop();
                return;
            }
            
            const bar = this.progression[this.currentBar];
            const chordDuration = barDuration / bar.chords.length;
            
            // Highlight current bar
            this.highlightBar(this.currentBar);
            
            // Play chords
            bar.chords.forEach((chord, idx) => {
                setTimeout(() => {
                    if (chord && chord.midiNotes) {
                        const freqs = chord.midiNotes.map(m => Tone.Frequency(m, 'midi').toFrequency());
                        this.synth.triggerAttackRelease(freqs, chordDuration * 0.9);
                    }
                }, idx * chordDuration * 1000);
            });
            
            this.currentBar++;
            setTimeout(playBar, barDuration * 1000);
        };
        
        playBar();
    }

    animatePlayhead(startPos, barWidth, totalDuration) {
        const animate = (currentTime) => {
            if (!this.isPlaying) return;
            
            const elapsed = (currentTime - this.playStartTime) / 1000; // in seconds
            const progress = Math.min(elapsed / totalDuration, 1);
            
            // Recalculate grid position in case of scroll
            const gridContainer = document.getElementById('gridContainer');
            const gridRect = gridContainer.getBoundingClientRect();
            const currentStartPos = gridRect.left + 80;
            
            const position = currentStartPos + (progress * this.progression.length * barWidth);
            
            this.playheadElement.style.left = position + 'px';
            
            // Highlight notes that are being hit by playhead
            this.highlightNotesAtPlayhead(position, gridRect.left + 80, barWidth);
            
            if (progress < 1) {
                this.playheadAnimationId = requestAnimationFrame(animate);
            }
        };
        
        this.playheadAnimationId = requestAnimationFrame(animate);
    }

    stop() {
        this.isPlaying = false;
        this.currentBar = 0;
        this.synth.releaseAll();
        this.clearHighlights();
        
        // Stop playhead animation
        if (this.playheadAnimationId) {
            cancelAnimationFrame(this.playheadAnimationId);
            this.playheadAnimationId = null;
        }
        
        // Hide playhead
        this.playheadElement.style.display = 'none';
    }

    highlightBar(barIdx) {
        document.querySelectorAll('.chord-cell').forEach((cell, idx) => {
            cell.classList.toggle('playing', idx === barIdx);
        });
    }

    highlightNotesAtPlayhead(playheadPos, gridStartPos, barWidth) {
        // Calculate which bar the playhead is in
        const relativePos = playheadPos - gridStartPos;
        const currentBarFloat = relativePos / barWidth;
        const currentBar = Math.floor(currentBarFloat);
        
        if (currentBar < 0 || currentBar >= this.progression.length) return;
        
        const bar = this.progression[currentBar];
        const barProgress = currentBarFloat - currentBar; // 0 to 1 within the bar
        
        // Calculate which chord within the bar based on note blocks
        let chordIndex = Math.floor(barProgress * bar.chords.length);
        chordIndex = Math.min(chordIndex, bar.chords.length - 1); // Clamp to valid range
        
        // Remove all playing classes first
        document.querySelectorAll('.note-block.playing').forEach(block => {
            block.classList.remove('playing');
        });
        
        // Find and highlight the actual note blocks for this chord
        const chord = bar.chords[chordIndex];
        if (chord && chord.midiNotes) {
            // Get all note blocks in this bar
            const noteBlocks = document.querySelectorAll(`.note-block[data-bar-index="${currentBar}"]`);
            
            noteBlocks.forEach(block => {
                const blockRect = block.getBoundingClientRect();
                const blockLeft = blockRect.left;
                const blockRight = blockRect.right;
                
                // Check if playhead is within this note block
                if (playheadPos >= blockLeft && playheadPos <= blockRight) {
                    block.classList.add('playing');
                }
            });
        }
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
        if (this.progression.length === 0) {
            alert('No progression to export');
            return;
        }

        // Create MIDI file
        const ticksPerBeat = 480;
        const beatsPerBar = 4;
        const microsecondsPerBeat = Math.round(60000000 / this.bpm);

        // MIDI header
        const header = this.createMidiHeader(1, 2, ticksPerBeat);
        
        // Track 0: Tempo track
        const tempoTrack = [
            { delta: 0, type: 0xFF, subtype: 0x51, data: this.numberToBytes(microsecondsPerBeat, 3) },
            { delta: 0, type: 0xFF, subtype: 0x2F, data: [] } // End of track
        ];

        // Track 1: Notes
        const noteTrack = [];
        let currentTick = 0;

        this.progression.forEach(bar => {
            const ticksPerChord = (ticksPerBeat * beatsPerBar) / bar.chords.length;
            
            bar.chords.forEach(chord => {
                if (chord && chord.midiNotes) {
                    // Note on events
                    chord.midiNotes.forEach((note, idx) => {
                        noteTrack.push({
                            delta: idx === 0 ? 0 : 0,
                            type: 0x90, // Note on
                            data: [note, 80] // Note, velocity
                        });
                    });

                    // Note off events
                    chord.midiNotes.forEach((note, idx) => {
                        noteTrack.push({
                            delta: idx === 0 ? Math.round(ticksPerChord * 0.9) : 0,
                            type: 0x80, // Note off
                            data: [note, 0]
                        });
                    });

                    currentTick += ticksPerChord;
                }
            });
        });

        noteTrack.push({ delta: 0, type: 0xFF, subtype: 0x2F, data: [] }); // End of track

        // Encode tracks
        const tempoTrackData = this.encodeTrack(tempoTrack);
        const noteTrackData = this.encodeTrack(noteTrack);

        // Combine all data
        const midiData = new Uint8Array([
            ...header,
            ...this.createTrackChunk(tempoTrackData),
            ...this.createTrackChunk(noteTrackData)
        ]);

        // Download
        const blob = new Blob([midiData], { type: 'audio/midi' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'chord-progression.mid';
        a.click();
        URL.revokeObjectURL(url);
    }

    createMidiHeader(format, trackCount, ticksPerBeat) {
        return new Uint8Array([
            0x4D, 0x54, 0x68, 0x64, // "MThd"
            0x00, 0x00, 0x00, 0x06, // Header length
            0x00, format,           // Format
            0x00, trackCount,       // Track count
            (ticksPerBeat >> 8) & 0xFF, ticksPerBeat & 0xFF // Ticks per beat
        ]);
    }

    createTrackChunk(trackData) {
        const length = trackData.length;
        return new Uint8Array([
            0x4D, 0x54, 0x72, 0x6B, // "MTrk"
            (length >> 24) & 0xFF,
            (length >> 16) & 0xFF,
            (length >> 8) & 0xFF,
            length & 0xFF,
            ...trackData
        ]);
    }

    encodeTrack(events) {
        const result = [];
        
        events.forEach(event => {
            // Variable length delta time
            result.push(...this.encodeVarLen(event.delta));
            
            // Event type
            result.push(event.type);
            
            // Meta event subtype
            if (event.type === 0xFF) {
                result.push(event.subtype);
                result.push(...this.encodeVarLen(event.data.length));
            }
            
            // Event data
            result.push(...event.data);
        });
        
        return new Uint8Array(result);
    }

    encodeVarLen(value) {
        const bytes = [];
        bytes.push(value & 0x7F);
        value >>= 7;
        
        while (value > 0) {
            bytes.unshift((value & 0x7F) | 0x80);
            value >>= 7;
        }
        
        return bytes;
    }

    numberToBytes(num, byteCount) {
        const bytes = [];
        for (let i = byteCount - 1; i >= 0; i--) {
            bytes.push((num >> (i * 8)) & 0xFF);
        }
        return bytes;
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    new ChordProgressionApp();
});

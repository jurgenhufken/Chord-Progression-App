# Advanced Drum Machine Specification

## Current Status
✅ Basic drum sequencer with 4 sounds (Kick, Snare, Hi-Hat, Clap)
✅ Horizontal layout with all bars visible
✅ Copy/Paste/Fill Range functionality
✅ Basic playback with step highlighting

## To Implement

### 1. Per-Step Parameters
Each drum step should have:
- **Velocity** (0-127): Volume/intensity of hit
- **Duration** (0-100%): Length of sound
- **Gate** (0-100%): How much of duration plays
- **Ratchet** (1-8): Number of retriggerswithin step
- **Divider** (1,2,4,8): Step subdivision

**Data Structure:**
```javascript
this.drumPatterns[barIndex][drumKey] = {
    steps: [1,0,1,0, ...],      // 16 steps on/off
    velocity: [100,80,90, ...],  // Per-step velocity
    duration: [100,50,75, ...],  // Per-step duration
    gate: [100,80,90, ...],      // Per-step gate
    ratchet: [1,1,2,1, ...],     // Per-step ratchet count
    divider: [1,1,1,2, ...]      // Per-step divider
};
```

**UI:**
- Click drum label → Show parameter sliders below grid
- 16 vertical sliders per parameter (one per step)
- Real-time visual feedback

### 2. Drum Effects Chain
Create dedicated drum effects (separate from main synth):

**Effects:**
- **Drum Delay**: Feedback delay for rhythmic effects
- **Drum Reverb**: Room/plate reverb
- **Distortion**: Saturation/overdrive
- **Bit Crusher**: Lo-fi effect
- **Filter**: Lowpass/highpass per drum

**Implementation:**
```javascript
this.drumEffects = {
    delay: new Tone.FeedbackDelay({time: '8n', feedback: 0.3}).toDestination(),
    reverb: new Tone.Reverb({decay: 1.5}).toDestination(),
    distortion: new Tone.Distortion(0.4).toDestination(),
    bitcrusher: new Tone.BitCrusher(4).toDestination(),
    filter: new Tone.Filter(2000, 'lowpass').toDestination()
};
```

### 3. Effects Routing Per Drum
Each drum sound can route to effects with dry/wet control:

**UI:**
```
Kick:
  Delay:      [====------] 40%
  Reverb:     [==--------] 20%
  Distortion: [==========] 100%
  
Snare:
  Delay:      [------====] 80%
  Reverb:     [========--] 80%
  Distortion: [----------] 0%
```

**Data Structure:**
```javascript
this.drumRouting = {
    kick: { delay: 0.4, reverb: 0.2, distortion: 1.0, bitcrusher: 0, filter: 0 },
    snare: { delay: 0.8, reverb: 0.8, distortion: 0, bitcrusher: 0, filter: 0 },
    hihat: { delay: 0.1, reverb: 0.3, distortion: 0, bitcrusher: 0.5, filter: 0.7 },
    clap: { delay: 0.5, reverb: 0.9, distortion: 0, bitcrusher: 0, filter: 0 }
};
```

### 4. Add/Remove Drum Sounds
Allow custom drum sounds:

**UI:**
- "+" button to add new drum track
- Choose synth type: Membrane, Noise, Metal, FM, Sample
- Name the sound
- Delete button per track

**Drum Types:**
- **Membrane**: Bass drums, toms
- **Noise**: Snares, hihats, cymbals
- **Metal**: Metallic percussion
- **FM**: Synthetic drums
- **Sample**: Load audio files (future)

### 5. Ratchet Implementation
When ratchet > 1, retrigger sound multiple times within step:

```javascript
playDrumStep(drum, barIdx, stepIdx, stepDuration) {
    const pattern = this.drumPatterns[barIdx][drum];
    const ratchetCount = pattern.ratchet[stepIdx];
    const velocity = pattern.velocity[stepIdx] / 127;
    const duration = pattern.duration[stepIdx] / 100;
    
    for (let r = 0; r < ratchetCount; r++) {
        const delay = (stepDuration / ratchetCount) * r;
        setTimeout(() => {
            this.drumSounds[drum].triggerAttackRelease(
                'C1', 
                duration * stepDuration,
                Tone.now(),
                velocity
            );
        }, delay * 1000);
    }
}
```

### 6. Parameter Automation with LFO
Map LFO to drum parameters:
- Velocity modulation
- Filter cutoff modulation
- Effect send modulation

### 7. Drum Patterns Library
Save/load drum patterns:
- Export pattern as JSON
- Import pattern from file
- Pattern browser with presets
- Tags: Genre, Style, BPM

## Implementation Priority
1. ✅ Basic sequencer (DONE)
2. ✅ Horizontal layout (DONE)
3. ✅ Copy/Paste/Fill (DONE)
4. **Per-step parameters** (NEXT)
5. **Effects chain**
6. **Effects routing**
7. **Ratchet/Divider**
8. **Add/Remove sounds**
9. **Pattern library**

## Technical Notes
- Use Tone.js Channel for routing
- Each drum → Channel → Effects → Master
- Store parameters in Float32Array for performance
- Use Web Audio API for sample playback
- Implement undo/redo for drum edits

## UI/UX Considerations
- Color-code drum tracks
- Visual feedback for parameter changes
- Keyboard shortcuts for quick editing
- MIDI learn for hardware controllers
- Touch-friendly for tablets

## Future Enhancements
- Sample import/export
- Drum synthesis parameters (pitch, decay, etc.)
- Probability per step (chance of triggering)
- Swing/humanize
- Pattern chaining
- MIDI export per drum track
- Audio export per drum track

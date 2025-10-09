/**
 * Mode Switcher - POC Module
 * 
 * Manages Channel 2 mode switching:
 * - Direct: Play piano roll notes
 * - Follow: Auto-generate from chords
 * - Style: Use style generator
 */

class ModeSwitcher {
    constructor(app) {
        this.app = app;
        this.mode = 'direct'; // 'direct' | 'follow' | 'style'
        
        this.modes = {
            'direct': {
                name: 'Direct (Piano Roll)',
                description: 'Play notes from piano roll',
                icon: '📝'
            },
            'follow': {
                name: 'Follow Master',
                description: 'Auto-generate patterns from chords',
                icon: '🎵'
            },
            'style': {
                name: 'Style Generator',
                description: 'Use existing style presets',
                icon: '🎨'
            }
        };
    }
    
    /**
     * Set current mode
     */
    setMode(mode) {
        if (!this.modes[mode]) {
            console.error('❌ Invalid mode:', mode);
            return;
        }
        
        const oldMode = this.mode;
        this.mode = mode;
        this.app.channel2Mode = mode;
        
        console.log(`🔀 Mode switched: ${oldMode} → ${mode}`);
        
        // Update UI
        this.updateUI();
        
        // Notify app
        if (this.app.onModeChange) {
            this.app.onModeChange(mode, oldMode);
        }
    }
    
    /**
     * Get current mode
     */
    getMode() {
        return this.mode;
    }
    
    /**
     * Update UI to reflect current mode
     */
    updateUI() {
        // Update radio buttons
        document.querySelectorAll('input[name="ch2mode"]').forEach(radio => {
            radio.checked = (radio.value === this.mode);
        });
        
        // Update mode indicator
        const indicator = document.getElementById('channel2ModeIndicator');
        if (indicator) {
            const modeInfo = this.modes[this.mode];
            indicator.textContent = `${modeInfo.icon} Mode: ${modeInfo.name.toUpperCase()}`;
            
            // Color coding
            const colors = {
                'direct': { bg: 'rgba(46, 204, 113, 0.1)', border: '#2ecc71', text: '#2ecc71' },
                'follow': { bg: 'rgba(255, 152, 0, 0.1)', border: '#ff9800', text: '#ff9800' },
                'style': { bg: 'rgba(156, 39, 176, 0.1)', border: '#9c27b0', text: '#9c27b0' }
            };
            
            const color = colors[this.mode];
            indicator.style.background = color.bg;
            indicator.style.borderLeftColor = color.border;
            indicator.style.color = color.text;
        }
        
        // Show/hide relevant controls
        this.updateControlVisibility();
    }
    
    /**
     * Show/hide controls based on mode
     */
    updateControlVisibility() {
        // Follow Mode controls
        const followControls = document.getElementById('followModeControls');
        if (followControls) {
            followControls.style.display = this.mode === 'follow' ? 'block' : 'none';
        }
        
        // Style Generator controls
        const styleControls = document.getElementById('styleGeneratorControls');
        if (styleControls) {
            styleControls.style.display = this.mode === 'style' ? 'block' : 'none';
        }
        
        // Direct mode controls (piano roll editing)
        const directControls = document.getElementById('channel2DirectControls');
        if (directControls) {
            directControls.style.display = this.mode === 'direct' ? 'block' : 'none';
        }
    }
    
    /**
     * Get mode info
     */
    getModeInfo(mode = this.mode) {
        return this.modes[mode] || null;
    }
    
    /**
     * Get all available modes
     */
    getAllModes() {
        return Object.entries(this.modes).map(([key, info]) => ({
            key,
            ...info
        }));
    }
}

// Export to global scope
window.ModeSwitcher = ModeSwitcher;

console.log('✅ ModeSwitcher module loaded');

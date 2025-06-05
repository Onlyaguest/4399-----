// scripts/soundManager.js
(function() {
    'use strict';
    
    /**
     * SoundManager handles all game audio effects and background music
     */
    class SoundManager {
        constructor() {
            // Audio elements
            this.backgroundMusic = null;
            this.scoreSound = null;
            this.gameOverSound = null;
            this.gameStartSound = null;
            
            // Audio settings
            this.musicVolume = 0.3;
            this.effectsVolume = 0.5;
            this.isMuted = false;
            
            // Audio context for Web Audio API effects
            this.audioContext = null;
            this.masterGain = null;
            
            console.log('SoundManager created');
        }
        
        /**
         * Initialize the sound manager
         * @returns {Promise<boolean>} True if initialization successful
         */
        async init() {
            console.log('Initializing sound manager...');
            
            try {
                // Create audio context for advanced effects
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    this.audioContext = new AudioContextClass();
                    this.masterGain = this.audioContext.createGain();
                    this.masterGain.connect(this.audioContext.destination);
                }
                
                // Initialize audio elements
                this.initAudioElements();
                
                console.log('Sound manager initialized successfully');
                return true;
            } catch (error) {
                console.error('Failed to initialize sound manager:', error);
                return false;
            }
        }
        
        /**
         * Initialize HTML audio elements
         */
        initAudioElements() {
            // Background music
            this.backgroundMusic = new Audio();
            this.backgroundMusic.src = 'assets/audio/background-music.mp3';
            this.backgroundMusic.loop = true;
            this.backgroundMusic.volume = this.musicVolume;
            this.backgroundMusic.preload = 'auto';
            
            // Score sound effect
            this.scoreSound = new Audio();
            this.scoreSound.src = 'assets/audio/score.mp3';
            this.scoreSound.volume = this.effectsVolume;
            this.scoreSound.preload = 'auto';
            
            // Game over sound effect
            this.gameOverSound = new Audio();
            this.gameOverSound.src = 'assets/audio/game-over.mp3';
            this.gameOverSound.volume = this.effectsVolume;
            this.gameOverSound.preload = 'auto';
            
            // Game start sound effect
            this.gameStartSound = new Audio();
            this.gameStartSound.src = 'assets/audio/game-start.mp3';
            this.gameStartSound.volume = this.effectsVolume;
            this.gameStartSound.preload = 'auto';
            
            // Handle audio loading errors gracefully
            [this.backgroundMusic, this.scoreSound, this.gameOverSound, this.gameStartSound].forEach(audio => {
                audio.addEventListener('error', (e) => {
                    console.warn('Audio file not found:', audio.src, '- Using fallback');
                });
            });
        }
        
        /**
         * Start background music
         */
        startBackgroundMusic() {
            if (this.backgroundMusic && !this.isMuted) {
                // Resume audio context if needed
                if (this.audioContext && this.audioContext.state === 'suspended') {
                    this.audioContext.resume();
                }
                
                this.backgroundMusic.currentTime = 0;
                this.backgroundMusic.play().catch(error => {
                    console.warn('Could not play background music:', error);
                });
            }
        }
        
        /**
         * Stop background music
         */
        stopBackgroundMusic() {
            if (this.backgroundMusic) {
                this.backgroundMusic.pause();
                this.backgroundMusic.currentTime = 0;
            }
        }
        
        /**
         * Play score sound effect
         */
        playScoreSound() {
            if (this.scoreSound && !this.isMuted) {
                // Reset and play
                this.scoreSound.currentTime = 0;
                this.scoreSound.play().catch(error => {
                    console.warn('Could not play score sound:', error);
                });
                
                // Generate procedural score sound if audio file not available
                this.generateScoreBeep();
            }
        }
        
        /**
         * Play game over sound effect
         */
        playGameOverSound() {
            if (this.gameOverSound && !this.isMuted) {
                this.gameOverSound.currentTime = 0;
                this.gameOverSound.play().catch(error => {
                    console.warn('Could not play game over sound:', error);
                });
                
                // Generate procedural game over sound
                this.generateGameOverBeep();
            }
        }
        
        /**
         * Play game start sound effect
         */
        playGameStartSound() {
            if (this.gameStartSound && !this.isMuted) {
                this.gameStartSound.currentTime = 0;
                this.gameStartSound.play().catch(error => {
                    console.warn('Could not play game start sound:', error);
                });
                
                // Generate procedural start sound
                this.generateStartBeep();
            }
        }
        
        /**
         * Generate procedural score beep using Web Audio API
         */
        generateScoreBeep() {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Happy ascending notes
            oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, this.audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, this.audioContext.currentTime + 0.2); // G5
            
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.3);
        }
        
        /**
         * Generate procedural game over beep
         */
        generateGameOverBeep() {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Sad descending notes
            oscillator.frequency.setValueAtTime(523.25, this.audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(415.30, this.audioContext.currentTime + 0.2); // G#4
            oscillator.frequency.setValueAtTime(349.23, this.audioContext.currentTime + 0.4); // F4
            oscillator.frequency.setValueAtTime(261.63, this.audioContext.currentTime + 0.6); // C4
            
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.15, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.8);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.8);
        }
        
        /**
         * Generate procedural start beep
         */
        generateStartBeep() {
            if (!this.audioContext) return;
            
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Energetic start sound
            oscillator.frequency.setValueAtTime(440, this.audioContext.currentTime); // A4
            oscillator.frequency.setValueAtTime(880, this.audioContext.currentTime + 0.1); // A5
            
            oscillator.type = 'triangle';
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.2);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.2);
        }
        
        /**
         * Set music volume
         * @param {number} volume - Volume level (0.0 to 1.0)
         */
        setMusicVolume(volume) {
            this.musicVolume = Math.max(0, Math.min(1, volume));
            if (this.backgroundMusic) {
                this.backgroundMusic.volume = this.musicVolume;
            }
        }
        
        /**
         * Set effects volume
         * @param {number} volume - Volume level (0.0 to 1.0)
         */
        setEffectsVolume(volume) {
            this.effectsVolume = Math.max(0, Math.min(1, volume));
            [this.scoreSound, this.gameOverSound, this.gameStartSound].forEach(audio => {
                if (audio) audio.volume = this.effectsVolume;
            });
        }
        
        /**
         * Toggle mute state
         */
        toggleMute() {
            this.isMuted = !this.isMuted;
            if (this.isMuted) {
                this.stopBackgroundMusic();
            }
            return this.isMuted;
        }
        
        /**
         * Cleanup audio resources
         */
        cleanup() {
            this.stopBackgroundMusic();
            
            if (this.audioContext && this.audioContext.state !== 'closed') {
                this.audioContext.close();
            }
        }
    }
    
    // Expose SoundManager class globally
    window.SoundManager = SoundManager;
    
})();

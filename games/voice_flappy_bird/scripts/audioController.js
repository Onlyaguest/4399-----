// scripts/audioController.js
// (Immediately-Invoked Function Expression to encapsulate the code)
(function() {
    'use strict';

    /**
     * AudioController
     *
     * This module is responsible for:
     * 1. Requesting microphone access from the user.
     * 2. Setting up the Web Audio API to process audio from the microphone.
     * 3. Analyzing the audio stream to calculate real-time loudness (volume level).
     * 4. Providing a public method `getLoudnessLevel()` to retrieve the current loudness.
     * 5. Handling errors related to microphone access and audio processing.
     *
     * Key methods:
     * - async init(uiManagerInstance): Initializes the controller, requests mic permission, and sets up audio processing.
     *   Must be called before other methods. `uiManagerInstance` is used for displaying messages to the user.
     * - startMonitoring(): Begins analyzing audio data. Should be called when audio input is needed (e.g., game starts).
     * - stopMonitoring(): Stops analyzing audio data. Should be called when audio input is no longer needed (e.g., game ends/pauses).
     * - getLoudnessLevel(): Returns the current calculated loudness level (raw RMS value, typically small, e.g., 0.0 to 0.5+).
     * - cleanup(): Releases audio resources. Should be called when the controller is no longer needed.
     */
    class AudioController {
        constructor() {
            this.audioContext = null;
            this.mediaStream = null;
            this.analyser = null;
            this.source = null;
            this.dataArray = null; // Will be Float32Array

            this.isInitialized = false;
            this.isMonitoring = false;
            this.loudnessLevel = 0.0;
            this.uiManager = null; // Will be set via init()

            // Audio processing parameters
            this.fftSize = 256; // Size of the FFT. Determines dataArray size for getFloatTimeDomainData.
                                // Smaller values give faster response but less frequency detail (not used here).
            this.smoothingTimeConstant = 0.8; // Averaging constant for the AnalyserNode. 0 means no averaging.

            console.log('AudioController created');
        }

        /**
         * Initialize audio controller.
         * Requests microphone permission and sets up audio processing chain.
         * @param {object} uiManagerInstance - Instance of UIManager for displaying messages.
         * @returns {Promise<boolean>} True if initialization is successful, false otherwise.
         */
        async init(uiManagerInstance) {
            console.log('Initializing audio controller...');
            this.uiManager = uiManagerInstance;

            // Check for browser support
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                const errorMsg = 'Your browser does not support microphone access (getUserMedia API).';
                console.error(errorMsg);
                if (this.uiManager) this.uiManager.showMicrophoneErrorMessage(errorMsg);
                return false;
            }

            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextClass) {
                const errorMsg = 'Your browser does not support the Web Audio API.';
                console.error(errorMsg);
                if (this.uiManager) this.uiManager.showMicrophoneErrorMessage(errorMsg);
                return false;
            }

            try {
                // Request microphone permission
                const constraints = {
                    audio: {
                        echoCancellation: true,
                        noiseSuppression: true,
                        autoGainControl: true
                    }
                };
                
                this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
                console.log('Microphone access granted.');

                // Create audio context and processing chain
                this.audioContext = new AudioContextClass();
                
                // Handle suspended AudioContext (e.g., due to autoplay policies)
                if (this.audioContext.state === 'suspended') {
                    console.log('AudioContext is suspended. Attempting to resume...');
                    // Best to resume on a user gesture. `startMonitoring` will also try.
                    // For now, we try here; if it fails, startMonitoring will try again on game start.
                    try {
                        await this.audioContext.resume();
                        console.log('AudioContext resumed during init.');
                    } catch (resumeError) {
                        console.warn('Could not resume AudioContext during init:', resumeError);
                        // Not critical here, will try again in startMonitoring
                    }
                }

                this.source = this.audioContext.createMediaStreamSource(this.mediaStream);
                this.analyser = this.audioContext.createAnalyser();

                // Configure analyser
                this.analyser.fftSize = this.fftSize;
                this.analyser.smoothingTimeConstant = this.smoothingTimeConstant;

                // Connect audio nodes: Mic Source -> Analyser
                this.source.connect(this.analyser);

                // Create data array for audio analysis (time-domain data)
                // CRITICAL FIX from previous state: Use analyser.fftSize for Float32Array with getFloatTimeDomainData
                this.dataArray = new Float32Array(this.analyser.fftSize);

                this.isInitialized = true;
                console.log('Audio controller initialized successfully.');
                return true;

            } catch (error) {
                console.error('Failed to initialize audio controller:', error.name, error.message);
                let userMessage = 'Could not access microphone. Please check permissions and settings.';
                if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
                    userMessage = 'Microphone permission denied. Please allow access in browser settings and refresh.';
                } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
                    userMessage = 'No microphone found. Please connect a microphone and refresh.';
                } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
                    userMessage = 'Microphone is busy or unreadable. Check if another app is using it, or try a different microphone.';
                } else if (error.name === 'AbortError') {
                    userMessage = 'Microphone access request was aborted. Please try again.';
                } else if (error.name === 'SecurityError') {
                    userMessage = 'Microphone access is not allowed on this page (e.g. not HTTPS).';
                }
                
                if (this.uiManager) {
                    this.uiManager.showMicrophoneErrorMessage(userMessage);
                }
                this.isInitialized = false;
                return false;
            }
        }

        /**
         * Start monitoring microphone input and calculating loudness.
         */
        startMonitoring() {
            if (!this.isInitialized) {
                console.warn('AudioController not initialized. Cannot start monitoring.');
                if (this.uiManager) this.uiManager.showMicrophoneErrorMessage('Audio system not ready. Please ensure microphone access was granted.');
                return;
            }
            if (this.isMonitoring) {
                // console.warn('Audio monitoring is already active.'); // Can be chatty, make it optional
                return;
            }

            if (!this.audioContext || !this.analyser) {
                console.error('AudioContext or Analyser not available. Cannot start monitoring.');
                if(this.uiManager) this.uiManager.showMicrophoneErrorMessage('Audio system error. Cannot start monitoring.');
                return;
            }

            // Resume AudioContext if it's suspended (e.g., due to browser autoplay policies)
            if (this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('AudioContext resumed successfully for monitoring.');
                    this.isMonitoring = true;
                    this.processAudioLoop();
                    console.log('Audio monitoring started.');
                }).catch(err => {
                    console.error('Failed to resume AudioContext for monitoring:', err);
                    if (this.uiManager) {
                        this.uiManager.showMicrophoneErrorMessage('Could not start audio. Please interact with the page (e.g., click Start) and try again.');
                    }
                });
            } else {
                this.isMonitoring = true;
                this.processAudioLoop();
                console.log('Audio monitoring started.');
            }
        }

        /**
         * Stop monitoring microphone input.
         */
        stopMonitoring() {
            if (!this.isMonitoring) {
                return;
            }
            console.log('Stopping audio monitoring...');
            this.isMonitoring = false;
            this.loudnessLevel = 0.0; // Reset loudness when stopping
        }

        /**
         * Internal loop to continuously process audio data.
         * This method calls itself via requestAnimationFrame.
         */
        processAudioLoop() {
            if (!this.isMonitoring || !this.analyser || !this.dataArray) {
                this.isMonitoring = false; // Ensure loop terminates if state is inconsistent
                return;
            }

            // Get current audio time-domain data
            this.analyser.getFloatTimeDomainData(this.dataArray);

            // Calculate RMS (Root Mean Square) for volume
            const rms = this.calculateRMS(this.dataArray);
            this.loudnessLevel = rms; // Store raw RMS. Game logic can interpret/scale this.
                                      // For example, typical RMS values are small (0.0 to 0.5+).

            // Continue monitoring
            requestAnimationFrame(this.processAudioLoop.bind(this));
        }

        /**
         * Calculate RMS (Root Mean Square) volume from audio data.
         * @param {Float32Array} dataArray - Audio time domain data (values between -1.0 and 1.0).
         * @returns {number} RMS volume (typically a small positive value, e.g., 0.0 to 0.707 for full scale sine).
         */
        calculateRMS(dataArray) {
            let sumSquares = 0;
            for (let i = 0; i < dataArray.length; i++) {
                sumSquares += dataArray[i] * dataArray[i];
            }
            const meanSquare = sumSquares / dataArray.length;
            return Math.sqrt(meanSquare);
        }

        /**
         * Get the current loudness level.
         * @returns {number} Current loudness level (raw RMS value). Returns 0 if not initialized or not monitoring.
         */
        getLoudnessLevel() {
            if (!this.isInitialized || !this.isMonitoring) {
                return 0.0;
            }
            return this.loudnessLevel;
        }

        /**
         * Clean up audio resources (disconnect nodes, stop media stream tracks, close audio context).
         */
        cleanup() {
            console.log('Cleaning up audio controller...');
            this.stopMonitoring();

            if (this.source) {
                this.source.disconnect();
                this.source = null;
            }

            if (this.analyser) {
                this.analyser.disconnect();
                this.analyser = null;
            }

            if (this.mediaStream) {
                this.mediaStream.getTracks().forEach(track => track.stop());
                this.mediaStream = null;
            }

            if (this.audioContext) {
                if (this.audioContext.state !== 'closed') {
                    this.audioContext.close().then(() => {
                        console.log('AudioContext closed.');
                    }).catch(err => {
                        console.error('Error closing AudioContext:', err);
                    });
                }
                this.audioContext = null;
            }
            
            this.isInitialized = false;
            this.dataArray = null;
        }
    }

    // Expose AudioController to the global window object
    window.AudioController = AudioController;

})();

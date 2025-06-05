// scripts/uiManager.js
(function() {
    'use strict';
    
    /**
     * UIManager handles all user interface elements and interactions
     */
    class UIManager {
        constructor() {
            // UI elements
            this.scoreDisplay = null;
            this.startScreen = null;
            this.gameOverScreen = null;
            this.startButton = null;
            this.restartButton = null;
            this.finalScoreDisplay = null;

            // Volume tracker elements
            this.volumeTrackerContainer = null;
            this.volumeFill = null;
            this.volumeNumber = null;
            this.statusIndicator = null;
            this.statusText = null;

            // Callbacks
            this.onStartGame = null;
            this.onRestartGame = null;

            console.log('UIManager created');
        }
        
        /**
         * Initialize UI manager and set up event listeners
         * @param {Function} startGameCallback - Callback for starting the game
         * @param {Function} restartGameCallback - Callback for restarting the game
         */
        init(startGameCallback, restartGameCallback) {
            console.log('Initializing UI manager...');
            
            // Store callbacks
            this.onStartGame = startGameCallback;
            this.onRestartGame = restartGameCallback;
            
            // Get UI elements
            this.scoreDisplay = document.getElementById('scoreDisplay');
            this.startScreen = document.getElementById('startScreen');
            this.gameOverScreen = document.getElementById('gameOverScreen');
            this.startButton = document.getElementById('startButton');
            this.restartButton = document.getElementById('restartButton');
            this.finalScoreDisplay = document.getElementById('finalScore');

            // Get volume tracker elements
            this.volumeTrackerContainer = document.getElementById('volumeTrackerContainer');
            this.volumeFill = document.getElementById('volumeFill');
            this.volumeNumber = document.getElementById('volumeNumber');
            this.statusIndicator = document.getElementById('statusIndicator');
            this.statusText = document.getElementById('statusText');
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Show initial screen
            this.showStartScreen();
            
            console.log('UI manager initialized');
        }
        
        /**
         * Set up event listeners for UI interactions
         */
        setupEventListeners() {
            // Start button
            if (this.startButton) {
                this.startButton.addEventListener('click', () => {
                    if (this.onStartGame) {
                        this.onStartGame();
                    }
                });
            }
            
            // Restart button
            if (this.restartButton) {
                this.restartButton.addEventListener('click', () => {
                    if (this.onRestartGame) {
                        this.onRestartGame();
                    }
                });
            }
            
            // Keyboard shortcuts
            document.addEventListener('keydown', (event) => {
                if (event.code === 'Space') {
                    event.preventDefault();
                    
                    // Handle space key based on current screen
                    if (!this.startScreen.classList.contains('hidden')) {
                        // Start screen is visible
                        if (this.onStartGame) {
                            this.onStartGame();
                        }
                    } else if (!this.gameOverScreen.classList.contains('hidden')) {
                        // Game over screen is visible
                        if (this.onRestartGame) {
                            this.onRestartGame();
                        }
                    }
                }
            });
        }
        
        /**
         * Update the score display
         * @param {number} score - Current score
         */
        updateScore(score) {
            if (this.scoreDisplay) {
                this.scoreDisplay.textContent = score.toString();
            }
        }
        
        /**
         * Show the start screen
         */
        showStartScreen() {
            if (this.startScreen) {
                this.startScreen.classList.remove('hidden');
            }
            
            // Reset score display
            this.updateScore(0);
        }
        
        /**
         * Hide the start screen
         */
        hideStartScreen() {
            if (this.startScreen) {
                this.startScreen.classList.add('hidden');
            }
        }
        
        /**
         * Show the game over screen
         * @param {number} finalScore - Final game score
         */
        showGameOverScreen(finalScore) {
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.remove('hidden');
            }
            
            if (this.finalScoreDisplay) {
                this.finalScoreDisplay.textContent = finalScore.toString();
            }
        }
        
        /**
         * Hide the game over screen
         */
        hideGameOverScreen() {
            if (this.gameOverScreen) {
                this.gameOverScreen.classList.add('hidden');
            }
        }
        
        /**
         * Show a temporary message to the user
         * @param {string} message - Message to display
         * @param {number} duration - Duration in milliseconds
         */
        showTemporaryMessage(message, duration = 3000) {
            // Create temporary message element
            const messageElement = document.createElement('div');
            messageElement.textContent = message;
            messageElement.style.cssText = `
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 20px;
                border-radius: 8px;
                font-size: 18px;
                z-index: 1000;
                pointer-events: none;
            `;
            
            // Add to page
            document.body.appendChild(messageElement);
            
            // Remove after duration
            setTimeout(() => {
                if (messageElement.parentNode) {
                    messageElement.parentNode.removeChild(messageElement);
                }
            }, duration);
        }
        
        /**
         * Show microphone permission request message
         */
        showMicrophonePermissionMessage() {
            this.showTemporaryMessage('请允许麦克风访问权限以开始游戏', 4000);
        }
        
        /**
         * Show microphone error message
         * @param {string} message - Optional custom error message
         */
        showMicrophoneErrorMessage(message) {
            const errorMessage = message || '无法访问麦克风，请检查权限设置';
            this.showTemporaryMessage(errorMessage, 5000);
        }
        
        /**
         * Show game instructions
         */
        showInstructions() {
            this.showTemporaryMessage('发出声音控制小鸟飞行！', 3000);
        }

        /**
         * Get selected game mode
         * @returns {string} Selected game mode ('normal' or 'silly')
         */
        getSelectedGameMode() {
            const modeRadios = document.querySelectorAll('input[name="gameMode"]');
            for (let radio of modeRadios) {
                if (radio.checked) {
                    return radio.value;
                }
            }
            return 'normal'; // Default to normal mode
        }

        /**
         * Show volume tracker container
         */
        showVolumeTracker() {
            if (this.volumeTrackerContainer) {
                this.volumeTrackerContainer.style.display = 'block';
                this.updateVolumeStatus('listening', '监听中');
            }
        }

        /**
         * Hide volume tracker container
         */
        hideVolumeTracker() {
            if (this.volumeTrackerContainer) {
                this.volumeTrackerContainer.style.display = 'none';
                this.updateVolumeStatus('inactive', '待机中');
                this.updateVolumeLevel(0);
            }
        }

        /**
         * Update volume level display
         * @param {number} loudness - Raw loudness value from audio controller (0.0 to ~0.5+)
         */
        updateVolumeLevel(loudness) {
            if (!this.volumeFill || !this.volumeNumber) return;

            // Convert raw loudness to percentage (scale and clamp)
            // Typical RMS values are small, so we scale them up
            const percentage = Math.min(Math.max(loudness * 200, 0), 100);

            // Update visual elements
            this.volumeFill.style.width = percentage + '%';
            this.volumeNumber.textContent = Math.round(percentage);

            // Update status based on volume level
            if (percentage > 30) {
                this.updateVolumeStatus('active', '检测到声音');
            } else if (percentage > 5) {
                this.updateVolumeStatus('listening', '监听中');
            } else {
                this.updateVolumeStatus('listening', '等待声音');
            }
        }

        /**
         * Update volume status indicator
         * @param {string} status - Status type ('inactive', 'listening', 'active')
         * @param {string} text - Status text to display
         */
        updateVolumeStatus(status, text) {
            if (!this.statusIndicator || !this.statusText) return;

            // Remove all status classes
            this.statusIndicator.classList.remove('inactive', 'listening', 'active');

            // Add current status class
            this.statusIndicator.classList.add(status);

            // Update status text
            this.statusText.textContent = text;
        }
    }
    
    // Expose UIManager class globally
    window.UIManager = UIManager;
    
})();

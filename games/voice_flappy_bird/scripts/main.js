// scripts/main.js
(function() {
    'use strict';
    
    console.log('main.js loaded');
    
    // Game state management
    const GameState = {
        READY: 'ready',
        PLAYING: 'playing',
        GAME_OVER: 'gameOver'
    };
    
    // Game variables
    let gameState = GameState.READY;
    let canvas;
    let ctx;
    let score = 0;
    let lastTime = 0;
    let animationId;
    
    // Game objects (will be initialized by other modules)
    let bird;
    let pipeController;
    let audioController; // Instance of AudioController
    let soundManager;    // Instance of SoundManager
    let effectsManager;  // Instance of EffectsManager
    let renderer;
    let uiManager;       // Instance of UIManager
    let collisionDetector;
    
    /**
     * Initialize the game
     */
    async function initGame() { // Made async to await audioController.init
        console.log('Initializing game...');
        
        // Get canvas and context
        canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas element not found!');
            return;
        }
        
        ctx = canvas.getContext('2d');
        
        // Initialize game modules
        try {
            // Initialize UI manager first as other modules might use it
            if (window.UIManager) {
                uiManager = new window.UIManager();
                uiManager.init(startGame, restartGame); // Pass startGame and restartGame callbacks
                console.log('UI manager initialized');
            } else {
                console.error("UIManager class not found. UI will not function.");
            }

            // Initialize audio controller
            if (window.AudioController) {
                audioController = new window.AudioController();
                // Pass uiManager instance for error messages and prompts
                const audioInitialized = await audioController.init(uiManager); 
                if (audioInitialized) {
                    console.log('Audio controller initialized successfully by main.js');
                } else {
                    console.warn('Audio controller failed to initialize. Voice control may not be available.');
                    // uiManager (if available) should have displayed a message from within audioController.init()
                }
            } else {
                console.error("AudioController class not found. Voice control will not be available.");
                if(uiManager) uiManager.showMicrophoneErrorMessage("Audio system component missing.");
            }

            // Initialize sound manager
            if (window.SoundManager) {
                soundManager = new window.SoundManager();
                await soundManager.init();
                console.log('Sound manager initialized');
            } else {
                console.error("SoundManager class not found. Audio effects will not be available.");
            }

            // Initialize effects manager
            if (window.EffectsManager) {
                effectsManager = new window.EffectsManager();
                // Will initialize with elements after DOM is ready
                console.log('Effects manager created');
            } else {
                console.error("EffectsManager class not found. Visual effects will not be available.");
            }

            // Initialize bird
            if (window.Bird) {
                bird = new window.Bird(canvas.width / 4, canvas.height / 2);
                console.log('Bird initialized');
            }
            
            // Initialize pipe controller
            if (window.PipeController) {
                pipeController = new window.PipeController(canvas.width, canvas.height);
                console.log('Pipe controller initialized');
            }
            
            // Initialize collision detector
            if (window.CollisionDetector) {
                collisionDetector = new window.CollisionDetector();
                console.log('Collision detector initialized');
            }
            
            // Initialize renderer
            if (window.Renderer) {
                renderer = new window.Renderer(ctx, canvas.width, canvas.height);
                console.log('Renderer initialized');
            }

            // Initialize effects manager with DOM elements
            if (effectsManager && uiManager) {
                const scoreElement = document.getElementById('scoreDisplay');
                const gameContainer = document.querySelector('.game-container');
                effectsManager.init(scoreElement, gameContainer);
                console.log('Effects manager initialized with DOM elements');
            }

        } catch (error) {
            console.error('Error initializing game modules:', error);
            if(uiManager) uiManager.showTemporaryMessage("Error initializing game: " + error.message, 5000);
        }
    }
    
    // Removed handleAudioInput(volume) as loudness is now polled via getLoudnessLevel()
    
    /**
     * Start the game
     */
    function startGame() {
        console.log('Starting game...');
        
        // Ensure audio context is running, especially if it needed a user gesture
        if (audioController && audioController.isInitialized && audioController.audioContext && audioController.audioContext.state === 'suspended') {
            audioController.audioContext.resume().then(() => {
                console.log('AudioContext resumed on game start.');
                proceedWithGameStart();
            }).catch(err => {
                console.error('Failed to resume AudioContext on game start:', err);
                if (uiManager) uiManager.showMicrophoneErrorMessage('Could not start audio. Please try again.');
                // Optionally, don't start the game or start without audio control
                proceedWithGameStart(); // Proceed anyway, voice control might not work
            });
        } else {
            proceedWithGameStart();
        }
    }

    function proceedWithGameStart() {
        gameState = GameState.PLAYING;

        // Get selected game mode
        const gameMode = uiManager ? uiManager.getSelectedGameMode() : 'normal';
        console.log('Starting game in mode:', gameMode);

        // Set collision detector mode
        if (collisionDetector) {
            collisionDetector.setSillyBirdMode(gameMode === 'silly');
        }

        // Reset game state
        score = 0;
        if (bird) bird.reset();
        if (pipeController) pipeController.reset();
        if (uiManager) {
            uiManager.hideStartScreen();
            uiManager.updateScore(score); // Ensure score display is reset

            // Show mode-specific instructions
            if (gameMode === 'silly') {
                uiManager.showTemporaryMessage('傻鸟模式：碰壁和碰柱子都不会死亡！', 3000);
            } else {
                uiManager.showInstructions();
            }
        }

        // Start audio monitoring and show volume tracker
        if (audioController && audioController.isInitialized) {
            audioController.startMonitoring();
            if (uiManager) {
                uiManager.showVolumeTracker();
            }
        } else {
            console.warn("Audio controller not ready, voice control will be disabled.");
            if (uiManager && (!audioController || !audioController.isInitialized)) {
                 // uiManager.showTemporaryMessage("Voice control disabled: Mic not ready.", 3000); // Might be redundant if init failed message was shown
            }
        }

        // Start background music and play game start sound
        if (soundManager) {
            soundManager.startBackgroundMusic();
            soundManager.playGameStartSound();
        }

        // Play game start effect
        if (effectsManager) {
            effectsManager.playGameStartEffect();
        }

        // Start game loop
        startGameLoop();
    }
    
    /**
     * Restart the game
     */
    function restartGame() {
        console.log('Restarting game...');
        
        // Stop current game loop
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        gameState = GameState.READY;
        
        // Reset and show start screen
        if (uiManager) {
            uiManager.hideGameOverScreen();
            uiManager.showStartScreen();
            uiManager.updateScore(0); // Reset score on UI
        }
        
        // Stop audio monitoring and hide volume tracker
        if (audioController) {
            audioController.stopMonitoring();
        }
        if (uiManager) {
            uiManager.hideVolumeTracker();
        }

        // Stop background music
        if (soundManager) {
            soundManager.stopBackgroundMusic();
        }
    }
    
    /**
     * Start the game loop
     */
    function startGameLoop() {
        if (animationId) cancelAnimationFrame(animationId); // Ensure no multiple loops
        lastTime = performance.now();
        gameLoop();
    }
    
    /**
     * Main game loop
     * @param {number} currentTime - Current timestamp
     */
    function gameLoop(currentTime = performance.now()) {
        if (gameState !== GameState.PLAYING) {
            return;
        }
        
        const deltaTime = currentTime - lastTime;
        lastTime = currentTime;
        
        // Update game objects
        update(deltaTime);
        
        // Render frame
        render();
        
        // Continue loop
        animationId = requestAnimationFrame(gameLoop);
    }
    
    /**
     * Update game state
     * @param {number} deltaTime - Time elapsed since last frame
     */
    function update(deltaTime) {
        // Update bird physics
        if (bird) {
            // Handle voice input for bird and update volume display
            if (audioController && audioController.isInitialized && audioController.isMonitoring) {
                const loudness = audioController.getLoudnessLevel();
                // console.log('Loudness:', loudness); // For debugging, can be very chatty
                bird.handleVoiceInput(loudness);

                // Update volume tracker display
                if (uiManager) {
                    uiManager.updateVolumeLevel(loudness);
                }
            }
            bird.update(deltaTime);
        }
        
        // Update pipes
        if (pipeController) {
            pipeController.update(deltaTime);
            
            // Check for score updates
            const newScore = pipeController.getScore();
            if (newScore > score) {
                const oldScore = score;
                score = newScore;
                if (uiManager) {
                    uiManager.updateScore(score);
                }

                // Play score effects and sound
                if (soundManager) {
                    soundManager.playScoreSound();
                }
                if (effectsManager) {
                    effectsManager.playScoreEffect(score);
                }
            }
        }
        
        // Check collisions
        if (collisionDetector && bird && pipeController) {
            const pipes = pipeController.getPipes();
            
            if (collisionDetector.checkCollisions(bird, pipes, canvas.height)) {
                gameOver();
                return;
            }
        }
    }
    
    /**
     * Render the game frame
     */
    function render() {
        if (renderer && ctx) { // Ensure renderer and context are available
            // Clear canvas
            renderer.clear();
            
            // Draw background
            renderer.drawBackground();
            
            // Draw pipes
            if (pipeController) {
                const pipes = pipeController.getPipes();
                renderer.drawPipes(pipes);
            }
            
            // Draw bird
            if (bird) {
                renderer.drawBird(bird);
            }
        }
    }
    
    /**
     * Handle game over
     */
    function gameOver() {
        console.log('Game Over! Final score:', score);
        gameState = GameState.GAME_OVER;
        
        // Stop game loop
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        
        // Stop audio monitoring and hide volume tracker
        if (audioController) {
            audioController.stopMonitoring();
        }
        if (uiManager) {
            uiManager.hideVolumeTracker();
        }

        // Stop background music and play game over sound
        if (soundManager) {
            soundManager.stopBackgroundMusic();
            soundManager.playGameOverSound();
        }

        // Play game over effects
        if (effectsManager) {
            effectsManager.playGameOverEffect();
        }

        // Show game over screen
        if (uiManager) {
            uiManager.showGameOverScreen(score);
        }
    }
    
    /**
     * Initialize everything when page loads
     */
    window.addEventListener('load', async () => { // Made async to await initGame
        console.log('Page loaded, initializing game...');
        await initGame(); // await initGame which now awaits audioController.init
    });
    
    // Expose game functions globally for debugging
    window.FlappyBirdGame = {
        startGame,
        restartGame,
        gameOver,
        getGameState: () => gameState,
        getScore: () => score,
        getAudioController: () => audioController // For debugging audio
    };
    
})();

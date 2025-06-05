// scripts/effectsManager.js
(function() {
    'use strict';
    
    /**
     * EffectsManager handles visual effects like score animations and particles
     */
    class EffectsManager {
        constructor() {
            this.scoreElement = null;
            this.gameContainer = null;
            this.activeEffects = [];
            
            console.log('EffectsManager created');
        }
        
        /**
         * Initialize the effects manager
         * @param {HTMLElement} scoreElement - Score display element
         * @param {HTMLElement} gameContainer - Game container element
         */
        init(scoreElement, gameContainer) {
            this.scoreElement = scoreElement;
            this.gameContainer = gameContainer;
            console.log('Effects manager initialized');
        }
        
        /**
         * Play score increase effect
         * @param {number} newScore - The new score value
         */
        playScoreEffect(newScore) {
            if (!this.scoreElement) return;
            
            // Score bounce animation
            this.animateScoreBounce();
            
            // Score flash effect
            this.animateScoreFlash();
            
            // Floating score text
            this.createFloatingScoreText('+1');
            
            // Particle burst effect
            this.createScoreParticles();
            
            // Screen flash effect
            this.createScreenFlash();
        }
        
        /**
         * Animate score bounce effect
         */
        animateScoreBounce() {
            if (!this.scoreElement) return;
            
            // Remove any existing animation
            this.scoreElement.classList.remove('score-bounce');
            
            // Force reflow to restart animation
            this.scoreElement.offsetHeight;
            
            // Add bounce animation
            this.scoreElement.classList.add('score-bounce');
            
            // Remove class after animation
            setTimeout(() => {
                this.scoreElement.classList.remove('score-bounce');
            }, 600);
        }
        
        /**
         * Animate score flash effect
         */
        animateScoreFlash() {
            if (!this.scoreElement) return;
            
            this.scoreElement.classList.remove('score-flash');
            this.scoreElement.offsetHeight;
            this.scoreElement.classList.add('score-flash');
            
            setTimeout(() => {
                this.scoreElement.classList.remove('score-flash');
            }, 400);
        }
        
        /**
         * Create floating score text effect
         * @param {string} text - Text to display
         */
        createFloatingScoreText(text) {
            if (!this.scoreElement || !this.gameContainer) return;
            
            const floatingText = document.createElement('div');
            floatingText.className = 'floating-score-text';
            floatingText.textContent = text;
            
            // Position near the score
            const scoreRect = this.scoreElement.getBoundingClientRect();
            const containerRect = this.gameContainer.getBoundingClientRect();
            
            floatingText.style.left = (scoreRect.left - containerRect.left + scoreRect.width + 20) + 'px';
            floatingText.style.top = (scoreRect.top - containerRect.top) + 'px';
            
            this.gameContainer.appendChild(floatingText);
            
            // Animate and remove
            setTimeout(() => {
                floatingText.classList.add('floating-score-animate');
            }, 10);
            
            setTimeout(() => {
                if (floatingText.parentNode) {
                    floatingText.parentNode.removeChild(floatingText);
                }
            }, 1000);
        }
        
        /**
         * Create particle burst effect
         */
        createScoreParticles() {
            if (!this.scoreElement || !this.gameContainer) return;
            
            const particleCount = 8;
            const scoreRect = this.scoreElement.getBoundingClientRect();
            const containerRect = this.gameContainer.getBoundingClientRect();
            
            for (let i = 0; i < particleCount; i++) {
                const particle = document.createElement('div');
                particle.className = 'score-particle';
                
                // Position at score center
                const centerX = scoreRect.left - containerRect.left + scoreRect.width / 2;
                const centerY = scoreRect.top - containerRect.top + scoreRect.height / 2;
                
                particle.style.left = centerX + 'px';
                particle.style.top = centerY + 'px';
                
                // Random direction and distance
                const angle = (i / particleCount) * Math.PI * 2;
                const distance = 50 + Math.random() * 30;
                const endX = centerX + Math.cos(angle) * distance;
                const endY = centerY + Math.sin(angle) * distance;
                
                particle.style.setProperty('--end-x', endX + 'px');
                particle.style.setProperty('--end-y', endY + 'px');
                
                this.gameContainer.appendChild(particle);
                
                // Animate and remove
                setTimeout(() => {
                    particle.classList.add('particle-animate');
                }, 10);
                
                setTimeout(() => {
                    if (particle.parentNode) {
                        particle.parentNode.removeChild(particle);
                    }
                }, 800);
            }
        }
        
        /**
         * Create screen flash effect
         */
        createScreenFlash() {
            if (!this.gameContainer) return;
            
            const flash = document.createElement('div');
            flash.className = 'screen-flash';
            this.gameContainer.appendChild(flash);
            
            setTimeout(() => {
                flash.classList.add('flash-animate');
            }, 10);
            
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, 300);
        }
        
        /**
         * Create game over effect
         */
        playGameOverEffect() {
            this.createScreenShake();
            this.createGameOverFlash();
        }
        
        /**
         * Create screen shake effect
         */
        createScreenShake() {
            if (!this.gameContainer) return;
            
            this.gameContainer.classList.add('screen-shake');
            
            setTimeout(() => {
                this.gameContainer.classList.remove('screen-shake');
            }, 500);
        }
        
        /**
         * Create game over flash effect
         */
        createGameOverFlash() {
            if (!this.gameContainer) return;
            
            const flash = document.createElement('div');
            flash.className = 'game-over-flash';
            this.gameContainer.appendChild(flash);
            
            setTimeout(() => {
                flash.classList.add('flash-animate');
            }, 10);
            
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, 600);
        }
        
        /**
         * Create game start effect
         */
        playGameStartEffect() {
            this.createStartFlash();
        }
        
        /**
         * Create game start flash effect
         */
        createStartFlash() {
            if (!this.gameContainer) return;
            
            const flash = document.createElement('div');
            flash.className = 'start-flash';
            this.gameContainer.appendChild(flash);
            
            setTimeout(() => {
                flash.classList.add('flash-animate');
            }, 10);
            
            setTimeout(() => {
                if (flash.parentNode) {
                    flash.parentNode.removeChild(flash);
                }
            }, 400);
        }
        
        /**
         * Cleanup all active effects
         */
        cleanup() {
            // Remove any remaining effect elements
            const effectElements = this.gameContainer.querySelectorAll(
                '.floating-score-text, .score-particle, .screen-flash, .game-over-flash, .start-flash'
            );
            
            effectElements.forEach(element => {
                if (element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            });
            
            // Remove animation classes
            if (this.scoreElement) {
                this.scoreElement.classList.remove('score-bounce', 'score-flash');
            }
            
            if (this.gameContainer) {
                this.gameContainer.classList.remove('screen-shake');
            }
        }
    }
    
    // Expose EffectsManager class globally
    window.EffectsManager = EffectsManager;
    
})();

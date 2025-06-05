// scripts/pipeController.js
(function() {
    'use strict';
    
    /**
     * PipeController manages pipe generation, movement, and scoring
     */
    class PipeController {
        constructor(canvasWidth, canvasHeight) {
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            this.pipes = [];
            this.score = 0;
            
            // Pipe generation settings
            this.pipeWidth = 60;
            this.pipeGap = 150; // Gap between upper and lower pipes
            this.pipeSpeed = 2;
            this.spawnDistance = 250; // Distance between pipe pairs
            this.nextSpawnX = canvasWidth + 100; // X position for next pipe spawn
            
            // Pipe visual properties
            this.pipeColor = '#228B22'; // Forest green
            
            console.log('PipeController created');
        }
        
        /**
         * Update pipes - move existing pipes and spawn new ones
         * @param {number} deltaTime - Time elapsed since last update
         */
        update(deltaTime) {
            // Move existing pipes
            this.movePipes();
            
            // Remove pipes that are off-screen
            this.removeOffScreenPipes();
            
            // Spawn new pipes if needed
            this.spawnPipeIfNeeded();
            
            // Update score
            this.updateScore();
        }
        
        /**
         * Move all pipes to the left
         */
        movePipes() {
            for (let pipe of this.pipes) {
                pipe.x -= this.pipeSpeed;
            }
        }
        
        /**
         * Remove pipes that have moved off the left side of the screen
         */
        removeOffScreenPipes() {
            this.pipes = this.pipes.filter(pipe => pipe.x + this.pipeWidth > -50);
        }
        
        /**
         * Spawn a new pipe pair if the last pipe has moved far enough
         */
        spawnPipeIfNeeded() {
            // Check if we need to spawn a new pipe pair
            const lastPipe = this.getLastPipe();
            if (!lastPipe || lastPipe.x <= this.canvasWidth - this.spawnDistance) {
                this.spawnPipePair();
            }
        }
        
        /**
         * Spawn a new pair of pipes (upper and lower)
         */
        spawnPipePair() {
            // Random gap position (vertical center of the gap)
            const minGapY = this.pipeGap / 2 + 50;
            const maxGapY = this.canvasHeight - this.pipeGap / 2 - 100;
            const gapCenterY = Math.random() * (maxGapY - minGapY) + minGapY;
            
            const x = this.canvasWidth + 50;
            
            // Upper pipe
            const upperPipe = {
                x: x,
                y: 0,
                width: this.pipeWidth,
                height: gapCenterY - this.pipeGap / 2,
                type: 'upper',
                scored: false
            };
            
            // Lower pipe
            const lowerPipe = {
                x: x,
                y: gapCenterY + this.pipeGap / 2,
                width: this.pipeWidth,
                height: this.canvasHeight - (gapCenterY + this.pipeGap / 2),
                type: 'lower',
                scored: false
            };
            
            this.pipes.push(upperPipe, lowerPipe);
            console.log('Spawned new pipe pair at x:', x);
        }
        
        /**
         * Get the rightmost pipe for spawn timing
         * @returns {Object|null} Last pipe or null if no pipes exist
         */
        getLastPipe() {
            if (this.pipes.length === 0) return null;
            
            let lastPipe = this.pipes[0];
            for (let pipe of this.pipes) {
                if (pipe.x > lastPipe.x) {
                    lastPipe = pipe;
                }
            }
            return lastPipe;
        }
        
        /**
         * Update score when bird passes through pipes
         */
        updateScore() {
            // Assume bird is at x = canvasWidth / 4 (same as bird's initial x position)
            const birdX = this.canvasWidth / 4;
            
            for (let pipe of this.pipes) {
                // Score when bird passes the right edge of upper pipes
                if (pipe.type === 'upper' && !pipe.scored && pipe.x + pipe.width < birdX) {
                    pipe.scored = true;
                    this.score++;
                    console.log('Score increased to:', this.score);
                }
            }
        }
        
        /**
         * Reset pipe controller to initial state
         */
        reset() {
            this.pipes = [];
            this.score = 0;
            this.nextSpawnX = this.canvasWidth + 100;
            console.log('PipeController reset');
        }
        
        /**
         * Get all current pipes
         * @returns {Array} Array of pipe objects
         */
        getPipes() {
            return this.pipes;
        }
        
        /**
         * Get current score
         * @returns {number} Current score
         */
        getScore() {
            return this.score;
        }
    }
    
    // Expose PipeController class globally
    window.PipeController = PipeController;
    
})();

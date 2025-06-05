// scripts/bird.js
(function() {
    'use strict';
    
    /**
     * Bird class handles the player character physics and behavior
     */
    class Bird {
        constructor(x, y) {
            // Position and physics
            this.x = x;
            this.y = y;
            this.initialX = x;
            this.initialY = y;
            this.velocity = 0; // Represents vertical velocity (velocityY)
            this.rotation = 0;
            
            // Physics constants
            this.gravity = 0.5; // Gravity acceleration
            this.baseJumpForce = -8; // Base upward velocity for a flap (negative value for upward movement)
            this.maxLoudnessForFullFlap = 0.2; // Loudness level (e.g., RMS) that results in a full strength flap
                                               // This value might need tuning based on microphone sensitivity and typical voice levels.
            
            this.maxVelocity = 10; // Terminal velocity (maximum falling speed)
            this.rotationSpeed = 0.1; // (Not directly used in current rotation logic, but could be for smoother transitions)
            
            // Visual properties
            this.width = 30;  // Bird's width
            this.height = 20; // Bird's height
            this.color = '#FFD700'; // Gold color, as an example
            
            console.log('Bird created at position:', x, y);
        }
        
        /**
         * Handles voice input to make the bird flap.
         * Called from main game loop with loudness data from AudioController.
         * @param {number} loudness - Current loudness level (e.g., raw RMS value from AudioController).
         */
        handleVoiceInput(loudness) {
            // Define a minimum loudness threshold to trigger any flap.
            // This helps ignore quiet background noise.
            const activationThreshold = 0.05; // Adjust this based on testing.
            
            if (loudness > activationThreshold) {
                // Map loudness to flap strength.
                // Louder sounds result in a stronger flap (higher upward velocity).
                
                // Ensure effectiveLoudness doesn't exceed maxLoudnessForFullFlap for scaling.
                const effectiveLoudness = Math.min(loudness, this.maxLoudnessForFullFlap);
                
                // Define min/max flap forces. A quiet sound above threshold gives a small flap.
                const minFlapForce = this.baseJumpForce * 0.6; // e.g., 60% of base jump force for minimal activation
                const maxFlapForce = this.baseJumpForce;       // Full strength flap
                
                let mappedForce = minFlapForce; // Default to min flap if logic below doesn't apply or range is too small

                // Avoid division by zero or negative range if activationThreshold is close to or exceeds maxLoudnessForFullFlap
                if (this.maxLoudnessForFullFlap > activationThreshold) {
                    // Linear interpolation of flap force based on loudness
                    // (effectiveLoudness - activationThreshold) / (maxLoudnessForFullFlap - activationThreshold) gives a 0-1 range
                    const loudnessRatio = (effectiveLoudness - activationThreshold) / (this.maxLoudnessForFullFlap - activationThreshold);
                    mappedForce = minFlapForce + (maxFlapForce - minFlapForce) * loudnessRatio;
                } else if (effectiveLoudness > activationThreshold) {
                    // If maxLoudnessForFullFlap is not properly set above activationThreshold,
                    // just use maxFlapForce for any sound above activation.
                    mappedForce = maxFlapForce;
                }

                // Ensure force is not weaker than maxFlapForce (since they are negative, Math.min selects the more negative one)
                mappedForce = Math.min(mappedForce, maxFlapForce); 
                // And not stronger than minFlapForce (less negative)
                mappedForce = Math.max(mappedForce, minFlapForce);


                this.flap(mappedForce);
            }
        }
        
        /**
         * Makes the bird "flap its wings", applying an upward velocity.
         * @param {number} [force=this.baseJumpForce] - The upward force (negative velocity) to apply.
         */
        flap(force = this.baseJumpForce) {
            this.velocity = force; // Set vertical velocity to the upward force
            // console.log('Bird flapped with force:', force, 'New velocity:', this.velocity); // For debugging
        }
        
        /**
         * Updates the bird's state (position, velocity) based on physics.
         * Called in each frame of the game loop.
         * @param {number} deltaTime - Time elapsed since the last update (in milliseconds).
         *                           (Note: current physics are frame-rate dependent; deltaTime not fully utilized for scaling physics yet).
         */
        update(deltaTime) {
            // Apply gravity to vertical velocity
            this.velocity += this.gravity;
            
            // Limit maximum falling velocity (terminal velocity)
            if (this.velocity > this.maxVelocity) {
                this.velocity = this.maxVelocity;
            }
            
            // Update bird's vertical position
            this.y += this.velocity;
            
            // Boundary check: Prevent bird from flying above the top of the canvas
            if (this.y - this.height / 2 < 0) { // Assuming y is center, check top edge of bird
                this.y = this.height / 2;       // Position bird at the top edge
                this.velocity = Math.max(0, this.velocity); // Stop upward movement, or allow slight bounce if velocity was negative
            }

            // Note: Collision with the bottom of the canvas (ground) is typically handled
            // by the CollisionDetector module, which would trigger a game over.
            
            // Update bird's rotation based on its vertical velocity
            this.updateRotation();
        }
        
        /**
         * Updates the bird's rotation angle based on its current vertical velocity.
         * Tilts the bird upwards when flying up, and downwards when falling.
         */
        updateRotation() {
            const maxRotationDegrees = 45; // Max tilt angle in degrees
            const maxRotationRadians = maxRotationDegrees * Math.PI / 180;

            if (this.velocity < 0) { // Flying upwards
                // Map velocity (from baseJumpForce up to 0) to rotation (from -maxRotationRadians up to 0)
                // Using Math.abs(this.baseJumpForce) as the reference for max upward speed.
                const upwardSpeedRatio = Math.min(Math.abs(this.velocity) / Math.abs(this.baseJumpForce), 1);
                this.rotation = -maxRotationRadians * upwardSpeedRatio;
            } else { // Falling downwards or stationary
                // Map velocity (from 0 down to maxVelocity) to rotation (from 0 down to maxRotationRadians)
                const downwardSpeedRatio = Math.min(this.velocity / this.maxVelocity, 1);
                this.rotation = maxRotationRadians * downwardSpeedRatio;
            }
        }
        
        /**
         * Resets the bird to its initial state (position, velocity, rotation).
         * Called when starting or restarting the game.
         */
        reset() {
            this.x = this.initialX;
            this.y = this.initialY;
            this.velocity = 0;
            this.rotation = 0;
            console.log('Bird reset to initial position');
        }
        
        /**
         * Gets the bird's bounding box for collision detection.
         * This is an axis-aligned bounding box (AABB).
         * @returns {object} An object with {x, y, width, height} properties.
         *                   x, y are the top-left coordinates of the box.
         */
        getBoundingBox() {
            // Assuming this.x and this.y are the center of the bird
            return {
                x: this.x - this.width / 2,
                y: this.y - this.height / 2,
                width: this.width,
                height: this.height
            };
        }
        
        /**
         * (Helper, more for internal logic or specific checks if needed)
         * Checks if the bird is out of the canvas bounds (top or bottom).
         * Primary game over conditions (ground/pipe collision) are handled by CollisionDetector.
         * @param {number} canvasHeight - The height of the game canvas.
         * @returns {boolean} True if the bird is out of vertical bounds.
         */
        isOutOfBounds(canvasHeight) {
            const birdBox = this.getBoundingBox();
            // Check top boundary (already handled in update, but can be an explicit check)
            if (birdBox.y < 0) return true;
            // Check bottom boundary
            if (birdBox.y + birdBox.height > canvasHeight) return true;
            return false;
        }
        
        /**
         * Gets the data required for rendering the bird.
         * @returns {object} An object with bird's current render properties.
         */
        getRenderData() {
            return {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                rotation: this.rotation,
                color: this.color
            };
        }
    }
    
    // Expose Bird class to the global window object to make it accessible by other scripts
    window.Bird = Bird;
    
})();

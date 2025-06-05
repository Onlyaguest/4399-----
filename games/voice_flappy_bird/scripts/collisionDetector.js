// scripts/collisionDetector.js
(function() {
    'use strict';
    
    /**
     * CollisionDetector handles collision detection between game objects
     */
    class CollisionDetector {
        constructor() {
            this.sillyBirdMode = false; // 傻鸟模式标志
            console.log('CollisionDetector created');
        }

        /**
         * Set silly bird mode
         * @param {boolean} enabled - Whether silly bird mode is enabled
         */
        setSillyBirdMode(enabled) {
            this.sillyBirdMode = enabled;
            console.log('Silly bird mode:', enabled ? 'enabled' : 'disabled');
        }
        
        /**
         * Check all collisions for the bird
         * @param {Object} bird - Bird object
         * @param {Array} pipes - Array of pipe objects
         * @param {number} canvasHeight - Canvas height for ground collision
         * @returns {boolean} True if any collision detected
         */
        checkCollisions(bird, pipes, canvasHeight) {
            // In silly bird mode, no collisions cause death
            if (this.sillyBirdMode) {
                // Handle boundary bouncing in silly bird mode
                this.handleBoundaryBouncing(bird, canvasHeight);

                // Handle pipe bouncing in silly bird mode
                this.handlePipeBouncing(bird, pipes);

                return false; // Never die in silly bird mode
            }

            // Normal mode: check all collisions
            // Check ground collision
            if (this.checkGroundCollision(bird, canvasHeight)) {
                console.log('Ground collision detected');
                return true;
            }

            // Check ceiling collision
            if (this.checkCeilingCollision(bird)) {
                console.log('Ceiling collision detected');
                return true;
            }

            // Check pipe collisions
            if (this.checkPipeCollisions(bird, pipes)) {
                console.log('Pipe collision detected');
                return true;
            }

            return false;
        }
        
        /**
         * Check if bird collides with the ground
         * @param {Object} bird - Bird object
         * @param {number} canvasHeight - Canvas height
         * @returns {boolean} True if collision detected
         */
        checkGroundCollision(bird, canvasHeight) {
            const birdBottom = bird.y + bird.height / 2;
            return birdBottom >= canvasHeight;
        }
        
        /**
         * Check if bird collides with the ceiling
         * @param {Object} bird - Bird object
         * @returns {boolean} True if collision detected
         */
        checkCeilingCollision(bird) {
            const birdTop = bird.y - bird.height / 2;
            return birdTop <= 0;
        }
        
        /**
         * Check if bird collides with any pipes
         * @param {Object} bird - Bird object
         * @param {Array} pipes - Array of pipe objects
         * @returns {boolean} True if collision detected
         */
        checkPipeCollisions(bird, pipes) {
            const birdBox = bird.getBoundingBox();
            
            for (let pipe of pipes) {
                if (this.checkRectangleCollision(birdBox, pipe)) {
                    return true;
                }
            }
            
            return false;
        }
        
        /**
         * Check collision between two rectangles
         * @param {Object} rect1 - First rectangle {x, y, width, height}
         * @param {Object} rect2 - Second rectangle {x, y, width, height}
         * @returns {boolean} True if rectangles overlap
         */
        checkRectangleCollision(rect1, rect2) {
            return (
                rect1.x < rect2.x + rect2.width &&
                rect1.x + rect1.width > rect2.x &&
                rect1.y < rect2.y + rect2.height &&
                rect1.y + rect1.height > rect2.y
            );
        }
        
        /**
         * Check collision between a circle and rectangle
         * @param {Object} circle - Circle {x, y, radius}
         * @param {Object} rect - Rectangle {x, y, width, height}
         * @returns {boolean} True if collision detected
         */
        checkCircleRectangleCollision(circle, rect) {
            // Find the closest point on the rectangle to the circle center
            const closestX = Math.max(rect.x, Math.min(circle.x, rect.x + rect.width));
            const closestY = Math.max(rect.y, Math.min(circle.y, rect.y + rect.height));
            
            
// Calculate distance between circle center and closest point
            const distanceX = circle.x - closestX;
            const distanceY = circle.y - closestY;
            const distanceSquared = distanceX * distanceX + distanceY * distanceY;
            
            return distanceSquared < (circle.radius * circle.radius);
        }
        
        /**
         * Handle boundary bouncing in silly bird mode
         * @param {Object} bird - Bird object
         * @param {number} canvasHeight - Canvas height
         */
        handleBoundaryBouncing(bird, canvasHeight) {
            const birdTop = bird.y - bird.height / 2;
            const birdBottom = bird.y + bird.height / 2;

            // Bounce off ceiling
            if (birdTop <= 0) {
                bird.y = bird.height / 2;
                bird.velocity = Math.abs(bird.velocity) * 0.3; // Reduce velocity and reverse direction
            }

            // Bounce off ground
            if (birdBottom >= canvasHeight) {
                bird.y = canvasHeight - bird.height / 2;
                bird.velocity = -Math.abs(bird.velocity) * 0.3; // Reduce velocity and reverse direction
            }
        }

        /**
         * Handle pipe bouncing in silly bird mode
         * @param {Object} bird - Bird object
         * @param {Array} pipes - Array of pipe objects
         */
        handlePipeBouncing(bird, pipes) {
            const birdBox = bird.getBoundingBox();

            for (let pipe of pipes) {
                if (this.checkRectangleCollision(birdBox, pipe)) {
                    // Calculate which side of the pipe the bird hit
                    const birdCenterX = bird.x;
                    const birdCenterY = bird.y;
                    const pipeCenterX = pipe.x + pipe.width / 2;
                    const pipeCenterY = pipe.y + pipe.height / 2;

                    // Determine collision direction
                    const deltaX = birdCenterX - pipeCenterX;
                    const deltaY = birdCenterY - pipeCenterY;

                    // Push bird away from pipe
                    if (Math.abs(deltaX) > Math.abs(deltaY)) {
                        // Horizontal collision
                        if (deltaX > 0) {
                            // Bird hit from right, push right
                            bird.x = pipe.x + pipe.width + bird.width / 2 + 5;
                        } else {
                            // Bird hit from left, push left
                            bird.x = pipe.x - bird.width / 2 - 5;
                        }
                        // Reduce horizontal velocity
                        bird.velocity *= 0.5;
                    } else {
                        // Vertical collision
                        if (deltaY > 0) {
                            // Bird hit from below, push down
                            bird.y = pipe.y + pipe.height + bird.height / 2 + 5;
                            bird.velocity = Math.abs(bird.velocity) * 0.3;
                        } else {
                            // Bird hit from above, push up
                            bird.y = pipe.y - bird.height / 2 - 5;
                            bird.velocity = -Math.abs(bird.velocity) * 0.3;
                        }
                    }

                    // Only handle one collision per frame
                    break;
                }
            }
        }

        /**
         * Get collision information for debugging
         * @param {Object} bird - Bird object
         * @param {Array} pipes - Array of pipe objects
         * @returns {Object} Collision debug information
         */
        getCollisionDebugInfo(bird, pipes) {
            const birdBox = bird.getBoundingBox();
            const collisionInfo = {
                birdBox: birdBox,
                collidingPipes: []
            };

            for (let pipe of pipes) {
                if (this.checkRectangleCollision(birdBox, pipe)) {
                    collisionInfo.collidingPipes.push(pipe);
                }
            }

            return collisionInfo;
        }
    }
    
    // Expose CollisionDetector class globally
    window.CollisionDetector = CollisionDetector;
    
})();

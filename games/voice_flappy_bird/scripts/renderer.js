// scripts/renderer.js
(function() {
    'use strict';
    
    /**
     * Renderer handles all drawing operations on the canvas
     */
    class Renderer {
        constructor(ctx, canvasWidth, canvasHeight) {
            this.ctx = ctx;
            this.canvasWidth = canvasWidth;
            this.canvasHeight = canvasHeight;
            
            // Background colors
            this.skyColor = '#70c5ce';
            this.groundColor = '#DED895';
            this.groundHeight = 50;
            
            console.log('Renderer created');
        }
        
        /**
         * Clear the entire canvas
         */
        clear() {
            this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        /**
         * Draw the background (sky and ground)
         */
        drawBackground() {
            // Draw sky
            this.ctx.fillStyle = this.skyColor;
            this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight - this.groundHeight);
            
            // Draw ground
            this.ctx.fillStyle = this.groundColor;
            this.ctx.fillRect(0, this.canvasHeight - this.groundHeight, this.canvasWidth, this.groundHeight);
            
            // Draw some simple clouds (optional decoration)
            this.drawClouds();
        }
        
        /**
         * Draw simple cloud decorations
         */
        drawClouds() {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            
            // Cloud 1
            this.drawCloud(100, 80, 40);
            
            // Cloud 2
            this.drawCloud(300, 120, 35);
            
            // Cloud 3
            this.drawCloud(200, 60, 30);
        }
        
        /**
         * Draw a single cloud
         * @param {number} x - X position
         * @param {number} y - Y position
         * @param {number} size - Cloud size
         */
        drawCloud(x, y, size) {
            this.ctx.beginPath();
            
            // Draw multiple overlapping circles to form a cloud
            this.ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
            this.ctx.arc(x + size * 0.4, y, size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(x - size * 0.4, y, size * 0.7, 0, Math.PI * 2);
            this.ctx.arc(x, y - size * 0.4, size * 0.6, 0, Math.PI * 2);
            
            this.ctx.fill();
        }
        
        /**
         * Draw the bird
         * @param {Object} bird - Bird object
         */
        drawBird(bird) {
            if (!bird) return;
            
            const renderData = bird.getRenderData();
            
            this.ctx.save();
            
            // Move to bird position and apply rotation
            this.ctx.translate(renderData.x, renderData.y);
            this.ctx.rotate(renderData.rotation);
            
            // Draw bird body (simple oval)
            this.ctx.fillStyle = renderData.color;
            this.ctx.beginPath();
            this.ctx.ellipse(0, 0, renderData.width / 2, renderData.height / 2, 0, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw bird outline
            this.ctx.strokeStyle = '#DAA520';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Draw bird eye
            this.ctx.fillStyle = 'white';
            this.ctx.beginPath();
            this.ctx.arc(5, -3, 4, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw bird pupil
            this.ctx.fillStyle = 'black';
            this.ctx.beginPath();
            this.ctx.arc(6, -3, 2, 0, Math.PI * 2);
            this.ctx.fill();
            
            // Draw bird beak
            this.ctx.fillStyle = '#FFA500';
            this.ctx.beginPath();
            this.ctx.moveTo(renderData.width / 2, 0);
            this.ctx.lineTo(renderData.width / 2 + 8, -2);
            this.ctx.lineTo(renderData.width / 2 + 8, 2);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
        
        /**
         * Draw all pipes
         * @param {Array} pipes - Array of pipe objects
         */
        drawPipes(pipes) {
            if (!pipes || pipes.length === 0) return;
            
            for (let pipe of pipes) {
                this.drawPipe(pipe);
            }
        }
        
        /**
         * Draw a single pipe
         * @param {Object} pipe - Pipe object
         */
        drawPipe(pipe) {
            // Draw pipe body
            this.ctx.fillStyle = '#228B22'; // Forest green
            this.ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
            
            // Draw pipe border
            this.ctx.strokeStyle = '#006400'; // Dark green
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
            
            // Draw pipe cap (decorative top/bottom)
            const capHeight = 20;
            const capWidth = pipe.width + 8;
            const capX = pipe.x - 4;
            
            if (pipe.type === 'upper') {
                // Cap at the bottom of upper pipe
                const capY = pipe.y + pipe.height - capHeight;
                this.ctx.fillStyle = '#32CD32'; // Lime green
                this.ctx.fillRect(capX, capY, capWidth, capHeight);
                this.ctx.strokeRect(capX, capY, capWidth, capHeight);
            } else if (pipe.type === 'lower') {
                // Cap at the top of lower pipe
                const capY = pipe.y;
                this.ctx.fillStyle = '#32CD32'; // Lime green
                this.ctx.fillRect(capX, capY, capWidth, capHeight);
                this.ctx.strokeRect(capX, capY, capWidth, capHeight);
            }
        }
        
        /**
         * Draw debug information (collision boxes, etc.)
         * @param {Object} bird - Bird object
         * @param {Array} pipes - Array of pipe objects
         */
        drawDebugInfo(bird, pipes) {
            this.ctx.strokeStyle = 'red';
            this.ctx.lineWidth = 1;
            
            // Draw bird bounding box
            if (bird) {
                const birdBox = bird.getBoundingBox();
                this.ctx.strokeRect(birdBox.x, birdBox.y, birdBox.width, birdBox.height);
            }
            
            // Draw pipe bounding boxes
            if (pipes) {
                for (let pipe of pipes) {
                    this.ctx.strokeRect(pipe.x, pipe.y, pipe.width, pipe.height);
                }
            }
        }
    }
    
    // Expose Renderer class globally
    window.Renderer = Renderer;
    
})();

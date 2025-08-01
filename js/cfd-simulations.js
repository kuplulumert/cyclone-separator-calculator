/**
 * CFD Academy - Advanced Simulation Engine
 * Interactive fluid dynamics simulations and visualizations
 */

class CFDSimulation {
    constructor(containerId, options = {}) {
        this.container = document.getElementById(containerId);
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.canvas = null;
        this.ctx = null;
        this.animationId = null;
        this.particles = [];
        this.isRunning = false;
        
        // Default simulation parameters
        this.params = {
            reynolds: 100,
            velocity: 5.0,
            viscosity: 0.01,
            density: 1.0,
            timeStep: 0.01,
            gridSize: 20,
            ...options
        };
        
        this.initCanvas();
    }
    
    initCanvas() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        this.canvas.style.position = 'absolute';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.ctx = this.canvas.getContext('2d');
        this.container.appendChild(this.canvas);
    }
    
    createParticles(count = 50) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: Math.random() * this.width * 0.1,
                y: Math.random() * this.height,
                vx: this.params.velocity,
                vy: 0,
                life: 1.0,
                size: Math.random() * 3 + 1
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach((particle, index) => {
            // Simple advection
            particle.x += particle.vx * this.params.timeStep * 100;
            particle.y += particle.vy * this.params.timeStep * 100;
            
            // Decrease life
            particle.life -= 0.005;
            
            // Reset particles that are off-screen or dead
            if (particle.x > this.width || particle.life <= 0) {
                particle.x = -10;
                particle.y = Math.random() * this.height;
                particle.life = 1.0;
                particle.vx = this.params.velocity + Math.random() * 2 - 1;
                particle.vy = Math.random() * 0.5 - 0.25;
            }
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.life;
            this.ctx.fillStyle = '#06b6d4';
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.createParticles();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    updateParameters(newParams) {
        Object.assign(this.params, newParams);
    }
}

class CylinderFlowSimulation extends CFDSimulation {
    constructor(containerId, options = {}) {
        super(containerId, options);
        this.cylinder = {
            x: this.width * 0.3,
            y: this.height * 0.5,
            radius: 40
        };
        this.vorticies = [];
    }
    
    createParticles(count = 100) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: -10,
                y: Math.random() * this.height,
                vx: this.params.velocity,
                vy: 0,
                life: 1.0,
                size: Math.random() * 2 + 1,
                trail: []
            });
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Store trail points
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 10) {
                particle.trail.shift();
            }
            
            // Calculate distance to cylinder
            const dx = particle.x - this.cylinder.x;
            const dy = particle.y - this.cylinder.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Flow around cylinder
            if (distance > this.cylinder.radius + 5) {
                // Free stream flow with slight perturbation
                const influence = Math.exp(-distance / 100);
                particle.vx = this.params.velocity * (1 + influence * 0.5);
                particle.vy += influence * Math.sin(particle.x * 0.01) * 0.1;
                
                // Bernoulli effect - speed up flow around cylinder
                if (Math.abs(dy) < this.cylinder.radius * 2 && dx > -50 && dx < 50) {
                    particle.vx *= 1.5;
                    particle.vy += dy > 0 ? 0.5 : -0.5;
                }
            } else if (distance <= this.cylinder.radius + 5) {
                // Collision with cylinder - deflect
                const angle = Math.atan2(dy, dx);
                particle.x = this.cylinder.x + Math.cos(angle) * (this.cylinder.radius + 5);
                particle.y = this.cylinder.y + Math.sin(angle) * (this.cylinder.radius + 5);
                
                // Tangential velocity
                particle.vx = -Math.sin(angle) * this.params.velocity;
                particle.vy = Math.cos(angle) * this.params.velocity;
                
                // Create vortex shedding for higher Reynolds numbers
                if (this.params.reynolds > 40 && Math.random() < 0.1) {
                    this.createVortex(particle.x, particle.y);
                }
            }
            
            // Update position
            particle.x += particle.vx * this.params.timeStep * 10;
            particle.y += particle.vy * this.params.timeStep * 10;
            
            // Decrease life
            particle.life -= 0.003;
            
            // Reset particles
            if (particle.x > this.width + 50 || particle.life <= 0) {
                particle.x = -10;
                particle.y = Math.random() * this.height;
                particle.life = 1.0;
                particle.vx = this.params.velocity;
                particle.vy = 0;
                particle.trail = [];
            }
        });
        
        // Update vortices
        this.updateVortices();
    }
    
    createVortex(x, y) {
        this.vorticies.push({
            x: x,
            y: y,
            strength: (Math.random() - 0.5) * 2,
            life: 1.0,
            age: 0
        });
    }
    
    updateVortices() {
        this.vorticies = this.vorticies.filter(vortex => {
            vortex.x += this.params.velocity * this.params.timeStep * 5;
            vortex.life -= 0.01;
            vortex.age += 0.1;
            return vortex.life > 0;
        });
    }
    
    drawCylinder() {
        this.ctx.fillStyle = '#374151';
        this.ctx.beginPath();
        this.ctx.arc(this.cylinder.x, this.cylinder.y, this.cylinder.radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Add surface detail
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
    }
    
    drawVortices() {
        this.vorticies.forEach(vortex => {
            this.ctx.save();
            this.ctx.globalAlpha = vortex.life;
            this.ctx.strokeStyle = vortex.strength > 0 ? '#ef4444' : '#3b82f6';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(vortex.x, vortex.y, 15 + vortex.age * 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.restore();
        });
    }
    
    drawPressureField() {
        const gradient = this.ctx.createRadialGradient(
            this.cylinder.x - 30, this.cylinder.y, 0,
            this.cylinder.x, this.cylinder.y, this.cylinder.radius * 3
        );
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.3)');  // High pressure (red)
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.2)'); // Medium pressure (blue)
        gradient.addColorStop(1, 'rgba(6, 182, 212, 0.1)');   // Low pressure (cyan)
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }
    
    drawParticles() {
        // Draw trails
        this.particles.forEach(particle => {
            if (particle.trail.length > 1) {
                this.ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                for (let i = 1; i < particle.trail.length; i++) {
                    this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
                }
                this.ctx.stroke();
            }
        });
        
        // Draw particles
        super.drawParticles();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw pressure field
        this.drawPressureField();
        
        // Draw cylinder
        this.drawCylinder();
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        // Draw vortices
        this.drawVortices();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

class PipeFlowSimulation extends CFDSimulation {
    constructor(containerId, options = {}) {
        super(containerId, options);
        this.pipe = {
            y: this.height * 0.3,
            height: this.height * 0.4,
            width: this.width
        };
    }
    
    createParticles(count = 80) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            const y = this.pipe.y + Math.random() * this.pipe.height;
            this.particles.push({
                x: 0,
                y: y,
                vx: this.calculateVelocityProfile(y),
                vy: 0,
                life: 1.0,
                size: Math.random() * 2 + 1
            });
        }
    }
    
    calculateVelocityProfile(y) {
        // Parabolic velocity profile for laminar flow
        const centerY = this.pipe.y + this.pipe.height / 2;
        const r = Math.abs(y - centerY) / (this.pipe.height / 2);
        const maxVel = this.params.velocity * 2; // Max velocity at center
        
        if (this.params.reynolds < 2300) {
            // Laminar flow - parabolic profile
            return maxVel * (1 - r * r);
        } else {
            // Turbulent flow - power law profile
            return maxVel * Math.pow(1 - r, 1/7);
        }
    }
    
    updateParticles() {
        this.particles.forEach(particle => {
            // Update velocity based on position
            particle.vx = this.calculateVelocityProfile(particle.y);
            
            // Add turbulent fluctuations for high Reynolds numbers
            if (this.params.reynolds > 2300) {
                particle.vy += (Math.random() - 0.5) * 0.5;
                particle.vx += (Math.random() - 0.5) * 0.2;
            }
            
            // Update position
            particle.x += particle.vx * this.params.timeStep * 10;
            particle.y += particle.vy * this.params.timeStep * 10;
            
            // Keep particles within pipe bounds
            if (particle.y < this.pipe.y) {
                particle.y = this.pipe.y;
                particle.vy = 0;
            }
            if (particle.y > this.pipe.y + this.pipe.height) {
                particle.y = this.pipe.y + this.pipe.height;
                particle.vy = 0;
            }
            
            // Reset particles
            if (particle.x > this.width) {
                particle.x = 0;
                particle.y = this.pipe.y + Math.random() * this.pipe.height;
                particle.vy = 0;
            }
        });
    }
    
    drawPipe() {
        // Pipe walls
        this.ctx.fillStyle = '#374151';
        this.ctx.fillRect(0, this.pipe.y - 5, this.width, 5);
        this.ctx.fillRect(0, this.pipe.y + this.pipe.height, this.width, 5);
        
        // Velocity profile visualization
        const gradient = this.ctx.createLinearGradient(0, this.pipe.y, 0, this.pipe.y + this.pipe.height);
        gradient.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
        gradient.addColorStop(0.5, 'rgba(59, 130, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(239, 68, 68, 0.1)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, this.pipe.y, this.width, this.pipe.height);
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw pipe
        this.drawPipe();
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
}

class AirfoilSimulation extends CFDSimulation {
    constructor(containerId, options = {}) {
        super(containerId, options);
        this.airfoil = {
            x: this.width * 0.3,
            y: this.height * 0.5,
            chord: 120,
            thickness: 0.12,
            camber: 0.02,
            angleOfAttack: 5 * Math.PI / 180
        };
    }
    
    generateAirfoilPoints() {
        const points = [];
        const n = 50;
        
        for (let i = 0; i <= n; i++) {
            const x = i / n;
            
            // NACA 4-digit airfoil approximation
            const yt = 5 * this.airfoil.thickness * (
                0.2969 * Math.sqrt(x) -
                0.1260 * x -
                0.3516 * x * x +
                0.2843 * x * x * x -
                0.1015 * x * x * x * x
            );
            
            const yc = this.airfoil.camber * (2 * x - x * x);
            
            points.push({
                upper: { x: x * this.airfoil.chord, y: yc + yt },
                lower: { x: x * this.airfoil.chord, y: yc - yt }
            });
        }
        
        return points;
    }
    
    createParticles(count = 120) {
        this.particles = [];
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: -20,
                y: Math.random() * this.height,
                vx: this.params.velocity,
                vy: 0,
                life: 1.0,
                size: Math.random() * 2 + 1,
                trail: []
            });
        }
    }
    
    updateParticles() {
        const airfoilPoints = this.generateAirfoilPoints();
        
        this.particles.forEach(particle => {
            // Store trail
            particle.trail.push({ x: particle.x, y: particle.y });
            if (particle.trail.length > 15) {
                particle.trail.shift();
            }
            
            // Calculate influence of airfoil
            const relX = particle.x - this.airfoil.x;
            const relY = particle.y - this.airfoil.y;
            
            // Rotate coordinates by angle of attack
            const cosA = Math.cos(-this.airfoil.angleOfAttack);
            const sinA = Math.sin(-this.airfoil.angleOfAttack);
            const rotX = relX * cosA - relY * sinA;
            const rotY = relX * sinA + relY * cosA;
            
            // Check if particle is near airfoil
            if (rotX >= 0 && rotX <= this.airfoil.chord && Math.abs(rotY) < 50) {
                const normalizedX = rotX / this.airfoil.chord;
                
                // Find airfoil surface at this x position
                const pointIndex = Math.floor(normalizedX * (airfoilPoints.length - 1));
                if (pointIndex < airfoilPoints.length) {
                    const point = airfoilPoints[pointIndex];
                    
                    if (rotY > 0) {
                        // Upper surface - accelerate flow
                        particle.vx = this.params.velocity * 1.4;
                        particle.vy -= 0.3;
                        
                        // Deflect around upper surface
                        if (rotY < point.upper.y + 5) {
                            particle.vy = -Math.abs(particle.vy) - 0.5;
                        }
                    } else {
                        // Lower surface - decelerate flow
                        particle.vx = this.params.velocity * 0.8;
                        particle.vy += 0.2;
                        
                        // Deflect around lower surface
                        if (rotY > point.lower.y - 5) {
                            particle.vy = Math.abs(particle.vy) + 0.3;
                        }
                    }
                }
            } else {
                // Free stream flow
                particle.vx = this.params.velocity;
                particle.vy *= 0.95; // Damping
            }
            
            // Update position
            particle.x += particle.vx * this.params.timeStep * 8;
            particle.y += particle.vy * this.params.timeStep * 8;
            
            // Decrease life
            particle.life -= 0.002;
            
            // Reset particles
            if (particle.x > this.width + 50 || particle.life <= 0) {
                particle.x = -20;
                particle.y = Math.random() * this.height;
                particle.life = 1.0;
                particle.vx = this.params.velocity;
                particle.vy = 0;
                particle.trail = [];
            }
        });
    }
    
    drawAirfoil() {
        const points = this.generateAirfoilPoints();
        
        this.ctx.save();
        this.ctx.translate(this.airfoil.x, this.airfoil.y);
        this.ctx.rotate(this.airfoil.angleOfAttack);
        
        // Draw airfoil shape
        this.ctx.fillStyle = '#374151';
        this.ctx.strokeStyle = '#1f2937';
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].upper.x, points[0].upper.y);
        
        // Upper surface
        points.forEach(point => {
            this.ctx.lineTo(point.upper.x, point.upper.y);
        });
        
        // Lower surface (reverse order)
        for (let i = points.length - 1; i >= 0; i--) {
            this.ctx.lineTo(points[i].lower.x, points[i].lower.y);
        }
        
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawParticles() {
        // Draw trails with color coding for velocity
        this.particles.forEach(particle => {
            if (particle.trail.length > 1) {
                const velocityMag = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
                const normalizedVel = Math.min(velocityMag / (this.params.velocity * 2), 1);
                
                this.ctx.strokeStyle = `rgba(${255 * normalizedVel}, ${100}, ${255 * (1 - normalizedVel)}, 0.4)`;
                this.ctx.lineWidth = 1;
                this.ctx.beginPath();
                this.ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
                for (let i = 1; i < particle.trail.length; i++) {
                    this.ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
                }
                this.ctx.stroke();
            }
        });
        
        // Draw particles
        super.drawParticles();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // Draw airfoil
        this.drawAirfoil();
        
        // Update and draw particles
        this.updateParticles();
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    setAngleOfAttack(degrees) {
        this.airfoil.angleOfAttack = degrees * Math.PI / 180;
    }
}

// Export classes for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CFDSimulation,
        CylinderFlowSimulation,
        PipeFlowSimulation,
        AirfoilSimulation
    };
}
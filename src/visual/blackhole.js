/**
 * BlackHole visualization effect for HandSynth
 * Provides responsive visualization for musical input
 */

import { state } from '../config.js';

// Global reference to black hole instance
let blackHole;

/**
 * Initialize black hole animation
 */
// Update src/visual/blackhole.js - modify the initBlackHole function:
export function initBlackHole() {
  // Get or create container
  let container = document.getElementById('container');
  
  // Create container if it doesn't exist
  if (!container) {
    container = document.createElement('div');
    container.id = 'container';
    document.body.appendChild(container);
  }
  
  // Create a-hole container
  const aHoleElement = document.createElement('a-hole');
  container.appendChild(aHoleElement);
  
  // Initialize black hole
  blackHole = new BlackHole(aHoleElement);
  
  return blackHole;
}
/**
 * Pulse the black hole in response to musical events
 * @param {number} intensity - Pulse intensity (0.0 to 1.0)
 */
export function pulseBlackHole(intensity = 1.0) {
  if (blackHole) {
    blackHole.pulse(intensity);
  }
}

/**
 * BlackHole class - visualization with reactive properties
 */
class BlackHole {
  constructor(container) {
    this.container = container;
    this.canvas = document.createElement('canvas');
    this.canvas.className = 'js-canvas';
    this.container.appendChild(this.canvas);
    
    // Create aura and overlay
    this.aura = document.createElement('div');
    this.aura.className = 'aura';
    this.container.appendChild(this.aura);
    
    this.overlay = document.createElement('div');
    this.overlay.className = 'overlay';
    this.container.appendChild(this.overlay);
    
    // Initialize black hole animation
    this.ctx = this.canvas.getContext("2d");
    
    this.discs = [];
    this.lines = [];
    this.particles = [];
    
    // Add styles
    this.addStyles();
    
    // Init
    this.setSize();
    this.setDiscs();
    this.setLines();
    this.setParticles();
    
    // Reactive properties for music visualization
    this.reactiveScale = 1.0;
    this.pulseIntensity = 0;
    this.noteChangeTime = 0;
    this.chordChangeTime = 0;
    
    // Start animation loop
    requestAnimationFrame(this.tick.bind(this));
    
    // Bind events
    window.addEventListener("resize", this.onResize.bind(this));
  }
  
  // Add required styles for black hole animation
  addStyles() {
    // Check if styles already exist
    if (document.getElementById('blackhole-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'blackhole-styles';
    style.textContent = `
      a-hole {
        position: absolute;
        top: 0;
        left: 0;
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow: hidden;
        z-index: 1;
      }
      
      a-hole:before {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 2;
        display: block;
        width: 150%;
        height: 140%;
        background: radial-gradient(ellipse at 50% 55%, transparent 10%, black 50%);
        transform: translate3d(-50%, -50%, 0);
        content: "";
      }
      
      a-hole:after {
        position: absolute;
        top: 50%;
        left: 50%;
        z-index: 5;
        display: block;
        width: 100%;
        height: 100%;
        background: radial-gradient(
          ellipse at 50% 75%,
          #a900ff 20%,
          transparent 75%
        );
        mix-blend-mode: overlay;
        transform: translate3d(-50%, -50%, 0);
        content: "";
      }
      
      @keyframes aura-glow {
        0% {
          background-position: 0 100%;
        }
        100% {
          background-position: 0 300%;
        }
      }
      
      a-hole .aura {
        position: absolute;
        top: -71.5%;
        left: 50%;
        z-index: 3;
        width: 30%;
        height: 140%;
        background: linear-gradient(
            20deg,
            #00f8f1,
            #ffbd1e20 16.5%,
            #fe848f 33%,
            #fe848f20 49.5%,
            #00f8f1 66%,
            #00f8f160 85.5%,
            #ffbd1e 100%
          )
          0 100% / 100% 200%;
        border-radius: 0 0 100% 100%;
        filter: blur(50px);
        mix-blend-mode: plus-lighter;
        opacity: 0.75;
        transform: translate3d(-50%, 0, 0);
        animation: aura-glow 5s infinite linear;
      }
      
      a-hole .overlay {
        position: absolute;
        top: 0;
        left: 0;
        z-index: 10;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
          transparent,
          transparent 1px,
          rgba(255, 255, 255, 0.1) 1px,
          rgba(255, 255, 255, 0.1) 2px
        );
        mix-blend-mode: overlay;
        opacity: 0.5;
      }
      
      a-hole canvas {
        display: block;
        width: 100%;
        height: 100%;
        z-index: 4;
      }
    `;
    document.head.appendChild(style);
  }
  
  /**
   * Resize handler
   */
  onResize() {
    this.setSize();
    this.setDiscs();
    this.setLines();
    this.setParticles();
  }

  /**
   * Set size
   */
  setSize() {
    this.rect = this.container.getBoundingClientRect();

    this.render = {
      width: this.rect.width,
      height: this.rect.height,
      dpi: window.devicePixelRatio
    };

    this.canvas.width = this.render.width * this.render.dpi;
    this.canvas.height = this.render.height * this.render.dpi;
  }

  /**
   * Set discs
   */
  setDiscs() {
    const { width, height } = this.rect;

    this.discs = [];

    this.startDisc = {
      x: width * 0.5,
      y: height * 0.45,
      w: width * 0.75,
      h: height * 0.7
    };

    this.endDisc = {
      x: width * 0.5,
      y: height * 0.95,
      w: 0,
      h: 0
    };

    const totalDiscs = 100;

    let prevBottom = height;
    this.clip = {};

    for (let i = 0; i < totalDiscs; i++) {
      const p = i / totalDiscs;

      const disc = this.tweenDisc({
        p
      });

      const bottom = disc.y + disc.h;

      if (bottom <= prevBottom) {
        this.clip = {
          disc: { ...disc },
          i
        };
      }

      prevBottom = bottom;

      this.discs.push(disc);
    }

    this.clip.path = new Path2D();
    this.clip.path.ellipse(
      this.clip.disc.x,
      this.clip.disc.y,
      this.clip.disc.w,
      this.clip.disc.h,
      0,
      0,
      Math.PI * 2
    );
    this.clip.path.rect(
      this.clip.disc.x - this.clip.disc.w,
      0,
      this.clip.disc.w * 2,
      this.clip.disc.y
    );
  }

  /**
   * Set lines
   */
  setLines() {
    const { width, height } = this.rect;

    this.lines = [];

    const totalLines = 100;
    const linesAngle = (Math.PI * 2) / totalLines;

    for (let i = 0; i < totalLines; i++) {
      this.lines.push([]);
    }

    this.discs.forEach((disc) => {
      for (let i = 0; i < totalLines; i++) {
        const angle = i * linesAngle;

        const p = {
          x: disc.x + Math.cos(angle) * disc.w,
          y: disc.y + Math.sin(angle) * disc.h
        };

        this.lines[i].push(p);
      }
    });

    this.linesCanvas = new OffscreenCanvas(width, height);
    const ctx = this.linesCanvas.getContext("2d");

    this.lines.forEach((line, i) => {
      ctx.save();

      let lineIsIn = false;
      line.forEach((p1, j) => {
        if (j === 0) {
          return;
        }

        const p0 = line[j - 1];

        if (
          !lineIsIn &&
          (ctx.isPointInPath(this.clip.path, p1.x, p1.y) ||
            ctx.isPointInStroke(this.clip.path, p1.x, p1.y))
        ) {
          lineIsIn = true;
        } else if (lineIsIn) {
          ctx.clip(this.clip.path);
        }

        ctx.beginPath();

        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);

        ctx.strokeStyle = "#444";
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.closePath();
      });

      ctx.restore();
    });

    this.linesCtx = ctx;
  }

  /**
   * Set particles
   */
  setParticles() {
    const { width, height } = this.rect;

    this.particles = [];

    this.particleArea = {
      sw: this.clip.disc.w * 0.5,
      ew: this.clip.disc.w * 2,
      h: height * 0.85
    };
    this.particleArea.sx = (width - this.particleArea.sw) / 2;
    this.particleArea.ex = (width - this.particleArea.ew) / 2;

    const totalParticles = 100;

    for (let i = 0; i < totalParticles; i++) {
      const particle = this.initParticle(true);

      this.particles.push(particle);
    }
  }

  /**
   * Init particle
   */
  initParticle(start = false) {
    const sx = this.particleArea.sx + this.particleArea.sw * Math.random();
    const ex = this.particleArea.ex + this.particleArea.ew * Math.random();
    const dx = ex - sx;
    const vx = 0.1 + Math.random() * 0.5;
    const y = start ? this.particleArea.h * Math.random() : this.particleArea.h;
    const r = 0.5 + Math.random() * 7;
    const vy = 0.5 + Math.random();

    return {
      x: sx,
      sx,
      dx,
      y,
      vy,
      
      p: vx * Math.random(),
      r,
      c: `rgba(255, 255, 255, ${Math.random()})`
    };
  }

  /**
   * Tween value
   */
  tweenValue(start, end, p, ease = false) {
    const delta = end - start;
    
    let easedP = p;
    if (ease === "inExpo") {
      easedP = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
    }

    return start + delta * easedP;
  }

  /**
   * Draw discs
   */
  drawDiscs() {
    const { ctx } = this;

    ctx.strokeStyle = "#444";
    ctx.lineWidth = 2;

    // Apply reactive scaling based on music
    const pulseFactor = 1 + this.pulseIntensity * 0.2;
    
    // Outer disc
    const outerDisc = {
      x: this.startDisc.x,
      y: this.startDisc.y,
      w: this.startDisc.w * pulseFactor * this.reactiveScale,
      h: this.startDisc.h * pulseFactor * this.reactiveScale
    };

    ctx.beginPath();
    ctx.ellipse(
      outerDisc.x,
      outerDisc.y,
      outerDisc.w,
      outerDisc.h,
      0,
      0,
      Math.PI * 2
    );
    ctx.stroke();
    ctx.closePath();

    // Discs
    this.discs.forEach((disc, i) => {
      if (i % 5 !== 0) {
        return;
      }

      const scaledDisc = {
        x: disc.x,
        y: disc.y,
        w: disc.w * pulseFactor,
        h: disc.h * pulseFactor
      };

      if (scaledDisc.w < this.clip.disc.w - 5) {
        ctx.save();
        ctx.clip(this.clip.path);
      }

      ctx.beginPath();
      ctx.ellipse(scaledDisc.x, scaledDisc.y, scaledDisc.w, scaledDisc.h, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.closePath();

      if (scaledDisc.w < this.clip.disc.w - 5) {
        ctx.restore();
      }
    });
  }

  /**
   * Draw lines
   */
  drawLines() {
    const { ctx, linesCanvas } = this;

    ctx.drawImage(linesCanvas, 0, 0);
  }

  /**
   * Draw particles
   */
  drawParticles() {
    const { ctx } = this;

    ctx.save();

    ctx.clip(this.clip.path);

    this.particles.forEach((particle) => {
      // Make particles reactive to music
      const scaleFactor = 1 + this.pulseIntensity * 2.5;
      
      ctx.fillStyle = particle.c;
      ctx.beginPath();
      ctx.rect(particle.x, particle.y, particle.r * scaleFactor, particle.r * scaleFactor);
      ctx.closePath();

      ctx.fill();
    });

    ctx.restore();
  }

  /**
   * Move discs
   */
  moveDiscs() {
    this.discs.forEach((disc) => {
      disc.p = (disc.p + 0.001) % 1;

      this.tweenDisc(disc);
    });
  }

  /**
   * Move Particles
   */
  moveParticles() {
    this.particles.forEach((particle) => {
      // Make particle speed reactive to music
      const speedFactor = 1 + this.pulseIntensity * 3;
      
      particle.p = 1 - particle.y / this.particleArea.h;
      particle.x = particle.sx + particle.dx * particle.p;
      particle.y -= particle.vy * speedFactor;

      if (particle.y < 0) {
        particle.y = this.initParticle().y;
      }
    });
  }

  /**
   * Tween disc
   */
  tweenDisc(disc) {
    disc.x = this.tweenValue(this.startDisc.x, this.endDisc.x, disc.p);
    disc.y = this.tweenValue(
      this.startDisc.y,
      this.endDisc.y,
      disc.p,
      "inExpo"
    );

    disc.w = this.tweenValue(this.startDisc.w, this.endDisc.w, disc.p);
    disc.h = this.tweenValue(this.startDisc.h, this.endDisc.h, disc.p);

    return disc;
  }

  /**
   * Tick - animation frame
   */
  tick(time) {
    const { ctx } = this;

    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.save();
    ctx.scale(this.render.dpi, this.render.dpi);

    // Update pulse intensity (decay over time)
    this.pulseIntensity *= 0.95;
    
    // Manage reactive scale
    if (state.leftHandIsPlaying || state.rightHandIsPlaying) {
      this.reactiveScale = this.lerp(this.reactiveScale, 1.2, 0.05);
    } else {
      this.reactiveScale = this.lerp(this.reactiveScale, 1.0, 0.05);
    }

    this.moveDiscs();
    this.moveParticles();

    this.drawDiscs();
    this.drawLines();
    this.drawParticles();

    ctx.restore();

    requestAnimationFrame(this.tick.bind(this));
  }
  
  /**
   * Make the hole pulse in response to music
   * @param {number} intensity - Pulse intensity (0.0-1.0)
   */
  pulse(intensity = 1.0) {
    this.pulseIntensity = intensity;
  }
  
  /**
   * Linear interpolation helper
   */
  lerp(start, end, t) {
    return start * (1 - t) + end * t;
  }
}

export default {
  initBlackHole,
  pulseBlackHole,
  BlackHole
};
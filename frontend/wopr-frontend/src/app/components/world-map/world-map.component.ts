import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MissileAnimationService } from '../../services/missile-animation.service';
import { MissileAnimationState, MissileTrajectory, MissileImpact } from '../../models/missile.models';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-map-container" [class.blinking]="isBlinking">
      <div class="map-header">GLOBAL THREAT MATRIX</div>
      <div class="world-map-display">
        <img 
          #worldImage
          src="assets/images/world.png" 
          alt="World Map" 
          class="world-map-image"
          (load)="onImageLoad()"
        />
        <canvas 
          #overlayCanvas 
          class="world-map-overlay"
          [width]="canvasWidth" 
          [height]="canvasHeight">
        </canvas>
      </div>
      <div class="map-overlay" *ngIf="showOverlay">
        <div class="threat-indicator" 
             *ngFor="let threat of threats"
             [style.left.px]="threat.x"
             [style.top.px]="threat.y"
             [class.pulsing]="threat.active">
          {{threat.label}}
        </div>
      </div>
    </div>
  `,
  styleUrl: './world-map.component.scss'
})
export class WorldMapComponent implements OnInit, OnDestroy {
  @ViewChild('overlayCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('worldImage', { static: false }) imageRef!: ElementRef<HTMLImageElement>;
  
  @Input() showOverlay = false;
  @Input() threats: any[] = [];
  
  private ctx!: CanvasRenderingContext2D;
  canvasWidth = 1200;  // Made public for template binding
  canvasHeight = 600;  // Made public for template binding
  private scanLine = 0;
  private scanDirection = 1;
  private animationId?: number;
  isBlinking = false;

  // Missile animation properties
  private missileAnimationState: MissileAnimationState | null = null;
  private missileImpacts: MissileImpact[] = [];

  constructor(private missileAnimationService: MissileAnimationService) {}

  ngOnInit() {
    this.startBlinking();
    
    // Subscribe to missile animation updates
    this.missileAnimationService.animation$.subscribe(state => {
      this.missileAnimationState = state;
    });

    this.missileAnimationService.impacts$.subscribe(impacts => {
      this.missileImpacts = impacts;
    });
  }

  ngOnDestroy() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }

  onImageLoad() {
    // Initialize canvas overlay for scan lines and grid effects
    if (this.canvasRef) {
      const canvas = this.canvasRef.nativeElement;
      this.ctx = canvas.getContext('2d')!;
      this.setupCanvasOverlay();
      this.startScanLineAnimation();
    }
  }

  private setupCanvasOverlay() {
    if (!this.ctx) return;

    // Set canvas to match image dimensions
    const image = this.imageRef.nativeElement;
    this.canvasWidth = image.naturalWidth || 1200;
    this.canvasHeight = image.naturalHeight || 600;
    
    // Update canvas size
    const canvas = this.canvasRef.nativeElement;
    canvas.width = this.canvasWidth;
    canvas.height = this.canvasHeight;
    
    this.drawGridOverlay();
  }

  private drawGridOverlay() {
    if (!this.ctx) return;

    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Fine grid for authentic computer graphics look
    this.ctx.strokeStyle = '#003300';
    this.ctx.lineWidth = 0.3;
    this.ctx.globalAlpha = 0.15;

    // Vertical grid lines
    for (let x = 0; x < this.canvasWidth; x += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y < this.canvasHeight; y += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    // Major coordinate grid
    this.ctx.strokeStyle = '#006600';
    this.ctx.lineWidth = 0.8;
    this.ctx.globalAlpha = 0.4;
    
    // Major longitude lines (every 60 pixels ≈ 30 degrees)
    for (let x = 0; x < this.canvasWidth; x += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }
    
    // Major latitude lines (every 60 pixels ≈ 30 degrees)
    for (let y = 0; y < this.canvasHeight; y += 100) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    // Equator and Prime Meridian highlighting
    this.ctx.strokeStyle = '#00aa00';
    this.ctx.lineWidth = 1.2;
    this.ctx.globalAlpha = 0.7;
    
    // Equator (middle horizontal)
    const equatorY = this.canvasHeight / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(0, equatorY);
    this.ctx.lineTo(this.canvasWidth, equatorY);
    this.ctx.stroke();
    
    // Prime Meridian (middle vertical)
    const primeX = this.canvasWidth / 2;
    this.ctx.beginPath();
    this.ctx.moveTo(primeX, 0);
    this.ctx.lineTo(primeX, this.canvasHeight);
    this.ctx.stroke();

    this.ctx.globalAlpha = 1.0;
  }

  private startScanLineAnimation() {
    const animate = () => {
      this.drawScanLine();
      this.scanLine += this.scanDirection * 3;
      
      if (this.scanLine >= this.canvasHeight) {
        this.scanLine = 0;
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    animate();
  }

  private drawScanLine() {
    if (!this.ctx) return;

    // Redraw grid overlay
    this.drawGridOverlay();
    
    // Draw missile trajectories and missiles
    this.drawMissileAnimation();
    
    // Draw moving scan line
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.8;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.shadowBlur = 10;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.scanLine);
    this.ctx.lineTo(this.canvasWidth, this.scanLine);
    this.ctx.stroke();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1.0;
  }

  private startBlinking() {
    setInterval(() => {
      this.isBlinking = !this.isBlinking;
    }, 1000);
  }

  private drawMissileAnimation() {
    if (!this.ctx || !this.missileAnimationState || !this.missileAnimationState.isRunning) {
      return;
    }

    // Draw missile trajectories
    this.missileAnimationState.missiles.forEach(missile => {
      this.drawMissileTrajectory(missile);
    });

    // Draw active missiles
    this.missileAnimationState.missiles.forEach(missile => {
      if (missile.isActive && missile.currentPointIndex < missile.points.length) {
        this.drawMissile(missile);
      }
    });

    // Draw launch sites
    this.drawLaunchSites();

    // Draw impacts
    this.drawImpacts();
  }

  private drawMissileTrajectory(missile: MissileTrajectory) {
    if (!this.ctx || missile.points.length < 2) return;

    this.ctx.strokeStyle = missile.color;
    this.ctx.lineWidth = 1;
    this.ctx.globalAlpha = 0.3;
    this.ctx.setLineDash([2, 2]);

    this.ctx.beginPath();
    
    // Draw trajectory up to current position
    const endIndex = Math.min(missile.currentPointIndex + 1, missile.points.length);
    for (let i = 0; i < endIndex; i++) {
      const point = missile.points[i];
      if (i === 0) {
        this.ctx.moveTo(point.x, point.y);
      } else {
        this.ctx.lineTo(point.x, point.y);
      }
    }
    
    this.ctx.stroke();
    this.ctx.setLineDash([]);
    this.ctx.globalAlpha = 1.0;
  }

  private drawMissile(missile: MissileTrajectory) {
    if (!this.ctx || missile.currentPointIndex >= missile.points.length) return;

    const currentPoint = missile.points[missile.currentPointIndex];
    
    // Draw missile as a bright glowing dot
    this.ctx.fillStyle = missile.color;
    this.ctx.shadowColor = missile.color;
    this.ctx.shadowBlur = 8;
    this.ctx.globalAlpha = 1.0;

    this.ctx.beginPath();
    this.ctx.arc(currentPoint.x, currentPoint.y, 3, 0, 2 * Math.PI);
    this.ctx.fill();

    // Draw trailing effect
    for (let i = 1; i <= 3 && missile.currentPointIndex - i >= 0; i++) {
      const trailPoint = missile.points[missile.currentPointIndex - i];
      this.ctx.globalAlpha = 1.0 - (i * 0.3);
      this.ctx.beginPath();
      this.ctx.arc(trailPoint.x, trailPoint.y, 3 - i, 0, 2 * Math.PI);
      this.ctx.fill();
    }

    this.ctx.shadowBlur = 0;
    this.ctx.globalAlpha = 1.0;
  }

  private drawLaunchSites() {
    if (!this.ctx || !this.missileAnimationState) return;

    // Draw Russian launch sites
    this.ctx.fillStyle = '#ff4444';
    this.ctx.shadowColor = '#ff4444';
    this.ctx.shadowBlur = 5;
    
    // Simple representation - just show if missiles have been launched
    if (this.missileAnimationState.russianMissilesLaunched > 0) {
      // Draw a few key Russian positions
      const russianSites = [
        { x: 680, y: 120 }, // Plesetsk
        { x: 720, y: 200 }, // Kapustin Yar
        { x: 760, y: 220 }  // Baikonur
      ];

      russianSites.forEach(site => {
        this.ctx.beginPath();
        this.ctx.arc(site.x, site.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
      });
    }

    // Draw USA launch sites
    this.ctx.fillStyle = '#4444ff';
    this.ctx.shadowColor = '#4444ff';
    
    if (this.missileAnimationState.usaMissilesLaunched > 0) {
      const usaSites = [
        { x: 120, y: 240 }, // Vandenberg
        { x: 300, y: 280 }, // Kennedy
        { x: 200, y: 180 }  // Minot
      ];

      usaSites.forEach(site => {
        this.ctx.beginPath();
        this.ctx.arc(site.x, site.y, 4, 0, 2 * Math.PI);
        this.ctx.fill();
      });
    }

    this.ctx.shadowBlur = 0;
  }

  private drawImpacts() {
    if (!this.ctx || this.missileImpacts.length === 0) return;

    const now = Date.now();
    
    this.missileImpacts.forEach(impact => {
      const elapsed = now - impact.timestamp;
      const maxDuration = 3000; // Impact effect lasts 3 seconds
      
      if (elapsed < maxDuration) {
        const progress = elapsed / maxDuration;
        const radius = 5 + (progress * 15); // Expanding circle
        const alpha = 1.0 - progress; // Fading effect

        // Draw nuclear explosion effect
        this.ctx.fillStyle = '#ffff00';
        this.ctx.shadowColor = '#ffff00';
        this.ctx.shadowBlur = 15;
        this.ctx.globalAlpha = alpha;

        this.ctx.beginPath();
        this.ctx.arc(impact.x, impact.y, radius, 0, 2 * Math.PI);
        this.ctx.fill();

        // Inner core
        this.ctx.fillStyle = '#ffffff';
        this.ctx.globalAlpha = alpha * 0.8;
        this.ctx.beginPath();
        this.ctx.arc(impact.x, impact.y, radius * 0.5, 0, 2 * Math.PI);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1.0;
      }
    });
  }
}
import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

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

  ngOnInit() {
    this.startBlinking();
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
}
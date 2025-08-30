import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-world-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="world-map-container" [class.blinking]="isBlinking">
      <canvas #worldCanvas 
              [width]="canvasWidth" 
              [height]="canvasHeight"
              class="world-map-canvas">
      </canvas>
      <div class="map-overlay" *ngIf="showOverlay">
        <div class="threat-indicator" 
             *ngFor="let threat of threats"
             [style.left.px]="threat.x"
             [style.top.px]="threat.y"
             [class.pulsing]="threat.active">
          {{ threat.label }}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./world-map.component.scss']
})
export class WorldMapComponent implements OnInit, OnDestroy {
  @ViewChild('worldCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() width: number = 800;
  @Input() height: number = 400;
  @Input() showOverlay: boolean = false;
  @Input() isBlinking: boolean = false;

  canvasWidth: number = 800;
  canvasHeight: number = 400;
  
  private ctx!: CanvasRenderingContext2D;
  private animationFrame: number = 0;
  private scanLine: number = 0;
  private scanDirection: number = 1;
  
  threats: any[] = [
    { x: 150, y: 100, label: 'USSR', active: false },
    { x: 650, y: 150, label: 'USA', active: false },
    { x: 400, y: 120, label: 'EUROPE', active: false },
    { x: 550, y: 200, label: 'CHINA', active: false }
  ];

  ngOnInit() {
    this.canvasWidth = this.width;
    this.canvasHeight = this.height;
    
    setTimeout(() => {
      this.initializeCanvas();
      this.drawWorldMap();
      this.startScanLineAnimation();
    }, 100);
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }

  private initializeCanvas() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set up canvas for crisp pixel art
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);
  }

  private drawWorldMap() {
    if (!this.ctx) return;

    // Clear canvas with black background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Set up green raster drawing
    this.ctx.fillStyle = '#00ff00';
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;

    // Draw simplified continents in raster style
    this.drawNorthAmerica();
    this.drawSouthAmerica();
    this.drawEurope();
    this.drawAfrica();
    this.drawAsia();
    this.drawAustralia();
    this.drawAntarctica();

    // Add grid lines for authentic computer look
    this.drawGrid();
  }

  private drawNorthAmerica() {
    // North America - More detailed raster outline
    this.ctx.fillStyle = '#00ff00';
    
    // Alaska
    this.ctx.fillRect(50, 90, 25, 30);
    this.ctx.fillRect(45, 85, 15, 10);
    
    // Western Canada and USA
    this.ctx.beginPath();
    this.ctx.moveTo(90, 80);
    this.ctx.lineTo(120, 75);
    this.ctx.lineTo(140, 70);
    this.ctx.lineTo(160, 75);
    this.ctx.lineTo(180, 80);
    this.ctx.lineTo(200, 85);
    this.ctx.lineTo(220, 90);
    this.ctx.lineTo(240, 95);
    this.ctx.lineTo(250, 100);
    this.ctx.lineTo(260, 110);
    this.ctx.lineTo(270, 120);
    this.ctx.lineTo(275, 135);
    this.ctx.lineTo(270, 150);
    this.ctx.lineTo(260, 165);
    this.ctx.lineTo(240, 175);
    this.ctx.lineTo(220, 180);
    this.ctx.lineTo(200, 175);
    this.ctx.lineTo(180, 170);
    this.ctx.lineTo(160, 165);
    this.ctx.lineTo(140, 160);
    this.ctx.lineTo(120, 155);
    this.ctx.lineTo(100, 150);
    this.ctx.lineTo(85, 140);
    this.ctx.lineTo(80, 125);
    this.ctx.lineTo(85, 110);
    this.ctx.lineTo(90, 95);
    this.ctx.closePath();
    this.ctx.fill();

    // Eastern USA coastline detail
    this.ctx.beginPath();
    this.ctx.moveTo(270, 120);
    this.ctx.lineTo(285, 125);
    this.ctx.lineTo(290, 135);
    this.ctx.lineTo(295, 145);
    this.ctx.lineTo(290, 155);
    this.ctx.lineTo(280, 165);
    this.ctx.lineTo(270, 150);
    this.ctx.closePath();
    this.ctx.fill();

    // Florida
    this.ctx.fillRect(285, 165, 15, 25);
    
    // Great Lakes region (simple representation)
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(230, 110, 8, 5);
    this.ctx.fillRect(240, 105, 12, 8);
    this.ctx.fillRect(255, 108, 6, 4);
    
    this.ctx.fillStyle = '#00ff00';
    
    // Mexico
    this.ctx.beginPath();
    this.ctx.moveTo(220, 180);
    this.ctx.lineTo(260, 185);
    this.ctx.lineTo(270, 195);
    this.ctx.lineTo(265, 210);
    this.ctx.lineTo(255, 220);
    this.ctx.lineTo(240, 215);
    this.ctx.lineTo(225, 205);
    this.ctx.lineTo(215, 190);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Greenland
    this.ctx.fillRect(290, 40, 35, 25);
    this.ctx.fillRect(295, 30, 25, 15);
  }

  private drawSouthAmerica() {
    // South America - More detailed shape
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    
    // Northern coast (Venezuela, Colombia)
    this.ctx.moveTo(260, 220);
    this.ctx.lineTo(290, 225);
    this.ctx.lineTo(310, 235);
    this.ctx.lineTo(315, 245);
    
    // Eastern coast (Brazil)
    this.ctx.lineTo(320, 260);
    this.ctx.lineTo(325, 280);
    this.ctx.lineTo(330, 300);
    this.ctx.lineTo(325, 320);
    this.ctx.lineTo(315, 340);
    
    // Southern tip (Argentina/Chile)
    this.ctx.lineTo(305, 355);
    this.ctx.lineTo(295, 360);
    this.ctx.lineTo(285, 355);
    this.ctx.lineTo(275, 345);
    this.ctx.lineTo(270, 330);
    
    // Western coast (Chile/Peru)
    this.ctx.lineTo(265, 315);
    this.ctx.lineTo(260, 295);
    this.ctx.lineTo(255, 275);
    this.ctx.lineTo(250, 255);
    this.ctx.lineTo(255, 235);
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Add some detail for major countries
    this.ctx.fillStyle = '#004400';
    this.ctx.fillRect(285, 250, 8, 15); // Approximate Amazon region
    this.ctx.fillStyle = '#00ff00';
  }

  private drawEurope() {
    // Europe - More detailed representation
    this.ctx.fillStyle = '#00ff00';
    
    // Scandinavia (Norway, Sweden, Finland)
    this.ctx.fillRect(420, 50, 15, 35);
    this.ctx.fillRect(435, 55, 10, 25);
    this.ctx.fillRect(445, 60, 12, 20);
    
    // British Isles
    this.ctx.fillRect(385, 85, 12, 25);
    this.ctx.fillRect(380, 90, 8, 15);
    
    // Western Europe (France, Germany, etc.)
    this.ctx.beginPath();
    this.ctx.moveTo(400, 90);
    this.ctx.lineTo(450, 85);
    this.ctx.lineTo(465, 95);
    this.ctx.lineTo(470, 110);
    this.ctx.lineTo(465, 125);
    this.ctx.lineTo(450, 130);
    this.ctx.lineTo(430, 125);
    this.ctx.lineTo(410, 120);
    this.ctx.lineTo(395, 110);
    this.ctx.lineTo(400, 95);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Mediterranean regions (Spain, Italy, Greece)
    this.ctx.fillRect(390, 130, 25, 8); // Spain
    this.ctx.fillRect(430, 125, 15, 20); // Italy
    this.ctx.fillRect(455, 135, 12, 10); // Greece/Balkans
    
    // Eastern Europe/Western Russia
    this.ctx.fillRect(470, 75, 35, 45);
  }

  private drawAfrica() {
    // Africa - More recognizable shape
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    
    // North Africa (Morocco to Egypt)
    this.ctx.moveTo(390, 140);
    this.ctx.lineTo(435, 135);
    this.ctx.lineTo(480, 140);
    this.ctx.lineTo(485, 150);
    
    // East coast (Red Sea, Horn of Africa)
    this.ctx.lineTo(490, 170);
    this.ctx.lineTo(495, 190);
    this.ctx.lineTo(485, 210);
    
    // East Africa continuing south
    this.ctx.lineTo(480, 230);
    this.ctx.lineTo(475, 250);
    this.ctx.lineTo(470, 270);
    
    // Southern Africa
    this.ctx.lineTo(460, 285);
    this.ctx.lineTo(445, 295);
    this.ctx.lineTo(430, 290);
    this.ctx.lineTo(415, 285);
    
    // West coast
    this.ctx.lineTo(400, 275);
    this.ctx.lineTo(390, 260);
    this.ctx.lineTo(385, 240);
    this.ctx.lineTo(380, 220);
    this.ctx.lineTo(375, 200);
    this.ctx.lineTo(380, 180);
    this.ctx.lineTo(385, 160);
    
    this.ctx.closePath();
    this.ctx.fill();
    
    // Madagascar
    this.ctx.fillRect(485, 270, 6, 20);
  }

  private drawAsia() {
    // Asia - Large detailed landmass
    this.ctx.fillStyle = '#00ff00';
    
    // Siberia and Northern Asia
    this.ctx.fillRect(505, 55, 120, 35);
    
    // Central Asia and Russia
    this.ctx.beginPath();
    this.ctx.moveTo(505, 90);
    this.ctx.lineTo(580, 85);
    this.ctx.lineTo(620, 90);
    this.ctx.lineTo(650, 95);
    this.ctx.lineTo(680, 105);
    this.ctx.lineTo(710, 115);
    this.ctx.lineTo(705, 135);
    this.ctx.lineTo(690, 150);
    this.ctx.lineTo(670, 160);
    this.ctx.lineTo(640, 165);
    this.ctx.lineTo(600, 170);
    this.ctx.lineTo(560, 165);
    this.ctx.lineTo(520, 155);
    this.ctx.lineTo(505, 140);
    this.ctx.closePath();
    this.ctx.fill();

    // China
    this.ctx.beginPath();
    this.ctx.moveTo(560, 165);
    this.ctx.lineTo(620, 160);
    this.ctx.lineTo(650, 170);
    this.ctx.lineTo(665, 185);
    this.ctx.lineTo(660, 200);
    this.ctx.lineTo(640, 210);
    this.ctx.lineTo(610, 205);
    this.ctx.lineTo(580, 200);
    this.ctx.lineTo(555, 185);
    this.ctx.closePath();
    this.ctx.fill();

    // India subcontinent
    this.ctx.beginPath();
    this.ctx.moveTo(525, 185);
    this.ctx.lineTo(555, 180);
    this.ctx.lineTo(565, 195);
    this.ctx.lineTo(570, 210);
    this.ctx.lineTo(560, 225);
    this.ctx.lineTo(545, 230);
    this.ctx.lineTo(530, 225);
    this.ctx.lineTo(520, 210);
    this.ctx.lineTo(525, 195);
    this.ctx.closePath();
    this.ctx.fill();

    // Southeast Asia
    this.ctx.fillRect(575, 215, 40, 15);
    this.ctx.fillRect(580, 230, 35, 10);
    
    // Japan
    this.ctx.fillRect(680, 130, 8, 30);
    this.ctx.fillRect(685, 125, 6, 8);
    
    // Korea
    this.ctx.fillRect(670, 140, 6, 15);
    
    // Indonesia (simplified)
    this.ctx.fillRect(580, 245, 50, 8);
    this.ctx.fillRect(590, 255, 25, 6);
  }

  private drawAustralia() {
    // Australia - More detailed shape
    this.ctx.fillStyle = '#00ff00';
    this.ctx.beginPath();
    
    // Main Australian continent
    this.ctx.moveTo(620, 280);
    this.ctx.lineTo(680, 275);
    this.ctx.lineTo(700, 285);
    this.ctx.lineTo(705, 300);
    this.ctx.lineTo(695, 315);
    this.ctx.lineTo(675, 320);
    this.ctx.lineTo(650, 315);
    this.ctx.lineTo(625, 310);
    this.ctx.lineTo(615, 295);
    this.ctx.closePath();
    this.ctx.fill();
    
    // Tasmania
    this.ctx.fillRect(660, 325, 8, 6);
    
    // New Zealand
    this.ctx.fillRect(720, 295, 4, 18);
    this.ctx.fillRect(725, 310, 3, 12);
    
    // Papua New Guinea
    this.ctx.fillRect(665, 250, 20, 8);
  }

  private drawAntarctica() {
    // Antarctica - bottom strip
    this.ctx.fillRect(100, 350, 600, 20);
  }

  private drawGrid() {
    this.ctx.strokeStyle = '#004400';
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.3;

    // Vertical lines
    for (let x = 0; x < this.canvasWidth; x += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y < this.canvasHeight; y += 30) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    this.ctx.globalAlpha = 1.0;
  }

  private startScanLineAnimation() {
    const animate = () => {
      this.drawScanLine();
      this.scanLine += this.scanDirection * 2;
      
      if (this.scanLine >= this.canvasHeight) {
        this.scanDirection = -1;
      } else if (this.scanLine <= 0) {
        this.scanDirection = 1;
      }
      
      this.animationFrame = requestAnimationFrame(animate);
    };
    
    animate();
  }

  private drawScanLine() {
    // Redraw the map first
    this.drawWorldMap();
    
    // Draw scanning line
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 2;
    this.ctx.globalAlpha = 0.8;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, this.scanLine);
    this.ctx.lineTo(this.canvasWidth, this.scanLine);
    this.ctx.stroke();
    
    this.ctx.globalAlpha = 1.0;
  }

  // Public methods for external control
  activateThreat(threatIndex: number) {
    if (this.threats[threatIndex]) {
      this.threats[threatIndex].active = true;
    }
  }

  deactivateThreat(threatIndex: number) {
    if (this.threats[threatIndex]) {
      this.threats[threatIndex].active = false;
    }
  }

  activateAllThreats() {
    this.threats.forEach(threat => threat.active = true);
  }

  deactivateAllThreats() {
    this.threats.forEach(threat => threat.active = false);
  }

  startBlinking() {
    this.isBlinking = true;
  }

  stopBlinking() {
    this.isBlinking = false;
  }
}
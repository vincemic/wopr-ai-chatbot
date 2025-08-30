import { Component, ElementRef, ViewChild, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

// Real geographical coordinate data (simplified for raster display)
interface GeographicalPoint {
  lat: number;
  lng: number;
}

interface ContinentData {
  name: string;
  coordinates: GeographicalPoint[];
}

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
  @Input() width: number = 1200;  // Increased from 800
  @Input() height: number = 600;  // Increased from 400
  @Input() showOverlay: boolean = false;
  @Input() isBlinking: boolean = false;

  canvasWidth: number = 1200;   // Higher resolution
  canvasHeight: number = 600;   // Higher resolution
  
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

  // High-resolution geographical data with detailed coastlines
  private continentData: ContinentData[] = [
    {
      name: 'North America',
      coordinates: [
        // Greenland (detailed)
        { lat: 83.5, lng: -32 }, { lat: 83, lng: -25 }, { lat: 82, lng: -20 }, { lat: 81, lng: -15 }, 
        { lat: 79, lng: -18 }, { lat: 77, lng: -22 }, { lat: 76, lng: -28 }, { lat: 78, lng: -35 },
        { lat: 80, lng: -42 }, { lat: 82, lng: -48 }, { lat: 83, lng: -55 }, { lat: 84, lng: -40 },
        
        // Canadian Arctic Archipelago
        { lat: 78, lng: -95 }, { lat: 76, lng: -85 }, { lat: 75, lng: -75 }, { lat: 74, lng: -95 },
        { lat: 75, lng: -105 }, { lat: 77, lng: -110 }, { lat: 78, lng: -100 },
        
        // Alaska (detailed coastline)
        { lat: 71, lng: -156 }, { lat: 70, lng: -165 }, { lat: 68, lng: -168 }, { lat: 66, lng: -164 },
        { lat: 64, lng: -162 }, { lat: 62, lng: -158 }, { lat: 60, lng: -152 }, { lat: 58, lng: -145 },
        { lat: 56, lng: -138 }, { lat: 55, lng: -135 }, { lat: 54, lng: -130 },
        
        // Western Canada (British Columbia)
        { lat: 52, lng: -128 }, { lat: 50, lng: -126 }, { lat: 48, lng: -124 }, { lat: 46, lng: -124 },
        
        // US West Coast (detailed)
        { lat: 44, lng: -124 }, { lat: 42, lng: -124 }, { lat: 40, lng: -124 }, { lat: 38, lng: -123 },
        { lat: 36, lng: -122 }, { lat: 34, lng: -120 }, { lat: 32, lng: -117 },
        
        // Baja California
        { lat: 30, lng: -115 }, { lat: 28, lng: -114 }, { lat: 26, lng: -112 }, { lat: 24, lng: -110 },
        { lat: 23, lng: -109 },
        
        // Mexico (Gulf coast)
        { lat: 22, lng: -105 }, { lat: 21, lng: -100 }, { lat: 20, lng: -97 }, { lat: 19, lng: -96 },
        { lat: 18, lng: -94 }, { lat: 17, lng: -93 }, { lat: 16, lng: -92 },
        
        // Central America
        { lat: 15, lng: -92 }, { lat: 14, lng: -90 }, { lat: 13, lng: -87 }, { lat: 12, lng: -85 },
        { lat: 10, lng: -84 }, { lat: 9, lng: -83 }, { lat: 8, lng: -82 },
        
        // Florida and Gulf Coast
        { lat: 25, lng: -81 }, { lat: 26, lng: -82 }, { lat: 28, lng: -83 }, { lat: 30, lng: -84 },
        { lat: 30, lng: -87 }, { lat: 29, lng: -90 }, { lat: 29, lng: -93 }, { lat: 30, lng: -94 },
        
        // US East Coast (detailed)
        { lat: 32, lng: -81 }, { lat: 34, lng: -78 }, { lat: 36, lng: -76 }, { lat: 38, lng: -75 },
        { lat: 40, lng: -74 }, { lat: 41, lng: -72 }, { lat: 42, lng: -71 }, { lat: 44, lng: -69 },
        { lat: 45, lng: -67 }, { lat: 46, lng: -67 }, { lat: 47, lng: -68 },
        
        // Maritime Canada
        { lat: 48, lng: -69 }, { lat: 49, lng: -66 }, { lat: 50, lng: -64 }, { lat: 51, lng: -56 },
        { lat: 52, lng: -55 }, { lat: 54, lng: -58 }, { lat: 56, lng: -62 }, { lat: 58, lng: -68 },
        { lat: 60, lng: -70 }, { lat: 62, lng: -72 }, { lat: 65, lng: -75 }, { lat: 68, lng: -78 },
        { lat: 70, lng: -82 }, { lat: 72, lng: -85 }
      ]
    },
    {
      name: 'South America',
      coordinates: [
        // Venezuela and Guyana
        { lat: 12, lng: -71 }, { lat: 11, lng: -68 }, { lat: 10, lng: -65 }, { lat: 8, lng: -62 },
        { lat: 6, lng: -58 }, { lat: 4, lng: -56 }, { lat: 2, lng: -54 },
        
        // Brazil (detailed eastern coast)
        { lat: 0, lng: -50 }, { lat: -2, lng: -44 }, { lat: -4, lng: -39 }, { lat: -6, lng: -35 },
        { lat: -8, lng: -35 }, { lat: -10, lng: -36 }, { lat: -12, lng: -37 }, { lat: -14, lng: -38 },
        { lat: -16, lng: -39 }, { lat: -18, lng: -40 }, { lat: -20, lng: -40 }, { lat: -22, lng: -42 },
        { lat: -24, lng: -46 }, { lat: -26, lng: -48 }, { lat: -28, lng: -49 }, { lat: -30, lng: -50 },
        
        // Southern Brazil/Uruguay
        { lat: -32, lng: -52 }, { lat: -34, lng: -54 }, { lat: -35, lng: -56 },
        
        // Argentina (eastern coast)
        { lat: -36, lng: -57 }, { lat: -38, lng: -58 }, { lat: -40, lng: -62 }, { lat: -42, lng: -64 },
        { lat: -44, lng: -65 }, { lat: -46, lng: -67 }, { lat: -48, lng: -68 }, { lat: -50, lng: -69 },
        { lat: -52, lng: -68 }, { lat: -54, lng: -67 },
        
        // Tierra del Fuego
        { lat: -55, lng: -67 }, { lat: -54, lng: -70 }, { lat: -52, lng: -72 },
        
        // Chile (western coast - very detailed)
        { lat: -50, lng: -75 }, { lat: -48, lng: -75 }, { lat: -46, lng: -74 }, { lat: -44, lng: -74 },
        { lat: -42, lng: -73 }, { lat: -40, lng: -73 }, { lat: -38, lng: -73 }, { lat: -36, lng: -73 },
        { lat: -34, lng: -72 }, { lat: -32, lng: -71 }, { lat: -30, lng: -71 }, { lat: -28, lng: -71 },
        { lat: -26, lng: -70 }, { lat: -24, lng: -70 }, { lat: -22, lng: -70 }, { lat: -20, lng: -70 },
        { lat: -18, lng: -70 }, { lat: -16, lng: -72 }, { lat: -14, lng: -75 }, { lat: -12, lng: -77 },
        { lat: -10, lng: -78 }, { lat: -8, lng: -79 }, { lat: -6, lng: -80 }, { lat: -4, lng: -81 },
        { lat: -2, lng: -80 }, { lat: 0, lng: -78 }, { lat: 2, lng: -77 }, { lat: 4, lng: -77 },
        { lat: 6, lng: -77 }, { lat: 8, lng: -76 }, { lat: 10, lng: -74 }, { lat: 11, lng: -72 }
      ]
    },
    {
      name: 'Europe',
      coordinates: [
        // Norway (detailed fjords)
        { lat: 71, lng: 25 }, { lat: 70, lng: 28 }, { lat: 69, lng: 30 }, { lat: 68, lng: 28 },
        { lat: 67, lng: 26 }, { lat: 66, lng: 24 }, { lat: 65, lng: 22 }, { lat: 64, lng: 20 },
        { lat: 63, lng: 18 }, { lat: 62, lng: 16 }, { lat: 61, lng: 14 }, { lat: 60, lng: 12 },
        { lat: 59, lng: 10 }, { lat: 58, lng: 8 }, { lat: 57, lng: 6 },
        
        // Sweden/Finland
        { lat: 69, lng: 21 }, { lat: 68, lng: 23 }, { lat: 67, lng: 24 }, { lat: 66, lng: 26 },
        { lat: 65, lng: 25 }, { lat: 64, lng: 24 }, { lat: 63, lng: 25 }, { lat: 62, lng: 27 },
        { lat: 61, lng: 28 }, { lat: 60, lng: 27 }, { lat: 59, lng: 24 }, { lat: 58, lng: 22 },
        
        // Denmark/Northern Germany
        { lat: 57, lng: 10 }, { lat: 56, lng: 8 }, { lat: 55, lng: 8 }, { lat: 54, lng: 9 },
        { lat: 53, lng: 7 }, { lat: 52, lng: 6 }, { lat: 51, lng: 4 }, { lat: 50, lng: 3 },
        
        // France (detailed coastline)
        { lat: 49, lng: 2 }, { lat: 48, lng: 1 }, { lat: 47, lng: -1 }, { lat: 46, lng: -2 },
        { lat: 45, lng: -1 }, { lat: 44, lng: 0 }, { lat: 43, lng: 2 }, { lat: 42, lng: 3 },
        
        // Spain
        { lat: 42, lng: 0 }, { lat: 41, lng: -2 }, { lat: 40, lng: -4 }, { lat: 39, lng: -6 },
        { lat: 38, lng: -7 }, { lat: 37, lng: -7 }, { lat: 36, lng: -6 }, { lat: 36, lng: -5 },
        
        // Portugal
        { lat: 37, lng: -9 }, { lat: 38, lng: -9 }, { lat: 39, lng: -9 }, { lat: 40, lng: -9 },
        { lat: 41, lng: -8 }, { lat: 42, lng: -8 },
        
        // Mediterranean (Italy, Greece, Balkans)
        { lat: 42, lng: 12 }, { lat: 41, lng: 14 }, { lat: 40, lng: 16 }, { lat: 39, lng: 17 },
        { lat: 38, lng: 18 }, { lat: 37, lng: 20 }, { lat: 38, lng: 22 }, { lat: 39, lng: 23 },
        { lat: 40, lng: 24 }, { lat: 41, lng: 25 }, { lat: 42, lng: 26 }, { lat: 43, lng: 28 },
        
        // Eastern Europe/Russia
        { lat: 44, lng: 30 }, { lat: 46, lng: 32 }, { lat: 48, lng: 35 }, { lat: 50, lng: 37 },
        { lat: 52, lng: 40 }, { lat: 54, lng: 42 }, { lat: 56, lng: 44 }, { lat: 58, lng: 45 },
        { lat: 60, lng: 43 }, { lat: 62, lng: 40 }, { lat: 64, lng: 38 }, { lat: 66, lng: 35 },
        { lat: 68, lng: 32 }, { lat: 70, lng: 28 }
      ]
    },
    {
      name: 'Africa',
      coordinates: [
        // North Africa (Morocco to Egypt)
        { lat: 36, lng: -6 }, { lat: 35, lng: -2 }, { lat: 34, lng: 2 }, { lat: 33, lng: 6 },
        { lat: 32, lng: 10 }, { lat: 31, lng: 15 }, { lat: 30, lng: 20 }, { lat: 29, lng: 25 },
        { lat: 28, lng: 30 }, { lat: 26, lng: 33 }, { lat: 24, lng: 35 }, { lat: 22, lng: 36 },
        
        // Red Sea coast
        { lat: 20, lng: 37 }, { lat: 18, lng: 38 }, { lat: 16, lng: 39 }, { lat: 14, lng: 40 },
        { lat: 12, lng: 41 }, { lat: 10, lng: 42 }, { lat: 8, lng: 43 }, { lat: 6, lng: 44 },
        { lat: 4, lng: 45 }, { lat: 2, lng: 45 }, { lat: 0, lng: 44 },
        
        // Horn of Africa (detailed)
        { lat: -2, lng: 43 }, { lat: -4, lng: 42 }, { lat: -6, lng: 40 }, { lat: -8, lng: 39 },
        { lat: -10, lng: 38 }, { lat: -12, lng: 37 }, { lat: -14, lng: 36 }, { lat: -16, lng: 35 },
        
        // East Africa coast
        { lat: -18, lng: 35 }, { lat: -20, lng: 35 }, { lat: -22, lng: 34 }, { lat: -24, lng: 33 },
        { lat: -26, lng: 32 }, { lat: -28, lng: 31 }, { lat: -30, lng: 30 }, { lat: -32, lng: 28 },
        { lat: -34, lng: 25 }, { lat: -35, lng: 22 }, { lat: -34, lng: 18 },
        
        // South Africa (Cape)
        { lat: -33, lng: 18 }, { lat: -32, lng: 17 }, { lat: -31, lng: 16 }, { lat: -30, lng: 15 },
        { lat: -29, lng: 14 }, { lat: -28, lng: 16 }, { lat: -27, lng: 15 }, { lat: -26, lng: 14 },
        
        // West coast (detailed)
        { lat: -24, lng: 14 }, { lat: -22, lng: 13 }, { lat: -20, lng: 12 }, { lat: -18, lng: 11 },
        { lat: -16, lng: 10 }, { lat: -14, lng: 9 }, { lat: -12, lng: 8 }, { lat: -10, lng: 7 },
        { lat: -8, lng: 6 }, { lat: -6, lng: 5 }, { lat: -4, lng: 4 }, { lat: -2, lng: 3 },
        { lat: 0, lng: 4 }, { lat: 2, lng: 5 }, { lat: 4, lng: 6 }, { lat: 6, lng: 7 },
        { lat: 8, lng: 8 }, { lat: 10, lng: 9 }, { lat: 12, lng: 10 }, { lat: 14, lng: 11 },
        { lat: 16, lng: 12 }, { lat: 18, lng: 13 }, { lat: 20, lng: 14 }, { lat: 22, lng: 13 },
        { lat: 24, lng: 12 }, { lat: 26, lng: 10 }, { lat: 28, lng: 8 }, { lat: 30, lng: 6 },
        { lat: 32, lng: 4 }, { lat: 34, lng: 2 }, { lat: 35, lng: 0 }, { lat: 36, lng: -3 }
      ]
    },
    {
      name: 'Asia',
      coordinates: [
        // Siberia (extensive northern coastline)
        { lat: 77, lng: 105 }, { lat: 76, lng: 115 }, { lat: 75, lng: 125 }, { lat: 74, lng: 135 },
        { lat: 73, lng: 145 }, { lat: 72, lng: 155 }, { lat: 71, lng: 165 }, { lat: 70, lng: 170 },
        { lat: 69, lng: 175 }, { lat: 68, lng: 178 }, { lat: 67, lng: -179 }, { lat: 66, lng: -174 },
        { lat: 65, lng: -168 }, { lat: 64, lng: -164 }, { lat: 65, lng: -160 }, { lat: 66, lng: -156 },
        
        // Far East (Chukotka, Kamchatka)
        { lat: 67, lng: -150 }, { lat: 68, lng: -145 }, { lat: 66, lng: -140 }, { lat: 64, lng: -138 },
        { lat: 62, lng: -140 }, { lat: 60, lng: -150 }, { lat: 58, lng: -155 }, { lat: 56, lng: -160 },
        { lat: 54, lng: -165 }, { lat: 52, lng: -158 }, { lat: 50, lng: -155 },
        
        // Eastern Siberia/Mongolia
        { lat: 52, lng: 140 }, { lat: 50, lng: 135 }, { lat: 48, lng: 130 }, { lat: 46, lng: 125 },
        { lat: 44, lng: 120 }, { lat: 42, lng: 115 }, { lat: 40, lng: 110 }, { lat: 38, lng: 105 },
        
        // China (detailed borders)
        { lat: 36, lng: 100 }, { lat: 34, lng: 102 }, { lat: 32, lng: 104 }, { lat: 30, lng: 106 },
        { lat: 28, lng: 108 }, { lat: 26, lng: 110 }, { lat: 24, lng: 112 }, { lat: 22, lng: 114 },
        { lat: 20, lng: 110 }, { lat: 18, lng: 108 }, { lat: 16, lng: 106 }, { lat: 14, lng: 104 },
        
        // Southeast Asia (detailed)
        { lat: 12, lng: 102 }, { lat: 10, lng: 100 }, { lat: 8, lng: 98 }, { lat: 6, lng: 95 },
        { lat: 4, lng: 96 }, { lat: 2, lng: 98 }, { lat: 0, lng: 100 }, { lat: -2, lng: 102 },
        { lat: -4, lng: 105 }, { lat: -6, lng: 108 }, { lat: -8, lng: 112 }, { lat: -10, lng: 115 },
        { lat: -8, lng: 118 }, { lat: -6, lng: 122 }, { lat: -4, lng: 125 }, { lat: -2, lng: 130 },
        { lat: 0, lng: 135 }, { lat: 2, lng: 140 }, { lat: 4, lng: 138 }, { lat: 6, lng: 135 },
        
        // Philippines/Indonesia region
        { lat: 8, lng: 130 }, { lat: 10, lng: 125 }, { lat: 12, lng: 120 }, { lat: 14, lng: 115 },
        { lat: 16, lng: 118 }, { lat: 18, lng: 120 }, { lat: 20, lng: 122 },
        
        // Eastern China/Korea/Japan region
        { lat: 22, lng: 120 }, { lat: 25, lng: 118 }, { lat: 28, lng: 116 }, { lat: 30, lng: 118 },
        { lat: 32, lng: 120 }, { lat: 35, lng: 125 }, { lat: 38, lng: 128 }, { lat: 40, lng: 130 },
        { lat: 42, lng: 132 }, { lat: 45, lng: 135 }, { lat: 47, lng: 138 }, { lat: 50, lng: 140 },
        
        // Back to Siberia
        { lat: 52, lng: 138 }, { lat: 55, lng: 135 }, { lat: 58, lng: 130 }, { lat: 60, lng: 125 },
        { lat: 62, lng: 120 }, { lat: 65, lng: 115 }, { lat: 68, lng: 110 }, { lat: 70, lng: 105 },
        { lat: 72, lng: 100 }, { lat: 74, lng: 95 }, { lat: 75, lng: 90 }, { lat: 76, lng: 95 }
      ]
    },
    {
      name: 'Australia',
      coordinates: [
        // Northern Australia
        { lat: -10, lng: 142 }, { lat: -11, lng: 145 }, { lat: -12, lng: 148 }, { lat: -13, lng: 151 },
        { lat: -14, lng: 153 }, { lat: -16, lng: 154 }, { lat: -18, lng: 153 }, { lat: -20, lng: 152 },
        { lat: -22, lng: 150 }, { lat: -24, lng: 152 }, { lat: -26, lng: 153 }, { lat: -28, lng: 154 },
        
        // Eastern coast (Great Barrier Reef region)
        { lat: -30, lng: 153 }, { lat: -32, lng: 152 }, { lat: -34, lng: 151 }, { lat: -36, lng: 150 },
        { lat: -38, lng: 148 }, { lat: -39, lng: 146 },
        
        // Southern coast
        { lat: -39, lng: 144 }, { lat: -38, lng: 142 }, { lat: -37, lng: 140 }, { lat: -36, lng: 138 },
        { lat: -35, lng: 136 }, { lat: -34, lng: 134 }, { lat: -33, lng: 132 }, { lat: -32, lng: 130 },
        { lat: -31, lng: 128 }, { lat: -30, lng: 126 }, { lat: -29, lng: 124 }, { lat: -28, lng: 122 },
        { lat: -27, lng: 120 }, { lat: -26, lng: 118 }, { lat: -25, lng: 116 }, { lat: -24, lng: 114 },
        
        // Western coast
        { lat: -23, lng: 113 }, { lat: -22, lng: 114 }, { lat: -20, lng: 116 }, { lat: -18, lng: 118 },
        { lat: -16, lng: 120 }, { lat: -14, lng: 122 }, { lat: -12, lng: 125 }, { lat: -11, lng: 128 },
        { lat: -10, lng: 131 }, { lat: -10, lng: 135 }, { lat: -11, lng: 138 }, { lat: -10, lng: 140 }
      ]
    }
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

    // Set up wireframe drawing - no fill style needed
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;

    // Draw continents using real geographical data
    this.drawContinentsFromData();

    // Add grid lines for authentic computer look
    this.drawGrid();
  }

  private drawContinentsFromData() {
    this.continentData.forEach(continent => {
      this.drawContinentPolygon(continent.coordinates);
    });

    // Add some additional geographical features
    this.drawIslands();
  }

  private drawContinentPolygon(coordinates: GeographicalPoint[]) {
    if (coordinates.length < 3) return;

    this.ctx.beginPath();
    
    // Convert first point
    const firstPoint = this.latLngToCanvas(coordinates[0].lat, coordinates[0].lng);
    this.ctx.moveTo(firstPoint.x, firstPoint.y);
    
    // Draw to all other points
    for (let i = 1; i < coordinates.length; i++) {
      const point = this.latLngToCanvas(coordinates[i].lat, coordinates[i].lng);
      this.ctx.lineTo(point.x, point.y);
    }
    
    this.ctx.closePath();
    
    // Wireframe style - no fill, only glowing green outline
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1.2;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.shadowBlur = 3;
    this.ctx.stroke();
    
    // Add internal wireframe details for more authenticity
    this.addWireframeDetails(coordinates);
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  private latLngToCanvas(lat: number, lng: number): { x: number, y: number } {
    // Convert latitude/longitude to canvas coordinates
    // Latitude: -90 to 90 -> canvas height (inverted)
    // Longitude: -180 to 180 -> canvas width
    
    const x = ((lng + 180) / 360) * this.canvasWidth;
    const y = ((90 - lat) / 180) * this.canvasHeight;
    
    return { x: Math.round(x), y: Math.round(y) };
  }

  private addRasterEffect(coordinates: GeographicalPoint[]) {
    // Find bounding box of the continent
    const bounds = this.getBounds(coordinates);
    const canvasStart = this.latLngToCanvas(bounds.maxLat, bounds.minLng);
    const canvasEnd = this.latLngToCanvas(bounds.minLat, bounds.maxLng);
    
    // Enhanced raster lines for higher resolution
    this.ctx.strokeStyle = '#004400';
    this.ctx.lineWidth = 0.3;
    this.ctx.globalAlpha = 0.2;
    
    // Draw finer horizontal raster lines for authentic CRT look
    for (let y = canvasStart.y; y < canvasEnd.y; y += 2) {  // Higher density
      this.ctx.beginPath();
      this.ctx.moveTo(canvasStart.x, y);
      this.ctx.lineTo(canvasEnd.x, y);
      this.ctx.stroke();
    }
    
    // Add subtle vertical raster lines for extra detail
    this.ctx.globalAlpha = 0.1;
    for (let x = canvasStart.x; x < canvasEnd.x; x += 4) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, canvasStart.y);
      this.ctx.lineTo(x, canvasEnd.y);
      this.ctx.stroke();
    }
    
    this.ctx.globalAlpha = 1.0;
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
  }

  private addWireframeDetails(coordinates: GeographicalPoint[]) {
    if (coordinates.length < 6) return;
    
    // Add internal wireframe structure for more authentic 1980s computer graphics
    this.ctx.strokeStyle = '#003300';
    this.ctx.lineWidth = 0.8;
    this.ctx.globalAlpha = 0.6;
    
    // Draw internal triangulation lines across the continent
    const step = Math.max(3, Math.floor(coordinates.length / 8));
    for (let i = 0; i < coordinates.length; i += step) {
      const point1 = this.latLngToCanvas(coordinates[i].lat, coordinates[i].lng);
      
      // Connect to points across the continent
      for (let j = i + step * 2; j < coordinates.length; j += step * 3) {
        const point2 = this.latLngToCanvas(coordinates[j].lat, coordinates[j].lng);
        
        this.ctx.beginPath();
        this.ctx.moveTo(point1.x, point1.y);
        this.ctx.lineTo(point2.x, point2.y);
        this.ctx.stroke();
      }
    }
    
    // Add cross-hatching for detailed wireframe look
    const bounds = this.getBounds(coordinates);
    const centerLat = (bounds.minLat + bounds.maxLat) / 2;
    const centerLng = (bounds.minLng + bounds.maxLng) / 2;
    const centerPoint = this.latLngToCanvas(centerLat, centerLng);
    
    // Radial lines from center to edges for authentic computer graphics
    this.ctx.strokeStyle = '#002200';
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.4;
    
    for (let i = 0; i < coordinates.length; i += Math.max(5, Math.floor(coordinates.length / 12))) {
      const edgePoint = this.latLngToCanvas(coordinates[i].lat, coordinates[i].lng);
      this.ctx.beginPath();
      this.ctx.moveTo(centerPoint.x, centerPoint.y);
      this.ctx.lineTo(edgePoint.x, edgePoint.y);
      this.ctx.stroke();
    }
    
    // Reset drawing state
    this.ctx.globalAlpha = 1.0;
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
  }

  private getBounds(coordinates: GeographicalPoint[]) {
    let minLat = 90, maxLat = -90, minLng = 180, maxLng = -180;
    
    coordinates.forEach(coord => {
      minLat = Math.min(minLat, coord.lat);
      maxLat = Math.max(maxLat, coord.lat);
      minLng = Math.min(minLng, coord.lng);
      maxLng = Math.max(maxLng, coord.lng);
    });
    
    return { minLat, maxLat, minLng, maxLng };
  }

  private drawIslands() {
    // Enhanced major islands and geographical features using real coordinates
    const detailedIslands = [
      // Iceland (detailed shape)
      { lat: 66, lng: -18, width: 12, height: 8 },
      { lat: 64, lng: -22, width: 8, height: 6 },
      { lat: 63, lng: -20, width: 6, height: 4 },
      
      // British Isles (more detailed)
      { lat: 58, lng: -4, width: 6, height: 8 },   // Scotland
      { lat: 55, lng: -3, width: 8, height: 10 },  // Northern England
      { lat: 52, lng: -2, width: 10, height: 8 },  // Central England
      { lat: 50, lng: -4, width: 6, height: 4 },   // Southwest England
      
      // Ireland (detailed)
      { lat: 54, lng: -8, width: 6, height: 10 },
      { lat: 52, lng: -9, width: 8, height: 6 },
      
      // Madagascar (more accurate)
      { lat: -18, lng: 47, width: 3, height: 10 },
      { lat: -20, lng: 47, width: 4, height: 8 },
      { lat: -22, lng: 47, width: 3, height: 6 },
      
      // Japan (detailed archipelago)
      { lat: 45, lng: 142, width: 4, height: 6 },   // Hokkaido
      { lat: 38, lng: 140, width: 3, height: 12 },  // Honshu North
      { lat: 35, lng: 139, width: 4, height: 8 },   // Honshu Central
      { lat: 33, lng: 131, width: 6, height: 4 },   // Kyushu
      { lat: 34, lng: 134, width: 3, height: 4 },   // Shikoku
      
      // Philippines (major islands)
      { lat: 16, lng: 121, width: 3, height: 8 },   // Luzon
      { lat: 12, lng: 123, width: 4, height: 6 },   // Visayas
      { lat: 8, lng: 125, width: 5, height: 8 },    // Mindanao
      
      // Indonesia (major islands)
      { lat: -6, lng: 107, width: 8, height: 3 },   // Java
      { lat: -2, lng: 118, width: 12, height: 5 },  // Sulawesi
      { lat: -8, lng: 115, width: 6, height: 3 },   // Bali/Lombok
      { lat: 0, lng: 101, width: 10, height: 4 },   // Sumatra
      { lat: 1, lng: 115, width: 14, height: 6 },   // Borneo
      
      // New Zealand (detailed)
      { lat: -36, lng: 174, width: 2, height: 8 },  // North Island North
      { lat: -39, lng: 176, width: 3, height: 6 },  // North Island South
      { lat: -42, lng: 172, width: 2, height: 6 },  // South Island North
      { lat: -45, lng: 170, width: 3, height: 8 },  // South Island South
      
      // Sri Lanka
      { lat: 7, lng: 81, width: 2, height: 5 },
      
      // Tasmania (detailed)
      { lat: -42, lng: 147, width: 4, height: 5 },
      
      // Caribbean (major islands)
      { lat: 22, lng: -79, width: 10, height: 2 },  // Cuba
      { lat: 18, lng: -77, width: 6, height: 3 },   // Jamaica
      { lat: 18, lng: -66, width: 4, height: 2 },   // Puerto Rico
      { lat: 19, lng: -71, width: 8, height: 3 },   // Hispaniola
      
      // Mediterranean Islands
      { lat: 42, lng: 9, width: 2, height: 4 },     // Corsica
      { lat: 40, lng: 9, width: 3, height: 5 },     // Sardinia
      { lat: 37, lng: 14, width: 4, height: 3 },    // Sicily
      { lat: 35, lng: 25, width: 4, height: 2 },    // Crete
      
      // Other significant islands
      { lat: 70, lng: -25, width: 8, height: 12 },  // Svalbard
      { lat: 54, lng: 158, width: 6, height: 8 },   // Kamchatka tip
      { lat: 46, lng: 142, width: 4, height: 6 },   // Sakhalin
      { lat: -54, lng: 3, width: 3, height: 2 },    // South Georgia
      { lat: 78, lng: 16, width: 5, height: 3 },    // Franz Josef Land
    ];

    // Draw all detailed islands in wireframe style
    this.ctx.strokeStyle = '#00ff00';
    this.ctx.lineWidth = 1;
    this.ctx.shadowColor = '#00ff00';
    this.ctx.shadowBlur = 1.5;
    
    detailedIslands.forEach(island => {
      const point = this.latLngToCanvas(island.lat, island.lng);
      
      // Wireframe rectangle for each island
      this.ctx.strokeRect(point.x - island.width/2, point.y - island.height/2, island.width, island.height);
      
      // Add internal cross for detail
      this.ctx.beginPath();
      // Horizontal line
      this.ctx.moveTo(point.x - island.width/2, point.y);
      this.ctx.lineTo(point.x + island.width/2, point.y);
      // Vertical line
      this.ctx.moveTo(point.x, point.y - island.height/2);
      this.ctx.lineTo(point.x, point.y + island.height/2);
      this.ctx.stroke();
    });
    
    this.ctx.shadowBlur = 0;

    // Add some coastal detail features
    this.addCoastalFeatures();
  }

  private addCoastalFeatures() {
    // Add major peninsulas, bays, and coastal features for more realistic wireframe appearance
    this.ctx.strokeStyle = '#006600';
    this.ctx.lineWidth = 0.8;
    this.ctx.globalAlpha = 0.7;
    
    // Major peninsulas and coastal features
    const coastalFeatures = [
      // Scandinavian fjords (simplified)
      { lat: 69, lng: 16, width: 2, height: 8 },
      { lat: 67, lng: 14, width: 1, height: 6 },
      { lat: 65, lng: 12, width: 2, height: 4 },
      
      // Italian peninsula detail
      { lat: 41, lng: 14, width: 2, height: 8 },
      { lat: 39, lng: 17, width: 3, height: 6 },
      
      // Iberian peninsula detail
      { lat: 43, lng: -8, width: 3, height: 2 },
      { lat: 37, lng: -6, width: 4, height: 2 },
      
      // Balkan peninsula
      { lat: 40, lng: 23, width: 3, height: 4 },
      
      // Anatolia (Turkey)
      { lat: 39, lng: 32, width: 8, height: 3 },
      
      // Arabian Peninsula detail
      { lat: 26, lng: 50, width: 6, height: 8 },
      { lat: 16, lng: 48, width: 4, height: 6 },
      
      // Indian subcontinent detail
      { lat: 22, lng: 82, width: 4, height: 6 },
      { lat: 15, lng: 80, width: 3, height: 8 },
      { lat: 9, lng: 78, width: 2, height: 4 },
      
      // Indochina peninsula
      { lat: 16, lng: 108, width: 3, height: 8 },
      { lat: 10, lng: 106, width: 4, height: 6 },
      
      // Korea peninsula
      { lat: 38, lng: 127, width: 2, height: 6 },
      
      // Florida detail
      { lat: 26, lng: -81, width: 2, height: 8 },
      
      // Baja California
      { lat: 28, lng: -113, width: 2, height: 12 },
      
      // Chilean coast detail
      { lat: -33, lng: -72, width: 1, height: 20 },
      
      // Norwegian coast detail
      { lat: 68, lng: 15, width: 1, height: 4 },
      { lat: 66, lng: 13, width: 1, height: 3 },
    ];

    coastalFeatures.forEach(feature => {
      const point = this.latLngToCanvas(feature.lat, feature.lng);
      // Draw wireframe coastal features instead of filled
      this.ctx.strokeRect(point.x - feature.width/2, point.y - feature.height/2, feature.width, feature.height);
    });
    
    // Reset drawing state
    this.ctx.globalAlpha = 1.0;
  }

  private drawGrid() {
    // Base grid - fine mesh for wireframe look
    this.ctx.strokeStyle = '#003300';
    this.ctx.lineWidth = 0.3;
    this.ctx.globalAlpha = 0.15;

    // Very fine grid for authentic computer graphics
    for (let x = 0; x < this.canvasWidth; x += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvasHeight; y += 15) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    // Medium grid overlay for depth
    this.ctx.strokeStyle = '#004400';
    this.ctx.lineWidth = 0.5;
    this.ctx.globalAlpha = 0.25;

    for (let x = 0; x < this.canvasWidth; x += 60) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvasHeight; y += 40) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    // Major coordinate grid - geographical reference
    this.ctx.globalAlpha = 0.4;
    this.ctx.strokeStyle = '#006600';
    this.ctx.lineWidth = 0.8;
    
    // Major longitude lines (every 30 degrees)
    for (let lng = -180; lng <= 180; lng += 30) {
      const x = ((lng + 180) / 360) * this.canvasWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvasHeight);
      this.ctx.stroke();
    }
    
    // Major latitude lines (every 30 degrees)
    for (let lat = -90; lat <= 90; lat += 30) {
      const y = ((90 - lat) / 180) * this.canvasHeight;
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvasWidth, y);
      this.ctx.stroke();
    }

    // Equator and Prime Meridian (special highlighting)
    this.ctx.globalAlpha = 0.7;
    this.ctx.strokeStyle = '#00aa00';
    this.ctx.lineWidth = 1.2;
    
    // Equator (0° latitude)
    const equatorY = (90 / 180) * this.canvasHeight;
    this.ctx.beginPath();
    this.ctx.moveTo(0, equatorY);
    this.ctx.lineTo(this.canvasWidth, equatorY);
    this.ctx.stroke();
    
    // Prime Meridian (0° longitude)
    const primeX = (180 / 360) * this.canvasWidth;
    this.ctx.beginPath();
    this.ctx.moveTo(primeX, 0);
    this.ctx.lineTo(primeX, this.canvasHeight);
    this.ctx.stroke();

    // Add coordinate markers for authentic computer display
    this.ctx.globalAlpha = 0.8;
    this.ctx.fillStyle = '#00ff00';
    this.ctx.font = '8px monospace';
    
    // Longitude markers
    for (let lng = -180; lng <= 180; lng += 60) {
      const x = ((lng + 180) / 360) * this.canvasWidth;
      this.ctx.fillText(`${lng}°`, x - 8, 12);
    }
    
    // Latitude markers
    for (let lat = -60; lat <= 60; lat += 60) {
      const y = ((90 - lat) / 180) * this.canvasHeight;
      this.ctx.fillText(`${lat}°`, 5, y + 3);
    }
    
    // Reset drawing state
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
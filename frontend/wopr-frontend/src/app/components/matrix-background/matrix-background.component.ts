import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild, Input } from '@angular/core';

interface MatrixColumn {
  x: number;
  y: number;
  speed: number;
  characters: string[];
  opacity: number;
}

@Component({
  selector: 'app-matrix-background',
  imports: [CommonModule],
  template: `
    <canvas #matrixCanvas class="matrix-canvas" [style.display]="isVisible ? 'block' : 'none'"></canvas>
  `,
  styles: [`
    .matrix-canvas {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
      pointer-events: none;
      background: transparent;
      opacity: 0.6; /* More transparent for header overlay */
    }
  `]
})
export class MatrixBackgroundComponent implements OnInit, OnDestroy {
  @ViewChild('matrixCanvas', { static: true }) canvas!: ElementRef<HTMLCanvasElement>;
  @Input() isVisible: boolean = false;
  @Input() theme: string = 'classic';

  private ctx!: CanvasRenderingContext2D;
  private animationFrame!: number;
  private columns: MatrixColumn[] = [];
  private fontSize = 16; // Slightly larger for better visibility
  private columnCount = 0;
  private resizeObserver?: ResizeObserver;
  
  // Matrix characters - mix of katakana, hiragana, and numbers
  private readonly matrixChars = [
    'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン',
    'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん',
    '0123456789',
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    '!@#$%^&*()_+-=[]{}|;:,.<>?'
  ].join('');

  ngOnInit() {
    this.initCanvas();
    this.setupColumns();
    
    // Only start animation if visible
    if (this.isVisible) {
      this.startAnimation();
    }
    
    // Handle window resize
    window.addEventListener('resize', this.handleResize.bind(this));
    
    // Observe parent container resize for better responsiveness
    if (this.canvas.nativeElement.parentElement && 'ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(() => {
        this.handleResize();
      });
      this.resizeObserver.observe(this.canvas.nativeElement.parentElement);
    }
  }

  ngOnDestroy() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    window.removeEventListener('resize', this.handleResize.bind(this));
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initCanvas() {
    const canvas = this.canvas.nativeElement;
    this.ctx = canvas.getContext('2d')!;
    
    // Set canvas to match its parent container size
    this.handleResize();
    
    // Initial clear
    this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  private handleResize() {
    const canvas = this.canvas.nativeElement;
    const parent = canvas.parentElement;
    
    if (parent) {
      // Match parent container dimensions
      canvas.width = parent.clientWidth;
      canvas.height = parent.clientHeight;
    } else {
      // Fallback to viewport if no parent
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    
    // Adjust column count for header size (much fewer columns)
    this.columnCount = Math.floor(canvas.width / (this.fontSize * 2)); // Wider spacing for header
    this.setupColumns();
  }

  private setupColumns() {
    this.columns = [];
    const canvas = this.canvas.nativeElement;
    
    for (let i = 0; i < this.columnCount; i++) {
      this.columns.push({
        x: i * this.fontSize * 2, // Match the spacing from handleResize
        y: Math.random() * -canvas.height, // Start above the header area
        speed: Math.random() * 1.5 + 0.3, // Slower speed for header (0.3-1.8)
        characters: this.generateRandomString(Math.floor(Math.random() * 8) + 3), // Much shorter columns for header (3-10 chars)
        opacity: Math.random() * 0.5 + 0.3 // Good visibility range (0.3-0.8)
      });
    }
  }

  private generateRandomString(length: number): string[] {
    const chars = [];
    for (let i = 0; i < length; i++) {
      chars.push(this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)]);
    }
    return chars;
  }

  private getThemeColor(): string {
    switch (this.theme) {
      case 'green':
        return '#00ff41'; // Matrix green
      case 'blue':
        return '#00bfff'; // Blue matrix
      default:
        return '#00ff00'; // Classic green fallback
    }
  }

  private getThemeColorRgb(): string {
    switch (this.theme) {
      case 'green':
        return '0, 255, 65'; // Matrix green RGB
      case 'blue':
        return '0, 191, 255'; // Blue matrix RGB
      default:
        return '0, 255, 0'; // Classic green RGB fallback
    }
  }

  private drawColumn(column: MatrixColumn) {
    const themeColor = this.getThemeColor();
    const themeColorRgb = this.getThemeColorRgb();
    const canvas = this.canvas.nativeElement;
    
    // Draw each character in the column with varying opacity
    for (let i = 0; i < column.characters.length; i++) {
      const charY = column.y + (i * this.fontSize);
      
      // Skip if character is off screen
      if (charY < -this.fontSize || charY > canvas.height + this.fontSize) {
        continue;
      }
      
      // Calculate opacity - brightest at the head, fading towards tail
      const distanceFromHead = i;
      const maxOpacity = column.opacity;
      const fadeRate = 0.08; // Faster fade for shorter header columns
      const opacity = Math.max(0, maxOpacity - (distanceFromHead * fadeRate));
      
      // Make the head character (first one) extra bright
      const finalOpacity = i === 0 ? Math.min(1, opacity + 0.4) : opacity;
      
      this.ctx.fillStyle = `rgba(${themeColorRgb}, ${finalOpacity})`;
      this.ctx.font = `${this.fontSize}px monospace`;
      this.ctx.textAlign = 'left';
      
      // Add glow effect for head character
      if (i === 0 && finalOpacity > 0.6) {
        this.ctx.shadowColor = themeColor;
        this.ctx.shadowBlur = 8;
      } else {
        this.ctx.shadowBlur = 0;
      }
      
      this.ctx.fillText(column.characters[i], column.x, charY);
    }
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  private updateColumn(column: MatrixColumn) {
    // Move column down
    column.y += column.speed;
    
    // If column has moved completely off screen, reset it
    const canvas = this.canvas.nativeElement;
    const columnHeight = column.characters.length * this.fontSize;
    if (column.y > canvas.height + columnHeight) {
      column.y = Math.random() * -columnHeight - 20; // Start above the header
      column.speed = Math.random() * 1.5 + 0.3; // New random speed
      column.characters = this.generateRandomString(Math.floor(Math.random() * 8) + 3);
      column.opacity = Math.random() * 0.5 + 0.3;
    }
    
    // Occasionally change some characters for dynamic effect
    if (Math.random() < 0.008) { // Slightly less frequent changes for header
      const randomIndex = Math.floor(Math.random() * column.characters.length);
      column.characters[randomIndex] = this.matrixChars[Math.floor(Math.random() * this.matrixChars.length)];
    }
  }

  private animate() {
    // Always continue the animation loop, but only draw when visible
    this.animationFrame = requestAnimationFrame(this.animate.bind(this));
    
    if (!this.isVisible) {
      return;
    }

    // Clear canvas with slight trail effect for smoother animation
    // Make the trail effect more pronounced for Matrix themes
    const trailOpacity = this.theme === 'green' || this.theme === 'blue' ? 0.08 : 0.05;
    this.ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
    this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

    // Update and draw all columns
    for (const column of this.columns) {
      this.updateColumn(column);
      this.drawColumn(column);
    }
  }

  private startAnimation() {
    if (!this.animationFrame) {
      this.animate();
    }
  }

  private stopAnimation() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = 0;
    }
  }

  // Public method to update visibility
  updateVisibility(visible: boolean, theme: string) {
    const wasVisible = this.isVisible;
    this.isVisible = visible;
    this.theme = theme;
    
    if (visible && !wasVisible) {
      // Starting to show - clear canvas and start animation
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.setupColumns(); // Reset columns for fresh start
      this.startAnimation();
    } else if (!visible && wasVisible) {
      // Hiding - clear the canvas completely
      this.ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      this.ctx.fillRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
    }
  }
}
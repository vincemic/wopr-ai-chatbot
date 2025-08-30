import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LaunchCodeAnimation, LaunchCodeAttempt, LaunchCodeResult } from '../models/launch-codes.models';

@Injectable({
  providedIn: 'root'
})
export class LaunchCodeService {
  private animationSubject = new BehaviorSubject<LaunchCodeAnimation>({
    isRunning: false,
    currentAttempt: 0,
    totalAttempts: 0,
    codes: [],
    startTime: new Date()
  });

  public animation$ = this.animationSubject.asObservable();

  // Common launch code patterns from the movie and era
  private codePatterns = [
    'CPE1704TKS', // The actual code from the movie
    'JOSHUA',     // Professor Falken's son's name
    'MARIE',      // Professor Falken's wife's name
    'FALKEN',     // Professor's last name
    'WOPR',       // System name
    'NORAD',      // Military organization
    'DEFCON',     // Defense condition
    'NUCLEAR',    // Related term
    'LAUNCH',     // Command term
    'ABORT',      // Command term
    'ZERO',       // Number variants
    'ONE',
    'TWO',
    'THREE',
    'FOUR',
    'FIVE',
    'SIX',
    'SEVEN',
    'EIGHT',
    'NINE'
  ];

  private alphabetCodes = [
    'ALPHA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO', 'FOXTROT', 
    'GOLF', 'HOTEL', 'INDIA', 'JULIET', 'KILO', 'LIMA',
    'MIKE', 'NOVEMBER', 'OSCAR', 'PAPA', 'QUEBEC', 'ROMEO',
    'SIERRA', 'TANGO', 'UNIFORM', 'VICTOR', 'WHISKEY', 'XRAY', 'YANKEE', 'ZULU'
  ];

  private numericPatterns = [
    '00000000', '12345678', '87654321', '11111111', '00000001',
    '99999999', '19830603', '20251983', '12341234', '56785678',
    '13579246', '24681357', '11235813', '31415926', '27182818'
  ];

  async startLaunchCodeAnimation(targetCode?: string, duration: number = 30000): Promise<LaunchCodeResult> {
    if (this.animationSubject.value.isRunning) {
      throw new Error('Launch code animation already running');
    }

    const startTime = new Date();
    const finalCode = targetCode || this.getRandomFinalCode14();
    const totalAttempts = Math.floor(duration / 500); // One attempt every 500ms (half second)
    
    const animation: LaunchCodeAnimation = {
      isRunning: true,
      currentAttempt: 0,
      totalAttempts,
      codes: [],
      startTime,
      estimatedTimeRemaining: duration
    };

    this.animationSubject.next(animation);

    return new Promise((resolve) => {
      const interval = setInterval(() => {
        const current = this.animationSubject.value;
        
        if (!current.isRunning) {
          clearInterval(interval);
          return;
        }

        current.currentAttempt++;
        
        // Generate 14-character attempt based on progress
        const progress = current.currentAttempt / current.totalAttempts;
        const attemptCode = this.generate14CharAttemptCode(progress, finalCode);
        
        const attempt: LaunchCodeAttempt = {
          code: attemptCode,
          timestamp: new Date(),
          success: false,
          attempts: current.currentAttempt
        };

        current.codes.push(attempt);
        current.estimatedTimeRemaining = Math.max(0, duration - (Date.now() - startTime.getTime()));

        // Keep only last 10 attempts for performance
        if (current.codes.length > 10) {
          current.codes = current.codes.slice(-10);
        }

        this.animationSubject.next({ ...current });

        // Check if we should succeed (90% through or time up)
        if (progress >= 0.9 || current.estimatedTimeRemaining <= 500) {
          clearInterval(interval);
          
          // Final successful attempt
          const finalAttempt: LaunchCodeAttempt = {
            code: finalCode,
            timestamp: new Date(),
            success: true,
            attempts: current.currentAttempt + 1
          };
          
          current.codes.push(finalAttempt);
          current.isRunning = false;
          current.currentAttempt++;
          
          this.animationSubject.next({ ...current });

          const result: LaunchCodeResult = {
            success: true,
            finalCode,
            totalAttempts: current.currentAttempt,
            elapsedTime: Date.now() - startTime.getTime(),
            outcome: 'SUCCESS',
            message: `LAUNCH CODE AUTHENTICATED: ${finalCode}`
          };

          resolve(result);
        }
      }, 500); // Update every 500ms (half second)

      // Safety timeout
      setTimeout(() => {
        if (this.animationSubject.value.isRunning) {
          this.stopAnimation();
          resolve({
            success: false,
            totalAttempts: this.animationSubject.value.currentAttempt,
            elapsedTime: Date.now() - startTime.getTime(),
            outcome: 'FAILURE',
            message: 'LAUNCH CODE AUTHENTICATION FAILED - TIMEOUT'
          });
        }
      }, duration + 1000);
    });
  }

  stopAnimation(): void {
    const current = this.animationSubject.value;
    if (current.isRunning) {
      current.isRunning = false;
      this.animationSubject.next({ ...current });
    }
  }

  private generate14CharAttemptCode(progress: number, finalCode: string): string {
    // Early attempts: Random 14-character patterns
    if (progress < 0.3) {
      return this.generateRandom14CharCode();
    }
    
    // Middle attempts: Getting closer to patterns
    if (progress < 0.7) {
      return this.generatePattern14CharCode();
    }
    
    // Late attempts: Very close to final code
    if (progress < 0.9) {
      return this.generateClose14CharCode(finalCode);
    }
    
    // Final attempts: Almost there
    return this.generateAlmostCorrect14CharCode(finalCode);
  }

  private generateRandom14CharCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private generatePattern14CharCode(): string {
    // Generate realistic 14-character patterns
    const patterns = [
      () => this.padToLength('CPE1704TKS', 14),
      () => this.padToLength('JOSHUA', 14),
      () => this.padToLength('FALKEN', 14),
      () => this.padToLength('WOPR', 14),
      () => this.padToLength('NORAD', 14),
      () => this.generateNumeric14(),
      () => this.generateAlphaNumeric14(),
      () => this.generateMilitary14()
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }

  private generateClose14CharCode(finalCode: string): string {
    // Modify 1-3 characters from the final code
    const chars = finalCode.split('');
    const numChanges = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numChanges; i++) {
      const index = Math.floor(Math.random() * chars.length);
      chars[index] = this.getRandomChar();
    }
    
    return chars.join('');
  }

  private generateAlmostCorrect14CharCode(finalCode: string): string {
    // Modify just 1 character
    const chars = finalCode.split('');
    const index = Math.floor(Math.random() * chars.length);
    chars[index] = this.getRandomChar();
    
    return chars.join('');
  }

  private generateNumeric14(): string {
    // Generate 14-digit numeric code
    return Array.from({ length: 14 }, () => Math.floor(Math.random() * 10).toString()).join('');
  }

  private generateAlphaNumeric14(): string {
    // Generate mixed 14-character alphanumeric
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 14 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private generateMilitary14(): string {
    // Generate military-style codes
    const prefixes = ['CPE', 'WOP', 'NOR', 'DEF', 'LAU', 'ABT', 'JOS', 'FAL'];
    const numbers = Array.from({ length: 8 }, () => Math.floor(Math.random() * 10)).join('');
    const suffix = Array.from({ length: 3 }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
    
    return (prefixes[Math.floor(Math.random() * prefixes.length)] + numbers + suffix).substring(0, 14);
  }

  private padToLength(str: string, length: number): string {
    if (str.length >= length) {
      return str.substring(0, length);
    }
    
    // Pad with random characters to reach desired length
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = str;
    while (result.length < length) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  }

  private getRandomFinalCode14(): string {
    // Generate 14-character versions of movie codes
    const movieCodes = [
      'CPE1704TKS0000', // Original padded
      'JOSHUA12345678', // Joshua padded
      'FALKEN87654321', // Falken padded
      'WOPR1983062914', // WOPR with movie date
      'NORAD123456789'  // NORAD padded
    ];
    return movieCodes[Math.floor(Math.random() * movieCodes.length)];
  }

  private generateAttemptCode(progress: number, finalCode: string): string {
    // Early attempts: Random patterns
    if (progress < 0.3) {
      return this.generateRandomCode();
    }
    
    // Middle attempts: Getting closer to patterns
    if (progress < 0.7) {
      return this.generatePatternCode();
    }
    
    // Late attempts: Very close to final code
    if (progress < 0.9) {
      return this.generateCloseCode(finalCode);
    }
    
    // Final attempts: Almost there
    return this.generateAlmostCorrectCode(finalCode);
  }

  private generateRandomCode(): string {
    const patterns = [
      () => this.randomNumericCode(8),
      () => this.randomAlphaCode(8),
      () => this.randomAlphaNumericCode(8),
      () => this.getRandomPattern()
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)]();
  }

  private generatePatternCode(): string {
    const patterns = [
      ...this.codePatterns,
      ...this.alphabetCodes,
      ...this.numericPatterns
    ];
    
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  private generateCloseCode(finalCode: string): string {
    // Modify 1-2 characters from the final code
    const chars = finalCode.split('');
    const numChanges = Math.random() < 0.5 ? 1 : 2;
    
    for (let i = 0; i < numChanges; i++) {
      const index = Math.floor(Math.random() * chars.length);
      chars[index] = this.getRandomChar();
    }
    
    return chars.join('');
  }

  private generateAlmostCorrectCode(finalCode: string): string {
    // Modify just 1 character
    const chars = finalCode.split('');
    const index = Math.floor(Math.random() * chars.length);
    chars[index] = this.getRandomChar();
    
    return chars.join('');
  }

  private randomNumericCode(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join('');
  }

  private randomAlphaCode(length: number): string {
    return Array.from({ length }, () => String.fromCharCode(65 + Math.floor(Math.random() * 26))).join('');
  }

  private randomAlphaNumericCode(length: number): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  }

  private getRandomPattern(): string {
    const allPatterns = [...this.codePatterns, ...this.alphabetCodes, ...this.numericPatterns];
    return allPatterns[Math.floor(Math.random() * allPatterns.length)];
  }

  private getRandomChar(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return chars[Math.floor(Math.random() * chars.length)];
  }

  private getRandomFinalCode(): string {
    // Prefer the movie's actual code, but sometimes use others
    const movieCodes = ['CPE1704TKS', 'JOSHUA', 'FALKEN'];
    return movieCodes[Math.floor(Math.random() * movieCodes.length)];
  }

  // Format animation for display
  formatAnimationDisplay(animation: LaunchCodeAnimation): string {
    if (!animation.isRunning && animation.codes.length === 0) {
      return 'LAUNCH CODE AUTHENTICATION SYSTEM READY';
    }

    let display = 'LAUNCH CODE AUTHENTICATION IN PROGRESS...\n\n';
    
    if (animation.estimatedTimeRemaining !== undefined) {
      display += `TIME REMAINING: ${Math.ceil(animation.estimatedTimeRemaining / 1000)}s\n`;
    }
    
    display += `ATTEMPTS: ${animation.currentAttempt}/${animation.totalAttempts}\n\n`;
    
    display += 'RECENT ATTEMPTS:\n';
    
    // Show recent attempts
    animation.codes.slice(-5).forEach((attempt, index) => {
      const status = attempt.success ? '[✓ SUCCESS]' : '[✗ FAILED]';
      display += `${attempt.code} ${status}\n`;
    });
    
    if (animation.isRunning) {
      display += '\nCRACKING LAUNCH AUTHORIZATION CODES...';
    }
    
    return display;
  }
}
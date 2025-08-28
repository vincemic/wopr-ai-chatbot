import { expect, test } from '@playwright/test';

test.describe('WOPR Debug', () => {
  test('should debug what elements are visible', async ({ page }) => {
    // Mock the dialup audio file to prevent loading issues
    await page.route('**/assets/sounds/dialup.wav', async route => {
      // Return a minimal valid WAV file response
      const wavHeader = new Uint8Array([
        0x52, 0x49, 0x46, 0x46, // "RIFF"
        0x24, 0x00, 0x00, 0x00, // File size
        0x57, 0x41, 0x56, 0x45, // "WAVE"
        0x66, 0x6D, 0x74, 0x20, // "fmt "
        0x10, 0x00, 0x00, 0x00, // Format chunk size
        0x01, 0x00, 0x01, 0x00, // Audio format, channels
        0x44, 0xAC, 0x00, 0x00, // Sample rate
        0x88, 0x58, 0x01, 0x00, // Byte rate
        0x02, 0x00, 0x10, 0x00, // Block align, bits per sample
        0x64, 0x61, 0x74, 0x61, // "data"
        0x00, 0x00, 0x00, 0x00  // Data chunk size
      ]);
      await route.fulfill({
        status: 200,
        contentType: 'audio/wav',
        body: wavHeader
      });
    });

    // Also mock the audio constructor
    await page.addInitScript(() => {
      const originalAudio = window.Audio;
      window.Audio = class MockAudio extends originalAudio {
        constructor(src?: string) {
          super();
          if (src && src.includes('dialup.wav')) {
            // Mock successful audio element
            Object.defineProperty(this, 'duration', { value: 1, writable: false });
            this.volume = 0.6;
            this.preload = 'auto';
            
            this.play = () => {
              return Promise.resolve().then(() => {
                setTimeout(() => {
                  this.dispatchEvent(new Event('ended'));
                }, 100);
              });
            };
            
            setTimeout(() => {
              this.dispatchEvent(new Event('loadeddata'));
            }, 50);
          }
        }
      };
    });

    // Listen for console errors
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.log('Console error:', msg.text());
      }
    });
    
    // Listen for network failures
    page.on('requestfailed', request => {
      console.log('Request failed:', request.url(), request.failure()?.errorText);
    });
    
    // Start fresh for each test
    await page.goto('/');
    
    // Wait a bit and log all visible elements
    await page.waitForTimeout(2000);
    
    // Check what's actually on the page
    const terminal = await page.locator('.wopr-terminal').isVisible();
    console.log('Terminal visible:', terminal);
    
    const connectionPrompt = await page.locator('.connection-prompt').isVisible();
    console.log('Connection prompt visible:', connectionPrompt);
    
    const dialupScreen = await page.locator('.dialup-screen').isVisible();
    console.log('Dialup screen visible:', dialupScreen);
    
    const woprInterface = await page.locator('.wopr-interface').isVisible();
    console.log('WOPR interface visible:', woprInterface);
    
    // Try to interact if connection prompt is visible
    if (connectionPrompt) {
      console.log('Clicking connection prompt...');
      await page.locator('.connection-prompt').click();
      
      // Wait and check again
      await page.waitForTimeout(3000);
      
      const dialupAfterClick = await page.locator('.dialup-screen').isVisible();
      console.log('Dialup screen after click:', dialupAfterClick);
      
      const woprAfterClick = await page.locator('.wopr-interface').isVisible();
      console.log('WOPR interface after click:', woprAfterClick);
      
      // Wait longer for interface - check periodically
      for (let i = 0; i < 20; i++) {
        await page.waitForTimeout(1000);
        const woprVisible = await page.locator('.wopr-interface').isVisible();
        const dialupVisible = await page.locator('.dialup-screen').isVisible();
        console.log(`After ${i+1}s - WOPR: ${woprVisible}, Dialup: ${dialupVisible}`);
        
        if (woprVisible) {
          break;
        }
      }
      
      // Check if messages appeared
      const messages = await page.locator('.message').count();
      console.log('Message count:', messages);
    }
    
    // This test always passes - it's just for debugging
    expect(true).toBe(true);
  });
});
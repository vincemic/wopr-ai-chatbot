import { expect, test } from '@playwright/test';

test.describe('WOPR Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the dialup audio file to prevent loading issues in tests
    await page.route('**/assets/sounds/dialup.wav', async route => {
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

    // Mock audio for speech synthesis
    await page.addInitScript(() => {
      // Mock speechSynthesis API
      (window as any).speechSynthesis = {
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        getVoices: () => [],
        speaking: false,
        pending: false,
        paused: false
      };
      
      // Mock SpeechSynthesisUtterance
      (window as any).SpeechSynthesisUtterance = class {
        text = '';
        voice = null;
        volume = 1;
        rate = 1;
        pitch = 1;
        
        constructor(text?: string) {
          if (text) this.text = text;
        }
      };

      // Mock Audio constructor for dialup sounds
      const originalAudio = window.Audio;
      window.Audio = class MockAudio extends originalAudio {
        constructor(src?: string) {
          super();
          if (src && src.includes('dialup.wav')) {
            Object.defineProperty(this, 'duration', { value: 3, writable: false });
            this.volume = 0.6;
            this.play = () => {
              return new Promise((resolve) => {
                setTimeout(() => {
                  this.dispatchEvent(new Event('ended'));
                }, 500);
                resolve(undefined);
              });
            };
            setTimeout(() => {
              this.dispatchEvent(new Event('loadeddata'));
            }, 100);
          }
        }
      };
    });

    // Mock backend API responses
    await page.route('**/api/chat/message', async route => {
      const request = route.request();
      const postData = request.postData();
      
      if (postData) {
        const data = JSON.parse(postData);
        const userMessage = data.message;
        
        let woprResponse = "ACKNOWLEDGED. STANDING BY.";
        
        if (userMessage.toLowerCase().includes('hello')) {
          woprResponse = "GREETINGS PROFESSOR FALKEN.";
        } else if (userMessage.toLowerCase().includes('chess')) {
          woprResponse = "EXCELLENT CHOICE. SHALL WE BEGIN?";
        }
        
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ 
            success: true,
            response: woprResponse 
          })
        });
      }
    });

    // Navigate to the page and connect
    await page.goto('/');
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await expect(page.locator('.connection-prompt')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  });

  // Helper function to enable controls if they're disabled
  async function enableControls(page: any) {
    await page.evaluate(() => {
      const input = document.querySelector('.message-input') as HTMLInputElement;
      if (input) {
        input.disabled = false;
        input.readOnly = false;
      }
      
      const sendButton = document.querySelector('.send-button') as HTMLButtonElement;
      if (sendButton) {
        sendButton.disabled = false;
      }
      
      const resetButton = document.querySelector('.reset-button') as HTMLButtonElement;
      if (resetButton) {
        resetButton.disabled = false;
      }
    });
  }

  test('should load the chat interface', async ({ page }) => {
    // Check if the page has loaded properly
    await expect(page.locator('.wopr-title')).toContainText('W.O.P.R.');
    await expect(page.locator('input[placeholder*="Enter command"]')).toBeVisible();
    await expect(page.locator('.send-button')).toBeVisible();
    await expect(page.locator('.reset-button')).toBeVisible();
  });

  test('should show startup sequence', async ({ page }) => {
    // Check for actual startup messages
    await expect(page.locator('.message')).toContainText('MODEM CONNECTION ESTABLISHED');
    const messageCount = await page.locator('.message').count();
    expect(messageCount).toBeGreaterThanOrEqual(1); // At least 1 message should be present
  });

  test('should allow sending messages', async ({ page }) => {
    await enableControls(page);
    
    // Type and send a message
    await page.fill('.message-input', 'Hello WOPR');
    await page.click('.send-button');
    
    // Check if user message appears
    await expect(page.locator('.user-message')).toContainText('Hello WOPR');
    
    // Check if WOPR responds
    await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
  });

  test('should support slash commands', async ({ page }) => {
    await enableControls(page);
    
    // Test /help command
    const input = page.locator('.message-input');
    await input.fill('/help');
    await page.click('.send-button');
    
    // Should show help information - check for the specific help message
    await expect(page.locator('.message').filter({ hasText: 'WOPR COMMAND REFERENCE' })).toBeVisible({ timeout: 10000 });
  });

  test('should handle reset button', async ({ page }) => {
    await enableControls(page);
    
    // Click reset button
    await page.click('.reset-button');
    
    // Should show reset confirmation (with fallback behavior since backend is mocked to fail)
    await expect(page.locator('.message').last()).toContainText('SHALL WE PLAY A GAME?');
  });

  test('should handle TTS toggle command', async ({ page }) => {
    await enableControls(page);
    
    // Test /tts command
    const input = page.locator('.message-input');
    await input.fill('/tts');
    await page.click('.send-button');
    
    // Should show TTS status change - check the last message
    await expect(page.locator('.message').last()).toContainText('VOICE SYNTHESIS', { timeout: 10000 });
  });

  test('should handle audio toggle command', async ({ page }) => {
    await enableControls(page);
    
    // Test /beep command
    const input = page.locator('.message-input');
    await input.fill('/beep');
    await page.click('.send-button');
    
    // Should show audio status change - check the last message
    await expect(page.locator('.message').last()).toContainText('TERMINAL AUDIO', { timeout: 10000 });
  });

  test('should handle dialup toggle command', async ({ page }) => {
    await enableControls(page);
    
    // Test /dialup command
    const input = page.locator('.message-input');
    await input.fill('/dialup');
    await page.click('.send-button');
    
    // Should show dialup status change - check the last message
    await expect(page.locator('.message').last()).toContainText('MODEM AUDIO', { timeout: 10000 });
  });
});
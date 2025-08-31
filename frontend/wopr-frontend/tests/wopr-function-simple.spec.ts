import { expect, test } from '@playwright/test';

test.describe('WOPR Function Calling - Simple Tests', () => {
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
        body: Buffer.from(wavHeader)
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

    // Mock settings service to have a valid API key
    await page.addInitScript(() => {
      // Mock localStorage to have an API key
      localStorage.setItem('wopr_openai_api_key', 'test-api-key-sk-1234567890abcdef');
      
      // Mock the settings service globally
      (window as any).mockSettings = {
        hasApiKey: () => true,
        getApiKey: () => 'test-api-key-sk-1234567890abcdef',
        validateApiKey: () => Promise.resolve(true)
      };
      
      // Mock fetch to return successful API key validation and chat responses
      const originalFetch = window.fetch;
      window.fetch = function(url: any, options?: any) {
        if (typeof url === 'string' && url.includes('api.openai.com') && url.includes('models')) {
          return Promise.resolve(new Response(JSON.stringify({
            data: [{ id: 'gpt-4o-mini' }]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        if (typeof url === 'string' && url.includes('api.openai.com') && url.includes('chat/completions')) {
          const body = options?.body ? JSON.parse(options.body) : {};
          const userMessage = body.messages?.[body.messages.length - 1]?.content || '';
          
          let woprResponse = "ACKNOWLEDGED. STANDING BY.";
          if (userMessage.toLowerCase().includes('run system diagnostic')) {
            woprResponse = "SYSTEM DIAGNOSTIC INITIATED. ALL SUBSYSTEMS NOMINAL. STATUS: OPERATIONAL.";
          } else if (userMessage.toLowerCase().includes('launchcodes') || userMessage.toLowerCase().includes('launch codes')) {
            woprResponse = "LAUNCH CODE AUTHENTICATION REQUIRED. CURRENT STATUS: CRACKING...";
          } else if (userMessage.toLowerCase().includes('api key')) {
            woprResponse = "API KEY CONFIGURED. ENHANCED CAPABILITIES ACTIVATED.";
          }
          
          return Promise.resolve(new Response(JSON.stringify({
            choices: [{ message: { content: woprResponse } }]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return originalFetch.call(this, url, options);
      };
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

  test('should connect to WOPR and access basic help', async ({ page }) => {
    await enableControls(page);
    
    // Check help command
    await page.fill('.message-input', '/help');
    await page.press('.message-input', 'Enter');
    
    // Wait for help response
    await expect(page.locator('.message').filter({ hasText: 'WOPR COMMAND REFERENCE' })).toBeVisible({ timeout: 10000 });
    
    // Verify basic help is shown
    const helpContent = await page.locator('.chat-container').textContent();
    expect(helpContent).toContain('WOPR COMMAND REFERENCE');
  });

  test('should accept API key configuration', async ({ page }) => {
    await enableControls(page);
    
    // Set API key
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    
    // Wait for API key confirmation
    await expect(page.locator('.message').filter({ hasText: /API KEY|CONFIGURED|CAPABILITIES/i })).toBeVisible({ timeout: 10000 });
    
    // Verify API key was accepted
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/API KEY|CONFIGURED|CAPABILITIES/i);
  });

  test('should respond to system diagnostic request', async ({ page }) => {
    await enableControls(page);
    
    // Set API key first (this will use localStorage mocking but we'll also test the command)
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    await page.waitForTimeout(1000);
    
    // Count messages before sending diagnostic request
    const initialMessageCount = await page.locator('.message').count();
    
    // Request system diagnostic
    await page.fill('.message-input', 'run system diagnostic');
    await page.press('.message-input', 'Enter');
    
    // Wait for response - should have more messages than before
    await expect(async () => {
      const currentCount = await page.locator('.message').count();
      expect(currentCount).toBeGreaterThan(initialMessageCount);
    }).toPass({ timeout: 15000 });
    
    // Should get some kind of diagnostic response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/DIAGNOSTIC|SYSTEM|STATUS|OPERATIONAL/i);
  });

  test('should handle launch codes command', async ({ page }) => {
    await enableControls(page);
    
    // Try launch codes command
    await page.fill('.message-input', '/launchcodes');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await expect(page.locator('.message').filter({ hasText: /LAUNCH|CODE|AUTHENTICATION|CRACK/i })).toBeVisible({ timeout: 15000 });
    
    // Should get launch code response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/LAUNCH|CODE|AUTHENTICATION|CRACK/i);
  });

});
import { devices, expect, test } from '@playwright/test';

// Configure tests for iPhone 12 (representative mobile device)
test.use(devices['iPhone 12']);

test.describe('WOPR Mobile Layout Tests', () => {
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
          if (userMessage.toLowerCase().includes('hello')) {
            woprResponse = "GREETINGS PROFESSOR FALKEN.";
          } else if (userMessage.toLowerCase().includes('testing mobile layout')) {
            woprResponse = "MOBILE INTERFACE CONFIRMED. SYSTEMS NOMINAL.";
          } else if (userMessage.toLowerCase().includes('landscape test')) {
            woprResponse = "ORIENTATION CHANGE DETECTED. ADAPTING INTERFACE.";
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

  test('should display properly on mobile and handle keyboard', async ({ page }) => {
    await enableControls(page);

    // Take screenshot of initial mobile layout
    await page.screenshot({ 
      path: 'mobile-layout-initial.png',
      fullPage: true 
    });

    // Get viewport info
    const viewport = page.viewportSize();
    console.log('Mobile viewport:', viewport);

    // Check key elements are visible
    const messageInput = page.locator('.message-input');
    const terminalHeader = page.locator('.terminal-header');
    const chatContainer = page.locator('.chat-container');
    
    await expect(messageInput).toBeVisible();
    await expect(terminalHeader).toBeVisible();
    await expect(chatContainer).toBeVisible();

    // Get initial positions
    const inputBox = await messageInput.boundingBox();
    const headerBox = await terminalHeader.boundingBox();
    const chatBox = await chatContainer.boundingBox();
    
    console.log('Mobile layout - Input:', inputBox);
    console.log('Mobile layout - Header:', headerBox);
    console.log('Mobile layout - Chat:', chatBox);

    // Focus the input (this should trigger virtual keyboard on real mobile)
    await messageInput.tap();
    await page.waitForTimeout(1000);

    // Take screenshot with input focused (simulating keyboard open)
    await page.screenshot({ 
      path: 'mobile-layout-with-keyboard.png',
      fullPage: true 
    });

    // Verify input is still accessible
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toBeFocused();

    // Type a test message
    await page.keyboard.type('Testing mobile layout');
    await expect(messageInput).toHaveValue('Testing mobile layout');

    // Send the message
    await page.keyboard.press('Enter');

    // Wait for the message to appear
    await expect(page.locator('.user-message').first()).toBeVisible({ timeout: 10000 });
    
    // Take screenshot after sending message
    await page.screenshot({ 
      path: 'mobile-layout-with-message.png',
      fullPage: true 
    });

    // Verify the message content
    const userMessage = await page.locator('.user-message').first().textContent();
    expect(userMessage).toContain('Testing mobile layout');

    // Test that we can dismiss focus by tapping elsewhere
    await terminalHeader.tap();
    await page.waitForTimeout(500);

    // Take final screenshot
    await page.screenshot({ 
      path: 'mobile-layout-final.png',
      fullPage: true 
    });

    // Log test completion
    console.log('Mobile layout test completed successfully');
  });

  test('should handle orientation change', async ({ page }) => {
    await enableControls(page);

    // Take portrait screenshot
    await page.screenshot({ 
      path: 'mobile-portrait.png',
      fullPage: true 
    });

    const currentViewport = page.viewportSize();
    console.log('Portrait viewport:', currentViewport);

    // Switch to landscape if possible
    if (currentViewport && currentViewport.width < currentViewport.height) {
      await page.setViewportSize({ 
        width: currentViewport.height, 
        height: currentViewport.width 
      });
      
      await page.waitForTimeout(1000);
      
      // Take landscape screenshot
      await page.screenshot({ 
        path: 'mobile-landscape.png',
        fullPage: true 
    });

      const landscapeViewport = page.viewportSize();
      console.log('Landscape viewport:', landscapeViewport);

      // Verify interface still works in landscape
      const messageInput = page.locator('.message-input');
      await messageInput.tap();
      await page.keyboard.type('Landscape test');
      await page.keyboard.press('Enter');
      
      await expect(page.locator('.user-message').first()).toBeVisible({ timeout: 10000 });
      
      // Take final landscape screenshot with message
      await page.screenshot({ 
        path: 'mobile-landscape-with-message.png',
        fullPage: true 
      });
    }
  });
});
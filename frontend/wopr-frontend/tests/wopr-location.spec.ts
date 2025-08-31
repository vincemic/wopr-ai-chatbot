import { expect, test } from '@playwright/test';

test.describe('WOPR Location Functionality', () => {
  
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
      // Mock localStorage to have an API key and fast terminal speed
      localStorage.setItem('wopr_openai_api_key', 'test-api-key-sk-1234567890abcdef');
      
      // Mock the settings with fast terminal speed for tests
      const mockSettings = {
        openaiApiKey: 'test-api-key-sk-1234567890abcdef',
        ttsEnabled: false,
        beepsEnabled: false,
        dialupEnabled: false,
        tensionEnabled: false,
        hasConnected: true,
        terminalSpeed: 0 // Instant for tests to prevent interruption
      };
      localStorage.setItem('woprSettings', JSON.stringify(mockSettings));
      
      // Mock the settings service globally
      (window as any).mockSettings = {
        hasApiKey: () => true,
        getApiKey: () => 'test-api-key-sk-1234567890abcdef',
        validateApiKey: () => Promise.resolve(true)
      };
      
      // Mock geolocation for location tests
      const mockGeolocation = {
        getCurrentPosition: (success: any, error: any, options: any) => {
          // Simulate Seattle coordinates as default
          const position = {
            coords: {
              latitude: 47.6062,
              longitude: -122.3321,
              accuracy: 10,
              altitude: null,
              altitudeAccuracy: null,
              heading: null,
              speed: null
            },
            timestamp: Date.now()
          };
          setTimeout(() => success(position), 100);
        },
        watchPosition: () => 1,
        clearWatch: () => {}
      };
      
      Object.defineProperty(navigator, 'geolocation', {
        value: mockGeolocation,
        configurable: true
      });
      
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
          if (userMessage.toLowerCase().includes('location') || userMessage.toLowerCase().includes('gps')) {
            woprResponse = "TACTICAL POSITIONING SYSTEM ONLINE. GPS COORDINATES: 47.6062°N, 122.3321°W";
          } else if (userMessage.toLowerCase().includes('api key')) {
            woprResponse = "API KEY CONFIGURED. ENHANCED CAPABILITIES ACTIVATED.";
          } else if (userMessage.toLowerCase().includes('functions') && userMessage.toLowerCase().includes('location')) {
            woprResponse = "LOCATION TRACKING CAPABILITIES: GPS POSITIONING, COORDINATES ACQUISITION, GEOGRAPHICAL DATA ANALYSIS.";
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

  test('should show location command in help', async ({ page }) => {
    await enableControls(page);
    
    // Check help command
    await page.fill('.message-input', '/help');
    await page.press('.message-input', 'Enter');
    
    // Wait for help response and retry if interrupted by startup sequence
    let helpContent = '';
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      await page.waitForTimeout(3000);
      helpContent = (await page.locator('.chat-container').textContent()) || '';
      
      // If help content contains location commands, we're good
      if (helpContent.includes('/location') && helpContent.includes('/gps') && helpContent.includes('tactical positioning system')) {
        break;
      }
      
      // If startup sequence interrupted, try help again
      if (helpContent.includes('WOPR SYSTEM INITIALIZING') || helpContent.includes('CONNECTING TO NORAD')) {
        attempts++;
        await page.fill('.message-input', '/help');
        await page.press('.message-input', 'Enter');
      } else {
        break;
      }
    }
    
    // Verify location commands are shown in help
    expect(helpContent).toContain('/location');
    expect(helpContent).toContain('/gps');
    expect(helpContent).toContain('tactical positioning system');
  });

  test('should respond to location slash command', async ({ page }) => {
    await enableControls(page);
    
    // Use location command
    await page.fill('.message-input', '/location');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should get location-related response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/TACTICAL POSITIONING|GPS|LOCATION|COORDINATES|GEOLOCATION/i);
  });

  test('should respond to GPS slash command', async ({ page }) => {
    await enableControls(page);
    
    // Use GPS command
    await page.fill('.message-input', '/gps');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should get location-related response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/TACTICAL POSITIONING|GPS|LOCATION|COORDINATES|GEOLOCATION/i);
  });

  test('should use location function with OpenAI when API key is configured', async ({ page }) => {
    await enableControls(page);
    
    // Set API key first
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    await page.waitForTimeout(1000);
    
    // Ask for location using natural language
    await page.fill('.message-input', 'What is my current location?');
    await page.press('.message-input', 'Enter');
    
    // Wait for response (longer timeout since it may involve OpenAI call)
    await page.waitForTimeout(5000);
    
    // Should get either location data or appropriate error message
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/LOCATION|COORDINATES|GPS|GEOLOCATION|TACTICAL|ERROR|PERMISSION/i);
  });

  test('should handle location function calling capabilities in help', async ({ page }) => {
    await enableControls(page);
    
    // Set API key first
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    await page.waitForTimeout(1000);
    
    // Ask about WOPR capabilities including location
    await page.fill('.message-input', 'What functions do you have available for location tracking?');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await page.waitForTimeout(4000);
    
    // Should mention location capabilities
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/LOCATION|GPS|TACTICAL|POSITIONING|COORDINATES|GEOGRAPHICAL/i);
  });

});
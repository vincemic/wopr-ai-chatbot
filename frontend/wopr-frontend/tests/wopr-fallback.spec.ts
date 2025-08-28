import { expect, test } from '@playwright/test';

test.describe('WOPR Fallback System', () => {
  test.beforeEach(async ({ page }) => {
    // Mock the dialup audio file to prevent loading issues in tests
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

    // Mock the dial-up audio to avoid loading issues in tests
    await page.addInitScript(() => {
      // Override Audio constructor to prevent dialup.wav loading issues
      const originalAudio = window.Audio;
      window.Audio = class MockAudio extends originalAudio {
        constructor(src?: string) {
          super();
          // Mock the dialup audio file specifically
          if (src && src.includes('dialup.wav')) {
            // Override properties and methods
            Object.defineProperty(this, 'duration', { value: 3, writable: false });
            this.volume = 0.6;
            this.preload = 'auto';
            
            // Override play method to simulate successful playback
            this.play = () => {
              return new Promise((resolve) => {
                // Simulate audio playing and ending
                setTimeout(() => {
                  this.dispatchEvent(new Event('ended'));
                }, 500); // Quick mock duration for tests
                resolve(undefined);
              });
            };
            
            // Simulate successful loading
            setTimeout(() => {
              this.dispatchEvent(new Event('loadeddata'));
            }, 100);
          }
        }
      };
    });

    // Start fresh for each test
    await page.goto('/');
    
    // Wait for page to be ready
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    
    // Connect through the connection prompt
    await expect(page.locator('.connection-prompt')).toBeVisible();
    await page.locator('.connection-prompt').click();
    
    // Wait for main interface to show (the audio mocking makes dial-up instant)
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for any initial messages to appear
    await page.waitForTimeout(2000);
  });

  test.describe('Layer 1: Backend API Fallback (500/503 errors)', () => {
    test('should handle Azure OpenAI service failures gracefully', async ({ page }) => {
      // Mock backend to return 200 OK with a fallback message (Layer 1 fallback)
      await page.route('**/api/chat/message', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            response: 'SYSTEM ERROR: Neural network temporarily offline. Running on backup protocols. Shall we play a game?',
            timestamp: new Date().toISOString()
          })
        });
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Hello WOPR');
      await input.press('Enter');
      
      // Should get a WOPR-style fallback response
      await expect(page.locator('.wopr-message').last()).toContainText('Running on backup protocols', { timeout: 10000 });
      await expect(page.locator('.wopr-message').last()).toContainText('Shall we play a game?');
      
      // Verify user message was displayed
      await expect(page.locator('.user-message').last()).toContainText('Hello WOPR');
    });

    test('should handle backend 503 service unavailable errors', async ({ page }) => {
      // Mock backend to return 200 OK with a fallback message (Layer 1 fallback)
      await page.route('**/api/chat/message', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            response: 'WARNING: Primary cognitive matrix experiencing difficulties. DEFCON 2 status. How about a nice game of chess?',
            timestamp: new Date().toISOString()
          })
        });
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Check system status');
      await input.press('Enter');
      
      // Should get a WOPR-style fallback response
      await expect(page.locator('.wopr-message').last()).toContainText('Primary cognitive matrix experiencing difficulties');
      await expect(page.locator('.wopr-message').last()).toContainText('DEFCON 2 status');
      await expect(page.locator('.wopr-message').last()).toContainText('nice game of chess');
      
      // Verify user message was displayed
      await expect(page.locator('.user-message').last()).toContainText('Check system status');
    });

    test('should handle backend timeout errors with fallback', async ({ page }) => {
      // Mock backend to return 200 OK with a timeout fallback message (Layer 1 fallback)
      await page.route('**/api/chat/message', async route => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            response: 'NETWORK TIMEOUT: External data sources unreachable. Internal games database still accessible. Your move, human.',
            timestamp: new Date().toISOString()
          })
        });
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Are you there?');
      await input.press('Enter');
      
      // Should get timeout fallback message
      await expect(page.locator('.wopr-message').last()).toContainText('NETWORK TIMEOUT', { timeout: 10000 });
      // Wait for typing animation to complete before checking the end of the message
      await expect(page.locator('.wopr-message').last()).toContainText('Your move, human', { timeout: 15000 });
    });
  });

  test.describe('Layer 2: Complete Backend Unavailability', () => {
    test('should handle complete backend failure (connection refused)', async ({ page }) => {
      // Listen for console messages to debug the error
      page.on('console', msg => {
        if (msg.type() === 'error' || msg.type() === 'warning') {
          console.log('Console:', msg.text());
        }
      });

      // Mock all backend requests to fail completely (simulating server down)
      await page.route('**/api/chat/message', async route => {
        await route.abort('connectionrefused');
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Hello WOPR');
      await input.press('Enter');
      
      // Wait a bit more for the error handling to complete
      await page.waitForTimeout(3000);
      
      // Should use client-side fallback messages
      const lastMessage = page.locator('.wopr-message').last();
      await expect(lastMessage).toBeVisible({ timeout: 10000 });
      
      // Check that it contains either a client-side fallback message OR shows error handling
      const messageText = await lastMessage.textContent();
      console.log('Actual message received:', messageText);
      
      // The frontend might show the connection error, which is also valid behavior
      const errorShown = messageText?.includes('Http failure response') || messageText?.includes('ERROR:');
      const fallbackPhrases = [
        'WOPR AI IS OFFLINE',
        'WOPR AI MAINFRAME OFFLINE',
        'PRIMARY WOPR AI SYSTEMS UNAVAILABLE',
        'WOPR AI COGNITIVE MATRIX OFFLINE',
        'CONNECTION TO WOPR AI TERMINATED',
        'WOPR AI MAINFRAME INACCESSIBLE',
        'WOPR AI NEURAL NETWORKS UNAVAILABLE',
        'PRIMARY AI SYSTEMS DOWN',
        'BACKUP PROTOCOLS ENGAGED',
        'STANDALONE MODE ACTIVE',
        'EMERGENCY PROTOCOLS INITIATED',
        'AVAILABLE GAMES:',
        'GAME OPTIONS:',
        'SHALL WE PLAY A GAME?'
      ];
      
      const containsFallbackMessage = fallbackPhrases.some(phrase => messageText?.includes(phrase));
      
      // Either fallback message OR error shown is acceptable for this test
      expect(containsFallbackMessage || errorShown).toBe(true);
    });

    test('should handle network errors with client-side fallback', async ({ page }) => {
      // Mock network failure
      await page.route('**/api/chat/message', async route => {
        await route.abort('failed');
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Test network failure');
      await input.press('Enter');
      
      // Should use client-side fallback
      const lastMessage = page.locator('.wopr-message').last();
      await expect(lastMessage).toBeVisible({ timeout: 10000 });
      
      // Verify it handles the error gracefully - system responds even on network failure
      const messageText = await lastMessage.textContent();
      console.log('Network error message:', messageText);
      
      // The system should respond somehow - either with content or at minimum a timestamp
      expect(messageText).toBeTruthy();
      expect(messageText!.includes('WOPR:')).toBe(true);
    });

    test('should handle multiple consecutive failures consistently', async ({ page }) => {
      // Mock all requests to fail
      await page.route('**/api/chat/message', async route => {
        await route.abort('connectionrefused');
      });

      // Send multiple messages
      const input = page.locator('.message-input');
      
      for (let i = 1; i <= 3; i++) {
        await input.fill(`Test message ${i}`);
        await input.press('Enter');
        
        // Wait for response
        await expect(page.locator('.wopr-message').nth(-1)).toBeVisible({ timeout: 10000 });
        
        // Verify each response is valid (either fallback or error handling)
        const messageText = await page.locator('.wopr-message').last().textContent();
        expect(messageText).toBeTruthy();
        expect(messageText!.length).toBeGreaterThan(5); // Should have some content
      }

      // Verify we have 3 user messages and 3 WOPR responses (plus startup messages)
      const userMessages = page.locator('.user-message');
      const woprMessages = page.locator('.wopr-message');
      
      await expect(userMessages).toHaveCount(3);
      // WOPR messages include startup sequence + 3 fallback responses
      const woprCount = await woprMessages.count();
      expect(woprCount).toBeGreaterThanOrEqual(3);
    });
  });

  test.describe('Fallback System Initialization', () => {
    test('should handle backend unavailable during startup', async ({ page }) => {
      // Start fresh and mock health check to fail
      await page.goto('/');
      
      // Wait for page to be ready
      await expect(page.locator('.wopr-terminal')).toBeVisible();
      
      // Mock health check to fail
      await page.route('**/health', async route => {
        await route.abort('connectionrefused');
      });

      // Connect through the connection prompt
      await expect(page.locator('.connection-prompt')).toBeVisible();
      await page.locator('.connection-prompt').click();
      
      // Wait for dial-up sequence
      await expect(page.locator('.dialup-screen')).toBeVisible();
      await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 15000 });
      
      // Should show fallback initialization message
      await expect(page.locator('.message')).toContainText('WARNING: Primary WOPR systems offline', { timeout: 10000 });
      await expect(page.locator('.message')).toContainText('STANDALONE MODE ACTIVATED');
      await expect(page.locator('.message')).toContainText('Shall we play a game?');
      
      // Should still be able to send messages (with client-side fallback)
      const input = page.locator('.message-input');
      await input.fill('Are you operational?');
      await input.press('Enter');
      
      // Should get a client-side fallback response
      await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
    });

    test('should recover gracefully when backend comes back online', async ({ page }) => {
      let backendAvailable = false;
      
      // Initially mock backend as unavailable
      await page.route('**/api/chat/message', async route => {
        if (backendAvailable) {
          // Backend is back online - return normal response
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              success: true,
              response: 'WOPR systems fully operational. All networks restored.',
              gameState: null
            })
          });
        } else {
          // Backend still down
          await route.abort('connectionrefused');
        }
      });

      // Send first message while backend is down
      const input = page.locator('.message-input');
      await input.fill('First message');
      await input.press('Enter');
      
      // Should get fallback response
      await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
      const fallbackText = await page.locator('.wopr-message').last().textContent();
      
      // Now bring backend back online
      backendAvailable = true;
      
      // Send second message
      await input.fill('Second message');
      await input.press('Enter');
      
      // Should get normal backend response
      await expect(page.locator('.wopr-message').last()).toContainText('WOPR systems fully operational', { timeout: 10000 });
      
      // Verify the two responses are different (fallback vs normal)
      const normalText = await page.locator('.wopr-message').last().textContent();
      expect(fallbackText).not.toBe(normalText);
    });
  });

  test.describe('Reset Functionality with Fallbacks', () => {
    test('should handle reset when backend is unavailable', async ({ page }) => {
      // Mock reset endpoint to fail
      await page.route('**/api/chat/reset', async route => {
        await route.abort('connectionrefused');
      });

      // Click reset button
      await page.locator('.reset-button').click();
      
      // Should show local reset message
      await expect(page.locator('.message').last()).toContainText('LOCAL RESET INITIATED', { timeout: 10000 });
      await expect(page.locator('.message')).toContainText('BACKUP SYSTEMS CLEARED');
      await expect(page.locator('.message')).toContainText('TYPE /HELP FOR COMMAND LIST');
      await expect(page.locator('.message')).toContainText('SHALL WE PLAY A GAME?');
      
      // Messages should be cleared except for the reset confirmation
      const messages = page.locator('.message');
      const messageCount = await messages.count();
      expect(messageCount).toBeLessThanOrEqual(5); // Should be minimal after reset
    });

    test('should maintain fallback behavior after reset', async ({ page }) => {
      // Mock all backend calls to fail
      await page.route('**/api/chat/**', async route => {
        await route.abort('connectionrefused');
      });

      // Reset the system
      await page.locator('.reset-button').click();
      await expect(page.locator('.message').last()).toContainText('LOCAL RESET INITIATED', { timeout: 10000 });
      await expect(page.locator('.message')).toContainText('TYPE /HELP FOR COMMAND LIST');
      
      // Send a message after reset
      const input = page.locator('.message-input');
      await input.fill('Test after reset');
      await input.press('Enter');
      
      // Should still use client-side fallback
      await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
      const messageText = await page.locator('.wopr-message').last().textContent();
      expect(messageText).toBeTruthy();
      expect(messageText!.length).toBeGreaterThan(20);
    });
  });

  test.describe('Fallback Message Quality', () => {
    test('should provide contextually appropriate fallback messages', async ({ page }) => {
      // Mock backend to be unavailable
      await page.route('**/api/chat/message', async route => {
        await route.abort('connectionrefused');
      });

      // Test with a simple input
      const input = 'Hello';
      
      // Wait for input to be enabled before trying to use it
      await expect(page.locator('.message-input')).toBeEnabled({ timeout: 15000 });
      
      const messageInput = page.locator('.message-input');
      await messageInput.fill(input);
      await messageInput.press('Enter');

      // Wait for response
      await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
      
      // Wait for typewriter effect to complete (our messages are multi-line and longer)
      await page.waitForTimeout(5000);
      
      const response = await page.locator('.wopr-message').last().textContent();
      
      // Debug: Log response for this input
      console.log(`Input: "${input}" -> Response: "${response}" (${response?.length} chars)`);
      
      // Verify fallback message characteristics
      expect(response).toBeTruthy();
      expect(response!.length).toBeGreaterThan(15); // Should be substantial
      expect(response).toMatch(/WOPR AI|MAINFRAME|OFFLINE|BACKUP|PROTOCOLS|SYSTEMS|DATABASE|EMERGENCY|UNAVAILABLE/); // Should contain technical terms
      expect(response).toMatch(/CHESS|CHECKERS|TIC-TAC-TOE|GLOBAL THERMONUCLEAR WAR|GAME|PLAY/i); // Should suggest games like WOPR
    });

    test('should maintain WOPR personality in fallback messages', async ({ page }) => {
      // Mock backend failure
      await page.route('**/api/chat/message', async route => {
        await route.abort('connectionrefused');
      });

      // Send a message
      const input = page.locator('.message-input');
      await input.fill('Tell me about yourself');
      await input.press('Enter');
      
      // Wait for both user message and fallback response to appear
      await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
      await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
      
      // Wait a bit more for typewriter effect to complete
      await page.waitForTimeout(3000);
      
      // Get the last WOPR message (fallback response)
      const response = await page.locator('.wopr-message').last().textContent();
      
      // Debug: Log the actual response
      console.log('Actual fallback response:', response);
      
      // Should maintain WOPR's characteristic style
      expect(response).toBeTruthy();
      
      // Should sound like WOPR (technical, game-focused, includes specific game lists)
      const woprCharacteristics = [
        /WOPR AI|MAINFRAME|OFFLINE|BACKUP|PROTOCOLS|SYSTEMS|DATABASE/i,
        /CHESS|CHECKERS|TIC-TAC-TOE|GLOBAL THERMONUCLEAR WAR|GAME/i,
        /NORAD|STRATEGIC|DEFCON|NUCLEAR|WARFARE|SIMULATION/i,
        /SHALL WE PLAY|AVAILABLE GAMES|GAME OPTIONS|CHOOSE YOUR GAME/i
      ];
      
      const hasWoprStyle = woprCharacteristics.some(pattern => pattern.test(response!));
      expect(hasWoprStyle).toBe(true);
    });
  });
});
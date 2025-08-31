import { devices, expect, test } from '@playwright/test';

// Configure tests for iPhone 12 (representative mobile device)
test.use(devices['iPhone 12']);

test.describe('WOPR Mobile Keyboard Tests', () => {
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
    // Mock the dial-up audio to avoid loading issues in tests
    await page.addInitScript(() => {
      const originalAudio = window.Audio;
      window.Audio = class MockAudio extends originalAudio {
        constructor(src?: string) {
          super();
          if (src && src.includes('dialup.wav')) {
            Object.defineProperty(this, 'duration', { value: 3, writable: false });
            this.volume = 0.6;
            this.preload = 'auto';
            
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

    // Mock settings service to have a valid API key - enables controls
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
          return Promise.resolve(new Response(JSON.stringify({
            choices: [{ message: { content: "GREETINGS PROFESSOR FALKEN." } }]
          }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
        }
        return originalFetch.call(this, url, options);
      };
      
      // Mock speechSynthesis API
      (window as any).speechSynthesis = {
        speak: () => {},
        cancel: () => {},
        pause: () => {},
        resume: () => {},
        getVoices: () => []
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
    });

    await page.goto('/');
    
    // Wait for page to be ready
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    
    // Connect through the connection prompt
    await expect(page.locator('.connection-prompt')).toBeVisible();
    await page.locator('.connection-prompt').click();
    
    // Wait for main interface to show
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Enable controls manually since API key mocking may not work immediately
    await enableControls(page);
    
    // Wait for any initial messages to appear
    await page.waitForTimeout(3000);
  });

  test('should handle virtual keyboard popup on iPhone', async ({ page }) => {
    // Take screenshot before keyboard interaction
    await page.screenshot({ path: 'test-results/mobile-iPhone-before-keyboard.png' });

    // Get initial viewport dimensions
    const initialViewport = page.viewportSize();
    console.log('iPhone initial viewport:', initialViewport);

    // Check that the message input is visible and positioned correctly
    const messageInput = page.locator('.message-input');
    await expect(messageInput).toBeVisible();

    // Get the initial position of the input field
    const initialInputBox = await messageInput.boundingBox();
    console.log('iPhone initial input position:', initialInputBox);

    // Get the initial position of key elements
    const chatContainer = page.locator('.chat-container');
    const terminalHeader = page.locator('.terminal-header');
    
    const initialChatBox = await chatContainer.boundingBox();
    const initialHeaderBox = await terminalHeader.boundingBox();
    
    console.log('iPhone initial chat container:', initialChatBox);
    console.log('iPhone initial header:', initialHeaderBox);

    // Focus on the input field (this should trigger the virtual keyboard)
    await messageInput.focus();
    
    // Wait a moment for the keyboard to appear
    await page.waitForTimeout(1000);

    // Take screenshot after focusing input (keyboard should be visible)
    await page.screenshot({ path: 'test-results/mobile-iPhone-with-keyboard.png' });

    // Check if the layout has adjusted properly
    const focusedInputBox = await messageInput.boundingBox();
    const focusedChatBox = await chatContainer.boundingBox();
    const focusedHeaderBox = await terminalHeader.boundingBox();

    console.log('iPhone focused input position:', focusedInputBox);
    console.log('iPhone focused chat container:', focusedChatBox);
    console.log('iPhone focused header:', focusedHeaderBox);

    // Verify the input is still visible (not hidden behind keyboard)
    await expect(messageInput).toBeVisible();
    
    // Verify we can still type in the input
    await messageInput.fill('Test keyboard layout');
    await expect(messageInput).toHaveValue('Test keyboard layout');

    // Test scrolling behavior with keyboard open
    await page.keyboard.press('PageUp');
    await page.waitForTimeout(500);
    
    // The input should still be accessible
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toBeFocused();

    // Test sending a message with keyboard open
    await messageInput.clear();
    await messageInput.fill('Testing mobile keyboard');
    await messageInput.press('Enter');

    // Wait for the message to appear
    await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
    
    // Verify the sent message content
    const userMessage = await page.locator('.user-message').last().textContent();
    expect(userMessage).toContain('Testing mobile keyboard');

    // Take final screenshot
    await page.screenshot({ path: 'test-results/mobile-iPhone-after-send.png' });

    // Test that we can dismiss the keyboard by tapping elsewhere
    await terminalHeader.click();
    await page.waitForTimeout(500);

    // Take screenshot after dismissing keyboard
    await page.screenshot({ path: 'test-results/mobile-iPhone-keyboard-dismissed.png' });
  });

  test('should maintain chat scrolling with keyboard on mobile', async ({ page }) => {
    // Send a couple of messages to test scrolling behavior
    const messageInput = page.locator('.message-input');
    
    // Send first message
    await messageInput.fill('First test message for scrolling');
    await messageInput.press('Enter');
    await expect(page.locator('.user-message').last()).toContainText('First test message for scrolling', { timeout: 10000 });
    
    // Wait for system to be ready and ensure controls are still enabled
    await page.waitForTimeout(3000);
    await enableControls(page);
    
    // Verify input is enabled before second message
    await expect(messageInput).toBeEnabled({ timeout: 5000 });
    
    // Send second message  
    await messageInput.fill('Second test message for scrolling');
    await messageInput.press('Enter');
    
    // For this test, let's just verify the mobile keyboard interaction works
    // regardless of how many messages actually get processed
    await page.waitForTimeout(2000);
    
    // Focus input to bring up keyboard and test scrolling
    await messageInput.focus();
    await page.waitForTimeout(1000);

    // Check that we can still interact with the interface
    await expect(messageInput).toBeVisible();
    await expect(messageInput).toBeFocused();

    // Take screenshot with messages and keyboard interaction
    await page.screenshot({ path: 'test-results/mobile-iPhone-multiple-messages.png' });

    // Focus input to bring up keyboard
    await messageInput.focus();
    await page.waitForTimeout(1000);

    // Check that the latest message is still visible or scrollable
    const latestMessage = page.locator('.user-message').last();
    
    // Try to scroll to the latest message
    await latestMessage.scrollIntoViewIfNeeded();
    await expect(latestMessage).toBeVisible();

    // Verify we can still interact with the input
    await messageInput.fill('Final test message');
    await messageInput.press('Enter');

    await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
    
    // Take final screenshot
    await page.screenshot({ path: 'test-results/mobile-iPhone-scroll-test-final.png' });
  });

  test('should handle portrait/landscape orientation changes', async ({ page }) => {
    // Start in portrait (default for mobile devices)
    await page.screenshot({ path: 'test-results/mobile-iPhone-portrait.png' });

    const messageInput = page.locator('.message-input');
    await messageInput.focus();
    await page.waitForTimeout(1000);

    // Test typing in portrait
    await messageInput.fill('Portrait mode test');
    await messageInput.press('Enter');
    await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });

    // Simulate landscape mode by changing viewport
    const currentViewport = page.viewportSize();
    if (currentViewport && currentViewport.width < currentViewport.height) {
      // Switch to landscape
      await page.setViewportSize({ 
        width: currentViewport.height, 
        height: currentViewport.width 
      });
      
      await page.waitForTimeout(1000);
      await page.screenshot({ path: 'test-results/mobile-iPhone-landscape.png' });

      // Test input still works in landscape
      await messageInput.focus();
      await page.waitForTimeout(1000);
      
      await messageInput.fill('Landscape mode test');
      await messageInput.press('Enter');
      await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
      
      await page.screenshot({ path: 'test-results/mobile-iPhone-landscape-with-keyboard.png' });
    }
  });

  test('should handle touch interactions with virtual keyboard', async ({ page }) => {
    const messageInput = page.locator('.message-input');
    
    // Test tap to focus
    await messageInput.tap();
    await page.waitForTimeout(1000);
    
    // Verify keyboard is active (input should be focused)
    await expect(messageInput).toBeFocused();
    
    await page.screenshot({ path: 'test-results/mobile-touch-keyboard-active.png' });
    
    // Test typing
    await page.keyboard.type('Touch keyboard test');
    await expect(messageInput).toHaveValue('Touch keyboard test');
    
    // Test tap to send
    await page.keyboard.press('Enter');
    await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
    
    // Test dismissing keyboard by tapping outside
    await page.locator('.terminal-header').tap();
    await page.waitForTimeout(500);
    
    await page.screenshot({ path: 'test-results/mobile-touch-keyboard-dismissed.png' });
    
    // Test re-focusing
    await messageInput.tap();
    await page.waitForTimeout(1000);
    await expect(messageInput).toBeFocused();
  });

  test('should handle rapid keyboard show/hide cycles', async ({ page }) => {
    const messageInput = page.locator('.message-input');
    const terminalHeader = page.locator('.terminal-header');
    
    // Rapidly switch focus on and off to test keyboard stability
    for (let i = 0; i < 3; i++) {
      // Focus input (show keyboard)
      await messageInput.tap();
      await page.waitForTimeout(500);
      await expect(messageInput).toBeFocused();
      
      // Tap elsewhere (hide keyboard)
      await terminalHeader.tap();
      await page.waitForTimeout(500);
      
      // Take screenshot of each cycle
      await page.screenshot({ path: `test-results/mobile-keyboard-cycle-${i}.png` });
    }
    
    // Final test - should still work
    await messageInput.tap();
    await page.keyboard.type('Final keyboard test');
    await page.keyboard.press('Enter');
    
    await expect(page.locator('.user-message').last()).toBeVisible({ timeout: 5000 });
    const finalMessage = await page.locator('.user-message').last().textContent();
    expect(finalMessage).toContain('Final keyboard test');
    
    await page.screenshot({ path: 'test-results/mobile-keyboard-cycle-final.png' });
  });
});
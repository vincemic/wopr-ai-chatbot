import { devices, expect, test } from '@playwright/test';

// Configure tests for iPhone 12 (representative mobile device)
test.use(devices['iPhone 12']);

test.describe('WOPR Mobile Keyboard Tests', () => {
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

    await page.goto('http://localhost:49224/');
    
    // Wait for page to be ready
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    
    // Connect through the connection prompt
    await expect(page.locator('.connection-prompt')).toBeVisible();
    await page.locator('.connection-prompt').click();
    
    // Wait for main interface to show
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
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
    // Fill chat with multiple messages to test scrolling
    const messageInput = page.locator('.message-input');
    
    for (let i = 1; i <= 5; i++) {
      await messageInput.fill(`Test message ${i} for scrolling`);
      await messageInput.press('Enter');
      
      // Wait for each message to appear
      await expect(page.locator('.user-message').nth(i-1)).toBeVisible({ timeout: 5000 });
      await page.waitForTimeout(1000); // Wait between messages
    }

    // Take screenshot with multiple messages
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
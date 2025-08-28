import { devices, expect, test } from '@playwright/test';

// Configure tests for iPhone 12 (representative mobile device)
test.use(devices['iPhone 12']);

test.describe('WOPR Mobile Layout Tests', () => {
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

    await page.goto('http://localhost:4200/');
    
    // Wait for page to be ready
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    
    // Connect through the connection prompt
    await expect(page.locator('.connection-prompt')).toBeVisible();
    await page.locator('.connection-prompt').click();
    
    // Wait for main interface to show
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for any initial messages to appear
    await page.waitForTimeout(2000);
  });

  test('should display properly on mobile and handle keyboard', async ({ page }) => {
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
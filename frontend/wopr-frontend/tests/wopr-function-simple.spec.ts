import { test, expect } from '@playwright/test';

test.describe('WOPR Function Calling - Simple Tests', () => {
  
  // Helper function to enable controls after WOPR startup
  async function enableControls(page: any) {
    // Wait for the startup sequence to complete and enable controls
    await page.waitForFunction(() => {
      const input = document.querySelector('.message-input') as HTMLInputElement;
      const sendButton = document.querySelector('.send-button') as HTMLButtonElement;
      return input && sendButton && !input.disabled && !sendButton.disabled;
    }, { timeout: 30000 });
  }

  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4200');
  });

  test('should connect to WOPR and access basic help', async ({ page }) => {
    // Wait for WOPR terminal
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await expect(page.locator('.connection-prompt')).toBeVisible();
    
    // Connect to WOPR
    await page.locator('.connection-prompt').click();
    
    // Wait for WOPR interface to initialize
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for startup sequence to complete (controls should be enabled)
    await enableControls(page);
    
    // Check help command
    await page.fill('.message-input', '/help');
    await page.press('.message-input', 'Enter');
    
    // Wait for help response
    await page.waitForTimeout(2000);
    
    // Verify basic help is shown
    const helpContent = await page.locator('.chat-container').textContent();
    expect(helpContent).toContain('WOPR COMMAND REFERENCE');
  });

  test('should accept API key configuration', async ({ page }) => {
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for controls to be enabled
    await enableControls(page);
    
    // Set API key
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    
    // Wait for API key confirmation
    await page.waitForTimeout(2000);
    
    // Verify API key was accepted
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/API KEY|CONFIGURED|CAPABILITIES/i);
  });

  test('should respond to system diagnostic request', async ({ page }) => {
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for controls to be enabled
    await enableControls(page);
    
    // Set API key first
    await page.fill('.message-input', '/apikey sk-test123');
    await page.press('.message-input', 'Enter');
    await page.waitForTimeout(1000);
    
    // Request system diagnostic
    await page.fill('.message-input', 'run system diagnostic');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should get some kind of diagnostic response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/DIAGNOSTIC|SYSTEM|STATUS|ERROR/i);
  });

  test('should handle launch codes command', async ({ page }) => {
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for controls to be enabled
    await enableControls(page);
    
    // Try launch codes command
    await page.fill('.message-input', '/launchcodes');
    await page.press('.message-input', 'Enter');
    
    // Wait for response
    await page.waitForTimeout(3000);
    
    // Should get launch code response
    const content = await page.locator('.chat-container').textContent();
    expect(content).toMatch(/LAUNCH|CODE|AUTHENTICATION|CRACK/i);
  });

});
import { expect, test } from '@playwright/test';

test.describe('WOPR Location Functionality', () => {
  
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

  test('should show location command in help', async ({ page }) => {
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    
    // Wait for WOPR interface to initialize
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for startup sequence to complete
    await enableControls(page);
    
    // Check help command
    await page.fill('.message-input', '/help');
    await page.press('.message-input', 'Enter');
    
    // Wait for help response
    await page.waitForTimeout(2000);
    
    // Verify location commands are shown in help
    const helpContent = await page.locator('.chat-container').textContent();
    expect(helpContent).toContain('/location');
    expect(helpContent).toContain('/gps');
    expect(helpContent).toContain('tactical positioning system');
  });

  test('should respond to location slash command', async ({ page }) => {
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for controls to be enabled
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
    // Connect to WOPR
    await expect(page.locator('.wopr-terminal')).toBeVisible();
    await page.locator('.connection-prompt').click();
    await expect(page.locator('.wopr-interface')).toBeVisible({ timeout: 10000 });
    
    // Wait for controls to be enabled
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
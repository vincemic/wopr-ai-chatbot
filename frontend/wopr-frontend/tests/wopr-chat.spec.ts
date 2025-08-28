import { expect, test } from '@playwright/test';

test.describe('WOPR Chat Interface', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display WOPR title and interface', async ({ page }) => {
    // Check if the main WOPR title is visible
    await expect(page.locator('.wopr-title')).toContainText('W.O.P.R.');
    await expect(page.locator('.subtitle')).toContainText('WAR OPERATION PLAN RESPONSE');
  });

  test('should show startup sequence', async ({ page }) => {
    // Wait for the startup sequence to complete
    await expect(page.locator('.message')).toContainText('WOPR SYSTEM INITIALIZING');
    
    // Wait for the final startup message
    await expect(page.locator('.message').last()).toContainText('HOW ABOUT A NICE GAME OF CHESS?', { timeout: 10000 });
  });

  test('should allow user input and display messages', async ({ page }) => {
    // Wait for startup to complete
    await page.waitForTimeout(8000);
    
    // Type a message
    const input = page.locator('.message-input');
    await input.fill('Hello WOPR');
    await input.press('Enter');
    
    // Check if user message appears
    await expect(page.locator('.user-message').last()).toContainText('Hello WOPR');
    
    // Check if WOPR responds (wait for response)
    await expect(page.locator('.wopr-message').last()).toBeVisible({ timeout: 10000 });
  });

  test('should have functioning reset button', async ({ page }) => {
    // Wait for startup to complete
    await page.waitForTimeout(8000);
    
    // Click reset button
    await page.locator('.reset-button').click();
    
    // Should show reset confirmation
    await expect(page.locator('.message').last()).toContainText('WOPR SYSTEMS RESET');
  });

  test('should display status indicator as connected', async ({ page }) => {
    // Wait for connection
    await page.waitForTimeout(3000);
    
    // Check status indicator
    await expect(page.locator('.status-indicator')).toContainText('ONLINE');
    await expect(page.locator('.status-indicator')).toHaveClass(/connected/);
  });

  test('should have CRT styling effects', async ({ page }) => {
    // Check for CRT-style background
    const body = page.locator('body');
    await expect(body).toHaveCSS('background-color', 'rgb(0, 0, 0)'); // black background
    await expect(body).toHaveCSS('color', 'rgb(0, 255, 0)'); // green text
    
    // Check for terminal styling
    const terminal = page.locator('.wopr-terminal');
    await expect(terminal).toBeVisible();
  });

  test('should have text-to-speech buttons on WOPR messages', async ({ page }) => {
    // Wait for startup to complete and check for speak buttons
    await page.waitForTimeout(8000);
    
    // Look for speak buttons on WOPR messages
    const speakButton = page.locator('.speak-btn').first();
    await expect(speakButton).toBeVisible();
  });
});
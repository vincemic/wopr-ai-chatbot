const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshot() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  // Set viewport size for consistent screenshot
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // Navigate to the local development server
  await page.goto('http://localhost:4200');
  
  // Wait for the page to load and WOPR terminal to appear
  await page.waitForSelector('.wopr-terminal');
  
  // Wait for connection prompt to appear
  await page.waitForTimeout(3000); // 3x longer
  
  // Handle connection prompt - press 'y' to connect
  const connectPrompt = page.locator('.connection-prompt');
  if (await connectPrompt.isVisible()) {
    console.log('Connection prompt found, pressing y...');
    await page.keyboard.press('y');
    await page.waitForTimeout(24000); // 3x longer - wait for full connection sequence
  }
  
  // Wait for the input field to become enabled (WOPR fully initialized)
  console.log('Waiting for input field to be enabled...');
  
  // Wait for the input to not be disabled and for WOPR to finish initializing
  await page.waitForFunction(() => {
    const input = document.querySelector('input.message-input');
    const isEnabled = input && !input.disabled;
    console.log('Input disabled status:', input ? input.disabled : 'not found');
    return isEnabled;
  }, { timeout: 90000 }); // 3x longer - 90 seconds timeout
  
  console.log('Input field is now enabled!');
  
  // Additional wait to ensure all initialization messages are complete
  await page.waitForTimeout(9000); // 3x longer
  
  // Send a few sample messages to show chat interaction
  const messageInput = page.locator('input.message-input');
  
  // Send "Hello WOPR"
  console.log('Sending first message...');
  await messageInput.fill('Hello WOPR');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(12000); // 3x longer - wait for response
  
  // Send "/help" command
  console.log('Sending help command...');
  await messageInput.fill('/help');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(15000); // 3x longer - wait for help response
  
  // Send "Let's play tic-tac-toe"
  console.log('Sending game request...');
  await messageInput.fill("Let's play tic-tac-toe");
  await page.keyboard.press('Enter');
  await page.waitForTimeout(12000); // 3x longer - wait for game response
  
  // Scroll to show recent messages
  await page.evaluate(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
  
  await page.waitForTimeout(3000); // 3x longer
  
  // Take screenshot of the full WOPR terminal interface
  console.log('Taking screenshot...');
  const woprTerminal = page.locator('.wopr-terminal');
  await woprTerminal.screenshot({ 
    path: path.join(__dirname, '../../../wopr-chat-screenshot.png'),
    type: 'png'
  });
  
  console.log('Screenshot saved as wopr-chat-screenshot.png');
  
  await browser.close();
}

takeScreenshot().catch(console.error);
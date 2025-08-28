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
  console.log('WOPR terminal found');
  
  // Wait for connection prompt to appear and handle it
  await page.waitForTimeout(3000);
  
  const connectPrompt = page.locator('.connection-prompt');
  if (await connectPrompt.isVisible()) {
    console.log('Connection prompt found, pressing y...');
    await page.keyboard.press('y');
  }
  
  // Wait a very long time for WOPR to fully initialize
  console.log('Waiting for WOPR to fully initialize...');
  await page.waitForTimeout(45000); // 45 seconds
  
  // Try to interact with the interface regardless of input state
  console.log('Attempting to send messages...');
  
  // Try clicking on the input first to focus it
  try {
    await page.click('input.message-input');
    await page.waitForTimeout(2000);
    
    // Type directly into the page (this will go to focused element)
    await page.keyboard.type('Hello WOPR');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(8000);
    
    // Send help command
    await page.keyboard.type('/help');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(10000);
    
    // Send game request
    await page.keyboard.type('Let\'s play tic-tac-toe');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(8000);
    
    console.log('Messages sent successfully');
  } catch (error) {
    console.log('Could not send messages, taking screenshot anyway:', error.message);
  }
  
  // Scroll to show recent messages
  await page.evaluate(() => {
    const chatContainer = document.querySelector('.chat-messages');
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  });
  
  await page.waitForTimeout(3000);
  
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
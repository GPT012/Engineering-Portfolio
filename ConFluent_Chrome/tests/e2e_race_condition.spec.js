const { test, chromium, expect } = require('@playwright/test');
const path = require('path');

test('ConFluent Race Condition & Cursor Stress Test', async () => {
  const pathToExtension = path.join(__dirname, '../src');
  const userDataDir = '/tmp/test-user-data-race';

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',
    ]
  });

  const page = await browserContext.newPage();
  const sandboxUrl = 'file://' + path.join(__dirname, 'test_platforms_sandbox.html');
  await page.goto(sandboxUrl);
  await page.waitForTimeout(2000);

  // Set the extension to 'rapid' mode
  // The popup isn't directly accessible, so we'll just test rapid typing in the editable area

  console.log("Testing rapid typing during translation (Race Condition)...");
  const waEditor = page.locator('#wa-editor');
  await waEditor.click();
  
  // Type a word, wait slightly so translation triggers, then type another word
  await waEditor.type('Hello', { delay: 10 });
  await page.waitForTimeout(100); // 100ms later, it might be sending the API request
  await waEditor.type(' world', { delay: 10 }); 
  await page.waitForTimeout(2000);
  
  console.log('--- Output 1:', await waEditor.innerText());

  // Let's try typing continuously
  await waEditor.click();
  await page.keyboard.press('Meta+A');
  await page.keyboard.press('Backspace');
  
  for (let i = 0; i < 5; i++) {
    await waEditor.type('test ', { delay: 50 });
    await page.waitForTimeout(300); // trigger translations frequently
  }
  
  await page.waitForTimeout(2000);
  console.log('--- Output 2:', await waEditor.innerText());

  await browserContext.close();
});

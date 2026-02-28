const { test, chromium, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('ConFluent Real Platforms Simulation Stress Test', async () => {
  const pathToExtension = path.join(__dirname, '../src');
  const userDataDir = '/tmp/test-user-data-platforms';

  const browserContext = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    args: [
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
      '--no-sandbox',
      '--disable-setuid-sandbox'
    ]
  });

  const page = await browserContext.newPage();
  const sandboxUrl = 'file://' + path.join(__dirname, 'test_platforms_sandbox.html');
  await page.goto(sandboxUrl);

  await page.waitForTimeout(2000);

  // --- 1. WHATSAPP WEB SIMULATION (contenteditable with specific wrappers) ---
  console.log("Testing WhatsApp Web Simulation...");
  const waEditor = page.locator('#wa-editor');
  await waEditor.click();
  await waEditor.type('Ceci est un test pour WhatsApp, envoyé rapidement.', { delay: 10 });
  await page.waitForTimeout(1500);
  const waResult = await waEditor.innerText();
  console.log('--- WhatsApp Output:', waResult);

  // --- 2. MESSENGER SIMULATION (Draft.js like hidden inputs) ---
  console.log("\nTesting Messenger Simulation...");
  const msgEditor = page.locator('#messenger-editor');
  await msgEditor.click();
  await msgEditor.type('Bonjour, je teste la compatibilité avec Facebook Messenger.', { delay: 15 });
  await page.waitForTimeout(1500);
  const msgResult = await msgEditor.innerText();
  console.log('--- Messenger Output:', msgResult);

  // --- 3. DISCORD SIMULATION (Slate.js deep nesting) ---
  console.log("\nTesting Discord Simulation...");
  const devEditor = page.locator('#discord-editor');
  await devEditor.click();
  await devEditor.type('Yo, est-ce que ça marche sur discord? Je tape super vite.', { delay: 10 });
  await page.waitForTimeout(1500);
  const devResult = await devEditor.innerText();
  console.log('--- Discord Output:', devResult);

  // --- 4. TWITTER / X SIMULATION (Character limited Draft.js) ---
  console.log("\nTesting Twitter Simulation...");
  const twEditor = page.locator('#twitter-editor');
  await twEditor.click();
  await twEditor.type('Mon premier tweet pour tester une extension chrome de traduction. #bot', { delay: 15 });
  await page.waitForTimeout(1500);
  const twResult = await twEditor.innerText();
  console.log('--- Twitter Output:', twResult);

  console.log("\n🧪 Platform tests completed.");
  await browserContext.close();
});

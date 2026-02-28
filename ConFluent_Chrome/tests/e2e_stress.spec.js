const { test, chromium, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test('ConFluent Translation Stress Test', async () => {
    // Chemin de votre extension (dossier parent 'src' de l'extension)
    const pathToExtension = path.join(__dirname, '../src');

    const userDataDir = '/tmp/test-user-data-dir';

    const browserContext = await chromium.launchPersistentContext(userDataDir, {
        headless: false, // Chrome DOIT etre visible pour tester les extensions
        args: [
            `--disable-extensions-except=${pathToExtension}`,
            `--load-extension=${pathToExtension}`,
            '--no-sandbox',
            '--disable-setuid-sandbox'
        ]
    });

    const page = await browserContext.newPage();

    // Ouvre le bac à sable local
    const sandboxUrl = 'file://' + path.join(__dirname, 'test_sandbox.html');
    await page.goto(sandboxUrl);

    console.log("Navigated to sandbox...");

    // Attendre que l'extension s'injecte (mutation observers & hooks)
    await page.waitForTimeout(2000);

    // 1. Taper agressivement dans le textarea standard
    console.log("Testing Standard Textarea...");
    const textarea = page.locator('#standard-textarea');
    await textarea.click();

    const phrase = 'Je voudrais taper ce texte vraiment très rapidement pour voir comment le décalage (debounce) et les timeouts réagissent. Une phrase un peu longue pour stresser le clavier virtuel.';

    // Tape caractère par caractère rapidement, mais pas instantanément (simule une frappe rapide)
    await textarea.type(phrase, { delay: 20 });

    // Attendre la traduction (le timer est de 1000ms par défaut)
    await page.waitForTimeout(2000);

    let val = await textarea.inputValue();
    console.log('--- Result in Textarea: ', val);

    // 2. Tester le contenu éditable (Slate Simulator)
    console.log("\nTesting Slate-like Div...");
    const slateEditor = page.locator('#slate-editor');
    await slateEditor.click();
    // Commencer par effacer
    await page.keyboard.press('Meta+A');
    await page.keyboard.press('Backspace');
    await page.waitForTimeout(100);

    const slatePhrase = 'Comment ça va la famille ? C\'est pour voir si le presse papiers marche dans un editor Slate.';
    await page.keyboard.type(slatePhrase, { delay: 20 });
    await page.waitForTimeout(2000);

    // Vérifier le texte
    const slateText = await slateEditor.innerText();
    console.log('--- Result in Slate Editor: ', slateText);

    // 3. Tester l'Infinite Conversation Mode (Mutation Observer bomb)
    console.log("\nTesting Infinite Chat Bomb...");
    await page.click('#start-chat');

    // Laisser couler pendant 5 secondes (soit ~50 messages ajoutés)
    await page.waitForTimeout(5000);

    console.log("\n🧪 Stress test termined.");
    await browserContext.close();
});

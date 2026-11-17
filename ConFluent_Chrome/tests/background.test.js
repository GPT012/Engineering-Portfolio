const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');
const vm = require('node:vm');

function loadBackground(fetch) {
  let messageListener;
  const chrome = {
    runtime: {
      onMessage: { addListener: (listener) => { messageListener = listener; } },
      onInstalled: { addListener: () => {} },
      getManifest: () => ({ content_scripts: [] })
    },
    storage: {
      local: {
        get: async () => ({}),
        set: async () => {}
      }
    },
    tabs: {
      onActivated: { addListener: () => {} }
    }
  };
  const source = fs.readFileSync(path.join(__dirname, '../src/background.js'), 'utf8');

  vm.runInNewContext(source, { chrome, fetch }, { filename: 'background.js' });

  return messageListener;
}

function sendTranslateMessage(listener, text) {
  return new Promise((resolve, reject) => {
    const keepChannelOpen = listener(
      { action: 'translate', text, targetLang: 'fr' },
      {},
      resolve
    );

    if (keepChannelOpen !== true) {
      reject(new Error('Translation message listener did not keep the response channel open'));
    }
  });
}

test('translates an API response and reuses the cached result', async () => {
  let fetchCalls = 0;
  const listener = loadBackground(async () => {
    fetchCalls += 1;
    return {
      ok: true,
      json: async () => [[['Bonjour', 'Hello', null, null]], null, 'en']
    };
  });

  const firstResult = await sendTranslateMessage(listener, 'Hello');
  const cachedResult = await sendTranslateMessage(listener, 'Hello');

  assert.equal(firstResult.translation, 'Bonjour');
  assert.equal(cachedResult.translation, 'Bonjour');
  assert.equal(fetchCalls, 1);
});

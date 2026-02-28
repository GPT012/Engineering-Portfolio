const { GlobalKeyboardListener } = require('node-global-key-listener');
const listener = new GlobalKeyboardListener();
console.log("Press keys now, including fn");
listener.addListener((e) => {
  if (e.state === 'DOWN') console.log("Key:", e.name, e.vKey);
});
setTimeout(()=>process.exit(0), 10000);

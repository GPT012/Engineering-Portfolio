// stockfish-worker.js — Wrapper for Stockfish engine in a Web Worker
// Loads the Stockfish JS engine and proxies UCI messages

let engine = null;

try {
    importScripts('stockfish-engine.js');
    
    if (typeof STOCKFISH === 'function') {
        engine = STOCKFISH();
        engine.onmessage = function(line) {
            postMessage(line);
        };
    } else if (typeof Module !== 'undefined') {
        // Alternative init pattern
        engine = {
            postMessage: function(msg) {
                if (typeof Module.ccall === 'function') {
                    Module.ccall('uci_command', 'number', ['string'], [msg]);
                }
            }
        };
    }
} catch(e) {
    postMessage('info string Error loading engine: ' + e.message);
}

onmessage = function(e) {
    if (engine && engine.postMessage) {
        engine.postMessage(e.data);
    }
};

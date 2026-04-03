// content.js
(() => {
    let board = null;
    let overlay = null;
    let previousState = new Map();
    let isProcessingMove = false;
    let audioCtx = null;
    let auraKills = new Map();
    let fireStartTime = null;
    let currentFirePhase = 1;
    let previousFEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
    let sideToMove = 'w';
    let moveNumber = 0;
    let evalCache = new Map();
    let lastApiCallTime = 0;
    let currentEvalController = null;

    // Remove legacy CSS
    const oldStyle = document.getElementById('chess-vfx-style');
    if (oldStyle) oldStyle.remove();
    const oldMinStyle = document.getElementById('chess-vfx-minimal-style');
    if (oldMinStyle) oldMinStyle.remove();

    const injectCSS = () => {
        if (document.getElementById('chess-vfx-premium-style')) return;
        const style = document.createElement('style');
        style.id = 'chess-vfx-premium-style';
        style.textContent = `
            #chess-vfx-dot-overlay { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 100; overflow: hidden; }
            .chess-vfx-target { position: absolute; display: flex; justify-content: center; align-items: center; pointer-events: none; }
            
            /* --- ORB TARGETS --- */
            @keyframes vfx-orb-appear {
                0% { transform: scale(0); opacity: 0; }
                60% { transform: scale(1.2); opacity: 1; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes vfx-orb-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.15); }
            }
            .chess-vfx-orb {
                width: 25%; height: 25%;
                background: radial-gradient(circle at center, #FFF5C0 0%, #FFDF70 100%);
                box-shadow: 0 0 15px 5px rgba(255, 245, 192, 0.4);
                border-radius: 50%; opacity: 0;
                animation: vfx-orb-appear 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, vfx-orb-pulse 2s ease-in-out 350ms infinite;
            }
            .chess-vfx-orb-blood {
                width: 28%; height: 28%;
                background: radial-gradient(circle at center, #FF4040 0%, #8B0000 100%);
                box-shadow: 0 0 18px 6px rgba(139, 0, 0, 0.6);
                border-radius: 50%; opacity: 0; position: relative;
                animation: vfx-orb-appear 350ms cubic-bezier(0.34, 1.56, 0.64, 1) forwards, vfx-orb-pulse 1.5s ease-in-out 350ms infinite;
            }

            /* Sparks for blood orb */
            @keyframes vfx-spark-fly {
                0% { transform: translateY(0) scale(1); opacity: 1; }
                100% { transform: translateY(-40px) scale(0); opacity: 0; }
            }
            .chess-vfx-spark {
                position: absolute; bottom: 50%; left: 50%;
                width: 2px; height: 6px; background: #FF8888; border-radius: 2px;
                animation: vfx-spark-fly 800ms linear infinite;
            }

            /* Disappear */
            @keyframes vfx-target-disappear {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0); opacity: 0; }
            }
            .chess-vfx-target.hide .chess-vfx-orb, .chess-vfx-target.hide .chess-vfx-orb-blood {
                animation: vfx-target-disappear 200ms ease-out forwards !important;
            }

            /* --- GHOST TRAIL --- */
            @keyframes vfx-ghost-fade {
                0% { opacity: var(--ghost-op); }
                100% { opacity: 0; }
            }
            .chess-vfx-ghost {
                position: absolute; background-size: cover; z-index: 99; pointer-events: none;
                animation: vfx-ghost-fade 300ms ease-out forwards;
            }

            /* --- HIGHLIGHT --- */
            @keyframes vfx-highlight-fade {
                0% { opacity: 0.2; }
                80% { opacity: 0.2; }
                100% { opacity: 0; }
            }
            .chess-vfx-highlight {
                position: absolute; background: white; z-index: 98; pointer-events: none;
                animation: vfx-highlight-fade 1500ms linear forwards;
            }

            /* --- BOUNCE --- */
            @keyframes vfx-piece-bounce {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.12); }
            }
            .chess-vfx-piece-bounce {
                animation: vfx-piece-bounce 250ms cubic-bezier(0.25, 0.1, 0.25, 1) !important;
                z-index: 101 !important;
            }

            /* --- EXPLOSION --- */
            @keyframes vfx-exp-ring {
                0% { transform: translate(-50%, -50%) scale(0); opacity: 1; }
                100% { transform: translate(-50%, -50%) scale(3); opacity: 0; }
            }
            .chess-vfx-exp-ring {
                position: absolute; top: 50%; left: 50%; border-radius: 50%; box-sizing: border-box;
                border: 2px solid var(--exp-col);
                animation: vfx-exp-ring 500ms ease-out forwards;
            }
            
            @keyframes vfx-floor-flash {
                0% { opacity: 0; }
                20% { opacity: 0.15; }
                100% { opacity: 0; }
            }
            .chess-vfx-floor-flash {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%;
                background: #FFF8E7; animation: vfx-floor-flash 300ms ease-out forwards;
            }

            @keyframes vfx-stone-fly {
                0% { transform: translate(-50%, -50%) rotate(var(--r1)); opacity: 1; }
                70% { opacity: 1; }
                100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--r2)); opacity: 0; }
            }
            .chess-vfx-stone {
                position: absolute; top: 50%; left: 50%; width: 4px; height: 10px;
                background: #A99A86;
                animation: vfx-stone-fly 400ms ease-out forwards;
            }

            @keyframes vfx-ash-fall {
                0% { transform: translate(calc(-50% + var(--sx)), -50%) scale(1); opacity: var(--sop); }
                100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) scale(0.5); opacity: 0; }
            }
            .chess-vfx-ash {
                position: absolute; top: 50%; left: 50%; border-radius: 50%; background: #444;
                animation: vfx-ash-fall var(--dur) ease-in forwards;
            }

            /* --- AURAS --- */
            @keyframes vfx-aura-orbit {
                from { transform: rotate(0deg) translateX(30px) rotate(0deg); }
                to { transform: rotate(360deg) translateX(30px) rotate(-360deg); }
            }
            @keyframes vfx-aura-orbit-fast {
                from { transform: rotate(0deg) translateX(35px) rotate(0deg); }
                to { transform: rotate(360deg) translateX(35px) rotate(-360deg); }
            }
            @keyframes vfx-aura-pulse-1 { 0% { transform: scale(0.9); opacity: 0.6; } 100% { transform: scale(1.1); opacity: 1; } }
            @keyframes vfx-aura-pulse-2 { 0% { transform: scale(0.95); opacity: 0.7; } 100% { transform: scale(1.15); opacity: 1; } }
            @keyframes vfx-aura-spin { 100% { transform: rotate(360deg); } }
            @keyframes vfx-aura-lightning {
                0%, 93%, 100% { opacity: 0; transform: scale(1) rotate(var(--rot)); }
                94%, 96% { opacity: 1; transform: scale(1.6) rotate(var(--rot)); }
            }

            .chess-vfx-aura-wrapper { position: absolute; pointer-events: none; z-index: 90; }
            .chess-vfx-aura-base { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border-radius: 50%; }
            .chess-vfx-aura-1 { box-shadow: 0 0 15px 4px rgba(255,255,255,0.3); animation: vfx-aura-pulse-1 2s infinite alternate; }
            .chess-vfx-aura-2 { box-shadow: 0 0 25px 8px rgba(255,215,0,0.5); animation: vfx-aura-pulse-2 1.2s infinite alternate; }
            .chess-vfx-aura-3 { box-shadow: 0 0 30px 10px rgba(255,107,0,0.6); animation: vfx-aura-pulse-2 1s infinite alternate; }
            .chess-vfx-aura-4 { box-shadow: 0 0 35px 12px rgba(204,0,0,0.7); animation: vfx-aura-pulse-2 0.8s infinite alternate; }
            .chess-vfx-aura-5 { box-shadow: 0 0 40px 15px rgba(139,0,255,0.8); animation: vfx-aura-pulse-2 0.6s infinite alternate; }

            .chess-vfx-aura-spark { position: absolute; top: 50%; left: 50%; width: 5px; height: 5px; border-radius: 50%; margin: -2px 0 0 -2px; }
            .chess-vfx-aura-spark-3 { background: #FF6B00; box-shadow: 0 0 5px #FF6B00; animation: vfx-aura-orbit 3s linear infinite; animation-delay: var(--del); }
            .chess-vfx-aura-spark-4 { background: #CC0000; box-shadow: 0 0 8px #CC0000; animation: vfx-aura-orbit-fast 1.5s linear infinite; animation-delay: var(--del); }

            .chess-vfx-aura-ring-5 {
                position: absolute; top: -10%; left: -10%; width: 120%; height: 120%;
                border-radius: 50%; border: 3px solid rgba(139,0,255,0.3); border-top-color: #8B00FF;
                animation: vfx-aura-spin 1s linear infinite; box-sizing: border-box;
            }

            .chess-vfx-aura-light-5 {
                position: absolute; top: 50%; left: 50%; width: 2px; height: 40px; background: white;
                box-shadow: 0 0 10px #8B00FF; transform-origin: bottom center; margin-top: -40px; margin-left: -1px;
                animation: vfx-aura-lightning 800ms infinite; animation-delay: var(--del);
            }

            .chess-vfx-piece-vibrate { animation: vfx-vibrate 0.1s linear infinite !important; }
            @keyframes vfx-vibrate {
                0%, 100% { transform: translate(0, 0); }
                33% { transform: translate(-1px, 1px); }
                66% { transform: translate(1px, -1px); }
            }

            /* --- FIRE SYSTEM --- */
            #chess-vfx-fire-overlay {
                position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 99; overflow: hidden;
                transition: background-color 2s, opacity 2s;
            }
            .vfx-fire-phase-2 #chess-vfx-fire-overlay { background: rgba(255, 120, 0, 0.06); mix-blend-mode: soft-light; }
            .vfx-fire-phase-3 #chess-vfx-fire-overlay { background: rgba(255, 100, 0, 0.08); mix-blend-mode: soft-light; }
            .vfx-fire-phase-4 #chess-vfx-fire-overlay { background: rgba(255, 50, 0, 0.10); mix-blend-mode: soft-light; }
            .vfx-fire-phase-5 #chess-vfx-fire-overlay { background: rgba(255, 30, 0, 0.12); box-shadow: inset 0 0 80px rgba(0,0,0,0.5); mix-blend-mode: soft-light; }

            .vfx-fire-ember {
                position: absolute; bottom: -10px; width: 4px; height: 4px; background: #FF6B00;
                border-radius: 50%; box-shadow: 0 0 6px #FF6B00; opacity: 0; display: none;
            }
            .vfx-fire-phase-3 .vfx-fire-ember, .vfx-fire-phase-4 .vfx-fire-ember, .vfx-fire-phase-5 .vfx-fire-ember { display: block; }
            @keyframes vfx-ember-rise {
                0% { transform: translateY(0) translateX(0); opacity: 1; }
                50% { opacity: 0.8; }
                100% { transform: translateY(-300px) translateX(var(--vx)); opacity: 0; }
            }

            .vfx-fire-flame-track {
                position: absolute; bottom: 0; width: 100%; height: 12.5%; display: none; flex-direction: row; align-items: flex-end; justify-content: space-around;
            }
            .vfx-fire-phase-4 .vfx-fire-flame-track, .vfx-fire-phase-5 .vfx-fire-flame-track { display: flex; }

            .vfx-fire-smoke { position: absolute; width: 50px; height: 50px; background: radial-gradient(circle, rgba(50,50,50,0.4), transparent); filter: blur(10px); display: none; }
            .vfx-fire-phase-5 .vfx-fire-smoke { display: block; animation: vfx-smoke 4s infinite alternate; }

            .vfx-flame-div {
                width: 12%; background: #FF4500; border-radius: 50% 50% 20% 20% / 60% 60% 40% 40%; transform-origin: bottom center;
                box-shadow: 0 0 15px #FF4500, inset 0 0 10px #FFD700; opacity: 0.8; mix-blend-mode: screen;
            }
            @keyframes vfx-flame-dance {
                0% { transform: scaleX(0.9) scaleY(0.9) skewX(-2deg); background: #FF4500; }
                100% { transform: scaleX(1.1) scaleY(1.2) skewX(2deg); background: #FF2200; }
            }

            .vfx-fire-phase-5 .vfx-fire-flame-track.edge-top { top: 0; transform: rotate(180deg); }
            .vfx-fire-phase-5 .vfx-fire-flame-track.edge-left { left:-43.75%; top: 43.75%; transform: rotate(90deg); width: 100%; }
            .vfx-fire-phase-5 .vfx-fire-flame-track.edge-right { right:-43.75%; top: 43.75%; transform: rotate(-90deg); width: 100%; }

            @keyframes vfx-smoke { 0% { transform: translate(0, 0) scale(1); opacity: 0.3; } 100% { transform: translate(10px, -10px) scale(1.5); opacity: 0.8; } }

            /* --- MINIMAL STOCKFISH ICONS --- */
            @keyframes vfx-icon-pop {
                0% { transform: scale(0); opacity: 0; }
                100% { transform: scale(1); opacity: 1; }
            }
            @keyframes vfx-icon-out {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(0); opacity: 0; }
            }
            
            .chess-sf-badge {
                position: absolute; z-index: 250; pointer-events: none;
                width: 28px; height: 28px; border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-family: 'Segoe UI', Arial, sans-serif; font-size: 18px; font-weight: 900;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8), 0 0 5px rgba(0,0,0,0.5);
                animation: vfx-icon-pop 200ms cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
            }
            .chess-sf-badge.hide-badge { animation: vfx-icon-out 200ms ease-out forwards !important; }
            
            .chess-sf-badge.brilliant { color: #00D4FF; }
            .chess-sf-badge.good { color: #6AB04C; }
            .chess-sf-badge.inaccuracy { color: #F0C419; }
            .chess-sf-badge.mistake { color: #E07B2A; }
            .chess-sf-badge.blunder { color: #E74C3C; }
        `;
        document.head.appendChild(style);
    };

    const playSound = (type) => {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            if (type === 'thud') {
                const dur = 0.15;
                const bufferSize = audioCtx.sampleRate * dur;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noiseSrc = audioCtx.createBufferSource();
                noiseSrc.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass'; filter.frequency.value = 150; 
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.8, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
                
                noiseSrc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                noiseSrc.start(); noiseSrc.stop(audioCtx.currentTime + dur);
            } 
            else if (type === 'crack') {
                const dur = 0.3;
                const bufferSize = audioCtx.sampleRate * dur;
                const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
                const noiseSrc = audioCtx.createBufferSource();
                noiseSrc.buffer = buffer;
                
                const filter = audioCtx.createBiquadFilter();
                filter.type = 'lowpass'; filter.frequency.value = 800;
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(1.0, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + dur);
                
                noiseSrc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                noiseSrc.start(); noiseSrc.stop(audioCtx.currentTime + dur);
            }
            else if (type === 'shimmer') {
                const dur = 0.4;
                const osc = audioCtx.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
                osc.frequency.linearRampToValueAtTime(2400, audioCtx.currentTime + dur);
                
                const gain = audioCtx.createGain();
                gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
                gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
                
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + dur);
            }
            else if (type === 'sf-good') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'sine'; osc.frequency.setValueAtTime(880, audioCtx.currentTime); 
                gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.3);
            }
            else if (type === 'sf-inaccuracy') {
                const osc = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc.type = 'triangle'; osc.frequency.setValueAtTime(300, audioCtx.currentTime); osc.frequency.linearRampToValueAtTime(250, audioCtx.currentTime + 0.3);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
                osc.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + 0.3);
            }
            else if (type === 'sf-mistake') {
                const osc1 = audioCtx.createOscillator(); const osc2 = audioCtx.createOscillator();
                const gain = audioCtx.createGain();
                osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(220, audioCtx.currentTime);
                osc2.type = 'sawtooth'; osc2.frequency.setValueAtTime(235, audioCtx.currentTime);
                gain.gain.setValueAtTime(0.08, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
                osc1.connect(gain); osc2.connect(gain); gain.connect(audioCtx.destination);
                osc1.start(); osc2.start(); osc1.stop(audioCtx.currentTime + 0.4); osc2.stop(audioCtx.currentTime + 0.4);
            }
            else if (type === 'sf-blunder') {
                const dur = 1.0;
                const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
                osc.type = 'square'; osc.frequency.setValueAtTime(100, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.2);
                const filter = audioCtx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.setValueAtTime(400, audioCtx.currentTime); filter.frequency.linearRampToValueAtTime(100, audioCtx.currentTime + dur);
                gain.gain.setValueAtTime(0.18, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
                osc.connect(filter); filter.connect(gain); gain.connect(audioCtx.destination);
                osc.start(); osc.stop(audioCtx.currentTime + dur);
                playSound('crack'); // combine with impact
            }
            else if (type === 'sf-brilliant') {
                [523.25, 659.25, 783.99].forEach((freq, i) => { // C, E, G arpeggio
                    setTimeout(() => {
                        const osc = audioCtx.createOscillator(); const gain = audioCtx.createGain();
                        osc.type = 'sine'; osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
                        gain.gain.setValueAtTime(0.1, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
                        osc.connect(gain); gain.connect(audioCtx.destination);
                        osc.start(); osc.stop(audioCtx.currentTime + 0.5);
                    }, i * 60);
                });
            }
        } catch(e) {}
    };

    // --- SYSTEM 1: AURA TRACKING ---
    const syncAuras = () => {
        if (!board) return;
        const auraContainer = document.getElementById('chess-vfx-aura-container');
        if (!auraContainer) return;
        const currentState = getCurrentBoardState();
        
        // Remove stale aura wrappers
        Array.from(auraContainer.children).forEach(a => {
            const sq = a.dataset.sq;
            if (!auraKills.has(sq) || !currentState.has(sq)) {
                a.remove();
            }
        });

        auraKills.forEach((kills, sq) => {
            if (kills === 0) return;
            const info = currentState.get(sq);
            if (!info || !info.el) return;
            
            let a = auraContainer.querySelector(`.chess-vfx-aura-wrapper[data-sq="${sq}"]`);
            if (!a) {
                a = document.createElement('div');
                a.className = 'chess-vfx-aura-wrapper';
                a.dataset.sq = sq;
                auraContainer.appendChild(a);
            }
            
            // Rebuild inner HTML only when kill tier changes
            if (a.dataset.kills != kills) {
                a.dataset.kills = kills;
                const tier = Math.min(kills, 5);
                let h = `<div class="chess-vfx-aura-base chess-vfx-aura-${tier}"></div>`;
                
                if (kills >= 3) {
                    const sparkCount = kills === 3 ? 3 : (kills === 4 ? 6 : 8);
                    const sparkTier = Math.min(kills, 4); // sparks class 3 or 4
                    for (let i = 0; i < sparkCount; i++) {
                        h += `<div class="chess-vfx-aura-spark chess-vfx-aura-spark-${sparkTier}" style="--del: -${(3/sparkCount)*i}s"></div>`;
                    }
                }
                if (kills >= 5) {
                    h += `<div class="chess-vfx-aura-ring-5"></div>`;
                    h += `<div class="chess-vfx-aura-light-5" style="--rot: ${Math.random()*360}deg; --del: 0s;"></div>`;
                    h += `<div class="chess-vfx-aura-light-5" style="--rot: ${Math.random()*360}deg; --del: -0.4s;"></div>`;
                    h += `<div class="chess-vfx-aura-light-5" style="--rot: ${Math.random()*360}deg; --del: -0.2s;"></div>`;
                }
                a.innerHTML = h;
            }

            // Vibrate at tier 4+
            if (kills >= 4) info.el.classList.add('chess-vfx-piece-vibrate');
            else info.el.classList.remove('chess-vfx-piece-vibrate');

            // Position the aura wrapper over the piece
            const bRect = board.getBoundingClientRect();
            const pRect = info.el.getBoundingClientRect();
            a.style.left = (pRect.left - bRect.left) + 'px';
            a.style.top = (pRect.top - bRect.top) + 'px';
            a.style.width = pRect.width + 'px';
            a.style.height = pRect.height + 'px';
        });
    };

    // --- SYSTEM 2: FIRE PHASE TIMER ---
    const checkFirePhase = () => {
        if (!fireStartTime || !board) return;
        const elapsed = (Date.now() - fireStartTime) / 60000; // minutes
        let phase = 1;
        if (elapsed >= 15) phase = 5;
        else if (elapsed >= 10) phase = 4;
        else if (elapsed >= 5) phase = 3;
        else if (elapsed >= 2) phase = 2;
        
        if (phase !== currentFirePhase) {
            if (currentFirePhase !== 1) board.classList.remove('vfx-fire-phase-' + currentFirePhase);
            if (phase !== 1) board.classList.add('vfx-fire-phase-' + phase);
            currentFirePhase = phase;
        }
    };

    // Sync aura positions at ~30fps
    setInterval(() => { syncAuras(); }, 33);

    // --- STOCKFISH SYSTEM (REWRITTEN) ---
    const boardStateToFEN = (state, side) => {
        let fen = '';
        for (let r = 8; r >= 1; r--) {
            let empty = 0;
            for (let f = 1; f <= 8; f++) {
                const info = state.get(`${f},${r}`);
                if (!info) { empty++; continue; }
                if (empty > 0) { fen += empty; empty = 0; }
                const pieceMap = { p: 'p', n: 'n', b: 'b', r: 'r', q: 'q', k: 'k' };
                const ch = pieceMap[info.type];
                fen += info.color === 'w' ? ch.toUpperCase() : ch;
            }
            if (empty > 0) fen += empty;
            if (r > 1) fen += '/';
        }
        fen += ' ' + side + ' KQkq - 0 ' + Math.max(1, Math.floor(moveNumber / 2));
        return fen;
    };

    const fileRankToUCI = (sqStr) => {
        if (!sqStr) return '??';
        const parts = sqStr.split(',');
        return String.fromCharCode(96 + parseInt(parts[0])) + parts[1];
    };

    // --- LICHESS CLOUD EVAL & QUEUE ---
    let apiQueue = Promise.resolve();
    
    // POLYGLOT BOOK DATA
    let polyglotBook = null;
    let polyglotKeys = null;
    const pieceMap = {
        'P': { pc: 0, c: 0 }, 'N': { pc: 1, c: 0 }, 'B': { pc: 2, c: 0 }, 'R': { pc: 3, c: 0 }, 'Q': { pc: 4, c: 0 }, 'K': { pc: 5, c: 0 },
        'p': { pc: 0, c: 1 }, 'n': { pc: 1, c: 1 }, 'b': { pc: 2, c: 1 }, 'r': { pc: 3, c: 1 }, 'q': { pc: 4, c: 1 }, 'k': { pc: 5, c: 1 }
    };
    
    fetch(chrome.runtime.getURL('human.bin')).then(r => r.arrayBuffer()).then(b => polyglotBook = new DataView(b)).catch(console.error);
    fetch(chrome.runtime.getURL('polyglot.b64')).then(r => r.text()).then(b64 => {
        const binStr = atob(b64.trim());
        const bytes = new Uint8Array(binStr.length);
        for(let i=0; i<binStr.length; i++) bytes[i] = binStr.charCodeAt(i);
        const dv = new DataView(bytes.buffer);
        polyglotKeys = new BigUint64Array(781);
        for(let i=0; i<781; i++) polyglotKeys[i] = dv.getBigUint64(i*8, false);
    }).catch(console.error);

    const getZobristHash = (fen) => {
        if (!polyglotKeys) return 0n;
        let hash = 0n;
        const parts = fen.split(' ');
        let rank = 7, file = 0;
        for (const char of parts[0]) {
            if (char === '/') { rank--; file = 0; }
            else if (char >= '1' && char <= '8') file += parseInt(char);
            else {
                const p = pieceMap[char];
                hash ^= polyglotKeys[64 * (2 * p.pc + p.c) + (rank * 8 + file)];
                file++;
            }
        }
        if (parts[2].includes('K')) hash ^= polyglotKeys[768];
        if (parts[2].includes('Q')) hash ^= polyglotKeys[769];
        if (parts[2].includes('k')) hash ^= polyglotKeys[770];
        if (parts[2].includes('q')) hash ^= polyglotKeys[771];
        if (parts[3] !== '-') hash ^= polyglotKeys[772 + (parts[3].charCodeAt(0) - 97)];
        if (parts[1] === 'w') hash ^= polyglotKeys[780];
        return hash;
    };

    const findPolyglotMove = (hash, moveInt) => {
        if (!polyglotBook) return false;
        let low = 0, high = Math.floor(polyglotBook.byteLength / 16) - 1;
        while (low <= high) {
            let mid = Math.floor((low + high) / 2);
            let key = polyglotBook.getBigUint64(mid * 16, false);
            if (key === hash) {
                let start = mid;
                while (start > 0 && polyglotBook.getBigUint64((start - 1) * 16, false) === hash) start--;
                while (start < Math.floor(polyglotBook.byteLength / 16) && polyglotBook.getBigUint64(start * 16, false) === hash) {
                    if (polyglotBook.getUint16(start * 16 + 8, false) === moveInt && polyglotBook.getUint16(start * 16 + 10, false) > 0) return true;
                    start++;
                }
                return false;
            } else if (key < hash) low = mid + 1;
            else high = mid - 1;
        }
        return false;
    };

    const fetchCloudEval = async (fen, signal, multiPv = 1) => {
        if (evalCache.has(fen)) return evalCache.get(fen);
        return new Promise((resolve) => {
            apiQueue = apiQueue.then(async () => {
                if (signal && signal.aborted) return resolve(null);
                const wait = Math.max(0, 1000 - (Date.now() - lastApiCallTime));
                if (wait > 0) await new Promise(r => setTimeout(r, wait));
                lastApiCallTime = Date.now();
                if (signal && signal.aborted) return resolve(null);
                try {
                    const resp = await fetch(`https://lichess.org/api/cloud-eval?fen=${encodeURIComponent(fen)}&multiPv=${multiPv}`, { signal });
                    if (!resp.ok) return resolve(null);
                    const data = await resp.json();
                    if (!data || !data.pvs || data.pvs.length === 0) return resolve(null);
                    evalCache.set(fen, data);
                    resolve(data);
                } catch (e) { resolve(null); }
            });
        });
    };

    const pvToScore = (pv) => {
        if (pv.mate !== undefined && pv.mate !== null) {
            const n = Math.abs(pv.mate);
            const val = 10000 - (n * 100);
            return pv.mate > 0 ? val : -val;
        }
        return pv.cp;
    };

    const requestEval = async (fenBefore, fenAfter, whoMoved, fromF, fromR, toF, toR) => {
        if (currentEvalController) {
            currentEvalController.abort();
            currentEvalController = null;
        }
        const uciMove = String.fromCharCode(96 + fromF) + fromR + String.fromCharCode(96 + toF) + toR;
        
        if (moveNumber <= 15) {
            const zHash = getZobristHash(fenBefore);
            const polyMove = (0 << 12) | ((fromR - 1) << 9) | ((fromF - 1) << 6) | ((toR - 1) << 3) | (toF - 1);
            if (findPolyglotMove(zHash, polyMove)) {
                console.log(`[EVAL] Opening book: ${uciMove} is Good`);
                showReviewBadge(toF, toR, 'good', '✓');
                return;
            }
        }
        
        const controller = new AbortController();
        currentEvalController = controller;
        const timeout = setTimeout(() => controller.abort(), 4000);
        
        try {
            const evalBefore = await fetchCloudEval(fenBefore, controller.signal, 2);
            if (!evalBefore || controller.signal.aborted) {
                clearTimeout(timeout); return;
            }
            const pvs = evalBefore.pvs;
            const score_A = pvToScore(pvs[0]);
            const bestMoveUci = pvs[0].moves.split(' ')[0];
            let cpLoss;

            if (uciMove.substring(0,4) === bestMoveUci.substring(0,4)) {
                cpLoss = 0;
            } else {
                const evalAfter = await fetchCloudEval(fenAfter, controller.signal, 1);
                clearTimeout(timeout);
                if (!evalAfter || controller.signal.aborted) return;
                const score_B_lichess = pvToScore(evalAfter.pvs[0]);
                cpLoss = score_A + score_B_lichess;
            }
            
            let cls, symbol;
            if (cpLoss < 0 && uciMove.substring(0,4) !== bestMoveUci.substring(0,4)) { cls = 'brilliant'; symbol = '!!'; }
            else if (cpLoss <= 0) { cls = 'great'; symbol = '!'; }
            else if (cpLoss <= 20) { cls = 'good'; symbol = '✓'; }
            else if (cpLoss <= 100) { cls = 'inaccuracy'; symbol = '?!'; }
            else if (cpLoss <= 250) { cls = 'mistake'; symbol = '?'; }
            else { cls = 'blunder'; symbol = '??'; }
            
            console.log(`[EVAL] ${cls.toUpperCase()} ${symbol} | perte: ${cpLoss}cp (A:${score_A})`);
            
            if (cls === 'brilliant') playSound('sf-brilliant');
            else if (cls === 'great' || cls === 'good') playSound('sf-good');
            else if (cls === 'inaccuracy') playSound('sf-inaccuracy');
            else if (cls === 'mistake') playSound('sf-mistake');
            else if (cls === 'blunder') playSound('sf-blunder');

            showReviewBadge(toF, toR, cls, symbol);
        } catch(e) {
            clearTimeout(timeout);
            if (e.name !== 'AbortError') console.error('[EVAL] Error:', e);
        } finally {
            if (currentEvalController === controller) currentEvalController = null;
        }
    };

    const showReviewBadge = (f, r, cls, symbol) => {
        if (!overlay) return;
        const coords = getSquareCoords(f, r);
        
        overlay.querySelectorAll('.chess-sf-badge').forEach(old => {
            old.classList.add('hide-badge');
            setTimeout(() => old.remove(), 200);
        });
        
        const badge = document.createElement('div');
        badge.className = 'chess-sf-badge ' + cls;
        
        // Position on top right corner
        let posX = coords.x + coords.size - 14;
        let posY = coords.y - 14;
        
        badge.style.left = posX + 'px';
        badge.style.top = posY + 'px';
        badge.textContent = symbol;
        
        overlay.appendChild(badge);
        
        setTimeout(() => {
            if (badge.parentNode) {
                badge.classList.add('hide-badge');
                setTimeout(() => badge.remove(), 200);
            }
        }, 2000);
    };

    const getSquareFromClass = (classList) => {
        for (const cls of classList) if (cls.startsWith('square-')) return { f: parseInt(cls[7], 10), r: parseInt(cls[8], 10), str: cls.substring(7) };
        return null;
    };

    const getPieceInfo = (node) => {
        const types = ['p', 'n', 'b', 'r', 'q', 'k'];
        for (const cls of node.classList) {
            if (cls.length === 2 && (cls[0] === 'w' || cls[0] === 'b') && types.includes(cls[1])) {
                return { color: cls[0], type: cls[1], str: cls };
            }
        }
        return null;
    };

    const getSquareCoords = (f, r) => {
        if (!board) return { x: 0, y: 0, size: 0 };
        const flipped = board && board.classList.contains('flipped');
        const s = board.getBoundingClientRect().width / 8;
        const cx = flipped ? 9 - f : f;
        const cy = flipped ? r : 9 - r;
        return { x: (cx - 1) * s, y: (cy - 1) * s, size: s };
    };

    const getCurrentBoardState = () => {
        const state = new Map();
        if (!board) return state;
        board.querySelectorAll('.piece').forEach(p => {
            const sq = getSquareFromClass(p.classList);
            const info = getPieceInfo(p);
            // By NOT filtering out 'dragging' or 'transform', we maintain a consistent 
            // logical representation of the board state. This prevents clicks from 
            // simulating phantom arrivals and departures.
            if (sq && info) {
                // If there happen to be duplicate square entries (e.g. ghost hint piece),
                // we prioritize non-dragging elements if possible.
                if (!state.has(`${sq.f},${sq.r}`) || !p.classList.contains('dragging')) {
                    info.el = p;
                    state.set(`${sq.f},${sq.r}`, info);
                }
            }
        });
        return state;
    };

    const drawHighlight = (f, r) => {
        const coords = getSquareCoords(f, r);
        const h = document.createElement('div');
        h.className = 'chess-vfx-highlight';
        h.style.width = coords.size + 'px';
        h.style.height = coords.size + 'px';
        h.style.left = coords.x + 'px';
        h.style.top = coords.y + 'px';
        h.addEventListener('animationend', () => h.remove());
        overlay.appendChild(h);
    };

    const triggerGhostTrail = (f1, r1, f2, r2, el) => {
        const c1 = getSquareCoords(f1, r1);
        const c2 = getSquareCoords(f2, r2);
        const bgUrl = window.getComputedStyle(el).backgroundImage;
        if (!bgUrl || bgUrl === 'none') return;
        
        const count = 4;
        for (let i = 1; i <= count; i++) {
            const perc = i / (count + 1);
            const gx = c1.x + (c2.x - c1.x) * perc;
            const gy = c1.y + (c2.y - c1.y) * perc;
            
            const ghost = document.createElement('div');
            ghost.className = 'chess-vfx-ghost';
            ghost.style.width = c1.size + 'px';
            ghost.style.height = c1.size + 'px';
            ghost.style.left = gx + 'px';
            ghost.style.top = gy + 'px';
            ghost.style.backgroundImage = bgUrl;
            
            const op = 0.4 - (0.35 * (i / count));
            ghost.style.setProperty('--ghost-op', op);
            
            ghost.addEventListener('animationend', () => ghost.remove());
            overlay.appendChild(ghost);
        }
    };

    const triggerExplosion = (f, r, pieceColor, isCapture) => {
        if (!overlay) return;
        const coords = getSquareCoords(f, r);
        const centerX = coords.x + coords.size / 2;
        const centerY = coords.y + coords.size / 2;

        const container = document.createElement('div');
        container.style.position = 'absolute';
        container.style.width = coords.size + 'px';
        container.style.height = coords.size + 'px';
        container.style.left = coords.x + 'px';
        container.style.top = coords.y + 'px';
        container.style.zIndex = '105';
        
        const expColor = isCapture ? '#C0392B' : (pieceColor === 'w' ? '#FFE87C' : '#7EB8F7');
        
        const glow = document.createElement('div');
        glow.className = 'chess-vfx-floor-flash';
        container.appendChild(glow);

        const ring = document.createElement('div');
        ring.className = 'chess-vfx-exp-ring';
        ring.style.width = coords.size + 'px';
        ring.style.height = coords.size + 'px';
        ring.style.setProperty('--exp-col', expColor);
        container.appendChild(ring);

        let activeAnims = 2; // glow + ring
        
        for (let i = 0; i < 10; i++) {
            const stone = document.createElement('div');
            stone.className = 'chess-vfx-stone';
            const angle = Math.random() * Math.PI * 2;
            const dist = 10 + Math.random() * 30; // max 40px
            stone.style.setProperty('--tx', (Math.cos(angle) * dist) + 'px');
            stone.style.setProperty('--ty', (Math.sin(angle) * dist) + 'px');
            stone.style.setProperty('--r1', (Math.random() * 360) + 'deg');
            stone.style.setProperty('--r2', (Math.random() * 360 + 180) + 'deg');
            activeAnims++;
            stone.addEventListener('animationend', () => checkEnd());
            container.appendChild(stone);
        }

        if (isCapture) {
            for (let i = 0; i < 15; i++) {
                const ash = document.createElement('div');
                ash.className = 'chess-vfx-ash';
                const s = 2 + Math.random() * 2;
                ash.style.width = s + 'px';
                ash.style.height = s + 'px';
                ash.style.setProperty('--sop', 0.4 + Math.random() * 0.6);
                ash.style.setProperty('--sx', ((Math.random() - 0.5) * 40) + 'px');
                ash.style.setProperty('--tx', ((Math.random() - 0.5) * 80) + 'px');
                ash.style.setProperty('--ty', (20 + Math.random() * 60) + 'px');
                ash.style.setProperty('--dur', (400 + Math.random() * 200) + 'ms');
                activeAnims++;
                ash.addEventListener('animationend', () => checkEnd());
                container.appendChild(ash);
            }
        }

        const checkEnd = () => {
            activeAnims--;
            if (activeAnims === 0 && container.parentNode) container.remove();
        };

        glow.addEventListener('animationend', checkEnd);
        ring.addEventListener('animationend', checkEnd);
        
        overlay.appendChild(container);
    };

    const clearAnimations = () => {
        if (overlay) {
            const targets = overlay.querySelectorAll('.chess-vfx-target');
            if (targets.length > 0) {
                targets.forEach(t => {
                    t.classList.remove('show');
                    t.classList.add('hide');
                    setTimeout(() => t.remove(), 250);
                });
            }
        }
    };

    const drawTarget = (f, r, isCapture, delay) => {
        if (!overlay) return;
        const coords = getSquareCoords(f, r);
        
        const wrapper = document.createElement('div');
        wrapper.className = 'chess-vfx-target';
        wrapper.style.width = `${coords.size}px`;
        wrapper.style.height = `${coords.size}px`;
        wrapper.style.left = `${coords.x}px`;
        wrapper.style.top = `${coords.y}px`;

        if (isCapture) {
            const orb = document.createElement('div');
            orb.className = 'chess-vfx-orb-blood';
            wrapper.appendChild(orb);
            
            for(let i=0; i<3; i++) {
                const spark = document.createElement('div');
                spark.className = 'chess-vfx-spark';
                spark.style.left = (30 + Math.random()*40) + '%';
                spark.style.animationDelay = (Math.random() * 400) + 'ms';
                orb.appendChild(spark);
            }
        } else {
            const orb = document.createElement('div');
            orb.className = 'chess-vfx-orb';
            wrapper.appendChild(orb);
        }
        
        overlay.appendChild(wrapper);

        wrapper.getBoundingClientRect(); // reflow
        setTimeout(() => wrapper.classList.add('show'), delay);
    };

    const calculateAccessibleSquares = (f, r, currentPiece, state) => {
        const type = currentPiece.type;
        const color = currentPiece.color;
        const targets = [];

        const isEnemy = (tf, tr) => { const p = state.get(`${tf},${tr}`); return p && p.color !== color; };
        const isEmpty = (tf, tr) => !state.has(`${tf},${tr}`);
        const inBounds = (tf, tr) => tf >= 1 && tf <= 8 && tr >= 1 && tr <= 8;

        const addSliderMoves = (dirs) => {
            for (const [df, dr] of dirs) {
                let tf = f + df; let tr = r + dr;
                while (inBounds(tf, tr)) {
                    if (isEmpty(tf, tr)) { targets.push({ f: tf, r: tr, cap: false }); } 
                    else if (isEnemy(tf, tr)) { targets.push({ f: tf, r: tr, cap: true }); break; } 
                    else break;
                    tf += df; tr += dr;
                }
            }
        };

        const addJumpMoves = (offsets) => {
            for (const [df, dr] of offsets) {
                const tf = f + df; const tr = r + dr;
                if (!inBounds(tf, tr)) continue;
                if (isEmpty(tf, tr)) targets.push({ f: tf, r: tr, cap: false });
                else if (isEnemy(tf, tr)) targets.push({ f: tf, r: tr, cap: true });
            }
        };

        if (type === 'k') addJumpMoves([[-1,-1],[0,-1],[1,-1],[-1,0],[1,0],[-1,1],[0,1],[1,1]]);
        else if (type === 'n') addJumpMoves([[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]);
        else if (type === 'r') addSliderMoves([[0,1],[0,-1],[1,0],[-1,0]]);
        else if (type === 'b') addSliderMoves([[1,1],[1,-1],[-1,1],[-1,-1]]);
        else if (type === 'q') addSliderMoves([[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]);
        else if (type === 'p') {
            const dir = color === 'w' ? 1 : -1;
            const startRank = color === 'w' ? 2 : 7;
            if (inBounds(f, r + dir) && isEmpty(f, r + dir)) {
                targets.push({ f: f, r: r + dir, cap: false });
                if (r === startRank && isEmpty(f, r + 2 * dir)) targets.push({ f: f, r: r + 2 * dir, cap: false });
            }
            if (inBounds(f - 1, r + dir) && isEnemy(f - 1, r + dir)) targets.push({ f: f - 1, r: r + dir, cap: true });
            if (inBounds(f + 1, r + dir) && isEnemy(f + 1, r + dir)) targets.push({ f: f + 1, r: r + dir, cap: true });
        }

        return targets;
    };

    const processMove = (sqStr, info, boardState) => {
        const parts = sqStr.split(',');
        const f = parseInt(parts[0], 10);
        const r = parseInt(parts[1], 10);
        const targets = calculateAccessibleSquares(f, r, info, boardState);
        
        if (targets.length > 0) {
            playSound('shimmer');
            
            targets.sort((a, b) => {
                const da = Math.abs(a.f - f) + Math.abs(a.r - r);
                const db = Math.abs(b.f - f) + Math.abs(b.r - r);
                return da - db;
            });
            
            targets.forEach((t, i) => drawTarget(t.f, t.r, t.cap, i * 30));
        }
    };

    const setupObserver = () => {
        const observer = new MutationObserver((mutations) => {
            if (isProcessingMove) return;
            
            let boardChanged = false;
            
            for (const m of mutations) {
                if (m.addedNodes.length || m.removedNodes.length) { boardChanged = true; }
                if (m.type === 'attributes' && m.attributeName === 'class' && m.target.classList.contains('piece')) {
                    boardChanged = true;
                    // Draw accessible squares when a piece starts dragging
                    if (m.target.classList.contains('dragging') && !m.oldValue?.includes('dragging')) {
                        const sq = getSquareFromClass(m.target.classList);
                        const info = getPieceInfo(m.target);
                        if (sq && info) {
                            clearAnimations();
                            processMove(`${sq.f},${sq.r}`, info, getCurrentBoardState());
                        }
                    }
                }
            }
            
            if (boardChanged) {
                const currState = getCurrentBoardState();
                
                let pieceThatArrived = null;
                let isCapture = false;
                let fromSq = null;

                currState.forEach((info, sq) => {
                    const prevInfo = previousState.get(sq);
                    
                    if (!prevInfo || prevInfo.str !== info.str) {
                        let pieceCameFromSameSquare = false;
                        
                        previousState.forEach((pInfo, pSq) => {
                            if (pInfo.el === info.el) {
                                if (pSq === sq) {
                                    pieceCameFromSameSquare = true;
                                } else {
                                    fromSq = pSq;
                                }
                            }
                        });

                        if (!pieceCameFromSameSquare) {
                            pieceThatArrived = { sq, info };
                            if (prevInfo && prevInfo.color !== info.color) {
                                isCapture = true;
                            }
                        }
                    }
                });

                if (pieceThatArrived) {
                    isProcessingMove = true;
                    
                    const processArrival = () => {
                        if (!fireStartTime) { fireStartTime = Date.now(); setInterval(checkFirePhase, 30000); checkFirePhase(); }

                        // Find origin square: a piece of same type+color that was in previousState but is no longer there
                        if (!fromSq) {
                            const arrInfo = pieceThatArrived.info;
                            previousState.forEach((pInfo, pSq) => {
                                if (pSq !== pieceThatArrived.sq && pInfo.str === arrInfo.str && !currState.has(pSq)) {
                                    fromSq = pSq;
                                }
                            });
                        }

                        // Transfer aura kills from old square to new square
                        let k = 0;
                        if (fromSq && auraKills.has(fromSq)) {
                            k = auraKills.get(fromSq);
                            auraKills.delete(fromSq);
                        }
                        if (isCapture) k++;
                        auraKills.delete(pieceThatArrived.sq); // clear any old entry at destination
                        if (k > 0) auraKills.set(pieceThatArrived.sq, k);
                        
                        console.log('[VFX] Move:', fromSq, '->', pieceThatArrived.sq, 'capture:', isCapture, 'kills:', k, 'auraMap:', Object.fromEntries(auraKills));

                        if (isCapture) playSound('crack'); 
                        else playSound('thud');
                        
                        const el = pieceThatArrived.info.el;
                        if (el) {
                            el.classList.add('chess-vfx-piece-bounce');
                            setTimeout(() => el.classList.remove('chess-vfx-piece-bounce'), 250);
                        }

                        const parts = pieceThatArrived.sq.split(',');
                        const toF = parseInt(parts[0], 10);
                        const toR = parseInt(parts[1], 10);

                        triggerExplosion(toF, toR, pieceThatArrived.info.color, isCapture);

                        if (fromSq) {
                            const fromParts = fromSq.split(',');
                            const fromF = parseInt(fromParts[0], 10);
                            const fromR = parseInt(fromParts[1], 10);
                            
                            drawHighlight(fromF, fromR);
                            drawHighlight(toF, toR);
                            
                            if (el) {
                                triggerGhostTrail(fromF, fromR, toF, toR, el);
                            }
                        }

                        // Lichess cloud evaluation — compare position BEFORE and AFTER the move
                        const whoJustMoved = sideToMove;
                        sideToMove = sideToMove === 'w' ? 'b' : 'w';
                        moveNumber++;
                        const fenBeforeMove = previousFEN;
                        const fenAfterMove = boardStateToFEN(currState, sideToMove);
                        previousFEN = fenAfterMove;
                        
                        requestEval(fenBeforeMove, fenAfterMove, whoJustMoved, fromF, fromR, toF, toR);

                        setTimeout(() => { 
                            clearAnimations();
                            processMove(pieceThatArrived.sq, pieceThatArrived.info, getCurrentBoardState());
                            isProcessingMove = false;
                        }, 50);
                    };

                    const slideEl = pieceThatArrived.info.el;
                    if (slideEl && slideEl.style && slideEl.style.transform) {
                        setTimeout(processArrival, 150); // wait for slide
                    } else {
                        processArrival(); // instant for drag-drops
                    }
                }
                
                previousState = currState;
            }
        });
        observer.observe(board, { childList: true, subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['class'] });
    };

    const init = () => {
        board = document.querySelector('wc-chess-board') || document.querySelector('.chess-board') || document.querySelector('.board-layout-main');
        if (!board || document.getElementById('chess-vfx-dot-overlay')) return;

        injectCSS();
        
        let fireOverlay = document.getElementById('chess-vfx-fire-overlay');
        if (!fireOverlay) {
            fireOverlay = document.createElement('div');
            fireOverlay.id = 'chess-vfx-fire-overlay';
            const buildFlames = () => {
                let html = '';
                for(let i=0; i<8; i++) html += `<div class="vfx-flame-div" style="animation: vfx-flame-dance ${0.6 + Math.random()*0.4}s infinite alternate ${Math.random()}s; height: ${70 + Math.random()*30}%"></div>`;
                return html;
            };
            fireOverlay.innerHTML = `
                <div class="vfx-fire-ember" style="left: 15%; --vx: 20px; animation: vfx-ember-rise 4s linear infinite;"></div>
                <div class="vfx-fire-ember" style="left: 45%; --vx: -15px; animation: vfx-ember-rise 5s linear infinite 1s;"></div>
                <div class="vfx-fire-ember" style="left: 75%; --vx: 25px; animation: vfx-ember-rise 3.5s linear infinite 2.5s;"></div>
                <div class="vfx-fire-flame-track edge-bottom">${buildFlames()}</div>
                <div class="vfx-fire-flame-track edge-top">${buildFlames()}</div>
                <div class="vfx-fire-flame-track edge-left">${buildFlames()}</div>
                <div class="vfx-fire-flame-track edge-right">${buildFlames()}</div>
                <div class="vfx-fire-smoke" style="top:0; left:0;"></div><div class="vfx-fire-smoke" style="top:0; right:0;"></div>
                <div class="vfx-fire-smoke" style="bottom:0; left:0;"></div><div class="vfx-fire-smoke" style="bottom:0; right:0;"></div>
            `;
            board.appendChild(fireOverlay);
        }

        overlay = document.createElement('div');
        overlay.id = 'chess-vfx-dot-overlay';
        
        if (getComputedStyle(board).position === 'static') board.style.position = 'relative';
        board.appendChild(overlay);

        let auraContainer = document.getElementById('chess-vfx-aura-container');
        if (!auraContainer) {
            auraContainer = document.createElement('div');
            auraContainer.id = 'chess-vfx-aura-container';
            auraContainer.style.cssText = 'position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none; z-index:104;';
            board.appendChild(auraContainer);
        }

        previousState = getCurrentBoardState();
        previousFEN = boardStateToFEN(previousState, 'w');
        setupObserver();
        console.log('[EVAL] Lichess cloud eval ready');
        
        document.addEventListener('mousedown', (e) => {
            const p = e.target.closest('.piece');
            if (p) {
                const sq = getSquareFromClass(p.classList);
                const info = getPieceInfo(p);
                if (sq && info) {
                    clearAnimations();
                    processMove(`${sq.f},${sq.r}`, info, getCurrentBoardState());
                }
            } else if (!e.target.closest('.chess-vfx-target') && !e.target.closest('.hint') && !e.target.closest('.chess-sf-badge')) {
                clearAnimations();
            }
        });
        
        window.addEventListener('resize', clearAnimations);
    };

    setInterval(() => { if (!board) init(); }, 1000);
})();

// ===================================
// ConFluent Mac — Dictation Renderer
// Voice-to-text with history & auto-copy
// ===================================

'use strict';

document.addEventListener('DOMContentLoaded', async () => {
    // === DOM ===
    const $ = (id) => document.getElementById(id);
    const micRing = $('mic-ring');
    const micStatus = $('mic-status');
    const micHint = $('mic-hint');
    const transcriptionLive = $('transcription-live');
    const historyList = $('history-list');
    const clearHistoryBtn = $('clear-history-btn');
    const dictLang = $('dictLang');
    const themeToggle = $('theme-toggle');
    const elToast = $('toast');
    const statusDot = $('status-dot');
    const statusLabel = $('status-label');
    const volumeMeter = $('volume-meter');

    // === STATE ===
    let isRecording = false;
    let recognition = null;
    let finalTranscript = '';
    let interimTranscript = '';
    let recordingStartTime = null;
    let history = [];
    let audioContext = null;
    let analyser = null;
    let micStream = null;
    let volumeAnimFrame = null;

    // === TOAST ===
    let toastTimer = null;
    function showToast(text) {
        if (!elToast) return;
        clearTimeout(toastTimer);
        elToast.textContent = text;
        elToast.classList.add('show');
        toastTimer = setTimeout(() => elToast.classList.remove('show'), 2000);
    }

    // === LOAD THEME ===
    async function loadTheme() {
        try {
            const config = await window.confluent.getConfig();
            if (config?.theme === 'dark') document.body.classList.add('dark-mode');
        } catch { /* ignore */ }
    }

    // === SPEECH RECOGNITION SETUP ===
    function initRecognition() {
        if (!('webkitSpeechRecognition' in window)) {
            micStatus.textContent = 'Speech API not available';
            micHint.textContent = 'Use Chrome-based Electron for speech';
            return false;
        }

        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = dictLang.value;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            isRecording = true;
            micRing.className = 'mic-ring recording';
            micStatus.textContent = 'Listening...';
            micStatus.className = 'mic-status recording';
            micHint.textContent = 'Release fn to stop and copy';
            transcriptionLive.className = 'transcription-live active';
            transcriptionLive.innerHTML = '<span class="interim">Listening...</span>';
            statusDot.className = 'status-dot working';
            statusLabel.textContent = 'Recording';
            statusLabel.style.color = '#ef4444';
            recordingStartTime = Date.now();
        };

        recognition.onresult = (event) => {
            interimTranscript = '';
            finalTranscript = '';

            for (let i = 0; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            // Update live transcription box
            let html = '';
            if (finalTranscript) {
                html += `<span class="final">${escapeHtml(finalTranscript)}</span>`;
            }
            if (interimTranscript) {
                html += `<span class="interim">${escapeHtml(interimTranscript)}</span>`;
            }
            transcriptionLive.innerHTML = html || '<span class="interim">Listening...</span>';

            // Auto-scroll
            transcriptionLive.scrollTop = transcriptionLive.scrollHeight;
        };

        recognition.onerror = (event) => {
            if (event.error === 'aborted' || event.error === 'no-speech') return;
            console.error('Speech error:', event.error);
            showToast(`⚠ Speech error: ${event.error}`);
            stopRecording(true);
        };

        recognition.onend = () => {
            // Recognition stopped — finalize
            if (isRecording) {
                // It may have auto-stopped, treat as normal stop
                stopRecording(false);
            }
        };

        return true;
    }

    // === START RECORDING ===
    async function startRecording() {
        if (isRecording) return;

        finalTranscript = '';
        interimTranscript = '';

        // Update recognition language
        if (recognition) {
            recognition.lang = dictLang.value;
        } else {
            if (!initRecognition()) return;
        }

        // Start microphone for volume meter
        try {
            micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new AudioContext();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            const source = audioContext.createMediaStreamSource(micStream);
            source.connect(analyser);
            startVolumeMeter();
        } catch (e) {
            console.warn('Could not access microphone for volume meter:', e);
        }

        // Start speech recognition
        try {
            recognition.start();
        } catch (e) {
            // May already be running
            console.warn('Recognition start error:', e);
        }
    }

    // === STOP RECORDING ===
    function stopRecording(isError) {
        if (!isRecording && !recognition) return;

        isRecording = false;

        // Stop speech recognition
        try {
            recognition.stop();
        } catch { /* ignore */ }

        // Stop volume meter
        stopVolumeMeter();

        // Stop microphone stream
        if (micStream) {
            micStream.getTracks().forEach(t => t.stop());
            micStream = null;
        }
        if (audioContext) {
            audioContext.close().catch(() => { });
            audioContext = null;
            analyser = null;
        }

        // UI Reset
        micRing.className = 'mic-ring idle';
        micStatus.textContent = 'Hold fn to record';
        micStatus.className = 'mic-status';
        micHint.textContent = 'Release to stop — text auto-copied to clipboard';
        transcriptionLive.className = 'transcription-live';
        statusDot.className = 'status-dot active';
        statusLabel.textContent = 'Ready';
        statusLabel.style.color = 'var(--accent)';

        if (isError) return;

        // Get the full transcript
        const text = (finalTranscript + interimTranscript).trim();

        if (text.length > 0) {
            // Calculate duration
            const duration = recordingStartTime ? Math.round((Date.now() - recordingStartTime) / 1000) : 0;

            // Auto-copy to clipboard
            window.confluent.copyToClipboard(text);

            // Add to history
            const entry = {
                text: text,
                timestamp: Date.now(),
                duration: duration,
                lang: dictLang.value
            };
            addHistoryEntry(entry);

            // Save to main process
            window.confluent.saveDictationEntry(entry);

            // Show final text in transcription box
            transcriptionLive.innerHTML = `<span class="final">${escapeHtml(text)}</span>`;

            showToast('✓ Copied to clipboard — Cmd+V to paste');
        } else {
            transcriptionLive.innerHTML = '<span class="transcription-placeholder">No speech detected. Try again...</span>';
        }
    }

    // === VOLUME METER ===
    function startVolumeMeter() {
        if (!analyser) return;
        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const bars = volumeMeter.querySelectorAll('.volume-bar');

        function draw() {
            if (!isRecording) return;
            analyser.getByteFrequencyData(dataArray);

            // Sample 15 frequency buckets
            const numBars = bars.length;
            const step = Math.floor(dataArray.length / numBars);

            for (let i = 0; i < numBars; i++) {
                const value = dataArray[i * step] / 255;
                const height = Math.max(4, value * 24);
                bars[i].style.height = height + 'px';
                bars[i].classList.toggle('active', value > 0.1);
            }

            volumeAnimFrame = requestAnimationFrame(draw);
        }

        draw();
    }

    function stopVolumeMeter() {
        if (volumeAnimFrame) {
            cancelAnimationFrame(volumeAnimFrame);
            volumeAnimFrame = null;
        }
        // Reset bars
        const bars = volumeMeter.querySelectorAll('.volume-bar');
        bars.forEach(b => {
            b.style.height = '4px';
            b.classList.remove('active');
        });
    }

    // === HISTORY MANAGEMENT ===
    function addHistoryEntry(entry) {
        // Remove empty placeholder
        const emptyEl = historyList.querySelector('.history-empty');
        if (emptyEl) emptyEl.remove();

        history.unshift(entry);

        const el = document.createElement('div');
        el.className = 'history-entry';

        const time = new Date(entry.timestamp).toLocaleTimeString([], {
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        });

        const durationStr = entry.duration > 0 ? `${entry.duration}s` : '<1s';

        el.innerHTML = `
            <div class="history-entry-text">${escapeHtml(entry.text)}</div>
            <button class="history-copy-btn" title="Copy to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
            </button>
            <div class="history-entry-meta">
                <div style="display:flex;gap:6px;align-items:center;">
                    <span class="history-entry-duration">🎙 ${durationStr}</span>
                    <span class="history-entry-time">${time}</span>
                </div>
                <span class="history-entry-copied">✓ Copied</span>
            </div>
        `;

        // Copy on click
        const copyBtn = el.querySelector('.history-copy-btn');
        copyBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            window.confluent.copyToClipboard(entry.text);
            const copiedEl = el.querySelector('.history-entry-copied');
            copiedEl.classList.add('show');
            showToast('✓ Copied to clipboard');
            setTimeout(() => copiedEl.classList.remove('show'), 1500);
        });

        // Also copy on entry click
        el.addEventListener('click', () => {
            window.confluent.copyToClipboard(entry.text);
            const copiedEl = el.querySelector('.history-entry-copied');
            copiedEl.classList.add('show');
            showToast('✓ Copied to clipboard');
            setTimeout(() => copiedEl.classList.remove('show'), 1500);
        });

        historyList.prepend(el);

        // Cap at 100 entries in DOM
        while (historyList.children.length > 100) {
            historyList.removeChild(historyList.lastChild);
        }
    }

    // === LOAD HISTORY ===
    async function loadHistory() {
        try {
            const savedHistory = await window.confluent.getDictationHistory();
            if (savedHistory && savedHistory.length > 0) {
                for (let i = savedHistory.length - 1; i >= 0; i--) {
                    addHistoryEntry(savedHistory[i]);
                }
            }
        } catch { /* ignore */ }
    }

    // === UTIL ===
    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // === EVENT LISTENERS ===

    // Manual mic button click
    micRing.addEventListener('click', () => {
        if (isRecording) {
            stopRecording(false);
        } else {
            startRecording();
        }
    });

    // Clear history
    clearHistoryBtn?.addEventListener('click', () => {
        history = [];
        historyList.innerHTML = '<div class="history-empty">No recordings yet. Hold fn to start...</div>';
        window.confluent.clearDictationHistory();
        showToast('History cleared');
    });

    // Language change
    dictLang?.addEventListener('change', () => {
        if (recognition) {
            recognition.lang = dictLang.value;
        }
        window.confluent.saveDictationLang(dictLang.value);
    });

    // Theme toggle
    themeToggle?.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    });

    // === IPC: fn key from main process ===
    window.confluent.onStartDictation(() => {
        if (!isRecording) {
            startRecording();
        }
    });

    window.confluent.onStopDictation(() => {
        if (isRecording) {
            stopRecording(false);
        }
    });

    // === INIT ===
    await loadTheme();
    initRecognition();
    await loadHistory();

    // Load saved language
    try {
        const lang = await window.confluent.getDictationLang();
        if (lang && dictLang) dictLang.value = lang;
    } catch { /* ignore */ }

    statusDot.className = 'status-dot active';
    statusLabel.textContent = 'Ready';
    statusLabel.style.color = 'var(--accent)';
});

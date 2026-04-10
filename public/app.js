import { analyzeMessages, estimatedLuminance } from '/src/runtime/vibeRuntime.js';

const THRESHOLD = 0.35;
const threadId = 'demo-thread';
const state = { messages: [], palette: ['#3B4A6B', '#1A1D2E', '#8AA4D6'] };

class MockTextureSocket {
  constructor(onEvent) {
    this.onEvent = onEvent;
    setTimeout(() => this.onEvent({ type: 'open' }), 120);
  }

  request(payload) {
    const requestId = payload.requestId;
    this.onEvent({ type: 'texture.ack', requestId });

    [30, 60, 100].forEach((progress, idx) => {
      setTimeout(() => {
        this.onEvent({ type: 'texture.progress', requestId, progress });
        if (progress === 100) {
          const p = payload.palette;
          const css = `radial-gradient(circle at 20% 20%, ${p[0]}66, transparent 40%), radial-gradient(circle at 80% 30%, ${p[1]}66, transparent 35%), radial-gradient(circle at 40% 80%, ${p[2]}66, transparent 45%), linear-gradient(160deg, #090c17 0%, #141a2e 100%)`;
          this.onEvent({
            type: 'texture.complete',
            requestId,
            threadId,
            texture: { kind: 'gradient', css },
            palette: payload.palette,
            prompt: payload.prompt
          });
        }
      }, 380 * (idx + 1));
    });
  }
}

const els = {
  canvas: document.getElementById('canvas'),
  messages: document.getElementById('messages'),
  form: document.getElementById('composer'),
  input: document.getElementById('messageInput'),
  delta: document.getElementById('delta'),
  engineStatus: document.getElementById('engineStatus'),
  history: document.getElementById('history'),
  extraction: document.getElementById('extraction'),
  local: document.getElementById('local'),
  cloud: document.getElementById('cloud')
};

const textureStream = new MockTextureSocket((msg) => {
  if (msg.type === 'open') els.cloud.textContent = 'Connected (mock)';
  if (msg.type === 'texture.progress') {
    els.cloud.textContent = `Rendering ${msg.progress}%`;
  }
  if (msg.type === 'texture.complete') {
    state.palette = msg.palette;
    applyCanvas(msg.texture.css);
    addHistory(msg.prompt, msg.texture.css);
    els.cloud.textContent = 'Synced';
    els.engineStatus.textContent = 'Scene updated';
    syncBubbleTheme();
  }
});

function applyCanvas(cssGradient) {
  els.canvas.style.backgroundImage = cssGradient;
}

function addBubble(text, self = true) {
  const node = document.createElement('div');
  node.className = `bubble ${self ? 'self' : 'other'}`;
  node.textContent = text;
  els.messages.appendChild(node);
  els.messages.scrollTop = els.messages.scrollHeight;
  syncBubbleTheme();
}

function syncBubbleTheme() {
  const lum = estimatedLuminance(state.palette[0]);
  const className = lum > 0.6 ? 'dark' : 'light';
  [...document.querySelectorAll('.bubble')].forEach((b) => {
    b.classList.remove('dark', 'light');
    b.classList.add(className);
  });
}

function addHistory(prompt, cssGradient) {
  const card = document.createElement('article');
  card.className = 'history-card';
  card.style.backgroundImage = cssGradient;
  card.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong><p>${prompt}</p>`;
  els.history.prepend(card);
}

function requestCloud(prompt, palette) {
  const requestId = crypto.randomUUID();
  textureStream.request({
    type: 'texture.request',
    requestId,
    threadId,
    prompt,
    palette,
    aspectRatio: 9 / 16,
    quality: '2k'
  });
}

function generateLocalPreview(palette) {
  els.local.textContent = 'Preview ready';
  return `radial-gradient(circle at 20% 25%, ${palette[0]}88, transparent 45%), radial-gradient(circle at 75% 30%, ${palette[1]}66, transparent 40%), linear-gradient(145deg, #080b16, #12182c)`;
}

function ingestMessage(text) {
  const msg = { text, id: crypto.randomUUID() };
  state.messages.push(msg);
  els.extraction.textContent = 'Analyzing';
  const analysis = analyzeMessages(state.messages.slice(-10));
  els.delta.textContent = analysis.vibeDelta.toFixed(2);

  if (analysis.vibeDelta > THRESHOLD) {
    els.engineStatus.textContent = `Vibe shift: ${analysis.dominantThemes.join(', ') || 'ambient'}`;
    const preview = generateLocalPreview(analysis.palette);
    applyCanvas(preview);
    requestCloud(analysis.sanitizedPrompt, analysis.palette);
  } else {
    els.engineStatus.textContent = 'No significant shift';
  }

  els.extraction.textContent = 'Ready';
}

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.input.value.trim();
  if (!text) return;
  addBubble(text, true);
  ingestMessage(text);
  els.input.value = '';

  setTimeout(() => {
    addBubble('Got it — canvas is adapting.', false);
  }, 250);
});

addBubble("Hey! What's the vibe for tonight?", false);

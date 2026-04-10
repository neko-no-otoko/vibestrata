const KEYWORDS = {
  cozy: ['comfort', 'cozy', 'blanket', 'mattress', 'sleep'],
  chaos: ['crazy', 'clown', 'fight', 'drama', 'wild'],
  nightlife: ['bar', 'club', 'neon', 'party', 'night'],
  nature: ['forest', 'rain', 'beach', 'mountain', 'river']
};

export function sanitizePrompt(text) {
  return text
    .replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '[date]')
    .replace(/\b\d{3}[- .]?\d{3}[- .]?\d{4}\b/g, '[phone]')
    .replace(/\b[A-Z][a-z]+\s[A-Z][a-z]+\b/g, '[name]')
    .trim();
}

export function analyzeMessages(messages) {
  const text = messages.map((m) => m.text.toLowerCase()).join(' ');
  const themes = [];

  for (const [theme, words] of Object.entries(KEYWORDS)) {
    if (words.some((w) => text.includes(w))) themes.push(theme);
  }

  const novelty = Math.min(1, new Set(text.split(/\s+/).filter(Boolean)).size / 40);
  const intensity = Math.min(1, (text.match(/!|\bvery\b|\bsuper\b|\btoo\b/g) || []).length / 5);
  const vibeDelta = Number(Math.min(1, 0.15 + themes.length * 0.22 + novelty * 0.35 + intensity * 0.28).toFixed(2));

  const promptBase = themes.length
    ? `An abstract ${themes.join(', ')} scene with cinematic lighting and soft focus`
    : 'A moody abstract messenger background with cinematic lighting';

  const sanitizedPrompt = sanitizePrompt(promptBase);
  const palette = pickPalette(themes);

  return { vibeDelta, dominantThemes: themes, sanitizedPrompt, palette };
}

export function pickPalette(themes) {
  if (themes.includes('cozy')) return ['#4D7EA8', '#1E2A38', '#A7C7E7'];
  if (themes.includes('nightlife')) return ['#A021D9', '#112B4A', '#34E4EA'];
  if (themes.includes('chaos')) return ['#B33A3A', '#231F20', '#F4B860'];
  if (themes.includes('nature')) return ['#3A7D44', '#1B4332', '#95D5B2'];
  return ['#3B4A6B', '#1A1D2E', '#8AA4D6'];
}

export function estimatedLuminance(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeMessages, sanitizePrompt, estimatedLuminance } from '../src/runtime/vibeRuntime.js';

test('analyzeMessages detects themes and computes delta', () => {
  const result = analyzeMessages([
    { text: 'Too old for the floor, I am taking the air mattress tonight!' },
    { text: 'Need comfort and cozy setup' }
  ]);

  assert.ok(result.vibeDelta > 0.35);
  assert.ok(result.dominantThemes.includes('cozy'));
  assert.equal(result.palette.length, 3);
});

test('sanitizePrompt strips PII-like patterns', () => {
  const sanitized = sanitizePrompt('Meet John Smith on 10/10/2026 and call 555-123-4444');
  assert.ok(!sanitized.includes('John Smith'));
  assert.ok(sanitized.includes('[name]'));
  assert.ok(sanitized.includes('[date]'));
  assert.ok(sanitized.includes('[phone]'));
});

test('estimatedLuminance returns normalized value', () => {
  assert.equal(estimatedLuminance('#000000'), 0);
  assert.ok(Math.abs(estimatedLuminance('#ffffff') - 1) < 1e-12);
});

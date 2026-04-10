# VibeStrata Architecture (v2.1 scaffold)

## 1. Runtime topology

VibeStrata runs as a hybrid edge-cloud pipeline:

1. **Semantic Extraction (on-device):**
   - Maintains a 128k conversational sliding window.
   - Scores each message batch with `vibeDelta` in `[0, 1]`.
   - Emits an anonymized image prompt + palette.
2. **Generation (hybrid):**
   - **L1 local sketch:** fast low-res preview for immediate visual response.
   - **L2 cloud canvas:** high-fidelity texture generated asynchronously.
3. **Rendering:**
   - Performs latent-space interpolation from previous to current canvas.
   - Applies adaptive legibility rules for chat bubble readability.

## 2. Components in this repo

- `src/core/vibeEngine.ts`
  - Orchestrates message ingestion, scoring, generation trigger logic, and state publication.
- `src/cloud/textureSocket.ts`
  - WebSocket client for cloud texture updates and stream lifecycle events.
- `src/platform/paletteSync.ts`
  - Platform abstraction for UI palette propagation.
- `src/render/latentBlend.glsl`
  - Prototype shader for transition blending.
- `docs/api/protocol.md`
  - Initial envelope and event types for cloud texture protocol.

## 3. Trigger rules

A new generation sequence starts when:

- New messages are appended to the active context window.
- The analyzer computes `vibeDelta > 0.35`.

Generation requests include:

- Sanitized prompt.
- Palette proposal.
- Reference to prior scene seed/texture.
- Device profile (aspect ratio, max texture budget, quality tier).

## 4. Privacy boundary

PII is scrubbed locally before cloud offload. The cloud payload should never include:

- Person names.
- Precise addresses.
- Exact date/time expressions.
- Raw message transcript.

Only abstracted prompt descriptors and optional hashed correlation IDs should be transmitted.

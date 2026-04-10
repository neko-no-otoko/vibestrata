# Texture Stream Protocol (Draft)

## Transport

- **Protocol:** WebSocket (TLS)
- **Direction:** bidirectional
- **Payload:** JSON envelopes

## Client -> Server events

### `texture.request`

```json
{
  "type": "texture.request",
  "requestId": "req_123",
  "threadId": "thread_abc",
  "prompt": "cozy dimly lit room with an air mattress, cinematic, soft grain",
  "palette": ["#4D7EA8", "#1E2A38", "#A7C7E7"],
  "aspectRatio": 0.5625,
  "quality": "2k"
}
```

### `texture.cancel`

```json
{
  "type": "texture.cancel",
  "requestId": "req_123"
}
```

## Server -> Client events

### `texture.ack`

Acknowledges request acceptance.

### `texture.progress`

Progress update with percentage and queue/compute metadata.

### `texture.chunk`

Binary-safe chunk message with base64 content, sequence index, and checksum.

### `texture.complete`

Final event containing texture URI (or in-band bytes), metadata, and generation profile.

### `texture.error`

Structured error payload with `code`, `message`, and retry hints.

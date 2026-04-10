import { GenerationRequest } from "../core/types";

export type TextureSocketEvent =
  | { type: "texture.ack"; requestId: string }
  | { type: "texture.progress"; requestId: string; progress: number }
  | { type: "texture.complete"; requestId: string; threadId: string; textureUri: string }
  | { type: "texture.error"; requestId: string; code: string; message: string };

export class TextureSocketClient {
  private socket?: WebSocket;

  constructor(
    private readonly endpoint: string,
    private readonly onEvent: (event: TextureSocketEvent) => void,
  ) {}

  connect(): void {
    if (this.socket && this.socket.readyState <= WebSocket.OPEN) return;

    this.socket = new WebSocket(this.endpoint);
    this.socket.onmessage = (raw) => {
      try {
        const event = JSON.parse(String(raw.data)) as TextureSocketEvent;
        this.onEvent(event);
      } catch {
        this.onEvent({
          type: "texture.error",
          requestId: "unknown",
          code: "PARSE_ERROR",
          message: "Unable to parse texture socket payload",
        });
      }
    };
  }

  request(requestId: string, payload: GenerationRequest): void {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      throw new Error("Texture socket is not connected");
    }

    this.socket.send(
      JSON.stringify({
        type: "texture.request",
        requestId,
        threadId: payload.threadId,
        prompt: payload.prompt,
        palette: payload.palette,
        aspectRatio: payload.aspectRatio,
        quality: payload.quality,
      }),
    );
  }

  close(): void {
    this.socket?.close();
    this.socket = undefined;
  }
}

import {
  CanvasState,
  GenerationRequest,
  LocalSketchGenerator,
  Message,
  PromptSanitizer,
  SemanticAnalyzer,
} from "./types";

export interface CloudTextureGateway {
  requestFinalCanvas(request: GenerationRequest): Promise<void>;
}

export class VibeEngine {
  private static readonly MAX_CONTEXT = 128_000;
  private static readonly DELTA_THRESHOLD = 0.35;

  private contextWindow: Message[] = [];
  private stateByThread = new Map<string, CanvasState>();

  constructor(
    private readonly analyzer: SemanticAnalyzer,
    private readonly localSketch: LocalSketchGenerator,
    private readonly sanitizer: PromptSanitizer,
    private readonly cloudGateway: CloudTextureGateway,
  ) {}

  async ingest(threadId: string, incoming: Message[]): Promise<CanvasState | null> {
    if (!incoming.length) return null;

    this.contextWindow = this.trimWindow([...this.contextWindow, ...incoming]);
    const analysis = await this.analyzer.analyze(this.contextWindow);

    if (analysis.vibeDelta <= VibeEngine.DELTA_THRESHOLD) {
      return this.stateByThread.get(threadId) ?? null;
    }

    const prompt = this.sanitizer.sanitize(analysis.sanitizedPrompt);
    const request: GenerationRequest = {
      threadId,
      prompt,
      palette: analysis.palette,
      aspectRatio: 9 / 16,
      quality: "preview",
    };

    const localPreviewUri = await this.localSketch.generatePreview(request);
    const nextState: CanvasState = {
      threadId,
      activePrompt: prompt,
      palette: analysis.palette,
      vibeDelta: analysis.vibeDelta,
      localPreviewUri,
    };

    this.stateByThread.set(threadId, nextState);

    void this.cloudGateway.requestFinalCanvas({ ...request, quality: "2k" });

    return nextState;
  }

  applyCloudTexture(threadId: string, cloudTextureUri: string): CanvasState | null {
    const state = this.stateByThread.get(threadId);
    if (!state) return null;

    const updated: CanvasState = { ...state, cloudTextureUri };
    this.stateByThread.set(threadId, updated);
    return updated;
  }

  private trimWindow(messages: Message[]): Message[] {
    if (messages.length <= VibeEngine.MAX_CONTEXT) return messages;
    return messages.slice(messages.length - VibeEngine.MAX_CONTEXT);
  }
}

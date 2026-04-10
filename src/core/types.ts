export type HexColor = `#${string}`;

export interface Message {
  id: string;
  authorId: string;
  text: string;
  timestampIso: string;
}

export interface VibeAnalysis {
  vibeDelta: number;
  sanitizedPrompt: string;
  palette: HexColor[];
  dominantThemes: string[];
}

export interface GenerationRequest {
  threadId: string;
  prompt: string;
  palette: HexColor[];
  aspectRatio: number;
  quality: "preview" | "2k";
}

export interface CanvasState {
  threadId: string;
  activePrompt: string;
  palette: HexColor[];
  vibeDelta: number;
  localPreviewUri?: string;
  cloudTextureUri?: string;
}

export interface SemanticAnalyzer {
  analyze(window: Message[]): Promise<VibeAnalysis>;
}

export interface LocalSketchGenerator {
  generatePreview(request: GenerationRequest): Promise<string>;
}

export interface PromptSanitizer {
  sanitize(prompt: string): string;
}

/**
 * Core types for the IA framework.
 * All shared interfaces and types used across IA tools.
 */

// ============================================================================
// LLM Request/Response Types
// ============================================================================

export interface LLMRequest {
  providerId: string;
  messages: { role: string; content: string }[];
  model?: string;
  origin: string;
  action?: string;
  maxTokens?: number;
}

export interface LLMResponse<T = any> {
  ok: true;
  data: T;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  warning?: string;
}

export interface LLMError {
  ok: false;
  type: 'openrouter' | 'network' | 'quota' | 'parse' | 'unknown' | 'supabase';
  message: string;
  raw?: string;
}

export type LLMResult<T> = LLMResponse<T> | LLMError;

// ============================================================================
// Prompt Building Types
// ============================================================================

export interface PromptPart {
  system?: string;
  instructions: string;
  context: string;
  examples?: string;
  userDescription?: string;
  maxTokens?: number;
}

export interface PromptBuildOptions {
  includeJsonRules?: boolean;
  customRules?: string[];
  metadata?: Record<string, any>;
}

// ============================================================================
// JSON Parsing Types
// ============================================================================

export type ParsedJSON<T> = 
  | { ok: true; data: T }
  | { ok: false; raw: string; error: string };

export interface JSONParseOptions {
  mode: 'strict' | 'permissive';
  arrayField?: string; // Field name for array recovery (e.g., "suggestions")
}

// ============================================================================
// Configuration Types
// ============================================================================

export interface IAToolConfig {
  id: string;
  tool_name: string;
  free_can_use: boolean;
  max_input_tokens_free: number;
  max_output_tokens_free: number;
  max_input_tokens_pro: number;
  max_output_tokens_pro: number;
  updated_at: string;
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: 'openai' | 'openrouter';
  model_id: string;
  max_tokens: number;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
}

// ============================================================================
// Token Estimation Types
// ============================================================================

export interface TokenEstimationResult {
  inputTokens: number;
  estimatedOutputTokens: number;
  totalEstimated: number;
  model: string;
}

// ============================================================================
// Hook Return Types
// ============================================================================

export interface LLMEngineState<T> {
  loading: boolean;
  error: LLMError | null;
  result: T | null;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  } | null;
}

export interface LLMEngineActions<T> {
  runLLM: (request: LLMRequest, parseOptions?: JSONParseOptions) => Promise<LLMResponse<T> | LLMError>;
  reset: () => void;
}

export type UseLLMEngineReturn<T> = LLMEngineState<T> & LLMEngineActions<T>;

/**
 * Token estimation utility for the IA framework.
 * Uses tiktoken for accurate token counting with caching for performance.
 */

import { encodingForModel, getEncoding } from 'js-tiktoken';
import { TokenEstimationResult } from './types';

// Cache for encodings to avoid recreating them
const encodingCache = new Map<string, any>();

/**
 * Get or create an encoding for a specific model.
 * Uses caching to improve performance.
 */
function getEncodingForModel(model: string): any {
  if (encodingCache.has(model)) {
    return encodingCache.get(model)!;
  }

  let encoding: any;
  try {
    encoding = encodingForModel(model as any);
  } catch (e) {
    // Fallback to cl100k_base which is used by most modern OpenAI models
    encoding = getEncoding('cl100k_base');
  }

  encodingCache.set(model, encoding);
  return encoding;
}

/**
 * Estimates the number of tokens in a text string.
 * 
 * @param input - The text to tokenize
 * @param model - The model ID (e.g., 'gpt-4o', 'gpt-3.5-turbo', 'gemini-1.5-flash-002')
 * @returns The estimated number of tokens
 */
export function estimateTokens(input: string, model: string = 'gpt-3.5-turbo'): number {
  if (!input) return 0;

  try {
    const encoding = getEncodingForModel(model);
    const tokens = encoding.encode(input);
    return tokens.length;
  } catch (error) {
    console.warn('Error estimating tokens with tiktoken, using fallback estimation:', error);
    // Fallback: rough estimation (1 token ~= 4 chars)
    return Math.ceil(input.length / 4);
  }
}

/**
 * Estimates tokens for a complete prompt, including expected output.
 * This is the main function to use for token estimation in the IA framework.
 * 
 * @param model - The model being used
 * @param prompt - The complete prompt text
 * @param expectedOutputItems - Number of items expected in output (for estimation)
 * @returns Detailed token estimation result
 */
export function estimatePromptTokens(
  model: string,
  prompt: string,
  expectedOutputItems: number = 5
): TokenEstimationResult {
  const inputTokens = estimateTokens(prompt, model);
  
  // Estimate output tokens based on expected items
  // Average ~150 tokens per bookmark suggestion (title, url, description, tags)
  // Plus ~50 tokens for the JSON structure and summary
  const estimatedOutputTokens = (expectedOutputItems * 150) + 50;
  
  return {
    inputTokens,
    estimatedOutputTokens,
    totalEstimated: inputTokens + estimatedOutputTokens,
    model
  };
}

/**
 * Estimates only the input tokens for a given text.
 * Useful when you don't need output estimation.
 */
export function estimateInputTokens(input: string, model: string = 'gpt-3.5-turbo'): number {
  return estimateTokens(input, model);
}

/**
 * Cleanup function to free encoding cache.
 * Call this when you want to free memory (e.g., on component unmount).
 */
export function clearEncodingCache(): void {
  encodingCache.clear();
}

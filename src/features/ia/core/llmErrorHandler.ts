/**
 * Centralized error handling for the IA framework.
 * Processes and categorizes all LLM-related errors into a standardized format.
 */

import { LLMError } from './types';

/**
 * Handle errors from the LLM proxy edge function.
 */
export function handleLLMError(error: any, context: string = 'LLM call'): LLMError {
  console.error(`❌ [llmErrorHandler] Error in ${context}:`, error);

  // Supabase edge function error
  if (error?.message?.includes('edge function') || error?.message?.includes('Failed to invoke')) {
    return {
      ok: false,
      type: 'supabase',
      message: 'Erreur de connexion avec le serveur IA. Veuillez réessayer.'
    };
  }

  // Quota exceeded error
  if (error?.message?.includes('quota') || error?.message?.includes('limit reached')) {
    return {
      ok: false,
      type: 'quota',
      message: error.message || 'Quota de tokens dépassé. Passez à Pro ou attendez le mois prochain.'
    };
  }

  // OpenRouter specific errors
  if (error?.message?.includes('OpenRouter') || error?.message?.includes('rate limit')) {
    return {
      ok: false,
      type: 'openrouter',
      message: error.message || 'Erreur avec le fournisseur IA. Veuillez réessayer.'
    };
  }

  // Network errors
  if (error?.message?.includes('network') || error?.message?.includes('fetch') || error?.message?.includes('NetworkError')) {
    return {
      ok: false,
      type: 'network',
      message: 'Erreur réseau. Vérifiez votre connexion Internet.'
    };
  }

  // Parse errors
  if (error?.message?.includes('parse') || error?.message?.includes('JSON')) {
    return {
      ok: false,
      type: 'parse',
      message: 'Erreur de traitement de la réponse IA. Veuillez réessayer.',
      raw: error?.raw
    };
  }

  // Generic unknown error
  return {
    ok: false,
    type: 'unknown',
    message: error?.message || 'Une erreur inattendue s\'est produite.'
  };
}

/**
 * Handle network request errors specifically.
 */
export function handleNetworkError(error: any): LLMError {
  return {
    ok: false,
    type: 'network',
    message: 'Impossible de se connecter au serveur. Vérifiez votre connexion.',
  };
}

/**
 * Handle JSON parsing errors.
 */
export function handleParseError(error: any, raw?: string): LLMError {
  return {
    ok: false,
    type: 'parse',
    message: 'La réponse de l\'IA est malformée. Veuillez réessayer.',
    raw
  };
}

/**
 * Handle quota exceeded errors.
 */
export function handleQuotaError(message: string): LLMError {
  return {
    ok: false,
    type: 'quota',
    message
  };
}

/**
 * Check if an error is a specific type.
 */
export function isErrorType(error: LLMError, type: LLMError['type']): boolean {
  return error.type === type;
}

/**
 * Get a user-friendly error message from an LLM error.
 */
export function getErrorMessage(error: LLMError): string {
  return error.message;
}

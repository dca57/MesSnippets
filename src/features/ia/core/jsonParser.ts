/**
 * Robust JSON parser for the IA framework.
 * Handles both strict and permissive parsing modes with recovery capabilities.
 */

import { ParsedJSON, JSONParseOptions } from './types';

/**
 * Parse JSON with configurable strictness.
 * 
 * @param rawResponse - The raw string response from LLM
 * @param options - Parsing options (strict/permissive, array field for recovery)
 * @returns Structured result with ok status and data or error
 */
export function parseJSON<T>(
  rawResponse: string,
  options: JSONParseOptions = { mode: 'permissive' }
): ParsedJSON<T> {
  const { mode, arrayField } = options;

  // Step 1: Try to clean and parse normally
  const cleaned = cleanJSONResponse(rawResponse);
  
  try {
    const parsed = JSON.parse(cleaned);
    return { ok: true, data: parsed as T };
  } catch (initialError) {
    // In strict mode, fail immediately
    if (mode === 'strict') {
      return {
        ok: false,
        raw: rawResponse,
        error: `JSON parse failed: ${(initialError as Error).message}`
      };
    }

    // In permissive mode, try recovery strategies
    console.warn('⚠️ [jsonParser] Initial parse failed, attempting recovery...');
    
    // Strategy 1: Try to recover partial JSON if array field is specified
    if (arrayField) {
      const recovered = recoverPartialArray<T>(cleaned, arrayField);
      if (recovered.length > 0) {
        console.log(`✅ [jsonParser] Recovered ${recovered.length} items from partial JSON`);
        return { ok: true, data: recovered as T };
      }
    }

    // Strategy 2: Try common fixes
    const fixed = attemptCommonFixes(cleaned);
    try {
      const parsed = JSON.parse(fixed);
      console.log('✅ [jsonParser] Successfully parsed after applying fixes');
      return { ok: true, data: parsed as T };
    } catch (fixError) {
      // All recovery attempts failed
      return {
        ok: false,
        raw: rawResponse,
        error: `JSON parse failed after recovery attempts: ${(fixError as Error).message}`
      };
    }
  }
}

/**
 * Clean JSON response by removing markdown code blocks and extra whitespace.
 */
function cleanJSONResponse(response: string): string {
  // Remove markdown code blocks
  const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
  
  let cleaned = response;
  if (jsonMatch && jsonMatch[1]) {
    cleaned = jsonMatch[1];
  }

  // Clean up whitespace and weird characters
  return cleaned
    .trim()
    .replace(/[\u0000-\u001F]+/g, ''); // remove control characters
}

/**
 * Attempt common JSON fixes for malformed responses.
 */
function attemptCommonFixes(json: string): string {
  let fixed = json;

  // Fix 1: Remove trailing commas before closing brackets
  fixed = fixed.replace(/,(\s*[}\]])/g, '$1');

  // Fix 2: Ensure proper quote escaping
  // This is tricky and might not always work, so we keep it simple

  return fixed;
}

/**
 * Recover partial array from truncated JSON.
 * Extracts complete objects from an array field even if the JSON is incomplete.
 * 
 * This is based on the existing recoverPartialJson logic but integrated into the core parser.
 */
function recoverPartialArray<T>(truncatedJson: string, arrayField: string): T[] {
  console.log(`🔧 [jsonParser] Attempting to recover array field: "${arrayField}"`);
  
  try {
    // Find the array field
    const arrayPattern = new RegExp(`"${arrayField}"\\s*:\\s*\\[`);
    const arrayMatch = truncatedJson.match(arrayPattern);
    
    if (!arrayMatch) {
      console.warn(`⚠️ [jsonParser] Could not find "${arrayField}" array in response`);
      return [];
    }

    // Get the position after the opening bracket
    const startPos = arrayMatch.index! + arrayMatch[0].length;
    const remaining = truncatedJson.substring(startPos);

    // Extract complete objects
    const objects: T[] = [];
    let depth = 0;
    let currentObj = '';
    let inString = false;
    let escapeNext = false;

    for (let i = 0; i < remaining.length; i++) {
      const char = remaining[i];

      // Handle escape sequences
      if (escapeNext) {
        currentObj += char;
        escapeNext = false;
        continue;
      }

      if (char === '\\') {
        escapeNext = true;
        currentObj += char;
        continue;
      }

      // Handle strings
      if (char === '"') {
        inString = !inString;
        currentObj += char;
        continue;
      }

      if (inString) {
        currentObj += char;
        continue;
      }

      // Track object depth
      if (char === '{') {
        depth++;
        currentObj += char;
      } else if (char === '}') {
        depth--;
        currentObj += char;

        // Complete object found
        if (depth === 0 && currentObj.trim()) {
          try {
            const parsed = JSON.parse(currentObj.trim());
            objects.push(parsed as T);
            currentObj = '';
          } catch (e) {
            console.warn('⚠️ [jsonParser] Failed to parse recovered object:', e);
            currentObj = '';
          }
        }
      } else if (char === ']') {
        // End of array
        break;
      } else if (depth > 0) {
        currentObj += char;
      }
    }

    // Try to recover the last partial object if exists
    if (currentObj.trim() && depth > 0) {
      const completed = completePartialObject(currentObj);
      try {
        const parsed = JSON.parse(completed);
        objects.push(parsed as T);
        console.log('✅ [jsonParser] Recovered partial object');
      } catch (e) {
        console.warn('⚠️ [jsonParser] Failed to parse partial object even after completion');
      }
    }

    console.log(`✅ [jsonParser] Recovered ${objects.length} complete objects`);
    return objects;

  } catch (error) {
    console.error('❌ [jsonParser] Error in recovery:', error);
    return [];
  }
}

/**
 * Complete a partial JSON object by closing unterminated strings, arrays, and objects.
 */
function completePartialObject(partial: string): string {
  let completed = partial;

  // Close unterminated strings (odd number of unescaped quotes)
  const quoteCount = (completed.match(/(?<!\\)"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    completed += '"';
  }

  // Close unclosed arrays
  const openBrackets = (completed.match(/\[/g) || []).length;
  const closeBrackets = (completed.match(/\]/g) || []).length;
  completed += ']'.repeat(openBrackets - closeBrackets);

  // Close unclosed objects
  const openBraces = (completed.match(/\{/g) || []).length;
  const closeBraces = (completed.match(/\}/g) || []).length;
  completed += '}'.repeat(openBraces - closeBraces);

  return completed;
}

/**
 * Type guard to check if a parsed result is successful.
 */
export function isSuccessfulParse<T>(result: ParsedJSON<T>): result is { ok: true; data: T } {
  return result.ok === true;
}

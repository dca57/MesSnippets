/**
 * Centralized prompt builder for the IA framework.
 * All prompt construction must go through this file to ensure consistency.
 */

import { PromptPart, PromptBuildOptions } from './types';

/**
 * Global JSON rules applied to all LLM prompts
 */
const JSON_RULES = `
Return ONLY valid JSON.
No comments.
No trailing text.
No markdown.
Do not break JSON into several chunks.
If you are reaching the token limit, you MUST:
- complete the current JSON object
- close arrays and objects
- STOP IMMEDIATELY
`;

/**
 * Centralized prompt builder.
 * Combines system rules, instructions, context, examples, and user input
 * into a well-structured prompt.
 * 
 * @param parts - The parts of the prompt to combine
 * @param options - Additional build options
 * @returns The complete prompt string
 */
export function buildPrompt(
  parts: PromptPart,
  options: PromptBuildOptions = {}
): string {
  const {
    includeJsonRules = true,
    customRules = [],
    metadata = {}
  } = options;

  const {
    system = '',
    instructions,
    context,
    examples = '',
    userDescription,
    maxTokens
  } = parts;

  // Build constraints section
  const constraints: string[] = [];
  
  if (maxTokens) {
    constraints.push(`IMPORTANT: Ta réponse DOIT contenir MAXIMUM ${maxTokens} tokens.`);
  }
  
  if (customRules.length > 0) {
    constraints.push(...customRules);
  }

  // Build user description section
  const userDescriptionSection = userDescription
    ? `\nDemande spécifique de l'utilisateur : "${userDescription}"`
    : '';

  // Build examples section
  const examplesSection = examples
    ? `\nEXEMPLES:\n${examples}`
    : '';

  // Build metadata section
  const metadataSection = Object.keys(metadata).length > 0
    ? `\nMETADATA:\n${JSON.stringify(metadata, null, 2)}`
    : '';

  // Assemble the complete prompt
  const promptParts = [
    system && `SYSTEM:\n${system}`,
    `CONTEXTE:\n${context}`,
    examplesSection,
    `INSTRUCTION UTILISATEUR:\n${instructions}${userDescriptionSection}`,
    constraints.length > 0 && `CONTRAINTES:\n${constraints.join('\n')}`,
    includeJsonRules && `RÉPONSE ATTENDUE:\n${JSON_RULES}`,
    metadataSection
  ];

  return promptParts
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

/**
 * Helper function to estimate the size of a prompt before building it.
 * Useful for pre-validation.
 */
export function estimatePromptSize(parts: PromptPart, options: PromptBuildOptions = {}): number {
  const prompt = buildPrompt(parts, options);
  return prompt.length;
}

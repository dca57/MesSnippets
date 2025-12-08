/**
 * Prompt builder for the IAToolExample IA tool.
 * 
 * This file contains ONLY textual prompt content.
 * No token estimation, no LLM calls, no error handling.
 */

import { PromptPart } from '../core/types';

export interface IAToolExamplePromptInput {
  categoryName: string;
  existingBookmarkUrls: string[];
  quantity: number;
  userDescription?: string;
  maxTokens?: number;
}

/**
 * Build the prompt for suggesting bookmarks.
 * Returns structured prompt parts for the core promptBuilder.
 */
export function buildIAToolExamplePrompt(
  input: IAToolExamplePromptInput
): PromptPart {
  const { categoryName, existingBookmarkUrls, quantity, userDescription, maxTokens } = input;

  const context = `
Catégorie cible : "${categoryName}"

Bookmarks urls déjà existantes dans la catégorie :
${existingBookmarkUrls.length > 0 ? existingBookmarkUrls.join('\n') : 'Aucune'}

Objectif :
Suggérer des bookmarks pertinents, utiles, qualitatifs et réellement exploitables pour un utilisateur humain.
`;

  // Build instructions with user description if provided
  let baseInstructions = `
Génère une liste de ${quantity} bookmarks pertinents pour la catégorie "${categoryName}".
`;

  // Add user specific request if provided
  if (userDescription && userDescription.trim()) {
    baseInstructions += `
DEMANDE SPÉCIFIQUE DE L'UTILISATEUR : "${userDescription}"
Tu DOIS prendre en compte cette demande spécifique et proposer des bookmarks qui correspondent EXACTEMENT à ce que l'utilisateur demande.
`;
  }

  baseInstructions += `
Règles :
- La description doit être courte (max 10 mots)
- Fourni 2 à 4 tags pertinents par bookmark
- Aucune redondance avec les bookmarks urls existantes donc ne me propose pas de bookmark que j'ai déjà. 
- Propose uniquement des ressources utiles, fiables ou reconnues
- Le JSON doit être COMPACT
- Retourne au maximum ce que permet la limite de tokens

Format du JSON attendu :
{
  "suggestions": [
    {
      "title": "Nom du site",
      "url": "https://...",
      "description": "Phrase courte",
      "category": "${categoryName}",
      "tags": ["tag1", "tag2"]
    }
  ],
  "summary": "Résumé court et utile (max 15 mots)"
}
`;

  return {
    context,
    instructions: baseInstructions,
    maxTokens
  };
}

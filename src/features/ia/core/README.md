# IA Core Framework Documentation

## 🎯 Philosophie

Le framework IA Core est conçu pour centraliser toute la logique de gestion des IA dans une architecture modulaire, robuste et extensible. Il élimine la duplication de code et fournit un système unifié pour tous les outils IA actuels et futurs.

### Principes clés

- **Séparation des responsabilités** : Chaque fichier a un rôle unique et bien défini
- **Réutilisabilité** : Un seul hook `useLLMEngine` pour tous les outils IA
- **Typage fort** : TypeScript strict pour éviter les erreurs
- **Gestion d'erreurs unifiée** : Tous les types d'erreurs sont catégorisés et formatés de manière cohérente
- **Performance** : Caching et optimisations intégrées

## 📁 Structure du Core

```
src/features/ia/core/
├── types.ts              # Types partagés (LLMRequest, LLMResponse, etc.)
├── promptBuilder.ts      # Construction centralisée des prompts
├── estimateTokens.ts     # Estimation de tokens avec cache
├── jsonParser.ts         # Parsing JSON robuste (strict/permissif)
├── llmErrorHandler.ts    # Gestionnaire d'erreurs centralisé
├── useLLMEngine.ts       # Hook principal pour appels LLM
└── index.ts              # Barrel export
```

## 🚀 Créer un nouvel outil IA

### Étape 1 : Créer le fichier prompt

Créer un fichier dans `src/features/ia/prompt/` :

```typescript
// src/features/ia/prompt/monOutil.prompt.ts
import { PromptPart } from '../core/types';

export interface MonOutilPromptInput {
  // Vos paramètres d'entrée
  param1: string;
  param2: number;
}

export function buildMonOutilPrompt(input: MonOutilPromptInput): PromptPart {
  const { param1, param2 } = input;

  return {
    context: `Contexte pour l'outil...`,
    instructions: `Instructions pour le LLM...`,
    // optionnel: maxTokens, system, examples
  };
}
```

**Règles importantes** :
- ❌ Pas de logique métier
- ❌ Pas d'estimation de tokens
- ❌ Pas d'appels LLM
- ✅ Uniquement du contenu textuel

### Étape 2 : Créer le hook personnalisé

```typescript
// src/features/ia/tools/MonOutil/useMonOutil.ts
import { useLLMEngine, buildPrompt } from '../../core';
import { buildMonOutilPrompt } from '../../prompt/monOutil.prompt';

export function useMonOutil() {
  const llmEngine = useLLMEngine<ReponseType>();

  const executerMonOutil = async (
    providerId: string,
    parametres: MonOutilPromptInput
  ) => {
    // 1. Construire le prompt
    const promptParts = buildMonOutilPrompt(parametres);
    const finalPrompt = buildPrompt(promptParts);

    // 2. Appeler le LLM
    const result = await llmEngine.runLLM(
      {
        providerId,
        messages: [{ role: 'user', content: finalPrompt }],
        origin: 'IA_MonOutil',
        maxTokens: 1000
      },
      {
        mode: 'permissive', // ou 'strict'
        arrayField: 'results' // si besoin de récupération partielle
      }
    );

    // 3. Traiter le résultat
    if (result.ok) {
      return result.data;
    } else {
      throw new Error(result.message);
    }
  };

  return {
    executerMonOutil,
    loading: llmEngine.loading,
    error: llmEngine.error,
    usage: llmEngine.usage
  };
}
```

### Étape 3 : Créer le composant UI

```typescript
// src/features/ia/tools/MonOutil/MonOutilModal.tsx
import { useMonOutil } from './useMonOutil';

export function MonOutilModal() {
  const { executerMonOutil, loading, error } = useMonOutil();

  const handleExecute = async () => {
    try {
      const result = await executerMonOutil(providerId, parametres);
      // Traiter le résultat
    } catch (err) {
      // Gérer l'erreur
    }
  };

  return (
    // Votre UI
    {error && <div>{error.message}</div>}
  );
}
```

## 🧮 Activer l'estimation de tokens

Pour afficher une estimation en temps réel (ex: slider de quantité) :

```typescript
import { estimatePromptTokens } from '../../core';

// Dans votre composant
const [estimatedTokens, setEstimatedTokens] = useState(0);

useEffect(() => {
  const promptParts = buildMonOutilPrompt(parametres);
  const finalPrompt = buildPrompt(promptParts);
  
  const estimation = estimatePromptTokens(
    'gemini-1.5-flash-002',
    finalPrompt,
    nombreElementsAttendus
  );
  
  setEstimatedTokens(estimation.totalEstimated);
}, [parametres]);
```

## 🔍 Appeler le LLM proprement

### Configuration de base

```typescript
const result = await llmEngine.runLLM(
  {
    providerId: string,         // ID du provider actif
    messages: Message[],        // Format standard OpenAI
    origin: string,             // Nom de l'outil (pour tracking)
    maxTokens?: number,         // Limite de tokens (optionnel)
    model?: string,             // Modèle spécifique (optionnel)
    action?: string             // Type d'action (défaut: 'generate')
  },
  {
    mode: 'strict' | 'permissive',  // Mode de parsing
    arrayField?: string              // Champ array pour récupération partielle
  }
);
```

### Gestion des résultats

```typescript
if (result.ok) {
  // Succès
  const data = result.data;
  const usage = result.usage; // { prompt_tokens, completion_tokens, total_tokens }
} else {
  // Erreur catégorisée
  const type = result.type;    // 'openrouter' | 'network' | 'quota' | 'parse' | 'unknown'
  const message = result.message;
  const raw = result.raw;      // Réponse brute si erreur de parsing
}
```

## 📋 Conventions globales

### Règles JSON pour le LLM

Appliquées automatiquement par `buildPrompt` :

```
Return ONLY valid JSON.
No comments.
No trailing text.
No markdown.
Do not break JSON into several chunks.
If you are reaching the token limit, you MUST:
- complete the current JSON object
- close arrays and objects
- STOP IMMEDIATELY
```

### Gestion d'erreurs

Toutes les erreurs sont catégorisées :

| Type | Description |
|------|-------------|
| `openrouter` | Erreurs du provider IA (rate limits, API down) |
| `network` | Erreurs réseau (connexion, timeout) |
| `quota` | Quota de tokens dépassé |
| `parse` | Erreur de parsing JSON |
| `supabase` | Erreur edge function Supabase |
| `unknown` | Erreur non catégorisée |

## 🧪 Parsing JSON

### Mode strict

```typescript
const result = parseJSON<MonType>(rawResponse, { mode: 'strict' });
// Échoue immédiatement si JSON invalide
```

### Mode permissif (recommandé)

```typescript
const result = parseJSON<MonType>(rawResponse, { 
  mode: 'permissive',
  arrayField: 'suggestions' // Active la récupération partielle
});
// Tente de corriger et récupérer des objets partiels
```

### Récupération partielle

Si le LLM atteint la limite de tokens et coupe le JSON :

```json
{
  "suggestions": [
    {"title": "Item 1", "url": "..."},
    {"title": "Item 2", "url": 
```

Le parser récupérera automatiquement les objets complets (ici: Item 1).

## 💡 Exemple complet minimal

```typescript
// 1. Prompt file
export function buildSimplePrompt(input: { query: string }): PromptPart {
  return {
    context: `Query: ${input.query}`,
    instructions: 'Réponds en JSON: { "answer": "..." }'
  };
}

// 2. Hook
export function useSimpleTool() {
  const llm = useLLMEngine<{ answer: string }>();
  
  const execute = async (query: string, providerId: string) => {
    const prompt = buildPrompt(buildSimplePrompt({ query }));
    const result = await llm.runLLM({
      providerId,
      messages: [{ role: 'user', content: prompt }],
      origin: 'IA_SimpleTool'
    });
    
    return result.ok ? result.data : null;
  };
  
  return { execute, loading: llm.loading, error: llm.error };
}

// 3. Composant
export function SimpleTool() {
  const { execute, loading, error } = useSimpleTool();
  
  const handleClick = async () => {
    const data = await execute('test', providerId);
    console.log(data?.answer);
  };
  
  return <button onClick={handleClick}>Execute</button>;
}
```

## 🎓 Bonnes pratiques

1. **Toujours utiliser `useLLMEngine`** pour les appels LLM
2. **Séparer prompt et logique** : un fichier `.prompt.ts` par outil
3. **Typer fortement** : définir les interfaces de réponse LLM
4. **Mode permissif en prod** : permet la récupération partielle
5. **Estimer les tokens** : afficher à l'utilisateur avant génération
6. **Catégoriser les erreurs** : utiliser `error.type` pour l'UX
7. **Logger intelligemment** : garder les console.log pour debugging

## 🔧 Maintenance

### Ajouter un nouveau type d'erreur

Modifier `llmErrorHandler.ts` :

```typescript
// Ajouter le type dans types.ts
export type LLMError = {
  type: '...' | 'nouveau_type';
  // ...
};

// Ajouter le handler
export function handleNouveauTypeError(): LLMError {
  return { ok: false, type: 'nouveau_type', message: '...' };
}
```

### Optimiser l'estimation de tokens

Le cache dans `estimateTokens.ts` garde les encodings en mémoire.
Pour libérer :

```typescript
import { clearEncodingCache } from '@/features/ia/core';

// En cleanup (ex: unmount)
clearEncodingCache();
```

## 📊 Architecture simplifiée

```
┌─────────────┐
│  Composant  │
│     UI      │
└──────┬──────┘
       │ utilise
       ▼
┌─────────────┐
│   Hook      │◄──── buildPrompt({ ...buildToolPrompt(...) })
│  useTool()  │
└──────┬──────┘
       │ appelle
       ▼
┌─────────────┐
│ useLLMEngine│◄──── estimateTokens(...)
│             │◄──── parseJSON(...)
│             │◄──── handleLLMError(...)
└──────┬──────┘
       │ invoke
       ▼
┌─────────────┐
│  llm-proxy  │
│   (Edge)    │
└─────────────┘
```

---

**Questions ? Bugs ?** Contactez l'équipe DevOps ou consultez le code source dans `src/features/ia/core/`.

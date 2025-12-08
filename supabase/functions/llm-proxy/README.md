# LLM Proxy Edge Function

## Description
Cette Edge Function sert de proxy sécurisé pour les appels aux APIs LLM. Elle gère :
- L'authentification utilisateur
- La vérification des quotas
- Le stockage sécurisé des clés API
- L'enregistrement de l'utilisation

## Déploiement

### Prérequis
1. Installer Supabase CLI :
   ```bash
   npm install -g supabase
   ```

2. Se connecter à votre projet :
   ```bash
   supabase login
   supabase link --project-ref <your-project-ref>
   ```

### Déployer la fonction
```bash
supabase functions deploy llm-proxy
```

### Variables d'environnement
Les variables suivantes sont automatiquement disponibles :
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Si vous avez besoin d'ajouter des variables customisées :
```bash
supabase secrets set MY_SECRET=value
```

## Utilisation

Depuis le client (React), appelez la fonction via :
```typescript
const { data, error } = await supabase.functions.invoke('llm-proxy', {
  body: {
    action: 'test',
    providerId: 'uuid-du-modele',
    prompt: 'Bonjour, qui es-tu ?',
  },
});
```

## Providers supportés
- ✅ OpenAI (GPT-3.5, GPT-4, etc.)
- 🚧 Anthropic (Claude) - À implémenter
- 🚧 Mistral AI - À implémenter
- 🚧 Ollama (Local) - À implémenter

## Sécurité
- Les clés API ne sont JAMAIS exposées au client
- L'authentification est vérifiée via JWT
- Les quotas sont vérifiés avant chaque appel
- Toutes les requêtes sont loguées

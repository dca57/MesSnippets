✅ IA Framework – Checklist de Tests Post-Refactor

Utilise cette checklist après chaque ajout / refactor d’un outil IA ou d’un module du framework.

1. Tests Fonctionnels
Génération de base

 L’UI démarre sans erreur

 Le hook IA (useLLMEngine) est bien appelé

 Les inputs utilisateur déclenchent bien la génération

 Le résultat JSON est bien parsé (aucune erreur silencieuse)

Données

 Les résultats sont bien stockés en base (si applicable)

 Les champs last_ia_* sont correctement mis à jour

 Les suggestions/items générés n’ont pas de doublons

2. Estimation des tokens

 Le slider met bien à jour l’estimation

 estimateTokens() calcule correctement input + output

 L’estimation est cohérente (< 20% d’erreur)

 Le modèle Free / Pro applique bien ses limites

 L’UI affiche correctement les tokens restants

3. LLM Call + Edge Function

 L’appel à l’Edge Function renvoie un status 200

 max_tokens envoyé correspond bien à l'estimation

 Le choix du modèle (Free / Pro) est bien transmis

 Les logs Edge Function sont propres (supabase functions logs)

 En cas d’erreur, le hook renvoie une erreur propre

4. Parsing & Sécurité JSON

 jsonParser renvoie bien { ok: true } dans les bons cas

 Le mode permissif récupère les JSON partiels

 Aucune chaîne “Explanation:” ou texte hors JSON dans la sortie

 Les règles globales (Return ONLY valid JSON, etc.) sont bien appliquées

5. Erreurs gérées proprement

 API Key invalid → message clair

 Quota dépassé → message clair

 Timeout → message clair

 Réseau indisponible → message clair

 Erreur JSON → message clair

 Aucune erreur silencieuse en console

6. UI/UX

 Le bouton “Générer” passe bien en état loading

 L’erreur s’affiche proprement en UI

 Le composant se réactive après erreur

 Le design reste cohérent (spacing / couleurs)

 Les interactions rapides (spam click) sont bien gérées

7. Performance

 Aucun freeze de l’UI

 Pas plus de 1 appel LLM par clic

 Les dépendances du hook sont correctes (pas de re-renders en boucle)

 Le token Estimator est mémoïsé ou optimisé

8. Code Review

 Aucun code mort

 Pas de duplication entre outils IA

 Fichiers core/ utilisés systématiquement

 Aucun appel direct à l’Edge Function hors useLLMEngine

 Les noms de fichiers respectent la convention
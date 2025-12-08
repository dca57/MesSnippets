import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Power,
  PowerOff,
  Send,
  Loader2,
  CheckCircle,
  XCircle,
  Sparkles,
} from 'lucide-react';
import { useAdminLLM, LLMProviderInsert } from '../../../features/admin/hooks/useAdminLLM';
import { useLLMQuota } from '../../../features/admin/hooks/useLLMQuota';

const LLM = () => {
  const {
    providers,
    loading,
    error,
    addProvider,
    updateProvider,
    deleteProvider,
    testConnection,
  } = useAdminLLM();
  
  const llmQuota = useLLMQuota();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<LLMProviderInsert>>({
    name: '',
    provider: 'openai',
    model_id: '',
    base_url: '',
    api_key: '',
    is_active: true,
    cost_per_1k_tokens: 0,
  });

  // Playground state
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateProvider(editingId, formData);
      } else {
        await addProvider(formData as LLMProviderInsert);
      }
      setIsFormOpen(false);
      setEditingId(null);
      setFormData({
        name: '',
        provider: 'openai',
        model_id: '',
        base_url: '',
        api_key: '',
        is_active: true,
        cost_per_1k_tokens: 0,
      });
    } catch (err) {
      console.error(err);
      alert('Erreur lors de la sauvegarde du modèle');
    }
  };

  const handleEdit = (provider: any) => {
    setEditingId(provider.id);
    setFormData({
      name: provider.name,
      provider: provider.provider,
      model_id: provider.model_id,
      base_url: provider.base_url || '',
      api_key: provider.api_key || '',
      is_active: provider.is_active,
      cost_per_1k_tokens: provider.cost_per_1k_tokens || 0,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce modèle ?')) {
      try {
        await deleteProvider(id);
      } catch (err) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      await updateProvider(id, { is_active: !currentState });
    } catch (err) {
      alert('Erreur lors de la modification');
    }
  };

  const handleTest = async () => {
    if (!selectedModel || !prompt) {
      alert('Veuillez sélectionner un modèle et saisir un prompt');
      return;
    }

    // Check quota before testing
    if (!llmQuota.canUse) {
      alert(llmQuota.message || 'Quota mensuel dépassé');
      return;
    }

    setTestLoading(true);
    setTestError(null);
    setResponse('');

    try {
      const result = await testConnection(selectedModel, prompt, 'Admin_Config_LLM');
      setResponse(result.response || 'Pas de réponse');
    } catch (err: any) {
      setTestError(err.message || 'Erreur de connexion');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <Sparkles className="text-purple-500" size={28} />
            Configuration LLM
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Gérez vos modèles IA et testez-les en temps réel
          </p>
        </div>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setEditingId(null);
            setFormData({
              name: '',
              provider: 'openai',
              model_id: '',
              base_url: '',
              api_key: '',
              is_active: true,
              cost_per_1k_tokens: 0,
            });
          }}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow transition-colors"
        >
          <Plus size={18} />
          Ajouter un modèle
        </button>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-800 p-4 rounded-lg text-red-800 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Modal de formulaire */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 border border-slate-300 dark:border-slate-700">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">
              {editingId ? 'Modifier le modèle' : 'Nouveau modèle'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom d'affichage
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  placeholder="GPT-4 Turbo"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Provider
                </label>
                <select
                  value={formData.provider}
                  onChange={(e) => {
                    const newProvider = e.target.value;
                    setFormData({
                      ...formData,
                      provider: newProvider,
                      base_url: newProvider === 'openrouter' ? 'https://openrouter.ai/api/v1' : formData.base_url,
                    });
                  }}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                >
                  <option value="openai">OpenAI</option>
                  <option value="anthropic">Anthropic</option>
                  <option value="mistral">Mistral AI</option>
                  <option value="openrouter">OpenRouter</option>
                  <option value="ollama">Ollama (Local)</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Model ID
                </label>
                <input
                  type="text"
                  value={formData.model_id}
                  onChange={(e) => setFormData({ ...formData, model_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  placeholder="gpt-4-turbo-preview"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Base URL (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.base_url || ''}
                  onChange={(e) => setFormData({ ...formData, base_url: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  placeholder="http://localhost:11434 (pour Ollama)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Clé API
                </label>
                <input
                  type="password"
                  value={formData.api_key || ''}
                  onChange={(e) => setFormData({ ...formData, api_key: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                  placeholder="sk-..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Coût par 1K tokens (optionnel)
                </label>
                <input
                  type="number"
                  step="0.001"
                  value={formData.cost_per_1k_tokens || 0}
                  onChange={(e) =>
                    setFormData({ ...formData, cost_per_1k_tokens: parseFloat(e.target.value) })
                  }
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active || false}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active" className="text-sm text-slate-700 dark:text-slate-300">
                  Actif
                </label>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {editingId ? 'Mettre à jour' : 'Ajouter'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="flex-1 px-4 py-2 bg-slate-300 hover:bg-slate-400 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-white rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liste des modèles */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-700">
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Modèles configurés
        </h3>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="animate-spin text-purple-500" size={32} />
          </div>
        ) : providers.length === 0 ? (
          <p className="text-center text-slate-500 py-8">
            Aucun modèle configuré. Commencez par en ajouter un.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {providers.map((provider) => (
              <div
                key={provider.id}
                className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 hover:border-purple-400 dark:hover:border-purple-500 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-white">{provider.name}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {provider.provider} · {provider.model_id}
                    </p>
                  </div>
                  <button
                    onClick={() => handleToggleActive(provider.id, provider.is_active || false)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      provider.is_active
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-slate-200 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                    }`}
                    title={provider.is_active ? 'Actif' : 'Inactif'}
                  >
                    {provider.is_active ? <Power size={16} /> : <PowerOff size={16} />}
                  </button>
                </div>

                {provider.base_url && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                    URL: {provider.base_url}
                  </p>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleEdit(provider)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/30 dark:hover:bg-blue-800/50 text-blue-700 dark:text-blue-400 rounded text-sm transition-colors"
                  >
                    <Edit2 size={14} />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(provider.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-800/50 text-red-700 dark:text-red-400 rounded text-sm transition-colors"
                  >
                    <Trash2 size={14} />
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Playground */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white">
            🧪 Playground (Test)
          </h3>
          
          {/* Quota Status */}
          <div className="text-sm">
            {llmQuota.loading ? (
              <span className="text-slate-500">Chargement quota...</span>
            ) : (
              <div className="flex flex-col items-end gap-1">
                <span className={`font-medium ${llmQuota.canUse ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {llmQuota.used.toLocaleString()} / {llmQuota.limit.toLocaleString()} tokens
                </span>
                <span className="text-xs text-slate-500">
                  {llmQuota.remaining.toLocaleString()} restants ce mois
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Modèle
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
              >
                <option value="">-- Sélectionner --</option>
                {providers
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-white h-32 resize-none"
                placeholder="Écrivez votre prompt ici..."
              />
            </div>

            <button
              onClick={handleTest}
              disabled={testLoading || !selectedModel || !prompt || !llmQuota.canUse}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 text-white rounded-lg transition-colors"
              title={!llmQuota.canUse ? llmQuota.message : undefined}
            >
              {testLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Envoi...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Tester
                </>
              )}
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Réponse
            </label>
            <div className="border border-slate-300 dark:border-slate-600 rounded-lg p-4 bg-slate-50 dark:bg-slate-900/50 h-48 overflow-y-auto">
              {testError ? (
                <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                  <XCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm">{testError}</p>
                </div>
              ) : response ? (
                <div className="flex items-start gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="text-sm text-slate-800 dark:text-white whitespace-pre-wrap">
                    {response}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-slate-500 italic">En attente...</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLM;

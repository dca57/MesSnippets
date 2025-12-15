import { useState, useEffect } from 'react';
import { Snippet } from '../types/index';
import { snippetService } from '../services/snippetService';
/**
 * Custom hook for managing snippets
 */
export function useSnippets(collectionId?: string, categoryId?: string) {
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load snippets when filters change
  useEffect(() => {
    loadSnippets();
  }, [collectionId, categoryId]);

  // Load snippets
  const loadSnippets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await snippetService.getSnippets({ collectionId, categoryId });
      setSnippets(data);
    } catch (err) {
      setError('Failed to load snippets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create snippet
  const createSnippet = async (data: Partial<Snippet>): Promise<Snippet | null> => {
    try {
      setLoading(true);
      setError(null);
      const newSnippet = await snippetService.createSnippet(data);
      setSnippets(prev => [...prev, newSnippet]);
      return newSnippet;
    } catch (err) {
      setError('Failed to create snippet');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update snippet
  const updateSnippet = async (id: string, updates: Partial<Snippet>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await snippetService.updateSnippet(id, updates);
      if (updated) {
        setSnippets(prev => prev.map(s => s.id === id ? updated : s));
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to update snippet');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete snippet
  const deleteSnippet = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await snippetService.deleteSnippet(id);
      if (success) {
        setSnippets(prev => prev.filter(s => s.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to delete snippet');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Move snippet
  const moveSnippet = async (snippetId: string, direction: 'up' | 'down') => {
    try {
       setLoading(true);
       setError(null);
       const updatedSnippets = await snippetService.moveSnippet(snippetId, direction, snippets);
       setSnippets(updatedSnippets);
       return true;
    } catch (err) {
       setError('Failed to move snippet');
       console.error(err);
       return false;
    } finally {
       setLoading(false);
    }
  };

  const reorderSnippets = async (newSnippets: Snippet[]) => {
      setSnippets(newSnippets);
      try {
          await snippetService.reorderSnippets(newSnippets);
      } catch (err) {
          console.error("Failed to reorder snippets", err);
          setError("Failed to reorder snippets");
          loadSnippets();
      }
  };

  return {
    snippets,
    loading,
    error,
    createSnippet,
    updateSnippet,
    deleteSnippet,
    moveSnippet,
    reorderSnippets,
    reload: loadSnippets
  };
}

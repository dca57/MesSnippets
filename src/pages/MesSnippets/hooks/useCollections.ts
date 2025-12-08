import { useState, useEffect } from 'react';
import { Collection } from '../types/index';
import { collectionService } from '../services/collectionService';
/**
 * Custom hook for managing collections
 */
export function useCollections() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeCollectionId, setActiveCollectionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load collections
  useEffect(() => {
    loadCollections();
  }, []);

  // Load collections
  const loadCollections = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await collectionService.getCollections();
      setCollections(data);
      
      // Set first collection as active if none selected
      if (!activeCollectionId && data.length > 0) {
        setActiveCollectionId(data[0].id);
      }
    } catch (err) {
      setError('Failed to load collections');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create collection
  const createCollection = async (data: Partial<Collection>): Promise<Collection | null> => {
    try {
      setLoading(true);
      setError(null);
      const newCollection = await collectionService.createCollection(data);
      setCollections(prev => [...prev, newCollection]);
      return newCollection;
    } catch (err) {
      setError('Failed to create collection');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update collection
  const updateCollection = async (id: string, updates: Partial<Collection>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await collectionService.updateCollection(id, updates);
      if (updated) {
        setCollections(prev => prev.map(c => c.id === id ? updated : c));
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to update collection');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete collection
  const deleteCollection = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await collectionService.deleteCollection(id);
      if (success) {
        setCollections(prev => prev.filter(c => c.id !== id));
        if (activeCollectionId === id) {
          const remaining = collections.filter(c => c.id !== id);
          setActiveCollectionId(remaining.length > 0 ? remaining[0].id : null);
        }
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to delete collection');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Get active collection
  const activeCollection = collections.find(c => c.id === activeCollectionId) || null;

  return {
    collections,
    activeCollectionId,
    activeCollection,
    loading,
    error,
    setActiveCollectionId,
    createCollection,
    updateCollection,
    deleteCollection,
    reload: loadCollections
  };
}

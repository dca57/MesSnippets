import { useState, useEffect } from 'react';
import { Category } from '../types/index';
import { categoryService } from '../services/categoryService';
/**
 * Custom hook for managing categories
 */
export function useCategories(collectionId?: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load categories when collection changes
  useEffect(() => {
    if (collectionId) {
      loadCategories();
    }
  }, [collectionId]);

  // Load categories
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getCategories(collectionId);
      setCategories(data);
    } catch (err) {
      setError('Failed to load categories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Create category
  const createCategory = async (data: Partial<Category>): Promise<Category | null> => {
    try {
      setLoading(true);
      setError(null);
      const newCategory = await categoryService.createCategory(data);
      setCategories(prev => [...prev, newCategory]);
      return newCategory;
    } catch (err) {
      setError('Failed to create category');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update category
  const updateCategory = async (id: string, updates: Partial<Category>): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await categoryService.updateCategory(id, updates);
      if (updated) {
        setCategories(prev => prev.map(c => c.id === id ? updated : c));
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to update category');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Delete category
  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const success = await categoryService.deleteCategory(id);
      if (success) {
        setCategories(prev => prev.filter(c => c.id !== id));
        return true;
      }
      return false;
    } catch (err) {
      setError('Failed to delete category');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Move category
  const moveCategory = async (categoryId: string, direction: 'up' | 'down'): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const updated = await categoryService.moveCategory(categoryId, direction, categories);
      setCategories(updated);
      return true;
    } catch (err) {
      setError('Failed to move category');
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    moveCategory,
    reload: loadCategories
  };
}

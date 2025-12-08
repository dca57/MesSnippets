import { useState, useCallback } from 'react';

/**
 * Custom hook for managing expanded/collapsed state
 */
export function useExpanded(initialIds: string[] = []) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(initialIds));

  const toggle = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const expand = useCallback((id: string) => {
    setExpandedIds(prev => new Set(prev).add(id));
  }, []);

  const collapse = useCallback((id: string) => {
    setExpandedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

  const expandAll = useCallback((ids: string[]) => {
    setExpandedIds(new Set(ids));
  }, []);

  const collapseAll = useCallback(() => {
    setExpandedIds(new Set());
  }, []);

  const isExpanded = useCallback((id: string) => {
    return expandedIds.has(id);
  }, [expandedIds]);

  return {
    expandedIds,
    toggle,
    expand,
    collapse,
    expandAll,
    collapseAll,
    isExpanded
  };
}

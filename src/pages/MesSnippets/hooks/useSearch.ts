import { useState, useMemo } from 'react';

/**
 * Custom hook for search functionality
 */
export function useSearch<T>(
  items: T[],
  searchFn: (item: T, query: string) => boolean
) {
  const [query, setQuery] = useState('');

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    return items.filter(item => searchFn(item, query));
  }, [items, query, searchFn]);

  const clearSearch = () => setQuery('');

  return {
    query,
    setQuery,
    filteredItems,
    clearSearch,
    hasQuery: query.trim().length > 0
  };
}

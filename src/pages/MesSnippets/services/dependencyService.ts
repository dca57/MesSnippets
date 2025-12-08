import { Snippet } from '../types/index';

/**
 * Dependency Service - Helper functions for snippet dependencies
 */

export const dependencyService = {
  /**
   * Get all snippets that depend on a given snippet
   */
  getDependentSnippets(snippetId: string, allSnippets: Snippet[]): Snippet[] {
    return allSnippets.filter(snippet =>
      snippet.dependencies?.includes(snippetId)
    );
  },

  /**
   * Get all snippets that a given snippet depends on
   */
  getDependencies(snippet: Snippet, allSnippets: Snippet[]): Snippet[] {
    if (!snippet.dependencies || snippet.dependencies.length === 0) {
      return [];
    }
    
    return snippet.dependencies
      .map(depId => allSnippets.find(s => s.id === depId))
      .filter(Boolean) as Snippet[];
  },

  /**
   * Calculate dependents count for all snippets
   */
  calculateDependentsCount(snippets: Snippet[]): Record<string, number> {
    const counts: Record<string, number> = {};
    
    // Initialize counts
    snippets.forEach(s => {
      counts[s.id] = 0;
    });
    
    // Count dependencies
    snippets.forEach(s => {
      if (s.dependencies) {
        s.dependencies.forEach(depId => {
          if (counts[depId] !== undefined) {
            counts[depId]++;
          }
        });
      }
    });
    
    return counts;
  },

  /**
   * Check for circular dependencies
   */
  hasCircularDependency(
    snippet: Snippet,
    newDependencyId: string,
    allSnippets: Snippet[]
  ): boolean {
    const visited = new Set<string>();
    
    const checkCircular = (currentId: string): boolean => {
      if (currentId === snippet.id) return true;
      if (visited.has(currentId)) return false;
      
      visited.add(currentId);
      
      const current = allSnippets.find(s => s.id === currentId);
      if (!current || !current.dependencies) return false;
      
      return current.dependencies.some(depId => checkCircular(depId));
    };
    
    return checkCircular(newDependencyId);
  },

  /**
   * Validate dependencies before saving
   */
  validateDependencies(
    snippet: Snippet,
    dependencies: string[],
    allSnippets: Snippet[]
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Check if dependencies exist
    dependencies.forEach(depId => {
      if (!allSnippets.find(s => s.id === depId)) {
        errors.push(`Dependency ${depId} not found`);
      }
    });
    
    // Check for self-dependency
    if (dependencies.includes(snippet.id)) {
      errors.push('Cannot depend on itself');
    }
    
    // Check for circular dependencies
    dependencies.forEach(depId => {
      if (this.hasCircularDependency(snippet, depId, allSnippets)) {
        errors.push(`Circular dependency detected with ${depId}`);
      }
    });
    
    return {
      valid: errors.length === 0,
      errors
    };
  },

  /**
   * Get dependency tree (all dependencies recursively)
   */
  getDependencyTree(snippet: Snippet, allSnippets: Snippet[]): Snippet[] {
    const result: Snippet[] = [];
    const visited = new Set<string>();
    
    const traverse = (currentSnippet: Snippet) => {
      if (!currentSnippet.dependencies) return;
      
      currentSnippet.dependencies.forEach(depId => {
        if (visited.has(depId)) return;
        
        visited.add(depId);
        const dep = allSnippets.find(s => s.id === depId);
        if (dep) {
          result.push(dep);
          traverse(dep);
        }
      });
    };
    
    traverse(snippet);
    return result;
  }
};

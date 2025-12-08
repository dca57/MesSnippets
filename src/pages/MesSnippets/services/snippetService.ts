import { supabase } from '../../../supabase/config';
import { Database } from '../../../supabase/types';
import { Snippet } from '../types/index';

type SnippetRow = Database['public']['Tables']['sni_snippets']['Row'];
type SnippetInsert = Database['public']['Tables']['sni_snippets']['Insert'];
type SnippetUpdate = Database['public']['Tables']['sni_snippets']['Update'];

const mapToSnippet = (row: SnippetRow): Snippet => ({
  id: row.id,
  title: row.title,
  code: row.code,
  categoryId: row.category_id,
  tags: row.tags || [],
  description: row.description || undefined,
  dependencies: row.dependencies || [],
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userId: row.user_id,
  order: row.order,
  is_admin_compatible: (row as any).is_admin_compatible ?? true, // Default to true if null (migration handles this but for safety)
  is_coloration_compatible: (row as any).is_coloration_compatible ?? true
});

export const snippetService = {
  /**
   * Get all snippets, optionally filtered
   */
  async getSnippets(filters?: {
    collectionId?: string;
    categoryId?: string;
  }): Promise<Snippet[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('sni_snippets')
      .select('*')
      .eq('user_id', user.id);

    if (filters?.categoryId) {
      query = query.eq('category_id', filters.categoryId);
    }
    
    // Note: Filtering by collectionId requires a join or two queries because snippet doesn't have collectionId.
    // However, usually we filter by categoryId. 
    // If collectionId is provided, we might need to filter categories first, or just rely on the fact that UI usually passes categoryId.
    // If strict collection filtering is needed without category, we'd need a join with sni_categories.
    // For now, assuming categoryId is the primary filter or we fetch all.
    // If only collectionId is passed, this implementation fetches all user snippets.
    // Let's refine IF collectionId is passed but not categoryId (rare case in UI tree view usually fetches by category or all)

    const { data, error } = await query;

    if (error) throw error;
    
    // Sort logic can be done here or in DB. DB sort by created_at desc is good default?
    // Let's sort by updated_at desc for now as latest first
    const snippets = (data || []).map(mapToSnippet);
    return snippets.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  /**
   * Get a single snippet by ID
   */
  async getSnippet(id: string): Promise<Snippet | null> {
    const { data, error } = await supabase
      .from('sni_snippets')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return mapToSnippet(data);
  },

  /**
   * Create a new snippet
   */
  async createSnippet(data: Partial<Snippet>): Promise<Snippet> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get max order in category
    const { data: maxOrderData } = await supabase
      .from('sni_snippets')
      .select('order')
      .eq('category_id', data.categoryId)
      .order('order', { ascending: false })
      .limit(1)
      .returns<{ order: number }[]>();

    const maxOrder = maxOrderData?.[0]?.order ?? -1;

    const newSnippet: SnippetInsert = {
      user_id: user.id,
      category_id: data.categoryId,
      title: data.title || 'Untitled Snippet',
      code: data.code || '',
      description: data.description,
      tags: data.tags,
      dependencies: data.dependencies,
      order: maxOrder + 1,
      is_coloration_compatible: data.is_coloration_compatible ?? true
    };

    const { data: created, error } = await (supabase
      .from('sni_snippets') as any)
      .insert(newSnippet)
      .select()
      .single();

    if (error) throw error;
    return mapToSnippet(created);
  },

  /**
   * Update an existing snippet
   */
  async updateSnippet(id: string, updates: Partial<Snippet>): Promise<Snippet | null> {
    const updateData: SnippetUpdate = {
      title: updates.title,
      code: updates.code,
      category_id: updates.categoryId,
      description: updates.description,
      tags: updates.tags,
      dependencies: updates.dependencies,
      order: updates.order,
      is_admin_compatible: updates.is_admin_compatible,
      is_coloration_compatible: updates.is_coloration_compatible
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => 
      (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    const { data, error } = await (supabase
      .from('sni_snippets') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToSnippet(data);
  },

  /**
   * Delete a snippet
   */
  async deleteSnippet(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sni_snippets')
      .delete()
      .eq('id', id);

    return !error;
  },

  /**
   * Move snippet up or down
   */
  async moveSnippet(
    snippetId: string,
    direction: 'up' | 'down',
    snippets: Snippet[]
  ): Promise<Snippet[]> {
    const snippetToMove = snippets.find(s => s.id === snippetId);
    if (!snippetToMove) return snippets;

    // Filter siblings in the same category and sort them by order
    const siblings = snippets
      .filter(s => s.categoryId === snippetToMove.categoryId)
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    
    const index = siblings.findIndex(s => s.id === snippetId);
    if (index === -1) return snippets;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= siblings.length) return snippets;
    
    // Swap in the siblings array
    const reorderedSiblings = [...siblings];
    [reorderedSiblings[index], reorderedSiblings[newIndex]] = [reorderedSiblings[newIndex], reorderedSiblings[index]];
    
    // Update order in DB for modified siblings (and potentially others to resolve gaps/duplicates if we wanted strictly sequential, but simple swap is enough usually)
    // Actually, to be safe and robust, we should re-assign order to all siblings to strictly 0..N
    // But for performance, sending updates only for the two swapped items is better if we trust the sequence.
    // Let's update all siblings to ensure clean sequence 0, 1, 2...
    
    const updates = reorderedSiblings.map((snippet, idx) => ({
       id: snippet.id,
       order: idx
    }));

    // We only need to optimize this by only updating those who changed order? 
    // If we re-normalize the whole list 0..N, we might update evryone.
    // Let's just update the two swapped items if their orders were adjacent. 
    // IF the logic beforehand was "max + 1", we might have 0, 1, 5, 10. 
    // If we just swap, 0, 1, 10, 5. Order is preserved.
    // Ideally we want 0, 1, 2, 3. 
    // Let's update all siblings to normalize them. It's safer.
    
    const updatePromises = reorderedSiblings.map((s, idx) => 
      (supabase.from('sni_snippets') as any)
      .update({ order: idx })
      .eq('id', s.id)
      .select()
      .single()
    );

    const results = await Promise.all(updatePromises);
    
    // Reconstruct the full list
    // We can just replace the siblings in the original list with the updated ones
    // But simpler: Map original list, if id matches a sibling, use the updated sibling data.
    
    // Map of updated siblings
    const updatedSiblingsMap = new Map<string, Snippet>();
    results.forEach(res => {
        if (res.data) updatedSiblingsMap.set(res.data.id, mapToSnippet(res.data));
    });

    return snippets.map(s => {
        if (updatedSiblingsMap.has(s.id)) {
            return updatedSiblingsMap.get(s.id)!;
        }
        return s;
    });
  },

  /**
   * Search snippets
   * Note: This currently filters client-side (after fetching).
   * For large datasets, this should move to a Supabase text search query.
   */
  searchSnippets(snippets: Snippet[], query: string): Snippet[] {
    if (!query.trim()) return snippets;
    
    const lowerQuery = query.toLowerCase();
    return snippets.filter(snippet =>
      snippet.title.toLowerCase().includes(lowerQuery) ||
      snippet.description?.toLowerCase().includes(lowerQuery) ||
      snippet.code.toLowerCase().includes(lowerQuery) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  },

  /**
   * Initialize mock data (temporary)
   */
  _initMockData(snippets: Snippet[]) {
    console.warn('_initMockData is deprecated in Supabase implementation');
  }
};

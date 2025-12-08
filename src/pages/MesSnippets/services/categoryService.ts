import { supabase } from '../../../supabase/config';
import { Database } from '../../../supabase/types';
import { Category } from '../types/index';

type CategoryRow = Database['public']['Tables']['sni_categories']['Row'];
type CategoryInsert = Database['public']['Tables']['sni_categories']['Insert'];
type CategoryUpdate = Database['public']['Tables']['sni_categories']['Update'];

const mapToCategory = (row: CategoryRow): Category => ({
  id: row.id,
  name: row.name,
  collectionId: row.collection_id,
  description: row.description || undefined,
  icon: row.icon || undefined,
  color: row.color || undefined,
  order: row.order,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

export const categoryService = {
  /**
   * Get all categories, optionally filtered by collection
   */
  async getCategories(collectionId?: string): Promise<Category[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('sni_categories')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (collectionId) {
      query = query.eq('collection_id', collectionId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return (data || []).map(mapToCategory);
  },

  /**
   * Get a single category by ID
   */
  async getCategory(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from('sni_categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return mapToCategory(data);
  },

  /**
   * Create a new category
   */
  async createCategory(data: Partial<Category>): Promise<Category> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    if (!data.collectionId) throw new Error('Collection ID is required');

    // Get max order
    const { data: maxOrderData } = await supabase
      .from('sni_categories')
      .select('order')
      .eq('user_id', user.id)
      .eq('collection_id', data.collectionId)
      .order('order', { ascending: false })
      .limit(1)
      .returns<{ order: number }[]>();

    const maxOrder = maxOrderData?.[0]?.order ?? -1;

    const newCategory: CategoryInsert = {
      user_id: user.id,
      collection_id: data.collectionId,
      name: data.name || 'New Category',
      description: data.description,
      icon: data.icon,
      color: data.color,
      order: maxOrder + 1
    };


    const { data: created, error } = await (supabase
      .from('sni_categories') as any)
      .insert(newCategory)
      .select()
      .single();

    if (error) throw error;
    return mapToCategory(created);
  },

  /**
   * Update an existing category
   */
  async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const updateData: CategoryUpdate = {
      name: updates.name,
      collection_id: updates.collectionId, // Important mapping
      description: updates.description,
      icon: updates.icon,
      color: updates.color,
      order: updates.order,
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => 
      (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    const { data, error } = await (supabase
      .from('sni_categories') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToCategory(data);
  },

  /**
   * Delete a category
   */
  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sni_categories')
      .delete()
      .eq('id', id);

    return !error;
  },

  /**
   * Move category up or down
   */
  async moveCategory(
    categoryId: string,
    direction: 'up' | 'down',
    categories: Category[]
  ): Promise<Category[]> {
    const index = categories.findIndex(c => c.id === categoryId);
    if (index === -1) return categories;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= categories.length) return categories;
    
    const reordered = [...categories];
    [reordered[index], reordered[newIndex]] = [reordered[newIndex], reordered[index]];
    
    const updates = reordered.map((cat, idx) => 
      (supabase
        .from('sni_categories') as any)
        .update({ order: idx })
        .eq('id', cat.id)
        .select()
        .single()
    );

    const results = await Promise.all(updates);
    
    const updatedCategories: Category[] = [];
    for (const res of results) {
       if (res.data) {
         updatedCategories.push(mapToCategory(res.data));
       }
    }
    
    return updatedCategories.sort((a, b) => a.order - b.order);
  },

  /**
   * Initialize mock data (temporary)
   */
  _initMockData(categories: Category[]) {
    console.warn('_initMockData is deprecated in Supabase implementation');
  }
};

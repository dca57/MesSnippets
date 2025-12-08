import { supabase } from '../../../supabase/config';
import { Database } from '../../../supabase/types';
import { Collection } from '../types/index';

type CollectionRow = Database['public']['Tables']['sni_collections']['Row'];
type CollectionInsert = Database['public']['Tables']['sni_collections']['Insert'];
type CollectionUpdate = Database['public']['Tables']['sni_collections']['Update'];

const mapToCollection = (row: CollectionRow): Collection => ({
  id: row.id,
  name: row.name,
  description: row.description || undefined,
  language: row.language,
  icon: row.icon || undefined,
  color: row.color || undefined,
  order: row.order,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
  userId: row.user_id
});

export const collectionService = {
  /**
   * Get all collections for the current user
   */
  async getCollections(): Promise<Collection[]> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('sni_collections')
      .select('*')
      .eq('user_id', user.id)
      .order('order', { ascending: true });

    if (error) throw error;
    return (data || []).map(mapToCollection);
  },

  /**
   * Get a single collection by ID
   */
  async getCollection(id: string): Promise<Collection | null> {
    const { data, error } = await supabase
      .from('sni_collections')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return mapToCollection(data);
  },

  /**
   * Create a new collection
   */
  async createCollection(data: Partial<Collection>): Promise<Collection> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get max order
    const { data: maxOrderData } = await supabase
      .from('sni_collections')
      .select('order')
      .eq('user_id', user.id)
      .order('order', { ascending: false })
      .limit(1)
      .returns<{ order: number }[]>();

    const maxOrder = maxOrderData?.[0]?.order ?? -1;

    const newCollection: CollectionInsert = {
      user_id: user.id,
      name: data.name || 'New Collection',
      description: data.description,
      language: data.language || 'javascript',
      icon: data.icon,
      color: data.color,
      order: maxOrder + 1
    };

    const { data: created, error } = await (supabase
      .from('sni_collections') as any)
      .insert(newCollection)
      .select()
      .single();

    if (error) throw error;
    return mapToCollection(created);
  },

  /**
   * Update an existing collection
   */
  async updateCollection(id: string, updates: Partial<Collection>): Promise<Collection | null> {
    const updateData: CollectionUpdate = {
      name: updates.name,
      description: updates.description,
      language: updates.language,
      icon: updates.icon,
      color: updates.color,
      order: updates.order,
      // created_at and user_id should not be updated generally
    };

    // Remove undefined keys
    Object.keys(updateData).forEach(key => 
      (updateData as any)[key] === undefined && delete (updateData as any)[key]
    );

    const { data, error } = await (supabase
      .from('sni_collections') as any)
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return mapToCollection(data);
  },

  /**
   * Delete a collection
   */
  async deleteCollection(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('sni_collections')
      .delete()
      .eq('id', id);

    return !error;
  },

  /**
   * Reorder collections
   */
  async reorderCollections(collections: Collection[]): Promise<Collection[]> {
    // This is a bit inefficient to do one by one, but reliable.
    // Alternatively can use an RPC function if available.
    // For now, simple concurrent updates.
    
    const updates = collections.map((col, index) => 
      (supabase
        .from('sni_collections') as any)
        .update({ order: index })
        .eq('id', col.id)
        .select()
        .single()
    );

    const results = await Promise.all(updates);
    
    const updatedCollections: Collection[] = [];
    for (const res of results) {
      if (res.data) {
        updatedCollections.push(mapToCollection(res.data));
      }
    }
    
    return updatedCollections.sort((a, b) => a.order - b.order);
  },

  /**
   * Initialize mock data (temporary)
   * @deprecated logic removed
   */
  _initMockData(collections: Collection[]) {
    console.warn('_initMockData is deprecated in Supabase implementation');
  }
};

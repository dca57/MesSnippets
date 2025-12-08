// Collection (top-level: programming language)
export interface Collection {
  id: string;
  name: string;              // Ex: "VBA", "Python", "TypeScript"
  description?: string;
  language: string;           // Language code for syntax highlighting
  icon?: string;              // Lucide icon name
  color?: string;             // Accent color for UI
  order: number;
  createdAt: string;
  updatedAt: string;
  userId?: string;
}

// Category (within a Collection)
export interface Category {
  id: string;
  name: string;
  collectionId: string;       // FK to Collection
  description?: string;
  icon?: string;
  color?: string;              // Color for UI customization
  order: number;
  createdAt: string;
  updatedAt: string;
}

// Snippet (within a Category)
export interface Snippet {
  id: string;
  title: string;
  code: string;
  categoryId: string;         // FK to Category
  tags: string[];             // Array of tags for filtering
  description?: string;
  dependencies?: string[];    // Array of snippet IDs this snippet depends on
  createdAt: string;
  updatedAt: string;
  userId?: string;
  order: number;
  is_admin_compatible: boolean;
  is_coloration_compatible: boolean;
}

export interface SnippetTreeNode {
  id: string;
  name: string;
  type: 'collection' | 'category' | 'snippet';
  collectionId?: string;
  categoryId?: string;
  snippetId?: string;
  children?: SnippetTreeNode[];
  expanded?: boolean;
}

export type ViewMode = 'view' | 'edit' | 'create';
export type EntityType = 'collection' | 'category' | 'snippet';

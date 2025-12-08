// --- Schema Interfaces ---

export interface ForeignKey {
  column: string;
  ref_table: string;
  ref_column: string;
}

export interface ColumnSchema {
  column_name: string;
  data_type: string;
  is_nullable: "YES" | "NO";
  default: string | null;
}

export interface TableSchema {
  table_name: string;
  columns: ColumnSchema[];
  primary_key: string[];
  foreign_keys: ForeignKey[] | null;
}

export interface DatabaseSchema {
  schema: TableSchema[];
}

// --- Query Builder Interfaces ---

export type Operator =
  | "="
  | "<>"
  | ">"
  | "<"
  | ">="
  | "<="
  | "LIKE"
  | "NOT LIKE"
  | "IN"
  | "IS NULL"
  | "IS NOT NULL"
  | "SQL";

export type JoinType = "INNER JOIN" | "LEFT JOIN" | "RIGHT JOIN" | "FULL JOIN";

export interface JoinClause {
  id: string;
  type: JoinType;
  table1: string; // The existing table (source)
  column1: string;
  table2: string; // The table being joined (target)
  column2: string;
  isAuto: boolean; // To distinguish auto-generated joins
}

export interface WhereClause {
  id: string; // Unique ID for UI handling
  table: string;
  column: string;
  operator: Operator;
  value: string;
  aggregation?: string; // Optional aggregation wrapper for HAVING clause (e.g. 'SUM')
  expression?: string; // Custom expression override (e.g. "COUNT(id) + 1")
}

export interface SelectField {
  table: string;
  column: string;
  alias?: string;
  aggregation?: string; // 'SUM', 'COUNT', etc.
  expression?: string; // Raw SQL expression if aggregation is 'Expression'
}

export interface OrderByClause {
  table: string;
  column: string;
  direction: "ASC" | "DESC";
}

export interface QueryDefinition {
  from: string; // The main table
  joins: JoinClause[]; // Explicit join definitions
  select: SelectField[];
  groupBy?: string[]; // List of "table.column" to group by
  // Changed from flat array to array of arrays to support (A AND B) OR (C AND D)
  whereGroups: WhereClause[][];
  havingGroups?: WhereClause[][]; // Same structure for HAVING clause
  orderBy?: OrderByClause[];
  limit?: number;
}

// --- Workspace / Persistence Interfaces ---

export interface FilterState {
  op: string;
  val: string;
}

export interface UIField {
  id: string;
  table: string;
  column: string;
  alias: string;
  isVisible: boolean;
  groupByType: string; // 'Group By', 'Sum', 'Where', etc.
  expression?: string; // Storage for custom expression input
  // Replaced single op/val with array of 3 filter states for OR logic
  filters: FilterState[];
  having?: FilterState; // Independent HAVING clause state
  sortDir: string;
}

export interface SavedQuery {
  id: string;
  name: string;
  schemaName: string; // Links this query to a specific schema definition
  state: {
    from: string;
    joins: JoinClause[];
    fields: UIField[];
    isGroupByActive: boolean;
    filterGroupCount: number; // Persist UI state for number of OR columns
  };
  lastModified: number;
}

export interface WorkspaceSchema {
  name: string;
  tables: TableSchema[];
}

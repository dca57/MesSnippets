import { WorkspaceSchema } from "../types/types";

export const DEFAULT_SCHEMAS: WorkspaceSchema[] = [
  {
    name: "Project Management (Default)",
    tables: [
      {
        table_name: "users",
        columns: [
          {
            column_name: "user_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "first_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "last_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "email",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "created_at",
            data_type: "timestamp",
            is_nullable: "NO",
            default: "now()",
          },
        ],
        primary_key: ["user_id"],
        foreign_keys: null,
      },
      {
        table_name: "roles",
        columns: [
          {
            column_name: "role_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "role_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
        ],
        primary_key: ["role_id"],
        foreign_keys: null,
      },
      {
        table_name: "user_roles",
        columns: [
          {
            column_name: "user_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "role_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
        ],
        primary_key: ["user_id", "role_id"],
        foreign_keys: [
          { column: "user_id", ref_table: "users", ref_column: "user_id" },
          { column: "role_id", ref_table: "roles", ref_column: "role_id" },
        ],
      },
      {
        table_name: "departments",
        columns: [
          {
            column_name: "dept_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "dept_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
        ],
        primary_key: ["dept_id"],
        foreign_keys: null,
      },
      {
        table_name: "projects",
        columns: [
          {
            column_name: "project_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "project_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "start_date",
            data_type: "date",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "end_date",
            data_type: "date",
            is_nullable: "YES",
            default: null,
          },
          {
            column_name: "dept_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
        ],
        primary_key: ["project_id"],
        foreign_keys: [
          {
            column: "dept_id",
            ref_table: "departments",
            ref_column: "dept_id",
          },
        ],
      },
      {
        table_name: "tasks",
        columns: [
          {
            column_name: "task_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "project_id",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "assigned_to",
            data_type: "integer",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "task_name",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "status",
            data_type: "character varying",
            is_nullable: "NO",
            default: null,
          },
          {
            column_name: "due_date",
            data_type: "date",
            is_nullable: "NO",
            default: null,
          },
        ],
        primary_key: ["task_id"],
        foreign_keys: [
          {
            column: "project_id",
            ref_table: "projects",
            ref_column: "project_id",
          },
          { column: "assigned_to", ref_table: "users", ref_column: "user_id" },
        ],
      },
    ],
  },
];

// Fallback empty array (kept for compatibility)
export const APP_SCHEMA = [];
export const SAMPLE_SCHEMA_DATA = [];

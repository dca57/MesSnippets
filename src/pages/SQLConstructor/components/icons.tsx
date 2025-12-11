import {
  Database,
  Table,
  Plus,
  Minus,
  Trash2, // Using Trash2 as it often looks better than Trash
  Pencil,
  Copy,
  ChevronDown,
  Key,
  Info,
  FileCode,
  GripVertical,
  GripHorizontal, // Added for resize handle
  Filter,
  ArrowUpDown, // For Sort
  Eye,
  Terminal,
  Link,
  Rocket,
  ArrowLeftRight, // For Swap
  RefreshCw,
  Wrench,
  Save,
  Upload,
  Sigma,
  Network,
  X, // Usually good to have for close buttons
  ChevronsDown,
  ChevronsUp,
  Quote,
} from "lucide-react";

export const Icons = {
  Database,
  Table,
  Plus,
  Minus,
  Trash: Trash2, // Mapping Trash to Trash2
  Pencil,
  Copy,
  ChevronDown,
  Key,
  Info,
  FileCode,
  Drag: GripVertical, // Mapping Drag to GripVertical
  ResizeHandle: GripHorizontal, // Mapping GripHorizontal
  Filter,
  Sort: ArrowUpDown,
  Eye,
  Terminal,
  Link,
  Rocket,
  Swap: ArrowLeftRight,
  Refresh: RefreshCw,
  Wrench,
  Save,
  Upload,
  Sigma,
  Network,
  Close: X,
  ExpandAll: ChevronsDown,
  CollapseAll: ChevronsUp,
  Quote,
};

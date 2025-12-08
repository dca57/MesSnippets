import React, { useState, useEffect, useRef } from "react";
import { TableSchema } from "../types/types";
import { Icons } from "./icons";

interface Position {
  x: number;
  y: number;
}
interface SchemaDiagramModalProps {
  schema: TableSchema[];
  onClose: () => void;
}

const CARD_WIDTH = 240;

export const SchemaDiagramModal: React.FC<SchemaDiagramModalProps> = ({
  schema,
  onClose,
}) => {
  const [positions, setPositions] = useState<Record<string, Position>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [offset, setOffset] = useState<Position>({ x: 0, y: 0 }); // Drag offset within node
  const containerRef = useRef<HTMLDivElement>(null);

  // Initial Layout Algorithm
  useEffect(() => {
    const newPos: Record<string, Position> = {};
    const tables = schema;
    const count = tables.length;

    // Simple Grid Layout centered
    const cols = Math.ceil(Math.sqrt(count));
    const spacingX = 320;
    const spacingY = 300;

    // Calculate center of screen roughly
    const startX = (window.innerWidth - cols * spacingX) / 2 + 100;
    const startY = 100;

    tables.forEach((table, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      newPos[table.table_name] = {
        x: startX + col * spacingX,
        y: startY + row * spacingY,
      };
    });

    setPositions(newPos);
  }, [schema]);

  const handleMouseDown = (e: React.MouseEvent, tableName: string) => {
    e.preventDefault();
    const pos = positions[tableName];
    setOffset({
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    });
    setDragging(tableName);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setPositions((prev) => ({
        ...prev,
        [dragging]: {
          x: e.clientX - offset.x,
          y: e.clientY - offset.y,
        },
      }));
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  // Calculate lines
  const connections = [];
  if (schema) {
    schema.forEach((table) => {
      if (table.foreign_keys) {
        table.foreign_keys.forEach((fk) => {
          if (positions[table.table_name] && positions[fk.ref_table]) {
            connections.push({
              from: table.table_name,
              to: fk.ref_table,
              fromCol: fk.column,
              toCol: fk.ref_column,
            });
          }
        });
      }
    });
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col text-slate-200">
      {/* Toolbar */}
      <div className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 shrink-0 z-20 shadow-lg">
        <div className="flex items-center gap-2">
          <Icons.Table className="w-5 h-5" />
          <h2 className="font-bold text-lg tracking-tight text-white">
            Schema Visualizer
          </h2>
          <span className="bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5 rounded-full border border-indigo-500/20 font-mono">
            {schema.length} Tables
          </span>
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Drag tables to rearrange • Scroll to zoom (future)
        </div>
        <button
          onClick={onClose}
          className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors border border-slate-700"
        >
          Close
        </button>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="flex-1 overflow-hidden relative cursor-grab active:cursor-grabbing bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px]"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* SVG Layer for Connections */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon points="0 0, 10 3.5, 0 7" fill="#6366f1" />
            </marker>
          </defs>
          {connections.map((conn, i) => {
            const start = positions[conn.from];
            const end = positions[conn.to];
            if (!start || !end) return null;

            // Center of the cards
            const startX = start.x + CARD_WIDTH / 2;
            const startY = start.y + CARD_WIDTH / 4; // approximate center top area
            const endX = end.x + CARD_WIDTH / 2;
            const endY = end.y + CARD_WIDTH / 4;

            // Calculate curve
            const dist = Math.abs(endX - startX);
            const controlOffset = Math.max(dist * 0.5, 50);

            const path = `M ${startX} ${startY} C ${
              startX + controlOffset
            } ${startY}, ${endX - controlOffset} ${endY}, ${endX} ${endY}`;

            return (
              <g key={i}>
                <path
                  d={path}
                  stroke="#6366f1"
                  strokeWidth="2"
                  fill="none"
                  opacity="0.5"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            );
          })}
        </svg>

        {/* Nodes */}
        {schema.map((table) => {
          const pos = positions[table.table_name];
          if (!pos) return null;

          return (
            <div
              key={table.table_name}
              className="absolute rounded-lg border border-slate-700 bg-slate-800/90 backdrop-blur-sm shadow-2xl flex flex-col overflow-hidden group hover:border-indigo-500/50 hover:ring-1 hover:ring-indigo-500/50 transition-all z-10"
              style={{
                width: CARD_WIDTH,
                transform: `translate(${pos.x}px, ${pos.y}px)`,
                boxShadow: "0 10px 40px -10px rgba(0,0,0,0.5)",
              }}
            >
              {/* Header (Drag Handle) */}
              <div
                className="bg-slate-900 border-b border-slate-700 px-3 py-2 cursor-grab active:cursor-grabbing flex items-center justify-between"
                onMouseDown={(e) => handleMouseDown(e, table.table_name)}
              >
                <span className="font-bold text-sm text-indigo-100 truncate">
                  {table.table_name}
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500/50" />
                  <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                  <div className="w-2 h-2 rounded-full bg-green-500/50" />
                </div>
              </div>

              {/* Columns */}
              <div className="p-2 space-y-1">
                {table.columns.map((col) => {
                  const isPK = table.primary_key?.includes(col.column_name);
                  const isFK = table.foreign_keys?.some(
                    (k) => k.column === col.column_name
                  );

                  return (
                    <div
                      key={col.column_name}
                      className="flex items-center justify-between text-xs px-1.5 py-1 rounded hover:bg-slate-700/50"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isPK && (
                          <Icons.Key className="text-yellow-400 w-3 h-3 shrink-0" />
                        )}
                        {isFK && !isPK && (
                          <div className="w-3 h-3 rounded-sm bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-[8px] text-indigo-300 font-bold">
                            FK
                          </div>
                        )}
                        {!isPK && !isFK && <div className="w-3 h-3" />}{" "}
                        {/* Spacer */}
                        <span
                          className={`truncate ${
                            isPK ? "font-bold text-slate-200" : "text-slate-400"
                          }`}
                        >
                          {col.column_name}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-600 font-mono ml-2 shrink-0">
                        {col.data_type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

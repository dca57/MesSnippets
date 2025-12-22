import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Icons } from "@/core/helpers/icons";
import { supabase } from "@/supabase/config";
import type { Database } from "@/supabase/types";
import { getColorClasses } from "@/pages/MesSnippets/constants";
import { ImportJsonModal } from "./ImportJsonModal";

type Collection = Database["public"]["Tables"]["sni_collections"]["Row"];
type Category = Database["public"]["Tables"]["sni_categories"]["Row"];
type Snippet = Database["public"]["Tables"]["sni_snippets"]["Row"];

interface CollectionStat {
  id: string;
  name: string;
  color: string | null;
  icon: string | null;
  categoryCount: number;
  snippetCount: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    collections: 0,
    categories: 0,
    snippets: 0,
  });
  const [collectionStats, setCollectionStats] = useState<CollectionStat[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const [collectionsRes, categoriesRes, snippetsRes] = await Promise.all([
          supabase.from("sni_collections").select("id, name, color, icon"),
          supabase.from("sni_categories").select("id, collection_id"),
          supabase.from("sni_snippets").select("id, category_id"),
        ]);

        if (collectionsRes.error) throw collectionsRes.error;
        if (categoriesRes.error) throw categoriesRes.error;
        if (snippetsRes.error) throw snippetsRes.error;

        const collections = (collectionsRes.data || []) as Collection[];
        const categories = (categoriesRes.data || []) as Category[];
        const snippets = (snippetsRes.data || []) as Snippet[];

        // Global stats
        setStats({
          collections: collections.length,
          categories: categories.length,
          snippets: snippets.length,
        });

        // Per collection stats
        const statsByCollection = collections.map((col) => {
          const colCategories = categories.filter(
            (c) => c.collection_id === col.id
          );
          const colCategoryIds = new Set(colCategories.map((c) => c.id));
          const colSnippets = snippets.filter((s) =>
            colCategoryIds.has(s.category_id)
          );

          return {
            id: col.id,
            name: col.name,
            color: col.color,
            icon: col.icon,
            categoryCount: colCategories.length,
            snippetCount: colSnippets.length,
          };
        });

        // Sort by snippetCount descending
        statsByCollection.sort((a, b) => b.snippetCount - a.snippetCount);
        setCollectionStats(statsByCollection);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const handleDownload = async () => {
    try {
      setExporting(true);
      const zip = new JSZip();

      // Fetch all data
      const [collectionsRes, categoriesRes, snippetsRes] = await Promise.all([
        supabase.from("sni_collections").select("*"),
        supabase.from("sni_categories").select("*"),
        supabase.from("sni_snippets").select("*"),
      ]);

      if (collectionsRes.error) throw collectionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (snippetsRes.error) throw snippetsRes.error;

      const collections = (collectionsRes.data || []) as Collection[];
      const categories = (categoriesRes.data || []) as Category[];
      const snippets = (snippetsRes.data || []) as Snippet[];

      // Create folder structure
      collections.forEach((collection) => {
        // Create collection folder
        const collectionFolder = zip.folder(sanitizeFilename(collection.name));
        if (!collectionFolder) return;

        // Get categories for this collection
        const colCategories = categories.filter(
          (c) => c.collection_id === collection.id
        );

        colCategories.forEach((category) => {
          // Create category folder
          const categoryFolder = collectionFolder.folder(
            sanitizeFilename(category.name)
          );
          if (!categoryFolder) return;

          // Get snippets for this category
          const catSnippets = snippets.filter(
            (s) => s.category_id === category.id
          );

          catSnippets.forEach((snippet) => {
            // Create snippet file
            // Determine extension based on collection language if possible, defaulting to .txt
            const extension = getExtensionForLanguage(collection.language);
            const fileName = `${sanitizeFilename(snippet.title)}${extension}`;
            const fileContent = snippet.code || "";

            // Add file to zip
            categoryFolder.file(fileName, fileContent);
          });
        });
      });

      // Generate zip file
      const blob = await zip.generateAsync({ type: "blob" });
      const date = new Date().toISOString().split("T")[0];
      saveAs(blob, `snippets_backup_${date}.zip`);
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Une erreur est survenue lors de l'export des données.");
    } finally {
      setExporting(false);
    }
  };

  const handleJsonExport = async () => {
    try {
      setExporting(true);

      // Fetch all data
      const [collectionsRes, categoriesRes, snippetsRes] = await Promise.all([
        supabase.from("sni_collections").select("*"),
        supabase.from("sni_categories").select("*"),
        supabase.from("sni_snippets").select("*"),
      ]);

      if (collectionsRes.error) throw collectionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (snippetsRes.error) throw snippetsRes.error;

      const data = {
        collections: (collectionsRes.data || []) as Collection[],
        categories: (categoriesRes.data || []) as Category[],
        snippets: (snippetsRes.data || []) as Snippet[],
        exportedAt: new Date().toISOString(),
        version: "1.0",
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const date = new Date().toISOString().split("T")[0];
      saveAs(blob, `snippets_full_backup_${date}.json`);
    } catch (error) {
      console.error("Error exporting JSON:", error);
      alert("Une erreur est survenue lors de l'export JSON.");
    } finally {
      setExporting(false);
    }
  };

  const sanitizeFilename = (name: string) => {
    return (
      name.replace(/[^a-z0-9àâçéèêëîïôûùüÿñæœ ._-]/gi, "_").trim() || "untitled"
    );
  };

  const getExtensionForLanguage = (language: string) => {
    const map: Record<string, string> = {
      typescript: ".ts",
      javascript: ".js",
      python: ".py",
      html: ".html",
      css: ".css",
      sql: ".sql",
      json: ".json",
      markdown: ".md",
      vba: ".vbs", // or .bas or .txt
      vb: ".vb",
    };
    return map[language.toLowerCase()] || ".txt";
  };

  const kpiCards = [
    {
      title: "Collections",
      value: stats.collections,
      icon: Icons.Boxes,
      color: "blue",
    },
    {
      title: "Catégories",
      value: stats.categories,
      icon: Icons.Folder,
      color: "amber",
    },
    {
      title: "Snippets",
      value: stats.snippets,
      icon: Icons.FileCode,
      color: "emerald",
    },
  ];

  return (
    <div className="h-full w-full p-8 overflow-y-auto bg-slate-50 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Tableau de bord
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Bienvenue dans votre gestionnaire de snippets.
          </p>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {kpiCards.map((card, index) => (
            <div
              key={index}
              className="p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4 transition-transform hover:scale-[1.02]"
            >
              <div
                className={`p-4 rounded-lg bg-${card.color}-100 dark:bg-${card.color}-900/30 text-${card.color}-600 dark:text-${card.color}-400`}
              >
                <card.icon className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  {card.title}
                </p>
                {loading ? (
                  <div className="h-8 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mt-1" />
                ) : (
                  <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                    {card.value}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Collection Stats */}
        {collectionStats.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Détails par Collection
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {collectionStats.map((col) => {
                // Determine icon component to use
                const IconComponent =
                  col.icon && (Icons as any)[col.icon]
                    ? (Icons as any)[col.icon]
                    : Icons.Folder;

                // Get color classes for icon and text
                const colorClasses = getColorClasses(col.color || "blue");

                return (
                  <div
                    key={col.id}
                    className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col justify-between transition-all hover:shadow-md group"
                    style={{ borderLeft: `3px solid ${colorClasses.hex}` }}
                    onClick={() => navigate(`/MesSnippets/collection/${col.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-md shrink-0 ${colorClasses.bgLight} ${colorClasses.text} group-hover:scale-110 transition-transform`}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3
                          className="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate"
                          title={col.name}
                        >
                          {col.name}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            <span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{col.categoryCount}</span> Cat.
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span>
                                <span className="font-medium text-slate-700 dark:text-slate-300">{col.snippetCount}</span> Snip.
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-wrap gap-4">
          <button
            onClick={handleDownload}
            disabled={exporting}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            {exporting ? (
              <Icons.Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Icons.Download className="w-5 h-5" />
            )}
            {exporting ? "Téléchargement..." : "Télécharger tout (.zip)"}
          </button>

          <div className="w-px h-12 bg-slate-200 dark:bg-slate-700 mx-2 hidden md:block"></div>

          <button
            onClick={handleJsonExport}
            disabled={exporting}
            className="px-6 py-3 bg-purple-50 dark:bg-purple-900/10 border border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-700 dark:text-purple-300 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          >
            {exporting ? (
              <Icons.Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Icons.FileJson className="w-5 h-5" />
            )}
            Sauvegarde JSON
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-lg flex items-center gap-2 transition-colors shadow-sm"
            title="Importer une sauvegarde JSON"
          >
            <Icons.Upload className="w-5 h-5" />
            Import JSON
          </button>
        </div>
        
        <ImportJsonModal 
          isOpen={showImportModal} 
          onClose={() => setShowImportModal(false)}
          onImportSuccess={() => {
            // Trigger a refresh by forcing re-mount or refetch
            // Since fetchStats is in useEffect[], easiest is to toggle a key or move fetchStats out.
            // But for now, let's just reload window or modify Dashboard to expose a refresher.
            // Actually, best practice is to move fetchStats definition to be reusable.
            window.location.reload(); 
          }}
        />
      </div>

    </div>
  );
}


import React, { useState, useCallback, useEffect } from 'react';
import { Icons } from '@/core/helpers/icons';
import { collectionService } from '../services/collectionService';
import { Collection } from '../types';
import { supabase } from '@/supabase/config';

interface ImportJsonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
}

interface AnalysisResult {
  valid: boolean;
  message: string;
  collectionsFound: {
    originalId: string; // ID in the JSON
    name: string;
    existsInDb: boolean;
    snippetCount: number;
  }[];
  totalSnippets: number;
  totalCategories: number;
  data: any; // Keep the parsed data
}

export const ImportJsonModal: React.FC<ImportJsonModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState<string>("");
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());

  const processFile = useCallback(async (file: File) => {
    setAnalyzing(true);
    setAnalysis(null);
    setError(null);
    setSelectedIndices(new Set());

    try {
      const text = await file.text();
      let data: any;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("Le fichier n'est pas un JSON valide.");
      }

      // 1. Basic Schema Validation
      if (!data.collections || !Array.isArray(data.collections)) {
        throw new Error("Structure invalide: 'collections' manquant ou incorrect.");
      }
      
      // 2. Fetch Existing Collections
      let existingCollections: Collection[] = [];
      try {
        existingCollections = await collectionService.getCollections();
      } catch (err) {
        console.error("Erreur fetch collections", err);
      }

      // 3. Analyze Content
      const collectionsFound = data.collections.map((col: any) => {
        const exists = existingCollections.some(
            (ec) => ec.name.trim().toLowerCase() === col.name?.trim().toLowerCase()
        );
        
        // Count related items in JSON
        const categoriesInCol = (data.categories || []).filter((c: any) => c.collection_id === col.id);
        const catIds = new Set(categoriesInCol.map((c: any) => c.id));
        const snippetsInCol = (data.snippets || []).filter((s: any) => catIds.has(s.category_id));

        return {
          originalId: col.id,
          name: col.name || "Sans nom",
          existsInDb: exists,
          snippetCount: snippetsInCol.length
        };
      });

      const result: AnalysisResult = {
        valid: true,
        message: "Fichier compatible.",
        collectionsFound,
        totalCategories: (data.categories || []).length,
        totalSnippets: (data.snippets || []).length,
        data
      };

      setAnalysis(result);
      
      // Default Selection: Select ONLY those that DO NOT exist
      const initialSelection = new Set<number>();
      collectionsFound.forEach((col: any, idx: number) => {
        if (!col.existsInDb) {
          initialSelection.add(idx);
        }
      });
      setSelectedIndices(initialSelection);

    } catch (err: any) {
      setError(err.message || "Une erreur inconnue est survenue.");
    } finally {
      setAnalyzing(false);
    }
  }, []);

  const handleImport = async () => {
    if (!analysis || !analysis.data) return;
    
    setImporting(true);
    setProgress("Préparation...");
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Utilisateur non authentifié.");

      const selectedCollections = analysis.collectionsFound
        .map((col, idx) => selectedIndices.has(idx) ? col : null)
        .filter(c => c !== null) as typeof analysis.collectionsFound;

      if (selectedCollections.length === 0) {
        throw new Error("Aucune collection sélectionnée.");
      }

      // 0. Fetch Max Order to append at the end
      const { data: maxOrderRow } = await supabase
        .from('sni_collections')
        .select('order')
        .eq('user_id', user.id)
        .order('order', { ascending: false })
        .limit(1)
        .maybeSingle();

      // Fix TS 'possibly null': explicit check or rely on optional chaining with known type
      // Using generic cast to ensure we know it has order property if it exists
      const maxOrder = maxOrderRow ? (maxOrderRow as any).order : -1;
      let currentOrder = maxOrder + 1;

      let processedCount = 0;
      const total = selectedCollections.length;

      for (const colInfo of selectedCollections) {
        setProgress(`Import de "${colInfo.name}" (${processedCount + 1}/${total})...`);

        // 1. Determine Name
        const newName = colInfo.existsInDb ? `${colInfo.name}_BIS` : colInfo.name;
        
        // 2. Find original collection data object
        const originalColData = analysis.data.collections.find((c: any) => c.id === colInfo.originalId);

        // 3. Insert Collection
        const { data: createdCol, error: colError } = await (supabase
          .from('sni_collections') as any)
          .insert({
            user_id: user.id,
            name: newName,
            description: originalColData.description,
            language: originalColData.language || 'javascript',
            icon: originalColData.icon,
            color: originalColData.color,
            order: currentOrder++
          })
          .select()
          .single();

        if (colError) throw new Error(`Erreur création collection ${newName}: ${colError.message}`);
        if (!createdCol) throw new Error(`Erreur création collection ${newName}: retour vide`);
        
        const newCollectionId = createdCol.id;

        // 4. Find and Insert Categories
        const categories = (analysis.data.categories || []).filter((c: any) => c.collection_id === colInfo.originalId);
        
        for (const cat of categories) {
           const { data: createdCat, error: catError } = await (supabase
            .from('sni_categories') as any)
            .insert({
              user_id: user.id,
              collection_id: newCollectionId,
              name: cat.name,
              description: cat.description,
              icon: cat.icon,
              color: cat.color,
              order: cat.order ?? 0 // Preserve relative order if possible or just use what is there
            })
            .select()
            .single();
            
            if (catError || !createdCat) {
                console.error(`Skipping category ${cat.name} due to error`, catError);
                continue; 
            }

            const newCategoryId = createdCat.id;

            // 5. Find and Insert Snippets
            const snippets = (analysis.data.snippets || []).filter((s: any) => s.category_id === cat.id);
            
            // Batch insert snippets to be faster
            const snippetsToInsert = snippets.map((s: any) => ({
                user_id: user.id,
                category_id: newCategoryId,
                title: s.title,
                code: s.code,
                description: s.description,
                tags: s.tags,
                dependencies: s.dependencies,
                order: s.order ?? 0,
                is_coloration_compatible: s.is_coloration_compatible ?? true
            }));

            if (snippetsToInsert.length > 0) {
                 const { error: snipError } = await (supabase
                .from('sni_snippets') as any)
                .insert(snippetsToInsert);
                
                if (snipError) console.error("Error inserting snippets batch", snipError);
            }
        }

        processedCount++;
      }
      
      setProgress("Terminé !");
      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setError(err.message);
      setImporting(false);
      setProgress("");
    }
  };

  const toggleSelection = (index: number) => {
    const newSet = new Set(selectedIndices);
    if (newSet.has(index)) newSet.delete(index);
    else newSet.add(index);
    setSelectedIndices(newSet);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl mx-4 overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-lg">
            <Icons.Upload className="text-purple-600 dark:text-purple-400" />
            Importer une sauvegarde JSON
          </div>
          <button 
            onClick={onClose}
            disabled={importing}
            className="p-1 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
          >
            <Icons.X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          
          {/* Dropzone (Hidden when analyzing or result shown to save space, or just kept small) */}
          {!analysis && !analyzing && (
            <div 
                className={`
                relative border-2 border-dashed rounded-xl p-8 transition-all text-center
                ${isDragActive 
                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                    : 'border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500'
                }
                `}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input 
                type="file" 
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleChange}
                accept=".json"
                />
                
                <div className="flex flex-col items-center gap-3 pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                    <Icons.FileJson size={32} />
                </div>
                <div>
                    <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Glissez votre fichier JSON ici
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    ou cliquez pour sélectionner
                    </p>
                </div>
                </div>
            </div>
          )}

          {/* Loading / Progress */}
          {(analyzing || importing) && (
            <div className="mt-6 flex flex-col items-center justify-center py-8 text-slate-500">
              <Icons.Loader2 className="animate-spin mb-4 text-purple-600" size={32} />
              <p className="font-medium text-lg text-slate-800 dark:text-white">
                  {importing ? "Importation en cours..." : "Analyse du fichier..."}
              </p>
              {importing && <p className="text-sm text-slate-500 mt-2">{progress}</p>}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mt-6 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 flex items-start gap-3">
              <Icons.AlertCircle className="shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold">Erreur</h4>
                <p className="text-sm mt-1">{error}</p>
                {!importing && (
                     <button onClick={() => { setAnalysis(null); setError(null); }} className="text-xs underline mt-2 hover:text-red-800">Réessayer</button>
                )}
              </div>
            </div>
          )}

          {/* Analysis Results & Selection */}
          {analysis && !importing && !analyzing && (
            <div className="mt-2 space-y-6 animate-fade-in">
              <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                 <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Icons.CheckCircle2 className="text-green-500" />
                        Collections détectées ({analysis.collectionsFound.length})
                    </h4>
                    <span className="text-xs text-slate-500">
                        {selectedIndices.size} sélectionnée(s)
                    </span>
                 </div>
                 
                 <div className="h-[500px] overflow-y-auto space-y-2 pr-2">
                  {analysis.collectionsFound.map((col, idx) => {
                    const isSelected = selectedIndices.has(idx);
                    return (
                        <div 
                        key={idx}
                        className={`
                            flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer select-none
                            ${isSelected 
                                ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' 
                                : 'bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-70'
                            }
                        `}
                        onClick={() => toggleSelection(idx)}
                        >
                        <div className={`
                            w-5 h-5 rounded border flex items-center justify-center transition-colors
                            ${isSelected 
                                ? 'bg-purple-600 border-purple-600 text-white' 
                                : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'
                            }
                        `}>
                            {isSelected && <Icons.Check size={12} />}
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center gap-2">
                                <p className="font-bold text-slate-800 dark:text-slate-200">{col.name}</p>
                                {col.existsInDb && (
                                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                        Existe
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-slate-500 flex items-center gap-1">
                                {col.snippetCount} snippets
                                {col.existsInDb && isSelected && (
                                    <span className="text-purple-600 dark:text-purple-400">
                                        → Sera importé en "{col.name}_BIS"
                                    </span>
                                )}
                            </p>
                        </div>
                        </div>
                    );
                  })}
                 </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => { setAnalysis(null); setError(null); }}
                    className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={selectedIndices.size === 0}
                    className={`
                        px-6 py-2 rounded-lg font-bold text-white flex items-center gap-2 transition-all shadow-md
                        ${selectedIndices.size > 0 
                            ? 'bg-purple-600 hover:bg-purple-700' 
                            : 'bg-slate-300 dark:bg-slate-700 cursor-not-allowed'
                        }
                    `}
                  >
                    <Icons.Download size={18} />
                    Importer la sélection
                  </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

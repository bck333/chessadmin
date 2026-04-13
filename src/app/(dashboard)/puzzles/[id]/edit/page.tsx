'use client';

import React, { useEffect, useState } from 'react';
import { ChessboardEditor } from '@/components/ChessboardEditor';
import { puzzleApi, categoryApi } from '@/lib/api';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Save, Tag as TagIcon, X, RefreshCw, Activity, FileText, Clipboard } from 'lucide-react';

export default function EditPuzzlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [fen, setFen] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState('Medium');
  const [rating, setRating] = useState(1500);
  const [lastMove, setLastMove] = useState('');
  const [solutionMoves, setSolutionMoves] = useState('');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [showCatDropdown, setShowCatDropdown] = useState(false);
  const [editorMode, setEditorMode] = useState<'setup' | 'record'>('setup');
  const [recordedMoves, setRecordedMoves] = useState<string[]>([]);

  // Professional Metadata States
  const [opening, setOpening] = useState('');
  const [eco, setEco] = useState('');
  const [white, setWhite] = useState('');
  const [black, setBlack] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [source, setSource] = useState('');
  const [pgnInput, setPgnInput] = useState('');

  useEffect(() => {
    loadCategories();
    if (id) {
      loadPuzzle(id);
    }
  }, [id]);

  const loadCategories = async () => {
    try {
      const data = await categoryApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const loadPuzzle = async (puzzleId: string) => {
    try {
      setDataLoading(true);
      const data = await puzzleApi.get(puzzleId);
      if (data) {
        setTitle(data.title || '');
        setDescription(data.description || '');
        setFen(data.fen || '');
        setDifficulty(data.difficulty || 'Medium');
        setRating(data.rating || 1500);
        setLastMove(data.lastMove || '');
        
        if (data.solution_moves && Array.isArray(data.solution_moves)) {
          setSolutionMoves(data.solution_moves.join(', '));
          setRecordedMoves(data.solution_moves);
        } else if (typeof data.solution_moves === 'string') {
          setSolutionMoves(data.solution_moves);
          setRecordedMoves(data.solution_moves.split(',').map((m: string) => m.trim()));
        }

        setOpening(data.opening || '');
        setEco(data.eco || '');
        setWhite(data.white || '');
        setBlack(data.black || '');
        setYear(data.year || new Date().getFullYear());
        setSource(data.source || '');
        
        if (data.category_ids) {
            setSelectedCategoryIds(data.category_ids);
        } else if (data.themes) {
            // Attempt to map string themes back to category IDs if needed,
            // though themes is typically joined with category data
            // Usually, standard update needs category_ids.
        }
      }
    } catch (error) {
      console.error('Failed to load puzzle details:', error);
      alert('Failed to load puzzle. It might have been deleted.');
      router.push('/puzzles');
    } finally {
      setDataLoading(false);
    }
  };

  const handleImportPGN = () => {
    if (!pgnInput) return;

    // Standard PGN Tag regex: [Key "Value"]
    const tagRegex = /\[(\w+)\s+"([^"]+)"\]/g;
    let match;
    const tags: Record<string, string> = {};

    while ((match = tagRegex.exec(pgnInput)) !== null) {
      tags[match[1]] = match[2];
    }

    // Auto-fill states if tags exist
    if (tags.White) setWhite(tags.White);
    if (tags.Black) setBlack(tags.Black);
    if (tags.Event) setTitle(tags.Event);
    if (tags.Date) {
       const yearMatch = tags.Date.match(/^\d{4}/);
       if (yearMatch) setYear(parseInt(yearMatch[0]));
    }
    if (tags.ECO) setEco(tags.ECO);
    if (tags.Opening) setOpening(tags.Opening);
    if (tags.FEN) setFen(tags.FEN);
    if (tags.Site) setSource(tags.Site);

    alert('PGN Metadata imported successfully!');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const moves = solutionMoves.split(',').map(m => m.trim()).filter(m => m !== '');
      
      await puzzleApi.update(id, {
        title,
        description,
        fen,
        solution_moves: moves,
        difficulty,
        rating: Number(rating),
        lastMove,
        opening,
        eco,
        white,
        black,
        year: Number(year),
        source,
        category_ids: selectedCategoryIds,
      });

      router.push('/puzzles');
    } catch (error) {
      console.error('Failed to update puzzle:', error);
      alert('Failed to update puzzle');
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (categoryId: string) => {
    if (selectedCategoryIds.includes(categoryId)) {
      setSelectedCategoryIds(selectedCategoryIds.filter(i => i !== categoryId));
    } else {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-b-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => router.back()}
            className="p-3 hover:bg-white rounded-2xl border border-slate-200 transition-all shadow-sm"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Edit Puzzle: {title || id.slice(-8).toUpperCase()}</h1>
            <p className="text-slate-500 font-medium italic">Make changes to the puzzle details</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden group">
            <div className="relative z-10">
              <h2 className="text-xl font-black mb-4 flex items-center gap-2 text-white uppercase tracking-wider text-xs">
                <Clipboard size={16} className="text-blue-400" />
                PGN Tag Importer
              </h2>
              <textarea 
                value={pgnInput}
                onChange={(e) => setPgnInput(e.target.value)}
                placeholder='Paste PGN tags here... e.g. [White "Magnus Carlsen"] [Opening "Sicilian"]'
                className="w-full h-32 bg-slate-800/50 border border-slate-700 rounded-2xl p-4 text-slate-300 font-mono text-xs focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all resize-none"
              />
              <button 
                type="button"
                onClick={handleImportPGN}
                className="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-black py-3 px-6 rounded-xl flex items-center gap-2 transition-all active:scale-95 text-xs uppercase tracking-widest"
              >
                <RefreshCw size={14} />
                Auto-fill Metadata
              </button>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none transform rotate-12">
               <FileText size={200} className="text-white" />
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-wider text-xs">
              <span className="w-6 h-6 bg-blue-600 rounded text-[10px] text-white flex items-center justify-center">1</span>
              Puzzle Geometry
            </h2>
            <ChessboardEditor 
              onFenChange={(f) => setFen(f)} 
              initialFen={fen}
              mode={editorMode}
              onModeChange={setEditorMode}
              recordedMoves={recordedMoves}
              onRecordedMovesChange={(moves) => {
                setRecordedMoves(moves);
                setSolutionMoves(moves.join(', '));
              }}
              lastMove={lastMove}
              onLastMoveChange={setLastMove}
            />
            
            <div className="mt-6">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1">FEN Notation</label>
               <code className="block bg-slate-50 text-slate-600 p-4 rounded-xl text-xs overflow-x-auto whitespace-nowrap scrollbar-hide font-mono border border-slate-100 italic">
                 {fen || 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'}
               </code>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-slate-800 uppercase tracking-wider text-xs">
              <span className="w-6 h-6 bg-blue-600 rounded text-[10px] text-white flex items-center justify-center">2</span>
              Game Identity
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                  Event / Opening Name
                </label>
                <input 
                  type="text"
                  value={opening}
                  onChange={(e) => setOpening(e.target.value)}
                  placeholder="e.g. World Championship Match"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    ECO Code
                  </label>
                  <input 
                    type="text"
                    value={eco}
                    onChange={(e) => setEco(e.target.value)}
                    placeholder="B40"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900 uppercase"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    Year
                  </label>
                  <input 
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value) || new Date().getFullYear())}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    White Player
                  </label>
                  <input 
                    type="text"
                    value={white}
                    onChange={(e) => setWhite(e.target.value)}
                    placeholder="Grandmaster"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    Black Player
                  </label>
                  <input 
                    type="text"
                    value={black}
                    onChange={(e) => setBlack(e.target.value)}
                    placeholder="Opposition"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                  Tournament / Source
                </label>
                <input 
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  placeholder="e.g. Candidates 2024"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-50 pt-6">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    Difficulty
                  </label>
                  <select 
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black bg-white text-slate-900"
                  >
                    <option>Easy</option>
                    <option>Medium</option>
                    <option>Hard</option>
                    <option>Expert</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                    Elo Rating
                  </label>
                  <input 
                    type="number"
                    value={rating}
                    onChange={(e) => setRating(parseInt(e.target.value) || 0)}
                    placeholder="1500"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest">
                  Themes & Tactics
                </label>
                <div className="relative">
                  <div 
                    onClick={() => setShowCatDropdown(!showCatDropdown)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 flex flex-wrap gap-2 min-h-[50px] cursor-pointer hover:border-slate-300 transition-colors bg-white text-slate-900"
                  >
                    {selectedCategoryIds.length === 0 ? (
                      <span className="text-slate-400 text-sm italic font-medium">Select categories...</span>
                    ) : (
                      selectedCategoryIds.map(categoryId => {
                        const cat = categories.find(c => c.id === categoryId);
                        return (
                          <span key={categoryId} className="bg-[#1e293b] text-white px-2.5 py-1 rounded-lg text-[9px] font-black flex items-center gap-1 uppercase tracking-widest">
                            {cat?.name || 'Loading...'}
                            <X size={10} className="cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleCategory(categoryId); }} />
                          </span>
                        );
                      })
                    )}
                  </div>
                  
                  {showCatDropdown && (
                    <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 max-h-60 overflow-y-auto">
                      {categories.map(cat => (
                        <div 
                          key={cat.id}
                          onClick={() => toggleCategory(cat.id)}
                          className={`px-4 py-2.5 hover:bg-slate-50 cursor-pointer flex items-center justify-between text-xs font-bold ${selectedCategoryIds.includes(cat.id) ? 'bg-blue-50/50 text-blue-600' : 'text-slate-600'}`}
                        >
                          {cat.name}
                          {selectedCategoryIds.includes(cat.id) && <TagIcon size={12} />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest flex items-center justify-between">
                    Last Move
                  </label>
                  <input 
                    type="text"
                    value={lastMove}
                    onChange={(e) => setLastMove(e.target.value)}
                    placeholder="e.g. e2e4"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black font-mono text-sm text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-600 mb-2 uppercase tracking-widest flex items-center justify-between">
                    Solution
                  </label>
                  <input 
                    type="text"
                    value={solutionMoves}
                    onChange={(e) => setSolutionMoves(e.target.value)}
                    placeholder="e2e4, e7e5..."
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 outline-none transition-all font-black font-mono text-sm text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button 
                  type="button"
                  onClick={() => setEditorMode('record')}
                  className="w-full bg-slate-50 border-2 border-slate-100 hover:border-blue-500 hover:text-blue-600 text-slate-400 font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
                >
                  <Activity size={18} />
                  Simulate Solution
                </button>

                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 border-2 border-blue-600 hover:bg-blue-700 hover:border-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-200 flex items-center justify-center gap-3 transition-all active:scale-[0.98] disabled:opacity-50 uppercase tracking-widest text-sm"
                >
                  {loading ? (
                     <RefreshCw size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

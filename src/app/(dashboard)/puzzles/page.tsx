'use client';

import React, { useEffect, useState } from 'react';
import { puzzleApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Trash2, Edit2, Play, Search, Tag as TagIcon, Hash, Star, BarChart2, Calendar } from 'lucide-react';
import { Pagination } from '@/components/Pagination';

export default function PuzzleListPage() {
  const [puzzles, setPuzzles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadPuzzles();
  }, [page, limit]);

  const loadPuzzles = async () => {
    try {
      setLoading(true);
      const data = await puzzleApi.list(page, limit);
      setPuzzles(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load puzzles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this puzzle?')) return;
    try {
      await puzzleApi.delete(id);
      loadPuzzles();
    } catch (error) {
      console.error('Failed to delete puzzle:', error);
    }
  };

  const filteredPuzzles = searchTerm 
    ? puzzles.filter(p => 
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.difficulty.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : puzzles;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Puzzle Library</h1>
          <p className="text-slate-500 mt-1 font-medium">Manage and curate your collection of chess challenges.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
            <input 
              type="text" 
              placeholder="Search puzzles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white border border-slate-200 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-900 outline-none"
            />
          </div>
          <Link 
            href="/puzzles/new"
            className="bg-[#1e293b] hover:bg-blue-600 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-slate-200 flex items-center gap-3 transition-all active:scale-95 text-xs uppercase tracking-[0.1em]"
          >
            <Plus size={20} />
            Create New
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden min-h-[500px] flex flex-col">
        {loading ? (
          <div className="flex-1 flex justify-center items-center py-20">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-b-blue-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] border-b border-slate-800">
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] w-16 text-center">S.No</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Puzzle ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Title</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Difficulty</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Rating</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Plays</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Themes</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Created At</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPuzzles.map((puzzle, index) => (
                    <tr key={puzzle.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-5 text-center">
                        <span className="text-xs font-black text-slate-400 bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
                          {(page - 1) * limit + index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Hash size={12} className="text-slate-300" />
                           <code className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                             {puzzle?.id?.slice(-8).toUpperCase() || 'N/A'}
                           </code>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div>
                          <p className="font-black text-slate-800 text-sm tracking-tight group-hover:text-blue-600 transition-colors uppercase">{puzzle?.title || 'No Title'}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 truncate max-w-[200px]">
                            {puzzle?.description || 'No description'}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                          puzzle?.difficulty === 'Easy' ? 'bg-green-50 text-green-700 border border-green-100' :
                          puzzle?.difficulty === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-rose-50 text-rose-700 border border-rose-100'
                        }`}>
                          {puzzle?.difficulty || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-blue-600">
                           <Star size={12} fill="currentColor" />
                           <span className="text-xs font-black">{puzzle?.rating || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-1.5 text-slate-500">
                           <BarChart2 size={12} />
                           <span className="text-xs font-black">{puzzle?.plays || 0}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex flex-wrap gap-1">
                          {puzzle?.themes?.slice(0, 2).map((theme: string, idx: number) => (
                            <span key={idx} className="text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 uppercase">
                              {theme}
                            </span>
                          ))}
                          {puzzle?.themes?.length > 2 && (
                            <span className="text-[9px] font-black text-blue-400 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                              +{puzzle.themes.length - 2}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-400">
                           <Calendar size={12} />
                           <span className="text-[10px] font-bold uppercase tracking-widest">
                             {puzzle?.created_at ? new Date(puzzle.created_at).toLocaleDateString() : 'N/A'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/puzzles/${puzzle.id}/edit`} className="p-2 hover:bg-white hover:text-blue-600 rounded-xl transition-all border border-transparent hover:border-blue-100 hover:shadow-sm text-slate-400">
                            <Edit2 size={16} />
                          </Link>
                          <button 
                            onClick={() => handleDelete(puzzle.id)}
                            className="p-2 hover:bg-white hover:text-rose-600 rounded-xl transition-all border border-transparent hover:border-rose-100 hover:shadow-sm text-slate-400"
                          >
                            <Trash2 size={16} />
                          </button>
                          <button className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-sm shadow-blue-100 border border-blue-100">
                            <Play size={16} fill="currentColor" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredPuzzles.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-32 opacity-30">
                <Plus size={64} className="mb-4 text-slate-300" />
                <p className="font-black text-2xl text-slate-900 tracking-tight">No puzzles in library</p>
                <p className="text-sm font-bold text-slate-500 mt-2">Start by creating your first puzzle challenge.</p>
              </div>
            )}

            <Pagination 
              total={total}
              page={page}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(newLimit) => {
                setLimit(newLimit);
                setPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { categoryApi } from '@/lib/api';
import { Tags, Plus, Trash2, Edit2, Check, X, Tag } from 'lucide-react';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCat, setNewCat] = useState({ name: '', description: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCat, setEditCat] = useState({ name: '', description: '' });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.list();
      setCategories(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newCat.name) return;
    try {
      await categoryApi.create(newCat);
      setNewCat({ name: '', description: '' });
      setIsAdding(false);
      loadCategories();
    } catch (error) {
      console.error('Failed to add category:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoryApi.delete(id);
      loadCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
    }
  };

  const startEdit = (cat: any) => {
    setEditingId(cat.id);
    setEditCat({ name: cat.name, description: cat.description });
  };

  const handleUpdate = async () => {
    if (!editingId || !editCat.name) return;
    try {
      await categoryApi.update(editingId, editCat);
      setEditingId(null);
      loadCategories();
    } catch (error) {
      console.error('Failed to update category:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <div>
           <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Tags className="text-blue-600" />
              Puzzle Categories
           </h1>
           <p className="text-slate-500 mt-1 font-medium">Define themes (Pin, Decoy) and difficulty levels (Easy, Hard).</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} />
            Add New
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-white p-8 rounded-3xl border-2 border-blue-100 shadow-xl shadow-blue-50/50 animate-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800">New Category</h3>
            <button onClick={() => setIsAdding(false)} className="text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-black text-slate-700 mb-1 uppercase tracking-wider">Name</label>
              <input 
                type="text" 
                placeholder="e.g. Pin, Decoy, Mate in 1, Easy..."
                value={newCat.name}
                onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-sm font-black text-slate-700 mb-1 uppercase tracking-wider">Description</label>
              <textarea 
                placeholder="Describe the category..."
                value={newCat.description}
                onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 min-h-[100px] font-medium text-slate-900"
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button 
                onClick={handleAdd}
                className="flex-1 bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 transition-all uppercase tracking-wide"
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full py-20 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-md transition-all group overflow-hidden relative">
            {editingId === cat.id ? (
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={editCat.name}
                  onChange={(e) => setEditCat({ ...editCat, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 text-slate-900 font-medium"
                />
                <textarea 
                  value={editCat.description}
                  onChange={(e) => setEditCat({ ...editCat, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 h-20 text-slate-900 font-medium"
                />
                <div className="flex gap-2">
                  <button onClick={handleUpdate} className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-2 bg-slate-100 text-slate-500 rounded-lg hover:bg-slate-200 transition-colors">
                    <X size={16} />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                      <Tag size={16} />
                    </div>
                    <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">{cat.name}</h3>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => startEdit(cat)}
                      className="p-2 hover:bg-slate-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(cat.id)}
                      className="p-2 hover:bg-slate-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">{cat.description || 'No description provided.'}</p>
                
                {/* Decorative background element */}
                <div className="absolute -bottom-4 -right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                   <Tags size={80} />
                </div>
              </>
            )}
          </div>
        ))}

        {categories.length === 0 && !loading && (
          <div className="col-span-full py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center flex flex-col items-center justify-center opacity-60">
             <Tags size={48} className="text-slate-300 mb-4" />
             <p className="font-black text-slate-600">No categories found.</p>
             <button 
              onClick={() => setIsAdding(true)}
              className="mt-4 text-blue-600 font-bold hover:underline"
             >
                Add your first category
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

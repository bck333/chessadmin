'use client';

import React, { useEffect, useState } from 'react';
import { settingsApi } from '@/lib/api';
import { Settings as SettingsIcon, Save, RefreshCw, AlertCircle, Info } from 'lucide-react';

export default function SettingsPage() {
  const [settings, setSettings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await settingsApi.list();
      setSettings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (key: string, value: string, description?: string) => {
    try {
      setSaving(key);
      await settingsApi.update({ key, value, description });
      loadSettings();
    } catch (error) {
      console.error('Failed to update setting:', error);
    } finally {
      setSaving(null);
    }
  };

  const settingGroups = [
    {
      title: 'General App Settings',
      description: 'Configure basic information about your chess application.',
      keys: ['app_name', 'maintenance_mode', 'support_email'],
      defaults: {
        app_name: 'Chess Puzzle Pro',
        maintenance_mode: 'false',
        support_email: 'support@chesspuzzle.com'
      }
    },
    {
      title: 'Game Engine',
      description: 'Parameters for the underlying chess engine and puzzle logic.',
      keys: ['stockfish_depth', 'max_puzzle_attempts'],
      defaults: {
        stockfish_depth: '15',
        max_puzzle_attempts: '3'
      }
    }
  ];

  const getSetting = (key: string) => settings.find(s => s.key === key) || { key, value: '', description: '' };

  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <header className="flex items-center justify-between">
         <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
               <SettingsIcon className="text-slate-700" />
               Site Settings
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Configure global parameters and future app features.</p>
         </div>
         <button 
           onClick={loadSettings}
           className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
         >
           <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
         </button>
      </header>

      <div className="grid gap-8">
        {settingGroups.map((group) => (
          <section key={group.title} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/30">
               <h3 className="text-xl font-bold text-slate-800">{group.title}</h3>
               <p className="text-slate-500 text-sm mt-1">{group.description}</p>
            </div>
            <div className="p-8 space-y-8">
               {group.keys.map((key) => {
                 const s = getSetting(key);
                 return (
                   <div key={key} className="flex flex-col md:flex-row md:items-center gap-4 group">
                      <div className="flex-1">
                         <label className="block text-sm font-black text-slate-700 mb-1 uppercase tracking-wider">{key.replace(/_/g, ' ')}</label>
                         <p className="text-xs text-slate-400 mb-2 font-medium">Internal Key: <code className="bg-slate-100 px-1 rounded">{key}</code></p>
                         <div className="relative">
                            <input 
                              type="text" 
                              placeholder={`Enter value (default: ${group.defaults[key as keyof typeof group.defaults]})`}
                              value={s.value}
                              onChange={(e) => {
                                const newSettings = [...settings];
                                const idx = newSettings.findIndex(ns => ns.key === key);
                                if (idx > -1) newSettings[idx].value = e.target.value;
                                else newSettings.push({ key, value: e.target.value });
                                setSettings(newSettings);
                              }}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500/10 focus:border-slate-500 font-medium transition-all text-slate-900"
                            />
                            {saving === key && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <RefreshCw size={16} className="animate-spin text-blue-600" />
                              </div>
                            )}
                         </div>
                      </div>
                      <div className="md:pt-9">
                        <button 
                          onClick={() => handleUpdate(key, s.value, s.description)}
                          disabled={saving !== null}
                          className="w-full md:w-auto bg-slate-900 text-white font-black py-3 px-6 rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2 text-sm uppercase tracking-wider disabled:opacity-50"
                        >
                          <Save size={16} />
                          Save
                        </button>
                      </div>
                   </div>
                 );
               })}
            </div>
          </section>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex gap-4">
         <div className="p-2 bg-amber-100 text-amber-600 rounded-lg h-fit">
            <AlertCircle size={20} />
         </div>
         <div>
            <h4 className="font-bold text-amber-900">Future-Proofing Notice</h4>
            <p className="text-sm text-amber-700 mt-1 leading-relaxed">
               Settings added here will be automatically available via the API. Ensure keys match the internal constant names used in the backend for proper integration during the development phase.
            </p>
         </div>
      </div>
    </div>
  );
}

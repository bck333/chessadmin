'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { 
  Puzzle, 
  Users, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Activity
} from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState<{ total_puzzles: number; total_users: number }>({
    total_puzzles: 0,
    total_users: 0,
  });
  const [engineStatus, setEngineStatus] = useState<{ 
    active_workers: number; 
    total_workers: number; 
    is_responsive: boolean;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, engineData] = await Promise.all([
        adminApi.getStats(),
        adminApi.getEngineStatus()
      ]);
      setStats(statsData);
      setEngineStatus(engineData);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const cards = [
    { 
      name: 'Total Puzzles', 
      value: stats.total_puzzles, 
      icon: Puzzle, 
      color: 'bg-blue-600',
      description: 'Active puzzles in the library',
      href: '/admin/puzzles'
    },
    { 
      name: 'Total Users', 
      value: stats.total_users, 
      icon: Users, 
      color: 'bg-purple-600',
      description: 'Registered chess players',
      href: '/admin/users'
    },
    { 
      name: 'Engine Status', 
      value: engineStatus?.is_responsive ? 'Online' : 'Offline', 
      icon: Activity, 
      color: engineStatus?.is_responsive ? 'bg-green-600' : 'bg-red-600',
      description: engineStatus?.is_responsive 
        ? `${engineStatus.active_workers}/${engineStatus.total_workers} workers ready`
        : engineStatus?.error || 'Engine unresponsive',
      href: '#'
    },
  ];

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back, Admin</h1>
          <p className="text-slate-500 mt-1">Here is what's happening with your Chess Puzzle app today.</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin/puzzles/new"
            className="bg-white border border-slate-200 text-slate-700 font-bold py-2.5 px-5 rounded-xl shadow-sm hover:bg-slate-50 flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} />
            Quick Create
          </Link>
          <Link 
            href="/admin/puzzles"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-xl shadow-lg shadow-blue-100 flex items-center gap-2 transition-all active:scale-95 text-sm"
          >
            Manage Puzzles
          </Link>
        </div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link key={card.name} href={card.href} className="block group">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all relative overflow-hidden h-full">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1">{card.name}</p>
                  <h2 className="text-4xl font-extrabold text-slate-900">
                    {loading ? (
                      <div className="h-10 w-20 bg-slate-100 animate-pulse rounded-lg mt-1"></div>
                    ) : (
                      card.value
                    )}
                  </h2>
                </div>
                <div className={`${card.color} p-3 rounded-xl text-white shadow-lg`}>
                  <card.icon size={24} />
                </div>
              </div>
              <p className="text-slate-400 text-xs mt-4 flex items-center gap-1">
                <TrendingUp size={12} className="text-green-500" />
                {card.description}
              </p>
              
              {/* Hover highlight line */}
              <div className="absolute bottom-0 left-0 h-1 bg-blue-600 transition-all duration-300 w-0 group-hover:w-full"></div>
            </div>
          </Link>
        ))}

        {/* Placeholder cards for future growth */}
        <div className="bg-slate-100/50 p-6 rounded-2xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center opacity-70">
          <Activity size={32} className="text-slate-400 mb-2" />
          <p className="text-sm font-bold text-slate-500">More stats coming soon</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Placeholder */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden min-h-[400px]">
          <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-800 tracking-tight">Recent Puzzles</h3>
            <Link href="/admin/puzzles" className="text-blue-600 text-sm font-bold hover:underline flex items-center gap-1 group">
              View All
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <div className="p-12 text-center flex flex-col items-center justify-center">
             <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Puzzle size={32} className="text-slate-200" />
             </div>
             <p className="text-slate-400 font-medium">Activity graph and recent lists will appear here as you add more content.</p>
          </div>
        </div>

        {/* Quick Tips / Sidebar Card */}
        <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 transform translate-x-1/4 -translate-y-1/4 opacity-10">
            <TrendingUp size={200} />
          </div>
          
          <h3 className="text-2xl font-black mb-4 relative z-10">Admin Tip</h3>
          <p className="text-slate-300 mb-8 leading-relaxed relative z-10">
             To improve user engagement, try adding puzzles with multiple difficulty tags. 
             This allows players to find content that matches their skill level perfectly.
          </p>
          
          <ul className="space-y-4 mb-10 relative z-10">
            {['Pin Puzzles', 'Mate in 1/2', 'Deflection'].map((item) => (
              <li key={item} className="flex items-center gap-3 text-sm font-bold">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                {item}
              </li>
            ))}
          </ul>
          
          <button className="w-full bg-white text-slate-900 font-black py-4 rounded-2xl hover:bg-blue-50 transition-colors relative z-10 text-sm tracking-wide uppercase">
             Create Categories
          </button>
        </div>
      </div>
    </div>
  );
}

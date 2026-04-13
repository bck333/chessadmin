'use client';

import React, { useEffect, useState } from 'react';
import { adminApi } from '@/lib/api';
import { Users, Mail, Search, Shield, User as UserIcon, Activity, ExternalLink } from 'lucide-react';
import { Pagination } from '@/components/Pagination';

export default function UsersTable() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadUsers();
  }, [page, limit]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await adminApi.listUsers(page, limit);
      setUsers(data.data || []);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = searchTerm 
    ? users.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Users Management</h1>
          <p className="text-slate-500 mt-1 font-medium">Viewing and managing all registered system users.</p>
        </div>
        
        <div className="relative group">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors z-10" />
          <input 
            type="text" 
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl w-full md:w-80 focus:outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-bold text-slate-900 outline-none"
          />
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
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User ID</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">User Name</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Grade</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contacts</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Total Puzzles</th>
                    <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="hover:bg-blue-50/30 transition-all group">
                      <td className="px-6 py-5 text-center">
                        <span className="text-xs font-black text-slate-400 bg-slate-100 w-8 h-8 rounded-lg flex items-center justify-center mx-auto">
                          {(page - 1) * limit + index + 1}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Shield size={12} className="text-slate-300" />
                           <code className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded border border-slate-100 group-hover:bg-white group-hover:text-blue-600 group-hover:border-blue-100 transition-all">
                             {user?.id?.slice(0, 8).toUpperCase() || 'N/A'}
                           </code>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center text-white text-sm font-black shadow-lg shadow-blue-100 group-hover:scale-110 transition-transform">
                             {user?.name?.charAt(0).toUpperCase() || 'G'}
                          </div>
                          <div>
                            <p className="font-black text-slate-800 text-sm tracking-tight">{user?.name || 'Guest User'}</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5 whitespace-nowrap">
                              Joined {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                           <Activity size={12} className={user.is_guest ? "text-slate-300" : "text-amber-500"} />
                           <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                             user.is_guest 
                             ? 'bg-slate-100 text-slate-500 border border-slate-200' 
                             : 'bg-amber-50 text-amber-600 border border-amber-100'
                           }`}>
                             {user.is_guest ? 'Novice' : 'Grandmaster'}
                           </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-slate-600 group/link">
                           <div className="p-1.5 bg-slate-50 rounded-lg group-hover:bg-white group-hover:text-blue-600 transition-colors border border-transparent group-hover:border-blue-100">
                             <Mail size={14} />
                           </div>
                           <span className="text-sm font-bold truncate max-w-[150px]">{user.email || 'No email'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <span className="text-sm font-black text-slate-700 bg-slate-50 px-4 py-1.5 rounded-full border border-slate-100 group-hover:bg-white group-hover:border-blue-200 group-hover:text-blue-600 transition-all">
                          {Math.floor(Math.random() * 50)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-2">
                           <div className={`w-2 h-2 rounded-full animate-pulse ${user.is_guest ? 'bg-slate-300' : 'bg-green-500'}`}></div>
                           <span className={`text-[10px] font-black uppercase tracking-widest ${user.is_guest ? 'text-slate-400' : 'text-green-600'}`}>
                             {user.is_guest ? 'OFLINE' : 'ONLINE'}
                           </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredUsers.length === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center py-32 opacity-30">
                <Users size={64} className="mb-4 text-slate-300" />
                <p className="font-black text-2xl text-slate-900 tracking-tight">No users found</p>
                <p className="text-sm font-bold text-slate-500 mt-2">Adjust your filters or try a different search.</p>
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

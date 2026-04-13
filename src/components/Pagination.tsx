import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  total: number;
  page: number;
  limit: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({ 
  total, 
  page, 
  limit, 
  onPageChange, 
  onLimitChange 
}) => {
  const totalPages = Math.ceil(total / limit);
  const startRecord = (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', totalPages);
      } else if (page >= totalPages - 3) {
        pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-6 px-8 py-6 bg-white border-t border-slate-100">
      <div className="flex items-center gap-8">
        {/* Page Size Selector */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="absolute -top-2 left-3 px-1 text-[10px] font-black text-slate-400 bg-white uppercase tracking-widest z-10">Page Size</span>
            <select 
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className="pl-4 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-black text-slate-800 appearance-none min-w-[80px]"
            >
              {[10, 25, 50, 100].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
              <ChevronRight size={14} className="rotate-90" />
            </div>
          </div>
        </div>

        {/* Total Records Display */}
        <div className="text-sm font-bold text-slate-500 tracking-tight">
          Total record: <span className="text-slate-900 font-black ml-1">{total}</span>
        </div>

        {/* Go to Page Input */}
        <div className="flex items-center gap-3">
          <div className="relative group">
            <span className="absolute -top-2 left-3 px-1 text-[10px] font-black text-slate-400 bg-white uppercase tracking-widest z-10">Go to p...</span>
            <input 
              type="number"
              min={1}
              max={totalPages}
              placeholder={String(page)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const targetPage = Number((e.target as HTMLInputElement).value);
                  if (targetPage >= 1 && targetPage <= totalPages) {
                    onPageChange(targetPage);
                    (e.target as HTMLInputElement).value = '';
                  }
                }
              }}
              className="pl-4 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all text-sm font-black text-slate-800 w-24"
            />
          </div>
        </div>
      </div>

      {/* Numeric Page Navigation */}
      <div className="flex items-center gap-2">
        <button 
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page === 1}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
        >
          <ChevronLeft size={18} strokeWidth={3} />
        </button>

        <div className="flex items-center gap-1.5 mx-2">
          {getPageNumbers().map((num, idx) => {
            if (num === '...') {
              return (
                <div key={`dots-${idx}`} className="w-10 h-10 flex items-center justify-center text-slate-400">
                  <MoreHorizontal size={14} />
                </div>
              );
            }

            const isActive = num === page;
            return (
              <button
                key={idx}
                onClick={() => onPageChange(num as number)}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-black transition-all transform active:scale-95 ${
                  isActive 
                    ? 'bg-[#9333EA] text-white shadow-lg shadow-purple-200 scale-110' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 border border-transparent'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>

        <button 
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
          className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-30 transition-all text-slate-600"
        >
          <ChevronRight size={18} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

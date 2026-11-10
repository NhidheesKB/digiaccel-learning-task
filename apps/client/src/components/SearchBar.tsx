import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  resultCount?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange, resultCount }) => {
  return (
    <div className="px-4 sm:px-8 pt-3 pb-2">
      <div className="relative flex items-center">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search tasks by title or description..."
          className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm rounded-2xl pl-10 pr-9 py-2.5 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
          autoFocus
        />
        {value && (
          <button
            onClick={() => onChange('')}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            aria-label="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {value && resultCount !== undefined && (
        <div className="flex items-center justify-between mt-2 px-1 text-xs text-slate-500">
          <span>
            Search results for &ldquo;<span className="font-semibold text-slate-700">{value}</span>&rdquo;
          </span>
          <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
            {resultCount} {resultCount === 1 ? 'task' : 'tasks'} found
          </span>
        </div>
      )}
    </div>
  );
};


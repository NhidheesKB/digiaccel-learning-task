import React from 'react';
import { CheckCircle2, Clock, ListTodo, Plus, Search, TrendingUp, X } from 'lucide-react';

interface HeaderProps {
  totalOpen: number;
  totalCompleted: number;
  isSearching: boolean;
  onToggleSearch: () => void;
  onOpenCreateModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  totalOpen,
  totalCompleted,
  isSearching,
  onToggleSearch,
  onOpenCreateModal,
}) => {
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date());

  const totalTasks = totalOpen + totalCompleted;
  const progressPercent = totalTasks > 0 ? Math.round((totalCompleted / totalTasks) * 100) : 0;

  return (
    <header className="bg-indigo-600 text-white pt-5 pb-6 px-5 sm:px-8 rounded-b-3xl shadow relative">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-medium bg-white/20 text-white px-3 py-1 rounded-full">
          {todayFormatted}
        </span>

        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSearch}
            className={`p-2 rounded-xl transition ${
              isSearching ? 'bg-white text-indigo-600' : 'bg-white/10 hover:bg-white/20 text-white'
            }`}
          >
            {isSearching ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
          </button>

          <button
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white text-indigo-600 hover:bg-slate-50 font-semibold text-xs rounded-xl shadow-sm transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Tasks</h1>
        <p className="text-xs sm:text-sm text-indigo-100 mt-0.5">Track and manage weekly progress</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400/20 flex items-center justify-center text-amber-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-indigo-100">Open</div>
            <div className="text-lg sm:text-xl font-bold">{totalOpen}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-400/20 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-indigo-100">Completed</div>
            <div className="text-lg sm:text-xl font-bold">{totalCompleted}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-400/20 flex items-center justify-center text-sky-300">
            <ListTodo className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-indigo-100">Total</div>
            <div className="text-lg sm:text-xl font-bold">{totalTasks}</div>
          </div>
        </div>

        <div className="bg-white/10 rounded-2xl p-3 sm:p-4 flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-400/20 flex items-center justify-center text-purple-300">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-indigo-100">Rate</div>
            <div className="text-lg sm:text-xl font-bold">{progressPercent}%</div>
          </div>
        </div>
      </div>

      <div className="mt-3.5 bg-white/10 rounded-xl p-2.5 sm:p-3">
        <div className="flex justify-between items-center text-xs text-indigo-100 mb-1.5">
          <span>Weekly Completion</span>
          <span className="font-semibold text-white">{progressPercent}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </header>
  );
};

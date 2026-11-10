import React from 'react';

interface FilterBarProps {
  statusFilter: string;
  onStatusChange: (status: string) => void;
  priorityFilter: string;
  onPriorityChange: (priority: string) => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
}) => {
  const statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Open', value: 'OPEN' },
    { label: 'Completed', value: 'COMPLETED' },
  ];

  const priorityOptions = [
    { label: 'All Priorities', value: 'ALL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
  ];

  return (
    <div className="px-4 sm:px-8 py-2 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
      <div className="flex items-center space-x-1.5 flex-nowrap">
        {statusOptions.map((opt) => {
          const active = statusFilter === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onStatusChange(opt.value)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium transition whitespace-nowrap ${
                active
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center space-x-1 flex-shrink-0">
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="text-xs bg-white text-slate-700 font-medium border border-slate-200 rounded-full px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 shadow-sm cursor-pointer"
        >
          {priorityOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

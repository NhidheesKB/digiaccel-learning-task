import React, { useEffect, useRef } from 'react';
import { ITask } from '../types';
import { TaskItem } from './TaskItem';
import { Loader2, Search } from 'lucide-react';

interface SearchResultsViewProps {
  query: string;
  tasks: ITask[];
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  onToggleStatus: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (task: ITask) => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  tasks,
  hasMore,
  loadingMore,
  onLoadMore,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onSelectTask,
}) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasMore || !onLoadMore || loadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    const el = sentinelRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, [hasMore, onLoadMore, loadingMore]);

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Matching Tasks ({tasks.length})
        </span>
        <span className="text-[11px] text-slate-400">
          Tap to view • Swipe to delete
        </span>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-200 shadow-sm mt-2">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-700">No matching tasks</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
            We couldn't find any task containing &ldquo;{query}&rdquo;.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {tasks.map((task) => (
              <TaskItem
                key={task.id}
                task={task}
                onToggleStatus={onToggleStatus}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
                onSelect={onSelectTask}
              />
            ))}
          </div>

          {hasMore && (
            <div ref={sentinelRef} className="py-4 flex justify-center items-center">
              {loadingMore ? (
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Loading more tasks...</span>
                </div>
              ) : (
                <button
                  onClick={onLoadMore}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-xl transition"
                >
                  Load more
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

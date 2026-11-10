import React, { useState, useEffect, useCallback } from 'react';
import { ITask, WeekSummary, Priority, TaskStatus } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { FilterBar } from './components/FilterBar';
import { WeekCard } from './components/WeekCard';
import { SearchResultsView } from './components/SearchResultsView';
import { TaskModal } from './components/TaskModal';
import { TaskDetailsModal } from './components/TaskDetailsModal';
import { Plus, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';

export const App: React.FC = () => {
  const [weeklySummaries, setWeeklySummaries] = useState<WeekSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ITask[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [searchHasMore, setSearchHasMore] = useState(false);
  const [loadingMoreSearch, setLoadingMoreSearch] = useState(false);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setDebouncedSearchQuery('');
      return;
    }
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  const [expandedWeeks, setExpandedWeeks] = useState<Set<string>>(new Set());

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<ITask | null>(null);
  const [defaultDateForNewTask, setDefaultDateForNewTask] = useState<string | undefined>(undefined);
  const [selectedTaskDetails, setSelectedTaskDetails] = useState<ITask | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2500);
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const summaries = await api.getWeeklySummaries({
        search: debouncedSearchQuery.trim() || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        priority: priorityFilter !== 'ALL' ? priorityFilter : undefined,
      });

      setWeeklySummaries(summaries);

      setExpandedWeeks((prev) => {
        if (prev.size === 0) {
          const next = new Set<string>();
          summaries.forEach((s) => {
            if (s.isCurrentWeek || s.totalTasksCount > 0) {
              next.add(s.weekKey);
            }
          });
          return next;
        }
        return prev;
      });

      if (debouncedSearchQuery.trim()) {
        setSearchPage(1);
        const { tasks, pagination } = await api.searchTasks(debouncedSearchQuery.trim(), 1, 20);
        setSearchResults(tasks);
        setSearchHasMore(pagination.hasMore);
      } else {
        setSearchResults([]);
        setSearchHasMore(false);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLoadMoreSearch = async () => {
    if (!searchHasMore || loadingMoreSearch || !debouncedSearchQuery.trim()) return;
    try {
      setLoadingMoreSearch(true);
      const nextPage = searchPage + 1;
      const { tasks, pagination } = await api.searchTasks(debouncedSearchQuery.trim(), nextPage, 20);
      setSearchResults((prev) => [...prev, ...tasks]);
      setSearchPage(nextPage);
      setSearchHasMore(pagination.hasMore);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMoreSearch(false);
    }
  };

  const handleToggleWeek = (weekKey: string) => {
    setExpandedWeeks((prev) => {
      const next = new Set(prev);
      if (next.has(weekKey)) {
        next.delete(weekKey);
      } else {
        next.add(weekKey);
      }
      return next;
    });
  };

  const handleToggleStatus = async (task: ITask) => {
    const nextStatus: TaskStatus = task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED';
    try {
      setWeeklySummaries((prev) =>
        prev.map((week) => {
          const taskExists = week.tasks.some((t) => t.id === task.id);
          if (!taskExists) return week;

          const updatedTasks = week.tasks.map((t) =>
            t.id === task.id ? { ...t, status: nextStatus } : t
          );
          const openCount = updatedTasks.filter((t) => t.status !== 'COMPLETED').length;
          const completedCount = updatedTasks.filter((t) => t.status === 'COMPLETED').length;

          return {
            ...week,
            tasks: updatedTasks,
            openTasksCount: openCount,
            completedTasksCount: completedCount,
          };
        })
      );

      if (selectedTaskDetails?.id === task.id) {
        setSelectedTaskDetails({ ...selectedTaskDetails, status: nextStatus });
      }

      await api.updateStatus(task.id, nextStatus);
      showToast(nextStatus === 'COMPLETED' ? 'Task completed' : 'Task in progress');
    } catch (err: any) {
      showToast(err.message || 'Failed to update status');
      fetchData();
    }
  };

  const handleSaveTask = async (data: {
    title: string;
    description?: string;
    dueDate: string;
    priority: Priority;
    status: TaskStatus;
  }) => {
    if (editingTask) {
      await api.updateTask(editingTask.id, data);
      showToast('Task updated');
    } else {
      await api.createTask(data);
      showToast('Task created');
    }
    fetchData();
  };

  const handleDeleteTask = async (id: string) => {
    try {
      setWeeklySummaries((prev) =>
        prev.map((week) => {
          const updatedTasks = week.tasks.filter((t) => t.id !== id);
          return {
            ...week,
            tasks: updatedTasks,
            openTasksCount: updatedTasks.filter((t) => t.status !== 'COMPLETED').length,
            completedTasksCount: updatedTasks.filter((t) => t.status === 'COMPLETED').length,
            totalTasksCount: updatedTasks.length,
          };
        })
      );
      setSearchResults((prev) => prev.filter((t) => t.id !== id));

      await api.deleteTask(id);
      showToast('Task deleted');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete task');
      fetchData();
    }
  };

  const handleAddTaskToWeek = (weekStartDate: string) => {
    setEditingTask(null);
    setDefaultDateForNewTask(weekStartDate);
    setIsTaskModalOpen(true);
  };

  const handleOpenGeneralCreateModal = () => {
    setEditingTask(null);
    setDefaultDateForNewTask(undefined);
    setIsTaskModalOpen(true);
  };

  const handleOpenEditModal = (task: ITask) => {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  };

  const totalOpen = weeklySummaries.reduce((acc, w) => acc + w.openTasksCount, 0);
  const totalCompleted = weeklySummaries.reduce((acc, w) => acc + w.completedTasksCount, 0);

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center sm:py-6 px-0 sm:px-4">
      <div className="w-full max-w-5xl bg-white sm:rounded-3xl shadow-xl flex flex-col min-h-screen sm:min-h-[850px] overflow-hidden relative border border-slate-200">
        <Header
          totalOpen={totalOpen}
          totalCompleted={totalCompleted}
          isSearching={isSearching}
          onToggleSearch={() => {
            setIsSearching(!isSearching);
            if (isSearching) setSearchQuery('');
          }}
          onOpenCreateModal={handleOpenGeneralCreateModal}
        />

        {isSearching && (
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            resultCount={debouncedSearchQuery.trim() ? searchResults.length : undefined}
          />
        )}

        <FilterBar
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          priorityFilter={priorityFilter}
          onPriorityChange={setPriorityFilter}
        />

        <main className="flex-1 p-4 sm:p-8 pb-24 overflow-y-auto">
          {loading && weeklySummaries.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-500 mb-2" />
              <p className="text-xs text-slate-500">Loading tasks...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center my-4">
              <AlertCircle className="w-6 h-6 text-rose-500 mx-auto mb-1.5" />
              <p className="text-xs text-rose-700 mb-2">{error}</p>
              <button
                onClick={fetchData}
                className="px-3 py-1.5 bg-rose-600 text-white text-xs rounded-lg"
              >
                Retry
              </button>
            </div>
          ) : searchQuery.trim() ? (
            <SearchResultsView
              query={searchQuery}
              tasks={searchResults}
              hasMore={searchHasMore}
              loadingMore={loadingMoreSearch}
              onLoadMore={handleLoadMoreSearch}
              onToggleStatus={handleToggleStatus}
              onEditTask={handleOpenEditModal}
              onDeleteTask={handleDeleteTask}
              onSelectTask={setSelectedTaskDetails}
            />
          ) : (
            <div>
              <div className="flex items-center justify-between px-1 mb-3">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Weekly Schedule
                </span>
                <span className="text-[11px] text-slate-400">
                  {weeklySummaries.length} weeks
                </span>
              </div>

              {weeklySummaries.map((summary) => (
                <WeekCard
                  key={summary.weekKey}
                  summary={summary}
                  isExpanded={expandedWeeks.has(summary.weekKey)}
                  onToggleExpand={() => handleToggleWeek(summary.weekKey)}
                  onToggleStatus={handleToggleStatus}
                  onEditTask={handleOpenEditModal}
                  onDeleteTask={handleDeleteTask}
                  onSelectTask={setSelectedTaskDetails}
                  onAddTaskToWeek={handleAddTaskToWeek}
                />
              ))}
            </div>
          )}
        </main>

        <button
          onClick={handleOpenGeneralCreateModal}
          className="fixed sm:absolute bottom-6 right-6 w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg active:scale-95 z-30"
          aria-label="Add task"
        >
          <Plus className="w-6 h-6" />
        </button>

        {toastMessage && (
          <div className="fixed sm:absolute bottom-6 left-6 right-20 sm:right-auto z-40 bg-slate-900 text-white text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </div>
        )}

        <TaskModal
          isOpen={isTaskModalOpen}
          onClose={() => {
            setIsTaskModalOpen(false);
            setEditingTask(null);
          }}
          onSubmit={handleSaveTask}
          initialTask={editingTask}
          defaultDate={defaultDateForNewTask}
        />

        <TaskDetailsModal
          task={selectedTaskDetails}
          onClose={() => setSelectedTaskDetails(null)}
          onEdit={handleOpenEditModal}
          onDelete={handleDeleteTask}
          onStatusChange={async (task, newStatus) => {
            await api.updateStatus(task.id, newStatus);
            setSelectedTaskDetails({ ...task, status: newStatus });
            fetchData();
          }}
        />
      </div>
    </div>
  );
};

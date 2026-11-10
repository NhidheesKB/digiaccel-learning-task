import React from 'react';
import { ITask, WeekSummary } from '../types';
import { TaskItem } from './TaskItem';
import { Calendar, CheckCircle2, ChevronDown, Clock, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeekCardProps {
  summary: WeekSummary;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleStatus: (task: ITask) => void;
  onEditTask: (task: ITask) => void;
  onDeleteTask: (id: string) => void;
  onSelectTask: (task: ITask) => void;
  onAddTaskToWeek: (weekStartDate: string) => void;
}

export const WeekCard: React.FC<WeekCardProps> = ({
  summary,
  isExpanded,
  onToggleExpand,
  onToggleStatus,
  onEditTask,
  onDeleteTask,
  onSelectTask,
  onAddTaskToWeek,
}) => {
  const {
    weekLabel,
    isCurrentWeek,
    openTasksCount,
    completedTasksCount,
    totalTasksCount,
    tasks,
  } = summary;

  const progressPercent =
    totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  return (
    <div
      className={`mb-4 rounded-2xl border overflow-hidden ${
        isCurrentWeek
          ? 'bg-white border-indigo-200 shadow-sm'
          : 'bg-white border-slate-200 shadow-sm'
      }`}
    >
      <div
        onClick={onToggleExpand}
        className="p-4 sm:p-5 cursor-pointer select-none active:bg-slate-50 transition-colors"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2.5 rounded-xl flex items-center justify-center ${
                isCurrentWeek ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              <Calendar className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-semibold text-slate-900">{weekLabel}</h2>
                {isCurrentWeek && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                    This Week
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400">Monday – Sunday</p>
            </div>
          </div>

          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-slate-100">
          <div className="flex items-center space-x-2 bg-amber-50/70 rounded-xl px-3 py-2 border border-amber-200/50">
            <Clock className="w-4 h-4 text-amber-600" />
            <div className="text-xs">
              <span className="text-slate-500 mr-1">Open:</span>
              <span className="font-semibold text-amber-800">{openTasksCount}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-emerald-50/70 rounded-xl px-3 py-2 border border-emerald-200/50">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <div className="text-xs">
              <span className="text-slate-500 mr-1">Closed:</span>
              <span className="font-semibold text-emerald-800">{completedTasksCount}</span>
            </div>
          </div>
        </div>

        <div className="mt-3">
          <div className="flex justify-between items-center text-[11px] sm:text-xs text-slate-400 mb-1">
            <span>Progress ({completedTasksCount}/{totalTasksCount})</span>
            <span className="font-semibold text-slate-700">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                progressPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-slate-100 bg-slate-50 p-4 sm:p-5"
          >
            {tasks.length === 0 ? (
              <div className="py-6 text-center">
                <p className="text-xs text-slate-400 mb-2.5">No tasks for this week</p>
                <button
                  onClick={() => onAddTaskToWeek(summary.startDate)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-indigo-600 border border-slate-200 hover:bg-slate-50 font-medium text-xs rounded-xl shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Task
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Tasks ({tasks.length})
                  </span>
                  <span className="text-[10px] sm:text-xs text-slate-400">
                    Swipe left to delete
                  </span>
                </div>

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

                <button
                  onClick={() => onAddTaskToWeek(summary.startDate)}
                  className="w-full mt-3 py-2.5 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 text-xs sm:text-sm font-medium flex items-center justify-center gap-1.5 bg-white transition active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4" />
                  Add task to this week
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

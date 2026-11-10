import React from 'react';
import { ITask, Priority, TaskStatus } from '../types';
import { Calendar, CheckCircle2, Clock, Edit2, Trash2, X } from 'lucide-react';
import { format } from 'date-fns';

interface TaskDetailsModalProps {
  task: ITask | null;
  onClose: () => void;
  onEdit: (task: ITask) => void;
  onDelete: (id: string) => void;
  onStatusChange: (task: ITask, newStatus: TaskStatus) => void;
}

export const TaskDetailsModal: React.FC<TaskDetailsModalProps> = ({
  task,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  if (!task) return null;

  const dueDate = new Date(task.dueDate);
  const formattedDateTime = format(dueDate, 'EEEE, MMMM dd, yyyy • h:mm a');

  const priorityStyles: Record<Priority, string> = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded border capitalize ${
              priorityStyles[task.priority]
            }`}
          >
            {task.priority.toLowerCase()} priority
          </span>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <h2
              className={`text-lg font-bold ${
                task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-900'
              }`}
            >
              {task.title}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formattedDateTime}</span>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
            <span className="block text-[10px] font-semibold uppercase text-slate-400 mb-1">
              Description
            </span>
            <p className="text-xs text-slate-700 whitespace-pre-wrap">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div>
            <span className="block text-[10px] font-semibold uppercase text-slate-400 mb-1.5">
              Status
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() =>
                  onStatusChange(
                    task,
                    task.status === 'COMPLETED' ? 'IN_PROGRESS' : 'COMPLETED'
                  )
                }
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                  task.status === 'COMPLETED'
                    ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {task.status === 'COMPLETED' ? 'Completed' : 'Mark Completed'}
              </button>

              <button
                onClick={() =>
                  onStatusChange(
                    task,
                    task.status === 'IN_PROGRESS' ? 'OPEN' : 'IN_PROGRESS'
                  )
                }
                className={`py-2 px-3 rounded-lg border flex items-center justify-center gap-1.5 text-xs font-medium transition ${
                  task.status === 'IN_PROGRESS'
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-indigo-600" />
                {task.status === 'IN_PROGRESS' ? 'In Progress' : 'Mark In Progress'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(task.id);
              onClose();
            }}
            className="flex items-center gap-1 text-rose-600 hover:text-rose-700 text-xs font-medium"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>

          <button
            onClick={() => {
              onEdit(task);
              onClose();
            }}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-medium shadow-sm"
          >
            <Edit2 className="w-3.5 h-3.5" />
            Edit Task
          </button>
        </div>
      </div>
    </div>
  );
};

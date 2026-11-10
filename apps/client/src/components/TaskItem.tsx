import React, { useState } from 'react';
import { ITask, Priority } from '../types';
import { format, isToday, isTomorrow, isYesterday } from 'date-fns';
import { CheckCircle2, Circle, Clock, Trash2, Edit2 } from 'lucide-react';
import { motion, useAnimation, PanInfo } from 'framer-motion';

interface TaskItemProps {
  task: ITask;
  onToggleStatus: (task: ITask) => void;
  onEdit: (task: ITask) => void;
  onDelete: (id: string) => void;
  onSelect: (task: ITask) => void;
}

export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  onToggleStatus,
  onEdit,
  onDelete,
  onSelect,
}) => {
  const [isSwiped, setIsSwiped] = useState(false);
  const controls = useAnimation();
  const isCompleted = task.status === 'COMPLETED';

  const dueDate = new Date(task.dueDate);
  const timeFormatted = format(dueDate, 'h:mm a');

  let datePrefix = format(dueDate, 'EEE, MMM d');
  if (isToday(dueDate)) datePrefix = 'Today';
  else if (isTomorrow(dueDate)) datePrefix = 'Tomorrow';
  else if (isYesterday(dueDate)) datePrefix = 'Yesterday';

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -40 || info.velocity.x < -300) {
      setIsSwiped(true);
      controls.start({ x: -80 });
    } else {
      setIsSwiped(false);
      controls.start({ x: 0 });
    }
  };

  const resetSwipe = () => {
    setIsSwiped(false);
    controls.start({ x: 0 });
  };

  const priorityStyles: Record<Priority, string> = {
    HIGH: 'bg-rose-50 text-rose-700 border-rose-200',
    MEDIUM: 'bg-amber-50 text-amber-700 border-amber-200',
    LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <div className="relative overflow-hidden rounded-2xl mb-2.5 bg-slate-100 touch-pan-y">
      <div className="absolute inset-y-0 right-0 w-20 bg-rose-500 flex items-center justify-center rounded-r-2xl z-0">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          className="w-full h-full flex flex-col items-center justify-center text-white active:scale-95"
        >
          <Trash2 className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-semibold uppercase">Delete</span>
        </button>
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        transition={{ type: 'spring', damping: 25, stiffness: 250 }}
        onClick={() => {
          if (isSwiped) resetSwipe();
          else onSelect(task);
        }}
        className={`relative z-10 p-3.5 bg-white border rounded-2xl cursor-pointer ${
          isCompleted ? 'border-slate-200 bg-slate-50/70' : 'border-slate-200 shadow-sm'
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStatus(task);
            }}
            className="mt-0.5 text-slate-300 hover:text-indigo-600 transition-colors flex-shrink-0"
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 fill-emerald-100" />
            ) : (
              <Circle className="w-5 h-5 hover:text-indigo-500" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2 mb-1">
              <h3
                className={`text-sm font-semibold truncate ${
                  isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                }`}
              >
                {task.title}
              </h3>

              <span
                className={`text-[10px] font-semibold px-2 py-0.5 rounded border capitalize ${
                  priorityStyles[task.priority]
                }`}
              >
                {task.priority.toLowerCase()}
              </span>
            </div>

            {task.description && (
              <p
                className={`text-xs line-clamp-1 mb-2 ${
                  isCompleted ? 'text-slate-400 line-through' : 'text-slate-500'
                }`}
              >
                {task.description}
              </p>
            )}

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span className={isCompleted ? 'text-slate-400' : 'text-slate-600'}>
                  {datePrefix} • {timeFormatted}
                </span>
                {task.status === 'IN_PROGRESS' && (
                  <span className="ml-1 text-[10px] font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded">
                    In Progress
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={() => onEdit(task)}
                  className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

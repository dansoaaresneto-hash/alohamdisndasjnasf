import React, { useState, useRef, useEffect } from 'react';
import { Task, TaskStatus, Category, RecurrenceFrequency } from '../types';
import { Check, MoreHorizontal, Repeat, ListChecks, ChevronDown, Square, CheckSquare, Target } from 'lucide-react';

interface TimelineItemProps {
  task: Task;
  isLast: boolean;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onSubtaskToggle: (taskId: string, subtaskId: string) => void;
  onStatusChange: (id: string, status: TaskStatus) => void;
  onFocus: (task: Task) => void;
}

const getCategoryColor = (cat: Category) => {
  switch (cat) {
    case Category.Health: return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';
    case Category.Work: return 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400';
    case Category.Shopping: return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
    case Category.Personal: return 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStatusColor = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Completed: return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
    case TaskStatus.InProgress: return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
  }
};

const getStatusLabel = (status: TaskStatus) => {
  switch (status) {
    case TaskStatus.Pending: return 'To Do';
    case TaskStatus.InProgress: return 'In Progress';
    case TaskStatus.Completed: return 'Done';
    default: return 'To Do';
  }
};

const TimelineItem: React.FC<TimelineItemProps> = ({ task, isLast, onToggle, onEdit, onSubtaskToggle, onStatusChange, onFocus }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const statusRef = useRef<HTMLDivElement>(null);

  const isCompleted = task.status === TaskStatus.Completed;
  const isInProgress = task.status === TaskStatus.InProgress;
  
  // Calculate subtask progress if they exist
  const subtasks = task.subtasks || [];
  const completedSubtasks = subtasks.filter(s => s.isCompleted).length;
  const hasSubtasks = subtasks.length > 0;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (statusRef.current && !statusRef.current.contains(event.target as Node)) {
        setIsStatusOpen(false);
      }
    }
    if (isStatusOpen) {
        document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isStatusOpen]);

  return (
    <div className="relative flex gap-4 pb-8 group">
      {/* Vertical Line Connector */}
      {!isLast && (
        <div className="absolute left-[11px] top-3 bottom-0 w-[2px] bg-blue-100 group-hover:bg-blue-200 dark:bg-gray-700 dark:group-hover:bg-gray-600 transition-colors" />
      )}

      {/* Status Indicator (The "Dot") */}
      <div 
        onClick={(e) => {
          e.stopPropagation();
          onToggle(task.id);
        }}
        className={`relative z-10 flex-shrink-0 w-6 h-6 mt-0.5 rounded-full border-2 cursor-pointer flex items-center justify-center transition-all duration-300 
        ${isCompleted 
          ? 'bg-blue-500 border-blue-500' 
          : isInProgress
            ? 'bg-white dark:bg-gray-800 border-blue-500 ring-2 ring-blue-100 dark:ring-blue-900/30'
            : 'bg-white dark:bg-gray-800 border-blue-400 hover:border-blue-500 dark:border-gray-600 dark:hover:border-blue-500'}`}
      >
        {isCompleted ? (
          <Check size={14} className="text-white" />
        ) : isInProgress ? (
           <div className="w-2.5 h-2.5 bg-blue-500 rounded-full" />
        ) : null}
      </div>

      {/* Task Content (Click to Edit) */}
      <div 
        className="flex-grow cursor-pointer" 
        onClick={() => onEdit(task)}
      >
        <div className="flex justify-between items-start">
          <div className="flex flex-col">
            <div 
              className={`font-semibold text-gray-800 dark:text-gray-100 text-lg transition-all duration-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 ${isCompleted ? 'line-through text-gray-400 dark:text-gray-600' : ''}`}
            >
              {task.title}
            </div>
          </div>
          
          <div className="flex items-center gap-1">
             {/* Focus Button */}
            <button
               className="text-gray-300 hover:text-blue-500 dark:text-gray-600 dark:hover:text-blue-400 p-1 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors opacity-0 group-hover:opacity-100"
               title="Start Focus Mode"
               onClick={(e) => {
                 e.stopPropagation();
                 onFocus(task);
               }}
            >
              <Target size={20} />
            </button>

            <button 
              className="text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
            >
              <MoreHorizontal size={20}/>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-1 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="font-medium text-xs text-gray-400 dark:text-gray-500">{task.time}</span>
          
          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getCategoryColor(task.category)}`}>
            {task.category}
          </span>

          {task.recurrence && task.recurrence !== RecurrenceFrequency.None && (
             <div className="flex items-center gap-1 text-xs text-blue-500 dark:text-blue-400 font-medium bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 rounded">
                <Repeat size={10} />
                {task.recurrence}
             </div>
          )}

          {/* Custom Status Dropdown */}
          <div 
            className="relative" 
            ref={statusRef}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setIsStatusOpen(!isStatusOpen)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-bold transition-all hover:brightness-95 dark:hover:brightness-110 w-auto ${getStatusColor(task.status)}`}
            >
              {getStatusLabel(task.status)}
              <ChevronDown size={12} className={`transition-transform duration-200 ${isStatusOpen ? 'rotate-180' : ''} opacity-60`} />
            </button>

            {isStatusOpen && (
              <div className="absolute left-0 top-full mt-1 w-36 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-20">
                {[TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Completed].map((status) => (
                   <button
                     key={status}
                     onClick={() => {
                       onStatusChange(task.id, status);
                       setIsStatusOpen(false);
                     }}
                     className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${task.status === status ? 'text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20' : 'text-gray-600 dark:text-gray-300'}`}
                   >
                     {getStatusLabel(status)}
                     {task.status === status && <Check size={12} />}
                   </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {task.description && (
          <p className={`mt-2 text-sm text-gray-500 dark:text-gray-400 max-w-3xl ${isCompleted ? 'opacity-50' : ''}`}>
            {task.description}
          </p>
        )}

        {hasSubtasks && (
          <div className="mt-2 flex flex-col items-start">
            <div 
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 w-fit px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <ListChecks size={14} className={completedSubtasks === subtasks.length ? 'text-green-500' : 'text-blue-500'} />
              <span className={completedSubtasks === subtasks.length ? 'text-green-600 dark:text-green-400' : ''}>
                {completedSubtasks}/{subtasks.length} steps
              </span>
              {completedSubtasks > 0 && completedSubtasks < subtasks.length && (
                <div className="w-12 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden ml-1">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${(completedSubtasks / subtasks.length) * 100}%` }}
                  />
                </div>
              )}
              <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
            </div>

            {/* Expanded Subtask List */}
            <div className={`w-full overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <div className="pl-2 space-y-1.5 border-l-2 border-gray-100 dark:border-gray-700 ml-2">
                {subtasks.map(subtask => (
                  <div 
                    key={subtask.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSubtaskToggle(task.id, subtask.id);
                    }}
                    className="flex items-center gap-2 p-1 hover:bg-gray-50 dark:hover:bg-gray-800 rounded cursor-pointer group/sub"
                  >
                    <div className={`${subtask.isCompleted ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600 group-hover/sub:text-blue-400'} transition-colors`}>
                      {subtask.isCompleted ? <CheckSquare size={16} /> : <Square size={16} />}
                    </div>
                    <span className={`text-sm ${subtask.isCompleted ? 'text-gray-400 dark:text-gray-600 line-through' : 'text-gray-600 dark:text-gray-300'}`}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {task.progress && !hasSubtasks && (
          <div className="mt-2 text-xs font-bold text-gray-500 dark:text-gray-400">
            Progress - {task.progress.current} of {task.progress.total}
          </div>
        )}
      </div>
    </div>
  );
};

export default TimelineItem;
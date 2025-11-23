import React, { useState, useEffect } from 'react';
import { Task, TaskStatus } from '../types';
import { X, Play, Pause, CheckCircle2, RotateCw, Timer } from 'lucide-react';

interface FocusModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onCompleteSession: (taskId: string, status: TaskStatus) => void;
}

const FocusModal: React.FC<FocusModalProps> = ({ isOpen, task, onClose, onCompleteSession }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [showCompletionDialog, setShowCompletionDialog] = useState(false);

  useEffect(() => {
    let interval: number | undefined;

    if (isOpen && isActive && !showCompletionDialog) {
      interval = window.setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isOpen, isActive, showCompletionDialog]);

  // Reset timer when a new task opens
  useEffect(() => {
    if (isOpen) {
      setSeconds(0);
      setIsActive(true);
      setShowCompletionDialog(false);
    }
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const formatTime = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    
    if (h > 0) {
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleEndFocus = () => {
    setIsActive(false);
    setShowCompletionDialog(true);
  };

  const handleResult = (status: TaskStatus) => {
    onCompleteSession(task.id, status);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl flex flex-col items-center justify-center animate-fade-in transition-colors duration-300">
      <button 
        onClick={onClose}
        className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
      >
        <X size={28} />
      </button>

      {/* Main Focus Content */}
      <div className={`flex flex-col items-center justify-center w-full max-w-2xl px-6 transition-all duration-500 ${showCompletionDialog ? 'opacity-30 scale-95 blur-sm' : 'opacity-100 scale-100'}`}>
        
        <div className="mb-8 inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full font-medium text-sm uppercase tracking-wide">
          <Timer size={16} /> Focus Mode
        </div>

        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 dark:text-white text-center mb-6 leading-tight">
          {task.title}
        </h1>
        
        {task.description && (
          <p className="text-gray-500 dark:text-gray-400 text-lg text-center max-w-xl mb-12">
            {task.description}
          </p>
        )}

        <div className="text-[8rem] md:text-[10rem] font-bold text-gray-900 dark:text-white font-mono tracking-tighter leading-none mb-12 tabular-nums">
          {formatTime(seconds)}
        </div>

        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsActive(!isActive)}
            className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white transition-all active:scale-95"
          >
            {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1"/>}
          </button>
          
          <button
            onClick={handleEndFocus}
            className="px-8 py-4 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold text-lg shadow-lg shadow-red-200 dark:shadow-red-900/40 transition-all hover:scale-105 active:scale-95"
          >
            End Focus Session
          </button>
        </div>
      </div>

      {/* Completion Dialog Overlay */}
      {showCompletionDialog && (
        <div className="absolute inset-0 z-[70] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 max-w-sm w-full mx-4 border border-gray-100 dark:border-gray-700 animate-slide-up">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2 text-center">Great work! 🎉</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-8">
              You focused for <span className="font-bold text-gray-800 dark:text-gray-200">{formatTime(seconds)}</span>. <br/>
              How should we update this task?
            </p>

            <div className="space-y-3">
              <button
                onClick={() => handleResult(TaskStatus.Completed)}
                className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-green-900/40 flex items-center justify-center gap-2 transition-all"
              >
                <CheckCircle2 size={20} />
                Mark as Completed
              </button>
              
              <button
                onClick={() => handleResult(TaskStatus.InProgress)}
                className="w-full py-3.5 bg-white dark:bg-transparent border-2 border-blue-100 dark:border-blue-900 hover:border-blue-500 dark:hover:border-blue-500 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
              >
                <RotateCw size={20} />
                Keep In Progress
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FocusModal;
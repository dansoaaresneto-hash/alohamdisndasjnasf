import React, { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { suggestTasksFromGoal } from '../services/geminiService';
import { AITaskSuggestion } from '../types';

interface SmartAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTasks: (suggestions: AITaskSuggestion[]) => void;
}

const SmartAddModal: React.FC<SmartAddModalProps> = ({ isOpen, onClose, onAddTasks }) => {
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!goal.trim()) return;
    setLoading(true);
    setError('');
    
    try {
      const tasks = await suggestTasksFromGoal(goal);
      if (tasks && tasks.length > 0) {
        onAddTasks(tasks);
        setGoal('');
        onClose();
      } else {
        setError("Couldn't generate tasks. Try a more specific goal.");
      }
    } catch (e) {
      setError("Something went wrong with the AI service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md rounded-2xl p-6 shadow-2xl transform transition-all">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Sparkles size={24} />
            <h2 className="text-xl font-bold">Magic Task Planner</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X size={24} />
          </button>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Tell us your main goal (e.g., "Plan a surprise party" or "Prepare for marathon"), and we'll create a schedule for you.
        </p>

        <textarea
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="I want to..."
          className="w-full p-4 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-indigo-500 focus:outline-none mb-4 resize-none h-32 text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
        />

        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={loading || !goal.trim()}
          className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
          {loading ? 'Thinking...' : 'Generate Plan'}
        </button>
      </div>
    </div>
  );
};

export default SmartAddModal;
import React, { useState, useEffect, useRef } from 'react';
import { X, Calendar, Clock, Tag, Repeat, Trash2, Save, Plus, CheckSquare, Square, MinusCircle, Circle, CheckCircle2, Timer } from 'lucide-react';
import { Task, Category, TaskStatus, RecurrenceFrequency, Subtask } from '../types';
import { format } from 'date-fns';
import CalendarPicker from './CalendarPicker';

interface TaskDetailModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
}

const TaskDetailModal: React.FC<TaskDetailModalProps> = ({ isOpen, task, onClose, onSave, onDelete }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState('');
  const [category, setCategory] = useState<Category>(Category.Other);
  const [status, setStatus] = useState<TaskStatus>(TaskStatus.Pending);
  const [recurrence, setRecurrence] = useState<RecurrenceFrequency>(RecurrenceFrequency.None);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Close calendar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsCalendarOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [calendarRef]);

  // Helper to convert "8:00 am" to "08:00" for input
  const convertDisplayToInputTime = (displayTime: string) => {
    if (!displayTime) return '';
    try {
      const [timePart, amp] = displayTime.split(' ');
      let [hours, minutes] = timePart.split(':');
      let h = parseInt(hours);
      if (amp.toLowerCase() === 'pm' && h < 12) h += 12;
      if (amp.toLowerCase() === 'am' && h === 12) h = 0;
      return `${h.toString().padStart(2, '0')}:${minutes}`;
    } catch (e) {
      return '';
    }
  };

  // Helper to convert "13:00" to "1:00 pm" for display
  const convertInputToDisplayTime = (inputTime: string) => {
    if (!inputTime) return '';
    const [hours, minutes] = inputTime.split(':');
    let h = parseInt(hours);
    const ampm = h >= 12 ? 'pm' : 'am';
    h = h % 12;
    h = h ? h : 12; // the hour '0' should be '12'
    return `${h}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setDate(task.date);
      setTime(convertDisplayToInputTime(task.time));
      setCategory(task.category);
      setStatus(task.status);
      setRecurrence(task.recurrence || RecurrenceFrequency.None);
      setSubtasks(task.subtasks || []);
    }
  }, [task]);

  if (!isOpen || !task) return null;

  const handleSave = () => {
    const updatedTask: Task = {
      ...task,
      title,
      description,
      date: date,
      time: convertInputToDisplayTime(time),
      category,
      status,
      recurrence,
      subtasks
    };
    onSave(updatedTask);
    onClose();
  };

  const handleDelete = () => {
    onDelete(task.id);
    onClose();
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSubtask: Subtask = {
      id: Date.now().toString(),
      title: newSubtaskTitle,
      isCompleted: false
    };
    setSubtasks([...subtasks, newSubtask]);
    setNewSubtaskTitle('');
  };

  const toggleSubtask = (id: string) => {
    setSubtasks(subtasks.map(st => 
      st.id === id ? { ...st, isCompleted: !st.isCompleted } : st
    ));
  };

  const deleteSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors duration-300">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-800/50">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Edit Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6">
          
          {/* Status Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Status</label>
            <div className="flex p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
              <button
                onClick={() => setStatus(TaskStatus.Pending)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === TaskStatus.Pending 
                    ? 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Circle size={16} className={status === TaskStatus.Pending ? "text-gray-400" : ""} />
                To Do
              </button>
              <button
                onClick={() => setStatus(TaskStatus.InProgress)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === TaskStatus.InProgress 
                    ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <Timer size={16} className={status === TaskStatus.InProgress ? "text-blue-500" : ""} />
                In Progress
              </button>
              <button
                onClick={() => setStatus(TaskStatus.Completed)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
                  status === TaskStatus.Completed 
                    ? 'bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' 
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                <CheckCircle2 size={16} className={status === TaskStatus.Completed ? "text-green-500" : ""} />
                Done
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Task Name</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full text-xl font-semibold text-gray-800 dark:text-white border-b-2 border-transparent focus:border-blue-500 focus:outline-none bg-transparent placeholder-gray-300 dark:placeholder-gray-600 transition-colors pb-1"
              placeholder="Enter task name"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-gray-600 dark:text-gray-200 text-sm"
              rows={3}
              placeholder="Add details, notes, etc."
            />
          </div>

          {/* Subtasks Section */}
          <div>
            <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Subtasks</label>
            <div className="space-y-2 mb-3">
              {subtasks.map(st => (
                <div key={st.id} className="flex items-center gap-3 group">
                  <button 
                    onClick={() => toggleSubtask(st.id)}
                    className={`flex-shrink-0 transition-colors ${st.isCompleted ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600 hover:text-gray-400'}`}
                  >
                    {st.isCompleted ? <CheckSquare size={18} /> : <Square size={18} />}
                  </button>
                  <span className={`flex-1 text-sm ${st.isCompleted ? 'text-gray-400 line-through' : 'text-gray-700 dark:text-gray-200'}`}>
                    {st.title}
                  </span>
                  <button 
                    onClick={() => deleteSubtask(st.id)}
                    className="text-gray-300 dark:text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <MinusCircle size={16} />
                  </button>
                </div>
              ))}
            </div>
            
            <form onSubmit={handleAddSubtask} className="flex gap-2">
              <input 
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="Add a step..."
                className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
              />
              <button 
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Plus size={18} />
              </button>
            </form>
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Date with Mini Calendar */}
            <div className="relative" ref={calendarRef}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Calendar size={16} className="text-blue-500" /> Date
              </label>
              <button
                onClick={() => setIsCalendarOpen(!isCalendarOpen)}
                className="w-full text-left p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none active:bg-gray-100 transition-colors text-gray-800 dark:text-gray-200"
              >
                {date ? format(date, 'MMM d, yyyy') : 'Select Date'}
              </button>
              
              {isCalendarOpen && (
                <CalendarPicker 
                  selectedDate={date} 
                  onSelect={(d) => setDate(d)} 
                  onClose={() => setIsCalendarOpen(false)}
                />
              )}
            </div>

            {/* Time */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Clock size={16} className="text-blue-500" /> Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
              />
            </div>

            {/* Category */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Tag size={16} className="text-blue-500" /> Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
              >
                {Object.values(Category).map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

             {/* Recurrence */}
             <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                <Repeat size={16} className="text-blue-500" /> Frequency
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value as RecurrenceFrequency)}
                className="w-full p-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none text-gray-800 dark:text-gray-200"
              >
                {Object.values(RecurrenceFrequency).map((freq) => (
                  <option key={freq} value={freq}>{freq}</option>
                ))}
              </select>
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800">
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <Trash2 size={18} />
            Delete
          </button>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-5 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-md shadow-blue-200 dark:shadow-blue-900/30 transition-all active:scale-95"
            >
              <Save size={18} />
              Save Changes
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default TaskDetailModal;
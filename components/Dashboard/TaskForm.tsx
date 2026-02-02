
import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority } from '../../types.ts';
import { refineTaskDescription, suggestCategoryAndPriority } from '../../services/geminiService.ts';

interface TaskFormProps {
  task?: Task;
  onSave: (data: Omit<Task, 'id' | 'createdAt' | 'userId'>) => void;
  onClose: () => void;
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onSave, onClose }) => {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [status, setStatus] = useState<TaskStatus>(task?.status || TaskStatus.TODO);
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || TaskPriority.MEDIUM);
  const [category, setCategory] = useState(task?.category || 'Deep Work');
  const [dueDate, setDueDate] = useState(task?.dueDate || new Date().toISOString().split('T')[0]);
  const [isRefining, setIsRefining] = useState(false);
  const [isSuggesting, setIsSuggesting] = useState(false);

  const handleRefine = async () => {
    if (!title) return;
    setIsRefining(true);
    const refined = await refineTaskDescription(title, description);
    setDescription(refined);
    setIsRefining(false);
  };

  const handleSuggest = async () => {
    if (!title) return;
    setIsSuggesting(true);
    const suggestion = await suggestCategoryAndPriority(title, description);
    if (suggestion) {
      setCategory(suggestion.category);
      setPriority(suggestion.priority as TaskPriority);
    }
    setIsSuggesting(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    onSave({ title, description, status, priority, category, dueDate });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/40 backdrop-blur-md">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-stone-100">
        <div className="p-8 border-b border-stone-50 flex items-center justify-between">
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">{task ? 'Edit Intention' : 'New Intention'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-stone-50 rounded-full transition-colors text-stone-300 hover:text-stone-600">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-10 space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Intent Title</label>
            <input
              type="text"
              required
              className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-stone-900 font-bold bg-stone-50/30"
              placeholder="What is your focus?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Context</label>
              <button
                type="button"
                onClick={handleRefine}
                disabled={isRefining || !title}
                className="text-[10px] font-black uppercase tracking-widest text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 disabled:opacity-50 transition-colors"
              >
                <span>{isRefining ? '⏳' : '✨'}</span>
                {isRefining ? 'Polishing...' : 'Clarify with AI'}
              </button>
            </div>
            <textarea
              className="w-full px-5 py-4 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all h-28 resize-none text-stone-700 leading-relaxed bg-stone-50/30"
              placeholder="Add depth to this intention..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Target Date</label>
              <input
                type="date"
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-900 font-bold bg-stone-50/30"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">Sphere</label>
                <button
                  type="button"
                  onClick={handleSuggest}
                  disabled={isSuggesting || !title}
                  className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-800 hover:text-emerald-950 disabled:opacity-50"
                >
                  {isSuggesting ? '...' : '🤖 AUTO'}
                </button>
              </div>
              <input
                type="text"
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-stone-900 font-bold bg-stone-50/30"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Status</label>
              <select
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/30 text-stone-900 font-bold appearance-none cursor-pointer"
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
              >
                <option value={TaskStatus.TODO}>Focus</option>
                <option value={TaskStatus.IN_PROGRESS}>Flow</option>
                <option value={TaskStatus.DONE}>Calm</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">Weight</label>
              <select
                className="w-full px-5 py-3 rounded-2xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-stone-50/30 text-stone-900 font-bold appearance-none cursor-pointer"
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
              >
                <option value={TaskPriority.LOW}>Subtle</option>
                <option value={TaskPriority.MEDIUM}>Balanced</option>
                <option value={TaskPriority.HIGH}>Urgent</option>
              </select>
            </div>
          </div>

          <div className="pt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-5 py-4 rounded-2xl border border-stone-200 text-stone-400 font-bold hover:bg-stone-50 hover:text-stone-600 transition-all uppercase tracking-widest text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-[2] bg-emerald-800 hover:bg-emerald-950 text-white font-black py-4 px-4 rounded-2xl shadow-2xl shadow-emerald-900/20 transition-all transform hover:-translate-y-1 active:scale-95 uppercase tracking-widest text-xs"
            >
              {task ? 'Commit Changes' : 'Record Intention'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskForm;

import React, { useState } from 'react';
import { Task, TaskStatus, TaskPriority, SubTask } from '../../types.ts';
import { decomposeTask } from '../../services/geminiService.ts';

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (updates: Partial<Task>) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, onUpdate }) => {
  const [isDecomposing, setIsDecomposing] = useState(false);

  const getPriorityColor = (p: TaskPriority) => {
    switch (p) {
      case TaskPriority.HIGH: return 'text-orange-700 bg-orange-50 border-orange-100';
      case TaskPriority.MEDIUM: return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case TaskPriority.LOW: return 'text-stone-500 bg-stone-50 border-stone-100';
      default: return 'text-stone-400 bg-stone-50 border-stone-100';
    }
  };

  const toggleSubTask = (subId: string) => {
    const updatedSubTasks = task.subTasks?.map(st => 
      st.id === subId ? { ...st, isDone: !st.isDone } : st
    );
    onUpdate({ subTasks: updatedSubTasks });
  };

  const handleDecompose = async () => {
    setIsDecomposing(true);
    const subTasks = await decomposeTask(task.title, task.description);
    onUpdate({ subTasks });
    setIsDecomposing(false);
  };

  const doneSubTasks = task.subTasks?.filter(st => st.isDone).length || 0;
  const totalSubTasks = task.subTasks?.length || 0;
  const progress = totalSubTasks > 0 ? (doneSubTasks / totalSubTasks) * 100 : 0;

  return (
    <div className="bg-white p-6 rounded-3xl border border-stone-100 shadow-sm hover:shadow-xl hover:shadow-stone-200/40 transition-all group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-stone-400 bg-stone-50 px-2 py-0.5 rounded-lg border border-stone-100">
              {task.category}
            </span>
          </div>
          <h4 className={`text-xl font-bold text-stone-900 mb-1 tracking-tight ${task.status === TaskStatus.DONE ? 'line-through text-stone-300' : ''}`}>
            {task.title}
          </h4>
          <p className="text-stone-500 text-sm leading-relaxed line-clamp-2 mb-5">
            {task.description || 'No additional details.'}
          </p>

          {totalSubTasks > 0 && (
            <div className="mb-6 space-y-3 bg-stone-50/50 p-4 rounded-2xl border border-stone-100">
              <div className="flex justify-between items-center text-[9px] font-black text-stone-400 uppercase tracking-[0.2em]">
                <span>Roadmap</span>
                <span className="text-emerald-700">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-700 h-full transition-all duration-700 ease-out" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-1 gap-2 pt-1">
                {task.subTasks?.map(st => (
                  <div key={st.id} className="flex items-center gap-3">
                    <button 
                      onClick={() => toggleSubTask(st.id)}
                      className={`h-5 w-5 rounded-md border-2 transition-all flex items-center justify-center ${
                        st.isDone ? 'bg-emerald-800 border-emerald-800 text-white' : 'bg-white border-stone-300 text-transparent hover:border-emerald-600'
                      }`}
                    >
                      {st.isDone && <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>}
                    </button>
                    <span className={`text-sm font-medium transition-colors ${st.isDone ? 'line-through text-stone-300' : 'text-stone-600'}`}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-[11px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-1.5 text-stone-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
              </svg>
              {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
            </span>
            {totalSubTasks === 0 && (
              <button 
                onClick={handleDecompose}
                disabled={isDecomposing}
                className="text-emerald-800 hover:text-emerald-950 flex items-center gap-1.5 transition-colors group/ai"
              >
                <span className="group-hover/ai:rotate-12 transition-transform">✨</span>
                {isDecomposing ? 'Refining...' : 'AI Strategy'}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
            <button onClick={onEdit} className="p-2 text-stone-300 hover:text-emerald-800 hover:bg-stone-50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={onDelete} className="p-2 text-stone-300 hover:text-orange-700 hover:bg-orange-50 rounded-xl transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <select
            value={task.status}
            onChange={(e) => onUpdate({ status: e.target.value as TaskStatus })}
            className={`text-[10px] font-black uppercase tracking-[0.2em] bg-stone-50 border border-stone-100 px-3 py-1.5 rounded-lg focus:outline-none cursor-pointer transition-colors ${
              task.status === TaskStatus.DONE ? 'text-emerald-800 bg-emerald-50 border-emerald-100' : 
              task.status === TaskStatus.IN_PROGRESS ? 'text-orange-800 bg-orange-50 border-orange-100' : 'text-stone-400'
            }`}
          >
            <option value={TaskStatus.TODO}>Focus</option>
            <option value={TaskStatus.IN_PROGRESS}>Flow</option>
            <option value={TaskStatus.DONE}>Calm</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
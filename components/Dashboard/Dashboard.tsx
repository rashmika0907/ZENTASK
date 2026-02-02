
import React, { useState, useEffect, useRef } from 'react';
import { User, Task, TaskStatus, TaskPriority } from '../../types.ts';
import TaskCard from './TaskCard.tsx';
import TaskForm from './TaskForm.tsx';
import { generateDailyBriefingAudio } from '../../services/geminiService.ts';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [filter, setFilter] = useState<TaskStatus | 'ALL'>('ALL');
  const [isBriefingLoading, setIsBriefingLoading] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem(`tasks_${user.id}`);
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, [user.id]);

  useEffect(() => {
    localStorage.setItem(`tasks_${user.id}`, JSON.stringify(tasks));
  }, [tasks, user.id]);

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const handleDailyBrief = async () => {
    setIsBriefingLoading(true);
    try {
      const audioData = await generateDailyBriefingAudio(tasks);
      if (audioData) {
        if (!audioCtxRef.current) {
          audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        
        const audioCtx = audioCtxRef.current;
        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const binaryString = atob(audioData);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBuffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
        const source = audioCtx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioCtx.destination);
        source.start();
      } else {
        alert("Could not generate briefing at this time.");
      }
    } catch (err) {
      console.error("Playback error:", err);
      alert("Error playing briefing.");
    } finally {
      setIsBriefingLoading(false);
    }
  };

  const addTask = (taskData: Omit<Task, 'id' | 'createdAt' | 'userId'>) => {
    const newTask: Task = {
      ...taskData,
      id: 't-' + Math.random().toString(36).substr(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
      subTasks: []
    };
    setTasks([newTask, ...tasks]);
    setIsFormOpen(false);
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, ...updates } : t));
    setEditingTask(undefined);
    setIsFormOpen(false);
  };

  const deleteTask = (id: string) => {
    if (window.confirm('Delete this task?')) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const filteredTasks = filter === 'ALL' ? tasks : tasks.filter(t => t.status === filter);

  const stats = [
    { name: 'To Do', value: tasks.filter(t => t.status === TaskStatus.TODO).length, color: '#a8a29e' },
    { name: 'Doing', value: tasks.filter(t => t.status === TaskStatus.IN_PROGRESS).length, color: '#d4a373' },
    { name: 'Done', value: tasks.filter(t => t.status === TaskStatus.DONE).length, color: '#3f6212' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Peace, {user.username}.</h1>
          <p className="text-stone-500 font-medium text-lg mt-1">Here is what your day looks like.</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleDailyBrief}
            disabled={isBriefingLoading}
            className="bg-white border border-stone-200 text-stone-700 px-5 py-3 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center gap-3 shadow-sm disabled:opacity-50"
          >
            <span className="text-xl">{isBriefingLoading ? '⏳' : '🌿'}</span>
            {isBriefingLoading ? 'Reflecting...' : 'Daily Brief'}
          </button>
          <button
            onClick={() => { setEditingTask(undefined); setIsFormOpen(true); }}
            className="bg-emerald-800 hover:bg-emerald-900 text-white px-7 py-3 rounded-2xl font-bold shadow-xl shadow-emerald-900/10 transition-all flex items-center gap-3"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            New Task
          </button>
          <button
            onClick={onLogout}
            className="text-stone-300 hover:text-stone-600 p-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(['ALL', TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.DONE] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  filter === s 
                    ? 'bg-stone-900 text-white shadow-lg' 
                    : 'bg-white text-stone-500 hover:bg-stone-50 border border-stone-200'
                }`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-5">
            {filteredTasks.length > 0 ? (
              filteredTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={() => { setEditingTask(task); setIsFormOpen(true); }}
                  onDelete={() => deleteTask(task.id)}
                  onUpdate={(updates) => updateTask(task.id, updates)}
                />
              ))
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-stone-100">
                <p className="text-stone-300 font-bold text-xl">The canvas is empty.</p>
                <button 
                  onClick={() => setIsFormOpen(true)}
                  className="mt-4 text-emerald-800 font-black hover:underline tracking-tight"
                >
                  Start creating
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-10">
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-stone-400 mb-8">Pulse Check</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="0" vertical={false} stroke="#f5f5f4" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#a8a29e' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fontWeight: 700, fill: '#a8a29e' }} />
                  <Tooltip 
                    cursor={{ fill: '#fafaf9' }}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="value" radius={[6, 6, 6, 6]} barSize={32}>
                    {stats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-stone-900 p-8 rounded-3xl shadow-2xl text-white relative overflow-hidden group">
             <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-500">Assistant</span>
                </div>
                <h3 className="text-xl font-bold mb-3">Gemini 3.0 Pro</h3>
                <p className="text-stone-400 text-sm leading-relaxed mb-6">
                  Intelligent task decomposition and context-aware briefings are active.
                </p>
                <div className="inline-flex items-center gap-2 bg-stone-800 px-4 py-2 rounded-full text-[10px] font-bold tracking-widest text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all cursor-default">
                  REASONING ACTIVE
                </div>
             </div>
             <div className="absolute -right-8 -bottom-8 opacity-5 transition-transform group-hover:scale-110 duration-700">
                <svg width="200" height="200" viewBox="0 0 24 24" fill="white"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
             </div>
          </div>
        </div>
      </div>

      {isFormOpen && (
        <TaskForm
          task={editingTask}
          onSave={editingTask ? (data) => updateTask(editingTask.id, data) : addTask}
          onClose={() => { setIsFormOpen(false); setEditingTask(undefined); }}
        />
      )}
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect, useMemo } from 'react';
import { 
  Timer, LayoutGrid, RefreshCw, ListTodo, Zap, AlertTriangle, 
  ChevronRight, Plus, X, Trophy, Play, Pause, RotateCcw, 
  BrainCircuit, Anchor, Target, Flame, Sparkles, Calendar as CalendarIcon,
  ChevronLeft, Repeat, Award, ZapOff, TrendingUp, Sun, Moon
} from 'lucide-react';
import { Priority, Task, Habit, IdentityBoost, PanicSolution, RecurringTask, Frequency } from './types';
import { geminiService } from './services/geminiService';

// Improved Nexus Synapse Logo - Red-Orange Edition
const SynapseLogo = ({ className = "" }: { className?: string }) => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={`shrink-0 ${className}`}>
    <defs>
      <linearGradient id="logo-grad-fire" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#f97316" /> {/* Orange 500 */}
        <stop offset="100%" stopColor="#ef4444" /> {/* Red 500 */}
      </linearGradient>
    </defs>
    {/* Background Glow */}
    <circle cx="16" cy="16" r="14" fill="currentColor" fillOpacity="0.05" />
    
    {/* Neural Pathways */}
    <path d="M16 8V4M16 28V24M8 16H4M28 16H24M10.3 10.3L7.5 7.5M24.5 24.5L21.7 21.7M10.3 21.7L7.5 24.5M24.5 7.5L21.7 10.3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="opacity-40" />
    
    {/* Connection Arc */}
    <path d="M22 10C24 12 25 15 25 18C25 22.4183 20.9706 26 16 26" stroke="url(#logo-grad-fire)" strokeWidth="2" strokeLinecap="round" className="spark-line" />
    
    {/* Executive Nucleus */}
    <circle cx="16" cy="16" r="6" stroke="url(#logo-grad-fire)" strokeWidth="2" className="synapse-core" />
    <circle cx="16" cy="16" r="3" fill="url(#logo-grad-fire)" className="synapse-core" />
    
    {/* Directional Spark */}
    <path d="M16 16L26 6" stroke="url(#logo-grad-fire)" strokeWidth="2.5" strokeLinecap="round" className="opacity-80" />
    <circle cx="26" cy="6" r="2" fill="#ef4444" />
  </svg>
);

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'execute' | 'plan' | 'habits' | 'capture'>('execute');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recurringTasks, setRecurringTasks] = useState<RecurringTask[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [points, setPoints] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('neuro-theme') as 'light' | 'dark') || 'dark';
  });
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(90 * 60);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // AI States
  const [identityBoost, setIdentityBoost] = useState<IdentityBoost | null>(null);
  const [panicTask, setPanicTask] = useState<Task | null>(null);
  const [panicSolution, setPanicSolution] = useState<PanicSolution | null>(null);
  const [isRescuing, setIsRescuing] = useState(false);
  const [isDecomposing, setIsDecomposing] = useState(false);
  
  // Form States
  const [newTaskText, setNewTaskText] = useState("");
  const [obstacleInput, setObstacleInput] = useState("");
  const [showHabitForm, setShowHabitForm] = useState(false);
  const [showRecurringForm, setShowRecurringForm] = useState(false);
  const [newHabit, setNewHabit] = useState({ text: "", anchor: "", tinyAction: "" });
  const [newRecurring, setNewRecurring] = useState({ text: "", frequency: Frequency.DAILY, priority: Priority.Q2 });

  // Level Logic
  const neuroLevel = useMemo(() => {
    if (points < 100) return { title: "Iniciante Neural", next: 100, color: "slate" };
    if (points < 500) return { title: "Arquiteto de Hábitos", next: 500, color: "sky" };
    if (points < 1500) return { title: "Mestre da Execução", next: 1500, color: "indigo" };
    return { title: "Ninja da Neuroplasticidade", next: Infinity, color: "orange" };
  }, [points]);

  // Effects
  useEffect(() => {
    localStorage.setItem('neuro-theme', theme);
  }, [theme]);

  useEffect(() => {
    let interval: any = null;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft]);

  // Mini-Calendar Helpers
  const calendarDays = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = -2; i < 12; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push({
        full: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''),
        dayNum: date.getDate(),
        isToday: date.toISOString().split('T')[0] === today.toISOString().split('T')[0]
      });
    }
    return days;
  }, []);

  // Filtered Tasks for Selected Date
  const dayTasks = useMemo(() => {
    return tasks.filter(t => t.date === selectedDate);
  }, [tasks, selectedDate]);

  // Actions
  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const addTask = () => {
    if (!newTaskText.trim()) return;
    const task: Task = {
      id: crypto.randomUUID(),
      text: newTaskText,
      priority: Priority.Q2,
      energy: 'Média',
      completed: false,
      subtasks: [],
      date: selectedDate,
      createdAt: Date.now()
    };
    setTasks(prev => [...prev, task]);
    setNewTaskText("");
  };

  const addRecurringTask = () => {
    if (!newRecurring.text.trim()) return;
    const task: RecurringTask = {
      id: crypto.randomUUID(),
      text: newRecurring.text,
      frequency: newRecurring.frequency,
      priority: newRecurring.priority,
      energy: 'Média',
      completedDates: []
    };
    setRecurringTasks(prev => [...prev, task]);
    setNewRecurring({ text: "", frequency: Frequency.DAILY, priority: Priority.Q2 });
    setShowRecurringForm(false);
  };

  const toggleTask = async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const isNowCompleted = !task.completed;
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: isNowCompleted } : t));
    
    if (isNowCompleted) {
      setPoints(prev => prev + 15);
      const boostText = await geminiService.generateIdentityBoost(task.text);
      setIdentityBoost({ text: boostText, taskTitle: task.text });
      setTimeout(() => setIdentityBoost(null), 8000);
    } else {
      setPoints(prev => Math.max(0, prev - 15));
    }
  };

  const handleDecompose = async (task: Task) => {
    setIsDecomposing(true);
    try {
      const steps = await geminiService.decomposeTask(task.text);
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, subtasks: steps } : t));
      if (selectedTask?.id === task.id) {
        setSelectedTask(prev => prev ? { ...prev, subtasks: steps } : null);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDecomposing(false);
    }
  };

  const handleRescue = async () => {
    if (!panicTask || !obstacleInput.trim()) return;
    setIsRescuing(true);
    try {
      const solution = await geminiService.rescueTask(panicTask.text, obstacleInput);
      setPanicSolution(solution);
    } catch (e) {
      console.error(e);
    } finally {
      setIsRescuing(false);
    }
  };

  const moveTaskPriority = (taskId: string, newPriority: Priority) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, priority: newPriority } : t));
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const addHabitAction = () => {
    if (!newHabit.text) return;
    const habit: Habit = {
      id: crypto.randomUUID(),
      ...newHabit,
      streak: 0,
      lastCompleted: null
    };
    setHabits(prev => [...prev, habit]);
    setNewHabit({ text: "", anchor: "", tinyAction: "" });
    setShowHabitForm(false);
  };

  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-500 ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Navigation Sidebar */}
      <nav className={`fixed bottom-0 w-full transition-colors duration-500 backdrop-blur-xl border-t md:static md:w-64 md:h-screen md:border-t-0 md:border-r z-50 ${isDark ? 'bg-[#0a1128]/95 border-slate-800' : 'bg-white/95 border-slate-200'}`}>
        <div className="flex items-center justify-between p-4 md:flex-col md:items-start md:p-8 md:mb-4">
          <div>
            <h1 className={`text-2xl font-black flex items-center gap-3 italic tracking-tight ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
              <SynapseLogo />
              EXECUTE
            </h1>
            <p className={`text-[10px] font-bold mt-2 uppercase tracking-widest ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Neuroprodutividade</p>
          </div>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-xl transition-all ${isDark ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'} md:mt-8`}
          >
            {isDark ? <Sun size={20}/> : <Moon size={20}/>}
          </button>
        </div>
        
        <div className="flex justify-around p-2 md:flex-col md:gap-2 md:px-4">
          <NavButton isDark={isDark} icon={<Timer size={22}/>} label="Focar" active={activeTab === 'execute'} onClick={() => setActiveTab('execute')} />
          <NavButton isDark={isDark} icon={<LayoutGrid size={22}/>} label="Planejar" active={activeTab === 'plan'} onClick={() => setActiveTab('plan')} />
          <NavButton isDark={isDark} icon={<RefreshCw size={22}/>} label="Rotinas" active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} />
          <NavButton isDark={isDark} icon={<ListTodo size={22}/>} label="Captura" active={activeTab === 'capture'} onClick={() => setActiveTab('capture')} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-8">
          
          {/* Mini Calendar Header */}
          <div className={`${isDark ? 'bg-[#0a1128]/50 border-slate-800/50' : 'bg-white border-slate-200 shadow-sm'} border rounded-[32px] p-4 overflow-x-auto`}>
            <div className="flex gap-3 min-w-max px-2">
              {calendarDays.map((day) => (
                <button
                  key={day.full}
                  onClick={() => setSelectedDate(day.full)}
                  className={`flex flex-col items-center justify-center w-14 h-20 rounded-2xl transition-all ${selectedDate === day.full ? (isDark ? 'bg-orange-600 text-white animate-glow-orange scale-110 z-10' : 'bg-orange-600 text-white shadow-lg scale-110 z-10') : (isDark ? 'bg-slate-900/50 text-slate-500 hover:bg-slate-800' : 'bg-slate-50 text-slate-400 hover:bg-slate-100')}`}
                >
                  <span className="text-[10px] font-black uppercase tracking-tighter mb-1">{day.dayName}</span>
                  <span className="text-xl font-black">{day.dayNum}</span>
                  {day.isToday && <div className={`w-1 h-1 rounded-full mt-1 ${selectedDate === day.full ? 'bg-white' : 'bg-orange-500'}`} />}
                </button>
              ))}
            </div>
          </div>

          {/* Identity Boost Notification */}
          {identityBoost && (
            <div className="fixed top-6 right-6 z-[100] w-80 animate-in slide-in-from-right duration-500">
              <div className={`p-6 rounded-3xl shadow-2xl border ${isDark ? 'bg-orange-600 border-orange-400 animate-glow-orange' : 'bg-orange-600 text-white border-orange-400'}`}>
                <div className="flex items-center justify-between mb-3">
                  <Trophy className="text-yellow-400" size={24}/>
                  <button onClick={() => setIdentityBoost(null)} className="text-white/60 hover:text-white"><X size={18}/></button>
                </div>
                <p className="text-sm font-bold text-white mb-1">Identidade Reforçada</p>
                <p className="text-xs text-orange-100 italic leading-relaxed">"{identityBoost.text}"</p>
              </div>
            </div>
          )}

          {/* TAB: EXECUTE */}
          {activeTab === 'execute' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Timer Section */}
                <div className="lg:col-span-2 space-y-6">
                  <div className={`border rounded-[40px] p-10 text-center shadow-2xl relative overflow-hidden ${isDark ? 'bg-[#0a1128] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <div className={`absolute top-0 left-0 w-full h-1 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <div className="h-full bg-orange-500 transition-all duration-1000" style={{ width: `${(timeLeft / (90*60)) * 100}%` }}></div>
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] mb-4 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Ciclo Ultradiano</span>
                    <div className={`text-[120px] leading-none font-black font-mono tracking-tighter tabular-nums mb-10 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {formatTime(timeLeft)}
                    </div>
                    <div className="flex justify-center gap-6">
                      <button 
                        onClick={() => setIsTimerActive(!isTimerActive)}
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${isTimerActive ? (isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-200 text-slate-500') : (isDark ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/40 animate-glow-orange' : 'bg-orange-600 text-white shadow-lg shadow-orange-200')}`}
                      >
                        {isTimerActive ? <Pause size={32} /> : <Play size={32} fill="currentColor" />}
                      </button>
                      <button 
                        onClick={() => { setIsTimerActive(false); setTimeLeft(90*60); }}
                        className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all ${isDark ? 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600'}`}
                      >
                        <RotateCcw size={28} />
                      </button>
                    </div>
                  </div>

                  {/* Focused Task Breakdown */}
                  <div className={`border rounded-[40px] p-8 min-h-[300px] shadow-lg ${isDark ? 'bg-[#0a1128] border-slate-800' : 'bg-white border-slate-200'}`}>
                    {selectedTask ? (
                      <div className="space-y-6">
                        <div className="flex justify-between items-start">
                          <div>
                            <h2 className="text-3xl font-black">{selectedTask.text}</h2>
                            <div className="flex items-center gap-2 mt-2">
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-orange-600/20 text-orange-400 animate-pulse-orange`}>
                                {selectedTask.priority === Priority.Q1 ? 'Faça Agora' : selectedTask.priority}
                              </span>
                              <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>Energia {selectedTask.energy}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => { setPanicTask(selectedTask); setPanicSolution(null); setObstacleInput(""); }}
                            className="p-3 bg-orange-600/10 text-orange-600 rounded-2xl hover:bg-orange-600 hover:text-white transition-all border border-orange-600/20 group animate-pulse-orange"
                            title="Resgate Neural"
                          >
                            <AlertTriangle size={24} />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {selectedTask.subtasks.length > 0 ? (
                            selectedTask.subtasks.map((step, i) => (
                              <div key={i} className={`flex items-center gap-4 p-5 rounded-3xl border transition-all ${isDark ? 'bg-slate-800/20 border-slate-700/50 hover:border-orange-500/30 hover:bg-slate-800/30' : 'bg-slate-50 border-slate-100 hover:border-orange-200 hover:bg-white'}`}>
                                <div className={`w-8 h-8 rounded-full border flex items-center justify-center font-black text-xs ${isDark ? 'bg-[#020617] border-slate-700 text-orange-400' : 'bg-white border-slate-200 text-orange-600'}`}>
                                  {i + 1}
                                </div>
                                <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>{step}</p>
                              </div>
                            ))
                          ) : (
                            <button 
                              onClick={() => handleDecompose(selectedTask)}
                              disabled={isDecomposing}
                              className={`w-full py-16 border-2 border-dashed rounded-[40px] flex flex-col items-center justify-center gap-4 transition-all group ${isDark ? 'border-slate-800 text-slate-500 hover:border-orange-500/40 hover:text-orange-400 hover:bg-orange-500/5' : 'border-slate-200 text-slate-400 hover:border-orange-200 hover:text-orange-600 hover:bg-orange-50'}`}
                            >
                              {isDecomposing ? (
                                <BrainCircuit className="animate-spin" size={48}/>
                              ) : (
                                <>
                                  <Sparkles size={48} className={`${isDark ? 'text-orange-600 opacity-50 group-hover:opacity-100' : 'text-orange-400 group-hover:text-orange-600'}`}/>
                                  <span className="font-bold">Decompor em micro-metas (Neuroprodutividade)</span>
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        {selectedTask.subtasks.length > 0 && (
                          <button 
                            onClick={() => toggleTask(selectedTask.id)}
                            className={`w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl transition-all active:scale-[0.98] ${isDark ? 'animate-glow-orange' : ''}`}
                          >
                            Finalizar Execução
                          </button>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-24 text-slate-400">
                        <Anchor size={64} strokeWidth={1} className="mb-4 opacity-20"/>
                        <p className="text-sm font-medium opacity-50">Selecione uma tarefa para começar.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Sidebar Daily View */}
                <div className="space-y-6">
                  <div className={`border rounded-[32px] p-6 shadow-xl ${isDark ? 'bg-[#0a1128] border-slate-800' : 'bg-white border-slate-200'}`}>
                    <h3 className={`text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                      <Target size={14}/> Tarefas de {selectedDate === new Date().toISOString().split('T')[0] ? 'Hoje' : selectedDate}
                    </h3>
                    <div className="space-y-2">
                      {dayTasks.filter(t => !t.completed).map(t => (
                        <button 
                          key={t.id} 
                          onClick={() => setSelectedTask(t)}
                          className={`w-full text-left p-4 rounded-2xl flex items-center justify-between border transition-all ${selectedTask?.id === t.id ? (isDark ? 'bg-orange-600/10 border-orange-500 text-white animate-glow-orange' : 'bg-orange-50 border-orange-400 text-orange-700') : (isDark ? 'bg-slate-800/10 border-slate-800 text-slate-400 hover:border-slate-600' : 'bg-slate-50 border-slate-100 text-slate-500 hover:border-slate-200')} ${t.priority === Priority.Q1 && selectedTask?.id !== t.id ? 'animate-pulse-orange' : ''}`}
                        >
                          <span className="text-xs font-bold truncate pr-4">{t.text}</span>
                          <ChevronRight size={14} className="shrink-0 opacity-40"/>
                        </button>
                      ))}
                      {dayTasks.filter(t => !t.completed).length === 0 && (
                        <p className="text-center text-[10px] text-slate-400 py-4 uppercase font-bold italic tracking-tighter">Sem tarefas pendentes.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Energy Forecast */}
                  <div className={`border rounded-[32px] p-6 ${isDark ? 'bg-orange-950/20 border-orange-900/30' : 'bg-orange-50 border-orange-100'}`}>
                    <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Neuro-Insights</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-orange-400 shadow-[0_0_8px_#fb923c]' : 'bg-orange-500'}`}></div>
                        <p className={`text-[10px] font-medium leading-tight ${isDark ? 'text-orange-200/60' : 'text-orange-700/80'}`}>Mantenha o foco em blocos de 90min para respeitar seu ritmo biológico.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PLAN (Eisenhower Matrix) */}
          {activeTab === 'plan' && (
            <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
               <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-black italic">Neuroprodutividade</h2>
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Arraste as tarefas entre os quadrantes para priorizar sua energia.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <MatrixQuadrant 
                  isDark={isDark}
                  priority={Priority.Q1}
                  title="Q1: Faça agora" 
                  desc="Urgente & Importante" 
                  tasks={dayTasks.filter(t => t.priority === Priority.Q1 && !t.completed)} 
                  color="orange"
                  urgent={true}
                  onSelect={setSelectedTask}
                  onTabChange={() => setActiveTab('execute')}
                  onMoveTask={moveTaskPriority}
                />
                <MatrixQuadrant 
                  isDark={isDark}
                  priority={Priority.Q2}
                  title="Q2: Estratégico" 
                  desc="Estratégico" 
                  tasks={dayTasks.filter(t => t.priority === Priority.Q2 && !t.completed)} 
                  color="sky"
                  onSelect={setSelectedTask}
                  onTabChange={() => setActiveTab('execute')}
                  onMoveTask={moveTaskPriority}
                />
                <MatrixQuadrant 
                  isDark={isDark}
                  priority={Priority.Q3}
                  title="Q3: Delegação" 
                  desc="Urgente mas Trivial" 
                  tasks={dayTasks.filter(t => t.priority === Priority.Q3 && !t.completed)} 
                  color="slate"
                  onSelect={setSelectedTask}
                  onTabChange={() => setActiveTab('execute')}
                  onMoveTask={moveTaskPriority}
                />
                <MatrixQuadrant 
                  isDark={isDark}
                  priority={Priority.Q4}
                  title="Q4: Eliminação" 
                  desc="Resíduos Cognitivos" 
                  tasks={dayTasks.filter(t => t.priority === Priority.Q4 && !t.completed)} 
                  color="slate"
                  onSelect={setSelectedTask}
                  onTabChange={() => setActiveTab('execute')}
                  onMoveTask={moveTaskPriority}
                />
              </div>
            </div>
          )}

          {/* TAB: HABITS & RECURRING */}
          {activeTab === 'habits' && (
            <div className="space-y-8 animate-in fade-in duration-500">
              {/* Scoreboard */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`col-span-1 md:col-span-2 border p-8 rounded-[40px] flex items-center justify-between relative overflow-hidden shadow-2xl group transition-all ${isDark ? 'bg-[#0a1128] border-orange-500/30' : 'bg-white border-orange-100'}`}>
                   <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 blur-3xl transition-all ${isDark ? 'bg-orange-500/5 group-hover:bg-orange-500/10' : 'bg-orange-500/10 group-hover:bg-orange-500/20'}`}></div>
                   <div className="space-y-2 relative z-10">
                     <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Status de Neuroplasticidade</p>
                     <h3 className={`text-3xl font-black italic tracking-tighter ${isDark ? 'text-white' : 'text-slate-900'}`}>{neuroLevel.title}</h3>
                     <div className="flex items-center gap-4 mt-4">
                       <div className={`flex-1 h-2 rounded-full overflow-hidden ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                         <div 
                           className={`h-full bg-orange-500 transition-all duration-1000 ${isDark ? 'shadow-[0_0_10px_#f97316]' : ''}`} 
                           style={{ width: `${Math.min(100, (points / neuroLevel.next) * 100)}%` }}
                         ></div>
                       </div>
                       <span className={`text-xs font-mono font-bold ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{points} / {neuroLevel.next === Infinity ? 'MAX' : neuroLevel.next}</span>
                     </div>
                   </div>
                   <div className={`hidden sm:flex flex-col items-center justify-center w-24 h-24 rounded-full border relative z-10 ${isDark ? 'bg-orange-600/10 border-orange-500/20 animate-glow-orange' : 'bg-orange-50 border-orange-100 shadow-lg shadow-orange-100'}`}>
                      <Award className={`${isDark ? 'text-orange-400' : 'text-orange-600'}`} size={40}/>
                   </div>
                </div>

                <div className={`border p-8 rounded-[40px] shadow-2xl flex flex-col items-center justify-center text-center group ${isDark ? 'bg-[#0a1128] border-orange-500/30' : 'bg-white border-orange-100'}`}>
                  <TrendingUp className="text-orange-500 mb-2 group-hover:scale-110 transition-transform" size={24}/>
                  <p className={`text-[10px] font-black uppercase tracking-widest ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Saldo de Dopamina</p>
                  <p className={`text-4xl font-black mt-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>{points}</p>
                  <p className="text-[8px] text-slate-400 uppercase font-bold mt-2">Créditos de Execução</p>
                </div>
              </div>

              <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t ${isDark ? 'border-slate-800/50' : 'border-slate-200'}`}>
                <div>
                  <h2 className="text-3xl font-black italic">Rotinas Fixas</h2>
                  <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm`}>Automatize o essencial para liberar sua CPU mental.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setShowRecurringForm(!showRecurringForm)}
                    className={`px-6 py-3 border rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg active:scale-95 ${isDark ? 'bg-[#0a1128] border-orange-500/30 text-orange-400 hover:bg-orange-500/10' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                  >
                    <Repeat size={18}/> Tarefa Fixa
                  </button>
                  <button 
                    onClick={() => setShowHabitForm(!showHabitForm)}
                    className={`px-6 py-3 bg-orange-600 text-white rounded-2xl font-bold flex items-center gap-2 hover:bg-orange-500 transition-all shadow-lg active:scale-95 ${isDark ? 'animate-glow-orange' : ''}`}
                  >
                    <Flame size={18}/> Hábito Atômico
                  </button>
                </div>
              </div>

              {/* Recurring Form */}
              {showRecurringForm && (
                <div className={`border p-8 rounded-[32px] shadow-2xl animate-in slide-in-from-top duration-300 ${isDark ? 'bg-[#0a1128] border-orange-500/30' : 'bg-white border-orange-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Tarefa Fixa</label>
                      <input 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        placeholder="Ex: Revisão Semanal"
                        value={newRecurring.text}
                        onChange={e => setNewRecurring(prev => ({ ...prev, text: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Frequência</label>
                      <select 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all appearance-none ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        value={newRecurring.frequency}
                        onChange={e => setNewRecurring(prev => ({ ...prev, frequency: e.target.value as Frequency }))}
                      >
                        {Object.values(Frequency).map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Prioridade</label>
                      <select 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all appearance-none ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        value={newRecurring.priority}
                        onChange={e => setNewRecurring(prev => ({ ...prev, priority: e.target.value as Priority }))}
                      >
                         <option value={Priority.Q1}>Faça Agora (Q1)</option>
                         <option value={Priority.Q2}>Estratégico (Q2)</option>
                         <option value={Priority.Q3}>Delegação (Q3)</option>
                      </select>
                    </div>
                  </div>
                  <button 
                    onClick={addRecurringTask}
                    className={`mt-8 w-full py-4 border rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl active:scale-95 ${isDark ? 'bg-orange-600/20 border-orange-500/40 text-orange-400 hover:bg-orange-600 hover:text-white' : 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-600 hover:text-white'}`}
                  >
                    Fixar no Fluxo
                  </button>
                </div>
              )}

              {/* Habits Form */}
              {showHabitForm && (
                <div className={`border p-8 rounded-[32px] shadow-2xl animate-in slide-in-from-top duration-300 ${isDark ? 'bg-[#0a1128] border-orange-500/30' : 'bg-white border-orange-200'}`}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Hábito (O Quê)</label>
                      <input 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        placeholder="Ex: Meditação"
                        value={newHabit.text}
                        onChange={e => setNewHabit(prev => ({ ...prev, text: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Âncora (Quando)</label>
                      <input 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all italic ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        placeholder="Depois de tomar café..."
                        value={newHabit.anchor}
                        onChange={e => setNewHabit(prev => ({ ...prev, anchor: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase px-2">Micro-Ação</label>
                      <input 
                        className={`w-full border rounded-2xl p-4 text-sm focus:border-orange-500 outline-none transition-all ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        placeholder="Vou apenas respirar 3x..."
                        value={newHabit.tinyAction}
                        onChange={e => setNewHabit(prev => ({ ...prev, tinyAction: e.target.value }))}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={addHabitAction}
                    className={`mt-8 w-full py-4 bg-orange-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-orange-500 transition-all shadow-xl active:scale-95 ${isDark ? 'animate-glow-orange' : ''}`}
                  >
                    Implementar Neuroplasticidade
                  </button>
                </div>
              )}

              {/* Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Fixed Tasks Column */}
                <div className="space-y-6">
                   <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                     <Repeat size={14}/> Tarefas Fixas
                   </h3>
                   <div className="space-y-4">
                    {recurringTasks.map(rt => (
                      <div key={rt.id} className={`border p-6 rounded-[28px] group transition-all ${isDark ? 'bg-[#0a1128] border-slate-800 hover:border-orange-500/40' : 'bg-white border-slate-200 hover:border-orange-300 shadow-sm'}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className={`text-lg font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{rt.text}</h4>
                            <div className="flex gap-2 mt-2">
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isDark ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{rt.frequency}</span>
                              <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${isDark ? 'bg-orange-500/10 text-orange-400' : 'bg-orange-50 text-orange-600'}`}>{rt.priority}</span>
                            </div>
                          </div>
                          <button onClick={() => setRecurringTasks(prev => prev.filter(item => item.id !== rt.id))} className="text-slate-400 hover:text-orange-500 transition-colors"><X size={16}/></button>
                        </div>
                        <button 
                          onClick={() => {
                            const today = new Date().toISOString().split('T')[0];
                            if (!rt.completedDates.includes(today)) {
                              setRecurringTasks(prev => prev.map(item => item.id === rt.id ? { ...item, completedDates: [...item.completedDates, today] } : item));
                              setPoints(prev => prev + 20);
                            }
                          }}
                          className={`mt-4 w-full py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${rt.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-600' : 'border-slate-200 text-slate-400 hover:bg-slate-50'}`}
                        >
                          {rt.completedDates.includes(new Date().toISOString().split('T')[0]) ? 'Check-in Realizado (+20 XP)' : 'Marcar Check-in Hoje'}
                        </button>
                      </div>
                    ))}
                    {recurringTasks.length === 0 && <p className="text-slate-400 text-xs italic p-4 text-center">Nenhuma tarefa fixa registrada.</p>}
                   </div>
                </div>

                {/* Habits Column */}
                <div className="space-y-6">
                   <h3 className={`text-xs font-black uppercase tracking-widest flex items-center gap-2 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                     <Flame size={14}/> Hábitos Atômicos
                   </h3>
                   <div className="space-y-4">
                    {habits.map(habit => (
                      <div key={habit.id} className={`border p-6 rounded-[28px] group transition-all ${isDark ? 'bg-[#0a1128] border-slate-800 hover:border-orange-500/40' : 'bg-white border-slate-200 hover:border-orange-300 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isDark ? 'bg-[#020617] text-slate-400 group-hover:bg-orange-600 group-hover:text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-orange-600 group-hover:text-white'}`}>
                              <Flame size={20}/>
                            </div>
                            <div>
                              <h4 className={`font-black ${isDark ? 'text-white' : 'text-slate-900'}`}>{habit.text}</h4>
                              <p className={`text-[9px] font-black uppercase ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>Streak: {habit.streak} dias</p>
                            </div>
                          </div>
                          <button onClick={() => setHabits(prev => prev.filter(h => h.id !== habit.id))} className="text-slate-400 hover:text-orange-500 transition-colors"><X size={16}/></button>
                        </div>
                        <div className="space-y-2">
                          <p className={`text-[10px] italic ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>"{habit.anchor}" -> {habit.tinyAction}</p>
                        </div>
                        <button 
                          onClick={() => {
                            setHabits(prev => prev.map(h => h.id === habit.id ? { ...h, streak: h.streak + 1 } : h));
                            setPoints(prev => prev + 25 + (habit.streak * 2));
                          }}
                          className={`mt-4 w-full py-2 border rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDark ? 'border-slate-700 text-slate-500 hover:bg-slate-800 hover:text-white' : 'border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-600'}`}
                        >
                          Repetir Circuito (+{25 + (habit.streak * 2)} XP)
                        </button>
                      </div>
                    ))}
                    {habits.length === 0 && <p className="text-slate-400 text-xs italic p-4 text-center">Nenhum hábito registrado.</p>}
                   </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CAPTURE */}
          {activeTab === 'capture' && (
            <div className="max-w-2xl mx-auto space-y-8 animate-in zoom-in-95 duration-500">
              <div className="text-center">
                <h2 className="text-4xl font-black tracking-tighter">Limpeza Mental</h2>
                <p className={`${isDark ? 'text-slate-500' : 'text-slate-400'} mt-2`}>Remova loops abertos do córtex pré-frontal para {selectedDate}.</p>
              </div>
              <div className={`p-8 rounded-[40px] shadow-2xl border relative ${isDark ? 'bg-[#0a1128] border-slate-800' : 'bg-white border-slate-100'}`}>
                <div className="flex gap-4">
                  <input 
                    autoFocus
                    className={`flex-1 border-none rounded-3xl px-8 py-6 text-xl outline-none focus:ring-2 focus:ring-orange-600 transition-all placeholder:text-slate-400 ${isDark ? 'bg-[#020617] text-white' : 'bg-slate-50 text-slate-900'}`}
                    placeholder="Capture o pensamento..."
                    value={newTaskText}
                    onChange={e => setNewTaskText(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && addTask()}
                  />
                  <button 
                    onClick={addTask}
                    className={`w-20 h-20 bg-orange-600 text-white rounded-3xl flex items-center justify-center shadow-2xl transition-all active:scale-95 hover:scale-105 ${isDark ? 'shadow-orange-900/40 animate-glow-orange' : 'shadow-orange-200'}`}
                  >
                    <Plus size={32} strokeWidth={3}/>
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {dayTasks.filter(t => !t.completed).map(task => (
                  <div key={task.id} className={`p-6 rounded-[32px] border flex items-center justify-between group transition-all hover:translate-x-1 ${isDark ? 'bg-[#0a1128] border-slate-800 hover:border-slate-600' : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'}`}>
                    <span className="text-lg font-medium">{task.text}</span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button 
                        onClick={() => setSelectedTask(task)}
                        className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-slate-800/30 text-slate-400 hover:text-white hover:bg-orange-600/20' : 'bg-slate-50 text-slate-400 hover:text-orange-600 hover:bg-orange-50'}`}><Play size={20}/></button>
                      <button 
                        onClick={() => setTasks(prev => prev.filter(t => t.id !== task.id))}
                        className={`p-3 rounded-2xl transition-all ${isDark ? 'bg-slate-800/30 text-orange-500/60 hover:text-orange-500 hover:bg-orange-600/20' : 'bg-slate-50 text-orange-400 hover:text-orange-600 hover:bg-orange-50'}`}><X size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: PANIC RESCUE */}
      {panicTask && (
        <div className={`fixed inset-0 backdrop-blur-xl z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300 ${isDark ? 'bg-[#020617]/95' : 'bg-slate-900/60'}`}>
          <div className={`w-full max-w-xl border rounded-[48px] overflow-hidden shadow-2xl ${isDark ? 'bg-[#0a1128] border-orange-500/30 animate-pulse-orange' : 'bg-white border-orange-200'}`}>
            <div className="bg-orange-600/10 p-8 border-b border-orange-600/20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <BrainCircuit className="text-orange-600" size={32} />
                <div>
                  <h3 className={`font-black text-xl ${isDark ? 'text-white' : 'text-slate-900'}`}>Resgate Neural</h3>
                  <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Ativando andaime de emergência</p>
                </div>
              </div>
              <button onClick={() => { setPanicTask(null); setPanicSolution(null); }} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <div className="p-10 space-y-8">
              {!panicSolution ? (
                <div className="space-y-6">
                  <div className={`p-6 rounded-3xl border ${isDark ? 'bg-[#020617] border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Tarefa Travada</p>
                    <p className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>{panicTask.text}</p>
                  </div>
                  <div className="space-y-4">
                    <p className={`text-sm font-medium ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>Qual é a maior resistência agora?</p>
                    <textarea 
                      autoFocus
                      className={`w-full border rounded-[32px] p-6 text-sm outline-none resize-none h-32 transition-all focus:ring-2 focus:ring-orange-600 ${isDark ? 'bg-[#020617] border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      placeholder="Ex: É muito longo, tenho medo de errar..."
                      value={obstacleInput}
                      onChange={e => setObstacleInput(e.target.value)}
                    />
                  </div>
                  <button 
                    onClick={handleRescue}
                    disabled={isRescuing || !obstacleInput.trim()}
                    className={`w-full py-5 bg-orange-600 hover:bg-orange-500 text-white rounded-3xl font-black text-sm uppercase tracking-[0.2em] shadow-2xl transition-all disabled:opacity-50 active:scale-95 ${isDark ? 'animate-pulse-orange' : ''}`}
                  >
                    {isRescuing ? "Processando Neuro-Resgate..." : "✨ ANALISAR BARREIRA"}
                  </button>
                </div>
              ) : (
                <div className="space-y-8 animate-in slide-in-from-bottom duration-500">
                  <div className={`p-6 border rounded-[32px] ${isDark ? 'bg-orange-600/5 border-orange-600/20' : 'bg-orange-50 border-orange-100'}`}>
                    <h4 className="text-xs font-black text-orange-600 uppercase mb-2 flex items-center gap-2">
                      <Target size={14}/> Diagnóstico Executivo
                    </h4>
                    <p className={`text-sm leading-relaxed font-medium italic ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>"{panicSolution.diagnosis}"</p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Protocolo de Desbloqueio</h4>
                    {panicSolution.steps.map((step, i) => (
                      <div key={i} className={`flex gap-4 p-5 border rounded-3xl items-start transition-all hover:border-orange-500/30 ${isDark ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                        <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-black shrink-0 mt-0.5 shadow-inner ${isDark ? 'bg-[#020617] border-slate-600 text-white' : 'bg-white border-slate-200 text-orange-600'}`}>
                          {i + 1}
                        </div>
                        <p className={`text-sm font-semibold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className={`pt-6 border-t flex flex-col items-center gap-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                    <p className="text-xs text-slate-400 italic text-center px-4 leading-relaxed">"{panicSolution.encouragement}"</p>
                    <button 
                      onClick={() => { setPanicTask(null); setPanicSolution(null); setSelectedTask(panicTask); }}
                      className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 ${isDark ? 'bg-white text-slate-900 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}
                    >
                      Voltar ao Foco
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- SUBCOMPONENTS ---

const NavButton: React.FC<{ isDark: boolean, icon: React.ReactNode, label: string, active: boolean, onClick: () => void }> = ({ isDark, icon, label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all md:flex-row md:justify-start md:gap-4 md:w-full md:px-6 md:py-4 active:scale-95 ${active ? (isDark ? 'bg-orange-600 text-white shadow-xl shadow-orange-900/20 animate-glow-orange' : 'bg-orange-600 text-white shadow-lg') : (isDark ? 'text-slate-500 hover:text-slate-300 hover:bg-[#0a1128]' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100')}`}
  >
    {icon}
    <span className="text-[9px] mt-1 font-black uppercase md:text-sm md:mt-0 tracking-widest">{label}</span>
  </button>
);

const MatrixQuadrant: React.FC<{ 
  isDark: boolean,
  priority: Priority,
  title: string, 
  desc: string, 
  tasks: Task[], 
  color: 'orange' | 'sky' | 'slate', 
  urgent?: boolean, 
  onSelect: (t: Task) => void, 
  onTabChange: () => void,
  onMoveTask: (taskId: string, newPriority: Priority) => void
}> = ({ isDark, priority, title, desc, tasks, color, urgent, onSelect, onTabChange, onMoveTask }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const darkThemes = {
    orange: 'border-orange-900/40 bg-orange-950/10 text-orange-500',
    sky: 'border-sky-900/40 bg-sky-950/10 text-sky-500',
    slate: 'border-slate-800 bg-slate-900/50 text-slate-500'
  };

  const lightThemes = {
    orange: 'border-orange-100 bg-orange-50/50 text-orange-600',
    sky: 'border-sky-100 bg-sky-50/50 text-sky-600',
    slate: 'border-slate-200 bg-slate-50 text-slate-500'
  };

  const currentTheme = isDark ? darkThemes : lightThemes;

  const activeTheme = isDragOver ? (color === 'orange' ? (isDark ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_20px_rgba(249,115,22,0.3)]' : 'border-orange-400 bg-orange-50 shadow-lg') : (isDark ? 'border-sky-500 bg-sky-500/10 shadow-[0_0_20px_rgba(14,165,233,0.3)]' : 'border-sky-400 bg-sky-50 shadow-lg')) : currentTheme[color];
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onMoveTask(taskId, priority);
    }
  };

  return (
    <div 
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`h-[350px] border rounded-[40px] p-8 flex flex-col transition-all duration-300 hover:scale-[1.01] ${activeTheme} ${urgent && !isDragOver && isDark ? 'animate-pulse-orange' : ''}`}
    >
      <div className="mb-6">
        <h4 className="font-black text-xl tracking-tighter uppercase italic">{title}</h4>
        <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">{desc}</p>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2 pr-2">
        {tasks.map(t => (
          <div 
            key={t.id} 
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', t.id);
              e.dataTransfer.effectAllowed = 'move';
            }}
            className={`group p-4 rounded-2xl flex items-center justify-between border transition-all shadow-lg hover:border-white/20 cursor-grab active:cursor-grabbing ${isDark ? 'bg-[#0a1128]/80 border-slate-800/50' : 'bg-white border-slate-100 hover:border-slate-200'}`}
          >
            <span className={`text-xs font-bold truncate pr-4 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>{t.text}</span>
            <button 
              onClick={() => { onSelect(t); onTabChange(); }}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all active:scale-90 ${isDark ? 'bg-slate-800 text-slate-500 hover:bg-white hover:text-black' : 'bg-slate-100 text-slate-400 hover:bg-orange-600 hover:text-white'}`}
            >
              <Play size={12} fill="currentColor"/>
            </button>
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center opacity-10 space-y-2">
            <Target size={48}/>
            <p className="text-[10px] font-black uppercase tracking-widest">Zona de Drop</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;

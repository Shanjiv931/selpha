import React, { useState, useEffect } from 'react';
import { Task, User } from '../types';
import { backend } from '../services/backend';
import { Calendar as CalendarIcon, Plus, Trash2, Loader2, Clock, AlertTriangle, AlertCircle, Book, GraduationCap, FileText } from 'lucide-react';
import { Button } from './Button';

export const Planner: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDeadline, setNewTaskDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [newTaskType, setNewTaskType] = useState<Task['type']>('Assignment');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const init = async () => {
      const storedUser = localStorage.getItem('vitian_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const data = await backend.data.getTasks(user.regNumber);
        setTasks(data);
      }
      setLoading(false);
    };
    init();
  }, []);

  const addTask = async () => {
    if (!newTaskTitle.trim() || !currentUser) return;
    
    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      deadline: newTaskDeadline,
      completed: false,
      type: newTaskType
    };
    
    // Optimistic update
    setTasks([...tasks, newTask]);
    setNewTaskTitle('');
    setNewTaskType('Assignment');
    setNewTaskDeadline(new Date().toISOString().split('T')[0]);
    
    await backend.data.addTask(currentUser.regNumber, newTask);
  };

  const toggleTask = async (id: string) => {
    if (!currentUser) return;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    await backend.data.toggleTask(currentUser.regNumber, id);
  };

  const deleteTask = async (id: string) => {
    if (!currentUser) return;
    setTasks(tasks.filter(t => t.id !== id));
    await backend.data.deleteTask(currentUser.regNumber, id);
  };

  const getUrgency = (deadline: string, completed: boolean) => {
    if (completed) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(deadline);
    dueDate.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { color: 'text-red-600', bg: 'bg-red-50', border: 'border-l-red-500', label: 'Overdue', icon: AlertCircle };
    if (diffDays === 0) return { color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-l-orange-500', label: 'Due Today', icon: AlertTriangle };
    if (diffDays > 0 && diffDays <= 2) return { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-l-yellow-500', label: 'Due Soon', icon: AlertTriangle };
    return null;
  };

  const getTaskTypeIcon = (type: Task['type']) => {
    switch (type) {
        case 'Exam': return <GraduationCap size={14} />;
        case 'Project': return <Book size={14} />;
        default: return <FileText size={14} />;
    }
  };

  const getTaskTypeStyles = (type: Task['type']) => {
      switch (type) {
          case 'Exam': return 'bg-red-100 text-red-700 border-red-200';
          case 'Project': return 'bg-purple-100 text-purple-700 border-purple-200';
          default: return 'bg-blue-100 text-blue-700 border-blue-200';
      }
  };

  if (loading) {
     return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  // Sort tasks: Incomplete first, then by deadline
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
      return a.deadline.localeCompare(b.deadline);
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Study Planner</h2>
        <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
          <CalendarIcon size={20} />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-500 mb-3">Add New Task</h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Task Title</label>
            <input 
              type="text" 
              placeholder="E.g., Practice Math Problems"
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-400"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 items-end">
            <div className="w-1/3">
                 <label className="block text-xs font-medium text-gray-700 mb-1">Type</label>
                 <select
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={newTaskType}
                    onChange={(e) => setNewTaskType(e.target.value as Task['type'])}
                 >
                     <option value="Assignment">Assignment</option>
                     <option value="Project">Project</option>
                     <option value="Exam">Exam</option>
                 </select>
            </div>
            <div className="flex-1">
               <label className="block text-xs font-medium text-gray-700 mb-1">Due Date</label>
               <input 
                type="date"
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={newTaskDeadline}
                onChange={(e) => setNewTaskDeadline(e.target.value)}
              />
            </div>
            <Button onClick={addTask} className="h-[46px] w-[46px] flex items-center justify-center flex-shrink-0 !p-0">
              <Plus size={24} />
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sortedTasks.length > 0 ? sortedTasks.map(task => {
          const urgency = getUrgency(task.deadline, task.completed);
          
          return (
            <div 
              key={task.id} 
              className={`bg-white p-4 rounded-xl shadow-sm flex items-center justify-between transition-all 
                ${task.completed ? 'opacity-60 border border-gray-100' : ''} 
                ${urgency ? `border-l-4 ${urgency.border} border-t border-r border-b border-gray-100` : 'border border-gray-100'}
                ${task.type === 'Exam' && !task.completed ? 'ring-1 ring-red-200 bg-red-50/30' : ''}
              `}
            >
              <div className="flex items-center gap-3 overflow-hidden flex-1">
                <input 
                  type="checkbox" 
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0 cursor-pointer"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center flex-wrap gap-2">
                    <p className={`font-medium text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </p>
                    {/* Task Type Badge */}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border ${getTaskTypeStyles(task.type)}`}>
                        {getTaskTypeIcon(task.type)}
                        {task.type}
                    </span>

                    {urgency && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium flex items-center gap-1 ${urgency.bg} ${urgency.color}`}>
                        <urgency.icon size={10} />
                        {urgency.label}
                      </span>
                    )}
                  </div>
                  <div className={`flex items-center gap-1 text-xs mt-0.5 ${urgency ? urgency.color : 'text-gray-400'}`}>
                    <Clock size={12} />
                    <span>Due: {task.deadline}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => deleteTask(task.id)} className="text-gray-300 hover:text-red-500 p-2 flex-shrink-0 transition-colors">
                <Trash2 size={18} />
              </button>
            </div>
          );
        }) : (
          <div className="text-center py-10 text-gray-400">
            <p>No tasks yet. Enjoy your free time!</p>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { ClassSession, User } from '../types';
import { backend } from '../services/backend';
import { Clock, Loader2, Beaker, BookText, MapPin, LayoutGrid, List } from 'lucide-react';
import { THEORY_SLOT_TIMES } from '../services/timetableUtils';

export const Timetable: React.FC = () => {
  const [schedule, setSchedule] = useState<Record<string, ClassSession[]>>({});
  const [loading, setLoading] = useState(true);
  const [timetableType, setTimetableType] = useState<'Theory' | 'Lab'>('Theory');
  const [viewMode, setViewMode] = useState<'Grid' | 'List'>('Grid');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    const storedUser = localStorage.getItem('vitian_user');
    if (storedUser) {
      const user = JSON.parse(storedUser) as User;
      setCurrentUser(user);
      const data = await backend.data.getTimetable(user.regNumber);
      setSchedule(data);
    }
    setLoading(false);
  };

  const getSessionAtTime = (day: string, time: string, type: 'Theory' | 'Lab') => {
    return schedule[day]?.find(s => s.startTime === time && s.type === type);
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  const renderTheoryGrid = () => (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-x-auto no-scrollbar pb-10">
      <div className="min-w-[1200px]">
        <div className="grid grid-cols-[140px_repeat(5,1fr)] bg-blue-600 text-white rounded-t-[2.5rem] font-bold text-sm sticky top-0 z-10 shadow-lg">
          <div className="p-6 border-r border-blue-500 flex items-center justify-center text-[11px] uppercase tracking-widest font-black">Time Slot</div>
          {days.map(d => <div key={d} className="p-6 text-center border-l border-blue-500 uppercase tracking-widest font-black">{d}</div>)}
        </div>

        <div className="divide-y divide-gray-100">
          <div className="bg-blue-50/40 py-3 px-8 text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Morning Sessions (8:00 AM - 12:50 PM)
          </div>
          {THEORY_SLOT_TIMES.slice(0, 5).map((time, idx) => (
            <React.Fragment key={idx}>
              <div className="grid grid-cols-[140px_repeat(5,1fr)] group">
                <div className="p-5 flex flex-col items-center justify-center text-[12px] font-black text-black border-r border-gray-100 bg-gray-50/40">
                  <span className="text-blue-700">{time.start}</span>
                  <span className="h-4 w-px bg-blue-200 my-1"></span>
                  <span className="text-gray-400 font-bold text-[10px]">{time.end}</span>
                </div>
                {days.map(day => {
                  const session = getSessionAtTime(day, time.start, 'Theory');
                  return (
                    <div key={day} className="p-3 min-h-[120px] border-l border-gray-100 relative group/cell hover:bg-blue-50/10 transition-colors">
                      {session && (
                        <div className="bg-white border-2 border-blue-500 p-4 h-full rounded-2xl shadow-sm transition-all group-hover/cell:shadow-md group-hover/cell:scale-[1.02] flex flex-col justify-between border-opacity-80">
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-black text-white bg-blue-600 px-2.5 py-1 rounded-lg uppercase shadow-sm">{session.courseCode}</span>
                            </div>
                            <div className="text-[11px] font-black text-gray-800 line-clamp-2 leading-tight mb-2">{session.courseName}</div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-800 italic">
                              <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{session.slot}</span>
                              <div className="flex items-center gap-1 text-gray-400 not-italic ml-auto">
                                <MapPin size={10} className="text-blue-500" />
                                <span className="truncate max-w-[80px]">{session.venue || 'TBD'}</span>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 truncate opacity-70">
                              {session.faculty}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}

          <div className="bg-gray-100/80 py-6 px-6 text-[12px] font-black text-gray-900 text-center uppercase tracking-[0.8em] border-y-2 border-gray-200 backdrop-blur-sm">
            --- THEORY LUNCH BREAK: 12:50 PM - 02:00 PM ---
          </div>

          <div className="bg-blue-50/40 py-3 px-8 text-[11px] font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
            <Clock size={12} /> Afternoon Sessions (02:00 PM - 06:50 PM)
          </div>
          {THEORY_SLOT_TIMES.slice(5).map((time, idx) => (
            <React.Fragment key={idx}>
              <div className="grid grid-cols-[140px_repeat(5,1fr)] group">
                <div className="p-5 flex flex-col items-center justify-center text-[12px] font-black text-black border-r border-gray-100 bg-gray-50/40">
                  <span className="text-blue-700">{time.start}</span>
                  <span className="h-4 w-px bg-blue-200 my-1"></span>
                  <span className="text-gray-400 font-bold text-[10px]">{time.end}</span>
                </div>
                {days.map(day => {
                  const session = getSessionAtTime(day, time.start, 'Theory');
                  return (
                    <div key={day} className="p-3 min-h-[120px] border-l border-gray-100 relative group/cell hover:bg-blue-50/10 transition-colors">
                      {session && (
                        <div className="bg-white border-2 border-blue-500 p-4 h-full rounded-2xl shadow-sm transition-all group-hover/cell:shadow-md group-hover/cell:scale-[1.02] flex flex-col justify-between border-opacity-80">
                          <div>
                            <div className="flex justify-between items-start mb-1.5">
                              <span className="text-[10px] font-black text-white bg-blue-600 px-2.5 py-1 rounded-lg uppercase shadow-sm">{session.courseCode}</span>
                            </div>
                            <div className="text-[11px] font-black text-gray-800 line-clamp-2 leading-tight mb-2">{session.courseName}</div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-800 italic">
                               <span className="bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{session.slot}</span>
                               <div className="flex items-center gap-1 text-gray-400 not-italic ml-auto">
                                <MapPin size={10} className="text-blue-500" />
                                <span className="truncate max-w-[80px]">{session.venue || 'TBD'}</span>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 truncate opacity-70">
                              {session.faculty}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLabGrid = () => {
    const morningBlocks = [
      { start: "08:00", end: "09:40", label: "Block 1" },
      { start: "09:50", end: "11:30", label: "Block 2" },
      { start: "11:40", end: "13:20", label: "Block 3" },
    ];
    const afternoonBlocks = [
      { start: "14:00", end: "15:40", label: "Block 4" },
      { start: "15:50", end: "17:30", label: "Block 5" },
      { start: "17:40", end: "19:20", label: "Block 6" },
    ];

    return (
      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-x-auto no-scrollbar pb-10">
        <div className="min-w-[1200px]">
          <div className="grid grid-cols-[140px_repeat(5,1fr)] bg-purple-700 text-white rounded-t-[2.5rem] font-bold text-sm sticky top-0 z-10 shadow-lg">
            <div className="p-6 border-r border-purple-600 flex items-center justify-center text-[11px] uppercase tracking-widest font-black">Lab Block</div>
            {days.map(d => <div key={d} className="p-6 text-center border-l border-purple-600 uppercase tracking-widest font-black">{d}</div>)}
          </div>

          <div className="divide-y divide-gray-100">
            <div className="bg-purple-50/40 py-3 px-8 text-[11px] font-black text-purple-600 uppercase tracking-widest flex items-center gap-2">
              <Clock size={12} /> Morning Lab Blocks (8:00 AM - 1:20 PM)
            </div>
            {morningBlocks.map((block, idx) => (
              <div key={idx} className="grid grid-cols-[140px_repeat(5,1fr)] group">
                <div className="p-6 flex flex-col items-center justify-center text-[12px] font-black text-black border-r border-gray-100 bg-gray-50/40">
                  <span className="text-purple-700 font-black">{block.start}</span>
                  <span className="h-5 w-px bg-purple-200 my-1"></span>
                  <span className="text-gray-400 font-bold text-[10px]">{block.end}</span>
                  <span className="mt-2 text-[8px] text-purple-400 font-black uppercase tracking-tighter">{block.label}</span>
                </div>
                {days.map(day => {
                  const session = getSessionAtTime(day, block.start, 'Lab');
                  return (
                    <div key={day} className="p-3 min-h-[140px] border-l border-gray-100 relative group/cell hover:bg-purple-50/10 transition-colors">
                      {session && (
                        <div className="bg-white border-2 border-purple-600 p-4 h-full rounded-2xl shadow-sm transition-all group-hover/cell:shadow-md group-hover/cell:scale-[1.02] flex flex-col justify-between border-opacity-80">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-white bg-purple-700 px-2.5 py-1 rounded-lg uppercase shadow-sm">{session.courseCode}</span>
                            </div>
                            <div className="text-[11px] font-black text-gray-800 line-clamp-2 leading-snug mb-2">{session.courseName}</div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-800 italic">
                               <span className="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{session.slot}</span>
                               <div className="flex items-center gap-1 text-gray-400 not-italic ml-auto">
                                <MapPin size={10} className="text-purple-600" />
                                <span className="truncate max-w-[80px]">{session.venue || 'TBD'}</span>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 truncate opacity-70">
                              {session.faculty}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
            <div className="bg-gray-100/80 py-6 px-6 text-[12px] font-black text-gray-900 text-center uppercase tracking-[0.8em] border-y-2 border-gray-200 backdrop-blur-sm">
              --- LAB LUNCH BREAK ---
            </div>
            {afternoonBlocks.map((block, idx) => (
              <div key={idx} className="grid grid-cols-[140px_repeat(5,1fr)] group">
                <div className="p-6 flex flex-col items-center justify-center text-[12px] font-black text-black border-r border-gray-100 bg-gray-50/40">
                  <span className="text-purple-700 font-black">{block.start}</span>
                  <span className="h-5 w-px bg-purple-200 my-1"></span>
                  <span className="text-gray-400 font-bold text-[10px]">{block.end}</span>
                  <span className="mt-2 text-[8px] text-purple-400 font-black uppercase tracking-tighter">{block.label}</span>
                </div>
                {days.map(day => {
                  const session = getSessionAtTime(day, block.start, 'Lab');
                  return (
                    <div key={day} className="p-3 min-h-[140px] border-l border-gray-100 relative group/cell hover:bg-purple-50/10 transition-colors">
                      {session && (
                        <div className="bg-white border-2 border-purple-600 p-4 h-full rounded-2xl shadow-sm transition-all group-hover/cell:shadow-md group-hover/cell:scale-[1.02] flex flex-col justify-between border-opacity-80">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className="text-[10px] font-black text-white bg-purple-700 px-2.5 py-1 rounded-lg uppercase shadow-sm">{session.courseCode}</span>
                            </div>
                            <div className="text-[11px] font-black text-gray-800 line-clamp-2 leading-snug mb-2">{session.courseName}</div>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-purple-800 italic">
                               <span className="bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{session.slot}</span>
                               <div className="flex items-center gap-1 text-gray-400 not-italic ml-auto">
                                <MapPin size={10} className="text-purple-600" />
                                <span className="truncate max-w-[80px]">{session.venue || 'TBD'}</span>
                              </div>
                            </div>
                            <div className="text-[9px] font-bold text-gray-400 truncate opacity-70">
                              {session.faculty}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {days.map(day => {
        const daySessions = schedule[day]?.filter(s => s.type === timetableType).sort((a, b) => a.startTime.localeCompare(b.startTime)) || [];
        return (
          <div key={day} className="space-y-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest px-4 py-1 bg-white border-2 border-gray-100 rounded-xl shadow-sm">{day}</h3>
              <div className="h-px flex-1 bg-gray-100"></div>
            </div>
            
            {daySessions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {daySessions.map(session => (
                  <div key={session.id} className={`p-6 bg-white rounded-[2rem] border-2 shadow-sm transition-all hover:shadow-md ${timetableType === 'Theory' ? 'border-blue-50' : 'border-purple-50'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className={timetableType === 'Theory' ? 'text-blue-500' : 'text-purple-500'} />
                        <span className="text-sm font-black text-gray-800">{session.startTime} - {session.endTime}</span>
                      </div>
                      <span className={`text-[10px] font-black text-white px-3 py-1 rounded-full uppercase ${timetableType === 'Theory' ? 'bg-blue-600' : 'bg-purple-700'}`}>
                        {session.courseCode}
                      </span>
                    </div>
                    
                    <h4 className="text-lg font-black text-gray-900 leading-tight mb-3">{session.courseName}</h4>
                    
                    <div className="space-y-2 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <MapPin size={14} className="text-gray-400" />
                        <span>{session.venue || 'TBD'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                        <span className={`w-2 h-2 rounded-full ${timetableType === 'Theory' ? 'bg-blue-200' : 'bg-purple-200'}`}></span>
                        <span>{session.faculty}</span>
                        <span className="text-gray-300 ml-auto bg-gray-50 px-2 py-0.5 rounded uppercase">{session.slot}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 px-6 bg-gray-50/50 rounded-[2rem] border-2 border-dashed border-gray-100 text-center">
                <p className="text-sm font-bold text-gray-400">No {timetableType.toLowerCase()} sessions scheduled</p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="p-4 space-y-6 h-full pb-32">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-black tracking-tight">Academic Timetable</h2>
          <p className="text-sm text-gray-500 font-bold mt-1">Reviewing your <span className={timetableType === 'Theory' ? 'text-blue-600' : 'text-purple-600'}>{timetableType.toLowerCase()} schedule</span></p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <div className="bg-white p-1.5 rounded-[1.5rem] border-2 border-gray-100 shadow-sm flex gap-1">
            <button 
              onClick={() => setViewMode('Grid')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'Grid' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
            >
              <LayoutGrid size={16} /> Grid
            </button>
            <button 
              onClick={() => setViewMode('List')} 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black transition-all ${viewMode === 'List' ? 'bg-black text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
            >
              <List size={16} /> List
            </button>
          </div>

          <div className="bg-white p-1.5 rounded-[1.5rem] border-2 border-gray-100 shadow-sm flex gap-1">
            <button 
              onClick={() => setTimetableType('Theory')} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${timetableType === 'Theory' ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
            >
              <BookText size={16} /> Theory
            </button>
            <button 
              onClick={() => setTimetableType('Lab')} 
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black transition-all ${timetableType === 'Lab' ? 'bg-purple-700 text-white shadow-lg' : 'text-gray-400 hover:text-black'}`}
            >
              <Beaker size={16} /> Lab
            </button>
          </div>
        </div>
      </div>

      <div className="relative overflow-visible">
        {viewMode === 'Grid' ? (
          timetableType === 'Theory' ? renderTheoryGrid() : renderLabGrid()
        ) : (
          renderListView()
        )}
      </div>

      <div className="bg-gray-900 text-white p-8 rounded-[3rem] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 border-4 border-white">
        <div className="flex items-center gap-6">
           <div className={`p-5 rounded-[1.5rem] shadow-inner ${timetableType === 'Theory' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
              <Clock size={32} />
           </div>
           <div>
              <p className="text-[11px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">Weekly Commitment</p>
              <h4 className="font-black text-2xl">Total {timetableType} Hours</h4>
           </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="text-6xl font-black italic tracking-tighter text-white">
            {Object.values(schedule).reduce((acc: number, day: ClassSession[]) => acc + day.filter(s => s.type === timetableType).length, 0)}
            <span className="text-lg ml-2 font-bold not-italic opacity-40 uppercase">Sessions</span>
          </div>
          <p className="text-[10px] text-gray-500 font-bold uppercase mt-2">Calculated from enrolled slots</p>
        </div>
      </div>
    </div>
  );
};

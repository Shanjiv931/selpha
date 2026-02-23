
import React, { useState, useEffect } from 'react';
import { Course, User } from '../types';
import { backend } from '../services/backend';
import { Plus, Trash2, Loader2, X, Beaker, BookText, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';
import { Button } from './Button';
import { getFilteredSlots, checkTimetableClash } from '../services/timetableUtils';

interface CourseManagerProps {
  user: User;
}

export const CourseManager: React.FC<CourseManagerProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [clashError, setClashError] = useState<string | null>(null);

  const [newCourseName, setNewCourseName] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseFaculty, setNewCourseFaculty] = useState('');
  const [newCourseVenue, setNewCourseVenue] = useState('');
  const [newCourseCredits, setNewCourseCredits] = useState(3);
  const [newCourseSlot, setNewCourseSlot] = useState('');
  const [newCourseType, setNewCourseType] = useState<'Theory' | 'Lab'>('Theory');

  useEffect(() => {
    fetchCourses();
  }, [user.regNumber]);

  // Real-time clash detection when slot selection changes
  useEffect(() => {
    if (newCourseSlot) {
      const conflict = checkTimetableClash(newCourseSlot, courses);
      if (conflict) {
        setClashError(`Schedule Conflict: This slot overlaps with "${conflict}"`);
      } else {
        setClashError(null);
      }
    } else {
      setClashError(null);
    }
  }, [newCourseSlot, courses]);

  // Reset modal state on course type change
  useEffect(() => {
    if (newCourseType === 'Lab') {
      setNewCourseCredits(1);
    } else if (newCourseCredits === 1) {
      setNewCourseCredits(3);
    }
    setNewCourseSlot('');
    setClashError(null);
  }, [newCourseType]);

  const fetchCourses = async () => {
    try {
      const data = await backend.data.getCourses(user.regNumber);
      setCourses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseName.trim() || !newCourseSlot || clashError) return;

    setLoading(true);
    try {
      await backend.data.addCourse(user.regNumber, {
        code: newCourseCode.toUpperCase() || 'COURSE',
        name: newCourseName,
        attendedClasses: 0,
        totalClasses: 0,
        faculty: newCourseFaculty,
        venue: newCourseVenue || 'TBD',
        credits: Number(newCourseCredits),
        slot: newCourseSlot,
        type: newCourseType
      });
      
      setNewCourseName(''); 
      setNewCourseCode(''); 
      setNewCourseFaculty(''); 
      setNewCourseVenue('');
      setNewCourseSlot('');
      setShowAddModal(false);
      await fetchCourses();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Remove this course and clear its slots from the timetable?")) return;
    
    // Optimistic Update: Immediately remove from UI
    const previousCourses = [...courses];
    setCourses(courses.filter(c => c.id !== id));
    
    try {
      await backend.data.deleteCourse(user.regNumber, id);
      // Success - no need to do anything as UI is already updated
    } catch (err) {
      console.error("Failed to delete course", err);
      alert("Failed to delete course. Please check your connection and try again.");
      setCourses(previousCourses); // Revert UI if failed
    }
  };

  const availableSlots = getFilteredSlots(newCourseType, newCourseCredits);

  if (loading && courses.length === 0) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex items-center justify-between">
        <div>
           <h2 className="text-2xl font-black text-black tracking-tight">Enrolled Courses</h2>
           <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-0.5">Selpha Student Portal v1.2</p>
        </div>
        <Button onClick={() => { setShowAddModal(true); setClashError(null); }} className="!p-3 shadow-xl rounded-2xl active:scale-95 transition-transform"><Plus size={24} /></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map(course => (
          <div key={course.id} className={`bg-white p-6 rounded-[2rem] shadow-sm border-2 flex justify-between items-center transition-all hover:shadow-md ${course.type === 'Lab' ? 'border-purple-100' : 'border-blue-100'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${course.type === 'Lab' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                {course.type === 'Lab' ? <Beaker size={28} /> : <BookText size={28} />}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] font-black text-black uppercase tracking-widest">{course.code}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-black uppercase ${course.type === 'Lab' ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {course.slot}
                  </span>
                </div>
                <h3 className="font-black text-black text-xl leading-tight truncate">{course.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <p className="text-xs text-gray-600 font-bold">{course.faculty || 'Unassigned Faculty'}</p>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                    <MapPin size={10} /> {course.venue || 'TBD'}
                  </div>
                </div>
              </div>
            </div>
            <button 
              onClick={() => handleDeleteCourse(course.id)} 
              className="p-3 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all flex-shrink-0"
              title="Remove Course"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white rounded-[3rem] border-4 border-dashed border-gray-100 p-10">
             <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
               <BookText className="text-gray-200" size={40} />
             </div>
             <h3 className="text-xl font-black text-gray-800 mb-2">Empty Curriculum</h3>
             <p className="text-gray-400 font-bold max-w-xs mx-auto">Click the "+" button to add your courses and generate your smart academic timetable.</p>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-[2rem] p-6 sm:p-10 w-full max-w-xl relative shadow-2xl animate-in zoom-in duration-300 my-8 mx-4">
            <button onClick={() => setShowAddModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-black transition-colors"><X size={24} /></button>
            
            <div className="mb-6 sm:mb-8">
              <h3 className="text-2xl sm:text-3xl font-black text-black">Add Course</h3>
              <p className="text-sm text-gray-500 font-bold mt-1">Register course to your Selpha student profile</p>
            </div>

            <form onSubmit={handleAddCourse} className="space-y-6">
              <div className="bg-gray-100 p-2 rounded-[1.5rem] flex gap-2">
                 <button type="button" onClick={() => setNewCourseType('Theory')} className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all ${newCourseType === 'Theory' ? 'bg-blue-600 text-white shadow-xl scale-[1.02]' : 'text-gray-500 hover:text-black'}`}>Theory Course</button>
                 <button type="button" onClick={() => setNewCourseType('Lab')} className={`flex-1 py-4 rounded-2xl text-sm font-black transition-all ${newCourseType === 'Lab' ? 'bg-purple-600 text-white shadow-xl scale-[1.02]' : 'text-gray-500 hover:text-black'}`}>Lab Session</button>
              </div>

              <div className="grid gap-5">
                <div>
                   <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Full Course Name</label>
                   <input required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-black font-bold outline-none focus:border-blue-500 transition-all placeholder:text-gray-300" placeholder="e.g. Distributed Computing" value={newCourseName} onChange={e => setNewCourseName(e.target.value)} />
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Code</label>
                    <input required className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-black font-mono font-black uppercase outline-none focus:border-blue-500 transition-all" placeholder="CSE4001" value={newCourseCode} onChange={e => setNewCourseCode(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Credits</label>
                    <select disabled={newCourseType === 'Lab'} className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-black font-black outline-none focus:border-blue-500 transition-all disabled:opacity-50" value={newCourseCredits} onChange={e => setNewCourseCredits(Number(e.target.value))}>
                      {newCourseType === 'Lab' ? <option value="1">1 Credit</option> : [2,3,4].map(c => <option key={c} value={c}>{c} Credits</option>)}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Faculty</label>
                    <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-black font-bold outline-none focus:border-blue-500 transition-all" placeholder="Dr. Ramesh Kumar" value={newCourseFaculty} onChange={e => setNewCourseFaculty(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Venue (Location)</label>
                    <input className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-sm text-black font-bold outline-none focus:border-blue-500 transition-all" placeholder="e.g. SJT 112" value={newCourseVenue} onChange={e => setNewCourseVenue(e.target.value)} />
                  </div>
                </div>

                <div>
                   <label className="block text-[11px] font-black text-gray-900 uppercase tracking-widest mb-2 ml-2">Assigned Slot</label>
                   <div className="relative">
                      <select required className={`w-full px-6 py-4 bg-gray-50 border-2 rounded-2xl text-sm text-black font-black outline-none transition-all appearance-none ${clashError ? 'border-red-500 bg-red-50' : 'border-gray-100 focus:border-blue-500'}`} value={newCourseSlot} onChange={e => setNewCourseSlot(e.target.value)}>
                        <option value="">-- Choose Timetable Slot --</option>
                        {availableSlots.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-gray-400">
                        {clashError ? <AlertCircle className="text-red-500" size={20} /> : newCourseSlot && <CheckCircle2 className="text-green-500" size={20} />}
                      </div>
                   </div>
                   {clashError && (
                     <p className="mt-2 text-[11px] text-red-600 font-black flex items-center gap-1.5 animate-in slide-in-from-top-1">
                       <AlertCircle size={14} /> {clashError}
                     </p>
                   )}
                </div>
              </div>

              <Button type="submit" fullWidth disabled={!!clashError || !newCourseSlot || loading} className={`py-5 mt-4 font-black text-lg shadow-2xl transition-all active:scale-95 ${clashError ? 'bg-gray-300 shadow-none' : 'shadow-blue-500/30'}`}>
                {loading ? <Loader2 className="animate-spin mx-auto" /> : 'Confirm Course Registration'}
              </Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

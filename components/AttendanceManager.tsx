
import React, { useState, useEffect } from 'react';
import { Course, User } from '../types';
import { backend } from '../services/backend';
import { Loader2, AlertTriangle, CheckCircle, PieChart, Beaker, BookText } from 'lucide-react';

interface AttendanceTrackerProps {
  user: User;
}

export const AttendanceManager: React.FC<AttendanceTrackerProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [user.regNumber]);

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

  const markPresent = async (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    const newAttended = course.attendedClasses + 1;
    const newTotal = course.totalClasses + 1;
    await updateCourseState(id, newAttended, newTotal);
  };

  const markAbsent = async (id: string) => {
    const course = courses.find(c => c.id === id);
    if (!course) return;
    const newTotal = course.totalClasses + 1;
    await updateCourseState(id, course.attendedClasses, newTotal);
  };

  const updateCourseState = async (id: string, att: number, tot: number) => {
    setCourses(prev => prev.map(c => {
      if (c.id === id) {
        const pct = tot > 0 ? Math.round((att / tot) * 100) : 0;
        return { ...c, attendedClasses: att, totalClasses: tot, attendance: pct };
      }
      return c;
    }));
    await backend.data.updateCourse(user.regNumber, id, { attendedClasses: att, totalClasses: tot });
  };

  if (loading) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;

  return (
    <div className="p-4 space-y-6 pb-24">
      <div className="flex flex-col">
        <h2 className="text-2xl font-black text-black">Attendance Tracker</h2>
        <p className="text-sm text-gray-500 font-medium">Log your daily attendance status</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {courses.map(course => (
          <div key={course.id} className={`bg-white rounded-3xl shadow-sm border-2 overflow-hidden transition-all hover:shadow-md ${course.type === 'Lab' ? 'border-purple-50' : 'border-blue-50'}`}>
            <div className="p-5 flex justify-between items-center border-b border-gray-50">
               <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${course.type === 'Lab' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                     {course.type === 'Lab' ? <Beaker size={20} /> : <BookText size={20} />}
                  </div>
                  <div>
                    <h3 className="font-black text-black text-lg leading-tight">{course.name}</h3>
                    <div className="flex gap-2 text-[10px] uppercase font-black text-gray-500 mt-0.5">
                       <span>{course.code}</span>
                       <span className={course.type === 'Lab' ? 'text-purple-600' : 'text-blue-600'}>{course.slot}</span>
                    </div>
                  </div>
               </div>
               <div className="text-right">
                  <div className={`text-2xl font-black ${course.attendance >= 75 || user.cgpa >= 9 ? 'text-green-600' : 'text-red-600'}`}>
                    {course.attendance}%
                  </div>
                  <div className="text-[11px] text-gray-900 font-black uppercase tracking-tighter">
                    {course.attendedClasses} of {course.totalClasses}
                  </div>
               </div>
            </div>
            <div className="p-4 flex gap-3 bg-gray-50/50">
               <button onClick={() => markPresent(course.id)} className="flex-1 bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                 <CheckCircle size={16}/> Present
               </button>
               <button onClick={() => markAbsent(course.id)} className="flex-1 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 py-4 rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-sm transition-all active:scale-95">
                 <AlertTriangle size={16}/> Absent
               </button>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full text-center py-24 bg-white rounded-[2rem] border-2 border-dashed border-gray-100 p-8">
            <PieChart className="mx-auto text-gray-100 mb-4" size={72} />
            <h3 className="text-gray-800 font-black text-xl mb-2">Empty Classroom!</h3>
            <p className="text-gray-400 font-bold max-w-xs mx-auto">Please add your enrolled courses in the "Courses" tab to start tracking your attendance.</p>
          </div>
        )}
      </div>
    </div>
  );
};

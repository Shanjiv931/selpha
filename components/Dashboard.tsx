import React, { useEffect, useState } from 'react';
import { User, Course, Task, CGPAEntry, ClassSession } from '../types';
import { backend } from '../services/backend';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, Tooltip } from 'recharts';
import { AlertTriangle, CheckCircle, Clock, MapPin, Loader2, Award } from 'lucide-react';

interface DashboardProps {
  user: User;
}

export const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [cgpaData, setCgpaData] = useState<CGPAEntry[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [attendance, setAttendance] = useState(0);
  const [nextClass, setNextClass] = useState<ClassSession | null>(null);
  
  const isNinePointer = user.cgpa >= 9.0;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await backend.data.getDashboard(user.regNumber);
        if (data) {
          setCourses(data.courses || []);
          setCgpaData(data.cgpa || []);
          
          const allTasks = await backend.data.getTasks(user.regNumber);
          // Sort by deadline and show all incomplete tasks
          const pendingTasks = allTasks
            .filter(t => !t.completed)
            .sort((a, b) => a.deadline.localeCompare(b.deadline));
            
          setTasks(pendingTasks);
          
          if (data.courses && data.courses.length > 0) {
            const total = data.courses.reduce((acc: number, c: Course) => acc + c.attendance, 0);
            setAttendance(Math.round(total / data.courses.length));
          } else {
            setAttendance(0);
          }

          // Try to find next class
          const timetable = await backend.data.getTimetable(user.regNumber);
          const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          const now = new Date();
          const dayIndex = now.getDay();
          const dayName = days[dayIndex];

          if (timetable && timetable[dayName] && timetable[dayName].length > 0) {
            const currentMinutes = now.getHours() * 60 + now.getMinutes();
            const getMinutes = (timeStr: string) => {
              const [h, m] = timeStr.split(':').map(Number);
              return h * 60 + m;
            };

            // Find the first class that hasn't ended yet
            // We sort by start time just in case, though usually it's sorted
            const todaysClasses = [...timetable[dayName]].sort((a, b) => getMinutes(a.startTime) - getMinutes(b.startTime));
            const upcoming = todaysClasses.find((c: ClassSession) => getMinutes(c.endTime) > currentMinutes);
            
            setNextClass(upcoming || null);
          } else {
            setNextClass(null);
          }
        }
      } catch (e) {
        console.error("Failed to load dashboard", e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.regNumber]);

  if (loading) {
    return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-blue-600" size={32} /></div>;
  }

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">Hello, {user.name.split(' ')[0]}!</h2>
          <p className="text-blue-100 opacity-90">{user.regNumber} | {user.branch}</p>
          <div className="mt-4 flex items-center space-x-2 text-sm bg-white/20 w-fit px-3 py-1 rounded-full border border-white/20">
            <span>CGPA: {user.cgpa}</span>
            {isNinePointer && (
                <span className="flex items-center gap-1 border-l border-white/30 pl-2">
                    <Award size={12} className="text-yellow-300" />
                    <span className="text-yellow-100 font-bold text-xs">9-Pointer</span>
                </span>
            )}
          </div>
        </div>
        {isNinePointer && <Award className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 rotate-12" />}
      </div>

      {/* Quick Status / Next Class */}
      {nextClass ? (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center justify-between bg-gradient-to-r from-indigo-50 to-white">
          <div>
            <p className="text-xs text-indigo-600 font-bold uppercase tracking-wide mb-1">Up Next</p>
            <h3 className="text-lg font-bold text-gray-800">{nextClass.courseName}</h3>
            <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Clock size={14}/> {nextClass.startTime}</span>
              <span className="flex items-center gap-1"><MapPin size={14}/> {nextClass.venue}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center text-sm text-gray-400">
           No classes scheduled right now. Check your timetable!
        </div>
      )}

      {/* Analytics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 min-h-[180px]">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">CGPA Trend</h3>
          <div className="h-32 w-full">
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={cgpaData}>
                  <Line type="monotone" dataKey="gpa" stroke="#4F46E5" strokeWidth={2} dot={false} />
                  <Tooltip />
                </LineChart>
             </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-center items-center min-h-[180px]">
          <h3 className="text-sm font-semibold text-gray-500 mb-2">
              Attendance
          </h3>
          <div className="relative w-24 h-24">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[{ value: attendance }, { value: 100 - attendance }]}
                    innerRadius={30}
                    outerRadius={40}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {/* If 9 Pointer, always green. Else standard logic */}
                    <Cell fill={attendance >= 75 || isNinePointer ? "#10B981" : "#EF4444"} />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
                 <span className={`font-bold text-lg ${isNinePointer ? 'text-green-600' : 'text-gray-700'}`}>{attendance}%</span>
                 {isNinePointer && <span className="text-[8px] uppercase font-bold text-green-600">Exempt</span>}
             </div>
          </div>
        </div>
      </div>

      {/* Tasks Section */}
      <div>
        <h3 className="text-lg font-bold text-gray-800 mb-3">Upcoming Tasks</h3>
        <div className="space-y-3">
          {tasks.length > 0 ? tasks.map(task => (
            <div key={task.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-start space-x-3">
              <div className={`p-2 rounded-full ${task.type === 'Exam' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                <Clock size={16} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                <p className="text-xs text-red-500 mt-1">{task.deadline}</p>
              </div>
            </div>
          )) : (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 text-gray-400 text-sm text-center">
              No pending tasks. Great job!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect } from 'react';
import { User, CGPAEntry } from '../types';
import { backend } from '../services/backend';
import { Mail, BookOpen, Award, LogOut, QrCode, Calendar, TrendingUp } from 'lucide-react';
import { Button } from './Button';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [cgpaData, setCgpaData] = useState<CGPAEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await backend.data.getDashboard(user.regNumber);
        if (data?.cgpa) {
          setCgpaData(data.cgpa);
        }
      } catch (error) {
        console.error("Failed to fetch profile data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user.regNumber]);

  return (
    <div className="p-4 space-y-6">
      
      {/* Digital ID Card */}
      <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
            <QrCode size={120} />
        </div>
        
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <h3 className="text-xs font-semibold tracking-widest uppercase opacity-70">VIT University</h3>
            <p className="text-lg font-bold">Student Identity Card</p>
          </div>
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-white rounded-full"></div>
          </div>
        </div>

        <div className="flex gap-4 items-center relative z-10">
          <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 font-bold text-2xl border-2 border-white/30">
            {user.name.charAt(0)}
          </div>
          <div>
             <h2 className="text-xl font-bold">{user.name}</h2>
             <p className="font-mono text-blue-200">{user.regNumber}</p>
             <p className="text-xs text-gray-300 mt-1">{user.branch}</p>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-end relative z-10">
           <div>
             <p className="text-[10px] uppercase opacity-60">Valid Thru</p>
             <p className="text-sm font-semibold">July {new Date().getFullYear() + 2}</p>
           </div>
           <QrCode size={32} className="opacity-80" />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <BookOpen size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Program</p>
            <p className="text-gray-800 font-medium">{user.branch}</p>
          </div>
        </div>
        <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
            <Award size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Year & Semester</p>
            <p className="text-gray-800 font-medium">Year {user.yearOfStudy} | Semester {user.semester}</p>
          </div>
        </div>
         <div className="p-4 border-b border-gray-50 flex items-center gap-4">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
            <Calendar size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Current CGPA</p>
            <p className="text-gray-800 font-medium">{user.cgpa}</p>
          </div>
        </div>
        <div className="p-4 flex items-center gap-4">
          <div className="p-2 bg-green-50 text-green-600 rounded-lg">
            <Mail size={20} />
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase font-semibold">Email</p>
            <p className="text-gray-800 font-medium">{user.regNumber.toLowerCase()}@vitstudent.ac.in</p>
          </div>
        </div>
      </div>

      {/* CGPA Chart Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-orange-50 text-orange-600 rounded-lg">
             <TrendingUp size={20} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800">Performance Trend</h3>
            <p className="text-xs text-gray-400">CGPA across semesters</p>
          </div>
        </div>

        <div className="h-48 w-full">
           {loading ? (
             <div className="h-full flex items-center justify-center text-xs text-gray-400">Loading history...</div>
           ) : cgpaData.length > 0 ? (
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={cgpaData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                 <XAxis 
                    dataKey="semester" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                    dy={10}
                 />
                 <YAxis 
                    domain={[0, 10]} 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fill: '#9CA3AF' }} 
                 />
                 <Tooltip 
                    cursor={{ fill: '#F9FAFB' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                 />
                 <Bar dataKey="gpa" radius={[4, 4, 0, 0]} barSize={32}>
                    {cgpaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.gpa >= 9 ? '#10B981' : entry.gpa >= 8 ? '#3B82F6' : '#6366F1'} />
                    ))}
                 </Bar>
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border border-dashed border-gray-200">
               <TrendingUp size={24} className="mb-2 opacity-50" />
               <p className="text-xs">No academic history available yet.</p>
             </div>
           )}
        </div>
      </div>

      <div className="pt-4">
        <Button variant="outline" fullWidth onClick={onLogout} className="text-red-600 border-red-200 hover:bg-red-50">
          <div className="flex items-center justify-center gap-2">
            <LogOut size={18} />
            <span>Sign Out</span>
          </div>
        </Button>
      </div>
      
      <div className="text-center text-xs text-gray-300 pt-8">
        Selpha v1.2.0
      </div>
    </div>
  );
};
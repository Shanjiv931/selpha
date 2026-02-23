
import React from 'react';
import { AppView, User as UserType } from '../types';
import { Home, MessageSquare, Calendar, User, LogOut, Clock, BookOpen, CheckCircle, Utensils } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeView: AppView;
  user: UserType | null;
  onNavigate: (view: AppView) => void;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeView, user, onNavigate, onLogout }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row w-full overflow-hidden relative">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-gray-200 h-screen sticky top-0 z-30 shadow-sm">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Selpha
          </h1>
          <p className="text-xs text-gray-500 font-medium tracking-tight mt-1">Academic Personal Assistant</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-1 py-2 overflow-y-auto no-scrollbar">
          <SidebarLink 
            icon={<Home size={20} />} 
            label="Dashboard" 
            active={activeView === AppView.HOME} 
            onClick={() => onNavigate(AppView.HOME)} 
          />
          <SidebarLink 
            icon={<BookOpen size={20} />} 
            label="Courses" 
            active={activeView === AppView.COURSES} 
            onClick={() => onNavigate(AppView.COURSES)} 
          />
          <SidebarLink 
            icon={<CheckCircle size={20} />} 
            label="Attendance" 
            active={activeView === AppView.ATTENDANCE} 
            onClick={() => onNavigate(AppView.ATTENDANCE)} 
          />
          <SidebarLink 
            icon={<Clock size={20} />} 
            label="Timetable" 
            active={activeView === AppView.TIMETABLE} 
            onClick={() => onNavigate(AppView.TIMETABLE)} 
          />
          <SidebarLink 
            icon={<Utensils size={20} />} 
            label="Mess Menu" 
            active={activeView === AppView.MESS} 
            onClick={() => onNavigate(AppView.MESS)} 
          />
          <SidebarLink 
            icon={<MessageSquare size={20} />} 
            label="AI Assistant" 
            active={activeView === AppView.CHAT} 
            onClick={() => onNavigate(AppView.CHAT)} 
          />
          <SidebarLink 
            icon={<Calendar size={20} />} 
            label="Study Planner" 
            active={activeView === AppView.PLANNER} 
            onClick={() => onNavigate(AppView.PLANNER)} 
          />
        </nav>

        <div className="p-4 border-t border-gray-100 space-y-1">
           <SidebarLink 
            icon={<User size={20} />} 
            label="My Profile" 
            active={activeView === AppView.PROFILE} 
            onClick={() => onNavigate(AppView.PROFILE)} 
          />
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        <header className="md:hidden bg-white px-6 py-4 flex justify-between items-center sticky top-0 z-20 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Selpha
            </h1>
          </div>
          <div className="flex gap-3">
              <button onClick={() => onNavigate(AppView.PROFILE)} className={`transition-colors ${activeView === AppView.PROFILE ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
                  <User size={20} />
              </button>
          </div>
        </header>

        <header className="hidden md:flex bg-white px-8 py-5 justify-between items-center border-b border-gray-100">
           <div>
             <h2 className="text-lg font-bold text-gray-800">
               {activeView === AppView.HOME ? 'Dashboard' : 
                activeView === AppView.COURSES ? 'Manage Courses' :
                activeView === AppView.ATTENDANCE ? 'Mark Attendance' :
                activeView === AppView.TIMETABLE ? 'Weekly Schedule' :
                activeView === AppView.MESS ? 'Mess Menu' :
                activeView === AppView.CHAT ? 'AI Academic Mentor' :
                activeView === AppView.PLANNER ? 'Study Planner' : 'Student Profile'}
             </h2>
             <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Selpha Student Portal</p>
           </div>
           <div className="flex items-center gap-4">
             <div className="text-right hidden sm:block">
               <p className="text-xs font-bold text-gray-800">Connected</p>
               <div className="flex items-center gap-1 justify-end">
                 <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                 <p className="text-[10px] text-gray-400">System Online</p>
               </div>
             </div>
             <button onClick={() => onNavigate(AppView.PROFILE)} className="h-10 w-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors border border-indigo-100">
                <User size={20} />
             </button>
           </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-8 no-scrollbar bg-gray-50/50">
          <div className="max-w-6xl mx-auto w-full md:p-6 lg:p-8">
            {children}
          </div>
        </main>

        <nav className="md:hidden absolute bottom-0 w-full bg-white border-t border-gray-200 px-2 py-3 flex justify-around items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] overflow-x-auto no-scrollbar">
          <NavButton icon={<Home size={22} />} label="Home" active={activeView === AppView.HOME} onClick={() => onNavigate(AppView.HOME)} />
          <NavButton icon={<BookOpen size={22} />} label="Courses" active={activeView === AppView.COURSES} onClick={() => onNavigate(AppView.COURSES)} />
          <NavButton icon={<CheckCircle size={22} />} label="Attendance" active={activeView === AppView.ATTENDANCE} onClick={() => onNavigate(AppView.ATTENDANCE)} />
          <NavButton icon={<Clock size={22} />} label="Schedule" active={activeView === AppView.TIMETABLE} onClick={() => onNavigate(AppView.TIMETABLE)} />
          <NavButton icon={<Utensils size={22} />} label="Mess" active={activeView === AppView.MESS} onClick={() => onNavigate(AppView.MESS)} />
          <NavButton icon={<Calendar size={22} />} label="Planner" active={activeView === AppView.PLANNER} onClick={() => onNavigate(AppView.PLANNER)} />
          <NavButton icon={<MessageSquare size={22} />} label="Chat" active={activeView === AppView.CHAT} onClick={() => onNavigate(AppView.CHAT)} />
        </nav>
      </div>
    </div>
  );
};

const SidebarLink: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full px-4 py-3 text-sm font-semibold transition-all rounded-xl ${active ? 'bg-blue-600 text-white shadow-md shadow-blue-200' : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'}`}>
    {icon}
    <span>{label}</span>
  </button>
);

const NavButton: React.FC<{ icon: React.ReactNode; label: string; active: boolean; onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center space-y-1 transition-colors min-w-[64px] flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>
    {icon}
    <span className="text-[9px] font-black uppercase tracking-tighter">{label}</span>
  </button>
);


import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ChatInterface } from './components/ChatInterface';
import { Planner } from './components/Planner';
import { Timetable } from './components/Timetable';
import { Profile } from './components/Profile';
import { AuthForms } from './components/AuthForms';
import { AttendanceManager } from './components/AttendanceManager';
import { CourseManager } from './components/CourseManager';
import { MessManager } from './components/MessManager';
import { AppView, User } from './types';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeView, setActiveView] = useState<AppView>(AppView.AUTH);

  useEffect(() => {
    const storedUser = localStorage.getItem('vitian_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setActiveView(AppView.HOME);
    }
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setActiveView(AppView.HOME);
  };

  const handleLogout = () => {
    localStorage.removeItem('vitian_user');
    setUser(null);
    setActiveView(AppView.AUTH);
  };

  const renderContent = () => {
    if (!user) return <AuthForms onLogin={handleLogin} />;

    switch (activeView) {
      case AppView.HOME:
        return <Dashboard user={user} />;
      case AppView.COURSES:
        return <CourseManager user={user} />;
      case AppView.ATTENDANCE:
        return <AttendanceManager user={user} />;
      case AppView.TIMETABLE:
        return <Timetable />;
      case AppView.MESS:
        return <MessManager />;
      case AppView.CHAT:
        return <ChatInterface user={user} />;
      case AppView.PLANNER:
        return <Planner />;
      case AppView.PROFILE:
        return <Profile user={user} onLogout={handleLogout} />;
      default:
        return <Dashboard user={user} />;
    }
  };

  if (!user) return <AuthForms onLogin={handleLogin} />;

  return (
    <Layout activeView={activeView} user={user} onNavigate={setActiveView} onLogout={handleLogout}>
      {renderContent()}
    </Layout>
  );
}

export default App;

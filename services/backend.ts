
import { User, Course, Task, ClassSession, AuthResponse, Expense } from '../types';
import { supabase } from './supabase';
import { getSessionsForCompositeSlot } from './timetableUtils';

export const backend = {
  auth: {
    login: async (regNumber: string, password: string): Promise<AuthResponse> => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('regNumber', regNumber)
        .single();
      
      if (error || !data) throw new Error('User not found');
      if (data.password !== password) throw new Error('Invalid password');

      const { password: _, ...userWithoutPass } = data;
      return { user: userWithoutPass as User, token: 'supabase-mock-token' };
    },

    register: async (details: any): Promise<AuthResponse> => {
      const { data: existing } = await supabase
        .from('users')
        .select('regNumber')
        .eq('regNumber', details.regNumber)
        .single();

      if (existing) throw new Error('User already exists');

      const newUser = {
        name: details.name,
        regNumber: details.regNumber,
        branch: details.branch,
        semester: Number(details.semester),
        yearOfStudy: Number(details.yearOfStudy),
        cgpa: Number(details.cgpa),
        password: details.password,
        cgpaHistory: details.cgpaHistory || []
      };

      const { error } = await supabase.from('users').insert(newUser);
      if (error) throw new Error(error.message);

      await supabase.from('timetables').insert({ 
        regNumber: details.regNumber, 
        schedule: { 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [] } 
      });

      const { password: _, ...userWithoutPass } = newUser;
      return { user: userWithoutPass as User, token: 'supabase-mock-token' };
    },

    logout: async () => {}
  },

  data: {
    getDashboard: async (regNumber: string) => {
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('regNumber', regNumber)
        .single();

      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('regNumber', regNumber);

      return {
        ...userData,
        courses: courses || [],
        cgpa: userData?.cgpaHistory || []
      };
    },

    getCourses: async (regNumber: string): Promise<Course[]> => {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('regNumber', regNumber);
      if (error) throw error;
      return data as Course[];
    },

    addCourse: async (regNumber: string, course: Omit<Course, 'id' | 'attendance'>) => {
      const attendance = course.totalClasses > 0 
        ? Math.round((course.attendedClasses / course.totalClasses) * 100) 
        : 0;

      const newCourseData = {
        id: Date.now().toString(),
        regNumber,
        ...course,
        attendance
      };

      const { error } = await supabase.from('courses').insert(newCourseData);
      if (error) throw error;

      if (course.slot) {
        const sessions = getSessionsForCompositeSlot(course.slot, course.code, course.name, course.faculty || '', course.type, course.venue || "TBD");
        const { data: timetableData } = await supabase
          .from('timetables')
          .select('schedule')
          .eq('regNumber', regNumber)
          .single();

        let schedule = timetableData?.schedule || { 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [] };
        
        sessions.forEach(session => {
           const dayMatch = session.id.match(/-(Mon|Tue|Wed|Thu|Fri)-/);
           const dayKey = dayMatch ? dayMatch[1] : 'Mon';
           if (!schedule[dayKey]) schedule[dayKey] = [];
           schedule[dayKey].push(session);
        });

        await supabase.from('timetables').upsert({ regNumber, schedule });
      }
      
      return newCourseData as Course;
    },

    updateCourse: async (regNumber: string, courseId: string, updates: Partial<Course>) => {
      const finalUpdates: any = { ...updates };
      if (typeof finalUpdates.attendedClasses === 'number' && typeof finalUpdates.totalClasses === 'number') {
          finalUpdates.attendance = finalUpdates.totalClasses > 0 
            ? Math.round((finalUpdates.attendedClasses / finalUpdates.totalClasses) * 100) 
            : 0;
      }
      const { error } = await supabase.from('courses').update(finalUpdates).eq('id', courseId).eq('regNumber', regNumber);
      if (error) throw error;
      return { id: courseId, ...finalUpdates };
    },

    deleteCourse: async (regNumber: string, courseId: string) => {
      // 1. Get course details first for timetable cleanup (ignore error if not found, just try delete)
      const { data: course } = await supabase.from('courses').select('code').eq('id', courseId).single();
      
      // 2. Delete the course
      const { error } = await supabase.from('courses').delete().eq('id', courseId).eq('regNumber', regNumber);
      if (error) throw new Error(error.message);

      // 3. Cleanup timetable if course was found
      if (course) {
        const { data: timetableData } = await supabase.from('timetables').select('schedule').eq('regNumber', regNumber).single();
        if (timetableData?.schedule) {
          const newSchedule: any = {};
          Object.keys(timetableData.schedule).forEach(day => {
            newSchedule[day] = timetableData.schedule[day].filter((s: any) => s.courseCode !== course.code);
          });
          await supabase.from('timetables').update({ schedule: newSchedule }).eq('regNumber', regNumber);
        }
      }
      return [];
    },

    getTimetable: async (regNumber: string) => {
      const { data } = await supabase.from('timetables').select('schedule').eq('regNumber', regNumber).single();
      return (data?.schedule || { 'Mon': [], 'Tue': [], 'Wed': [], 'Thu': [], 'Fri': [] }) as Record<string, ClassSession[]>;
    },

    getTasks: async (regNumber: string): Promise<Task[]> => {
      const { data, error } = await supabase.from('tasks').select('*').eq('regNumber', regNumber);
      if (error) throw error;
      return data as Task[];
    },

    addTask: async (regNumber: string, task: Task) => {
      const newTask = { ...task, regNumber, id: task.id || Date.now().toString() };
      await supabase.from('tasks').insert(newTask);
      return newTask;
    },

    toggleTask: async (regNumber: string, taskId: string) => {
      const { data } = await supabase.from('tasks').select('completed').eq('id', taskId).single();
      if (data) await supabase.from('tasks').update({ completed: !data.completed }).eq('id', taskId);
    },

    deleteTask: async (regNumber: string, taskId: string) => {
      await supabase.from('tasks').delete().eq('id', taskId);
    },

    getExpenses: async (regNumber: string): Promise<Expense[]> => {
      const { data, error } = await supabase.from('expenses').select('*').eq('regNumber', regNumber).order('date', { ascending: false });
      if (error) return [];
      return data as Expense[];
    },

    addExpense: async (regNumber: string, expense: Expense) => {
      const newExpense = { ...expense, regNumber };
      await supabase.from('expenses').insert(newExpense);
      return newExpense;
    },

    deleteExpense: async (regNumber: string, expenseId: string) => {
      await supabase.from('expenses').delete().eq('id', expenseId).eq('regNumber', regNumber);
    }
  }
};
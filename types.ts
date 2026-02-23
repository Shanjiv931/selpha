
export interface User {
  name: string;
  regNumber: string;
  branch: string;
  semester: number;
  yearOfStudy: number;
  cgpa: number;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  attendance: number;
  totalClasses: number;
  attendedClasses: number;
  credits: number;
  faculty?: string;
  slot?: string;
  venue?: string;
  type: 'Theory' | 'Lab';
}

export enum AppView {
  AUTH = 'AUTH',
  HOME = 'HOME',
  TIMETABLE = 'TIMETABLE',
  CHAT = 'CHAT',
  PLANNER = 'PLANNER',
  PROFILE = 'PROFILE',
  ATTENDANCE = 'ATTENDANCE',
  COURSES = 'COURSES',
  MESS = 'MESS'
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  completed: boolean;
  type: 'Assignment' | 'Project' | 'Exam';
}

export interface Expense {
  id: string;
  amount: number;
  category: 'Canteen' | 'Printouts' | 'Laundry' | 'Transport' | 'Other';
  note: string;
  date: string;
}

export interface ClassSession {
  id: string;
  courseCode: string;
  courseName: string;
  type: 'Theory' | 'Lab' | 'Project';
  startTime: string;
  endTime: string;
  venue: string;
  faculty: string;
  slot?: string;
}

export interface MessMenu {
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

export interface CGPAEntry {
  semester: string;
  gpa: number;
}

export interface AuthResponse {
  user: User;
  token: string;
}
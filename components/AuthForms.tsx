
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Button } from './Button';
import { backend } from '../services/backend';
import { Loader2, AlertCircle } from 'lucide-react';

interface AuthFormsProps {
  onLogin: (user: User) => void;
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    regNumber: '',
    branch: 'B.Tech Computer Science',
    yearOfStudy: '1',
    semester: '1',
    password: ''
  });

  const [semesterGPAs, setSemesterGPAs] = useState<Record<string, string>>({});

  useEffect(() => {
    setSemesterGPAs({});
  }, [formData.semester]);

  const getMaxYears = (branch: string) => {
    if (branch.startsWith("B.Tech")) return 4;
    if (branch === "B.Des" || branch === "B.Arch") return 5;
    if (branch.startsWith("B.Sc") || branch === "BCA") return 3;
    return 4;
  };

  useEffect(() => {
    const maxYear = getMaxYears(formData.branch);
    if (parseInt(formData.yearOfStudy) > maxYear) {
      setFormData(prev => ({ ...prev, yearOfStudy: '1', semester: '1' }));
    }
  }, [formData.branch]);

  useEffect(() => {
    const maxSem = parseInt(formData.yearOfStudy) * 2;
    if (parseInt(formData.semester) > maxSem) {
      setFormData(prev => ({ ...prev, semester: '1' }));
    }
  }, [formData.yearOfStudy]);

  const validateForm = () => {
    // Registration Number Validation (2 Digits, 3 Letters, 4 Digits)
    const regNoRegex = /^\d{2}[A-Za-z]{3}\d{4}$/;
    if (!regNoRegex.test(formData.regNumber)) {
      return 'Registration Number must be in format: 2 Digits + 3 Letters + 4 Digits (e.g., 21BCE1001)';
    }

    if (!isLogin) {
      // Full Name Validation (Only Alphabets)
      const nameRegex = /^[a-zA-Z\s]+$/;
      if (!nameRegex.test(formData.name)) {
        return 'Full Name should only contain alphabets.';
      }

      // Password Validation
      if (formData.password.length < 8) {
        return 'Password must be at least 8 characters long.';
      }
      if (!/[A-Z]/.test(formData.password)) {
        return 'Password must contain at least one uppercase letter.';
      }
      if (!/[a-z]/.test(formData.password)) {
        return 'Password must contain at least one lowercase letter.';
      }
      if (!/[0-9]/.test(formData.password)) {
        return 'Password must contain at least one number.';
      }
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(formData.password)) {
        return 'Password must contain at least one special character.';
      }
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);

    try {
      if (isLogin) {
        const response = await backend.auth.login(formData.regNumber, formData.password);
        localStorage.setItem('vitian_user', JSON.stringify(response.user));
        onLogin(response.user);
      } else {
        const currentSem = parseInt(formData.semester);
        const previousSemCount = currentSem - 1;
        let calculatedCGPA = 0;
        let gpaHistory: { semester: string, gpa: number }[] = [];

        if (previousSemCount > 0) {
             let totalGPA = 0;
             for(let i=1; i<=previousSemCount; i++) {
                 if(!semesterGPAs[i]) {
                     throw new Error(`Please enter GPA for Semester ${i}`);
                 }
                 const val = parseFloat(semesterGPAs[i]);
                 if(val < 0 || val > 10) {
                     throw new Error(`Invalid GPA for Semester ${i}`);
                 }
                 totalGPA += val;
                 gpaHistory.push({ semester: `Sem ${i}`, gpa: val });
             }
             calculatedCGPA = parseFloat((totalGPA / previousSemCount).toFixed(2));
        }
        
        const registerData = {
            ...formData,
            cgpa: calculatedCGPA,
            cgpaHistory: gpaHistory
        };

        const response = await backend.auth.register(registerData);
        localStorage.setItem('vitian_user', JSON.stringify(response.user));
        onLogin(response.user);
      }
    } catch (err: any) {
      if (isLogin && err.message === 'User not found') {
        setError('User not found. Redirecting to registration...');
        setTimeout(() => {
            setIsLogin(false);
            setError('');
        }, 1500);
      } else {
        setError(err.message || 'An error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    if (e.target.name === 'regNumber') {
        value = value.toUpperCase();
    }
    setFormData({ ...formData, [e.target.name]: value });
    setError('');
  };

  const handleGPAChange = (sem: number, value: string) => {
      setSemesterGPAs(prev => ({...prev, [sem]: value}));
  };

  const branches = [
    "B.Tech Computer Science",
    "B.Tech Information Technology",
    "B.Tech Electronics & Comm.",
    "B.Tech Electrical & Electronics",
    "B.Tech Mechanical",
    "B.Tech Civil",
    "B.Tech Biotechnology",
    "B.Tech Chemical",
    "B.Des",
    "B.Arch",
    "B.Sc Computer Science",
    "BCA"
  ];

  const currentSem = parseInt(formData.semester);
  const showGPAInputs = currentSem > 1;
  const maxSemesters = parseInt(formData.yearOfStudy) * 2;
  const availableSemesterOptions = Array.from({ length: maxSemesters }, (_, i) => i + 1);
  const maxYears = getMaxYears(formData.branch);
  const availableYearOptions = Array.from({ length: maxYears }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-6 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 p-8 sm:p-10">
        <div className="mb-10 text-center">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-3">
            Selpha
          </h1>
          <p className="text-gray-400 text-sm font-medium">Smart Academic Mentor for Students</p>
        </div>

        <div className="space-y-6">
          <div className="flex bg-gray-100 p-1 rounded-xl mb-8">
            <button 
              className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-lg ${isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setIsLogin(true); setError(''); }}
            >
              Sign In
            </button>
            <button 
              className={`flex-1 py-2.5 text-sm font-bold transition-all rounded-lg ${!isLogin ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
              onClick={() => { setIsLogin(false); setError(''); }}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-xl text-xs font-semibold flex items-center gap-3 animate-pulse">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="animate-in fade-in duration-300">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                <input 
                  name="name"
                  type="text" 
                  required
                  className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
            )}
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Registration No</label>
              <input 
                name="regNumber"
                type="text" 
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all font-mono"
                placeholder="21BCE1001"
                value={formData.regNumber}
                onChange={handleChange}
              />
            </div>

            {!isLogin && (
              <div className="space-y-5 animate-in fade-in duration-300">
                 <div>
                   <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Course/Branch</label>
                   <select 
                     name="branch"
                     className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                     value={formData.branch}
                     onChange={handleChange}
                   >
                     {branches.map(b => <option key={b} value={b}>{b}</option>)}
                   </select>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Year</label>
                     <select 
                       name="yearOfStudy"
                       className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                       value={formData.yearOfStudy}
                       onChange={handleChange}
                     >
                       {availableYearOptions.map(n => <option key={n} value={n}>{n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : n + 'th'} Year</option>)}
                     </select>
                   </div>
                   <div>
                     <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Semester</label>
                     <select 
                       name="semester"
                       className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                       value={formData.semester}
                       onChange={handleChange}
                     >
                       {availableSemesterOptions.map(n => <option key={n} value={n}>Sem {n}</option>)}
                     </select>
                   </div>
                 </div>

                 {showGPAInputs && (
                     <div className="bg-blue-50/50 p-5 rounded-2xl border border-blue-100">
                         <h3 className="text-xs font-bold text-blue-700 uppercase tracking-widest mb-4">Academic History (GPAs)</h3>
                         <div className="grid grid-cols-2 gap-4">
                             {Array.from({length: currentSem - 1}, (_, i) => i + 1).map(sem => (
                                 <div key={sem}>
                                     <label className="block text-[10px] font-bold text-blue-400 mb-1">Sem {sem}</label>
                                     <input
                                         type="number"
                                         step="0.01"
                                         min="0"
                                         max="10"
                                         required
                                         className="w-full px-3 py-2 bg-white border border-blue-100 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                                         value={semesterGPAs[sem] || ''}
                                         onChange={(e) => handleGPAChange(sem, e.target.value)}
                                     />
                                 </div>
                             ))}
                         </div>
                     </div>
                 )}
             </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Password</label>
              <input 
                name="password"
                type="password" 
                required
                className="w-full px-5 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
              />
              {!isLogin && (
                <p className="text-[10px] text-gray-400 mt-2 ml-1">
                  Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char.
                </p>
              )}
            </div>

            <Button type="submit" fullWidth className="mt-6 py-4 shadow-xl shadow-blue-500/20 text-md font-bold rounded-2xl flex items-center justify-center gap-3 transition-transform active:scale-95" disabled={isLoading}>
              {isLoading && <Loader2 className="animate-spin" size={20} />}
              {isLogin ? 'Sign In to Portal' : 'Create My Account'}
            </Button>
          </form>
        </div>

        <p className="mt-12 text-center text-xs text-gray-400 font-medium">
          Exclusive Academic Tool for Selpha Users.
          <br/>
          <span className="opacity-50">Powered by SKR</span>
        </p>
      </div>
    </div>
  );
};

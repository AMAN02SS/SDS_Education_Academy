import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { CLASSES } from '../constants';
import { GraduationCap, Users, ArrowRight, BookOpen, Target, Sparkles, Check } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<'student' | 'parent' | null>(null);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const goalOptions = [
    { id: 'exam', label: 'Exam Preparation', icon: Target },
    { id: 'concepts', label: 'Clear Concepts', icon: Sparkles },
    { id: 'homework', label: 'Homework Help', icon: BookOpen },
    { id: 'revision', label: 'Quick Revision', icon: Check }
  ];

  const handleComplete = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        onboardingCompleted: true,
        accountType: role,
        grade: selectedClass,
        goals: goals,
        role: profile?.role // Preserve existing role like 'admin' if any
      });
      // Context will automatically reflect this because we are using onSnapshot
    } catch (e) {
      console.error("Error updating profile:", e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-secondary flex items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-mesh opacity-50" />
      
      <div className="relative z-10 w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] p-8 md:p-12 shadow-2xl relative overflow-hidden"
        >
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
            <motion.div 
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold text-secondary mb-3">Welcome to SDS Academy</h2>
                  <p className="text-slate-500">To personalize your experience, please tell us who is using the app.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setRole('student')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group ${role === 'student' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'}`}
                  >
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${role === 'student' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                      <GraduationCap size={32} />
                    </div>
                    <span className={`font-bold text-lg ${role === 'student' ? 'text-primary' : 'text-secondary'}`}>I'm a Student</span>
                  </button>
                  
                  <button
                    onClick={() => setRole('parent')}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group ${role === 'parent' ? 'border-primary bg-primary/5' : 'border-slate-100 hover:border-primary/30'}`}
                  >
                    <div className={`h-16 w-16 rounded-full flex items-center justify-center transition-colors ${role === 'parent' ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-primary/20 group-hover:text-primary'}`}>
                      <Users size={32} />
                    </div>
                    <span className={`font-bold text-lg ${role === 'parent' ? 'text-primary' : 'text-secondary'}`}>I'm a Parent</span>
                  </button>
                </div>
                
                <div className="flex justify-end pt-4">
                  <button 
                    onClick={() => setStep(2)}
                    disabled={!role}
                    className="flex items-center gap-2 px-8 py-4 bg-secondary text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-secondary/20"
                  >
                    Next <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold text-secondary mb-3">
                    {role === 'parent' ? 'Which class is your child in?' : 'Which class do you study in?'}
                  </h2>
                  <p className="text-slate-500">We will tailor the content specifically for this class.</p>
                </div>
                
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {CLASSES.map((cls) => (
                    <button
                      key={cls}
                      onClick={() => setSelectedClass(cls)}
                      className={`py-4 rounded-xl border-2 font-bold transition-all ${selectedClass === cls ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30' : 'border-slate-100 text-secondary hover:border-primary/30'}`}
                    >
                      {cls.replace('Class ', '')}
                    </button>
                  ))}
                </div>
                
                <div className="flex justify-between pt-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="flex items-center gap-2 px-8 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    disabled={!selectedClass}
                    className="flex items-center gap-2 px-8 py-4 bg-secondary text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-secondary/20"
                  >
                    Next <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-3xl font-display font-bold text-secondary mb-3">What are your main goals?</h2>
                  <p className="text-slate-500">Select all that apply.</p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {goalOptions.map((goalOption) => {
                    const Icon = goalOption.icon;
                    const isSelected = goals.includes(goalOption.id);
                    return (
                      <button
                        key={goalOption.id}
                        onClick={() => {
                          if (isSelected) setGoals(goals.filter(g => g !== goalOption.id));
                          else setGoals([...goals, goalOption.id]);
                        }}
                        className={`p-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-slate-100 text-slate-600 hover:border-primary/30'}`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'}`}>
                          <Icon size={20} />
                        </div>
                        <span className="font-bold">{goalOption.label}</span>
                        {isSelected && <Check size={20} className="ml-auto text-primary" />}
                      </button>
                    );
                  })}
                </div>
                
                <div className="flex justify-between pt-4 mt-8">
                  <button 
                    onClick={() => setStep(2)}
                    className="flex items-center gap-2 px-8 py-4 text-slate-500 font-bold rounded-2xl hover:bg-slate-50 transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={loading || goals.length === 0}
                    className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white font-bold rounded-2xl disabled:opacity-50 hover:bg-primary-dark transition-all active:scale-95 shadow-xl shadow-primary/30 min-w-40"
                  >
                    {loading ? 'Setting up...' : 'Get Started'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

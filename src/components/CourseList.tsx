import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, BookOpen, Star, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CLASSES, MOCK_SUBJECTS } from '../constants';
import { db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export const ClassExplorer: React.FC = () => {
  const { profile } = useAuth();
  const [selectedGrade, setSelectedGrade] = useState('Class 10');
  const [isGradeSetFromProfile, setIsGradeSetFromProfile] = useState(false);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.grade && !isGradeSetFromProfile) {
      setSelectedGrade(profile.grade);
      setIsGradeSetFromProfile(true);
    }
  }, [profile, isGradeSetFromProfile]);

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'subjects'), where('grade', '==', selectedGrade));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Fallback to mock data if Firestore is empty for this grade
        if (data.length === 0) {
          setSubjects(MOCK_SUBJECTS.filter(s => s.grade === selectedGrade));
        } else {
          setSubjects(data);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
        setSubjects(MOCK_SUBJECTS.filter(s => s.grade === selectedGrade));
      }
      setLoading(false);
    };

    fetchSubjects();
  }, [selectedGrade]);

  return (
    <section id="classes" className="py-24 bg-slate-50 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl font-display font-extrabold text-secondary sm:text-5xl">
              Explore by <span className="text-gradient">Grade</span>
            </h2>
            <p className="mt-4 text-lg text-slate-500">
              Select your class to find specialized content, chapter videos, and practice tests designed for your curriculum.
            </p>
          </div>
          
          {/* Grade Selection Rail */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-6 px-6 md:mx-0 md:px-0">
            {CLASSES.map((grade) => (
              <button
                key={grade}
                onClick={() => setSelectedGrade(grade)}
                className={`flex-shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${
                  selectedGrade === grade
                    ? 'bg-secondary text-white shadow-xl shadow-secondary/20 scale-105'
                    : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-100'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>
        </div>

        <motion.div 
          className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3"
        >
          {subjects.map((subject, idx) => (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03, duration: 0.4 }}
              key={subject.id}
              whileHover={{ y: -8 }}
              style={{ willChange: "transform, opacity" }}
              className="group relative overflow-hidden rounded-[2.5rem] bg-white p-4 shadow-premium border border-slate-100 transition-all"
            >
              <div className="relative aspect-video overflow-hidden rounded-[2rem]">
                <img 
                  src={subject.thumbnail} 
                  alt={subject.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center">
                  <Link 
                    to={`/course/${subject.id}`}
                    className="h-14 w-14 flex items-center justify-center rounded-full bg-white text-primary shadow-2xl cursor-pointer"
                  >
                    <Play size={28} fill="currentColor" className="ml-1" />
                  </Link>
                </div>
                <div className="absolute top-4 left-4">
                  <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black text-secondary uppercase tracking-widest">
                    {subject.subject}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star size={14} fill="currentColor" />
                    <span className="text-xs font-black text-secondary">{subject.rating || '4.5'}</span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedGrade}</span>
                </div>
                
                <h3 className="text-xl font-display font-bold text-secondary group-hover:text-primary transition-colors leading-tight">
                  {subject.title}
                </h3>
                
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                      <BookOpen size={16} className="text-primary" />
                      {subject.chapters?.length || 0} Chapters
                    </div>
                  </div>
                  <Link to={`/course/${subject.id}`} className="flex items-center gap-2 text-sm font-bold text-secondary group-hover:text-primary transition-all">
                    Learn Now
                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
          {subjects.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-medium italic">No courses available for {selectedGrade} yet. Check back soon!</p>
            </div>
          )}
          {loading && (
            <div className="col-span-full py-20 text-center">
              <p className="text-slate-400 font-medium italic">Loading courses...</p>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};

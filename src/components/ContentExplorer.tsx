import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES, MOCK_SUBJECTS, MOCK_QUIZZES, MOCK_NCERT } from '../constants';
import { db, auth } from '../firebase';
import { collection, getDocs, query, where, setDoc, doc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ChevronRight, ArrowLeft, Play, Trophy, BookOpen, Search, CheckCircle2, AlertCircle, RotateCcw, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VideoPlayer } from './VideoPlayer';

type ExplorerType = 'videos';

interface ContentExplorerProps {
  type: ExplorerType;
}

export const ContentExplorer: React.FC<ContentExplorerProps> = ({ type }) => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<'class' | 'subject' | 'chapter' | 'content'>('class');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [selectedChapter, setSelectedChapter] = useState<any>(null);

  useEffect(() => {
    if (profile?.grade && !selectedClass && step === 'class') {
      setSelectedClass(profile.grade);
      setStep('subject');
    }
  }, [profile]);
  
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  useEffect(() => {
    if (user) {
      const fetchProgress = async () => {
        try {
          const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const progressMap: Record<string, any> = {};
          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            progressMap[data.contentId] = data;
          });
          setUserProgress(progressMap);
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      };
      fetchProgress();
    }
  }, [user, step]);

  useEffect(() => {
    if (selectedClass) {
      const fetchSubjects = async () => {
        setLoading(true);
        try {
          const q = query(collection(db, 'subjects'), where('grade', '==', selectedClass));
          const querySnapshot = await getDocs(q);
          const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (data.length === 0) {
            setSubjects(MOCK_SUBJECTS.filter(s => s.grade === selectedClass));
          } else {
            setSubjects(data);
          }
        } catch (error) {
          console.error("Error fetching subjects:", error);
          setSubjects(MOCK_SUBJECTS.filter(s => s.grade === selectedClass));
        }
        setLoading(false);
      };
      fetchSubjects();
    }
  }, [selectedClass]);

  const [savingProgress, setSavingProgress] = useState(false);

  const saveProgress = async (contentId: string, contentType: 'video', score?: number, total?: number) => {
    if (!user) return;
    setSavingProgress(true);
    try {
      const progressId = `${user.uid}_${contentId}`;
      await setDoc(doc(db, 'progress', progressId), {
        userId: user.uid,
        contentId,
        type: contentType,
        completed: true,
        score: score ?? null,
        totalQuestions: total ?? null,
        updatedAt: serverTimestamp()
      });
      
      // Increment views for the subject/chapter
      if (contentType === 'video') {
        // This is a simplified view increment. In a real app, you'd use a transaction or a cloud function.
        // For now, we'll just update the local state and assume the admin can see it.
        // We could also update the subject document if we had the subject ID easily accessible.
      }

      setUserProgress(prev => ({
        ...prev,
        [contentId]: { completed: true, score, totalQuestions: total }
      }));
    } catch (error) {
      console.error("Error saving progress:", error);
    }
    setSavingProgress(false);
  };

  const titles = {
    videos: 'Subject Videos'
  };

  const icons = {
    videos: <Play size={24} />
  };

  const handleBack = () => {
    if (step === 'content') {
      setStep('chapter');
    } else if (step === 'chapter') {
      setStep('subject');
      setSelectedChapter(null);
    } else if (step === 'subject') {
      setStep('class');
      setSelectedSubject(null);
      setSubjects([]);
    }
  };

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <div className="flex items-center gap-4 mb-4">
            {step !== 'class' && (
              <button onClick={handleBack} className="p-2 rounded-full bg-white shadow-sm hover:text-primary transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <Link to="/" className="text-sm font-bold text-slate-500 hover:text-primary transition-colors">
              Back to Home
            </Link>
          </div>
          <h1 className="text-4xl font-display font-extrabold text-secondary flex items-center gap-4">
            <span className="p-3 rounded-2xl bg-primary/10 text-primary">{icons[type]}</span>
            {titles[type]}
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 'class' && 'Select your class to begin.'}
            {step === 'subject' && `Exploring ${selectedClass}`}
            {step === 'chapter' && `${selectedSubject?.title} - Chapters`}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 'class' && (
            <motion.div 
              key="class-step"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
            >
              {CLASSES.map((grade) => (
                <button
                  key={grade}
                  onClick={() => { setSelectedClass(grade); setStep('subject'); }}
                  className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-sm hover:shadow-premium hover:border-primary/20 transition-all group text-center"
                >
                  <span className="text-2xl font-display font-black text-secondary group-hover:text-primary transition-colors">{grade.replace('Class ', '')}</span>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Grade</p>
                </button>
              ))}
            </motion.div>
          )}

          {step === 'subject' && (
            <motion.div 
              key="subject-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => { setSelectedSubject(subject); setStep('chapter'); }}
                  className="flex flex-col items-start p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-premium transition-all group text-left"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{subject.subject}</h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-6">{subject.description}</p>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary">
                    View Chapters <ChevronRight size={18} />
                  </div>
                </button>
              ))}
              {subjects.length === 0 && !loading && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">No subjects available for this class yet.</div>
              )}
              {loading && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">Loading subjects...</div>
              )}
            </motion.div>
          )}

          {step === 'chapter' && (
            <motion.div 
              key="chapter-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {selectedSubject?.chapters?.map((chapter: any, idx: number) => {
                const chapterId = chapter.id || `ch_${idx}_${chapter.title.replace(/\s+/g, '_')}`;
                const progress = userProgress[chapterId];
                return (
                  <button
                    key={chapterId}
                    onClick={() => { setSelectedChapter({ ...chapter, id: chapterId }); setStep('content'); }}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left relative overflow-hidden"
                  >
                    {progress?.completed && (
                      <div className="absolute top-0 right-0 p-2 bg-emerald-500 text-white rounded-bl-xl">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center transition-all ${progress?.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'}`}>
                      <span className="font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary text-lg">{chapter.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {type === 'videos' && 'Video Lesson'}
                        </p>
                      </div>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 'content' && (
            <motion.div 
              key="content-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-premium border border-slate-100"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <h2 className="text-3xl font-display font-extrabold text-secondary">{selectedChapter?.title}</h2>
                {type === 'videos' && (
                  <button 
                    onClick={() => saveProgress(selectedChapter.id, 'video')}
                    disabled={userProgress[selectedChapter.id]?.completed || savingProgress}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${userProgress[selectedChapter.id]?.completed ? 'bg-emerald-100 text-emerald-600 cursor-default' : 'bg-primary text-white hover:bg-primary-dark shadow-lg shadow-primary/20 active:scale-95'}`}
                  >
                    {userProgress[selectedChapter.id]?.completed ? (
                      <><CheckCircle2 size={20} /> Completed</>
                    ) : (
                      savingProgress ? 'Saving...' : 'Mark as Completed'
                    )}
                  </button>
                )}
              </div>
              
              {type === 'videos' && (
                <VideoPlayer 
                  url={selectedChapter?.videoUrl} 
                  contentId={selectedChapter?.id}
                  title={selectedChapter?.title}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CLASSES, MOCK_SUBJECTS } from '../constants';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, setDoc, doc, serverTimestamp, where, updateDoc } from 'firebase/firestore';
import { ArrowLeft, ChevronRight, MessageSquare, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { checkOffensiveContent } from '../lib/moderation';

type Step = 'class' | 'subject' | 'chapter' | 'forum';

export const Forum: React.FC = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>('class');
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
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, any[]>>({});
  
  const [loading, setLoading] = useState(false);
  
  const [newQuestionStr, setNewQuestionStr] = useState('');
  const [newAnswerStr, setNewAnswerStr] = useState<Record<string, string>>({});
  
  const [expandedQuestion, setExpandedQuestion] = useState<string | null>(null);

  // Moderation state
  const [warningMsg, setWarningMsg] = useState<string | null>(null);
  
  const isSuspended = profile?.suspendedUntil ? profile.suspendedUntil.toDate() > new Date() : false;
  const isBanned = profile?.banned === true;

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

  useEffect(() => {
    if (step === 'forum' && selectedChapter) {
      fetchQuestions();
    }
  }, [step, selectedChapter]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'forum'), 
        where('grade', '==', selectedClass),
        where('subject', '==', selectedSubject.subject),
        where('chapter', '==', selectedChapter.title)
      );
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).sort((a: any, b: any) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
      setQuestions(data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const fetchAnswers = async (questionId: string) => {
    try {
      const q = query(collection(db, `forum/${questionId}/answers`), orderBy('createdAt', 'asc'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAnswers(prev => ({ ...prev, [questionId]: data }));
    } catch (e) {
      console.error(e);
    }
  };

  const checkAndApplyModeration = async (text: string): Promise<boolean> => {
    if (checkOffensiveContent(text)) {
      if (!user) return false;
      const currentWarnings = profile?.warnings || 0;
      const newWarnings = currentWarnings + 1;
      
      let payload: any = { warnings: newWarnings };
      
      let message = `Warning: Your message contained offensive language. You have ${newWarnings}/3 warnings.`;
      
      if (newWarnings === 3) {
        // Suspend for 30 days
        const suspensionDate = new Date();
        suspensionDate.setDate(suspensionDate.getDate() + 30);
        payload.suspendedUntil = suspensionDate;
        message = "Your account has been suspended for 30 days due to repeated offensive language.";
      } else if (newWarnings > 3) {
        // Ban entirely
        payload.banned = true;
        message = "Your account has been permanently banned due to continuous violations.";
      }

      try {
        await updateDoc(doc(db, 'users', user.uid), payload);
        // We will momentarily show the warning msg
        setWarningMsg(message);
        setTimeout(() => setWarningMsg(null), 8000);
        // Force reload to apply user state restrictions
        setTimeout(() => window.location.reload(), 3000);
      } catch (err) {
        console.error("Error updating user moderation state:", err);
      }
      return false; // False means content was blocked
    }
    return true;
  };

  const handlePostQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newQuestionStr.trim()) return;

    if (isBanned || isSuspended) return;

    const isSafe = await checkAndApplyModeration(newQuestionStr);
    if (!isSafe) {
      setNewQuestionStr('');
      return;
    }

    try {
      const newDocRef = doc(collection(db, 'forum'));
      await setDoc(newDocRef, {
        grade: selectedClass,
        subject: selectedSubject.subject,
        chapter: selectedChapter.title,
        text: newQuestionStr,
        authorId: user.uid,
        authorName: profile?.displayName || 'Student',
        createdAt: serverTimestamp()
      });
      setNewQuestionStr('');
      fetchQuestions();
    } catch (e) {
      console.error(e);
    }
  };

  const handlePostAnswer = async (e: React.FormEvent, questionId: string) => {
    e.preventDefault();
    if (!user || !newAnswerStr[questionId]?.trim()) return;

    if (isBanned || isSuspended) return;

    const isSafe = await checkAndApplyModeration(newAnswerStr[questionId]);
    if (!isSafe) {
      setNewAnswerStr(prev => ({...prev, [questionId]: ''}));
      return;
    }

    try {
      const newDocRef = doc(collection(db, `forum/${questionId}/answers`));
      await setDoc(newDocRef, {
        text: newAnswerStr[questionId],
        authorId: user.uid,
        authorName: profile?.displayName || 'Student',
        createdAt: serverTimestamp()
      });
      setNewAnswerStr(prev => ({...prev, [questionId]: ''}));
      fetchAnswers(questionId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleBack = () => {
    if (step === 'forum') setStep('chapter');
    else if (step === 'chapter') setStep('subject');
    else if (step === 'subject') setStep('class');
  };

  if (isBanned) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-premium max-w-lg">
          <ShieldAlert size={64} className="text-red-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-secondary mb-4">Account Banned</h2>
          <p className="text-slate-500">Your account has been permanently banned due to continuous violations of our community guidelines regarding offensive language.</p>
        </div>
      </div>
    );
  }

  if (isSuspended) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center bg-white p-12 rounded-[3rem] shadow-premium max-w-lg">
          <AlertTriangle size={64} className="text-orange-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-secondary mb-4">Account Suspended</h2>
          <p className="text-slate-500 mb-2">Your account has been temporarily suspended due to repeated violations of our community guidelines.</p>
          <p className="text-sm font-bold text-orange-500">Suspended until: {profile?.suspendedUntil?.toDate().toLocaleDateString()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {warningMsg && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-red-500 text-white px-8 py-4 rounded-full font-bold shadow-2xl flex items-center gap-3">
            <AlertTriangle size={20} />
            {warningMsg}
          </div>
        )}

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
          <h1 className="text-4xl font-display font-extrabold text-secondary">
            Peer Support <span className="text-gradient">Forum</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 'class' && 'Select your class to enter the forum.'}
            {step === 'subject' && `Select a subject for ${selectedClass}`}
            {step === 'chapter' && `Select a chapter in ${selectedSubject?.subject}`}
            {step === 'forum' && `Discussion: ${selectedChapter?.title} (${selectedSubject?.subject}, ${selectedClass})`}
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
                  <span className="text-2xl font-display font-black text-secondary group-hover:text-primary transition-colors">
                    {grade.replace('Class ', '')}
                  </span>
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
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{subject.subject}</h3>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary">
                    View Chapters <ChevronRight size={18} />
                  </div>
                </button>
              ))}
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
                return (
                  <button
                    key={chapterId}
                    onClick={() => { setSelectedChapter({ ...chapter, id: chapterId }); setStep('forum'); }}
                    className="w-full flex items-center gap-6 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all group text-left"
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
                      <span className="font-bold">{idx + 1}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-secondary text-lg">{chapter.title}</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">Enter Discussion</p>
                    </div>
                    <ChevronRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
                  </button>
                );
              })}
            </motion.div>
          )}

          {step === 'forum' && (
            <motion.div 
              key="forum-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 shadow-premium border border-slate-100 overflow-hidden"
            >
              <div className="mb-8">
                <form onSubmit={handlePostQuestion} className="space-y-4">
                  <textarea 
                    value={newQuestionStr}
                    onChange={e => setNewQuestionStr(e.target.value)}
                    placeholder="Ask a question about this chapter..."
                    className="w-full p-6 bg-slate-50 border border-slate-100 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 h-32"
                  />
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-400 italic bg-amber-50 text-amber-600 px-3 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} />
                      Keep it respectful. Offensive language is filtered and tracked.
                    </span>
                    <button 
                      type="submit"
                      disabled={!newQuestionStr.trim()}
                      className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50"
                    >
                      Post Question
                    </button>
                  </div>
                </form>
              </div>

              {loading ? (
                <div className="text-center py-12 text-slate-400 italic">Loading discussions...</div>
              ) : (
                <div className="space-y-6">
                  {questions.length === 0 && (
                    <div className="text-center py-12 text-slate-400 italic">No questions have been asked yet. Be the first!</div>
                  )}
                  {questions.map(q => (
                    <div key={q.id} className="border border-slate-100 rounded-3xl p-6 bg-slate-50/50">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                            {q.authorName?.[0]}
                          </div>
                          <div>
                            <p className="font-bold text-secondary text-sm">{q.authorName}</p>
                            <p className="text-xs text-slate-400">{q.createdAt?.toDate().toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-lg font-bold text-secondary mb-4">{q.text}</p>
                      
                      <div className="border-t border-slate-200 mt-4 pt-4">
                        <button 
                          onClick={() => {
                            if (expandedQuestion !== q.id) {
                              setExpandedQuestion(q.id);
                              fetchAnswers(q.id);
                            } else {
                              setExpandedQuestion(null);
                            }
                          }}
                          className="text-sm font-bold text-primary hover:underline"
                        >
                          {expandedQuestion === q.id ? 'Hide Answers' : 'View Answers & Reply'}
                        </button>

                        <AnimatePresence>
                          {expandedQuestion === q.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-6 space-y-4"
                            >
                              <div className="space-y-4">
                                {answers[q.id]?.map((ans: any) => (
                                  <div key={ans.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex gap-4">
                                    <div className="h-8 w-8 shrink-0 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold text-xs">
                                      {ans.authorName?.[0]}
                                    </div>
                                    <div>
                                      <div className="flex items-baseline gap-2">
                                        <span className="font-bold text-secondary text-sm">{ans.authorName}</span>
                                        <span className="text-xs text-slate-400">{ans.createdAt?.toDate().toLocaleDateString()}</span>
                                      </div>
                                      <p className="text-slate-600 mt-1">{ans.text}</p>
                                    </div>
                                  </div>
                                ))}
                                {(!answers[q.id] || answers[q.id].length === 0) && (
                                  <div className="text-sm text-slate-400 italic px-4 py-2">No answers yet.</div>
                                )}
                              </div>
                              
                              <form onSubmit={(e) => handlePostAnswer(e, q.id)} className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
                                <input 
                                  value={newAnswerStr[q.id] || ''}
                                  onChange={e => setNewAnswerStr(prev => ({...prev, [q.id]: e.target.value}))}
                                  placeholder="Write a helpful answer..."
                                  className="flex-1 px-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 text-sm"
                                />
                                <button 
                                  type="submit"
                                  disabled={!(newAnswerStr[q.id] || '').trim()}
                                  className="px-6 py-3 bg-primary text-white font-bold rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all disabled:opacity-50 text-sm"
                                >
                                  Post
                                </button>
                              </form>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

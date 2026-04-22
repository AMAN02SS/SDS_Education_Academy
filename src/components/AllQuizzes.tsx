import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MOCK_QUIZZES, CLASSES } from '../constants';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy, doc, setDoc, serverTimestamp, where } from 'firebase/firestore';
import { Trophy, ArrowLeft, ChevronRight, Play, CheckCircle2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'class' | 'subject' | 'quizzes' | 'viewer';

export const AllQuizzes: React.FC = () => {
  const { user, profile } = useAuth();
  const [step, setStep] = useState<Step>('class');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedQuiz, setSelectedQuiz] = useState<any>(null);

  useEffect(() => {
    if (profile?.grade && !selectedClass && step === 'class') {
      setSelectedClass(profile.grade);
      setStep('subject');
    }
  }, [profile]);
  
  const [quizzesData, setQuizzesData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});

  // Quiz Player State
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  useEffect(() => {
    const fetchQuizzes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'quizzes'), orderBy('grade'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data.length === 0) {
          setQuizzesData(MOCK_QUIZZES);
        } else {
          setQuizzesData(data);
        }
      } catch (error) {
        console.error("Error fetching quizzes:", error);
        setQuizzesData(MOCK_QUIZZES);
      }
      setLoading(false);
    };

    fetchQuizzes();
  }, []);

  useEffect(() => {
    if (user) {
      const fetchProgress = async () => {
        try {
          const q = query(collection(db, 'progress'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
          const progressMap: Record<string, any> = {};
          querySnapshot.docs.forEach(doc => {
            const data = doc.data();
            if (data.type === 'quiz') {
              progressMap[data.contentId] = data;
            }
          });
          setUserProgress(progressMap);
        } catch (error) {
          console.error("Error fetching progress:", error);
        }
      };
      fetchProgress();
    }
  }, [user]);

  const handleBack = () => {
    if (step === 'viewer') {
      setStep('quizzes');
      resetQuiz();
    }
    else if (step === 'quizzes') setStep('subject');
    else if (step === 'subject') setStep('class');
  };

  const getSubjectsForClass = (grade: string) => {
    const classQuizzes = quizzesData.filter(q => q.grade === grade);
    return Array.from(new Set(classQuizzes.map(q => q.subject)));
  };

  const getQuizzesForSubject = (grade: string, subject: string) => {
    return quizzesData.filter(q => q.grade === grade && q.subject === subject);
  };

  const resetQuiz = () => {
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
    setQuizScore(0);
    setQuizFinished(false);
    setSelectedQuiz(null);
  };

  const handleOptionSelect = (idx: number) => {
    if (selectedOption !== null) return; // Prevent multiple selections
    setSelectedOption(idx);
    
    // Update score immediately based on selection (behind the scenes)
    if (idx === selectedQuiz.questions[currentQuestionIdx].answer) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIdx < selectedQuiz.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    } else {
      setQuizFinished(true);
      
      const finalScore = selectedOption === selectedQuiz.questions[currentQuestionIdx].answer ? quizScore + 1 : quizScore;

      // Save progress
      if (user) {
        setSavingProgress(true);
        try {
          const progressId = `${user.uid}_${selectedQuiz.id}`;
          await setDoc(doc(db, 'progress', progressId), {
            userId: user.uid,
            contentId: selectedQuiz.id,
            type: 'quiz',
            completed: true,
            score: finalScore,
            totalQuestions: selectedQuiz.questions.length,
            updatedAt: serverTimestamp()
          });
          
          setUserProgress(prev => ({
            ...prev,
            [selectedQuiz.id]: { completed: true, score: finalScore, totalQuestions: selectedQuiz.questions.length }
          }));
        } catch (error) {
          console.error("Error saving quiz progress:", error);
        }
        setSavingProgress(false);
      }
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
          <h1 className="text-4xl font-display font-extrabold text-secondary">
            Concept <span className="text-gradient">Quizzes</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 'class' && 'Select your class to access chapter-wise Quizzes.'}
            {step === 'subject' && `Select a subject for ${selectedClass}`}
            {step === 'quizzes' && `Quizzes for ${selectedSubject} (${selectedClass})`}
            {step === 'viewer' && `Playing: ${selectedQuiz?.title}`}
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
              {getSubjectsForClass(selectedClass!).map((subject) => (
                <button
                  key={subject}
                  onClick={() => { setSelectedSubject(subject); setStep('quizzes'); }}
                  className="flex flex-col items-start p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-premium transition-all group text-left"
                >
                  <div className="h-12 w-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center mb-6 group-hover:bg-pink-500 group-hover:text-white transition-all">
                    <Trophy size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{subject}</h3>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-pink-500">
                    View Quizzes <ChevronRight size={18} />
                  </div>
                </button>
              ))}
              {getSubjectsForClass(selectedClass!).length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">No Quizzes available for this class yet.</div>
              )}
            </motion.div>
          )}

          {step === 'quizzes' && (
            <motion.div 
              key="quizzes-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {getQuizzesForSubject(selectedClass!, selectedSubject!).map((quiz) => {
                const progress = userProgress[quiz.id];
                return (
                  <div
                    key={quiz.id}
                    className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all group flex flex-col relative overflow-hidden"
                  >
                    {progress?.completed && (
                      <div className="absolute top-0 right-0 p-3 bg-emerald-500 text-white rounded-bl-2xl">
                        <CheckCircle2 size={20} />
                      </div>
                    )}
                    <div className="flex items-start justify-between mb-6">
                      <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-pink-500/10 text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all duration-500">
                        <Trophy size={28} />
                      </div>
                    </div>
                    <h3 className="text-xl font-bold text-secondary mb-2 leading-tight">{quiz.title}</h3>
                    <p className="text-sm text-slate-400 mb-6 font-medium">{quiz.questions?.length || 0} Questions</p>
                    
                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      {progress?.completed ? (
                         <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                           Previous Score: {progress.score}/{progress.totalQuestions}
                         </span>
                      ) : (
                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">Not Attempted</span>
                      )}
                      
                      <button 
                        onClick={() => { setSelectedQuiz(quiz); setStep('viewer'); }}
                        className="flex items-center gap-2 text-sm font-bold text-pink-500 group-hover:text-pink-600 transition-colors"
                      >
                        Play Quiz <Play size={18} />
                      </button>
                    </div>
                  </div>
                );
              })}
              {getQuizzesForSubject(selectedClass!, selectedSubject!).length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">No Quizzes available for this subject yet.</div>
              )}
            </motion.div>
          )}

          {step === 'viewer' && selectedQuiz && (
            <motion.div 
              key="viewer-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-6 text-center max-w-3xl mx-auto shadow-premium border border-slate-100 overflow-hidden"
            >
               {!quizFinished ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-center text-sm font-bold text-slate-400">
                      <span>Question {currentQuestionIdx + 1} of {selectedQuiz.questions.length}</span>
                      <span className="text-primary">Score: {quizScore}</span>
                    </div>
                    
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-primary transition-all duration-500" 
                        style={{ width: `${((currentQuestionIdx) / selectedQuiz.questions.length) * 100}%` }}
                      />
                    </div>

                    <h3 className="text-2xl font-bold text-secondary leading-tight py-4">
                      {selectedQuiz.questions[currentQuestionIdx].question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                      {selectedQuiz.questions[currentQuestionIdx].options.map((opt: string, idx: number) => {
                        const isSelected = selectedOption === idx;
                        const isCorrect = idx === selectedQuiz.questions[currentQuestionIdx].answer;
                        const showStatus = selectedOption !== null;
                        
                        let btnClass = "w-full text-left p-6 rounded-2xl border-2 transition-all font-bold flex justify-between items-center ";
                        
                        if (!showStatus) {
                          btnClass += "border-slate-100 hover:border-primary/50 text-slate-600 hover:bg-slate-50";
                        } else {
                          if (isCorrect) {
                            btnClass += "border-emerald-500 bg-emerald-50 text-emerald-700";
                          } else if (isSelected && !isCorrect) {
                            btnClass += "border-red-500 bg-red-50 text-red-700";
                          } else {
                            btnClass += "border-slate-100 text-slate-400 opacity-50";
                          }
                        }

                        return (
                          <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            disabled={selectedOption !== null}
                            className={btnClass}
                          >
                            {opt}
                            {showStatus && isCorrect && <CheckCircle2 size={24} className="text-emerald-500" />}
                            {showStatus && isSelected && !isCorrect && <XCircle size={24} className="text-red-500" />}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {selectedOption !== null && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="pt-8"
                        >
                          <button
                            onClick={handleNextQuestion}
                            className="w-full p-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all flex items-center justify-center gap-2 text-lg"
                          >
                            {currentQuestionIdx < selectedQuiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                            <ArrowLeft size={20} className="rotate-180" />
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-12 space-y-8 text-center"
                  >
                    <div className="h-32 w-32 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Trophy size={64} className="text-primary" />
                    </div>
                    <h3 className="text-4xl font-display font-extrabold text-secondary">Quiz Completed!</h3>
                    
                    <div className="bg-slate-50 rounded-3xl p-8 max-w-sm mx-auto border border-slate-100">
                      <p className="text-slate-500 font-bold mb-2">Your Score</p>
                      <div className="text-6xl font-black text-primary">
                        {selectedOption === selectedQuiz.questions[currentQuestionIdx].answer ? quizScore + 1 : quizScore}
                        <span className="text-3xl text-slate-300">/{selectedQuiz.questions.length}</span>
                      </div>
                    </div>

                    <div className="flex gap-4 justify-center pt-8">
                      <button 
                        onClick={() => {
                          setStep('quizzes');
                          resetQuiz();
                        }}
                        className="px-8 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                      >
                        Back to Quizzes
                      </button>
                      <button 
                        onClick={() => {
                          resetQuiz();
                          setSelectedQuiz(selectedQuiz); // Re-set to play again
                        }}
                        className="px-8 py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all"
                      >
                        Play Again
                      </button>
                    </div>
                  </motion.div>
                )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

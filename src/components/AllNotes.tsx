import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PDFViewer } from './PDFViewer';
import { MOCK_NOTES, CLASSES } from '../constants';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { FileText, Download, Search, ArrowLeft, ChevronRight, BookOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

type Step = 'class' | 'subject' | 'notes' | 'viewer';

export const AllNotes: React.FC = () => {
  const { profile } = useAuth();
  const [step, setStep] = useState<Step>('class');
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<any>(null);
  
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.grade && !selectedClass && step === 'class') {
      setSelectedClass(profile.grade);
      setStep('subject');
    }
  }, [profile]);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'notes'), orderBy('grade'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data.length === 0) {
          setNotes(MOCK_NOTES);
        } else {
          setNotes(data);
        }
      } catch (error) {
        console.error("Error fetching notes:", error);
        setNotes(MOCK_NOTES);
      }
      setLoading(false);
    };

    fetchNotes();
  }, []);

  const handleBack = () => {
    if (step === 'viewer') setStep('notes');
    else if (step === 'notes') setStep('subject');
    else if (step === 'subject') setStep('class');
  };

  const getSubjectsForClass = (grade: string) => {
    const classNotes = notes.filter(n => n.grade === grade);
    return Array.from(new Set(classNotes.map(n => n.subject)));
  };

  const getNotesForSubject = (grade: string, subject: string) => {
    return notes.filter(n => n.grade === grade && n.subject === subject);
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
            Study <span className="text-gradient">Notes</span>
          </h1>
          <p className="text-slate-500 mt-2">
            {step === 'class' && 'Select your class to access chapter-wise notes.'}
            {step === 'subject' && `Select a subject for ${selectedClass}`}
            {step === 'notes' && `Notes for ${selectedSubject} (${selectedClass})`}
            {step === 'viewer' && `Viewing: ${selectedNote?.title}`}
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
                  onClick={() => { setSelectedSubject(subject); setStep('notes'); }}
                  className="flex flex-col items-start p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-premium transition-all group text-left"
                >
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-white transition-all">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2">{subject}</h3>
                  <div className="mt-auto flex items-center gap-2 text-sm font-bold text-primary">
                    View Notes <ChevronRight size={18} />
                  </div>
                </button>
              ))}
              {getSubjectsForClass(selectedClass!).length === 0 && (
                <div className="col-span-full py-20 text-center text-slate-400 italic">No notes available for this class yet.</div>
              )}
            </motion.div>
          )}

          {step === 'notes' && (
            <motion.div 
              key="notes-step"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {getNotesForSubject(selectedClass!, selectedSubject!).map((note, idx) => (
                <div
                  key={note.id}
                  className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-premium transition-all group flex flex-col"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-14 w-14 flex items-center justify-center rounded-2xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <FileText size={28} />
                    </div>
                    <a 
                      href={note.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:text-primary hover:bg-primary/10 transition-all"
                      title="Download PDF"
                    >
                      <Download size={20} />
                    </a>
                  </div>
                  <h3 className="text-xl font-bold text-secondary mb-2 leading-tight">{note.title}</h3>
                  <p className="text-sm text-slate-400 mb-6 font-medium">{note.subject} • {note.author}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{note.downloads} Downloads</span>
                    <button 
                      onClick={() => { setSelectedNote(note); setStep('viewer'); }}
                      className="flex items-center gap-2 text-sm font-bold text-primary group-hover:text-primary-dark transition-colors"
                    >
                      View Note <Eye size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </motion.div>
          )}

          {step === 'viewer' && selectedNote && (
            <motion.div 
              key="viewer-step"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[3rem] p-4 md:p-8 shadow-premium border border-slate-100 overflow-hidden"
            >
              <div className="flex items-center justify-between mb-6 px-4">
                <h2 className="text-2xl font-display font-extrabold text-secondary">{selectedNote.title}</h2>
                <a 
                  href={selectedNote.pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                >
                  Download PDF <Download size={18} />
                </a>
              </div>
              
              <div className="aspect-[1/1.4] w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative">
                <PDFViewer url={selectedNote.pdfUrl} title={selectedNote.title} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

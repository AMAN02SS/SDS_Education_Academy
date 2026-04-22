import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MOCK_SUBJECTS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Play, ChevronRight, BookOpen, Star, ArrowLeft } from 'lucide-react';
import { VideoPlayer } from './VideoPlayer';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [subject, setSubject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedChapterIdx, setSelectedChapterIdx] = useState(0);

  useEffect(() => {
    const fetchSubject = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'subjects', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setSubject({ id: docSnap.id, ...docSnap.data() });
          setSelectedChapterIdx(0);
        } else {
          // Fallback to mock data
          const mock = MOCK_SUBJECTS.find(s => s.id === id);
          setSubject(mock || null);
          setSelectedChapterIdx(0);
        }
      } catch (error) {
        console.error("Error fetching subject:", error);
        const mock = MOCK_SUBJECTS.find(s => s.id === id);
        setSubject(mock || null);
        setSelectedChapterIdx(0);
      }
      setLoading(false);
    };

    fetchSubject();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!subject) {
    return <div className="py-32 text-center">Subject not found</div>;
  }

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-premium border border-slate-100"
            >
              <div className="mb-8">
                {subject.chapters?.[selectedChapterIdx] ? (
                  <VideoPlayer 
                    url={subject.chapters[selectedChapterIdx].videoUrl}
                    contentId={subject.chapters[selectedChapterIdx].id || `${subject.id}_ch_${selectedChapterIdx}`}
                    title={subject.chapters[selectedChapterIdx].title}
                  />
                ) : (
                  <div className="aspect-video rounded-[2rem] bg-slate-900 flex items-center justify-center text-slate-500">
                    No video available
                  </div>
                )}
              </div>
              <h1 className="text-3xl font-display font-extrabold text-secondary mb-4">{subject.title}</h1>
              <div className="flex flex-wrap items-center gap-6 text-sm font-bold text-slate-400 mb-6">
                <span className="flex items-center gap-1.5"><BookOpen size={18} className="text-primary" /> {subject.lessons} Chapters</span>
                <span className="flex items-center gap-1.5"><Star size={18} className="text-amber-400" /> {subject.rating} Rating</span>
                <span className="px-3 py-1 rounded-full bg-slate-100 text-secondary">{subject.grade}</span>
              </div>
              <p className="text-slate-500 leading-relaxed text-lg">
                {subject.description}
              </p>
            </motion.div>
 
            <div className="space-y-4">
              <h2 className="text-2xl font-display font-bold text-secondary">Course Chapters</h2>
              {subject.chapters?.map((chapter: any, idx: number) => (
                <motion.div 
                  key={chapter.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => setSelectedChapterIdx(idx)}
                  className={`flex items-center gap-4 p-5 rounded-2xl border transition-all cursor-pointer group ${
                    selectedChapterIdx === idx 
                      ? 'bg-primary/5 border-primary shadow-md' 
                      : 'bg-white border-slate-100 hover:shadow-md'
                  }`}
                >
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full transition-all ${
                    selectedChapterIdx === idx 
                      ? 'bg-primary text-white' 
                      : 'bg-slate-50 text-slate-400 group-hover:bg-primary group-hover:text-white'
                  }`}>
                    <Play size={18} fill="currentColor" />
                  </div>
                  <div className="flex-1">
                    <h3 className={`font-bold transition-colors ${selectedChapterIdx === idx ? 'text-primary' : 'text-secondary'}`}>
                      {chapter.title}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium">Video Lesson • 15:00</span>
                  </div>
                  <ChevronRight size={20} className={selectedChapterIdx === idx ? 'text-primary' : 'text-slate-300 group-hover:text-primary'} />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <div className="bg-secondary rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-xl font-display font-bold mb-4">Study Materials</h3>
                <p className="text-slate-400 text-sm mb-6">Download chapter-wise notes and practice papers for this subject.</p>
                <button className="w-full py-4 rounded-2xl bg-primary text-white font-bold shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all">
                  Download Notes
                </button>
              </div>
              <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-32 w-32 rounded-full bg-primary/20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

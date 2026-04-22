import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Calendar, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { MOCK_NOTES, MOCK_BLOGS } from '../constants';
import { db } from '../firebase';
import { collection, query, limit, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';

export const NotesAndBlogs: React.FC = () => {
  const { profile } = useAuth();
  
  // Set accurate initial mock slice based on profile grade if available
  const initialMockNotes = profile?.grade 
    ? MOCK_NOTES.filter(n => n.grade === profile.grade).slice(0, 3) 
    : MOCK_NOTES.slice(0, 3);
    
  // Re-fill if there aren't enough mock notes for that grade
  const displayedMockNotes = initialMockNotes.length > 0 ? initialMockNotes : MOCK_NOTES.slice(0, 3);

  const [notes, setNotes] = useState<any[]>(displayedMockNotes);
  const [blogs, setBlogs] = useState<any[]>(MOCK_BLOGS.slice(0, 2));

  useEffect(() => {
    const fetchContent = async () => {
      try {
        let notesQuery;
        if (profile?.grade) {
          notesQuery = query(collection(db, 'notes'), where('grade', '==', profile.grade), limit(3));
        } else {
          notesQuery = query(collection(db, 'notes'), limit(3));
        }
        
        const notesSnap = await getDocs(notesQuery);
        const fetchedNotes = notesSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        if (fetchedNotes.length > 0) {
          setNotes(fetchedNotes);
        } else {
          setNotes(displayedMockNotes); // Fallback to mocked notes if empty
        }

        const blogsQuery = query(collection(db, 'blogs'), limit(2));
        const blogsSnap = await getDocs(blogsQuery);
        const fetchedBlogs = blogsSnap.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        if (fetchedBlogs.length > 0) {
          setBlogs(fetchedBlogs);
        }
      } catch (error) {
        console.error("Error fetching notes and blogs:", error);
      }
    };

    fetchContent();
  }, [profile?.grade]);

  return (
    <section className="py-24 bg-white relative overflow-hidden">
      {/* Background Accents */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-mesh opacity-30 -z-10" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          
          {/* Notes Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ willChange: "transform, opacity" }}
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-extrabold text-secondary">Study Notes</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Curated by top educators</p>
              </div>
              <Link to="/notes" className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-all">
                View All <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="space-y-4">
              {notes.map((note) => (
                <motion.div
                  key={note.id}
                  whileHover={{ x: 8, backgroundColor: 'rgba(255, 255, 255, 1)' }}
                  style={{ willChange: "transform" }}
                  className="flex items-center gap-5 p-5 rounded-[2rem] border border-slate-100 bg-slate-50/50 hover:shadow-premium transition-all cursor-pointer group"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5 text-primary group-hover:from-primary group-hover:text-white transition-all duration-500">
                    <FileText size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-secondary text-lg leading-tight">{note.title}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-2 py-0.5 rounded-md bg-white text-[10px] font-black text-primary uppercase tracking-tighter border border-primary/10">{note.subject}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{note.grade}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <a 
                      href={note.pdfUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <motion.button 
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white text-slate-400 group-hover:text-primary group-hover:shadow-md transition-all"
                      >
                        <Download size={20} />
                      </motion.button>
                    </a>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{note.downloads || 0} DL</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Blogs Section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            style={{ willChange: "transform, opacity" }}
          >
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-3xl font-display font-extrabold text-secondary">Latest Blogs</h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">Insights for academic success</p>
              </div>
              <Link to="/blogs" className="group flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-all">
                Read More <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-8">
              {blogs.map((blog) => (
                <motion.div
                  key={blog.id}
                  whileHover={{ y: -4 }}
                  style={{ willChange: "transform" }}
                  className="group flex flex-col sm:flex-row gap-8 p-5 rounded-[2.5rem] border border-slate-100 bg-white hover:shadow-premium transition-all"
                >
                  <div className="w-full sm:w-44 h-44 flex-shrink-0 overflow-hidden rounded-[2rem] shadow-lg">
                    <img 
                      src={blog.thumbnail || 'https://picsum.photos/seed/blog/400/300'} 
                      alt={blog.title} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex flex-col py-2">
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-accent uppercase tracking-[0.2em] mb-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
                      {blog.category}
                    </span>
                    <h3 className="text-xl font-display font-bold text-secondary leading-tight group-hover:text-primary transition-colors">
                      <Link to={`/blog/${blog.id}`}>{blog.title}</Link>
                    </h3>
                    <p className="mt-3 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {blog.excerpt || blog.content?.substring(0, 100) || 'Read more...'}
                    </p>
                    <div className="mt-auto flex items-center gap-6 pt-6 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                        <div className="h-5 w-5 rounded-full bg-slate-100 flex items-center justify-center">
                          <User size={10} />
                        </div>
                        {blog.author}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar size={12} />
                        {blog.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

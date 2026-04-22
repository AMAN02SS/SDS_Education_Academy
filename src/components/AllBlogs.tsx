import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MOCK_BLOGS } from '../constants';
import { db } from '../firebase';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Calendar, User, ArrowRight, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AllBlogs: React.FC = () => {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true);
      try {
        const q = query(collection(db, 'blogs'), orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        if (data.length === 0) {
          setBlogs(MOCK_BLOGS);
        } else {
          setBlogs(data);
        }
      } catch (error) {
        console.error("Error fetching blogs:", error);
        setBlogs(MOCK_BLOGS);
      }
      setLoading(false);
    };

    fetchBlogs();
  }, []);

  return (
    <div className="pt-32 pb-24 bg-slate-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-4 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
          <h1 className="text-4xl font-display font-extrabold text-secondary">Educational <span className="text-gradient">Blogs</span></h1>
          <p className="text-slate-500 mt-2">Insights, tips, and news for students and parents.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogs.map((blog, idx) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -10 }}
              className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-premium transition-all flex flex-col"
            >
              <div className="aspect-video overflow-hidden relative">
                <img 
                  src={blog.thumbnail} 
                  alt={blog.title} 
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-4 left-4">
                  <span className="glass px-4 py-1.5 rounded-full text-[10px] font-black text-secondary uppercase tracking-widest">
                    {blog.category}
                  </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <h3 className="text-xl font-display font-bold text-secondary mb-4 group-hover:text-primary transition-colors leading-tight">
                  {blog.title}
                </h3>
                <p className="text-slate-500 text-sm line-clamp-3 mb-6 leading-relaxed">
                  {blog.excerpt}
                </p>
                <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Calendar size={14} /> {blog.date}</span>
                  </div>
                  <Link to={`/blog/${blog.id}`} className="flex items-center gap-2 text-sm font-bold text-primary group-hover:translate-x-1 transition-all">
                    Read More <ArrowRight size={18} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

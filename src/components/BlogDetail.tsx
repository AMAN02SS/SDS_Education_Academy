import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { MOCK_BLOGS } from '../constants';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Calendar, User, ArrowLeft, Share2, Bookmark } from 'lucide-react';
import Markdown from 'react-markdown';

export const BlogDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [blog, setBlog] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const docRef = doc(db, 'blogs', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setBlog({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback to mock data
          const mock = MOCK_BLOGS.find(b => b.id === id);
          setBlog(mock || null);
        }
      } catch (error) {
        console.error("Error fetching blog:", error);
        const mock = MOCK_BLOGS.find(b => b.id === id);
        setBlog(mock || null);
      }
      setLoading(false);
    };

    fetchBlog();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!blog) {
    return <div className="py-32 text-center">Blog post not found</div>;
  }

  return (
    <div className="pt-32 pb-24 bg-white min-h-screen">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <Link to="/blogs" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Blogs
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="px-4 py-1.5 rounded-full bg-primary/10 text-[10px] font-black text-primary uppercase tracking-widest">
              {blog.category}
            </span>
            <span className="text-slate-300">•</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{blog.date}</span>
          </div>

          <h1 className="text-4xl md:text-5xl font-display font-extrabold text-secondary mb-8 leading-tight">
            {blog.title}
          </h1>

          <div className="flex items-center justify-between py-8 border-y border-slate-100 mb-12">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
                <User size={24} className="text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-secondary">{blog.author}</p>
                <p className="text-xs text-slate-400 font-medium">Educational Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Share2 size={18} />
              </button>
              <button className="h-10 w-10 flex items-center justify-center rounded-full border border-slate-100 text-slate-400 hover:text-primary hover:border-primary transition-all">
                <Bookmark size={18} />
              </button>
            </div>
          </div>

          <div className="aspect-video rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
            <img 
              src={blog.thumbnail} 
              alt={blog.title} 
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          <div className="prose prose-lg max-w-none prose-slate prose-headings:font-display prose-headings:text-secondary prose-p:text-slate-500 prose-p:leading-relaxed">
            <div className="markdown-body">
              <Markdown>{blog.content}</Markdown>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

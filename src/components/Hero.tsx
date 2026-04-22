import React from 'react';
import { motion } from 'motion/react';
import { Video, Users, Trophy, ArrowRight, Play, BookOpen } from 'lucide-react';
import { signInWithGoogle } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export const Hero: React.FC = () => {
  const { user } = useAuth();

  const features = [
    { icon: Video, title: 'Subject Videos', desc: 'Chapter-wise video lessons for all subjects from Class 1 to 12.', color: 'bg-blue-500', link: '/videos' },
    { icon: Trophy, title: 'Concept Quizzes', desc: 'Quick assessments to master every topic in your curriculum.', color: 'bg-pink-500', link: '/quizzes' },
    { icon: Users, title: 'Peer Support', desc: 'Connect with students in your grade for collaborative learning.', color: 'bg-emerald-500', link: '/forum' },
    { icon: BookOpen, title: 'NCERT Solutions', desc: 'Detailed explanations and solutions for all textbook exercises.', color: 'bg-amber-500', link: '/ncert' },
  ];

  return (
    <div className="relative isolate overflow-hidden bg-mesh pt-32 pb-24 sm:pt-48 sm:pb-32">
      {/* Static Background Blobs for performance */}
      <div className="absolute top-0 left-1/2 -z-10 -translate-x-1/2 blur-3xl opacity-20" aria-hidden="true">
        <div 
          className="aspect-1155/678 w-[72.1875rem] bg-linear-to-tr from-primary to-accent" 
          style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}
        />
      </div>

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ willChange: "transform, opacity" }}
          >
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/60 px-4 py-1.5 text-xs font-bold leading-6 text-primary ring-1 ring-inset ring-primary/20 mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              New: Class 10 Board Exam Preparation Series
            </motion.div>
            
            <h1 className="text-5xl font-display font-extrabold tracking-tight text-secondary sm:text-7xl leading-tight">
              <span className="italic flex items-center justify-center gap-4">
                Hi <span className="text-gradient leading-tight">{user?.displayName?.split(' ')[0] || 'Student'}</span>
                <img src="https://fonts.gstatic.com/s/e/notoemoji/latest/1f44b/512.gif" alt="👋" className="h-16 w-16 sm:h-20 sm:w-20 object-contain" />
              </span>
              <br /> 
              Welcome to <span className="whitespace-nowrap">SDS Education Academy</span>
            </h1>
            
            <p className="mt-8 text-2xl font-bold tracking-wide text-primary uppercase max-w-2xl mx-auto">
              Education for All
            </p>
            
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
              {!user ? (
                <button
                  onClick={signInWithGoogle}
                  className="w-full sm:w-auto rounded-2xl bg-secondary px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-secondary/30 hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-3 group"
                >
                  Start Learning Free 
                  <ArrowRight size={22} className="group-hover:translate-x-1 transition-transform" />
                </button>
              ) : (
                <Link 
                  to="/videos"
                  className="w-full sm:w-auto rounded-2xl bg-primary px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-primary/30 hover:bg-primary-dark transition-all active:scale-95 flex items-center justify-center gap-3"
                >
                  My Dashboard <Play size={22} fill="currentColor" />
                </Link>
              )}
              <a href="#classes" className="text-sm font-bold leading-6 text-secondary hover:text-primary transition-all flex items-center gap-2">
                Explore Classes <ChevronRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          style={{ willChange: "transform, opacity" }}
          className="mt-24 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {features.map((feature, idx) => {
            const isExternal = feature.link.startsWith('mailto:');
            const CardWrapper = isExternal ? 'a' : Link;
            const wrapperProps = isExternal ? { href: feature.link } : { to: feature.link };

            return (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.01 }}
                className="relative"
              >
                <CardWrapper
                  {...(wrapperProps as any)}
                  className="flex flex-col h-full items-start p-8 rounded-3xl bg-white border border-white shadow-premium transition-all hover:border-primary/20"
                >
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color} text-white shadow-lg mb-6`}>
                    <feature.icon size={28} />
                  </div>
                  <h3 className="text-xl font-bold text-secondary">{feature.title}</h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed">{feature.desc}</p>
                  <div className="mt-auto pt-6 flex items-center gap-2 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    Get Started <ChevronRight size={14} />
                  </div>
                </CardWrapper>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
};

const ChevronRight = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

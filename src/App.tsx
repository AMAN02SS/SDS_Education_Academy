/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ClassExplorer } from './components/CourseList';
import { NotesAndBlogs } from './components/NotesAndBlogs';
import { CourseDetail } from './components/CourseDetail';
import { AllNotes } from './components/AllNotes';
import { AllBlogs } from './components/AllBlogs';
import { BlogDetail } from './components/BlogDetail';
import { ContentExplorer } from './components/ContentExplorer';
import { AllNCERT } from './components/AllNCERT';
import { AllQuizzes } from './components/AllQuizzes';
import { Forum } from './components/Forum';
import { AuthPage } from './components/AuthPage';
import { AboutPage } from './components/AboutPage';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminPanel } from './components/admin/AdminPanel';
import { AdminRoute } from './components/AdminRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Onboarding } from './components/Onboarding';
import { AIChatBot } from './components/AIChatBot';
import { useAuth } from './contexts/AuthContext';
import { db } from './firebase';
import { doc, getDocFromServer } from 'firebase/firestore';
import { motion } from 'motion/react';
import { MessageSquare, Github, Twitter, Linkedin, Mail, ArrowRight } from 'lucide-react';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const HomePage = () => (
  <>
    <Hero />
    <ClassExplorer />
    <NotesAndBlogs />
    
    {/* Community Section Preview */}
    <section className="py-32 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="rounded-[3rem] bg-secondary p-12 md:p-24 overflow-hidden relative shadow-2xl"
        >
          <div className="relative z-10 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-display font-extrabold text-white sm:text-6xl leading-tight">
                Join our thriving <span className="text-primary">community</span>
              </h2>
              <p className="mt-8 text-xl text-slate-300 leading-relaxed">
                Get help with your homework, share study notes, and learn together with thousands of students across all grades.
              </p>
              <div className="mt-12 flex items-center gap-6">
                <Link to="/forum" className="group rounded-2xl bg-primary px-8 py-4 font-bold text-white shadow-xl shadow-primary/30 hover:bg-primary-dark transition-all flex items-center gap-3 active:scale-95">
                  <MessageSquare size={24} />
                  Go to Study Forum
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </motion.div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 h-[30rem] w-[30rem] rounded-full bg-primary/20 blur-[100px]" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/4 h-[20rem] w-[20rem] rounded-full bg-accent/10 blur-[80px]" />
        </motion.div>
      </div>
    </section>
    
    <AIChatBot />
  </>
);

// Test Firestore connection on boot
const testFirebaseConnection = async () => {
  try {
    await getDocFromServer(doc(db, '_internal', 'connectivity_check'));
    console.log("Firebase Connectivity: Online");
  } catch (error: any) {
    if (error?.message?.includes('offline')) {
      console.warn("Firebase Connectivity: Client appears to be offline or blocked.");
    } else {
      console.error("Firebase Connectivity Error:", error);
    }
  }
};

const AppContent = () => {
  const { user, profile, loading } = useAuth();
  
  useEffect(() => {
    testFirebaseConnection();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-mesh flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-16 w-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-secondary font-bold animate-pulse">Loading Academy...</p>
        </div>
      </div>
    );
  }

  const needsOnboarding = user && profile && profile.onboardingCompleted === false;

  return (
    <Router>
      <ScrollToTop />
      {needsOnboarding && <Onboarding />}
      <div className="min-h-screen flex flex-col bg-mesh">
          <Navbar />
          <main className="flex-grow">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/about" element={<AboutPage />} />
                
                {/* Protected Routes */}
                <Route path="/course/:id" element={<ProtectedRoute><CourseDetail /></ProtectedRoute>} />
                <Route path="/notes" element={<ProtectedRoute><AllNotes /></ProtectedRoute>} />
                <Route path="/blogs" element={<ProtectedRoute><AllBlogs /></ProtectedRoute>} />
                <Route path="/blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
                <Route path="/videos" element={<ProtectedRoute><ContentExplorer type="videos" /></ProtectedRoute>} />
                <Route path="/quizzes" element={<ProtectedRoute><AllQuizzes /></ProtectedRoute>} />
                <Route path="/forum" element={<ProtectedRoute><Forum /></ProtectedRoute>} />
                <Route path="/ncert" element={<ProtectedRoute><AllNCERT /></ProtectedRoute>} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
              </Routes>
            </ErrorBoundary>
          </main>

          <footer className="bg-secondary text-slate-400 py-20 border-t border-white/5">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-primary/20 bg-secondary">
                    <img 
                      src="/logo.png" 
                      alt="SDS Education Academy Logo" 
                      className="h-full w-full object-contain"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex h-full w-full flex-col items-center justify-center bg-secondary leading-none">
                              <span class="text-[10px] font-black text-primary tracking-tighter">SDS</span>
                              <span class="text-[6px] font-bold text-white uppercase">Academy</span>
                            </div>
                          `;
                        }
                      }}
                    />
                  </div>
                  <span className="text-xl font-display font-bold text-white">
                    SDS Education <span className="text-primary">Academy</span>
                  </span>
                </div>
                <p className="max-w-sm text-sm leading-relaxed">
                  Empowering students from Class 1 to 12 with high-quality, accessible video lessons and study materials. Join us and excel in your academics.
                </p>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Learning</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/videos" className="hover:text-primary transition-colors">Subject Videos</Link></li>
                  <li><Link to="/quizzes" className="hover:text-primary transition-colors">Concept Quizzes</Link></li>
                  <li><Link to="/ncert" className="hover:text-primary transition-colors">NCERT Solutions</Link></li>
                  <li><Link to="/notes" className="hover:text-primary transition-colors">Study Notes</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">More</h4>
                <ul className="space-y-4 text-sm font-medium">
                  <li><Link to="/about" className="hover:text-primary transition-all">About SDS Academy</Link></li>
                  <li><Link to="/blogs" className="hover:text-primary transition-colors">Educational Blogs</Link></li>
                  <li><Link to="/forum" className="hover:text-primary transition-colors">Study Forum</Link></li>
                  <li><Link to="/auth" className="hover:text-primary transition-colors">Student Login</Link></li>
                </ul>
              </div>
              <div>
                <h4 className="text-white font-bold mb-6">Connect</h4>
                <div className="flex gap-4">
                  <a href="https://github.com/SDS-Academy" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-all">
                    <Github size={20} />
                  </a>
                  <a href="https://twitter.com/SDS_Academy" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-all">
                    <Twitter size={20} />
                  </a>
                  <a href="https://linkedin.com/company/sds-academy" target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-all">
                    <Linkedin size={20} />
                  </a>
                  <a href="mailto:s.d.s.educationacademy@gmail.com" className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-primary hover:text-white transition-all">
                    <Mail size={20} />
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-slate-800 text-xs text-center">
              <p>© 2026 SDS Education Academy. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


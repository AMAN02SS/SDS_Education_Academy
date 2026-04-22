import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  LayoutDashboard, 
  Video, 
  FileText, 
  MessageSquare, 
  MessageCircle,
  Trophy, 
  BookOpen, 
  Settings,
  Plus,
  Search,
  Edit2,
  Trash2,
  ChevronRight,
  MoreVertical
} from 'lucide-react';
import { ManageSubjects } from './ManageSubjects';
import { ManageNotes } from './ManageNotes';
import { ManageBlogs } from './ManageBlogs';
import { ManageQuizzes } from './ManageQuizzes';
import { ManageNCERT } from './ManageNCERT';
import { DashboardInsights } from './DashboardInsights';
import { ManageComments } from './ManageComments';

type AdminTab = 'dashboard' | 'subjects' | 'notes' | 'blogs' | 'quizzes' | 'ncert' | 'comments';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'Videos & Subjects', icon: Video },
    { id: 'notes', label: 'Study Notes', icon: FileText },
    { id: 'blogs', label: 'Blogs', icon: MessageSquare },
    { id: 'quizzes', label: 'Quizzes', icon: Trophy },
    { id: 'ncert', label: 'NCERT Solutions', icon: BookOpen },
    { id: 'comments', label: 'Comments', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex pt-20">
      {/* Sidebar for Desktop */}
      <aside className="w-64 bg-white border-r border-slate-200 fixed h-full left-0 overflow-y-auto hidden lg:block z-10">
        <div className="p-6">
          <h2 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Admin Console</h2>
          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-secondary'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-4 md:p-8 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto">
          {/* Mobile Navigation Dropdown */}
          <div className="lg:hidden mb-6">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 block">Admin Menu</label>
            <div className="relative">
              <select 
                value={activeTab}
                onChange={(e) => setActiveTab(e.target.value as AdminTab)}
                className="w-full appearance-none bg-white border border-slate-200 px-4 py-3 rounded-xl font-bold text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 pr-10 shadow-sm"
              >
                {menuItems.map((item) => (
                  <option key={item.id} value={item.id}>{item.label}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                <ChevronRight size={20} className="rotate-90" />
              </div>
            </div>
          </div>

          <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-display font-extrabold text-secondary">
                {menuItems.find(i => i.id === activeTab)?.label}
              </h1>
              <p className="text-slate-500 mt-1">Manage and organize your platform content.</p>
            </div>
          </header>

          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium overflow-hidden w-full overflow-x-auto">
            {activeTab === 'dashboard' && <DashboardInsights />}
            {activeTab === 'subjects' && <ManageSubjects />}
            {activeTab === 'notes' && <ManageNotes />}
            {activeTab === 'blogs' && <ManageBlogs />}
            {activeTab === 'quizzes' && <ManageQuizzes />}
            {activeTab === 'ncert' && <ManageNCERT />}
            {activeTab === 'comments' && <ManageComments />}
          </div>
        </div>
      </main>
    </div>
  );
};

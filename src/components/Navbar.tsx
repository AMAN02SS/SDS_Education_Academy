import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signInWithGoogle, logout } from '../firebase';
import { LogIn, LogOut, BookOpen, MessageSquare, User as UserIcon, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, isAdmin } = useAuth();

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-7xl">
      <div className="bg-white/90 border border-slate-200 shadow-premium rounded-2xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl shadow-lg shadow-primary/30 bg-secondary">
            <img 
              src="/logo.png" 
              alt="SDS Education Academy Logo" 
              className="h-full w-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback to stylized text logo if image fails
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
          <span className="text-xl font-display font-extrabold tracking-tight text-secondary">
            SDS Education <span className="text-primary">Academy</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
          <Link to="/" className="hover:text-primary transition-all hover:scale-105">Home</Link>
          <Link to="/about" className="hover:text-primary transition-all hover:scale-105">About</Link>
          <Link to="/notes" className="hover:text-primary transition-all hover:scale-105">Notes</Link>
          <Link to="/blogs" className="hover:text-primary transition-all hover:scale-105">Blogs</Link>
          <Link to="#" className="hover:text-primary transition-all hover:scale-105">Forum</Link>
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-2 text-primary hover:text-primary-dark transition-all hover:scale-105">
              <Shield size={16} />
              Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {isAdmin && (
                <div className="flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-[10px] font-black text-amber-700 uppercase tracking-widest">
                  <Shield size={10} />
                  ADMIN
                </div>
              )}
              <div className="flex items-center gap-2">
                <img 
                  src={user.photoURL || `https://picsum.photos/seed/${user.uid}/40/40`} 
                  alt={user.displayName || 'User'} 
                  className="h-9 w-9 rounded-full border-2 border-primary/20 p-0.5"
                  referrerPolicy="no-referrer"
                />
                <button 
                  onClick={logout}
                  className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"
                  title="Logout"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={signInWithGoogle}
              className="relative group overflow-hidden rounded-xl bg-secondary px-6 py-2.5 text-sm font-bold text-white shadow-xl shadow-secondary/20 transition-all active:scale-95"
            >
              <span className="relative z-10 flex items-center gap-2">
                <LogIn size={18} />
                Sign In
              </span>
              <div className="absolute inset-0 bg-linear-to-r from-primary to-primary-dark opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

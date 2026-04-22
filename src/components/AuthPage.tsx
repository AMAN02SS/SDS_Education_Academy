import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { signInWithGoogle, resetPassword, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, auth } from '../firebase';
import { LogIn, UserPlus, ArrowRight, Mail, Lock, User as UserIcon, RefreshCw, KeyRound, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpStep, setOtpStep] = useState<'request' | 'verify'>('request');
  const [resetSent, setResetSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = (location.state as any)?.from?.pathname || "/";

  if (user && !loading) {
    return <Navigate to={from} replace />;
  }

  const handleGoogleSignIn = async () => {
    setLoadingAction(true);
    try {
      await signInWithGoogle();
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Sign in failed:", error);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleManualAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingAction(true);

    try {
      if (isLogin) {
        // Login
        await signInWithEmailAndPassword(auth, email, password);
        navigate(from, { replace: true });
      } else {
        // Signup
        if (otpStep === 'request') {
          if (!fullName || !email || !password) {
            setError("All fields are required.");
            setLoadingAction(false);
            return;
          }
          if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            setLoadingAction(false);
            return;
          }
          
          // Request OTP from server
          const response = await fetch('/api/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
          });
          
          const result = await response.json();
          if (!response.ok) {
            throw new Error(result.error || "Failed to send OTP");
          }
          
          setOtpStep('verify');
        } else {
          // Verify OTP and complete signup
          const verifyRes = await fetch('/api/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp })
          });
          
          const verifyResult = await verifyRes.json();
          if (!verifyRes.ok) {
            throw new Error(verifyResult.error || "Invalid OTP");
          }

          // OTP is verified, create Firebase user
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          await updateProfile(userCredential.user, { displayName: fullName });
          navigate(from, { replace: true });
        }
      }
    } catch (err: any) {
      console.error("Auth Error:", err);
      let msg = err.message || "An unexpected error occurred.";
      if (msg.includes('auth/invalid-credential')) msg = "Invalid email or password.";
      if (msg.includes('auth/email-already-in-use')) msg = "This email is already registered.";
      setError(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoadingAction(true);
    if (!email) {
      setError("Please enter your email address.");
      setLoadingAction(false);
      return;
    }
    try {
      await resetPassword(email);
      setResetSent(true);
    } catch (err: any) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-24 bg-mesh flex items-center justify-center px-6">
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 blur-[120px] rounded-full" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-[3rem] p-8 md:p-12 shadow-premium border border-white relative overflow-hidden">
          <div className="text-center mb-10">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary text-white shadow-xl mb-6">
              {isForgotPassword ? <RefreshCw size={32} /> : (isLogin ? <LogIn size={32} /> : (otpStep === 'verify' ? <ShieldCheck size={32} className="text-emerald-400" /> : <UserPlus size={32} />))}
            </div>
            <h1 className="text-3xl font-display font-extrabold text-secondary">
              {isForgotPassword ? 'Reset Password' : (isLogin ? 'Welcome Back' : (otpStep === 'verify' ? 'Verify OTP' : 'Create Account'))}
            </h1>
            <p className="text-slate-500 mt-2 font-medium">
              {isForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : (isLogin ? 'Sign in to continue your learning journey' : (otpStep === 'verify' ? 'We sent a 6-digit code to your email' : 'Join SDS Academy and start learning today'))}
            </p>
          </div>

          <div className="space-y-4">
            {!isForgotPassword && otpStep === 'request' && (
              <>
                <button 
                  onClick={handleGoogleSignIn}
                  disabled={loadingAction}
                  className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-2xl bg-white border border-slate-200 font-bold text-secondary hover:bg-slate-50 hover:border-primary/20 transition-all shadow-sm active:scale-[0.98] disabled:opacity-50"
                >
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/layout/google.svg" alt="Google" className="h-5 w-5" />
                  Continue with Google
                </button>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100"></div></div>
                  <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-4 text-slate-400 font-black tracking-widest">Or with email</span></div>
                </div>
              </>
            )}

            {resetSent ? (
               <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100 text-center">
                 <p className="text-emerald-700 font-bold mb-4">Reset link sent! Check your inbox.</p>
                 <button 
                   onClick={() => { setIsForgotPassword(false); setResetSent(false); }}
                   className="text-sm font-bold text-primary hover:underline"
                 >
                   Back to Login
                 </button>
               </div>
            ) : (
              <form className="space-y-4" onSubmit={isForgotPassword ? handleResetPassword : handleManualAuth}>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 text-red-500 rounded-xl text-xs font-bold text-center border border-red-100"
                  >
                    {error}
                  </motion.div>
                )}
                
                {!isLogin && !isForgotPassword && otpStep === 'request' && (
                  <div className="relative">
                    <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="Full Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}
                
                {!isForgotPassword && otpStep === 'request' && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}

                {isForgotPassword && (
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="email" 
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}

                {!isForgotPassword && !isLogin && otpStep === 'verify' && (
                  <div className="relative">
                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="text" 
                      placeholder="6-Digit OTP"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all text-center tracking-[0.5em] text-lg font-bold"
                    />
                  </div>
                )}

                {!isForgotPassword && otpStep === 'request' && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="w-full pl-12 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>
                )}

                {isLogin && !isForgotPassword && (
                  <div className="text-right">
                    <button 
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-bold text-slate-400 hover:text-primary transition-colors"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={loadingAction}
                  className="w-full py-4 rounded-2xl bg-secondary text-white font-bold shadow-xl shadow-secondary/20 hover:bg-slate-800 transition-all flex items-center justify-center gap-2 group active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingAction ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <RefreshCw size={20} />
                    </motion.div>
                  ) : (
                    <>
                      {isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : (otpStep === 'request' ? 'Send OTP Verification' : 'Verify & Sign Up'))}
                      <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                {!isLogin && otpStep === 'verify' && (
                  <button 
                    type="button"
                    onClick={() => { setOtpStep('request'); setOtp(''); }}
                    className="w-full text-xs font-bold text-slate-400 hover:text-secondary p-2 transition-colors"
                  >
                    Resend Code or Edit Email
                  </button>
                )}
              </form>
            )}
          </div>

          <div className="mt-8 text-center space-y-2">
            {!isForgotPassword && otpStep === 'request' ? (
              <button 
                onClick={() => { setIsLogin(!isLogin); setError(null); }}
                className="text-sm font-bold text-slate-400 hover:text-primary transition-colors"
              >
                {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
              </button>
            ) : (
              !isForgotPassword && otpStep === 'verify' ? null : (
                <button 
                  onClick={() => { setIsForgotPassword(false); setIsLogin(true); setError(null); }}
                  className="text-sm font-bold text-slate-400 hover:text-primary transition-colors"
                >
                  Back to Login
                </button>
              )
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

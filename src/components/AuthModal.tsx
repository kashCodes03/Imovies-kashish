import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Phone, Sparkles, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthModal: React.FC = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMode, login, register, quickDemoLogin, showToast } = useAuth();
  
  const [isLoginTab, setIsLoginTab] = useState(authModalMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isAuthModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);
    try {
      if (isLoginTab) {
        await login(email, password);
      } else {
        await register(name, email, password, phone);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Kicker */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>IMovies Cinema Experience</span>
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {isLoginTab ? 'Sign In to Your Account' : 'Create an IMovies Account'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {isLoginTab
              ? 'Access reserved tickets, seat locks, and personalized preferences.'
              : 'Join to reserve seats in real time and receive digital ticket passes.'}
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(true);
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              isLoginTab ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLoginTab(false);
              setErrorMessage('');
            }}
            className={`flex-1 py-2 rounded-lg transition-colors ${
              !isLoginTab ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mb-4 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {!isLoginTab && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sarah Jenkins"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sarah@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {!isLoginTab && (
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Phone Number</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-400 mb-1 font-medium">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-50 text-slate-950 font-bold text-xs transition-colors shadow-md mt-2"
          >
            {isSubmitting ? 'Authenticating...' : isLoginTab ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* 1-Click Instant Demo Credentials */}
        <div className="mt-6 pt-5 border-t border-slate-800 text-xs">
          <span className="text-[11px] text-slate-500 uppercase font-semibold block text-center mb-2.5">
            Quick Reviewer One-Click Access
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => quickDemoLogin('user')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-white flex items-center gap-1.5">
                <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                Regular Guest
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate">user@imovies.com</span>
            </button>

            <button
              type="button"
              onClick={() => quickDemoLogin('admin')}
              className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-left transition-colors flex flex-col"
            >
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Cinema Director
              </span>
              <span className="text-[10px] text-slate-500 mt-0.5 truncate">admin@imovies.com</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

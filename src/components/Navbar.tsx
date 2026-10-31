import React, { useState } from 'react';
import { Film, User, LogOut, Shield, Ticket, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface NavbarProps {
  currentView: 'home' | 'theatres' | 'bookings' | 'admin';
  onNavigate: (view: 'home' | 'theatres' | 'bookings' | 'admin') => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedCity,
  onSelectCity
}) => {
  const { user, openAuthModal, logout, quickDemoLogin } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        
        {/* Zone 1: Single text wordmark */}
        <button
          onClick={() => onNavigate('home')}
          className="text-xl font-bold tracking-tight text-white hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-2"
        >
          <Film className="w-5 h-5 text-amber-400" />
          <span>IMOVIES</span>
        </button>

        {/* Zone 2: 4-5 concise single-line nav links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <button
            onClick={() => onNavigate('home')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'home' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Now Showing
          </button>
          <button
            onClick={() => onNavigate('theatres')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'theatres' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            Cinemas
          </button>
          <button
            onClick={() => onNavigate('bookings')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'bookings' ? 'text-amber-400 font-semibold' : 'hover:text-white'
            }`}
          >
            My Reservations
          </button>
          {user?.role === 'admin' ? (
            <button
              onClick={() => onNavigate('admin')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'admin' ? 'text-amber-400 font-semibold' : 'hover:text-white'
              }`}
            >
              Cinema Admin
            </button>
          ) : (
            <button
              onClick={() => {
                quickDemoLogin('admin');
                onNavigate('admin');
              }}
              className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap shrink-0"
              title="Switch to Cinema Admin console"
            >
              Admin Mode
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Quick city picker */}
          <div className="hidden sm:flex items-center text-xs text-slate-400 border border-slate-800 rounded-lg bg-slate-900/60 px-2.5 py-1.5">
            <span className="text-slate-500 mr-1.5">City:</span>
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="bg-transparent text-slate-200 focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900 text-slate-100">All Cities</option>
              <option value="New York" className="bg-slate-900 text-slate-100">New York</option>
              <option value="Los Angeles" className="bg-slate-900 text-slate-100">Los Angeles</option>
              <option value="Chicago" className="bg-slate-900 text-slate-100">Chicago</option>
              <option value="San Francisco" className="bg-slate-900 text-slate-100">San Francisco</option>
            </select>
          </div>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-200 transition-colors whitespace-nowrap shrink-0"
              >
                <div className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline max-w-[100px] truncate">{user.name}</span>
                {user.role === 'admin' && (
                  <span className="text-[10px] text-amber-400 font-semibold tracking-wider uppercase">Admin</span>
                )}
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl py-2 z-50 text-xs">
                  <div className="px-3 py-2 border-b border-slate-800 text-slate-400">
                    <div className="font-semibold text-white">{user.name}</div>
                    <div className="truncate text-slate-500">{user.email}</div>
                  </div>

                  <button
                    onClick={() => {
                      onNavigate('bookings');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Ticket className="w-4 h-4 text-slate-400" />
                    <span>My Tickets</span>
                  </button>

                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        onNavigate('admin');
                        setIsUserMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-amber-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                    >
                      <Shield className="w-4 h-4 text-amber-400" />
                      <span>Admin Management</span>
                    </button>
                  )}

                  <div className="border-t border-slate-800 my-1" />

                  <button
                    onClick={() => {
                      quickDemoLogin(user.role === 'admin' ? 'user' : 'admin');
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Switch to {user.role === 'admin' ? 'Regular Guest' : 'Admin'}</span>
                  </button>

                  <button
                    onClick={() => {
                      logout();
                      setIsUserMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-rose-400 hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 rounded-lg hover:bg-amber-300 transition-colors whitespace-nowrap shrink-0 shadow-sm"
              >
                Sign In
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
};

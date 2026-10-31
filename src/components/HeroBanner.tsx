import React, { useState } from 'react';
import { Play, Sparkles, Star, Clock, Ticket, Film, Globe } from 'lucide-react';
import type { Movie } from '../types/cinema';

interface HeroBannerProps {
  hollywoodMovie: Movie | null;
  bollywoodMovie: Movie | null;
  onBookNow: (movie: Movie) => void;
  onWatchTrailer?: (movie: Movie) => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  hollywoodMovie,
  bollywoodMovie,
  onBookNow,
  onWatchTrailer
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<'Hollywood' | 'Bollywood'>('Hollywood');

  const currentMovie = selectedIndustry === 'Hollywood' 
    ? (hollywoodMovie || bollywoodMovie)
    : (bollywoodMovie || hollywoodMovie);

  if (!currentMovie) return null;

  return (
    <div className="relative w-full bg-slate-950 overflow-hidden border-b border-slate-800">
      
      {/* Background Image with Cinematic Measured Scrim */}
      <div className="absolute inset-0 z-0">
        <img
          key={currentMovie.id}
          src={
            selectedIndustry === 'Hollywood'
              ? '/src/assets/images/hero_cinema_experience_1793442963810.jpg'
              : 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1600&q=80'
          }
          alt={`${currentMovie.title} Banner`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center opacity-40 scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="max-w-3xl">
          
          {/* Industry Banner Toggle Buttons */}
          <div className="flex items-center gap-2 mb-6">
            <button
              onClick={() => setSelectedIndustry('Hollywood')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                selectedIndustry === 'Hollywood'
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Film className="w-3.5 h-3.5" />
              <span>Hollywood Premiere Banner</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-950/20 text-[10px] font-mono">9.1 ★</span>
            </button>

            <button
              onClick={() => setSelectedIndustry('Bollywood')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                selectedIndustry === 'Bollywood'
                  ? 'bg-amber-400 text-slate-950 shadow-amber-400/20'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Bollywood Mega Premiere Banner</span>
              <span className="ml-1 px-1.5 py-0.2 rounded bg-slate-950/20 text-[10px] font-mono">8.8 ★</span>
            </button>
          </div>

          {/* Kicker badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {selectedIndustry === 'Hollywood' ? 'Hollywood IMAX Laser Experience' : 'Bollywood Mega Astraverse Release'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight text-balance mb-4">
            {currentMovie.title}
          </h1>

          {/* Clean unboxed metadata with rating prominently displayed */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-300 mb-6">
            <span className="flex items-center gap-1 text-amber-400 font-extrabold tabular-nums bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/30">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              {currentMovie.rating.toFixed(1)} / 10 IMDb
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="w-4 h-4 text-slate-400" />
              {Math.floor(currentMovie.durationMinutes / 60)}h {currentMovie.durationMinutes % 60}m
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{currentMovie.genre.join(', ')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-white font-medium">{currentMovie.language}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="border border-slate-700 px-1.5 py-0.2 rounded text-xs text-slate-300 font-mono">
              {currentMovie.ageRating}
            </span>
          </div>

          <p className="text-sm sm:text-base text-slate-300 line-clamp-3 leading-relaxed mb-8">
            {currentMovie.synopsis}
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => onBookNow(currentMovie)}
              className="px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
            >
              <Ticket className="w-4 h-4" />
              <span>Select Showtime & Reserve Seats</span>
            </button>

            <button
              onClick={() => onWatchTrailer && onWatchTrailer(currentMovie)}
              className="px-5 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-medium text-sm flex items-center gap-2 transition-all hover:text-white"
            >
              <Play className="w-4 h-4 text-amber-400 fill-amber-400" />
              <span>Watch Official Trailer</span>
            </button>
          </div>

          {/* Quick specs footnote with cast & director */}
          <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center gap-6 text-xs text-slate-400">
            <div>
              <span className="text-slate-500 block">Director</span>
              <span className="text-slate-200 font-medium">{currentMovie.director}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block">Starring</span>
              <span className="text-slate-200 font-medium">{currentMovie.cast.slice(0, 3).join(', ')}</span>
            </div>
            <div className="h-6 w-px bg-slate-800" />
            <div>
              <span className="text-slate-500 block">Screen Formats</span>
              <span className="text-slate-200 font-medium">IMAX Laser 3D · Dolby Atmos 7.1</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

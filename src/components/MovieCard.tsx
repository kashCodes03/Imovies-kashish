import React, { useState } from 'react';
import { Star, Clock, Ticket, Film, Play } from 'lucide-react';
import type { Movie } from '../types/cinema';

interface MovieCardProps {
  movie: Movie;
  onSelectMovie: (movie: Movie) => void;
  onBookTickets: (movie: Movie) => void;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSelectMovie,
  onBookTickets
}) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group flex flex-col bg-slate-900/80 border border-slate-800/90 rounded-2xl overflow-hidden hover:border-slate-700 hover:-translate-y-1 transition-all duration-200 shadow-lg shadow-black/40">
      
      {/* Poster Image Container */}
      <div 
        onClick={() => onSelectMovie(movie)}
        className="relative aspect-[3/4] w-full overflow-hidden bg-slate-950 cursor-pointer"
      >
        {!imgError ? (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            onError={() => setImgError(true)}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500">
            <Film className="w-12 h-12 mb-2 text-slate-600" />
            <span className="text-xs text-center font-medium text-slate-400">{movie.title}</span>
          </div>
        )}

        {/* Ambient Gradient Scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80" />

        {/* Quick Industry & Age rating in top bar */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] font-mono text-slate-200">
          <span className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2 py-0.5 rounded text-[10px] font-semibold text-amber-300">
            {movie.industry}
          </span>
          <span className="bg-slate-950/85 backdrop-blur-md border border-slate-700/80 px-2 py-0.5 rounded font-bold">
            {movie.ageRating}
          </span>
        </div>

        {/* Status text & Rating on bottom overlay */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 text-amber-400 font-extrabold tabular-nums bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded border border-amber-400/30 shadow-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{movie.rating.toFixed(1)}</span>
            <span className="text-[10px] text-slate-400 font-normal">/10</span>
          </span>

          <span className="text-[11px] font-medium text-slate-300 bg-slate-950/85 backdrop-blur-md px-2 py-0.5 rounded border border-slate-800">
            {movie.status === 'now_showing' ? 'In Theatres' : 'Releasing Soon'}
          </span>
        </div>
      </div>

      {/* Card Content & Metadata */}
      <div className="p-4 flex flex-col flex-1 justify-between">
        <div>
          {/* Unboxed clean metadata with · separators */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1.5 truncate">
            <span>{movie.genre.slice(0, 2).join(' / ')}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="flex items-center gap-1 tabular-nums">
              <Clock className="w-3 h-3 text-slate-500" />
              {movie.durationMinutes}m
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>{movie.language}</span>
          </div>

          <h3 
            onClick={() => onSelectMovie(movie)}
            className="text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1 cursor-pointer"
            title={movie.title}
          >
            {movie.title}
          </h3>

          <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
            {movie.synopsis}
          </p>
        </div>

        {/* Card Action Button */}
        <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center gap-2">
          <button
            onClick={() => onBookTickets(movie)}
            className="flex-1 py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors shadow-sm active:scale-95"
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>{movie.status === 'now_showing' ? 'Book Tickets' : 'View Showtimes'}</span>
          </button>
          
          <button
            onClick={() => onSelectMovie(movie)}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title="Movie Overview & Cast"
            aria-label="View movie details"
          >
            <Play className="w-3.5 h-3.5 text-slate-400 fill-slate-400" />
          </button>
        </div>

      </div>
    </div>
  );
};

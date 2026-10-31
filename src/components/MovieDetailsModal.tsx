import React, { useEffect, useState } from 'react';
import { X, Star, Clock, Calendar, MapPin, Sparkles, Film, ArrowRight } from 'lucide-react';
import { api } from '../services/api';
import type { Movie, Show, Theatre } from '../types/cinema';

interface MovieDetailsModalProps {
  movie: Movie;
  onClose: () => void;
  onSelectShow: (show: Show) => void;
  selectedCity: string;
}

export const MovieDetailsModal: React.FC<MovieDetailsModalProps> = ({
  movie,
  onClose,
  onSelectShow,
  selectedCity
}) => {
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Available dates: Today, Tomorrow, Day After
  const todayStr = new Date().toISOString().split('T')[0];
  const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfterStr = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const [selectedDate, setSelectedDate] = useState<string>(todayStr);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [showsData, theatresData] = await Promise.all([
          api.getShows({ movieId: movie.id, date: selectedDate, city: selectedCity }),
          api.getTheatres(selectedCity)
        ]);
        setShows(showsData);
        setTheatres(theatresData);
      } catch (err) {
        console.error('Error fetching shows for movie:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [movie.id, selectedDate, selectedCity]);

  // Group shows by theatre
  const showsByTheatre = theatres.map((theatre) => {
    const theatreShows = shows.filter((s) => s.theatreId === theatre.id);
    return {
      theatre,
      shows: theatreShows
    };
  }).filter((group) => group.shows.length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-slate-950/80 hover:bg-slate-850 text-slate-400 hover:text-white border border-slate-800 transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Banner Backdrop */}
        <div className="relative h-64 sm:h-72 w-full overflow-hidden bg-slate-950">
          <img
            src={movie.bannerUrl || movie.posterUrl}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-center opacity-40 scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/60 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end gap-6">
            <div className="hidden sm:block w-32 shrink-0 aspect-[3/4] rounded-xl overflow-hidden border-2 border-slate-700 shadow-2xl bg-slate-950">
              <img
                src={movie.posterUrl}
                alt={movie.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{movie.status === 'now_showing' ? 'Currently In Theatres' : 'Coming Soon'}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white text-balance">
                {movie.title}
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1 text-amber-400 font-bold tabular-nums">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  {movie.rating.toFixed(1)} / 10
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 tabular-nums">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {Math.floor(movie.durationMinutes / 60)}h {movie.durationMinutes % 60}m
                </span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span>{movie.genre.join(', ')}</span>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="border border-slate-700 px-1.5 py-0.2 rounded font-mono">
                  {movie.ageRating}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6">
          
          {/* Synopsis & Cast details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-6 border-b border-slate-800">
            <div className="md:col-span-2">
              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Synopsis
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed">
                {movie.synopsis}
              </p>
            </div>
            <div className="space-y-3 text-xs bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <div>
                <span className="text-slate-500 block mb-0.5">Director</span>
                <span className="text-slate-200 font-semibold">{movie.director}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Key Cast</span>
                <span className="text-slate-200">{movie.cast.join(', ')}</span>
              </div>
              <div>
                <span className="text-slate-500 block mb-0.5">Language</span>
                <span className="text-slate-200 font-medium">{movie.language}</span>
              </div>
            </div>
          </div>

          {/* Showtimes Scheduling Section */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-400" />
                  <span>Select Date & Showtimes</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pick a cinema and preferred showtime to enter real-time seat selection.
                </p>
              </div>

              {/* Date selection pill tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl self-start">
                <button
                  onClick={() => setSelectedDate(todayStr)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedDate === todayStr ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Today ({new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                </button>
                <button
                  onClick={() => setSelectedDate(tomorrowStr)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedDate === tomorrowStr ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Tomorrow
                </button>
                <button
                  onClick={() => setSelectedDate(dayAfterStr)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    selectedDate === dayAfterStr ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {new Date(Date.now() + 172800000).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </button>
              </div>
            </div>

            {/* List of Theatres and their showtimes */}
            {isLoading ? (
              <div className="py-12 text-center text-sm text-slate-400 animate-pulse">
                Checking live cinema schedules...
              </div>
            ) : showsByTheatre.length === 0 ? (
              <div className="py-8 px-6 text-center rounded-2xl bg-slate-950/50 border border-slate-800 text-slate-400 text-sm">
                <Film className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p>No showtimes scheduled for this date in {selectedCity === 'All' ? 'the selected cinemas' : selectedCity}.</p>
                <p className="text-xs text-slate-500 mt-1">Try selecting another date or viewing all cities.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {showsByTheatre.map(({ theatre, shows }) => (
                  <div
                    key={theatre.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700/80 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>{theatre.name}</span>
                        </h4>
                        <span className="text-xs text-slate-400">{theatre.address}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400">
                        {theatre.amenities.slice(0, 2).map((amenity, i) => (
                          <span key={i} className="text-slate-400 font-medium">· {amenity}</span>
                        ))}
                      </div>
                    </div>

                    {/* Show buttons */}
                    <div className="flex flex-wrap items-center gap-2.5">
                      {shows.map((show) => (
                        <button
                          key={show.id}
                          onClick={() => onSelectShow(show)}
                          className="group relative flex flex-col items-start p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-400 hover:bg-slate-850 transition-all text-left shadow-sm active:scale-95"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                              {show.showTime}
                            </span>
                            <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20">
                              {show.format}
                            </span>
                          </div>
                          
                          <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                            <span>from ${show.pricing.standard.toFixed(2)}</span>
                            <span aria-hidden="true" className="text-slate-600">·</span>
                            <span className="text-emerald-400 font-medium tabular-nums">
                              {show.availableSeatsCount} left
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

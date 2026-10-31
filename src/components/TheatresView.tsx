import React, { useEffect, useState } from 'react';
import { MapPin, Film, Sparkles, Clock, Ticket } from 'lucide-react';
import { api } from '../services/api';
import type { Movie, Show, Theatre } from '../types/cinema';

interface TheatresViewProps {
  selectedCity: string;
  onSelectShow: (show: Show) => void;
  onBookMovie: (movie: Movie) => void;
}

export const TheatresView: React.FC<TheatresViewProps> = ({
  selectedCity,
  onSelectShow,
  onBookMovie
}) => {
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      try {
        const [theatresData, showsData, moviesData] = await Promise.all([
          api.getTheatres(selectedCity),
          api.getShows({ city: selectedCity }),
          api.getMovies()
        ]);
        setTheatres(theatresData);
        setShows(showsData);
        setMovies(moviesData);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [selectedCity]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>IMovies Cinema Venues & Screening Halls</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Cinemas {selectedCity !== 'All' ? `in ${selectedCity}` : 'Across Nationwide Locations'}
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Equipped with IMAX Laser dual projection, Dolby Atmos acoustic spatial sound, and luxury heated recliners.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
          Loading cinemas & scheduled formats...
        </div>
      ) : theatres.length === 0 ? (
        <div className="py-16 text-center text-slate-400 text-sm">
          No cinemas found for the selected city.
        </div>
      ) : (
        <div className="space-y-8">
          {theatres.map((theatre) => {
            const theatreShows = shows.filter((s) => s.theatreId === theatre.id);
            // Unique movies playing in this theatre
            const uniqueMovieIds = Array.from(new Set(theatreShows.map((s) => s.movieId)));
            const playingMovies = movies.filter((m) => uniqueMovieIds.includes(m.id));

            return (
              <div
                key={theatre.id}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl"
              >
                {/* Theatre Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-800">
                  <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
                      <span>{theatre.name}</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      {theatre.address} ({theatre.city})
                    </p>
                    
                    {/* Screens list */}
                    <div className="flex flex-wrap items-center gap-2 mt-3 text-xs">
                      <span className="text-slate-500 font-medium">Screens:</span>
                      {theatre.screens.map((screen) => (
                        <span
                          key={screen.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px]"
                        >
                          {screen.name} · {screen.format} ({screen.totalSeats} seats)
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="flex flex-wrap items-center gap-1.5 self-start">
                    {theatre.amenities.map((amenity, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium text-amber-300 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                </div>

                {/* What's Showing Here */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
                    <Film className="w-4 h-4 text-amber-400" />
                    <span>Now Screening at this Venue</span>
                  </h3>

                  {playingMovies.length === 0 ? (
                    <div className="text-xs text-slate-500 py-4">
                      No active showtimes currently scheduled for this location today.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {playingMovies.map((movie) => {
                        const movieShows = theatreShows.filter((s) => s.movieId === movie.id);

                        return (
                          <div
                            key={movie.id}
                            className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 flex gap-4 hover:border-slate-700 transition-colors"
                          >
                            <div className="w-16 aspect-[3/4] rounded-lg overflow-hidden bg-slate-900 shrink-0">
                              <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>

                            <div className="flex-1 space-y-2">
                              <div>
                                <h4 className="text-sm font-bold text-white line-clamp-1">
                                  {movie.title}
                                </h4>
                                <div className="text-xs text-slate-400">
                                  {movie.durationMinutes}m · {movie.genre[0]} · {movie.language}
                                </div>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {movieShows.map((show) => (
                                  <button
                                    key={show.id}
                                    onClick={() => onSelectShow(show)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-amber-400 font-bold hover:border-amber-400 transition-all active:scale-95 flex items-center gap-1"
                                  >
                                    <Clock className="w-3 h-3 text-slate-400" />
                                    <span>{show.showTime}</span>
                                    <span className="text-[10px] font-mono text-slate-400 font-normal">
                                      ({show.format})
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

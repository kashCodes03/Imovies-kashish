import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { HeroBanner } from './components/HeroBanner';
import { MovieFilters } from './components/MovieFilters';
import { MovieCard } from './components/MovieCard';
import { MovieDetailsModal } from './components/MovieDetailsModal';
import { SeatBookingModal } from './components/SeatBookingModal';
import { TicketPassModal } from './components/TicketPassModal';
import { UserBookingsModal } from './components/UserBookingsModal';
import { AdminPanel } from './components/AdminPanel';
import { TheatresView } from './components/TheatresView';
import { AuthModal } from './components/AuthModal';
import { ToastContainer } from './components/ToastContainer';
import { api } from './services/api';
import type { Booking, Movie, Show } from './types/cinema';
import { Film, Sparkles, X, Play } from 'lucide-react';

function CinemaApp() {
  const { user } = useAuth();
  
  // Navigation & View
  const [currentView, setCurrentView] = useState<'home' | 'theatres' | 'bookings' | 'admin'>('home');
  const [selectedCity, setSelectedCity] = useState<string>('All');

  // Movies & Filter State
  const [movies, setMovies] = useState<Movie[]>([]);
  const [isLoadingMovies, setIsLoadingMovies] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedIndustry, setSelectedIndustry] = useState<'All' | 'Hollywood' | 'Bollywood'>('All');
  const [selectedGenre, setSelectedGenre] = useState<string>('All');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'now_showing' | 'coming_soon' | 'all'>('now_showing');

  // Active Modals & Selected Entities
  const [activeMovieForDetails, setActiveMovieForDetails] = useState<Movie | null>(null);
  const [activeShowForBooking, setActiveShowForBooking] = useState<Show | null>(null);
  const [activeBookingForTicket, setActiveBookingForTicket] = useState<Booking | null>(null);
  const [isBookingsModalOpen, setIsBookingsModalOpen] = useState<boolean>(false);
  const [activeTrailerMovie, setActiveTrailerMovie] = useState<Movie | null>(null);

  // Load Movies
  const fetchMovies = async () => {
    setIsLoadingMovies(true);
    try {
      const data = await api.getMovies();
      setMovies(data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    } finally {
      setIsLoadingMovies(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  // Filter Logic
  const filteredMovies = movies.filter((movie) => {
    if (selectedIndustry !== 'All' && movie.industry !== selectedIndustry) {
      return false;
    }
    if (selectedStatus !== 'all' && movie.status !== selectedStatus) {
      return false;
    }
    if (selectedGenre !== 'All' && !movie.genre.some((g) => g.toLowerCase() === selectedGenre.toLowerCase())) {
      return false;
    }
    if (selectedLanguage !== 'All' && movie.language.toLowerCase() !== selectedLanguage.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const inTitle = movie.title.toLowerCase().includes(q);
      const inDirector = movie.director.toLowerCase().includes(q);
      const inCast = movie.cast.some((c) => c.toLowerCase().includes(q));
      if (!inTitle && !inDirector && !inCast) return false;
    }
    return true;
  });

  // Featured Hollywood and Bollywood Premiere Movies
  const hollywoodMovie = movies.find((m) => m.industry === 'Hollywood' && m.featured) || movies.find((m) => m.industry === 'Hollywood') || movies[0] || null;
  const bollywoodMovie = movies.find((m) => m.industry === 'Bollywood' && m.featured) || movies.find((m) => m.industry === 'Bollywood') || null;

  // Handlers
  const handleBookNow = (movie: Movie) => {
    setActiveMovieForDetails(movie);
  };

  const handleSelectShowFromDetails = (show: Show) => {
    setActiveMovieForDetails(null);
    setActiveShowForBooking(show);
  };

  const handleBookingSuccess = (booking: Booking) => {
    setActiveShowForBooking(null);
    setActiveBookingForTicket(booking);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-400 selection:text-slate-950 font-sans">
      
      {/* Top Bar adhering strictly to the Top Bar Contract */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'bookings') {
            setIsBookingsModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
      />

      {/* Main Content Area based on current view */}
      <main className="flex-1">
        {currentView === 'admin' ? (
          <AdminPanel />
        ) : currentView === 'theatres' ? (
          <TheatresView
            selectedCity={selectedCity}
            onSelectShow={(show) => setActiveShowForBooking(show)}
            onBookMovie={(movie) => setActiveMovieForDetails(movie)}
          />
        ) : (
          <>
            {/* Cinematic Hollywood & Bollywood Premiere Showcase Banner */}
            <HeroBanner
              hollywoodMovie={hollywoodMovie}
              bollywoodMovie={bollywoodMovie}
              onBookNow={handleBookNow}
              onWatchTrailer={(movie) => setActiveTrailerMovie(movie)}
            />

            {/* Movie Filters Bar with Hollywood and Bollywood toggles */}
            <MovieFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedIndustry={selectedIndustry}
              onIndustryChange={setSelectedIndustry}
              selectedGenre={selectedGenre}
              onGenreChange={setSelectedGenre}
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              selectedStatus={selectedStatus}
              onStatusChange={setSelectedStatus}
              totalCount={filteredMovies.length}
            />

            {/* Movie Catalog Grid */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                    {selectedIndustry === 'Hollywood'
                      ? 'Hollywood Cinema Blockbusters'
                      : selectedIndustry === 'Bollywood'
                      ? 'Bollywood Mega Blockbusters'
                      : selectedStatus === 'now_showing'
                      ? 'Now Screening In Theatres (Hollywood & Bollywood)'
                      : selectedStatus === 'coming_soon'
                      ? 'Upcoming Blockbusters'
                      : 'All Cinema Releases'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Select any title to explore showtimes, director insights, IMDb ratings, and reserved auditorium seating.
                  </p>
                </div>
              </div>

              {isLoadingMovies ? (
                <div className="py-24 text-center text-sm text-slate-400 animate-pulse">
                  Loading films and schedule availability...
                </div>
              ) : filteredMovies.length === 0 ? (
                <div className="py-20 text-center rounded-3xl bg-slate-900/40 border border-slate-800/80 p-8 max-w-md mx-auto space-y-4">
                  <Film className="w-12 h-12 text-slate-600 mx-auto" />
                  <div className="text-base font-bold text-white">No Movies Match Your Filters</div>
                  <p className="text-xs text-slate-400">
                    Try clearing your search query or selecting a different genre.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedGenre('All');
                      setSelectedLanguage('All');
                      setSelectedStatus('all');
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredMovies.map((movie) => (
                    <MovieCard
                      key={movie.id}
                      movie={movie}
                      onSelectMovie={(m) => setActiveMovieForDetails(m)}
                      onBookTickets={(m) => handleBookNow(m)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full bg-slate-950 border-t border-slate-900 py-10 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Film className="w-4 h-4 text-amber-400" />
            <span className="font-bold text-slate-300">IMOVIES CINEMA PLATFORM</span>
            <span className="text-slate-600">·</span>
            <span>Real-Time Seat Management & Booking Architecture</span>
          </div>

          <div className="flex items-center gap-6 text-slate-400">
            <span>IMAX Laser</span>
            <span>Dolby Atmos</span>
            <span>4DX Motion</span>
            <span>256-bit Encrypted</span>
          </div>
        </div>
      </footer>

      {/* MODALS */}

      {/* Movie Details Modal */}
      {activeMovieForDetails && (
        <MovieDetailsModal
          movie={activeMovieForDetails}
          onClose={() => setActiveMovieForDetails(null)}
          onSelectShow={handleSelectShowFromDetails}
          selectedCity={selectedCity}
        />
      )}

      {/* Interactive Seating & Real-Time Lock Reservation Modal */}
      {activeShowForBooking && (
        <SeatBookingModal
          show={activeShowForBooking}
          onClose={() => setActiveShowForBooking(null)}
          onBookingSuccess={handleBookingSuccess}
        />
      )}

      {/* Digital Ticket Pass Modal */}
      {activeBookingForTicket && (
        <TicketPassModal
          booking={activeBookingForTicket}
          onClose={() => setActiveBookingForTicket(null)}
        />
      )}

      {/* User Reservations History Modal */}
      {isBookingsModalOpen && (
        <UserBookingsModal
          onClose={() => setIsBookingsModalOpen(false)}
          onOpenTicket={(b) => setActiveBookingForTicket(b)}
        />
      )}

      {/* Trailer Modal */}
      {activeTrailerMovie && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl p-6 text-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold">
                <Play className="w-4 h-4 fill-amber-400" />
                <span>Trailer Preview · {activeTrailerMovie.title}</span>
              </div>
              <button
                onClick={() => setActiveTrailerMovie(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-slate-800">
              <img
                src={activeTrailerMovie.bannerUrl || activeTrailerMovie.posterUrl}
                alt={activeTrailerMovie.title}
                className="w-full h-full object-cover opacity-60"
              />
              <div className="absolute inset-0 bg-slate-950/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center mb-4 shadow-xl">
                  <Play className="w-8 h-8 fill-slate-950 translate-x-0.5" />
                </div>
                <h4 className="text-xl font-bold text-white mb-2">{activeTrailerMovie.title}</h4>
                <p className="text-xs text-slate-300 max-w-md line-clamp-3">
                  {activeTrailerMovie.synopsis}
                </p>
                <button
                  onClick={() => {
                    setActiveTrailerMovie(null);
                    handleBookNow(activeTrailerMovie);
                  }}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
                >
                  Book Tickets For This Film
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Authentication Modal */}
      <AuthModal />

      {/* Global Toast Container */}
      <ToastContainer />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CinemaApp />
    </AuthProvider>
  );
}

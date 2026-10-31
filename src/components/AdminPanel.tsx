import React, { useEffect, useState } from 'react';
import { 
  Shield, 
  Film, 
  Calendar, 
  BarChart3, 
  Plus, 
  Trash2, 
  Edit3, 
  Clock, 
  DollarSign, 
  Users, 
  MapPin, 
  Sparkles,
  Search,
  CheckCircle2,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { AdminAnalytics, Booking, Movie, Show, Theatre } from '../types/cinema';

export const AdminPanel: React.FC = () => {
  const { user, showToast } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'analytics' | 'movies' | 'shows' | 'bookings'>('analytics');
  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [shows, setShows] = useState<Show[]>([]);
  const [theatres, setTheatres] = useState<Theatre[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Movie Form Modal State
  const [isMovieModalOpen, setIsMovieModalOpen] = useState(false);
  const [editingMovieId, setEditingMovieId] = useState<string | null>(null);
  const [movieForm, setMovieForm] = useState({
    title: '',
    genre: 'Sci-Fi, Action',
    language: 'English',
    durationMinutes: 120,
    rating: 8.5,
    releaseDate: new Date().toISOString().split('T')[0],
    synopsis: '',
    director: '',
    cast: 'Actor One, Actor Two',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
    bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80',
    ageRating: 'PG-13' as Movie['ageRating'],
    status: 'now_showing' as Movie['status'],
    industry: 'Hollywood' as Movie['industry']
  });

  // Schedule Show Modal State
  const [isShowModalOpen, setIsShowModalOpen] = useState(false);
  const [showForm, setShowForm] = useState({
    movieId: '',
    theatreId: '',
    screenId: '',
    screenName: '',
    format: 'IMAX Laser',
    showDate: new Date().toISOString().split('T')[0],
    showTime: '17:30',
    standardPrice: 16.50,
    premiumPrice: 21.00,
    vipPrice: 28.50,
    totalSeats: 120
  });

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [analyticsData, moviesData, showsData, theatresData, bookingsData] = await Promise.all([
        api.getAdminAnalytics(),
        api.getMovies(),
        api.getShows(),
        api.getTheatres(),
        api.getAdminBookings()
      ]);
      setAnalytics(analyticsData);
      setMovies(moviesData);
      setShows(showsData);
      setTheatres(theatresData);
      setBookings(bookingsData);

      // Pre-select first movie & theatre for the show modal
      if (moviesData.length > 0 && !showForm.movieId) {
        setShowForm((prev) => ({
          ...prev,
          movieId: moviesData[0].id,
          theatreId: theatresData[0]?.id || '',
          screenId: theatresData[0]?.screens[0]?.id || '',
          screenName: theatresData[0]?.screens[0]?.name || ''
        }));
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to fetch admin data.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Save / Update Movie
  const handleSaveMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: Omit<Movie, 'id'> = {
        title: movieForm.title,
        genre: movieForm.genre.split(',').map((g) => g.trim()),
        language: movieForm.language,
        durationMinutes: Number(movieForm.durationMinutes),
        rating: Number(movieForm.rating),
        releaseDate: movieForm.releaseDate,
        synopsis: movieForm.synopsis,
        director: movieForm.director,
        cast: movieForm.cast.split(',').map((c) => c.trim()),
        posterUrl: movieForm.posterUrl,
        bannerUrl: movieForm.bannerUrl,
        ageRating: movieForm.ageRating,
        status: movieForm.status,
        industry: movieForm.industry
      };

      if (editingMovieId) {
        await api.updateMovie(editingMovieId, payload);
        showToast(`Movie "${payload.title}" updated successfully.`, 'success');
      } else {
        await api.createMovie(payload);
        showToast(`Movie "${payload.title}" added to catalogue.`, 'success');
      }

      setIsMovieModalOpen(false);
      setEditingMovieId(null);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to save movie.', 'error');
    }
  };

  const handleEditMovieClick = (movie: Movie) => {
    setEditingMovieId(movie.id);
    setMovieForm({
      title: movie.title,
      genre: movie.genre.join(', '),
      language: movie.language,
      durationMinutes: movie.durationMinutes,
      rating: movie.rating,
      releaseDate: movie.releaseDate,
      synopsis: movie.synopsis,
      director: movie.director,
      cast: movie.cast.join(', '),
      posterUrl: movie.posterUrl,
      bannerUrl: movie.bannerUrl,
      ageRating: movie.ageRating,
      status: movie.status,
      industry: movie.industry || 'Hollywood'
    });
    setIsMovieModalOpen(true);
  };

  const handleDeleteMovie = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? All scheduled shows will also be removed.`)) return;
    try {
      await api.deleteMovie(id);
      showToast(`Movie "${title}" removed.`, 'info');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete movie.', 'error');
    }
  };

  // Schedule Show
  const handleScheduleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const selectedTheatre = theatres.find((t) => t.id === showForm.theatreId);
      const selectedScreen = selectedTheatre?.screens.find((s) => s.id === showForm.screenId) || selectedTheatre?.screens[0];

      await api.createShow({
        movieId: showForm.movieId,
        theatreId: showForm.theatreId,
        screenId: selectedScreen?.id || 'screen_1',
        screenName: selectedScreen?.name || 'Main Hall',
        format: showForm.format,
        showDate: showForm.showDate,
        showTime: showForm.showTime,
        pricing: {
          standard: Number(showForm.standardPrice),
          premium: Number(showForm.premiumPrice),
          vipRecliner: Number(showForm.vipPrice)
        },
        totalSeats: selectedScreen?.totalSeats || 120
      });

      showToast('Showtime scheduled successfully.', 'success');
      setIsShowModalOpen(false);
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule show.', 'error');
    }
  };

  const handleDeleteShow = async (id: string) => {
    if (!confirm('Are you sure you want to remove this showtime?')) return;
    try {
      await api.deleteShow(id);
      showToast('Showtime deleted.', 'info');
      loadAllData();
    } catch (err: any) {
      showToast(err.message || 'Failed to delete show.', 'error');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span>IMovies Cinema Operations Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Cinema Administration & Scheduling
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time management for films, auditorium showtimes, dynamic seating rates, and ticket revenues.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setEditingMovieId(null);
              setMovieForm({
                title: '',
                genre: 'Sci-Fi, Adventure',
                language: 'English',
                durationMinutes: 130,
                rating: 8.4,
                releaseDate: new Date().toISOString().split('T')[0],
                synopsis: '',
                director: '',
                cast: 'Actor One, Actor Two',
                posterUrl: '/src/assets/images/hero_cinema_experience_1793442963810.jpg',
                bannerUrl: '/src/assets/images/hero_cinema_experience_1793442963810.jpg',
                ageRating: 'PG-13',
                status: 'now_showing',
                industry: 'Hollywood'
              });
              setIsMovieModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Movie</span>
          </button>

          <button
            onClick={() => setIsShowModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors"
          >
            <Calendar className="w-4 h-4 text-amber-400" />
            <span>Schedule Showtime</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-semibold">
        <button
          onClick={() => setActiveTab('analytics')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'analytics'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Analytics & Revenue</span>
        </button>

        <button
          onClick={() => setActiveTab('movies')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'movies'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Film className="w-4 h-4" />
          <span>Movie Catalogue ({movies.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('shows')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'shows'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Active Showtimes ({shows.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'bg-amber-400 text-slate-950 shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Booking Logs ({bookings.length})</span>
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
          Loading operations dashboard data...
        </div>
      ) : (
        <>
          {/* TAB 1: ANALYTICS & METRICS */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-8">
              
              {/* 4 KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Gross Revenue</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    ${analytics.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-emerald-400 mt-1 font-medium">
                    +18.4% vs previous cycle
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Tickets Issued</span>
                    <Users className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {analytics.totalTicketsSold}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    across {analytics.totalBookings} reservations
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Average Occupancy</span>
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {analytics.occupancyRate}%
                  </div>
                  <div className="text-[11px] text-sky-400 mt-1">
                    healthy capacity utilization
                  </div>
                </div>

                <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
                  <div className="flex items-center justify-between text-slate-400 text-xs mb-2">
                    <span>Active Screens</span>
                    <Film className="w-4 h-4 text-purple-400" />
                  </div>
                  <div className="text-2xl font-black text-white font-mono tabular-nums">
                    {shows.length}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    in {analytics.activeTheatresCount} locations
                  </div>
                </div>
              </div>

              {/* Revenue by Genre & Theatre Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-4">
                    Revenue Distribution by Genre
                  </h3>
                  <div className="space-y-3">
                    {analytics.revenueByGenre.map((item) => {
                      const maxRev = Math.max(...analytics.revenueByGenre.map((g) => g.revenue), 100);
                      const pct = Math.round((item.revenue / maxRev) * 100);
                      return (
                        <div key={item.genre} className="space-y-1 text-xs">
                          <div className="flex justify-between text-slate-300">
                            <span className="font-medium">{item.genre}</span>
                            <span className="font-mono text-amber-400 tabular-nums">${item.revenue}</span>
                          </div>
                          <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden">
                            <div
                              className="h-full bg-amber-400 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
                  <h3 className="text-sm font-bold text-white mb-4">
                    Cinema Venue Occupancies
                  </h3>
                  <div className="space-y-4">
                    {analytics.theatreOccupancy.map((t) => (
                      <div key={t.theatreName} className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                        <div className="flex justify-between items-center text-xs mb-1">
                          <span className="font-bold text-white">{t.theatreName}</span>
                          <span className="font-mono font-semibold text-emerald-400">{t.occupancy}% Occupancy</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                          <span>Revenue: ${t.revenue.toFixed(2)}</span>
                          <span>Format: IMAX Laser / Atmos</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: MOVIE CATALOGUE CRUD */}
          {activeTab === 'movies' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {movies.map((movie) => (
                  <div
                    key={movie.id}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex gap-4 hover:border-slate-700 transition-colors"
                  >
                    <div className="w-20 aspect-[3/4] rounded-lg overflow-hidden bg-slate-950 shrink-0">
                      <img
                        src={movie.posterUrl}
                        alt={movie.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 mb-0.5">
                          <span>{movie.genre[0]}</span>
                          <span className="text-amber-400 font-bold tabular-nums">★ {movie.rating}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{movie.title}</h4>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {movie.durationMinutes}m · {movie.language} · {movie.ageRating}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          {movie.status === 'now_showing' ? '● Now Playing' : '○ Upcoming'}
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800/80">
                        <button
                          onClick={() => handleEditMovieClick(movie)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                          title="Edit movie"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMovie(movie.id, movie.title)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 hover:text-rose-400 text-slate-400"
                          title="Delete movie"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: SHOWTIMES SCHEDULER CRUD */}
          {activeTab === 'shows' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Movie</th>
                      <th className="p-3.5">Venue & Screen</th>
                      <th className="p-3.5">Format</th>
                      <th className="p-3.5">Date & Time</th>
                      <th className="p-3.5">Pricing</th>
                      <th className="p-3.5">Capacity</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {shows.map((show) => (
                      <tr key={show.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          {show.movie?.title || show.movieId}
                        </td>
                        <td className="p-3.5">
                          <div>{show.theatre?.name}</div>
                          <div className="text-[11px] text-slate-500">{show.screenName}</div>
                        </td>
                        <td className="p-3.5">
                          <span className="font-mono px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                            {show.format}
                          </span>
                        </td>
                        <td className="p-3.5 font-medium">
                          {show.showDate} at <strong className="text-white">{show.showTime}</strong>
                        </td>
                        <td className="p-3.5 font-mono text-[11px]">
                          Std: ${show.pricing.standard.toFixed(2)} · Prem: ${show.pricing.premium.toFixed(2)} · VIP: ${show.pricing.vipRecliner.toFixed(2)}
                        </td>
                        <td className="p-3.5 font-mono">
                          <span className="text-emerald-400">{show.availableSeatsCount}</span> / {show.totalSeats} seats
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => handleDeleteShow(show.id)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40"
                            title="Delete showtime"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: RESERVATION BOOKINGS LOGS */}
          {activeTab === 'bookings' && (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="p-3.5">Ref Code</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Movie</th>
                      <th className="p-3.5">Showtime</th>
                      <th className="p-3.5">Seats</th>
                      <th className="p-3.5">Total Paid</th>
                      <th className="p-3.5">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 text-slate-300">
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-850/50 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          {booking.bookingReference}
                        </td>
                        <td className="p-3.5">
                          <div className="font-medium text-white">{booking.userName}</div>
                          <div className="text-[11px] text-slate-500">{booking.userEmail}</div>
                        </td>
                        <td className="p-3.5 font-medium">{booking.movieTitle}</td>
                        <td className="p-3.5">
                          {booking.showDate} {booking.showTime}
                        </td>
                        <td className="p-3.5 font-mono">
                          {booking.seats.map((s) => s.seatId).join(', ')}
                        </td>
                        <td className="p-3.5 font-mono font-bold text-white tabular-nums">
                          ${booking.totalAmount.toFixed(2)}
                        </td>
                        <td className="p-3.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                              booking.bookingStatus === 'confirmed'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                : 'bg-rose-950 text-rose-300 border border-rose-800'
                            }`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT MOVIE MODAL */}
      {isMovieModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">
                {editingMovieId ? 'Edit Movie Details' : 'Add New Cinema Release'}
              </h3>
              <button
                onClick={() => setIsMovieModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovie} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Title</label>
                <input
                  type="text"
                  required
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  placeholder="e.g. Dune: Part Three"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Genres (comma separated)</label>
                  <input
                    type="text"
                    required
                    value={movieForm.genre}
                    onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Language</label>
                  <input
                    type="text"
                    required
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Duration (minutes)</label>
                  <input
                    type="number"
                    required
                    value={movieForm.durationMinutes}
                    onChange={(e) => setMovieForm({ ...movieForm, durationMinutes: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">IMDb Rating</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Age Rating</label>
                  <select
                    value={movieForm.ageRating}
                    onChange={(e) => setMovieForm({ ...movieForm, ageRating: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="G">G</option>
                    <option value="PG">PG</option>
                    <option value="PG-13">PG-13</option>
                    <option value="R">R</option>
                    <option value="NC-17">NC-17</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Release Status</label>
                  <select
                    value={movieForm.status}
                    onChange={(e) => setMovieForm({ ...movieForm, status: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="now_showing">Now Showing</option>
                    <option value="coming_soon">Coming Soon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Industry</label>
                  <select
                    value={movieForm.industry}
                    onChange={(e) => setMovieForm({ ...movieForm, industry: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="Hollywood">Hollywood</option>
                    <option value="Bollywood">Bollywood</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Director</label>
                <input
                  type="text"
                  required
                  value={movieForm.director}
                  onChange={(e) => setMovieForm({ ...movieForm, director: e.target.value })}
                  placeholder="e.g. Denis Villeneuve"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Cast (comma separated)</label>
                <input
                  type="text"
                  required
                  value={movieForm.cast}
                  onChange={(e) => setMovieForm({ ...movieForm, cast: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Synopsis</label>
                <textarea
                  required
                  rows={3}
                  value={movieForm.synopsis}
                  onChange={(e) => setMovieForm({ ...movieForm, synopsis: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Poster Image URL</label>
                <input
                  type="text"
                  value={movieForm.posterUrl}
                  onChange={(e) => setMovieForm({ ...movieForm, posterUrl: e.target.value, bannerUrl: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsMovieModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Save Movie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SCHEDULE SHOWTIME MODAL */}
      {isShowModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <h3 className="text-lg font-bold text-white">Schedule New Showtime</h3>
              <button
                onClick={() => setIsShowModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleShow} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Select Movie</label>
                <select
                  value={showForm.movieId}
                  onChange={(e) => setShowForm({ ...showForm, movieId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Select Cinema Venue</label>
                  <select
                    value={showForm.theatreId}
                    onChange={(e) => {
                      const t = theatres.find((th) => th.id === e.target.value);
                      setShowForm({
                        ...showForm,
                        theatreId: e.target.value,
                        screenId: t?.screens[0]?.id || '',
                        screenName: t?.screens[0]?.name || ''
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    {theatres.map((th) => (
                      <option key={th.id} value={th.id}>
                        {th.name} ({th.city})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Screen Hall & Format</label>
                  <select
                    value={showForm.format}
                    onChange={(e) => setShowForm({ ...showForm, format: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="IMAX Laser">IMAX Laser Dual 4K</option>
                    <option value="Dolby Atmos">Dolby Atmos Surround</option>
                    <option value="4DX Recliner">4DX Motion Recliner</option>
                    <option value="Standard 4K">Standard 4K Digital</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Show Date</label>
                  <input
                    type="date"
                    required
                    value={showForm.showDate}
                    onChange={(e) => setShowForm({ ...showForm, showDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Showtime (HH:MM)</label>
                  <input
                    type="time"
                    required
                    value={showForm.showTime}
                    onChange={(e) => setShowForm({ ...showForm, showTime: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Standard ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.standardPrice}
                    onChange={(e) => setShowForm({ ...showForm, standardPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Premium ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.premiumPrice}
                    onChange={(e) => setShowForm({ ...showForm, premiumPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">VIP Recliner ($)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={showForm.vipPrice}
                    onChange={(e) => setShowForm({ ...showForm, vipPrice: Number(e.target.value) })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-white font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsShowModalOpen(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold"
                >
                  Publish Showtime
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

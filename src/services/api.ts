import type {
  AdminAnalytics,
  Booking,
  Movie,
  SeatInfo,
  Show,
  SnackItem,
  Theatre,
  User
} from '../types/cinema';

const BASE_URL = '/api';

function getGuestId(): string {
  let id = localStorage.getItem('imovies_guest_id');
  if (!id) {
    id = `guest_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem('imovies_guest_id', id);
  }
  return id;
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('imovies_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-guest-session-id': getGuestId()
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function handleResponse<T>(res: globalThis.Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }
  return data as T;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return handleResponse(res);
  },

  async register(data: { name: string; email: string; password: string; phone?: string }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(res);
  },

  async quickDemo(role: 'user' | 'admin'): Promise<{ user: User; token: string }> {
    const res = await fetch(`${BASE_URL}/auth/quick-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role })
    });
    return handleResponse(res);
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Movies
  async getMovies(params?: { genre?: string; language?: string; search?: string; status?: string; industry?: string }): Promise<Movie[]> {
    const query = new URLSearchParams();
    if (params?.genre) query.set('genre', params.genre);
    if (params?.language) query.set('language', params.language);
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.industry) query.set('industry', params.industry);

    const res = await fetch(`${BASE_URL}/movies?${query.toString()}`);
    return handleResponse(res);
  },

  async getMovie(id: string): Promise<Movie> {
    const res = await fetch(`${BASE_URL}/movies/${id}`);
    return handleResponse(res);
  },

  async createMovie(movie: Omit<Movie, 'id'>): Promise<Movie> {
    const res = await fetch(`${BASE_URL}/movies`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(movie)
    });
    return handleResponse(res);
  },

  async updateMovie(id: string, updates: Partial<Movie>): Promise<Movie> {
    const res = await fetch(`${BASE_URL}/movies/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates)
    });
    return handleResponse(res);
  },

  async deleteMovie(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/movies/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Theatres
  async getTheatres(city?: string): Promise<Theatre[]> {
    const query = city && city !== 'All' ? `?city=${encodeURIComponent(city)}` : '';
    const res = await fetch(`${BASE_URL}/theatres${query}`);
    return handleResponse(res);
  },

  async createTheatre(theatre: Omit<Theatre, 'id'>): Promise<Theatre> {
    const res = await fetch(`${BASE_URL}/theatres`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(theatre)
    });
    return handleResponse(res);
  },

  // Shows
  async getShows(params?: { movieId?: string; theatreId?: string; date?: string; city?: string }): Promise<Show[]> {
    const query = new URLSearchParams();
    if (params?.movieId) query.set('movieId', params.movieId);
    if (params?.theatreId) query.set('theatreId', params.theatreId);
    if (params?.date) query.set('date', params.date);
    if (params?.city) query.set('city', params.city);

    const res = await fetch(`${BASE_URL}/shows?${query.toString()}`);
    return handleResponse(res);
  },

  async getShow(id: string): Promise<Show> {
    const res = await fetch(`${BASE_URL}/shows/${id}`);
    return handleResponse(res);
  },

  async createShow(show: Omit<Show, 'id' | 'availableSeatsCount'>): Promise<Show> {
    const res = await fetch(`${BASE_URL}/shows`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(show)
    });
    return handleResponse(res);
  },

  async deleteShow(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/shows/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  // Real-Time Seats
  async getShowSeats(showId: string): Promise<SeatInfo[]> {
    const res = await fetch(`${BASE_URL}/shows/${showId}/seats`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async lockSeats(showId: string, seatIds: string[], userId: string): Promise<{ success: boolean; lockedSeats: string[]; expiresAt: number }> {
    const res = await fetch(`${BASE_URL}/shows/${showId}/seats/lock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatIds, userId })
    });
    return handleResponse(res);
  },

  async unlockSeats(showId: string, seatIds: string[], userId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${BASE_URL}/shows/${showId}/seats/unlock`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ seatIds, userId })
    });
    return handleResponse(res);
  },

  // Concessions
  async getSnacks(): Promise<SnackItem[]> {
    const res = await fetch(`${BASE_URL}/snacks`);
    return handleResponse(res);
  },

  // Bookings
  async createBooking(bookingData: {
    showId: string;
    seatIds: string[];
    snacks: { snackId: string; qty: number }[];
    paymentMethod: string;
    userPhone?: string;
  }): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bookingData)
    });
    return handleResponse(res);
  },

  async getMyBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/bookings/my`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getBooking(id: string): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings/${id}`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async cancelBooking(bookingId: string, reason?: string): Promise<Booking> {
    const res = await fetch(`${BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    });
    return handleResponse(res);
  },

  // Admin
  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const res = await fetch(`${BASE_URL}/admin/analytics`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  },

  async getAdminBookings(): Promise<Booking[]> {
    const res = await fetch(`${BASE_URL}/admin/bookings`, {
      headers: getAuthHeaders()
    });
    return handleResponse(res);
  }
};

export type UserRole = 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface Movie {
  id: string;
  title: string;
  genre: string[];
  language: string;
  durationMinutes: number;
  rating: number; // e.g. 8.9
  releaseDate: string;
  synopsis: string;
  director: string;
  cast: string[];
  posterUrl: string;
  bannerUrl: string;
  trailerUrl?: string;
  ageRating: 'G' | 'PG' | 'PG-13' | 'R' | 'NC-17';
  status: 'now_showing' | 'coming_soon';
  featured?: boolean;
  industry: 'Hollywood' | 'Bollywood';
}

export interface Screen {
  id: string;
  name: string;
  format: 'IMAX Laser' | 'Dolby Atmos' | '4DX Recliner' | 'Standard 4K';
  rows: number;
  cols: number;
  totalSeats: number;
}

export interface Theatre {
  id: string;
  name: string;
  city: string;
  address: string;
  screens: Screen[];
  amenities: string[];
}

export interface ShowPricing {
  standard: number;
  premium: number;
  vipRecliner: number;
}

export interface Show {
  id: string;
  movieId: string;
  theatreId: string;
  screenId: string;
  screenName: string;
  format: string;
  showDate: string; // YYYY-MM-DD
  showTime: string; // e.g. "14:30"
  pricing: ShowPricing;
  totalSeats: number;
  availableSeatsCount: number;
  // Joined fields for display convenience
  movie?: Movie;
  theatre?: Theatre;
}

export type SeatTier = 'standard' | 'premium' | 'vipRecliner';
export type SeatStatus = 'available' | 'locked' | 'booked';

export interface SeatInfo {
  id: string; // e.g. "A1", "F5"
  row: string; // "A", "B", ...
  col: number; // 1, 2, ...
  tier: SeatTier;
  price: number;
  status: SeatStatus;
  lockedBy?: string;
  lockedUntil?: number; // timestamp
}

export interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: 'popcorn' | 'beverage' | 'snack' | 'combo';
  icon: string;
}

export interface BookingSeat {
  seatId: string;
  row: string;
  col: number;
  tier: SeatTier;
  price: number;
}

export interface BookingSnack {
  snackId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Booking {
  id: string;
  bookingReference: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  showId: string;
  movieId: string;
  movieTitle: string;
  moviePoster: string;
  theatreId: string;
  theatreName: string;
  city: string;
  screenName: string;
  format: string;
  showDate: string;
  showTime: string;
  seats: BookingSeat[];
  snacks: BookingSnack[];
  subtotal: number;
  convenienceFee: number;
  tax: number;
  totalAmount: number;
  paymentId: string;
  paymentMethod: string;
  paymentStatus: 'completed' | 'refunded';
  bookingStatus: 'confirmed' | 'cancelled';
  createdAt: string;
  qrCodeData: string;
  cancellation?: {
    cancelledAt: string;
    refundAmount: number;
    refundPercentage: number;
    reason: string;
  };
}

export interface AdminAnalytics {
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  activeMoviesCount: number;
  activeTheatresCount: number;
  occupancyRate: number;
  recentBookings: Booking[];
  revenueByGenre: { genre: string; revenue: number }[];
  theatreOccupancy: { theatreName: string; occupancy: number; revenue: number }[];
}

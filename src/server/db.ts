import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import type {
  AdminAnalytics,
  Booking,
  Movie,
  SeatInfo,
  SeatTier,
  Show,
  SnackItem,
  Theatre,
  User
} from '../types/cinema';

const DB_FILE = path.resolve('/tmp/imovies_db.json');

interface SeatLock {
  seatId: string;
  userId: string;
  showId: string;
  lockedAt: number;
  expiresAt: number;
}

interface DBState {
  users: (User & { passwordHash: string })[];
  movies: Movie[];
  theatres: Theatre[];
  shows: Show[];
  seatsByShow: Record<string, Record<string, { status: 'available' | 'locked' | 'booked'; bookingId?: string }>>;
  bookings: Booking[];
  seatLocks: SeatLock[];
  snacks: SnackItem[];
}

const DEFAULT_SNACKS: SnackItem[] = [
  {
    id: 'snack_1',
    name: 'Caramel & Butter Crisp Popcorn (L)',
    description: 'Freshly popped jumbo popcorn tossed with golden caramel and creamy butter glaze.',
    price: 9.50,
    category: 'popcorn',
    icon: 'popcorn'
  },
  {
    id: 'snack_2',
    name: 'Truffle Parmesan Popcorn',
    description: 'Artisan corn tossed in white truffle oil, rosemary sea salt, and aged parmesan.',
    price: 11.00,
    category: 'popcorn',
    icon: 'popcorn'
  },
  {
    id: 'snack_3',
    name: 'Loaded Cinema Nachos',
    description: 'Crispy warm tortilla chips, jalapeño queso, fresh pico de gallo, and sour cream.',
    price: 8.75,
    category: 'snack',
    icon: 'utensils'
  },
  {
    id: 'snack_4',
    name: 'Gourmet Angus Beef Dog',
    description: 'Flame-grilled Angus frankfurter on a toasted brioche bun with honey mustard relish.',
    price: 9.25,
    category: 'snack',
    icon: 'utensils'
  },
  {
    id: 'snack_5',
    name: 'Craft Fountain Soda (Free Refill)',
    description: 'Choice of Coca-Cola Classic, Zero Sugar, Cherry Coke, Sprite, or Spiced Dr Pepper.',
    price: 5.50,
    category: 'beverage',
    icon: 'cup-soda'
  },
  {
    id: 'snack_6',
    name: 'Blue Raspberry ICEE Slush',
    description: 'Sub-zero frozen crystal beverage with tangy sweet blue raspberry infusion.',
    price: 6.25,
    category: 'beverage',
    icon: 'cup-soda'
  },
  {
    id: 'snack_7',
    name: 'Cinema Treat Combo Box',
    description: '1 Large Popcorn + 2 Fountain Sodas + M&M Peanuts Box. Save 20%.',
    price: 18.50,
    category: 'combo',
    icon: 'sparkles'
  }
];

function generateInitialData(): DBState {
  const salt = bcrypt.genSaltSync(10);
  const adminPasswordHash = bcrypt.hashSync('Admin123!', salt);
  const userPasswordHash = bcrypt.hashSync('User123!', salt);

  const users: (User & { passwordHash: string })[] = [
    {
      id: 'usr_admin',
      name: 'Cinema Director',
      email: 'admin@imovies.com',
      passwordHash: adminPasswordHash,
      role: 'admin',
      phone: '+1 (555) 019-2834',
      createdAt: '2026-01-10T08:00:00Z'
    },
    {
      id: 'usr_sarah',
      name: 'Sarah Jenkins',
      email: 'user@imovies.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+1 (555) 234-5678',
      createdAt: '2026-02-14T11:20:00Z'
    },
    {
      id: 'usr_marcus',
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      passwordHash: userPasswordHash,
      role: 'user',
      phone: '+1 (555) 789-0123',
      createdAt: '2026-02-20T15:40:00Z'
    }
  ];

  const movies: Movie[] = [
    // Hollywood Titles
    {
      id: 'mov_1',
      title: 'Interstellar Odyssey: Beyond the Horizon',
      genre: ['Sci-Fi', 'Adventure', 'Mystery'],
      language: 'English',
      durationMinutes: 164,
      rating: 9.1,
      releaseDate: '2026-10-15',
      synopsis: 'A courageous quantum expedition journeys through an unstable gravitational fold at the perimeter of the solar system, discovering an ancient colossal station holding secrets of cosmic origin.',
      director: 'Helena Thorne',
      cast: ['Cillian Vance', 'Maya Lin', 'David Kaluuya', 'Elena Rostova'],
      posterUrl: '/src/assets/images/hero_cinema_experience_1793442963810.jpg',
      bannerUrl: '/src/assets/images/hero_cinema_experience_1793442963810.jpg',
      trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: true,
      industry: 'Hollywood'
    },
    {
      id: 'mov_2',
      title: 'Shadows in the Mist: Neo-Noir',
      genre: ['Crime', 'Thriller', 'Mystery'],
      language: 'English',
      durationMinutes: 132,
      rating: 8.7,
      releaseDate: '2026-10-22',
      synopsis: 'In a rain-slicked metropolis governed by rival syndicates, an estranged private investigator unearths a high-level conspiracy tied to an unsolved syndicate theft from a decade ago.',
      director: 'Julian Mercer',
      cast: ['Vincent Cassel', 'Ana de Armas', 'Jeffrey Wright'],
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy',
      ageRating: 'R',
      status: 'now_showing',
      featured: false,
      industry: 'Hollywood'
    },
    {
      id: 'mov_3',
      title: 'Kingdom of Aethelgard: The Iron Crown',
      genre: ['Action', 'Epic Fantasy', 'Adventure'],
      language: 'English',
      durationMinutes: 155,
      rating: 8.9,
      releaseDate: '2026-10-05',
      synopsis: 'When the Northern wall shatters, an exiled commander unites fractured clans and mythical beasts to reclaim the fortress before darkness consumes the continent.',
      director: 'Katarina Lind',
      cast: ['Alexander Skarsgård', 'Florence Pugh', 'Mads Mikkelsen'],
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy2',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Hollywood'
    },
    {
      id: 'mov_4',
      title: 'Cyber Strike: Zero Hour Protocol',
      genre: ['Action', 'Sci-Fi', 'Thriller'],
      language: 'English',
      durationMinutes: 128,
      rating: 8.4,
      releaseDate: '2026-10-18',
      synopsis: 'An elite tactical counter-cyber team races against a 60-minute countdown to neutralise a quantum rogue network threatening global communication arrays.',
      director: 'Kenji Takahashi',
      cast: ['Hiroyuki Sanada', 'Gemma Chan', 'Michael B. Jordan'],
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy3',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Hollywood'
    },
    {
      id: 'mov_5',
      title: 'Echoes of the Blue Note',
      genre: ['Drama', 'Musical', 'Romance'],
      language: 'French / English',
      durationMinutes: 118,
      rating: 8.6,
      releaseDate: '2026-09-28',
      synopsis: 'In 1950s Paris, a prodigal jazz saxophonist and a visionary painter form a breathtaking creative romance that reshapes modern music history.',
      director: 'Claire Denis',
      cast: ['Tahar Rahim', 'Lea Seydoux', 'Lakeith Stanfield'],
      posterUrl: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy4',
      ageRating: 'PG',
      status: 'now_showing',
      featured: false,
      industry: 'Hollywood'
    },
    {
      id: 'mov_6',
      title: 'Chronicles of the Deep Cosmos',
      genre: ['Sci-Fi', 'Documentary', 'Animation'],
      language: 'English',
      durationMinutes: 104,
      rating: 9.3,
      releaseDate: '2026-11-20',
      synopsis: 'An immersive cinematic voyage exploring newly discovered deep-sea hydro-thermal ecosystems and their parallels to extraterrestrial moons Europa and Enceladus.',
      director: 'David Attenborough & James Cameron',
      cast: ['Narrated by Sigourney Weaver'],
      posterUrl: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy5',
      ageRating: 'G',
      status: 'coming_soon',
      featured: false,
      industry: 'Hollywood'
    },

    // Bollywood Blockbusters
    {
      id: 'mov_bolly_1',
      title: 'Brahmāstra: Part Two - Dev',
      genre: ['Fantasy', 'Action', 'Adventure'],
      language: 'Hindi / English Subtitles',
      durationMinutes: 172,
      rating: 8.8,
      releaseDate: '2026-10-24',
      synopsis: 'The Astraverse expands as Shiva confronts the mythical origins of the fiery Brahmāstra and the rise of Dev, an ancient king whose ambition threatens cosmic balance.',
      director: 'Ayan Mukerji',
      cast: ['Ranbir Kapoor', 'Deepika Padukone', 'Amitabh Bachchan', 'Ranveer Singh'],
      posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_brahmastra',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: true,
      industry: 'Bollywood'
    },
    {
      id: 'mov_bolly_2',
      title: 'Kalki 2898 AD: The Rebirth',
      genre: ['Sci-Fi', 'Action', 'Mythology'],
      language: 'Hindi / Telugu',
      durationMinutes: 180,
      rating: 9.0,
      releaseDate: '2026-10-10',
      synopsis: 'In a dystopian future 6,000 years after the Mahabharata, an immortal warrior guards the child destined to save humanity against the totalitarian Complex Citadel.',
      director: 'Nag Ashwin',
      cast: ['Prabhas', 'Amitabh Bachchan', 'Kamal Haasan', 'Deepika Padukone'],
      posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_kalki',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Bollywood'
    },
    {
      id: 'mov_bolly_3',
      title: 'Jawan: The Final Reckoning',
      genre: ['Action', 'Thriller', 'Drama'],
      language: 'Hindi',
      durationMinutes: 168,
      rating: 8.9,
      releaseDate: '2026-09-18',
      synopsis: 'A high-octane vigilante action thriller following a former commando driven by a personal vendetta to rectify the societal wrongs of corrupt industrial oligarchs.',
      director: 'Atlee',
      cast: ['Shah Rukh Khan', 'Nayanthara', 'Vijay Sethupathi', 'Priyamani'],
      posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_jawan',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Bollywood'
    },
    {
      id: 'mov_bolly_4',
      title: 'Fighter: Sky Warriors',
      genre: ['Action', 'Thriller', 'Air Combat'],
      language: 'Hindi',
      durationMinutes: 166,
      rating: 8.6,
      releaseDate: '2026-10-02',
      synopsis: 'Top Gun-style aerial dogfights and intense camaraderie follow an elite Air Dragons squadron defending northern airspace against rogue stealth invaders.',
      director: 'Siddharth Anand',
      cast: ['Hrithik Roshan', 'Deepika Padukone', 'Anil Kapoor', 'Karan Singh Grover'],
      posterUrl: 'https://images.unsplash.com/photo-1519074069444-1ba4eae16e16?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_fighter',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Bollywood'
    },
    {
      id: 'mov_bolly_5',
      title: 'Stree 2: Sarkate Ka Aatank',
      genre: ['Horror', 'Comedy', 'Mystery'],
      language: 'Hindi',
      durationMinutes: 147,
      rating: 8.5,
      releaseDate: '2026-08-30',
      synopsis: 'The haunted town of Chanderi faces a new headless phantom, forcing Vicky and his eccentric crew to summon an unlikely ghostly ally to protect their village.',
      director: 'Amar Kaushik',
      cast: ['Rajkummar Rao', 'Shraddha Kapoor', 'Pankaj Tripathi', 'Aparshakti Khurana'],
      posterUrl: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_stree',
      ageRating: 'PG-13',
      status: 'now_showing',
      featured: false,
      industry: 'Bollywood'
    },
    {
      id: 'mov_bolly_6',
      title: 'Singham Again: Roar of Justice',
      genre: ['Action', 'Crime'],
      language: 'Hindi',
      durationMinutes: 160,
      rating: 8.3,
      releaseDate: '2026-11-15',
      synopsis: 'DCP Bajirao Singham leads the cop universe in an unprecedented multi-state operation against an international terror syndicate threatening cross-border peace.',
      director: 'Rohit Shetty',
      cast: ['Ajay Devgn', 'Kareena Kapoor', 'Ranveer Singh', 'Akshay Kumar', 'Deepika Padukone'],
      posterUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&q=80',
      bannerUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80',
      trailerUrl: 'https://www.youtube.com/watch?v=dummy_singham',
      ageRating: 'PG-13',
      status: 'coming_soon',
      featured: false,
      industry: 'Bollywood'
    }
  ];

  const theatres: Theatre[] = [
    {
      id: 'theatre_1',
      name: 'IMovies Grand Cinema & IMAX',
      city: 'New York',
      address: '1500 Broadway, Times Square, NY 10036',
      amenities: ['IMAX Laser Dual 4K', 'Dolby Atmos Sound', 'Luxury Heated Recliners', 'Full Bar & Food Service', 'Reserved Seating'],
      screens: [
        { id: 'screen_1', name: 'Auditorium 1 (IMAX Laser)', format: 'IMAX Laser', rows: 10, cols: 12, totalSeats: 120 },
        { id: 'screen_2', name: 'Auditorium 2 (Dolby Atmos)', format: 'Dolby Atmos', rows: 8, cols: 12, totalSeats: 96 }
      ]
    },
    {
      id: 'theatre_2',
      name: 'Starlight CineLounge Hollywood',
      city: 'Los Angeles',
      address: '6801 Hollywood Blvd, Los Angeles, CA 90028',
      amenities: ['Dolby Atmos', '4DX Motion Recliners', 'Gourmet Kitchen Service', 'VIP Balcony Lounge'],
      screens: [
        { id: 'screen_3', name: 'Screen 1 (Dolby Atmos Grand)', format: 'Dolby Atmos', rows: 10, cols: 12, totalSeats: 120 },
        { id: 'screen_4', name: 'Screen 2 (4DX Motion Hall)', format: '4DX Recliner', rows: 8, cols: 10, totalSeats: 80 }
      ]
    },
    {
      id: 'theatre_3',
      name: 'CineDome Riverfront',
      city: 'Chicago',
      address: '400 N Michigan Ave, Chicago, IL 60611',
      amenities: ['IMAX Laser', 'Laser Projection', 'Artisanal Concessions', 'Wheelchair Accessible'],
      screens: [
        { id: 'screen_5', name: 'Dome Hall A (IMAX)', format: 'IMAX Laser', rows: 10, cols: 12, totalSeats: 120 }
      ]
    },
    {
      id: 'theatre_4',
      name: 'Embarcadero Cinema Works',
      city: 'San Francisco',
      address: '1 Embarcadero Center, San Francisco, CA 94111',
      amenities: ['Dolby Atmos', 'Wine & Craft Beer Bar', 'Luxury Recliners'],
      screens: [
        { id: 'screen_6', name: 'Auditorium Alpha', format: 'Standard 4K', rows: 8, cols: 12, totalSeats: 96 }
      ]
    }
  ];

  // Helper for generating today and upcoming dates
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 172800000).toISOString().split('T')[0];

  const shows: Show[] = [
    // Today shows
    {
      id: 'show_1',
      movieId: 'mov_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '13:00',
      pricing: { standard: 16.50, premium: 21.00, vipRecliner: 28.50 },
      totalSeats: 120,
      availableSeatsCount: 106
    },
    {
      id: 'show_2',
      movieId: 'mov_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '16:45',
      pricing: { standard: 18.50, premium: 23.50, vipRecliner: 31.00 },
      totalSeats: 120,
      availableSeatsCount: 94
    },
    {
      id: 'show_3',
      movieId: 'mov_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '20:15',
      pricing: { standard: 19.50, premium: 24.50, vipRecliner: 32.50 },
      totalSeats: 120,
      availableSeatsCount: 88
    },
    {
      id: 'show_4',
      movieId: 'mov_2',
      theatreId: 'theatre_1',
      screenId: 'screen_2',
      screenName: 'Auditorium 2 (Dolby Atmos)',
      format: 'Dolby Atmos',
      showDate: today,
      showTime: '14:15',
      pricing: { standard: 15.00, premium: 19.50, vipRecliner: 26.00 },
      totalSeats: 96,
      availableSeatsCount: 84
    },
    {
      id: 'show_5',
      movieId: 'mov_2',
      theatreId: 'theatre_1',
      screenId: 'screen_2',
      screenName: 'Auditorium 2 (Dolby Atmos)',
      format: 'Dolby Atmos',
      showDate: today,
      showTime: '19:30',
      pricing: { standard: 17.00, premium: 21.50, vipRecliner: 28.00 },
      totalSeats: 96,
      availableSeatsCount: 79
    },
    {
      id: 'show_6',
      movieId: 'mov_3',
      theatreId: 'theatre_2',
      screenId: 'screen_3',
      screenName: 'Screen 1 (Dolby Atmos Grand)',
      format: 'Dolby Atmos',
      showDate: today,
      showTime: '15:00',
      pricing: { standard: 16.00, premium: 20.00, vipRecliner: 27.00 },
      totalSeats: 120,
      availableSeatsCount: 110
    },
    {
      id: 'show_7',
      movieId: 'mov_4',
      theatreId: 'theatre_2',
      screenId: 'screen_4',
      screenName: 'Screen 2 (4DX Motion Hall)',
      format: '4DX Recliner',
      showDate: today,
      showTime: '18:00',
      pricing: { standard: 22.00, premium: 26.00, vipRecliner: 34.00 },
      totalSeats: 80,
      availableSeatsCount: 68
    },
    // Tomorrow shows
    {
      id: 'show_8',
      movieId: 'mov_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: tomorrow,
      showTime: '14:00',
      pricing: { standard: 18.00, premium: 22.00, vipRecliner: 29.50 },
      totalSeats: 120,
      availableSeatsCount: 114
    },
    {
      id: 'show_9',
      movieId: 'mov_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: tomorrow,
      showTime: '19:00',
      pricing: { standard: 19.50, premium: 24.50, vipRecliner: 32.50 },
      totalSeats: 120,
      availableSeatsCount: 102
    },
    {
      id: 'show_10',
      movieId: 'mov_3',
      theatreId: 'theatre_3',
      screenId: 'screen_5',
      screenName: 'Dome Hall A (IMAX)',
      format: 'IMAX Laser',
      showDate: dayAfter,
      showTime: '17:30',
      pricing: { standard: 17.50, premium: 22.00, vipRecliner: 29.00 },
      totalSeats: 120,
      availableSeatsCount: 116
    },
    // Bollywood Shows
    {
      id: 'show_bolly_1',
      movieId: 'mov_bolly_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '15:30',
      pricing: { standard: 17.00, premium: 22.00, vipRecliner: 29.50 },
      totalSeats: 120,
      availableSeatsCount: 98
    },
    {
      id: 'show_bolly_2',
      movieId: 'mov_bolly_1',
      theatreId: 'theatre_1',
      screenId: 'screen_1',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '21:00',
      pricing: { standard: 19.00, premium: 24.00, vipRecliner: 32.00 },
      totalSeats: 120,
      availableSeatsCount: 86
    },
    {
      id: 'show_bolly_3',
      movieId: 'mov_bolly_2',
      theatreId: 'theatre_2',
      screenId: 'screen_3',
      screenName: 'Screen 1 (Dolby Atmos Grand)',
      format: 'Dolby Atmos',
      showDate: today,
      showTime: '17:15',
      pricing: { standard: 18.00, premium: 22.50, vipRecliner: 30.00 },
      totalSeats: 120,
      availableSeatsCount: 104
    },
    {
      id: 'show_bolly_4',
      movieId: 'mov_bolly_3',
      theatreId: 'theatre_2',
      screenId: 'screen_4',
      screenName: 'Screen 2 (4DX Motion Hall)',
      format: '4DX Recliner',
      showDate: today,
      showTime: '20:45',
      pricing: { standard: 22.50, premium: 27.00, vipRecliner: 35.00 },
      totalSeats: 80,
      availableSeatsCount: 71
    },
    {
      id: 'show_bolly_5',
      movieId: 'mov_bolly_4',
      theatreId: 'theatre_3',
      screenId: 'screen_5',
      screenName: 'Dome Hall A (IMAX)',
      format: 'IMAX Laser',
      showDate: tomorrow,
      showTime: '18:15',
      pricing: { standard: 18.00, premium: 23.00, vipRecliner: 31.00 },
      totalSeats: 120,
      availableSeatsCount: 112
    }
  ];

  // Pre-seed some booked seats for realism in show_1 and show_2
  const seatsByShow: Record<string, Record<string, { status: 'available' | 'locked' | 'booked'; bookingId?: string }>> = {};

  seatsByShow['show_1'] = {
    'E-5': { status: 'booked', bookingId: 'bk_seed_1' },
    'E-6': { status: 'booked', bookingId: 'bk_seed_1' },
    'F-6': { status: 'booked', bookingId: 'bk_seed_2' },
    'F-7': { status: 'booked', bookingId: 'bk_seed_2' },
    'J-5': { status: 'booked', bookingId: 'bk_seed_3' },
    'J-6': { status: 'booked', bookingId: 'bk_seed_3' }
  };

  seatsByShow['show_2'] = {
    'D-5': { status: 'booked', bookingId: 'bk_seed_4' },
    'D-6': { status: 'booked', bookingId: 'bk_seed_4' },
    'D-7': { status: 'booked', bookingId: 'bk_seed_4' }
  };

  const bookings: Booking[] = [
    {
      id: 'bk_seed_1',
      bookingReference: 'IM-84291',
      userId: 'usr_sarah',
      userName: 'Sarah Jenkins',
      userEmail: 'user@imovies.com',
      userPhone: '+1 (555) 234-5678',
      showId: 'show_1',
      movieId: 'mov_1',
      movieTitle: 'Interstellar Odyssey: Beyond the Horizon',
      moviePoster: '/src/assets/images/hero_cinema_experience_1793442963810.jpg',
      theatreId: 'theatre_1',
      theatreName: 'IMovies Grand Cinema & IMAX',
      city: 'New York',
      screenName: 'Auditorium 1 (IMAX Laser)',
      format: 'IMAX Laser',
      showDate: today,
      showTime: '13:00',
      seats: [
        { seatId: 'E-5', row: 'E', col: 5, tier: 'premium', price: 21.00 },
        { seatId: 'E-6', row: 'E', col: 6, tier: 'premium', price: 21.00 }
      ],
      snacks: [
        { snackId: 'snack_1', name: 'Caramel & Butter Crisp Popcorn (L)', qty: 1, price: 9.50 },
        { snackId: 'snack_5', name: 'Craft Fountain Soda (Free Refill)', qty: 2, price: 5.50 }
      ],
      subtotal: 62.50,
      convenienceFee: 3.50,
      tax: 5.28,
      totalAmount: 71.28,
      paymentId: 'pay_902184',
      paymentMethod: 'Credit Card (••4242)',
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      createdAt: '2026-10-30T14:22:00Z',
      qrCodeData: 'IMOVIES-TICKET-IM-84291-E5-E6'
    }
  ];

  return {
    users,
    movies,
    theatres,
    shows,
    seatsByShow,
    bookings,
    seatLocks: [],
    snacks: DEFAULT_SNACKS
  };
}

class Database {
  private state: DBState;

  constructor() {
    this.state = this.loadState();
    // Cleanup expired locks periodically
    setInterval(() => {
      this.cleanupExpiredLocks();
    }, 10000);
  }

  private loadState(): DBState {
    const fresh = generateInitialData();
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed: DBState = JSON.parse(raw);
        // Ensure new Hollywood and Bollywood titles exist in state
        fresh.movies.forEach((fm) => {
          if (!parsed.movies.some((m) => m.id === fm.id)) {
            parsed.movies.push(fm);
          }
        });
        fresh.shows.forEach((fsShow) => {
          if (!parsed.shows.some((s) => s.id === fsShow.id)) {
            parsed.shows.push(fsShow);
          }
        });
        this.saveState(parsed);
        return parsed;
      }
    } catch (e) {
      console.warn('Could not read existing DB file, regenerating defaults:', e);
    }
    this.saveState(fresh);
    return fresh;
  }

  private saveState(state = this.state) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to save DB state to file:', e);
    }
  }

  // --- Auth & Users ---
  getUserByEmail(email: string) {
    return this.state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string) {
    const user = this.state.users.find((u) => u.id === id);
    if (!user) return null;
    const { passwordHash, ...safe } = user;
    return safe;
  }

  createUser(data: { name: string; email: string; password: string; phone?: string; role?: 'user' | 'admin' }) {
    if (this.getUserByEmail(data.email)) {
      throw new Error('An account with this email already exists.');
    }
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(data.password, salt);
    const newUser: User & { passwordHash: string } = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash,
      role: data.role || 'user',
      phone: data.phone || '',
      createdAt: new Date().toISOString()
    };
    this.state.users.push(newUser);
    this.saveState();
    const { passwordHash: _, ...safe } = newUser;
    return safe;
  }

  // --- Movies ---
  getMovies(filter?: { genre?: string; language?: string; search?: string; status?: string; industry?: string }) {
    return this.state.movies.filter((movie) => {
      const movieIndustry = movie.industry || (movie.id.includes('bolly') ? 'Bollywood' : 'Hollywood');
      if (filter?.status && movie.status !== filter.status) return false;
      if (filter?.industry && filter.industry !== 'All' && movieIndustry.toLowerCase() !== filter.industry.toLowerCase()) return false;
      if (filter?.language && movie.language.toLowerCase() !== filter.language.toLowerCase()) return false;
      if (filter?.genre && !movie.genre.some((g) => g.toLowerCase() === filter.genre?.toLowerCase())) return false;
      if (filter?.search) {
        const query = filter.search.toLowerCase();
        const inTitle = movie.title.toLowerCase().includes(query);
        const inCast = movie.cast.some((c) => c.toLowerCase().includes(query));
        const inDir = movie.director.toLowerCase().includes(query);
        if (!inTitle && !inCast && !inDir) return false;
      }
      return true;
    });
  }

  getMovieById(id: string) {
    return this.state.movies.find((m) => m.id === id) || null;
  }

  createMovie(movieData: Omit<Movie, 'id'>) {
    const newMovie: Movie = {
      ...movieData,
      id: `mov_${Date.now()}`
    };
    this.state.movies.push(newMovie);
    this.saveState();
    return newMovie;
  }

  updateMovie(id: string, updates: Partial<Movie>) {
    const index = this.state.movies.findIndex((m) => m.id === id);
    if (index === -1) return null;
    this.state.movies[index] = { ...this.state.movies[index], ...updates };
    this.saveState();
    return this.state.movies[index];
  }

  deleteMovie(id: string) {
    const index = this.state.movies.findIndex((m) => m.id === id);
    if (index === -1) return false;
    this.state.movies.splice(index, 1);
    // Remove associated shows
    this.state.shows = this.state.shows.filter((s) => s.movieId !== id);
    this.saveState();
    return true;
  }

  // --- Theatres ---
  getTheatres(city?: string) {
    if (city && city !== 'All') {
      return this.state.theatres.filter((t) => t.city.toLowerCase() === city.toLowerCase());
    }
    return this.state.theatres;
  }

  getTheatreById(id: string) {
    return this.state.theatres.find((t) => t.id === id) || null;
  }

  createTheatre(theatreData: Omit<Theatre, 'id'>) {
    const newTheatre: Theatre = {
      ...theatreData,
      id: `theatre_${Date.now()}`
    };
    this.state.theatres.push(newTheatre);
    this.saveState();
    return newTheatre;
  }

  // --- Shows ---
  getShows(filter?: { movieId?: string; theatreId?: string; date?: string; city?: string }) {
    this.cleanupExpiredLocks();
    let result = this.state.shows;

    if (filter?.movieId) {
      result = result.filter((s) => s.movieId === filter.movieId);
    }
    if (filter?.theatreId) {
      result = result.filter((s) => s.theatreId === filter.theatreId);
    }
    if (filter?.date) {
      result = result.filter((s) => s.showDate === filter.date);
    }
    if (filter?.city && filter.city !== 'All') {
      const cityTheatres = this.state.theatres.filter((t) => t.city.toLowerCase() === filter.city?.toLowerCase()).map((t) => t.id);
      result = result.filter((s) => cityTheatres.includes(s.theatreId));
    }

    // Attach movie and theatre models
    return result.map((show) => {
      const movie = this.getMovieById(show.movieId);
      const theatre = this.getTheatreById(show.theatreId);
      return {
        ...show,
        movie: movie || undefined,
        theatre: theatre || undefined
      };
    });
  }

  getShowById(id: string) {
    this.cleanupExpiredLocks();
    const show = this.state.shows.find((s) => s.id === id);
    if (!show) return null;
    return {
      ...show,
      movie: this.getMovieById(show.movieId) || undefined,
      theatre: this.getTheatreById(show.theatreId) || undefined
    };
  }

  createShow(showData: Omit<Show, 'id' | 'availableSeatsCount'>) {
    const newShow: Show = {
      ...showData,
      id: `show_${Date.now()}`,
      availableSeatsCount: showData.totalSeats
    };
    this.state.shows.push(newShow);
    this.saveState();
    return newShow;
  }

  deleteShow(id: string) {
    const index = this.state.shows.findIndex((s) => s.id === id);
    if (index === -1) return false;
    this.state.shows.splice(index, 1);
    delete this.state.seatsByShow[id];
    this.saveState();
    return true;
  }

  // --- Real-time Seats & Locks Engine ---
  getShowSeats(showId: string, currentUserId?: string): SeatInfo[] {
    this.cleanupExpiredLocks();
    const show = this.getShowById(showId);
    if (!show) throw new Error('Show not found');

    const theatre = this.getTheatreById(show.theatreId);
    const screen = theatre?.screens.find((s) => s.id === show.screenId) || {
      rows: 10,
      cols: 12
    };

    const rowsCount = screen.rows || 10;
    const colsCount = screen.cols || 12;
    const rowLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'].slice(0, rowsCount);

    const showOverrides = this.state.seatsByShow[showId] || {};
    const seats: SeatInfo[] = [];

    rowLetters.forEach((row, rowIndex) => {
      let tier: SeatTier = 'standard';
      let price = show.pricing.standard;

      if (rowIndex >= rowsCount - 3) {
        tier = 'vipRecliner';
        price = show.pricing.vipRecliner;
      } else if (rowIndex >= 3) {
        tier = 'premium';
        price = show.pricing.premium;
      }

      for (let c = 1; c <= colsCount; c++) {
        const seatId = `${row}-${c}`;
        let status: 'available' | 'locked' | 'booked' = 'available';
        let lockedBy: string | undefined;
        let lockedUntil: number | undefined;

        // Check booked status
        if (showOverrides[seatId]?.status === 'booked') {
          status = 'booked';
        } else {
          // Check active lock
          const activeLock = this.state.seatLocks.find(
            (l) => l.showId === showId && l.seatId === seatId && l.expiresAt > Date.now()
          );
          if (activeLock) {
            status = 'locked';
            lockedBy = activeLock.userId;
            lockedUntil = activeLock.expiresAt;
          }
        }

        seats.push({
          id: seatId,
          row,
          col: c,
          tier,
          price,
          status,
          lockedBy,
          lockedUntil
        });
      }
    });

    return seats;
  }

  lockSeats(showId: string, seatIds: string[], userId: string, lockDurationMs = 8 * 60 * 1000) {
    this.cleanupExpiredLocks();
    const now = Date.now();
    const expiresAt = now + lockDurationMs;

    const showOverrides = this.state.seatsByShow[showId] || {};

    // Check if any seat is already booked or locked by another user
    for (const seatId of seatIds) {
      if (showOverrides[seatId]?.status === 'booked') {
        throw new Error(`Seat ${seatId} has already been reserved.`);
      }

      const existingLock = this.state.seatLocks.find(
        (l) => l.showId === showId && l.seatId === seatId && l.expiresAt > now
      );
      if (existingLock && existingLock.userId !== userId) {
        throw new Error(`Seat ${seatId} is temporarily held by another guest.`);
      }
    }

    // Release any previous locks held by this user for this show that aren't in this new list
    this.state.seatLocks = this.state.seatLocks.filter(
      (l) => !(l.showId === showId && l.userId === userId && !seatIds.includes(l.seatId))
    );

    // Apply new locks
    for (const seatId of seatIds) {
      const idx = this.state.seatLocks.findIndex((l) => l.showId === showId && l.seatId === seatId);
      if (idx >= 0) {
        this.state.seatLocks[idx].expiresAt = expiresAt;
      } else {
        this.state.seatLocks.push({
          seatId,
          userId,
          showId,
          lockedAt: now,
          expiresAt
        });
      }
    }

    this.saveState();
    return {
      success: true,
      lockedSeats: seatIds,
      expiresAt
    };
  }

  unlockSeats(showId: string, seatIds: string[], userId: string) {
    this.state.seatLocks = this.state.seatLocks.filter(
      (l) => !(l.showId === showId && seatIds.includes(l.seatId) && l.userId === userId)
    );
    this.saveState();
    return { success: true };
  }

  cleanupExpiredLocks() {
    const now = Date.now();
    const initialCount = this.state.seatLocks.length;
    this.state.seatLocks = this.state.seatLocks.filter((l) => l.expiresAt > now);
    if (this.state.seatLocks.length !== initialCount) {
      this.saveState();
    }
  }

  // --- Bookings & Payment Processing ---
  createBooking(data: {
    userId: string;
    userName: string;
    userEmail: string;
    userPhone: string;
    showId: string;
    seatIds: string[];
    snacks: { snackId: string; qty: number }[];
    paymentMethod: string;
  }): Booking {
    this.cleanupExpiredLocks();
    const show = this.getShowById(data.showId);
    if (!show) throw new Error('Show does not exist.');

    const movie = this.getMovieById(show.movieId);
    const theatre = this.getTheatreById(show.theatreId);
    if (!movie || !theatre) throw new Error('Associated movie or theatre not found.');

    const allSeats = this.getShowSeats(data.showId, data.userId);
    const selectedSeatInfos: SeatInfo[] = [];

    for (const id of data.seatIds) {
      const found = allSeats.find((s) => s.id === id);
      if (!found) throw new Error(`Invalid seat ${id}.`);
      if (found.status === 'booked') throw new Error(`Seat ${id} is already booked.`);

      // Verify that if locked, it's locked by this user
      if (found.status === 'locked' && found.lockedBy !== data.userId) {
        throw new Error(`Seat ${id} is temporarily locked by another user.`);
      }
      selectedSeatInfos.push(found);
    }

    // Calculate pricing
    const bookingSeats = selectedSeatInfos.map((s) => ({
      seatId: s.id,
      row: s.row,
      col: s.col,
      tier: s.tier,
      price: s.price
    }));

    const seatsSubtotal = bookingSeats.reduce((acc, s) => acc + s.price, 0);

    const bookingSnacks = data.snacks.map((item) => {
      const snack = this.state.snacks.find((sn) => sn.id === item.snackId);
      const price = snack ? snack.price : 0;
      const name = snack ? snack.name : 'Concession Item';
      return {
        snackId: item.snackId,
        name,
        qty: item.qty,
        price
      };
    });

    const snacksSubtotal = bookingSnacks.reduce((acc, sn) => acc + sn.price * sn.qty, 0);
    const subtotal = Number((seatsSubtotal + snacksSubtotal).toFixed(2));
    const convenienceFee = Number((2.50 * bookingSeats.length).toFixed(2));
    const tax = Number((subtotal * 0.0825).toFixed(2));
    const totalAmount = Number((subtotal + convenienceFee + tax).toFixed(2));

    const bookingReference = `IM-${Math.floor(100000 + Math.random() * 900000)}`;
    const bookingId = `bk_${Date.now()}`;
    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    // Mark seats as booked
    if (!this.state.seatsByShow[data.showId]) {
      this.state.seatsByShow[data.showId] = {};
    }
    for (const s of data.seatIds) {
      this.state.seatsByShow[data.showId][s] = {
        status: 'booked',
        bookingId
      };
    }

    // Release locks
    this.state.seatLocks = this.state.seatLocks.filter(
      (l) => !(l.showId === data.showId && data.seatIds.includes(l.seatId))
    );

    // Update available seats count in show
    const showRef = this.state.shows.find((s) => s.id === data.showId);
    if (showRef) {
      showRef.availableSeatsCount = Math.max(0, showRef.availableSeatsCount - data.seatIds.length);
    }

    const booking: Booking = {
      id: bookingId,
      bookingReference,
      userId: data.userId,
      userName: data.userName,
      userEmail: data.userEmail,
      userPhone: data.userPhone,
      showId: data.showId,
      movieId: movie.id,
      movieTitle: movie.title,
      moviePoster: movie.posterUrl,
      theatreId: theatre.id,
      theatreName: theatre.name,
      city: theatre.city,
      screenName: show.screenName,
      format: show.format,
      showDate: show.showDate,
      showTime: show.showTime,
      seats: bookingSeats,
      snacks: bookingSnacks,
      subtotal,
      convenienceFee,
      tax,
      totalAmount,
      paymentId,
      paymentMethod: data.paymentMethod,
      paymentStatus: 'completed',
      bookingStatus: 'confirmed',
      createdAt: new Date().toISOString(),
      qrCodeData: `IMOVIES:${bookingReference}:${bookingId}:${data.seatIds.join(',')}`
    };

    this.state.bookings.unshift(booking);
    this.saveState();
    return booking;
  }

  cancelBooking(bookingId: string, userId: string, reason = 'Customer requested cancellation') {
    const booking = this.state.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found.');
    if (booking.userId !== userId && userId !== 'usr_admin') {
      throw new Error('Not authorized to cancel this reservation.');
    }
    if (booking.bookingStatus === 'cancelled') {
      throw new Error('This booking is already cancelled.');
    }

    // Release seats
    const showOverrides = this.state.seatsByShow[booking.showId];
    if (showOverrides) {
      for (const seat of booking.seats) {
        if (showOverrides[seat.seatId]?.bookingId === bookingId) {
          delete showOverrides[seat.seatId];
        }
      }
    }

    // Restore available seats count
    const show = this.state.shows.find((s) => s.id === booking.showId);
    if (show) {
      show.availableSeatsCount = Math.min(show.totalSeats, show.availableSeatsCount + booking.seats.length);
    }

    // Calculate refund (90% refund if cancelled > 2 hours prior, 10% fee)
    const refundPercentage = 90;
    const refundAmount = Number(((booking.totalAmount * refundPercentage) / 100).toFixed(2));

    booking.bookingStatus = 'cancelled';
    booking.paymentStatus = 'refunded';
    booking.cancellation = {
      cancelledAt: new Date().toISOString(),
      refundAmount,
      refundPercentage,
      reason
    };

    this.saveState();
    return booking;
  }

  getUserBookings(userId: string) {
    return this.state.bookings.filter((b) => b.userId === userId);
  }

  getAllBookings() {
    return this.state.bookings;
  }

  getSnacks() {
    return this.state.snacks;
  }

  // --- Admin Analytics ---
  getAnalytics(): AdminAnalytics {
    const totalBookings = this.state.bookings.length;
    const activeBookings = this.state.bookings.filter((b) => b.bookingStatus === 'confirmed');
    const totalRevenue = activeBookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTicketsSold = activeBookings.reduce((sum, b) => sum + b.seats.length, 0);

    const activeMoviesCount = this.state.movies.filter((m) => m.status === 'now_showing').length;
    const activeTheatresCount = this.state.theatres.length;

    const totalSeatsInShows = this.state.shows.reduce((sum, s) => sum + s.totalSeats, 0);
    const totalOccupiedSeats = this.state.shows.reduce((sum, s) => sum + (s.totalSeats - s.availableSeatsCount), 0);
    const occupancyRate = totalSeatsInShows > 0 ? Math.round((totalOccupiedSeats / totalSeatsInShows) * 100) : 0;

    // Revenue by genre
    const genreMap: Record<string, number> = {};
    activeBookings.forEach((b) => {
      const movie = this.getMovieById(b.movieId);
      const genre = movie?.genre[0] || 'Other';
      genreMap[genre] = (genreMap[genre] || 0) + b.totalAmount;
    });

    const revenueByGenre = Object.entries(genreMap).map(([genre, revenue]) => ({
      genre,
      revenue: Math.round(revenue)
    }));

    // Theatre occupancy
    const theatreOccupancy = this.state.theatres.map((t) => {
      const tShows = this.state.shows.filter((s) => s.theatreId === t.id);
      const totalCapacity = tShows.reduce((sum, s) => sum + s.totalSeats, 0);
      const booked = tShows.reduce((sum, s) => sum + (s.totalSeats - s.availableSeatsCount), 0);
      const tRevenue = activeBookings
        .filter((b) => b.theatreId === t.id)
        .reduce((sum, b) => sum + b.totalAmount, 0);

      return {
        theatreName: t.name,
        occupancy: totalCapacity > 0 ? Math.round((booked / totalCapacity) * 100) : 0,
        revenue: Math.round(tRevenue)
      };
    });

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalBookings,
      totalTicketsSold,
      activeMoviesCount,
      activeTheatresCount,
      occupancyRate,
      recentBookings: this.state.bookings.slice(0, 10),
      revenueByGenre,
      theatreOccupancy
    };
  }
}

export const db = new Database();

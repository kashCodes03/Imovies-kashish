import bcrypt from 'bcryptjs';
import cors from 'cors';
import dotenv from 'dotenv';
import express, { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './src/server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'imovies_super_jwt_secret_token_2026';

// Middleware
app.use(cors());
app.use(express.json());

// In-memory rate limiting map for basic protection
const requestCounts = new Map<string, { count: number; resetAt: number }>();
function rateLimit(windowMs: number, maxRequests: number) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = requestCounts.get(ip);

    if (!entry || now > entry.resetAt) {
      requestCounts.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }

    if (entry.count >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests. Please slow down.' });
    }

    entry.count++;
    next();
  };
}

// Auth Helper & Middleware
interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'admin';
    name: string;
  };
}

function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required. Please sign in.' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      id: string;
      email: string;
      role: 'user' | 'admin';
      name: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token.' });
  }
}

function adminOnly(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Administrator access required.' });
  }
  next();
}

// -----------------------------------------------------------------------------
// API Routes
// -----------------------------------------------------------------------------

// --- Auth Routes ---
app.post('/api/auth/register', rateLimit(60000, 10), (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const newUser = db.createUser({ name, email, password, phone });
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({ user: newUser, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', rateLimit(60000, 20), (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = db.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const safeUser = db.getUserById(user.id);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({ user: safeUser, token });
  } catch (err: any) {
    res.status(500).json({ error: 'Login error occurred.' });
  }
});

app.get('/api/auth/me', authMiddleware, (req: AuthRequest, res) => {
  const user = db.getUserById(req.user!.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user });
});

// Quick switch / demo account login (helps testing both User & Admin flows instantly)
app.post('/api/auth/quick-demo', (req, res) => {
  const { role } = req.body;
  const targetEmail = role === 'admin' ? 'admin@imovies.com' : 'user@imovies.com';
  const user = db.getUserByEmail(targetEmail);
  if (!user) return res.status(404).json({ error: 'Demo user not found.' });

  const safeUser = db.getUserById(user.id);
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  res.json({ user: safeUser, token });
});

// --- Movie Routes ---
app.get('/api/movies', (req, res) => {
  const { genre, language, search, status, industry } = req.query as Record<string, string>;
  const movies = db.getMovies({ genre, language, search, status, industry });
  res.json(movies);
});

app.get('/api/movies/:id', (req, res) => {
  const movie = db.getMovieById(req.params.id);
  if (!movie) return res.status(404).json({ error: 'Movie not found.' });
  res.json(movie);
});

app.post('/api/movies', authMiddleware, adminOnly, (req, res) => {
  try {
    const movie = db.createMovie(req.body);
    res.status(201).json(movie);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/movies/:id', authMiddleware, adminOnly, (req, res) => {
  try {
    const updated = db.updateMovie(req.params.id, req.body);
    if (!updated) return res.status(404).json({ error: 'Movie not found.' });
    res.json(updated);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/movies/:id', authMiddleware, adminOnly, (req, res) => {
  const deleted = db.deleteMovie(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Movie not found.' });
  res.json({ success: true, message: 'Movie and associated shows removed.' });
});

// --- Theatre Routes ---
app.get('/api/theatres', (req, res) => {
  const city = req.query.city as string | undefined;
  res.json(db.getTheatres(city));
});

app.get('/api/theatres/:id', (req, res) => {
  const theatre = db.getTheatreById(req.params.id);
  if (!theatre) return res.status(404).json({ error: 'Theatre not found.' });
  res.json(theatre);
});

app.post('/api/theatres', authMiddleware, adminOnly, (req, res) => {
  try {
    const theatre = db.createTheatre(req.body);
    res.status(201).json(theatre);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Show Routes ---
app.get('/api/shows', (req, res) => {
  const { movieId, theatreId, date, city } = req.query as Record<string, string>;
  const shows = db.getShows({ movieId, theatreId, date, city });
  res.json(shows);
});

app.get('/api/shows/:id', (req, res) => {
  const show = db.getShowById(req.params.id);
  if (!show) return res.status(404).json({ error: 'Showtime not found.' });
  res.json(show);
});

app.post('/api/shows', authMiddleware, adminOnly, (req, res) => {
  try {
    const show = db.createShow(req.body);
    res.status(201).json(show);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/shows/:id', authMiddleware, adminOnly, (req, res) => {
  const deleted = db.deleteShow(req.params.id);
  if (!deleted) return res.status(404).json({ error: 'Show not found.' });
  res.json({ success: true });
});

// --- Real-Time Seats & Lock Routes ---
app.get('/api/shows/:id/seats', (req: AuthRequest, res) => {
  try {
    const userId = req.headers['x-guest-session-id'] as string || req.user?.id || 'guest';
    const seats = db.getShowSeats(req.params.id, userId);
    res.json(seats);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/shows/:id/seats/lock', (req: AuthRequest, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.body.userId || req.user?.id || req.headers['x-guest-session-id'] as string;
    if (!userId) {
      return res.status(400).json({ error: 'User session identifier is required.' });
    }
    if (!Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'Please select at least one seat.' });
    }
    if (seatIds.length > 10) {
      return res.status(400).json({ error: 'Maximum 10 seats can be locked per transaction.' });
    }

    const result = db.lockSeats(req.params.id, seatIds, userId);
    res.json(result);
  } catch (err: any) {
    res.status(409).json({ error: err.message });
  }
});

app.post('/api/shows/:id/seats/unlock', (req: AuthRequest, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.body.userId || req.user?.id || req.headers['x-guest-session-id'] as string;
    if (userId && Array.isArray(seatIds)) {
      db.unlockSeats(req.params.id, seatIds, userId);
    }
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Snacks Catalog ---
app.get('/api/snacks', (_req, res) => {
  res.json(db.getSnacks());
});

// --- Booking & Payment Routes ---
app.post('/api/bookings', authMiddleware, rateLimit(60000, 15), (req: AuthRequest, res) => {
  try {
    const { showId, seatIds, snacks, paymentMethod, userPhone } = req.body;
    if (!showId || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ error: 'Invalid booking data. Select at least one seat.' });
    }

    const booking = db.createBooking({
      userId: req.user!.id,
      userName: req.user!.name,
      userEmail: req.user!.email,
      userPhone: userPhone || '+1 (555) 012-3456',
      showId,
      seatIds,
      snacks: snacks || [],
      paymentMethod: paymentMethod || 'Credit Card'
    });

    res.status(201).json(booking);
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Booking creation failed.' });
  }
});

app.get('/api/bookings/my', authMiddleware, (req: AuthRequest, res) => {
  const bookings = db.getUserBookings(req.user!.id);
  res.json(bookings);
});

app.get('/api/bookings/:id', authMiddleware, (req: AuthRequest, res) => {
  const bookings = db.getAllBookings();
  const booking = bookings.find((b) => b.id === req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found.' });

  // Only allow owner or admin
  if (booking.userId !== req.user!.id && req.user!.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized.' });
  }

  res.json(booking);
});

app.post('/api/bookings/:id/cancel', authMiddleware, (req: AuthRequest, res) => {
  try {
    const { reason } = req.body;
    const cancelled = db.cancelBooking(req.params.id, req.user!.id, reason);
    res.json(cancelled);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// --- Admin Operations & Analytics ---
app.get('/api/admin/analytics', authMiddleware, adminOnly, (_req, res) => {
  const analytics = db.getAnalytics();
  res.json(analytics);
});

app.get('/api/admin/bookings', authMiddleware, adminOnly, (_req, res) => {
  const bookings = db.getAllBookings();
  res.json(bookings);
});

// -----------------------------------------------------------------------------
// Vite Middleware / Static Server
// -----------------------------------------------------------------------------
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`[IMovies] Cinema Server listening on port ${PORT} (mode: ${isProd ? 'production' : 'development'})`);
  });
}

startServer().catch((err) => {
  console.error('Fatal server startup error:', err);
  process.exit(1);
});

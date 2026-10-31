import React, { useEffect, useState, useRef } from 'react';
import { 
  X, 
  Clock, 
  ShieldCheck, 
  ChevronRight, 
  Utensils, 
  CreditCard, 
  Smartphone, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Plus,
  Minus
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Booking, SeatInfo, Show, SnackItem } from '../types/cinema';

interface SeatBookingModalProps {
  show: Show;
  onClose: () => void;
  onBookingSuccess: (booking: Booking) => void;
}

type Step = 'seats' | 'snacks' | 'checkout';

export const SeatBookingModal: React.FC<SeatBookingModalProps> = ({
  show,
  onClose,
  onBookingSuccess
}) => {
  const { user, guestId, showToast, openAuthModal } = useAuth();
  const currentUserId = user?.id || guestId;

  const [step, setStep] = useState<Step>('seats');
  const [seats, setSeats] = useState<SeatInfo[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [isLoadingSeats, setIsLoadingSeats] = useState(true);
  
  // Real-time lock expiration countdown
  const [lockExpiresAt, setLockExpiresAt] = useState<number | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(0);

  // Snacks & Concessions
  const [snacksCatalog, setSnacksCatalog] = useState<SnackItem[]>([]);
  const [selectedSnacks, setSelectedSnacks] = useState<Record<string, number>>({});

  // Checkout inputs
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(user?.email || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '+1 (555) 234-5678');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'apple_pay' | 'upi'>('card');
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('08/28');
  const [cardCvc, setCardCvc] = useState('923');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Sync user changes to fields
  useEffect(() => {
    if (user) {
      if (!customerName) setCustomerName(user.name);
      if (!customerEmail) setCustomerEmail(user.email);
      if (user.phone && !customerPhone) setCustomerPhone(user.phone);
    }
  }, [user]);

  // Load seats and snacks
  const fetchSeats = async () => {
    try {
      const data = await api.getShowSeats(show.id);
      setSeats(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load seats.', 'error');
    } finally {
      setIsLoadingSeats(false);
    }
  };

  useEffect(() => {
    fetchSeats();
    // Poll seat changes every 6 seconds to keep seats real-time synced across browsers/tabs
    const pollInterval = setInterval(fetchSeats, 6000);

    api.getSnacks().then(setSnacksCatalog).catch(console.error);

    return () => {
      clearInterval(pollInterval);
    };
  }, [show.id]);

  // Countdown timer for locked seats
  useEffect(() => {
    if (!lockExpiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((lockExpiresAt - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      if (remaining === 0) {
        // Expired
        showToast('Your seat hold has expired. Please select seats again.', 'info');
        setSelectedSeatIds([]);
        setLockExpiresAt(null);
        fetchSeats();
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  // Handle seat click
  const handleToggleSeat = async (seat: SeatInfo) => {
    if (seat.status === 'booked') return;
    if (seat.status === 'locked' && seat.lockedBy !== currentUserId) {
      showToast('This seat is temporarily locked by another moviegoer.', 'info');
      return;
    }

    let newSelected: string[];
    if (selectedSeatIds.includes(seat.id)) {
      newSelected = selectedSeatIds.filter((id) => id !== seat.id);
    } else {
      if (selectedSeatIds.length >= 8) {
        showToast('Maximum 8 seats can be reserved at once.', 'info');
        return;
      }
      newSelected = [...selectedSeatIds, seat.id];
    }

    setSelectedSeatIds(newSelected);

    if (newSelected.length > 0) {
      try {
        const lockRes = await api.lockSeats(show.id, newSelected, currentUserId);
        setLockExpiresAt(lockRes.expiresAt);
        setTimeLeftSeconds(Math.floor((lockRes.expiresAt - Date.now()) / 1000));
      } catch (err: any) {
        showToast(err.message || 'Seat could not be locked.', 'error');
        // Rollback
        fetchSeats();
      }
    } else {
      await api.unlockSeats(show.id, selectedSeatIds, currentUserId);
      setLockExpiresAt(null);
    }
  };

  // Close & release seats
  const handleClose = async () => {
    if (selectedSeatIds.length > 0) {
      await api.unlockSeats(show.id, selectedSeatIds, currentUserId).catch(() => {});
    }
    onClose();
  };

  // Calculations
  const selectedSeatObjects = seats.filter((s) => selectedSeatIds.includes(s.id));
  const seatsTotal = selectedSeatObjects.reduce((sum, s) => sum + s.price, 0);

  const snacksTotal = Object.entries(selectedSnacks).reduce((sum, [snackId, qty]) => {
    const item = snacksCatalog.find((s) => s.id === snackId);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const subtotal = seatsTotal + snacksTotal;
  const convenienceFee = selectedSeatIds.length > 0 ? selectedSeatIds.length * 2.50 : 0;
  const tax = Number((subtotal * 0.0825).toFixed(2));
  const grandTotal = Number((subtotal + convenienceFee + tax).toFixed(2));

  // Snacks quantity update
  const updateSnackQty = (snackId: string, delta: number) => {
    setSelectedSnacks((prev) => {
      const current = prev[snackId] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const copy = { ...prev };
        delete copy[snackId];
        return copy;
      }
      return { ...prev, [snackId]: next };
    });
  };

  // Process final booking
  const handleCompleteBooking = async () => {
    if (!user) {
      showToast('Please sign in to confirm and save your booking ticket.', 'info');
      openAuthModal('login');
      return;
    }

    if (selectedSeatIds.length === 0) {
      showToast('Please choose your seats first.', 'error');
      setStep('seats');
      return;
    }

    setIsProcessingPayment(true);
    try {
      const formattedSnacks = Object.entries(selectedSnacks).map(([snackId, qty]) => ({
        snackId,
        qty
      }));

      const booking = await api.createBooking({
        showId: show.id,
        seatIds: selectedSeatIds,
        snacks: formattedSnacks,
        paymentMethod: paymentMethod === 'card' ? 'Visa •••• 4242' : paymentMethod === 'apple_pay' ? 'Apple Pay' : 'UPI Instant',
        userPhone: customerPhone
      });

      showToast(`Booking ${booking.bookingReference} confirmed! Enjoy the movie.`, 'success');
      onBookingSuccess(booking);
    } catch (err: any) {
      showToast(err.message || 'Payment processing failed.', 'error');
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Format countdown mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Group seats by row
  const rows = Array.from(new Set(seats.map((s) => s.row)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-auto text-slate-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                {show.format}
              </span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">
                {show.showDate} at {show.showTime}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <span>{show.movie?.title || 'IMovies Screen'}</span>
            </h2>
            <span className="text-xs text-slate-400">
              {show.theatre?.name} · {show.screenName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {lockExpiresAt && timeLeftSeconds > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Hold expires: {formatTime(timeLeftSeconds)}</span>
              </div>
            )}

            <button
              onClick={handleClose}
              className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              aria-label="Close seating reservation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center gap-2 sm:gap-6">
            <button
              onClick={() => setStep('seats')}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'seats' ? 'text-amber-400 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">1</span>
              <span>Select Seats ({selectedSeatIds.length})</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => {
                if (selectedSeatIds.length > 0) setStep('snacks');
              }}
              disabled={selectedSeatIds.length === 0}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'snacks' ? 'text-amber-400 font-bold' : selectedSeatIds.length > 0 ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">2</span>
              <span>Cinema Concessions</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
            <button
              onClick={() => {
                if (selectedSeatIds.length > 0) setStep('checkout');
              }}
              disabled={selectedSeatIds.length === 0}
              className={`flex items-center gap-1.5 transition-colors ${
                step === 'checkout' ? 'text-amber-400 font-bold' : selectedSeatIds.length > 0 ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 cursor-not-allowed'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[11px]">3</span>
              <span>Checkout & Pass</span>
            </button>
          </div>

          <div className="hidden sm:block text-slate-400 text-xs">
            Grand Total: <span className="text-amber-400 font-bold tabular-nums text-sm">${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Modal Main Content */}
        <div className="p-4 sm:p-6 min-h-[460px] max-h-[70vh] overflow-y-auto">
          
          {/* STEP 1: INTERACTIVE SEATS */}
          {step === 'seats' && (
            <div className="space-y-6">
              
              {/* Cinema Screen Representation */}
              <div className="flex flex-col items-center mb-8">
                <div className="w-3/4 max-w-lg h-3 rounded-t-full bg-gradient-to-r from-amber-400/20 via-amber-400 to-amber-400/20 shadow-[0_12px_24px_rgba(251,191,36,0.25)] mb-2" />
                <span className="text-[11px] font-semibold text-slate-400 tracking-widest uppercase">
                  Auditorium Curved Screen
                </span>
              </div>

              {/* Seating Grid */}
              {isLoadingSeats ? (
                <div className="py-20 text-center text-slate-400 animate-pulse text-sm">
                  Loading auditorium layout and real-time availability...
                </div>
              ) : (
                <div className="space-y-2 overflow-x-auto pb-4">
                  {rows.map((row) => {
                    const rowSeats = seats.filter((s) => s.row === row);
                    const tier = rowSeats[0]?.tier || 'standard';
                    
                    return (
                      <div key={row} className="flex items-center justify-center gap-1 sm:gap-2 min-w-[560px]">
                        {/* Row letter */}
                        <span className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {row}
                        </span>

                        {/* Seats in this row */}
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          {rowSeats.map((seat, colIndex) => {
                            const isSelected = selectedSeatIds.includes(seat.id);
                            const isBooked = seat.status === 'booked';
                            const isLockedByOther = seat.status === 'locked' && seat.lockedBy !== currentUserId;
                            const isAisle = colIndex === 5; // Aisle gap after seat 6

                            let seatStyle = 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700';

                            if (tier === 'vipRecliner') {
                              seatStyle = 'bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900 border-indigo-700/50';
                            } else if (tier === 'premium') {
                              seatStyle = 'bg-slate-850 text-slate-300 hover:bg-slate-750 border-slate-700';
                            }

                            if (isSelected) {
                              seatStyle = 'bg-amber-400 text-slate-950 font-bold border-amber-300 shadow-md shadow-amber-500/30 scale-110';
                            } else if (isBooked) {
                              seatStyle = 'bg-slate-950 text-slate-700 border-slate-900 cursor-not-allowed opacity-40';
                            } else if (isLockedByOther) {
                              seatStyle = 'bg-rose-950/50 text-rose-400 border-rose-800/40 cursor-not-allowed';
                            }

                            return (
                              <React.Fragment key={seat.id}>
                                <button
                                  type="button"
                                  onClick={() => handleToggleSeat(seat)}
                                  disabled={isBooked || isLockedByOther}
                                  title={`Seat ${seat.id} (${tier.toUpperCase()}) - $${seat.price.toFixed(2)}${isBooked ? ' [Reserved]' : isLockedByOther ? ' [Held by another guest]' : ''}`}
                                  className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-lg border text-[11px] font-mono flex items-center justify-center transition-all duration-150 ${seatStyle}`}
                                >
                                  {isLockedByOther ? (
                                    <Lock className="w-3 h-3 text-rose-400" />
                                  ) : (
                                    seat.col
                                  )}
                                </button>

                                {/* Middle Aisle Gap */}
                                {isAisle && <div className="w-4 sm:w-8" />}
                              </React.Fragment>
                            );
                          })}
                        </div>

                        {/* Row letter right */}
                        <span className="w-5 text-center text-xs font-mono font-bold text-slate-500">
                          {row}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-800 border border-slate-700" />
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-amber-400 text-slate-950 font-bold flex items-center justify-center text-[10px]">✓</div>
                  <span>Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-rose-950/50 border border-rose-800/40 flex items-center justify-center">
                    <Lock className="w-2.5 h-2.5 text-rose-400" />
                  </div>
                  <span>Held / Locked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-slate-950 border border-slate-900 opacity-40" />
                  <span>Reserved</span>
                </div>
                <div className="h-4 w-px bg-slate-800" />
                <div className="text-amber-400">
                  Standard: ${show.pricing.standard.toFixed(2)} · Premium: ${show.pricing.premium.toFixed(2)} · VIP Recliner: ${show.pricing.vipRecliner.toFixed(2)}
                </div>
              </div>

            </div>
          )}

          {/* STEP 2: CONCESSIONS & SNACKS */}
          {step === 'snacks' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-amber-400" />
                  <span>Cinema Gourmet Concessions & Treats</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Pre-order hot snacks and artisan drinks to skip the lobby queue. Delivered right to your seat or pick up at Express Counter.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {snacksCatalog.map((snack) => {
                  const qty = selectedSnacks[snack.id] || 0;
                  return (
                    <div
                      key={snack.id}
                      className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{snack.name}</h4>
                          <span className="text-sm font-mono font-bold text-amber-400 tabular-nums">
                            ${snack.price.toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {snack.description}
                        </p>
                      </div>

                      {/* Stepper */}
                      <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateSnackQty(snack.id, -1)}
                          disabled={qty === 0}
                          className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-750 disabled:opacity-30 text-white flex items-center justify-center transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono font-bold text-white tabular-nums">
                          {qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateSnackQty(snack.id, 1)}
                          className="w-7 h-7 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 flex items-center justify-center font-bold transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 3: CHECKOUT & PAYMENT */}
          {step === 'checkout' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
              
              {/* Left Column: Guest & Payment Form */}
              <div className="md:col-span-7 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white mb-1">
                    Contact & Pass Details
                  </h3>
                  <p className="text-xs text-slate-400">
                    Your digital tickets and QR pass will be issued immediately upon confirmation.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Full Name</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Email Address</label>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-slate-400 mb-1 font-medium">Mobile Phone (For SMS Ticket Link)</label>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-slate-400 text-xs mb-2 font-medium">
                    Payment Gateway
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between h-20 ${
                        paymentMethod === 'card'
                          ? 'border-amber-400 bg-slate-850 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-semibold">Credit / Debit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('apple_pay')}
                      className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between h-20 ${
                        paymentMethod === 'apple_pay'
                          ? 'border-amber-400 bg-slate-850 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Smartphone className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-semibold">Apple / Google Pay</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-left transition-colors flex flex-col justify-between h-20 ${
                        paymentMethod === 'upi'
                          ? 'border-amber-400 bg-slate-850 text-white'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4 text-sky-400" />
                      <span className="text-xs font-semibold">Instant UPI</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' && (
                  <div className="space-y-3 p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-slate-400 mb-1">Expiry Date</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 mb-1">CVC / CVV</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Right Column: Reservation Invoice Summary */}
              <div className="md:col-span-5 bg-slate-950 p-6 rounded-2xl border border-slate-800 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 pb-2 border-b border-slate-800">
                    Reservation Breakdown
                  </h4>

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-white">{show.movie?.title}</div>
                        <div className="text-slate-400">{show.theatre?.name} · {show.screenName}</div>
                        <div className="text-slate-400">{show.showDate} at {show.showTime}</div>
                      </div>
                    </div>

                    <div className="py-2 border-t border-slate-800/80">
                      <div className="flex justify-between text-slate-300 font-medium mb-1">
                        <span>Selected Seats ({selectedSeatIds.join(', ')})</span>
                        <span className="font-mono tabular-nums text-white">${seatsTotal.toFixed(2)}</span>
                      </div>
                      {selectedSeatObjects.map((s) => (
                        <div key={s.id} className="flex justify-between text-[11px] text-slate-500 pl-2">
                          <span>Seat {s.id} ({s.tier})</span>
                          <span>${s.price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {Object.keys(selectedSnacks).length > 0 && (
                      <div className="py-2 border-t border-slate-800/80">
                        <div className="flex justify-between text-slate-300 font-medium mb-1">
                          <span>Concessions</span>
                          <span className="font-mono tabular-nums text-white">${snacksTotal.toFixed(2)}</span>
                        </div>
                        {Object.entries(selectedSnacks).map(([snackId, qty]) => {
                          const item = snacksCatalog.find((s) => s.id === snackId);
                          return (
                            <div key={snackId} className="flex justify-between text-[11px] text-slate-500 pl-2">
                              <span>{qty}x {item?.name}</span>
                              <span>${((item?.price || 0) * qty).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="py-2 border-t border-slate-800/80 space-y-1">
                      <div className="flex justify-between text-slate-400">
                        <span>Convenience Fee</span>
                        <span className="font-mono tabular-nums">${convenienceFee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>State & Cinema Taxes (8.25%)</span>
                        <span className="font-mono tabular-nums">${tax.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Amount Due</span>
                      <span className="text-xl font-extrabold text-amber-400 font-mono tabular-nums">
                        ${grandTotal.toFixed(2)}
                      </span>
                    </div>

                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>256-bit SSL encrypted. 90% instant refund on cancellation up to 2 hours before show.</span>
                </div>

              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Action Controls */}
        <div className="px-6 py-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <div>
            {step === 'seats' ? (
              <div className="text-xs text-slate-400">
                {selectedSeatIds.length === 0 ? (
                  <span>Please choose your seats on the map above.</span>
                ) : (
                  <span>
                    Selected: <strong className="text-white">{selectedSeatIds.join(', ')}</strong> ({selectedSeatIds.length} tickets)
                  </span>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setStep(step === 'checkout' ? 'snacks' : 'seats')}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            {step === 'seats' && (
              <button
                type="button"
                disabled={selectedSeatIds.length === 0}
                onClick={() => setStep('snacks')}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span>Proceed to Concessions</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 'snacks' && (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <span>Continue to Checkout</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}

            {step === 'checkout' && (
              <button
                type="button"
                onClick={handleCompleteBooking}
                disabled={isProcessingPayment}
                className="px-8 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-500/20 active:scale-95"
              >
                {isProcessingPayment ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Pay ${grandTotal.toFixed(2)}</span>
                  </>
                )}
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

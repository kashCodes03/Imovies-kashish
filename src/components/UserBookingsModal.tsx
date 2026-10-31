import React, { useEffect, useState } from 'react';
import { 
  Ticket, 
  Calendar, 
  MapPin, 
  X, 
  AlertTriangle, 
  QrCode, 
  RotateCcw,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { Booking } from '../types/cinema';

interface UserBookingsModalProps {
  onClose: () => void;
  onOpenTicket: (booking: Booking) => void;
}

export const UserBookingsModal: React.FC<UserBookingsModalProps> = ({
  onClose,
  onOpenTicket
}) => {
  const { user, showToast, openAuthModal } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'confirmed' | 'cancelled'>('all');
  
  // Cancellation dialog
  const [cancellingBooking, setCancellingBooking] = useState<Booking | null>(null);
  const [cancellationReason, setCancellationReason] = useState('Change of schedule');
  const [isCancelling, setIsCancelling] = useState(false);

  const fetchBookings = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await api.getMyBookings();
      setBookings(data);
    } catch (err: any) {
      showToast(err.message || 'Failed to load bookings.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [user]);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    try {
      const updated = await api.cancelBooking(cancellingBooking.id, cancellationReason);
      showToast(`Reservation ${updated.bookingReference} has been cancelled. Refund initiated.`, 'info');
      setCancellingBooking(null);
      fetchBookings();
    } catch (err: any) {
      showToast(err.message || 'Failed to cancel booking.', 'error');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === 'confirmed') return b.bookingStatus === 'confirmed';
    if (activeTab === 'cancelled') return b.bookingStatus === 'cancelled';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl my-8 text-slate-100 flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Ticket className="w-5 h-5 text-amber-400" />
              <span>My Cinema Reservations</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Manage your cinema passes, view QR entry codes, or request instant cancellations.
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Filters */}
        <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'all' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All Passes ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'confirmed' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Active Passes ({bookings.filter((b) => b.bookingStatus === 'confirmed').length})
            </button>
            <button
              onClick={() => setActiveTab('cancelled')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'cancelled' ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancelled / Refunded
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {!user ? (
            <div className="py-16 text-center space-y-4">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-base font-bold text-white">Sign In to View Your Passes</div>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Sign in or use our instant demo login to view your confirmed cinema passes and cancellation records.
              </p>
              <button
                onClick={() => openAuthModal('login')}
                className="px-6 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Sign In
              </button>
            </div>
          ) : isLoading ? (
            <div className="py-16 text-center text-slate-400 animate-pulse text-sm">
              Loading your bookings history...
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <Ticket className="w-12 h-12 text-slate-600 mx-auto" />
              <div className="text-base font-bold text-white">No Reservations Found</div>
              <p className="text-xs text-slate-400">
                You do not have any {activeTab !== 'all' ? activeTab : ''} tickets booked yet.
              </p>
            </div>
          ) : (
            filteredBookings.map((booking) => {
              const isConfirmed = booking.bookingStatus === 'confirmed';

              return (
                <div
                  key={booking.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 ${
                    isConfirmed
                      ? 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-900 opacity-75'
                  }`}
                >
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                        {booking.bookingReference}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span className="text-xs font-mono font-medium text-slate-400">
                        {booking.format}
                      </span>
                      <span className="text-xs text-slate-500">·</span>
                      <span
                        className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                          isConfirmed
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-rose-950 text-rose-300 border border-rose-800'
                        }`}
                      >
                        {isConfirmed ? 'Confirmed' : 'Cancelled & Refunded'}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {booking.movieTitle}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" />
                        {booking.showDate} at {booking.showTime}
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        {booking.theatreName} ({booking.screenName})
                      </span>
                      <span className="text-slate-600">·</span>
                      <span className="font-mono font-semibold text-slate-200">
                        Seats: {booking.seats.map((s) => s.seatId).join(', ')}
                      </span>
                    </div>

                    {booking.cancellation && (
                      <div className="text-[11px] text-rose-400 bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                        Cancelled on {new Date(booking.cancellation.cancelledAt).toLocaleDateString()} · Refund of ${booking.cancellation.refundAmount.toFixed(2)} processed ({booking.cancellation.refundPercentage}% policy).
                      </div>
                    )}
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between gap-3 pt-3 md:pt-0 border-t md:border-t-0 border-slate-800">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 uppercase block">Total</span>
                      <span className="text-base font-mono font-bold text-white tabular-nums">
                        ${booking.totalAmount.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isConfirmed && (
                        <>
                          <button
                            onClick={() => onOpenTicket(booking)}
                            className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>View Pass</span>
                          </button>

                          <button
                            onClick={() => setCancellingBooking(booking)}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 hover:text-rose-300 hover:border-rose-800 border border-slate-700 text-slate-400 text-xs font-medium transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Cancellation Confirmation Dialog Overlay */}
        {cancellingBooking && (
          <div className="absolute inset-0 z-30 bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center gap-3 text-rose-400">
                <AlertTriangle className="w-6 h-6 shrink-0" />
                <h3 className="text-base font-bold text-white">
                  Cancel Reservation {cancellingBooking.bookingReference}?
                </h3>
              </div>

              <div className="text-xs text-slate-300 space-y-2">
                <p>
                  Movie: <strong className="text-white">{cancellingBooking.movieTitle}</strong>
                </p>
                <p>
                  Showtime: {cancellingBooking.showDate} at {cancellingBooking.showTime}
                </p>
                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Original Amount:</span>
                    <span className="font-mono text-white">${cancellingBooking.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-400 font-semibold">
                    <span>Refund Amount (90%):</span>
                    <span className="font-mono">${(cancellingBooking.totalAmount * 0.9).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 text-[10px]">
                    <span>Cinema processing fee (10%):</span>
                    <span className="font-mono">${(cancellingBooking.totalAmount * 0.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Reason for cancellation</label>
                <select
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white"
                >
                  <option value="Change of plans">Change of plans</option>
                  <option value="Accidental booking">Accidental booking</option>
                  <option value="Booking different showtime">Booking different showtime</option>
                  <option value="Personal emergency">Personal emergency</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setCancellingBooking(null)}
                  disabled={isCancelling}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Keep Reservation
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isCancelling}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-900/30"
                >
                  {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

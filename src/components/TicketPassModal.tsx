import React from 'react';
import { X, Printer, Calendar, Check, Ticket, MapPin, Sparkles } from 'lucide-react';
import type { Booking } from '../types/cinema';

interface TicketPassModalProps {
  booking: Booking;
  onClose: () => void;
}

export const TicketPassModal: React.FC<TicketPassModalProps> = ({
  booking,
  onClose
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-100 my-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Control */}
        <div className="p-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
            <Sparkles className="w-4 h-4" />
            <span>Official IMovies Digital Cinema Pass</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            aria-label="Close pass"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Boarding Ticket Card */}
        <div className="p-6">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-inner print:border-black print:text-black">
            
            {/* Header of Ticket */}
            <div className="bg-gradient-to-r from-amber-500 to-amber-600 p-4 text-slate-950 flex items-center justify-between">
              <div>
                <div className="text-[10px] font-extrabold tracking-widest uppercase">
                  IMovies Cinema Pass
                </div>
                <div className="text-xl font-black tracking-tight">
                  {booking.format}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-900/80">Ref Code</div>
                <div className="text-base font-mono font-black">{booking.bookingReference}</div>
              </div>
            </div>

            {/* Ticket Body */}
            <div className="p-5 space-y-4">
              <div>
                <h3 className="text-lg font-extrabold text-white leading-tight">
                  {booking.movieTitle}
                </h3>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>{booking.theatreName} · {booking.screenName}</span>
                </div>
              </div>

              {/* Grid Specs */}
              <div className="grid grid-cols-3 gap-2 p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Date</span>
                  <span className="text-white font-semibold">{booking.showDate}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Showtime</span>
                  <span className="text-amber-400 font-bold">{booking.showTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Seats</span>
                  <span className="text-white font-mono font-bold">
                    {booking.seats.map((s) => s.seatId).join(', ')}
                  </span>
                </div>
              </div>

              {/* Guest & Concessions info */}
              <div className="flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase">Guest</span>
                  <span className="text-slate-200 font-medium">{booking.userName}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px] uppercase">Amount Paid</span>
                  <span className="text-amber-400 font-mono font-bold tabular-nums">
                    ${booking.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {booking.snacks && booking.snacks.length > 0 && (
                <div className="p-2.5 rounded-lg bg-slate-900/50 border border-slate-800/60 text-[11px] text-slate-300">
                  <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5">Concessions Voucher</span>
                  <span>{booking.snacks.map((sn) => `${sn.qty}x ${sn.name}`).join(' · ')}</span>
                </div>
              )}

              {/* Perforated Divider with Notches */}
              <div className="relative py-2 flex items-center">
                <div className="w-full border-t border-dashed border-slate-700" />
              </div>

              {/* Scannable SVG QR Code */}
              <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white text-slate-950">
                <svg
                  className="w-36 h-36"
                  viewBox="0 0 120 120"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Position detection squares (Corners) */}
                  <rect x="10" y="10" width="30" height="30" fill="black" />
                  <rect x="15" y="15" width="20" height="20" fill="white" />
                  <rect x="20" y="20" width="10" height="10" fill="black" />

                  <rect x="80" y="10" width="30" height="30" fill="black" />
                  <rect x="85" y="15" width="20" height="20" fill="white" />
                  <rect x="90" y="20" width="10" height="10" fill="black" />

                  <rect x="10" y="80" width="30" height="30" fill="black" />
                  <rect x="15" y="85" width="20" height="20" fill="white" />
                  <rect x="20" y="90" width="10" height="10" fill="black" />

                  {/* QR Data Matrix Points */}
                  <rect x="45" y="15" width="5" height="5" fill="black" />
                  <rect x="55" y="15" width="5" height="5" fill="black" />
                  <rect x="65" y="15" width="5" height="5" fill="black" />
                  <rect x="45" y="25" width="10" height="5" fill="black" />
                  <rect x="60" y="25" width="5" height="5" fill="black" />

                  <rect x="15" y="50" width="5" height="5" fill="black" />
                  <rect x="25" y="55" width="5" height="5" fill="black" />
                  <rect x="35" y="50" width="10" height="5" fill="black" />
                  <rect x="50" y="45" width="20" height="10" fill="black" />
                  <rect x="75" y="50" width="15" height="5" fill="black" />
                  <rect x="95" y="55" width="10" height="5" fill="black" />

                  <rect x="45" y="70" width="10" height="5" fill="black" />
                  <rect x="65" y="75" width="5" height="5" fill="black" />
                  <rect x="55" y="85" width="10" height="10" fill="black" />
                  <rect x="75" y="85" width="15" height="5" fill="black" />
                  <rect x="90" y="95" width="15" height="10" fill="black" />
                  <rect x="75" y="100" width="10" height="5" fill="black" />
                </svg>
                <div className="font-mono text-[10px] tracking-wider text-slate-800 font-bold mt-1">
                  SCAN AT CINEMA AUDITORIUM ENTRANCE
                </div>
              </div>

              {/* Barcode lines */}
              <div className="h-6 w-full flex items-center justify-between px-2 pt-1 opacity-70">
                {Array.from({ length: 42 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-full bg-slate-400 ${i % 3 === 0 ? 'w-1' : i % 5 === 0 ? 'w-1.5' : 'w-0.5'}`}
                  />
                ))}
              </div>

            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print Pass / PDF</span>
          </button>

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  User,
  Phone,
  Receipt,
  Sparkles,
  Key,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  X,
  BedDouble,
  DollarSign
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

interface Room {
  id: string;
  number: string;
  type: string;
  floor: number;
  ratePerNight: number;
  status: 'AVAILABLE' | 'OCCUPIED' | 'CLEANING' | 'RESERVED' | 'MAINTENANCE';
}

interface ReservationBlock {
  id: string;
  roomId: string;
  guestName: string;
  phone: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  nights: number;
  totalFolio: number;
  status: 'CHECKED_IN' | 'CONFIRMED' | 'DUE_OUT';
  pax: number;
}

const ROOMS: Room[] = [
  { id: 'r-101', number: '101', type: 'Deluxe King', floor: 1, ratePerNight: 5500, status: 'OCCUPIED' },
  { id: 'r-102', number: '102', type: 'Deluxe Twin', floor: 1, ratePerNight: 5200, status: 'AVAILABLE' },
  { id: 'r-103', number: '103', type: 'Executive Suite', floor: 1, ratePerNight: 8500, status: 'OCCUPIED' },
  { id: 'r-104', number: '104', type: 'Standard King', floor: 1, ratePerNight: 4200, status: 'CLEANING' },
  { id: 'r-201', number: '201', type: 'Ocean View Suite', floor: 2, ratePerNight: 9500, status: 'OCCUPIED' },
  { id: 'r-202', number: '202', type: 'Ocean View Suite', floor: 2, ratePerNight: 9500, status: 'RESERVED' },
  { id: 'r-203', number: '203', type: 'Executive Suite', floor: 2, ratePerNight: 8500, status: 'OCCUPIED' },
  { id: 'r-301', number: '301', type: 'Presidential Penthouse', floor: 3, ratePerNight: 22000, status: 'OCCUPIED' },
  { id: 'r-302', number: '302', type: 'Pool Villa', floor: 3, ratePerNight: 16000, status: 'AVAILABLE' },
  { id: 'r-303', number: '303', type: 'Garden Villa', floor: 3, ratePerNight: 14000, status: 'MAINTENANCE' }
];

const RESERVATIONS: ReservationBlock[] = [
  { id: 'res-01', roomId: 'r-101', guestName: 'Rajesh & Sunita Mehra', phone: '+91 98201 45879', checkIn: '2026-08-23', checkOut: '2026-08-26', nights: 3, totalFolio: 16500, status: 'CHECKED_IN', pax: 2 },
  { id: 'res-02', roomId: 'r-103', guestName: 'Vikramaditya Singhania', phone: '+91 98112 34567', checkIn: '2026-08-24', checkOut: '2026-08-28', nights: 4, totalFolio: 34000, status: 'CHECKED_IN', pax: 1 },
  { id: 'res-03', roomId: 'r-201', guestName: 'Captain Arvind Rao', phone: '+91 99401 22334', checkIn: '2026-08-22', checkOut: '2026-08-25', nights: 3, totalFolio: 28500, status: 'DUE_OUT', pax: 2 },
  { id: 'res-04', roomId: 'r-202', guestName: 'Meera & Siddharth Roy', phone: '+91 97170 88990', checkIn: '2026-08-25', checkOut: '2026-08-29', nights: 4, totalFolio: 38000, status: 'CONFIRMED', pax: 2 },
  { id: 'res-05', roomId: 'r-203', guestName: 'Alexander Wright', phone: '+44 7700 900077', checkIn: '2026-08-24', checkOut: '2026-08-27', nights: 3, totalFolio: 25500, status: 'CHECKED_IN', pax: 1 },
  { id: 'res-06', roomId: 'r-301', guestName: 'Dr. Harshvardhan Kapoor', phone: '+91 98210 99887', checkIn: '2026-08-21', checkOut: '2026-08-26', nights: 5, totalFolio: 110000, status: 'CHECKED_IN', pax: 4 }
];

const DAYS = [
  { day: 'Mon', date: '24 Aug', iso: '2026-08-24', isToday: true },
  { day: 'Tue', date: '25 Aug', iso: '2026-08-25', isToday: false },
  { day: 'Wed', date: '26 Aug', iso: '2026-08-26', isToday: false },
  { day: 'Thu', date: '27 Aug', iso: '2026-08-27', isToday: false },
  { day: 'Fri', date: '28 Aug', iso: '2026-08-28', isToday: false },
  { day: 'Sat', date: '29 Aug', iso: '2026-08-29', isToday: false },
  { day: 'Sun', date: '30 Aug', iso: '2026-08-30', isToday: false }
];

export default function RoomRackPage() {
  const [selectedRes, setSelectedRes] = useState<ReservationBlock | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterFloor, setFilterFloor] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRooms = ROOMS.filter(room => {
    const matchesFloor = filterFloor === 'ALL' || room.floor.toString() === filterFloor;
    const matchesSearch = room.number.includes(searchTerm) || room.type.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFloor && matchesSearch;
  });

  const getReservationForRoomOnDate = (roomId: string, dateIso: string) => {
    return RESERVATIONS.find(res => {
      return res.roomId === roomId && dateIso >= res.checkIn && dateIso <= res.checkOut;
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              PMS Room Rack & Tape Chart
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live Tape Chart
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Visual room occupancy timeline, check-in status, quick folio billing, and turnover coordination.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl p-1 text-xs">
            <button className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 font-semibold text-[var(--color-text)]">24 Aug - 30 Aug 2026</span>
            <button className="p-1.5 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Occupancy Rate</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">80.0%</p>
          <span className="text-[10px] text-emerald-500 font-semibold">+6% vs last week</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Occupied Rooms</span>
          <p className="text-2xl font-black text-[var(--color-text)] mt-1">8 / 10</p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">In-house guests</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Available Tonight</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">2 Rooms</p>
          <span className="text-[10px] text-emerald-600">Ready for walk-ins</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Arriving Today</span>
          <p className="text-2xl font-black text-indigo-500 mt-1">2 Guests</p>
          <span className="text-[10px] text-indigo-400">Pre-checkins active</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Departures (Due Out)</span>
          <p className="text-2xl font-black text-amber-500 mt-1">1 Room</p>
          <span className="text-[10px] text-amber-400">11:00 AM check-out</span>
        </div>
      </div>

      {/* Search & Floor Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room number or type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex items-center gap-1.5">
            {['ALL', '1', '2', '3'].map(floor => (
              <button
                key={floor}
                onClick={() => setFilterFloor(floor)}
                className={cn(
                  "px-3 py-1 text-xs font-semibold rounded-lg transition-colors",
                  filterFloor === floor 
                    ? "bg-blue-600 text-white" 
                    : "bg-[var(--color-bg)] text-[var(--color-text-secondary)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                )}
              >
                {floor === 'ALL' ? 'All Floors' : `Floor ${floor}`}
              </button>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium flex-wrap">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600" /> Checked In</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Reserved</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Due Out</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-500" /> Cleaning / Maint</span>
        </div>
      </div>

      {/* Interactive Tape Chart Grid */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-secondary)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg)] text-xs">
                <th className="py-3.5 px-4 text-left font-bold text-[var(--color-text)] w-60 sticky left-0 bg-[var(--color-bg)] z-10 border-r border-[var(--color-border)]">
                  Room Details
                </th>
                {DAYS.map(d => (
                  <th key={d.iso} className={cn("py-3 px-3 text-center font-semibold text-xs border-r border-[var(--color-border)] min-w-[130px]", d.isToday && "bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold")}>
                    <div>{d.day}</div>
                    <div className="text-[11px] text-[var(--color-text-secondary)] font-normal">{d.date}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)] text-xs">
              {filteredRooms.map(room => (
                <tr key={room.id} className="hover:bg-[var(--color-bg)] transition-colors">
                  {/* Sticky Room Label */}
                  <td className="py-3 px-4 sticky left-0 bg-[var(--color-bg-secondary)] z-10 border-r border-[var(--color-border)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-sm text-[var(--color-text)]">{room.number}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                            F{room.floor}
                          </span>
                        </div>
                        <p className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[130px]">{room.type}</p>
                      </div>
                      <span className="text-[11px] font-bold text-[var(--color-text)]">{formatCurrency(room.ratePerNight)}</span>
                    </div>
                  </td>

                  {/* Day Slots */}
                  {DAYS.map(d => {
                    const res = getReservationForRoomOnDate(room.id, d.iso);
                    const isFirstDay = res && res.checkIn === d.iso;

                    return (
                      <td key={d.iso} className={cn("p-1.5 border-r border-[var(--color-border)] text-center relative", d.isToday && "bg-blue-500/5")}>
                        {res ? (
                          <button
                            onClick={() => {
                              setSelectedRes(res);
                              setSelectedRoom(room);
                            }}
                            className={cn(
                              "w-full h-12 rounded-xl px-2 py-1 flex flex-col justify-center text-left text-white text-[11px] font-semibold transition-transform hover:scale-[1.02] shadow-sm",
                              res.status === 'CHECKED_IN' ? "bg-gradient-to-r from-blue-600 to-indigo-600" :
                              res.status === 'DUE_OUT' ? "bg-gradient-to-r from-amber-600 to-orange-600" :
                              "bg-gradient-to-r from-sky-600 to-blue-600"
                            )}
                          >
                            <span className="truncate block font-bold leading-tight">{res.guestName}</span>
                            <span className="text-[9px] opacity-80 leading-tight block">
                              {res.status === 'CHECKED_IN' ? 'In House' : res.status === 'DUE_OUT' ? 'Check Out' : 'Reserved'} • {res.pax}pax
                            </span>
                          </button>
                        ) : (
                          <div className={cn(
                            "w-full h-12 rounded-xl flex items-center justify-center text-[10px] font-semibold transition-colors border",
                            room.status === 'CLEANING' ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            room.status === 'MAINTENANCE' ? "bg-slate-500/10 text-slate-500 border-slate-500/20" :
                            "bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/15 border-dashed border-emerald-500/20 cursor-pointer"
                          )}>
                            {room.status === 'CLEANING' ? 'Cleaning' : 
                             room.status === 'MAINTENANCE' ? 'Blocked' : 
                             '+ Available'}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest Folio & Reservation Detail Modal */}
      <AnimatePresence>
        {selectedRes && selectedRoom && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-mono font-bold text-sm shadow-md">
                    {selectedRoom.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[var(--color-text)]">{selectedRes.guestName}</h3>
                    <p className="text-xs text-[var(--color-text-secondary)]">{selectedRoom.type} • Floor {selectedRoom.floor}</p>
                  </div>
                </div>
                <button onClick={() => { setSelectedRes(null); setSelectedRoom(null); }} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                {/* Dates & Duration Banner */}
                <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                  <div>
                    <span className="text-[var(--color-text-secondary)] block text-[10px]">CHECK-IN</span>
                    <span className="font-bold text-sm text-[var(--color-text)]">{selectedRes.checkIn}</span>
                    <span className="text-[10px] text-blue-500 block">From 2:00 PM</span>
                  </div>
                  <div>
                    <span className="text-[var(--color-text-secondary)] block text-[10px]">CHECK-OUT</span>
                    <span className="font-bold text-sm text-[var(--color-text)]">{selectedRes.checkOut}</span>
                    <span className="text-[10px] text-amber-500 block">11:00 AM ({selectedRes.nights} Nights)</span>
                  </div>
                </div>

                {/* Contact & Guests */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-blue-500" /> Phone:</span>
                    <span className="font-semibold text-[var(--color-text)]">{selectedRes.phone}</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)]">
                    <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-blue-500" /> Occupancy:</span>
                    <span className="font-semibold text-[var(--color-text)]">{selectedRes.pax} Guests</span>
                  </div>
                </div>

                {/* Folio Financial Breakdown */}
                <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[var(--color-text)]">Total Room Folio</span>
                    <span className="text-base font-black text-blue-600 dark:text-blue-400">{formatCurrency(selectedRes.totalFolio)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[var(--color-text-secondary)]">
                    <span>Nightly Rate ({selectedRes.nights}x)</span>
                    <span>{formatCurrency(selectedRoom.ratePerNight)} / night</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 grid grid-cols-2 gap-3">
                  <button className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20">
                    <Key className="w-3.5 h-3.5" />
                    Issue Digital Keycard
                  </button>
                  <button className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/20">
                    <Receipt className="w-3.5 h-3.5" />
                    Print / Send Folio
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

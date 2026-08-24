'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  User,
  Filter,
  Search,
  BedDouble,
  ShieldCheck,
  RotateCcw,
  Plus,
  X,
  Phone
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

type HousekeepingStatus = 'CLEAN_INSPECTED' | 'DIRTY_DEPARTURE' | 'IN_PROGRESS' | 'TOUCH_UP' | 'OUT_OF_SERVICE';

interface HousekeepingRoom {
  id: string;
  roomNumber: string;
  type: string;
  floor: number;
  status: HousekeepingStatus;
  attendant: string;
  priority: 'NORMAL' | 'HIGH_VIP' | 'RUSH_ARRIVAL';
  lastCleaned: string;
  notes?: string;
}

const INITIAL_ROOMS: HousekeepingRoom[] = [
  { id: 'hk-101', roomNumber: '101', type: 'Deluxe King', floor: 1, status: 'CLEAN_INSPECTED', attendant: 'Sunita Mehra', priority: 'NORMAL', lastCleaned: '10:30 AM Today' },
  { id: 'hk-102', roomNumber: '102', type: 'Deluxe Twin', floor: 1, status: 'CLEAN_INSPECTED', attendant: 'Sunita Mehra', priority: 'NORMAL', lastCleaned: '11:15 AM Today' },
  { id: 'hk-103', roomNumber: '103', type: 'Executive Suite', floor: 1, status: 'DIRTY_DEPARTURE', attendant: 'Ramesh Kumar', priority: 'RUSH_ARRIVAL', lastCleaned: 'Yesterday', notes: 'VIP Guest arriving at 2:00 PM' },
  { id: 'hk-104', roomNumber: '104', type: 'Standard King', floor: 1, status: 'IN_PROGRESS', attendant: 'Ramesh Kumar', priority: 'NORMAL', lastCleaned: 'Turnover in progress' },
  { id: 'hk-201', roomNumber: '201', type: 'Ocean View Suite', floor: 2, status: 'TOUCH_UP', attendant: 'Priya Nair', priority: 'HIGH_VIP', lastCleaned: '9:00 AM Today', notes: 'Change fresh towel set & replenishment' },
  { id: 'hk-202', roomNumber: '202', type: 'Ocean View Suite', floor: 2, status: 'CLEAN_INSPECTED', attendant: 'Priya Nair', priority: 'NORMAL', lastCleaned: '12:00 PM Today' },
  { id: 'hk-203', roomNumber: '203', type: 'Executive Suite', floor: 2, status: 'IN_PROGRESS', attendant: 'Ramesh Kumar', priority: 'NORMAL', lastCleaned: 'Strip linens' },
  { id: 'hk-301', roomNumber: '301', type: 'Presidential Penthouse', floor: 3, status: 'CLEAN_INSPECTED', attendant: 'Sunita Mehra', priority: 'HIGH_VIP', lastCleaned: '1:00 PM Today', notes: 'Champagne bucket & fruit basket prepared' },
  { id: 'hk-302', roomNumber: '302', type: 'Pool Villa', floor: 3, status: 'CLEAN_INSPECTED', attendant: 'Priya Nair', priority: 'NORMAL', lastCleaned: 'Yesterday' },
  { id: 'hk-303', roomNumber: '303', type: 'Garden Villa', floor: 3, status: 'OUT_OF_SERVICE', attendant: 'Engineering Team', priority: 'NORMAL', lastCleaned: 'AC Servicing', notes: 'Air conditioner blower replacement' }
];

export default function HousekeepingPage() {
  const [rooms, setRooms] = useState<HousekeepingRoom[]>(INITIAL_ROOMS);
  const [filterFloor, setFilterFloor] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const updateStatus = (id: string, newStatus: HousekeepingStatus) => {
    setRooms(prev => prev.map(r => r.id === id ? { ...r, status: newStatus, lastCleaned: 'Just now' } : r));
  };

  const filtered = rooms.filter(r => {
    const matchesFloor = filterFloor === 'ALL' || r.floor.toString() === filterFloor;
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesSearch = r.roomNumber.includes(searchTerm) || r.attendant.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFloor && matchesStatus && matchesSearch;
  });

  const inspectedCount = rooms.filter(r => r.status === 'CLEAN_INSPECTED').length;
  const inProgressCount = rooms.filter(r => r.status === 'IN_PROGRESS' || r.status === 'TOUCH_UP').length;
  const dirtyCount = rooms.filter(r => r.status === 'DIRTY_DEPARTURE').length;
  const oosCount = rooms.filter(r => r.status === 'OUT_OF_SERVICE').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              Housekeeping & Room Operations
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Live Turnover Board
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Real-time room cleaning status, supervisor inspections, attendant task dispatch, and priority rush alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" />
            {inspectedCount} Rooms Ready for Check-in
          </div>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Clean & Inspected</span>
          <p className="text-2xl font-black text-emerald-500 mt-1">{inspectedCount} Rooms</p>
          <span className="text-[10px] text-emerald-600 font-medium">100% QA passed</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">In Cleaning Progress</span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{inProgressCount} Rooms</p>
          <span className="text-[10px] text-[var(--color-text-secondary)]">Staff actively assigned</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Dirty / Departure Rush</span>
          <p className="text-2xl font-black text-amber-500 mt-1">{dirtyCount} Rooms</p>
          <span className="text-[10px] text-amber-600 font-semibold">Priority check-in queue</span>
        </div>
        <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
          <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Out of Service / Maint</span>
          <p className="text-2xl font-black text-rose-500 mt-1">{oosCount} Room</p>
          <span className="text-[10px] text-rose-600 font-medium">Engineering ticket active</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search room number or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-1">
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

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="CLEAN_INSPECTED">Clean & Inspected Only</option>
          <option value="DIRTY_DEPARTURE">Dirty / Needs Cleaning</option>
          <option value="IN_PROGRESS">Cleaning In Progress</option>
          <option value="OUT_OF_SERVICE">Out of Service</option>
        </select>
      </div>

      {/* Housekeeping Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(room => (
          <div
            key={room.id}
            className={cn(
              "p-5 rounded-2xl border bg-[var(--color-bg-secondary)] space-y-4 transition-all hover:shadow-md",
              room.status === 'CLEAN_INSPECTED' ? "border-emerald-500/30" :
              room.status === 'DIRTY_DEPARTURE' ? "border-amber-500/30" :
              room.status === 'IN_PROGRESS' ? "border-blue-500/30" :
              room.status === 'OUT_OF_SERVICE' ? "border-rose-500/30" :
              "border-[var(--color-border)]"
            )}
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-mono font-bold text-[var(--color-text)]">Room {room.roomNumber}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)] font-semibold">
                    Floor {room.floor}
                  </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">{room.type}</p>
              </div>

              {room.priority === 'RUSH_ARRIVAL' && (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                  <Clock className="w-3 h-3" /> Rush 2 PM
                </span>
              )}
              {room.priority === 'HIGH_VIP' && (
                <span className="px-2 py-1 rounded-md text-[10px] font-bold bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> VIP Setup
                </span>
              )}
            </div>

            {/* Attendant & Last Action */}
            <div className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-blue-500" /> Attendant:
                </span>
                <span className="font-semibold text-[var(--color-text)]">{room.attendant}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[var(--color-text-secondary)] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-blue-500" /> Status Updated:
                </span>
                <span className="text-[var(--color-text-secondary)]">{room.lastCleaned}</span>
              </div>
              {room.notes && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 italic pt-1 border-t border-[var(--color-border)]">
                  Note: {room.notes}
                </p>
              )}
            </div>

            {/* Status Change Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">Change Housekeeping Status</label>
              <select
                value={room.status}
                onChange={(e) => updateStatus(room.id, e.target.value as HousekeepingStatus)}
                className={cn(
                  "w-full rounded-xl px-3 py-2 text-xs font-bold border transition-colors focus:outline-none",
                  room.status === 'CLEAN_INSPECTED' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" :
                  room.status === 'DIRTY_DEPARTURE' ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30" :
                  room.status === 'IN_PROGRESS' ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30" :
                  room.status === 'TOUCH_UP' ? "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30" :
                  "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                )}
              >
                <option value="CLEAN_INSPECTED">✓ Clean & Supervisor Inspected</option>
                <option value="IN_PROGRESS">⟳ Cleaning In Progress</option>
                <option value="TOUCH_UP">✦ Light Touch-Up / Towel Change</option>
                <option value="DIRTY_DEPARTURE">⚠ Dirty / Needs Full Turnover</option>
                <option value="OUT_OF_SERVICE">✕ Out of Service / Maintenance</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

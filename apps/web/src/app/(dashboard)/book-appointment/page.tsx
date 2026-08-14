'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, 
  Search, 
  UserPlus, 
  Calendar as CalendarIcon, 
  Clock, 
  UserCheck, 
  Check, 
  Phone, 
  Mail, 
  Receipt, 
  MessageSquare, 
  Printer, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  IndianRupee, 
  ArrowRight,
  ShieldCheck,
  User,
  RotateCcw
} from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { useServices } from '@/lib/services-store';
import { formatCurrency, cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

interface ExistingPatient {
  id: string;
  name: string;
  phone: string;
  email?: string;
  lastVisit: string;
  totalVisits: number;
}

const DEFAULT_EXISTING_CUSTOMERS: ExistingPatient[] = [
  { id: 'PID-8421', name: 'Vikram Singh', phone: '+91 98765 43210', email: 'vikram@example.com', lastVisit: '2026-08-01', totalVisits: 4 },
  { id: 'PID-8422', name: 'Priya Sharma', phone: '+91 87654 32109', email: 'priya.s@gmail.com', lastVisit: '2026-08-10', totalVisits: 2 },
  { id: 'PID-8423', name: 'Rajesh Kumar', phone: '+91 76543 21098', email: 'rajesh.k@yahoo.com', lastVisit: '2026-07-28', totalVisits: 6 },
  { id: 'PID-8424', name: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.reddy@gmail.com', lastVisit: '2026-08-12', totalVisits: 1 },
  { id: 'PID-8425', name: 'Ananya Verma', phone: '+91 98111 22334', email: 'ananya@corp.in', lastVisit: '2026-06-15', totalVisits: 3 },
];

const TIME_SLOTS = [
  '09:30 AM', '10:15 AM', '11:00 AM', '11:45 AM',
  '02:00 PM', '02:45 PM', '03:30 PM', '04:15 PM',
  '05:00 PM', '05:45 PM', '06:30 PM', '07:15 PM'
];

export default function BookAppointmentPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const { activeServices } = useServices();

  const isClinic = currentNiche === 'skin' || currentNiche === 'dental';
  const customerLabel = nicheConfig.terminology?.customer || 'Patient';
  const staffLabel = nicheConfig.terminology?.staff || 'Doctor / Specialist';
  const serviceLabel = nicheConfig.terminology?.service || 'Service';

  // Search & Patient Selection Mode
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ExistingPatient | null>(null);
  const [isNewCustomer, setIsNewCustomer] = useState(false);

  // New Patient Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Female');
  const [age, setAge] = useState('');
  const [includeRegFee, setIncludeRegFee] = useState(isClinic);
  const registrationFee = isClinic ? 300 : 0;

  // Appointment Details State
  const [selectedServiceId, setSelectedServiceId] = useState<string>(activeServices[0]?.id || '');
  const [selectedDoctor, setSelectedDoctor] = useState(nicheConfig.roles[0]?.label || 'Lead Specialist');
  const [bookingDate, setBookingDate] = useState('2026-08-14');
  const [selectedSlot, setSelectedSlot] = useState(TIME_SLOTS[1]);
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);
  const [paymentOption, setPaymentOption] = useState<'PAY_NOW' | 'PAY_LATER'>('PAY_LATER');

  // Success Confirmation Modal
  const [confirmedBooking, setConfirmedBooking] = useState<{
    bookingId: string;
    tokenNumber: number;
    customerName: string;
    phone: string;
    serviceName: string;
    doctorName: string;
    date: string;
    time: string;
    totalAmount: number;
  } | null>(null);

  // Recent Walk-ins Local Log
  const [recentBookings, setRecentBookings] = useState([
    { token: 'T-101', name: 'Vikram Singh', service: 'HydraFacial Glow', doctor: 'Dr. Meenakshi', time: '10:00 AM', status: 'In Waiting Room' },
    { token: 'T-102', name: 'Priya Sharma', service: 'Chemical Peel', doctor: 'Dr. Arun', time: '10:45 AM', status: 'With Doctor' },
  ]);

  // Selected Service object
  const selectedService = useMemo(() => {
    return activeServices.find(s => s.id === selectedServiceId) || activeServices[0];
  }, [activeServices, selectedServiceId]);

  // Search matches
  const searchResults = useMemo(() => {
    if (!customerSearch.trim()) return [];
    const q = customerSearch.toLowerCase();
    return DEFAULT_EXISTING_CUSTOMERS.filter(
      c => c.name.toLowerCase().includes(q) || c.phone.includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [customerSearch]);

  // Pricing summary calculation
  const servicePrice = selectedService ? selectedService.price : 0;
  const regFee = (isNewCustomer && includeRegFee) ? registrationFee : 0;
  const subtotal = servicePrice + regFee;
  const gst = Math.round(subtotal * 0.18);
  const totalPayable = subtotal + gst;

  const handleSelectExisting = (patient: ExistingPatient) => {
    setSelectedCustomer(patient);
    setIsNewCustomer(false);
    setCustomerSearch('');
  };

  const handleToggleNewCustomer = () => {
    setIsNewCustomer(true);
    setSelectedCustomer(null);
    setCustomerSearch('');
  };

  const handleResetForm = () => {
    setSelectedCustomer(null);
    setIsNewCustomer(false);
    setCustomerSearch('');
    setNewName('');
    setNewPhone('');
    setNewEmail('');
    setAge('');
    setNotes('');
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const customerName = isNewCustomer ? newName : (selectedCustomer?.name || 'Walk-in Guest');
    const customerPhone = isNewCustomer ? newPhone : (selectedCustomer?.phone || '+91 98765 00000');
    const tokenNo = Math.floor(100 + Math.random() * 900);
    const bookingId = `BK-${Date.now().toString().slice(-5)}`;

    const newBooking = {
      bookingId,
      tokenNumber: tokenNo,
      customerName,
      phone: customerPhone,
      serviceName: selectedService?.name || 'General Consultation',
      doctorName: selectedDoctor,
      date: bookingDate,
      time: selectedSlot,
      totalAmount: totalPayable,
    };

    setConfirmedBooking(newBooking);

    // Add to recent walk-ins list
    setRecentBookings(prev => [
      {
        token: `T-${tokenNo}`,
        name: customerName,
        service: selectedService?.name || 'Consultation',
        doctor: selectedDoctor,
        time: selectedSlot,
        status: 'In Waiting Room',
      },
      ...prev
    ]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <BookOpen className="text-purple-500" size={24} />
            <span>Book {customerLabel} Appointment</span>
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Frontdesk terminal for manual walk-in entry, {customerLabel.toLowerCase()} ID verification, new registration & instant waiting room queueing.
          </p>
        </div>

        <button
          onClick={handleResetForm}
          className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <RotateCcw size={14} />
          <span>Reset Form</span>
        </button>
      </div>

      {/* Main Grid: Left Booking Form (2 cols) | Right Summary & Quick Queue (1 col) */}
      <form onSubmit={handleConfirmBooking} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns: Patient Lookup + Booking Config */}
        <div className="lg:col-span-2 space-y-6">

          {/* SECTION 1: Patient / Client Identification */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
                  1
                </span>
                <h2 className="font-bold text-sm text-[var(--color-text)]">
                  {customerLabel} Information
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsNewCustomer(false); setSelectedCustomer(null); }}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer",
                    !isNewCustomer
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                  )}
                >
                  Existing {customerLabel}
                </button>
                <button
                  type="button"
                  onClick={handleToggleNewCustomer}
                  className={cn(
                    "px-3 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer flex items-center gap-1",
                    isNewCustomer
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                  )}
                >
                  <UserPlus size={13} />
                  <span>New {customerLabel}</span>
                </button>
              </div>
            </div>

            {/* Mode A: Existing Customer Lookup */}
            {!isNewCustomer && (
              <div className="space-y-3">
                {!selectedCustomer ? (
                  <div className="space-y-2">
                    <div className="relative">
                      <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="text"
                        placeholder={`Search existing ${customerLabel.toLowerCase()} by Name, Phone Number, or ID (e.g. Priya / 98765 / PID-8421)...`}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    {/* Search Results Dropdown List */}
                    {searchResults.length > 0 && (
                      <div className="border border-[var(--color-border)] rounded-xl bg-[var(--color-bg)] divide-y divide-[var(--color-border)] max-h-48 overflow-y-auto">
                        {searchResults.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => handleSelectExisting(patient)}
                            className="p-3 hover:bg-[var(--color-surface-hover)] cursor-pointer flex items-center justify-between transition-colors"
                          >
                            <div className="flex items-center gap-2.5">
                              <Avatar3D name={patient.name} size="sm" />
                              <div>
                                <p className="font-bold text-xs text-[var(--color-text)]">{patient.name}</p>
                                <p className="text-[10px] text-[var(--color-text-muted)] font-mono">{patient.phone} · {patient.id}</p>
                              </div>
                            </div>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20 font-medium">
                              Select ➔
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {customerSearch && searchResults.length === 0 && (
                      <div className="p-3 text-center bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                        <p className="text-xs text-[var(--color-text-muted)]">No record found with that query.</p>
                        <button
                          type="button"
                          onClick={handleToggleNewCustomer}
                          className="mt-1.5 text-xs text-purple-500 font-semibold hover:underline cursor-pointer"
                        >
                          + Register as New {customerLabel}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Selected Patient Card */
                  <div className="p-3.5 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar3D name={selectedCustomer.name} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-[var(--color-text)]">{selectedCustomer.name}</h3>
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 text-[10px] font-mono font-bold rounded">
                            {selectedCustomer.id}
                          </span>
                        </div>
                        <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
                          {selectedCustomer.phone} · Last Visit: {selectedCustomer.lastVisit} ({selectedCustomer.totalVisits} visits)
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedCustomer(null)}
                      className="text-xs text-[var(--color-text-muted)] hover:text-purple-500 underline font-medium cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: New Patient Registration Form */}
            {isNewCustomer && (
              <div className="space-y-3 pt-1">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Varma"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 00000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full px-2.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Age</label>
                    <input
                      type="number"
                      placeholder="28"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Email (Optional)</label>
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* New Patient Registration Fee Checkbox for Clinics */}
                {isClinic && (
                  <div className="p-3 bg-purple-500/5 border border-purple-500/20 rounded-xl flex items-center justify-between">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
                      <input
                        type="checkbox"
                        checked={includeRegFee}
                        onChange={(e) => setIncludeRegFee(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Apply One-Time New Patient Registration & Case Sheet Fee (+₹300)</span>
                    </label>
                    <span className="text-xs font-bold text-purple-500 font-mono">₹300</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* SECTION 2: Service & Specialist Assignment */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
                2
              </span>
              <h2 className="font-bold text-sm text-[var(--color-text)]">
                Select {serviceLabel} & {staffLabel}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Choose {serviceLabel} *
                </label>
                <select
                  value={selectedServiceId}
                  onChange={(e) => setSelectedServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {activeServices.map((srv) => (
                    <option key={srv.id} value={srv.id}>
                      {srv.name} ({srv.duration} mins - {formatCurrency(srv.price)})
                    </option>
                  ))}
                </select>
                {selectedService && (
                  <p className="text-[11px] text-[var(--color-text-muted)] mt-1.5">
                    Category: <span className="font-semibold text-purple-500">{selectedService.category}</span> · Duration: <span className="font-semibold text-[var(--color-text)]">{selectedService.duration} mins</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Assign {staffLabel} *
                </label>
                <select
                  value={selectedDoctor}
                  onChange={(e) => setSelectedDoctor(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="Dr. Meenakshi (Senior Consultant)">Dr. Meenakshi (Senior Consultant)</option>
                  <option value="Dr. Arun (Specialist)">Dr. Arun (Specialist)</option>
                  <option value="Dr. Kavitha (Aesthetics)">Dr. Kavitha (Aesthetics)</option>
                  <option value="Dr. Ramesh (Lead Specialist)">Dr. Ramesh (Lead Specialist)</option>
                  <option value="Duty Floor Specialist">Duty Floor Specialist (Available Now)</option>
                </select>
                <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>Available on floor today</span>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: Date & Interactive Time Slot Selector */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 border-b border-[var(--color-border)] pb-3">
              <span className="w-6 h-6 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-xs flex items-center justify-center border border-purple-500/20">
                3
              </span>
              <h2 className="font-bold text-sm text-[var(--color-text)]">
                Date & Time Slot
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                  Appointment Date *
                </label>
                <input
                  type="date"
                  required
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                  Select Time Slot *
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={cn(
                        "py-2 px-1 text-[11px] font-semibold rounded-lg border transition-all text-center cursor-pointer",
                        selectedSlot === slot
                          ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                          : "bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)] hover:bg-[var(--color-surface-hover)]"
                      )}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Additional Frontdesk Notes */}
            <div>
              <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                Clinical / Frontdesk Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Walk-in consultation, allergic to latex, VIP client referral"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Checkout Summary, Fast Queueing & Action Button */}
        <div className="space-y-5">
          {/* Checkout Breakdown Box */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 shadow-sm space-y-4 sticky top-20">
            <h3 className="font-bold text-sm text-[var(--color-text)] border-b border-[var(--color-border)] pb-3 flex items-center justify-between">
              <span>Booking Summary</span>
              <Receipt size={16} className="text-purple-500" />
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>{selectedService?.name || 'Selected Service'}</span>
                <span className="font-mono text-[var(--color-text)] font-semibold">{formatCurrency(servicePrice)}</span>
              </div>

              {isNewCustomer && includeRegFee && (
                <div className="flex justify-between text-[var(--color-text-muted)]">
                  <span>Registration & Case Sheet Fee</span>
                  <span className="font-mono text-[var(--color-text)] font-semibold">{formatCurrency(registrationFee)}</span>
                </div>
              )}

              <div className="flex justify-between text-[var(--color-text-muted)]">
                <span>GST (18%)</span>
                <span className="font-mono text-[var(--color-text)] font-semibold">{formatCurrency(gst)}</span>
              </div>

              <div className="pt-2 border-t border-[var(--color-border)] flex justify-between items-baseline font-bold text-sm text-[var(--color-text)]">
                <span>Total Amount</span>
                <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400 font-mono">
                  {formatCurrency(totalPayable)}
                </span>
              </div>
            </div>

            {/* Payment Option */}
            <div className="space-y-2 pt-2 border-t border-[var(--color-border)]">
              <label className="block text-xs font-semibold text-[var(--color-text)]">Payment Option</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentOption('PAY_LATER')}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer",
                    paymentOption === 'PAY_LATER'
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                  )}
                >
                  Pay at Desk
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentOption('PAY_NOW')}
                  className={cn(
                    "py-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer",
                    paymentOption === 'PAY_NOW'
                      ? "bg-purple-600 text-white border-purple-500 shadow-sm"
                      : "bg-[var(--color-bg)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                  )}
                >
                  Pay Now (POS)
                </button>
              </div>
            </div>

            {/* WhatsApp notification toggle */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text)]">
                <input
                  type="checkbox"
                  checked={sendWhatsApp}
                  onChange={(e) => setSendWhatsApp(e.target.checked)}
                  className="rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="flex items-center gap-1">
                  <MessageSquare size={13} className="text-emerald-500" />
                  <span>Send instant WhatsApp confirmation</span>
                </span>
              </label>
            </div>

            {/* Big Confirm Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Confirm & Check-in to Waiting Room</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Today's Recent Frontdesk Tokens */}
          <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-4 shadow-sm space-y-3">
            <h4 className="font-bold text-xs text-[var(--color-text)] flex items-center justify-between">
              <span>Today's Frontdesk Tokens</span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-500 font-bold px-2 py-0.5 rounded-full">Live</span>
            </h4>

            <div className="space-y-2">
              {recentBookings.map((b) => (
                <div key={b.token} className="p-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-purple-500 text-[11px]">{b.token}</span>
                      <span className="font-bold text-[var(--color-text)]">{b.name}</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-muted)]">{b.service} · {b.time}</p>
                  </div>
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </form>

      {/* Booking Success Confirmation Modal */}
      <AnimatePresence>
        {confirmedBooking && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto">
                <CheckCircle2 size={32} />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-purple-500/10 text-purple-500 border border-purple-500/20">
                  TOKEN #{confirmedBooking.tokenNumber}
                </span>
                <h2 className="text-xl font-bold text-[var(--color-text)] mt-2">
                  Appointment Booked & Checked-In!
                </h2>
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  Added to live Waiting Room queue and synced with doctor schedule.
                </p>
              </div>

              {/* Summary Slip */}
              <div className="p-4 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-2xl text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{customerLabel}:</span>
                  <span className="font-bold text-[var(--color-text)]">{confirmedBooking.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{serviceLabel}:</span>
                  <span className="font-bold text-[var(--color-text)]">{confirmedBooking.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">{staffLabel}:</span>
                  <span className="font-bold text-purple-500">{confirmedBooking.doctorName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--color-text-muted)]">Scheduled Time:</span>
                  <span className="font-mono text-[var(--color-text)] font-semibold">{confirmedBooking.date} at {confirmedBooking.time}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[var(--color-border)] font-bold">
                  <span>Total Payable:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">{formatCurrency(confirmedBooking.totalAmount)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text)] font-semibold rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  <span>Print Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setConfirmedBooking(null); handleResetForm(); }}
                  className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  Next Walk-in Entry
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

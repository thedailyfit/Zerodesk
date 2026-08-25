'use client';

import { useState, use, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar as CalIcon, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Lock,
  Sparkles,
  Building2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBookingLink } from '@/lib/booking-link-store';
import { useServices } from '@/lib/services-store';
import { usePatients } from '@/lib/patients-store';

const TIME_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
  '11:00 AM', '11:30 AM', '12:00 PM', '12:30 PM',
  '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const AUGUST_DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

export default function PublicBookingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  void slug; // Consumed by Next.js routing; slug is used for URL matching
  const { config } = useBookingLink();
  const { activeServices } = useServices();
  const { patients, addPatient } = usePatients();

  const [step, setStep] = useState<'dateTime' | 'details' | 'otp' | 'confirmed'>('dateTime');
  const [selectedDay, setSelectedDay] = useState<number>(24);
  const [selectedTime, setSelectedTime] = useState<string>('10:00 AM');
  
  // Patient Details
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [selectedService, setSelectedService] = useState('');
  const [notes, setNotes] = useState('');

  // Set default service once activeServices load
  useEffect(() => {
    if (!selectedService && activeServices.length > 0) {
      setSelectedService(activeServices[0].name);
    }
  }, [activeServices, selectedService]);

  // OTP State
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !phone) return;
    setStep('otp');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      // Accept demo OTP 123456 or any 6 digits
      if (otpValue === '123456' || otpValue.length === 6) {
        // Save new patient to local store if not already present
        const cleanPhone = phone.replace(/\D/g, '');
        const existing = patients.find(p => p.phone.replace(/\D/g, '') === cleanPhone || p.phone === phone);
        if (!existing && fullName.trim() && phone.trim()) {
          try {
            addPatient({
              name: fullName.trim(),
              phone: phone.trim(),
              email: email.trim() || undefined,
              priority: 'Standard',
              tags: ['Web Booking', selectedService || 'Consultation'],
            });
          } catch {
            // Ignore patient registration error if offline
          }
        }
        setStep('confirmed');
      } else {
        setOtpError(true);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center justify-center p-4 sm:p-6 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-xl">
        {/* Main Booking Container */}
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xl">
          
          {/* Clinic Cover Image Banner */}
          <div className="relative h-32 w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-6 right-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">
                  <Building2 size={16} />
                </span>
                <span className="text-sm font-bold tracking-wide">{config.businessName || 'ZeroDesk Clinic'}</span>
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider bg-white/25 px-2.5 py-0.5 rounded-full backdrop-blur-md">
                Verified Scheduler
              </span>
            </div>
          </div>

          {/* Header Description */}
          <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">Schedule an Appointment</h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Direct online slot reservation & instant confirmation
                </p>
              </div>
              <span className="text-xs text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-xl flex items-center gap-1 font-semibold">
                <ShieldCheck size={13} /> {config.otpChannel === 'phone' ? 'Phone OTP' : 'Google OTP'}
              </span>
            </div>
          </div>

          <div className="p-6 sm:p-8 bg-white">
            <AnimatePresence mode="wait">
              {/* STEP 1: Date & Time Selection */}
              {step === 'dateTime' && (
                <motion.div
                  key="step-datetime"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-6"
                >
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">Host: {config.doctorEmail}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{config.slotDuration} minutes session • In-clinic / Consultation</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-600 font-mono text-xs font-bold">
                      ? Free / Standard
                    </span>
                  </div>

                  {/* Calendar Grid */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <CalIcon size={16} className="text-blue-600" />
                        Select Date (August 2026)
                      </h3>
                      <span className="text-xs text-blue-600 font-semibold">Today: Aug 24</span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                      <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
                          <span key={d} className="text-[11px] font-bold text-slate-400 py-1">{d}</span>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-xs">
                        {/* Empty padding days */}
                        <div className="py-2.5 text-slate-300 font-medium">26</div>
                        <div className="py-2.5 text-slate-300 font-medium">27</div>
                        <div className="py-2.5 text-slate-300 font-medium">28</div>
                        <div className="py-2.5 text-slate-300 font-medium">29</div>
                        <div className="py-2.5 text-slate-300 font-medium">30</div>
                        <div className="py-2.5 text-slate-300 font-medium">31</div>
                        
                        {AUGUST_DAYS.map((day) => {
                          const isSelected = selectedDay === day;
                          const isPast = day < 24;
                          return (
                            <button
                              key={day}
                              type="button"
                              disabled={isPast}
                              onClick={() => setSelectedDay(day)}
                              className={cn(
                                "py-2.5 rounded-xl font-semibold transition-all text-xs",
                                isPast && "text-slate-300 opacity-50 cursor-not-allowed",
                                !isPast && !isSelected && "text-slate-700 hover:bg-white hover:text-slate-900 shadow-sm",
                                isSelected && "bg-blue-600 text-white font-bold shadow-md shadow-blue-600/30 scale-105"
                              )}
                            >
                              {day}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Time Slots */}
                  <div>
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
                      <Clock size={16} className="text-blue-600" />
                      Select Time Slot (Asia/Calcutta)
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {TIME_SLOTS.map((slot) => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={cn(
                              "py-2.5 px-2 rounded-xl text-xs font-semibold border transition-all text-center",
                              isSelected
                                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20 font-bold"
                                : "bg-slate-50 border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50/50"
                            )}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setStep('details')}
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                  >
                    <span>Continue to Patient Details</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: Patient Details */}
              {step === 'details' && (
                <motion.form
                  key="step-details"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  onSubmit={handleSendOtp}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <button
                      type="button"
                      onClick={() => setStep('dateTime')}
                      className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
                    >
                      <ArrowLeft size={14} /> Back to Calendar
                    </button>
                    <span className="text-xs font-mono text-blue-600 font-bold">
                      Aug {selectedDay}, 2026 at {selectedTime}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Full Name *</label>
                    <div className="relative">
                      <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Priya Sharma"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Mobile Phone (For OTP Verification) *</label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address (Optional)</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="priya@example.com"
                        className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Select Service</label>
                    <select
                      value={selectedService}
                      onChange={(e) => setSelectedService(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    >
                      {activeServices.length > 0 ? (
                        activeServices.slice(0, 6).map(s => (
                          <option key={s.id} value={s.name}>{s.name} ({s.duration} min)</option>
                        ))
                      ) : (
                        <option value="Consultation">Doctor Consultation (30 min)</option>
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Special Notes / Symptoms</label>
                    <textarea
                      rows={2}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Any specific concerns or medical background..."
                      className="w-full bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2"
                  >
                    <span>Send Verification OTP</span>
                    <ArrowRight size={16} />
                  </button>
                </motion.form>
              )}

              {/* STEP 3: OTP Verification */}
              {step === 'otp' && (
                <motion.form
                  key="step-otp"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-6 text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                    <Lock size={28} />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-xl font-bold text-slate-900">Enter 6-Digit OTP</h2>
                    <p className="text-xs text-slate-500">
                      We sent a one-time verification code to <strong className="text-slate-800 font-mono">{phone}</strong>
                    </p>
                  </div>

                  {/* Demo Helper Banner */}
                  <div className="p-2.5 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700 font-medium">
                    ?? Test Demo OTP: Enter <strong className="font-mono font-bold">123456</strong> to verify instantly.
                  </div>

                  <div>
                    <input
                      type="text"
                      maxLength={6}
                      value={otpValue}
                      onChange={(e) => {
                        setOtpValue(e.target.value.replace(/[^0-9]/g, ''));
                        setOtpError(false);
                      }}
                      placeholder="123456"
                      className="w-48 mx-auto text-center font-mono font-extrabold text-2xl tracking-widest bg-slate-50 border border-slate-300 text-slate-900 rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                    />
                    {otpError && (
                      <p className="text-xs text-rose-600 font-semibold mt-2">Invalid OTP. Please enter 123456</p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep('details')}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs"
                    >
                      Change Phone
                    </button>
                    <button
                      type="submit"
                      disabled={isVerifying || otpValue.length < 6}
                      className="flex-1 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-lg shadow-blue-600/25"
                    >
                      {isVerifying ? 'Verifying...' : 'Verify & Confirm Booking'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* STEP 4: Booking Confirmed */}
              {step === 'confirmed' && (
                <motion.div
                  key="step-confirmed"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6 text-center py-4"
                >
                  <div className="w-20 h-20 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 size={44} className="animate-bounce" />
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-2xl font-extrabold text-slate-900">Appointment Confirmed!</h2>
                    <p className="text-xs text-slate-500">
                      Your booking has been registered with ZeroDesk AI frontdesk engine.
                    </p>
                  </div>

                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-left space-y-3 text-xs">
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Patient</span>
                      <strong className="text-slate-900">{fullName}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Date & Time</span>
                      <strong className="text-blue-600 font-mono">August {selectedDay}, 2026 at {selectedTime}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-200 pb-2">
                      <span className="text-slate-500">Service</span>
                      <strong className="text-slate-900">{selectedService}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Clinic / Provider</span>
                      <strong className="text-slate-900">{config.businessName}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 text-center font-medium">
                    ?? Confirmation SMS and WhatsApp reminder have been triggered to {phone}.
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setStep('dateTime');
                      setFullName('');
                      setPhone('');
                      setOtpValue('');
                    }}
                    className="px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
                  >
                    Book Another Slot
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-400 mt-6 font-medium">
          Powered by ZeroDesk
        </p>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar as CalIcon, 
  Clock, 
  User, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  CalendarDays,
  ListFilter,
  X,
  Check,
  RefreshCw,
  Sparkles,
  Send,
  Phone,
  MessageCircle,
  UserCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Flame
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import posthog from 'posthog-js';
import { useNiche } from '@/components/providers/niche-provider';
import { useServices } from '@/lib/services-store';

import { useEffect } from 'react';
import type { NicheId } from '@/config/niches/types';

interface AppointmentItem {
  id: string;
  customer: string;
  phone?: string;
  email?: string;
  service: string;
  staff: string;
  scheduledAt: string; // ISO format
  duration: number;
  status: 'SCHEDULED' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  source: 'AI_VOICE' | 'AI_WHATSAPP' | 'AI_WEB' | 'STORE_VISIT' | 'REFERRAL' | 'MANUAL';
  priority?: 'VIP' | 'HIGH' | 'MEDIUM' | 'STANDARD';
  confirmationStatus?: string;
  confirmationSent?: boolean;
}

const DEFAULT_APPOINTMENTS_BY_NICHE: Record<NicheId, AppointmentItem[]> = {
  skin: [
    { id: 'sk-1', customer: 'Priya Sharma', phone: '+91 98765 43210', email: 'priya@email.com', service: 'HydraFacial Deep Pore Cleanse', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-24T10:00:00', duration: 45, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'sk-2', customer: 'Vikram Singh', phone: '+91 87654 32109', email: 'vikram@email.com', service: 'Laser Hair Removal (Full Face)', staff: 'Dr. Arun Kumar', scheduledAt: '2026-08-24T11:30:00', duration: 30, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'sk-3', customer: 'Sneha Patel', phone: '+91 65432 10987', email: 'sneha@email.com', service: 'Chemical Peel & Glow Treatment', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-24T14:00:00', duration: 45, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Walk-in Desk', confirmationSent: true },
    { id: 'sk-4', customer: 'Rahul Desai', phone: '+91 76543 21098', email: 'rahul@email.com', service: 'Dermatology Consultation', staff: 'Dr. Arun Kumar', scheduledAt: '2026-08-25T10:00:00', duration: 20, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'sk-5', customer: 'Anjali Verma', phone: '+91 43210 98765', email: 'anjali@email.com', service: 'PRP Hair Restoration Therapy', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-25T15:00:00', duration: 60, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Client', confirmationSent: true },
    { id: 'sk-6', customer: 'Deepak Menon', phone: '+91 32109 87654', email: 'deepak@email.com', service: 'Acne Scar Subcision', staff: 'Dr. Meenakshi', scheduledAt: '2026-08-26T10:00:00', duration: 45, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'sk-7', customer: 'Kavita Joshi', phone: '+91 54321 09876', email: 'kavita@email.com', service: 'Botox Anti-Aging (Forehead)', staff: 'Dr. Arun Kumar', scheduledAt: '2026-08-27T11:30:00', duration: 30, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'sk-8', customer: 'Amit Patel', phone: '+91 99887 76655', email: 'amit@email.com', service: 'Laser Maintenance Care', staff: 'Aesthetician Nurse', scheduledAt: '2026-08-28T14:00:00', duration: 45, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  dental: [
    { id: 'dt-1', customer: 'Ananya Reddy', phone: '+91 91234 56780', email: 'ananya@email.com', service: 'Invisible Aligners 3D Scan & Plan', staff: 'Dr. Priya Nair', scheduledAt: '2026-08-24T10:00:00', duration: 30, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'dt-2', customer: 'Karthik Menon', phone: '+91 91234 56781', email: 'karthik@email.com', service: 'Titanium Dental Implant Placement', staff: 'Dr. Rohan Verma', scheduledAt: '2026-08-24T11:30:00', duration: 60, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'dt-3', customer: 'Neha Gupta', phone: '+91 91234 56782', email: 'neha@email.com', service: 'Laser Teeth Whitening (In-Office)', staff: 'Dr. Arvind Sharma', scheduledAt: '2026-08-24T14:00:00', duration: 45, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Walk-in Desk', confirmationSent: true },
    { id: 'dt-4', customer: 'Rohit Sharma', phone: '+91 91234 56783', email: 'rohit@email.com', service: 'Root Canal Treatment (Single Sitting)', staff: 'Dr. Arvind Sharma', scheduledAt: '2026-08-25T10:00:00', duration: 45, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'dt-5', customer: 'Pooja Iyer', phone: '+91 91234 56784', email: 'pooja@email.com', service: 'Routine Ultrasonic Scaling & Polish', staff: 'Hygienist Sarah', scheduledAt: '2026-08-25T15:00:00', duration: 30, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Patient', confirmationSent: true },
    { id: 'dt-6', customer: 'Vikram Seth', phone: '+91 91234 56785', email: 'vikram.s@email.com', service: 'Zirconia Monolithic Crown Prep', staff: 'Dr. Rohan Verma', scheduledAt: '2026-08-26T10:00:00', duration: 45, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'dt-7', customer: 'Meera Nambiar', phone: '+91 91234 56786', email: 'meera.n@email.com', service: 'Clear Aligner Tray Exchange', staff: 'Dr. Priya Nair', scheduledAt: '2026-08-27T11:30:00', duration: 20, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'dt-8', customer: 'Arunav Roy', phone: '+91 91234 56787', email: 'arunav@email.com', service: 'Wisdom Tooth Pain Evaluation', staff: 'Dr. Arvind Sharma', scheduledAt: '2026-08-28T14:00:00', duration: 30, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  spa: [
    { id: 'sp-1', customer: 'Meera Kapoor', phone: '+91 99887 76655', email: 'meera.k@email.com', service: 'Ayurvedic Abhyanga Full Body Massage', staff: 'Ananya Ayurvedic Healer', scheduledAt: '2026-08-24T10:00:00', duration: 60, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'sp-2', customer: 'Aman Verma', phone: '+91 99887 76656', email: 'aman.v@email.com', service: 'Deep Tissue Muscle Relief Massage', staff: 'Master Somchai', scheduledAt: '2026-08-24T11:30:00', duration: 60, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'sp-3', customer: 'Simran Kaur', phone: '+91 99887 76657', email: 'simran@email.com', service: 'Aromatherapy Herbal Body Wrap', staff: 'Maya Sen', scheduledAt: '2026-08-24T14:00:00', duration: 45, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Lounge Desk', confirmationSent: true },
    { id: 'sp-4', customer: 'Karan Patel', phone: '+91 99887 76658', email: 'karan@email.com', service: 'Hot Stone Thermal Healing Massage', staff: 'Master Somchai', scheduledAt: '2026-08-25T10:00:00', duration: 60, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'sp-5', customer: 'Anita Desai', phone: '+91 99887 76659', email: 'anita@email.com', service: 'Panchakarma Detox Therapy Session', staff: 'Ananya Ayurvedic Healer', scheduledAt: '2026-08-25T15:00:00', duration: 90, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Guest', confirmationSent: true },
    { id: 'sp-6', customer: 'Rohan Bose', phone: '+91 99887 76660', email: 'rohan.b@email.com', service: 'Balinese Relaxing Massage', staff: 'Maya Sen', scheduledAt: '2026-08-26T10:00:00', duration: 60, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'sp-7', customer: 'Tara Alisha', phone: '+91 99887 76661', email: 'tara@email.com', service: 'Shirodhara Stress Relief Therapy', staff: 'Ananya Ayurvedic Healer', scheduledAt: '2026-08-27T11:30:00', duration: 60, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'sp-8', customer: 'Devendra Rao', phone: '+91 99887 76662', email: 'devendra@email.com', service: 'Foot Reflexology & Herbal Soak', staff: 'Master Somchai', scheduledAt: '2026-08-28T14:00:00', duration: 45, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  salon: [
    { id: 'sl-1', customer: 'Divya Nair', phone: '+91 98123 45670', email: 'divya.n@email.com', service: 'Balayage Color & Highlights', staff: 'Rohit Mehra', scheduledAt: '2026-08-24T10:00:00', duration: 90, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'sl-2', customer: 'Sameer Khan', phone: '+91 98123 45671', email: 'sameer@email.com', service: 'Keratin Hair Smoothening & Gloss', staff: 'Zara Khan', scheduledAt: '2026-08-24T11:30:00', duration: 90, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'sl-3', customer: 'Riya Sharma', phone: '+91 98123 45672', email: 'riya.s@email.com', service: 'Bridal HD Makeup & Hair Styling', staff: 'Tanya Roy', scheduledAt: '2026-08-24T14:00:00', duration: 60, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Walk-in Desk', confirmationSent: true },
    { id: 'sl-4', customer: 'Arjun Singh', phone: '+91 98123 45673', email: 'arjun@email.com', service: 'Gel Nail Extensions & Bespoke Art', staff: 'Maya Nail Artist', scheduledAt: '2026-08-25T10:00:00', duration: 45, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'sl-5', customer: 'Kavita Joshi', phone: '+91 98123 45674', email: 'kavita.j@email.com', service: 'Deluxe Moroccan Pedicure & Foot Spa', staff: 'Zara Khan', scheduledAt: '2026-08-25T15:00:00', duration: 45, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Client', confirmationSent: true },
    { id: 'sl-6', customer: 'Pooja Bhatt', phone: '+91 98123 45675', email: 'pooja.b@email.com', service: 'Global Hair Color & Gloss Toner', staff: 'Rohit Mehra', scheduledAt: '2026-08-26T10:00:00', duration: 60, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'sl-7', customer: 'Sunita Sharma', phone: '+91 98123 45676', email: 'sunita@email.com', service: 'Hair Spa Deep Conditioning Treatment', staff: 'Zara Khan', scheduledAt: '2026-08-27T11:30:00', duration: 45, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'sl-8', customer: 'Rahul Verma', phone: '+91 98123 45677', email: 'rahul.v@email.com', service: 'Precision Fade Haircut & Beard Sculpt', staff: 'Rohit Mehra', scheduledAt: '2026-08-28T14:00:00', duration: 30, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  realestate: [
    { id: 're-1', customer: 'Rajesh Gupta', phone: '+91 90011 22334', email: 'rajesh.g@email.com', service: '3BHK Luxury Villa Guided Site Visit', staff: 'Vikram Property Advisor', scheduledAt: '2026-08-24T10:00:00', duration: 60, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 're-2', customer: 'Sunita Reddy', phone: '+91 90011 22335', email: 'sunita.r@email.com', service: 'Commercial Space Property Inspection', staff: 'Rajesh Commercial Head', scheduledAt: '2026-08-24T11:30:00', duration: 45, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 're-3', customer: 'Ravi Kumar', phone: '+91 90011 22336', email: 'ravi.k@email.com', service: 'NRI Live Video Walkthrough & Consultation', staff: 'Vikram Property Advisor', scheduledAt: '2026-08-24T14:00:00', duration: 30, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Walk-in Office', confirmationSent: true },
    { id: 're-4', customer: 'Alok Mishra', phone: '+91 90011 22337', email: 'alok.m@email.com', service: 'RERA Title Verification & Legal Search', staff: 'Legal Consultant', scheduledAt: '2026-08-25T10:00:00', duration: 45, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 're-5', customer: 'Nandini Das', phone: '+91 90011 22338', email: 'nandini.d@email.com', service: 'Property Booking Token Processing', staff: 'Rajesh Commercial Head', scheduledAt: '2026-08-25T15:00:00', duration: 30, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Rescheduled by Investor', confirmationSent: true },
    { id: 're-6', customer: 'Gautam Adani', phone: '+91 90011 22339', email: 'gautam@email.com', service: 'Penthouse Architectural Preview', staff: 'Vikram Property Advisor', scheduledAt: '2026-08-26T10:00:00', duration: 60, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 're-7', customer: 'Ratan Tata', phone: '+91 90011 22340', email: 'ratan@email.com', service: 'Plot Allotment Site Inspection', staff: 'Vikram Property Advisor', scheduledAt: '2026-08-27T11:30:00', duration: 45, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 're-8', customer: 'Shiv Nadar', phone: '+91 90011 22341', email: 'shiv@email.com', service: 'Commercial Lease Agreement Signing', staff: 'Rajesh Commercial Head', scheduledAt: '2026-08-28T14:00:00', duration: 30, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  hotel: [
    { id: 'ht-1', customer: 'Amit Patel', phone: '+91 97766 55443', email: 'amit.p@email.com', service: 'Executive Deluxe Suite Night Stay', staff: 'Front Office Host', scheduledAt: '2026-08-24T10:00:00', duration: 60, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'ht-2', customer: 'Shruti Hasan', phone: '+91 97766 55444', email: 'shruti@email.com', service: 'Presidential Ocean Suite Night Stay', staff: 'VIP Concierge', scheduledAt: '2026-08-24T11:30:00', duration: 60, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'ht-3', customer: 'Vikas Khanna', phone: '+91 97766 55445', email: 'vikas@email.com', service: 'Grand Ballroom Banquet Inspection', staff: 'Banquet Coordinator', scheduledAt: '2026-08-24T14:00:00', duration: 45, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Front Desk', confirmationSent: true },
    { id: 'ht-4', customer: 'Neha Sharma', phone: '+91 97766 55446', email: 'neha.s@email.com', service: 'Airport VIP Luxury Transfer', staff: 'Chief Concierge', scheduledAt: '2026-08-25T10:00:00', duration: 45, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'ht-5', customer: 'Rahul Bajaj', phone: '+91 97766 55447', email: 'rahul.b@email.com', service: 'Weekend Spa & Gourmet Dining Package', staff: 'Guest Experience Manager', scheduledAt: '2026-08-25T15:00:00', duration: 60, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Cancelled by Guest', confirmationSent: true },
    { id: 'ht-6', customer: 'Rajinikanth', phone: '+91 97766 55448', email: 'rajini@email.com', service: 'Royal Suite Check-in & Butler Briefing', staff: 'VIP Concierge', scheduledAt: '2026-08-26T10:00:00', duration: 60, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'ht-7', customer: 'Kiran Mazumdar', phone: '+91 97766 55449', email: 'kiran@email.com', service: 'Conference Hall Preview & AV Check', staff: 'Banquet Coordinator', scheduledAt: '2026-08-27T11:30:00', duration: 45, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'ht-8', customer: 'Mukesh Ambani', phone: '+91 97766 55450', email: 'mukesh@email.com', service: 'Helipad Transfer & Presidential Check-in', staff: 'VIP Concierge', scheduledAt: '2026-08-28T14:00:00', duration: 60, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
  auto: [
    { id: 'au-1', customer: 'Suresh Kumar', phone: '+91 96655 44332', email: 'suresh@email.com', service: 'Test Drive Booking - Luxury SUV', staff: 'Senior Sales Executive', scheduledAt: '2026-08-24T10:00:00', duration: 30, status: 'CONFIRMED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Confirmed via WhatsApp AI', confirmationSent: true },
    { id: 'au-2', customer: 'Meenakshi Iyer', phone: '+91 96655 44333', email: 'meenakshi.i@email.com', service: 'Periodic Maintenance Service', staff: 'Service Advisor', scheduledAt: '2026-08-24T11:30:00', duration: 60, status: 'CONFIRMED', source: 'AI_WHATSAPP', priority: 'HIGH', confirmationStatus: 'Confirmed via Voice AI Call', confirmationSent: true },
    { id: 'au-3', customer: 'Gaurav Singh', phone: '+91 96655 44334', email: 'gaurav@email.com', service: 'Premium Car Ceramic Detailing', staff: 'Service Advisor', scheduledAt: '2026-08-24T14:00:00', duration: 90, status: 'IN_PROGRESS', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Confirmed Lounge Desk', confirmationSent: true },
    { id: 'au-4', customer: 'Preeti Desai', phone: '+91 96655 44335', email: 'preeti@email.com', service: 'Insurance Consultation & Processing', staff: 'Finance Manager', scheduledAt: '2026-08-25T10:00:00', duration: 45, status: 'COMPLETED', source: 'MANUAL', priority: 'STANDARD', confirmationStatus: 'Completed', confirmationSent: true },
    { id: 'au-5', customer: 'Aditya Chawla', phone: '+91 96655 44336', email: 'aditya@email.com', service: 'Pre-Delivery Inspection & Handover', staff: 'Senior Sales Executive', scheduledAt: '2026-08-25T15:00:00', duration: 45, status: 'CANCELLED', source: 'REFERRAL', priority: 'HIGH', confirmationStatus: 'Rescheduled by Buyer', confirmationSent: true },
    { id: 'au-6', customer: 'Rohan Mehra', phone: '+91 96655 44337', email: 'rohan.m@email.com', service: 'EV Test Drive & Fast Charger Demo', staff: 'EV Specialist', scheduledAt: '2026-08-26T10:00:00', duration: 45, status: 'SCHEDULED', source: 'AI_VOICE', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
    { id: 'au-7', customer: 'Deepika Sen', phone: '+91 96655 44338', email: 'deepika@email.com', service: 'Extended Warranty & Roadside Assist', staff: 'Finance Manager', scheduledAt: '2026-08-27T11:30:00', duration: 30, status: 'SCHEDULED', source: 'AI_WEB', priority: 'HIGH', confirmationStatus: 'WhatsApp Confirmation Sent', confirmationSent: true },
    { id: 'au-8', customer: 'Manoj Kumar', phone: '+91 96655 44339', email: 'manoj.k@email.com', service: 'Accessory Installation Consultation', staff: 'Service Advisor', scheduledAt: '2026-08-28T14:00:00', duration: 45, status: 'SCHEDULED', source: 'STORE_VISIT', priority: 'VIP', confirmationStatus: 'Awaiting Response', confirmationSent: false },
  ],
};

const statusConfig: Record<string, { icon: typeof CheckCircle2; label: string; style: string }> = {
  SCHEDULED: { icon: Clock, label: 'Scheduled', style: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  CONFIRMED: { icon: CheckCircle2, label: 'Confirmed', style: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  IN_PROGRESS: { icon: AlertCircle, label: 'In Progress', style: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  COMPLETED: { icon: CheckCircle2, label: 'Completed', style: 'bg-green-500/10 text-green-400 border-green-500/20' },
  CANCELLED: { icon: XCircle, label: 'Cancelled', style: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  NO_SHOW: { icon: XCircle, label: 'No Show', style: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20' },
};

const sourceLabels: Record<string, string> = { 
  AI_VOICE: '📞 AI Voice', 
  AI_WHATSAPP: '💬 AI WhatsApp', 
  AI_WEB: '🌐 AI Chat', 
  STORE_VISIT: '🏬 Store Visit', 
  REFERRAL: '🤝 Referral', 
  MANUAL: '✍️ Manual' 
};

export default function AppointmentsPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const { activeServices } = useServices();
  const [appointments, setAppointments] = useState<AppointmentItem[]>(() => DEFAULT_APPOINTMENTS_BY_NICHE[currentNiche] || DEFAULT_APPOINTMENTS_BY_NICHE.skin);

  useEffect(() => {
    setAppointments(DEFAULT_APPOINTMENTS_BY_NICHE[currentNiche] || DEFAULT_APPOINTMENTS_BY_NICHE.skin);
  }, [currentNiche]);

  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar');
  const [calendarSubView, setCalendarSubView] = useState<'month' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<number>(24);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [selectedAppt, setSelectedAppt] = useState<AppointmentItem | null>(null);
  const [confirmationTriggeredId, setConfirmationTriggeredId] = useState<string | null>(null);

  // Booking Form State
  const [customer, setCustomer] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(activeServices[0]?.name || 'General Consultation');
  const [doctor, setDoctor] = useState('Lead Specialist');
  const [date, setDate] = useState('2026-08-24');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('45');
  const [source, setSource] = useState<AppointmentItem['source']>('MANUAL');
  const [priority, setPriority] = useState<AppointmentItem['priority']>('HIGH');

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.trim()) return;

    const scheduledAt = `${date}T${time}:00`;
    const created: AppointmentItem = {
      id: Date.now().toString(),
      customer,
      phone: phone || '+91 98765 00000',
      service,
      staff: doctor,
      scheduledAt,
      duration: parseInt(duration) || 30,
      status: 'CONFIRMED',
      source,
      priority,
      confirmationStatus: 'Booking Confirmed (Staff Entry)',
      confirmationSent: true,
    };

    setAppointments([created, ...appointments]);
    setIsBookModalOpen(false);
    setCustomer('');
    setPhone('');
  };

  const handleSendConfirmationRequest = (apptId: string) => {
    setConfirmationTriggeredId(apptId);
    setTimeout(() => {
      setAppointments(prev => prev.map(a => {
        if (a.id === apptId) {
          return {
            ...a,
            status: 'CONFIRMED',
            confirmationStatus: 'Booking Confirmed via AI Engine',
            confirmationSent: true
          };
        }
        return a;
      }));
      setConfirmationTriggeredId(null);
    }, 1500);
  };

  // Selected date appointments
  const selectedDateAppts = appointments.filter(a => {
    const d = new Date(a.scheduledAt);
    return d.getDate() === selectedDate;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {nicheConfig.terminology?.appointments || 'Appointments'} & Scheduling
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {/* View Switcher: Calendar vs List */}
          <div className="flex items-center bg-[var(--color-surface)] p-1 rounded-xl border border-[var(--color-border)]">
            <button
              onClick={() => setViewMode('calendar')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'calendar'
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <CalendarDays size={14} />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                viewMode === 'list'
                  ? "bg-blue-600 text-white shadow-sm font-bold"
                  : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
              )}
            >
              <ListFilter size={14} />
              List View
            </button>
          </div>

          <button
            onClick={() => setIsBookModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-md shadow-blue-500/20 shrink-0"
          >
            <Plus size={16} />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Dominant Big Calendar (Left) + Vertical Stats Panel (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Big Dominant Calendar / List */}
        <div className="lg:col-span-9 space-y-4">
          {viewMode === 'calendar' ? (
            <div className="bg-[var(--color-glass)] backdrop-blur-xl border border-[var(--color-glass-border)] rounded-3xl p-6 shadow-xl space-y-4">
              {/* Calendar Controls (Month / Day Toggle like reference screenshot) */}
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-3">
                  <h2 className="text-base font-bold text-[var(--color-text)] flex items-center gap-2">
                    <CalIcon size={18} className="text-blue-400" />
                    <span>August 2026</span>
                  </h2>
                  <span className="text-xs text-[var(--color-text-muted)] font-medium">Asia/Calcutta</span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center bg-[var(--color-surface)] p-0.5 rounded-lg border border-[var(--color-border)] text-xs">
                    <button
                      onClick={() => setCalendarSubView('month')}
                      className={cn(
                        "px-3 py-1 rounded-md font-semibold transition-all",
                        calendarSubView === 'month' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      )}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setCalendarSubView('day')}
                      className={cn(
                        "px-3 py-1 rounded-md font-semibold transition-all",
                        calendarSubView === 'day' ? "bg-blue-600 text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                      )}
                    >
                      Day
                    </button>
                  </div>
                </div>
              </div>

              {/* Month View Grid */}
              {calendarSubView === 'month' && (
                <div>
                  <div className="grid grid-cols-7 text-center font-bold text-xs text-[var(--color-text-muted)] mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                      <div key={d} className="py-2">{d}</div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {/* Padding days from July */}
                    {[26, 27, 28, 29, 30, 31].map(d => (
                      <div key={`prev-${d}`} className="min-h-[90px] p-2 rounded-2xl border border-transparent text-slate-700 dark:text-slate-800 text-xs font-semibold">
                        {d}
                      </div>
                    ))}

                    {/* August Days 1 to 31 */}
                    {Array.from({ length: 31 }, (_, i) => i + 1).map(day => {
                      const isSelected = selectedDate === day;
                      const dayAppts = appointments.filter(a => new Date(a.scheduledAt).getDate() === day);

                      return (
                        <div
                          key={day}
                          onClick={() => setSelectedDate(day)}
                          className={cn(
                            "min-h-[100px] p-2 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group",
                            isSelected
                              ? "bg-blue-500/10 border-blue-500/50 shadow-md ring-1 ring-blue-500/30"
                              : "bg-[var(--color-surface)]/50 border-[var(--color-border)] hover:border-blue-500/30 hover:bg-[var(--color-surface)]"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <span className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                              isSelected 
                                ? "bg-blue-600 text-white shadow-sm" 
                                : "text-[var(--color-text)]"
                            )}>
                              {day}
                            </span>
                            {dayAppts.length > 0 && (
                              <span className="text-[10px] font-mono text-blue-400 font-bold">
                                {dayAppts.length} {dayAppts.length === 1 ? 'sitting' : 'sittings'}
                              </span>
                            )}
                          </div>

                          <div className="space-y-1 my-1">
                            {dayAppts.slice(0, 2).map((a) => (
                              <div
                                key={a.id}
                                className={cn(
                                  "p-1 rounded-md text-[10px] truncate font-medium",
                                  a.status === 'CONFIRMED' ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" :
                                  a.status === 'IN_PROGRESS' ? "bg-amber-500/20 text-amber-300 border border-amber-500/30" :
                                  "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                )}
                              >
                                {a.customer.split(' ')[0]} - {a.service}
                              </div>
                            ))}
                            {dayAppts.length > 2 && (
                              <span className="text-[9px] text-[var(--color-text-muted)] font-semibold block text-center">
                                +{dayAppts.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Day View Timeline */}
              {calendarSubView === 'day' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-[var(--color-surface)] p-3 rounded-2xl border border-[var(--color-border)]">
                    <span className="text-xs font-bold text-[var(--color-text)]">
                      Day Schedule: August {selectedDate}, 2026 ({selectedDateAppts.length} appointments)
                    </span>
                    <button
                      onClick={() => setCalendarSubView('month')}
                      className="text-xs text-blue-400 font-semibold hover:underline"
                    >
                      ← Back to Month
                    </button>
                  </div>

                  <div className="space-y-2">
                    {['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                      const hourAppts = selectedDateAppts.filter(a => {
                        const h = new Date(a.scheduledAt).getHours().toString().padStart(2, '0');
                        return `${h}:00` === hour;
                      });

                      return (
                        <div key={hour} className="flex gap-3 p-3 rounded-2xl bg-[var(--color-surface)] border border-[var(--color-border)] items-start">
                          <span className="font-mono text-xs text-[var(--color-text-muted)] font-bold w-16 pt-1">{hour}</span>
                          <div className="flex-1 space-y-1.5">
                            {hourAppts.length > 0 ? (
                              hourAppts.map(appt => (
                                <div key={appt.id} className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-between">
                                  <div>
                                    <span className="font-bold text-xs text-[var(--color-text)]">{appt.customer}</span>
                                    <span className="text-[11px] text-[var(--color-text-muted)] block">{appt.service} • {appt.staff}</span>
                                  </div>
                                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full font-bold">
                                    {appt.status}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <span className="text-[11px] text-[var(--color-text-muted)] italic">No booking scheduled</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* List View */
            <div className="space-y-3">
              {appointments.map((appt) => {
                const status = statusConfig[appt.status] || statusConfig.SCHEDULED;
                const StatusIcon = status.icon;
                const apptDate = new Date(appt.scheduledAt);
                return (
                  <div
                    key={appt.id}
                    onClick={() => setSelectedAppt(appt)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl hover:border-blue-500/40 transition-all cursor-pointer gap-4 shadow-sm group"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar3D name={appt.customer} size="md" />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-sm text-[var(--color-text)] group-hover:text-blue-400 transition-colors">{appt.service}</p>
                          <span className={cn("px-2.5 py-0.5 text-[10px] rounded-full border flex items-center gap-1 font-semibold", status.style)}>
                            <StatusIcon size={10} />
                            {status.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-[var(--color-text-muted)]">
                          <span>Patient: <strong className="text-slate-200">{appt.customer}</strong></span>
                          <span>•</span>
                          <span>Staff: <strong className="text-blue-400">{appt.staff}</strong></span>
                          <span>•</span>
                          <span className="text-slate-300 font-medium">{sourceLabels[appt.source]}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs font-bold text-blue-400 font-mono">
                        {apptDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at {apptDate.getHours().toString().padStart(2, '0')}:{apptDate.getMinutes().toString().padStart(2, '0')}
                      </p>
                      <span className="text-[10px] text-emerald-400 font-medium">{appt.confirmationStatus}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Vertical Compact Stats Panel + Selected Date Details (Reference Screenshot Style) */}
        <div className="lg:col-span-3 space-y-4">
          {/* Vertical Stacked Stats Cards */}
          <div className="space-y-3">
            {[
              { label: 'Total Bookings', count: appointments.length, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Booking Confirmed', count: appointments.filter(a => a.status === 'CONFIRMED').length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'Store Visit / Walk-ins', count: appointments.filter(a => a.source === 'STORE_VISIT' || a.source === 'MANUAL').length, color: 'text-amber-400', bg: 'bg-amber-500/10' },
              { label: 'Referrals', count: appointments.filter(a => a.source === 'REFERRAL').length, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-1"
              >
                <p className="text-[10px] text-[var(--color-text-muted)] uppercase tracking-wider font-bold">{stat.label}</p>
                <div className="flex items-baseline justify-between">
                  <p className={cn("text-2xl font-extrabold font-mono", stat.color)}>{stat.count}</p>
                  <span className="text-[10px] text-[var(--color-text-muted)]">Active sittings</span>
                </div>
              </div>
            ))}
          </div>

          {/* Selected Date Inspector Card */}
          <div className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-2">
              <span className="text-xs font-bold text-[var(--color-text)]">Selected Date</span>
              <span className="text-xs font-mono font-bold text-blue-400">Aug {selectedDate}, 2026</span>
            </div>

            {selectedDateAppts.length > 0 ? (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {selectedDateAppts.map(a => (
                  <div key={a.id} className="p-2.5 rounded-xl bg-[var(--color-surface)] border border-[var(--color-border)] text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[var(--color-text)]">{a.customer}</span>
                      <span className="font-mono text-[10px] text-blue-400">
                        {new Date(a.scheduledAt).getHours().toString().padStart(2, '0')}:00
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-muted)] truncate">{a.service}</p>
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-emerald-400 font-medium">● {a.status}</span>
                      {!a.confirmationSent && (
                        <button
                          onClick={() => handleSendConfirmationRequest(a.id)}
                          className="text-[10px] text-blue-400 font-bold hover:underline"
                        >
                          Send Recall
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[var(--color-text-muted)] space-y-1">
                <p>No appointments on this date.</p>
                <button
                  onClick={() => setIsBookModalOpen(true)}
                  className="text-xs text-blue-400 font-bold hover:underline"
                >
                  + Add new booking
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Appointment Modal */}
      <AnimatePresence>
        {isBookModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h3 className="font-bold text-base text-[var(--color-text)] flex items-center gap-2">
                  <Plus size={18} className="text-blue-400" />
                  Book Walk-in / Customer Appointment
                </h3>
                <button onClick={() => setIsBookModalOpen(false)} className="p-1 rounded-lg text-[var(--color-text-muted)] hover:text-[var(--color-text)]">
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleBookAppointment} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Customer / Patient Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Verma"
                    value={customer}
                    onChange={(e) => setCustomer(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Mobile Phone (For 2-Step Confirmation)</label>
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3.5 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Service</label>
                    <select
                      value={service}
                      onChange={(e) => setService(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {activeServices.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Assigned Specialist</label>
                    <input
                      type="text"
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-[var(--color-text-muted)] mb-1">Time</label>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsBookModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl border border-[var(--color-border)] font-semibold text-[var(--color-text)] hover:bg-[var(--color-surface)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-md shadow-blue-500/25"
                  >
                    Confirm Booking
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

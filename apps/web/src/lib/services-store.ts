'use client';

import { useState, useEffect, useCallback } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

export interface ServiceOffering {
  id: string;
  nicheId: NicheId;
  name: string;
  category: string;
  duration: number; // in minutes
  price: number; // in INR
  description: string;
  staffRole?: string;
  isActive: boolean;
}

export const DEFAULT_SERVICES_BY_NICHE: Record<NicheId, ServiceOffering[]> = {
  skin: [
    {
      id: 'skin-1',
      nicheId: 'skin',
      name: 'Laser Hair Removal (Full Face)',
      category: 'Laser',
      duration: 45,
      price: 5000,
      description: 'Diode 808nm triple-wavelength permanent hair reduction with contact cooling.',
      staffRole: 'Laser Technician / Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-2',
      nicheId: 'skin',
      name: 'Chemical Peel (Glow & Pigmentation)',
      category: 'Aesthetics',
      duration: 30,
      price: 3500,
      description: 'Glycolic and salicylic acid exfoliating peel for sun damage & acne marks.',
      staffRole: 'Consultant Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-3',
      nicheId: 'skin',
      name: 'PRP Hair Restoration Therapy',
      category: 'Hair Care',
      duration: 60,
      price: 8500,
      description: 'Platelet-rich plasma micro-injections for follicles revival & hair density.',
      staffRole: 'Lead Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-4',
      nicheId: 'skin',
      name: 'Botox Anti-Aging (Per Area)',
      category: 'Aesthetics',
      duration: 30,
      price: 12000,
      description: 'Targeted botulinum toxin injection for forehead lines and crow feet.',
      staffRole: 'Consultant Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-5',
      nicheId: 'skin',
      name: 'HydraFacial Deep Pore Cleanse',
      category: 'Medi-Facial',
      duration: 45,
      price: 4500,
      description: 'Multi-step vortex suction cleansing, exfoliation, hydration & serum infusion.',
      staffRole: 'Medical Aesthetician',
      isActive: true,
    },
    {
      id: 'skin-6',
      nicheId: 'skin',
      name: 'Acne Scar Subcision & Microneedling',
      category: 'Dermatology',
      duration: 45,
      price: 6000,
      description: 'RF microneedling and collagen stimulation for rolling acne scars.',
      staffRole: 'Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-7',
      nicheId: 'skin',
      name: 'Dermatology Consultation',
      category: 'Consultation',
      duration: 20,
      price: 500,
      description: 'Clinical skin examination, digital dermoscopy review & custom prescription.',
      staffRole: 'Consultant Dermatologist',
      isActive: true,
    },
    {
      id: 'skin-reg',
      nicheId: 'skin',
      name: 'One-Time New Patient Registration & Case Sheet Fee',
      category: 'Registration',
      duration: 15,
      price: 300,
      description: 'Mandatory one-time registration, medical case sheet documentation, and baseline clinical history intake for new patients.',
      staffRole: 'Frontdesk / Reception',
      isActive: true,
    },
  ],

  dental: [
    {
      id: 'dental-1',
      nicheId: 'dental',
      name: 'Root Canal Treatment (RCT - Single Sitting)',
      category: 'Endodontics',
      duration: 45,
      price: 6500,
      description: 'Rotary automated endodontic treatment with digital apex locator & crown prep.',
      staffRole: 'Chief Endodontist',
      isActive: true,
    },
    {
      id: 'dental-2',
      nicheId: 'dental',
      name: 'Zirconia Monolithic Crown',
      category: 'Prosthodontics',
      duration: 30,
      price: 12000,
      description: 'CAD/CAM precision-milled unbreakable aesthetic ceramic crown with 10-yr warranty.',
      staffRole: 'Prosthodontist',
      isActive: true,
    },
    {
      id: 'dental-3',
      nicheId: 'dental',
      name: 'Invisible Aligners 3D Scan & Plan',
      category: 'Orthodontics',
      duration: 30,
      price: 2500,
      description: '3D intraoral digital optical scan and digital smile simulation for clear aligners.',
      staffRole: 'Orthodontist',
      isActive: true,
    },
    {
      id: 'dental-4',
      nicheId: 'dental',
      name: 'Routine Ultrasonic Scaling & Polish',
      category: 'Preventive',
      duration: 30,
      price: 1800,
      description: 'Deep calculus, plaque and stain removal with enamel fluoride polish.',
      staffRole: 'Dental Hygienist',
      isActive: true,
    },
    {
      id: 'dental-5',
      nicheId: 'dental',
      name: 'Laser Teeth Whitening (In-Office)',
      category: 'Cosmetic',
      duration: 45,
      price: 8000,
      description: 'Instant 3-shade tooth brightening with blue cold laser activation.',
      staffRole: 'Cosmetic Dentist',
      isActive: true,
    },
    {
      id: 'dental-6',
      nicheId: 'dental',
      name: 'Titanium Dental Implant Placement',
      category: 'Implantology',
      duration: 60,
      price: 28000,
      description: 'Osseointegrated grade-4 titanium implant fixture with surgical stent guide.',
      staffRole: 'Implantologist',
      isActive: true,
    },
    {
      id: 'dental-reg',
      nicheId: 'dental',
      name: 'One-Time New Patient Registration & Case Sheet Fee',
      category: 'Registration',
      duration: 15,
      price: 300,
      description: 'Mandatory one-time registration, digital odontogram case file creation, and medical history intake for new patients.',
      staffRole: 'Frontdesk / Reception',
      isActive: true,
    },
  ],

  spa: [
    {
      id: 'spa-1',
      nicheId: 'spa',
      name: 'Ayurvedic Abhyanga Full Body Massage',
      category: 'Ayurveda',
      duration: 60,
      price: 3500,
      description: 'Traditional herbal warm medicated oil rhythmic synchronised relaxation therapy.',
      staffRole: 'Ayurvedic Therapist',
      isActive: true,
    },
    {
      id: 'spa-2',
      nicheId: 'spa',
      name: 'Deep Tissue Muscle Relief Massage',
      category: 'Therapy',
      duration: 60,
      price: 4000,
      description: 'Targeted deep pressure for chronic myofascial tension and posture recovery.',
      staffRole: 'Senior Masseuse',
      isActive: true,
    },
    {
      id: 'spa-3',
      nicheId: 'spa',
      name: 'Panchakarma Detox Therapy Session',
      category: 'Ayurveda',
      duration: 90,
      price: 5500,
      description: 'Authentic 5-fold metabolic detoxification with herbal steam bath.',
      staffRole: 'Ayurvedic Doctor (BAMS)',
      isActive: true,
    },
    {
      id: 'spa-4',
      nicheId: 'spa',
      name: 'Aromatherapy Herbal Body Wrap',
      category: 'Wellness',
      duration: 45,
      price: 3000,
      description: 'Detoxifying botanical body wrap infused with organic lavender & eucalyptus.',
      staffRole: 'Spa Specialist',
      isActive: true,
    },
    {
      id: 'spa-5',
      nicheId: 'spa',
      name: 'Hot Stone Thermal Healing Massage',
      category: 'Thermal Therapy',
      duration: 60,
      price: 4500,
      description: 'Heated volcanic basalt stones placed on meridian points for circulation & deep peace.',
      staffRole: 'Master Therapist',
      isActive: true,
    },
  ],

  salon: [
    {
      id: 'salon-1',
      nicheId: 'salon',
      name: 'Keratin Hair Smoothening & Gloss',
      category: 'Hair Care',
      duration: 90,
      price: 6500,
      description: 'Formaldehyde-free protein nourishment for silky, frizz-free hair.',
      staffRole: 'Master Stylist',
      isActive: true,
    },
    {
      id: 'salon-2',
      nicheId: 'salon',
      name: 'Balayage Color & Highlights',
      category: 'Coloring',
      duration: 90,
      price: 8000,
      description: 'Hand-painted dimensional hair coloring with Olaplex bond repair treatment.',
      staffRole: 'Senior Hair Colorist',
      isActive: true,
    },
    {
      id: 'salon-3',
      nicheId: 'salon',
      name: 'Bridal HD Makeup & Hair Styling',
      category: 'Bridal',
      duration: 60,
      price: 15000,
      description: 'High-definition bridal glam with airbrush contouring & floral hair adornment.',
      staffRole: 'Bridal Artist',
      isActive: true,
    },
    {
      id: 'salon-4',
      nicheId: 'salon',
      name: 'Gel Nail Extensions & Bespoke Art',
      category: 'Nails',
      duration: 45,
      price: 2500,
      description: 'Sculpted UV gel tips with chrome accents and long-lasting top coat.',
      staffRole: 'Nail Technician',
      isActive: true,
    },
    {
      id: 'salon-5',
      nicheId: 'salon',
      name: 'Deluxe Moroccan Pedicure & Foot Spa',
      category: 'Spa & Grooming',
      duration: 45,
      price: 1800,
      description: 'Dead sea salt scrub, paraffin wax treatment and acupressure foot massage.',
      staffRole: 'Pedicurist',
      isActive: true,
    },
  ],

  realestate: [
    {
      id: 'realestate-1',
      nicheId: 'realestate',
      name: '3BHK Luxury Villa Guided Site Visit',
      category: 'Site Visit',
      duration: 60,
      price: 0,
      description: 'Chauffeur-driven on-site tour of model villa, master plan & private clubhouse.',
      staffRole: 'Senior Property Advisor',
      isActive: true,
    },
    {
      id: 'realestate-2',
      nicheId: 'realestate',
      name: 'Commercial Space Property Inspection',
      category: 'Commercial',
      duration: 45,
      price: 0,
      description: 'Grade-A floor plate audit, power grid redundancy and parking allocation.',
      staffRole: 'Commercial Portfolio Head',
      isActive: true,
    },
    {
      id: 'realestate-3',
      nicheId: 'realestate',
      name: 'NRI Live Video Walkthrough & Consultation',
      category: 'NRI Services',
      duration: 30,
      price: 0,
      description: '4K video tour, construction status audit, and legal document review.',
      staffRole: 'NRI Relations Manager',
      isActive: true,
    },
    {
      id: 'realestate-4',
      nicheId: 'realestate',
      name: 'RERA Title Verification & Legal Search',
      category: 'Legal & Compliance',
      duration: 45,
      price: 5000,
      description: '30-year non-encumbrance certificate & municipal approval validation.',
      staffRole: 'Legal Consultant',
      isActive: true,
    },
    {
      id: 'realestate-5',
      nicheId: 'realestate',
      name: 'Property Booking Token Processing',
      category: 'Sales Booking',
      duration: 30,
      price: 50000,
      description: 'Unit allotment token agreement with price lock guarantee.',
      staffRole: 'Documentation Manager',
      isActive: true,
    },
  ],

  hotel: [
    {
      id: 'hotel-1',
      nicheId: 'hotel',
      name: 'Executive Deluxe Suite Night Stay',
      category: 'Accommodation',
      duration: 60,
      price: 8500,
      description: 'King-bed suite with city view, high-speed WiFi, breakfast & lounge access.',
      staffRole: 'Front Office Host',
      isActive: true,
    },
    {
      id: 'hotel-2',
      nicheId: 'hotel',
      name: 'Presidential Ocean Suite Night Stay',
      category: 'Luxury Stay',
      duration: 60,
      price: 22000,
      description: 'Panoramic balcony, private jacuzzi tub, 24/7 dedicated butler service.',
      staffRole: 'VIP Concierge',
      isActive: true,
    },
    {
      id: 'hotel-3',
      nicheId: 'hotel',
      name: 'Grand Ballroom Banquet Inspection',
      category: 'Events & Weddings',
      duration: 45,
      price: 0,
      description: '400-guest banquet hall preview, acoustic staging & chef tasting menu.',
      staffRole: 'Banquet Coordinator',
      isActive: true,
    },
    {
      id: 'hotel-4',
      nicheId: 'hotel',
      name: 'Airport VIP Luxury Transfer',
      category: 'Concierge',
      duration: 45,
      price: 2500,
      description: 'Direct tarmac chauffeur transfer with Mercedes E-Class / BMW 5-Series.',
      staffRole: 'Chief Concierge',
      isActive: true,
    },
    {
      id: 'hotel-5',
      nicheId: 'hotel',
      name: 'Weekend Spa & Gourmet Dining Package',
      category: 'Hospitality Package',
      duration: 60,
      price: 6000,
      description: 'Buffet brunch for 2, 60-minute couple spa session & infinity pool pass.',
      staffRole: 'Guest Experience Manager',
      isActive: true,
    },
  ],
};

export const SERVICES_STORAGE_KEY_PREFIX = 'zerodesk_services_';
const SERVICES_EVENT = 'zerodesk_services_changed';

export function useServices() {
  const { currentNiche } = useNiche();
  const [services, setServices] = useState<ServiceOffering[]>(() => {
    if (typeof window === 'undefined') return DEFAULT_SERVICES_BY_NICHE[currentNiche] || [];
    try {
      const saved = localStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SERVICES_BY_NICHE[currentNiche] || [];
  });

  // Reload when currentNiche changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setServices(parsed);
          return;
        }
      }
    } catch {
      // Fallback
    }
    setServices(DEFAULT_SERVICES_BY_NICHE[currentNiche] || []);
  }, [currentNiche]);

  // Listen to custom sync events across components
  useEffect(() => {
    const handleUpdate = () => {
      try {
        const saved = localStorage.getItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setServices(parsed);
          }
        }
      } catch {
        // Fallback
      }
    };
    window.addEventListener(SERVICES_EVENT, handleUpdate);
    return () => window.removeEventListener(SERVICES_EVENT, handleUpdate);
  }, [currentNiche]);

  const saveServices = useCallback((newServices: ServiceOffering[]) => {
    setServices(newServices);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`${SERVICES_STORAGE_KEY_PREFIX}${currentNiche}`, JSON.stringify(newServices));
        window.dispatchEvent(new Event(SERVICES_EVENT));
      } catch (err) {
        console.error('Failed to save services to localStorage', err);
      }
    }
  }, [currentNiche]);

  const addService = useCallback((service: Omit<ServiceOffering, 'id' | 'nicheId'>) => {
    const newService: ServiceOffering = {
      ...service,
      id: `${currentNiche}-${Date.now()}`,
      nicheId: currentNiche,
    };
    const updated = [newService, ...services];
    saveServices(updated);
    return newService;
  }, [currentNiche, services, saveServices]);

  const updateService = useCallback((id: string, patch: Partial<ServiceOffering>) => {
    const updated = services.map(s => s.id === id ? { ...s, ...patch } : s);
    saveServices(updated);
  }, [services, saveServices]);

  const deleteService = useCallback((id: string) => {
    const updated = services.filter(s => s.id !== id);
    saveServices(updated);
  }, [services, saveServices]);

  const toggleServiceStatus = useCallback((id: string) => {
    const updated = services.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s);
    saveServices(updated);
  }, [services, saveServices]);

  const resetToDefaults = useCallback(() => {
    const defaultList = DEFAULT_SERVICES_BY_NICHE[currentNiche] || [];
    saveServices(defaultList);
  }, [currentNiche, saveServices]);

  return {
    services,
    activeServices: services.filter(s => s.isActive),
    addService,
    updateService,
    deleteService,
    toggleServiceStatus,
    resetToDefaults,
  };
}

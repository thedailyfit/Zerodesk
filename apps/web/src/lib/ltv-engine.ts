import type { NicheId } from '@/config/niches/types';
import type { PatientRecord } from '@/lib/patients-store';
import type { InvoiceRecord } from '@/lib/invoices-store';

export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Lost';
export type LtvTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum VIP';

export interface CustomerRFMResult {
  patientId: string;
  name: string;
  phone: string;
  email?: string;
  totalSpend: number;
  visits: number;
  avgSpend: number;
  lastActive: string;
  lastActiveDays: number;
  tier: LtvTier;
  risk: RiskLevel;
  rfmScore: {
    r: number; // 1-5
    f: number; // 1-5
    m: number; // 1-5
    composite: number; // 0-100
  };
}

export interface LtvCohortBracket {
  name: string;
  count: number;
  value: number;
  color: string;
}

export interface AggregateLTVResult {
  totalEquity: number;
  avgLtv: number;
  repeatRate: number;
  highRiskCount: number;
  vipCount: number;
  topCustomers: CustomerRFMResult[];
  distribution: LtvCohortBracket[];
}

export interface NicheCadenceConfig {
  lowRiskDays: number;
  mediumRiskDays: number;
  highRiskDays: number;
  brackets: {
    entryMax: number;
    coreMax: number;
    highMax: number;
    labels: [string, string, string, string];
  };
}

export const NICHE_CADENCE_CONFIGS: Record<NicheId, NicheCadenceConfig> = {
  salon: {
    lowRiskDays: 45,
    mediumRiskDays: 90,
    highRiskDays: 180,
    brackets: {
      entryMax: 15000,
      coreMax: 50000,
      highMax: 150000,
      labels: ['< ₹15K (Entry)', '₹15K - ₹50K (Core)', '₹50K - ₹1.5L (High Value)', '₹1.5L+ (VIP / Key Client)']
    }
  },
  spa: {
    lowRiskDays: 45,
    mediumRiskDays: 90,
    highRiskDays: 180,
    brackets: {
      entryMax: 15000,
      coreMax: 50000,
      highMax: 150000,
      labels: ['< ₹15K (Entry)', '₹15K - ₹50K (Core)', '₹50K - ₹1.5L (High Value)', '₹1.5L+ (VIP / Key Guest)']
    }
  },
  skin: {
    lowRiskDays: 90,
    mediumRiskDays: 180,
    highRiskDays: 365,
    brackets: {
      entryMax: 20000,
      coreMax: 75000,
      highMax: 200000,
      labels: ['< ₹20K (Entry)', '₹20K - ₹75K (Core)', '₹75K - ₹2L (High Value)', '₹2L+ (VIP / Key Patient)']
    }
  },
  dental: {
    lowRiskDays: 90,
    mediumRiskDays: 180,
    highRiskDays: 365,
    brackets: {
      entryMax: 20000,
      coreMax: 75000,
      highMax: 200000,
      labels: ['< ₹20K (Entry)', '₹20K - ₹75K (Core)', '₹75K - ₹2L (High Value)', '₹2L+ (VIP / Key Patient)']
    }
  },
  hotel: {
    lowRiskDays: 90,
    mediumRiskDays: 180,
    highRiskDays: 365,
    brackets: {
      entryMax: 25000,
      coreMax: 100000,
      highMax: 300000,
      labels: ['< ₹25K (Entry)', '₹25K - ₹1L (Core)', '₹1L - ₹3L (High Value)', '₹3L+ (VIP / Key Guest)']
    }
  },
  realestate: {
    lowRiskDays: 180,
    mediumRiskDays: 365,
    highRiskDays: 730,
    brackets: {
      entryMax: 500000,
      coreMax: 2500000,
      highMax: 10000000,
      labels: ['< ₹5L (Entry Token)', '₹5L - ₹25L (Mid Tier)', '₹25L - ₹1Cr (Premium Deal)', '₹1Cr+ (HNI / Luxury Buyer)']
    }
  }
};

function formatDaysAgo(days: number): string {
  if (days <= 0) return 'Today';
  if (days === 1) return '1 day ago';
  if (days < 7) return days + ' days ago';
  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks + (weeks === 1 ? ' week' : ' weeks') + ' ago';
  }
  if (days < 365) {
    const months = Math.floor(days / 30);
    return months + (months === 1 ? ' month' : ' months') + ' ago';
  }
  const years = Math.floor(days / 365);
  return years + (years === 1 ? ' year' : ' years') + ' ago';
}

export function calculateCustomerRFM(
  patient: PatientRecord,
  patientInvoices: InvoiceRecord[],
  nicheId: NicheId,
  now: Date = new Date()
): CustomerRFMResult {
  const config = NICHE_CADENCE_CONFIGS[nicheId] || NICHE_CADENCE_CONFIGS.skin;

  const invoicePaid = patientInvoices.reduce((sum, inv) => {
    return sum + (inv.paidAmount || (inv.paymentStatus === 'PAID' ? inv.grandTotal : 0));
  }, 0);

  const totalSpend = invoicePaid > 0 ? invoicePaid : (patient.ltv || 0);

  const invoiceCount = patientInvoices.filter(inv => inv.paymentStatus === 'PAID' || inv.paymentStatus === 'PARTIAL').length;
  const visits = Math.max(patient.totalVisits || 0, invoiceCount, totalSpend > 0 ? 1 : 0);
  const avgSpend = visits > 0 ? Math.round(totalSpend / visits) : 0;

  const timestamps: number[] = [];
  if (patient.lastVisit) {
    const t = new Date(patient.lastVisit).getTime();
    if (!isNaN(t)) timestamps.push(t);
  }
  patientInvoices.forEach(inv => {
    if (inv.createdDate) {
      const t = new Date(inv.createdDate).getTime();
      if (!isNaN(t)) timestamps.push(t);
    }
  });

  const latestTime = timestamps.length > 0 ? Math.max(...timestamps) : (patient.registrationDate ? new Date(patient.registrationDate).getTime() : now.getTime());
  const diffDays = Math.max(0, Math.floor((now.getTime() - latestTime) / (1000 * 60 * 60 * 24)));
  const lastActive = formatDaysAgo(diffDays);

  let risk: RiskLevel = 'Low';
  if (diffDays > config.highRiskDays) {
    risk = 'Lost';
  } else if (diffDays > config.mediumRiskDays) {
    risk = 'High';
  } else if (diffDays > config.lowRiskDays) {
    risk = 'Medium';
  }

  let tier: LtvTier = 'Bronze';
  if (totalSpend >= config.brackets.highMax) {
    tier = 'Platinum VIP';
  } else if (totalSpend >= config.brackets.coreMax) {
    tier = 'Gold';
  } else if (totalSpend >= config.brackets.entryMax) {
    tier = 'Silver';
  }

  let rScore = 1;
  if (diffDays <= config.lowRiskDays * 0.5) rScore = 5;
  else if (diffDays <= config.lowRiskDays) rScore = 4;
  else if (diffDays <= config.mediumRiskDays) rScore = 3;
  else if (diffDays <= config.highRiskDays) rScore = 2;

  let fScore = 1;
  if (visits >= 10) fScore = 5;
  else if (visits >= 6) fScore = 4;
  else if (visits >= 3) fScore = 3;
  else if (visits >= 2) fScore = 2;

  let mScore = 1;
  if (totalSpend >= config.brackets.highMax) mScore = 5;
  else if (totalSpend >= config.brackets.coreMax) mScore = 4;
  else if (totalSpend >= config.brackets.entryMax) mScore = 3;
  else if (totalSpend >= config.brackets.entryMax * 0.4) mScore = 2;

  const composite = Math.round(((rScore * 0.4) + (fScore * 0.35) + (mScore * 0.25)) * 20);

  return {
    patientId: patient.id,
    name: patient.name,
    phone: patient.phone,
    email: patient.email,
    totalSpend,
    visits,
    avgSpend,
    lastActive,
    lastActiveDays: diffDays,
    tier,
    risk,
    rfmScore: {
      r: rScore,
      f: fScore,
      m: mScore,
      composite
    }
  };
}

export function calculateAggregateLTV(
  patients: PatientRecord[],
  invoices: InvoiceRecord[],
  nicheId: NicheId,
  now: Date = new Date()
): AggregateLTVResult {
  const config = NICHE_CADENCE_CONFIGS[nicheId] || NICHE_CADENCE_CONFIGS.skin;

  const invoicesByPatient = new Map<string, InvoiceRecord[]>();
  invoices.forEach(inv => {
    const key = inv.patientId || inv.phone || (inv.customerName ? inv.customerName.toLowerCase().trim() : '');
    if (key) {
      const list = invoicesByPatient.get(key) || [];
      list.push(inv);
      invoicesByPatient.set(key, list);
    }
  });

  const scoredPatients = patients.map(p => {
    const matchedInvoices = invoicesByPatient.get(p.id) || 
      invoicesByPatient.get(p.phone) || 
      invoicesByPatient.get(p.name.toLowerCase().trim()) || 
      [];
    return calculateCustomerRFM(p, matchedInvoices, nicheId, now);
  });

  scoredPatients.sort((a, b) => b.totalSpend - a.totalSpend);

  const totalEquity = scoredPatients.reduce((sum, p) => sum + p.totalSpend, 0);
  const avgLtv = scoredPatients.length > 0 ? Math.round(totalEquity / scoredPatients.length) : 0;

  const repeatCount = scoredPatients.filter(p => p.visits > 1).length;
  const repeatRate = scoredPatients.length > 0 ? Number(((repeatCount / scoredPatients.length) * 100).toFixed(1)) : 0;

  const highRiskCount = scoredPatients.filter(p => p.risk === 'High' || p.risk === 'Lost').length;
  const vipCount = scoredPatients.filter(p => p.tier === 'Platinum VIP').length;

  const [l0, l1, l2, l3] = config.brackets.labels;
  const b0 = { name: l0, count: 0, value: 0, color: '#94a3b8' };
  const b1 = { name: l1, count: 0, value: 0, color: '#3b82f6' };
  const b2 = { name: l2, count: 0, value: 0, color: '#4f46e5' };
  const b3 = { name: l3, count: 0, value: 0, color: '#0ea5e9' };

  scoredPatients.forEach(p => {
    if (p.totalSpend < config.brackets.entryMax) {
      b0.count += 1;
      b0.value += p.totalSpend;
    } else if (p.totalSpend < config.brackets.coreMax) {
      b1.count += 1;
      b1.value += p.totalSpend;
    } else if (p.totalSpend < config.brackets.highMax) {
      b2.count += 1;
      b2.value += p.totalSpend;
    } else {
      b3.count += 1;
      b3.value += p.totalSpend;
    }
  });

  return {
    totalEquity,
    avgLtv,
    repeatRate,
    highRiskCount,
    vipCount,
    topCustomers: scoredPatients,
    distribution: [b0, b1, b2, b3]
  };
}

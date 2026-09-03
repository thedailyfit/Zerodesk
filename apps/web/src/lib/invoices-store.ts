'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNiche } from '@/components/providers/niche-provider';
import type { NicheId } from '@/config/niches/types';

export interface InvoiceLineItem {
  serviceId?: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  gstRate: number; // 0, 5, 12, 18, 28
  gstAmount: number;
  totalPrice: number;
}

export interface InvoiceRecord {
  id: string;
  invoiceNo: string; // Format: INV-2026-XXXX
  nicheId: NicheId;
  patientId?: string; // Links to PatientRecord.id
  customerName: string;
  phone: string;
  email?: string;
  lineItems: InvoiceLineItem[];
  subtotal: number;
  totalGst: number;
  discountType: 'percent' | 'amount';
  discountValue: number;
  discountAmount: number;
  grandTotal: number;
  paymentMethod: 'cash' | 'card' | 'upi' | 'insurance' | 'partial';
  paymentStatus: 'PAID' | 'PENDING' | 'OVERDUE' | 'PARTIAL';
  paidAmount: number;
  remainingBalance: number;
  dueDate: string;
  createdDate: string;
  sentViaAi: boolean;
  isPackagePayment: boolean;
  packageSessionNumber?: number;
  notes?: string;
}

const DEFAULT_INVOICES_BY_NICHE: Record<NicheId, InvoiceRecord[]> = {
  skin: [
    {
      id: 'inv-skin-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'skin',
      customerName: 'Priya Sharma',
      phone: '+919876543210',
      email: 'priya.s@example.com',
      lineItems: [
        { serviceName: 'HydraFacial Deep Pore Cleanse', quantity: 1, unitPrice: 4500, gstRate: 18, gstAmount: 810, totalPrice: 5310 }
      ],
      subtotal: 4500,
      totalGst: 810,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5310,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 5310,
      remainingBalance: 0,
      dueDate: '2026-08-10',
      createdDate: '2026-08-10',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-skin-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'skin',
      customerName: 'Vikram Singh',
      phone: '+919876543211',
      lineItems: [
        { serviceName: 'Laser Hair Removal (Full Face)', quantity: 1, unitPrice: 5000, gstRate: 18, gstAmount: 900, totalPrice: 5900 }
      ],
      subtotal: 5000,
      totalGst: 900,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5900,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 5900,
      dueDate: '2026-08-20',
      createdDate: '2026-08-12',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-skin-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'skin',
      customerName: 'Anjali Deshmukh',
      phone: '+919876543212',
      lineItems: [
        { serviceName: '6-Session Laser Package', quantity: 1, unitPrice: 25000, gstRate: 18, gstAmount: 4500, totalPrice: 29500 }
      ],
      subtotal: 25000,
      totalGst: 4500,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 29500,
      paymentMethod: 'card',
      paymentStatus: 'PARTIAL',
      paidAmount: 4917,
      remainingBalance: 24583,
      dueDate: '2026-08-15',
      createdDate: '2026-08-14',
      sentViaAi: true,
      isPackagePayment: true,
      packageSessionNumber: 2
    },
    {
      id: 'inv-skin-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'skin',
      customerName: 'Rohit Patel',
      phone: '+919876543213',
      lineItems: [
        { serviceName: 'Acne Scar Treatment (Microneedling)', quantity: 1, unitPrice: 6000, gstRate: 18, gstAmount: 1080, totalPrice: 7080 }
      ],
      subtotal: 6000,
      totalGst: 1080,
      discountType: 'percent',
      discountValue: 10,
      discountAmount: 600,
      grandTotal: 6372,
      paymentMethod: 'upi',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 6372,
      dueDate: '2026-07-25',
      createdDate: '2026-07-15',
      sentViaAi: true,
      isPackagePayment: false,
      notes: 'Sent 3 reminders'
    },
    {
      id: 'inv-skin-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'skin',
      customerName: 'Meera Kapoor',
      phone: '+919876543214',
      lineItems: [
        { serviceName: 'Chemical Peel', quantity: 1, unitPrice: 3500, gstRate: 18, gstAmount: 630, totalPrice: 4130 }
      ],
      subtotal: 3500,
      totalGst: 630,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 4130,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 4130,
      remainingBalance: 0,
      dueDate: '2026-08-16',
      createdDate: '2026-08-16',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-skin-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'skin',
      customerName: 'Arjun Reddy',
      phone: '+919876543215',
      lineItems: [
        { serviceName: 'Dermatology Consultation', quantity: 1, unitPrice: 1000, gstRate: 18, gstAmount: 180, totalPrice: 1180 }
      ],
      subtotal: 1000,
      totalGst: 180,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1180,
      paymentMethod: 'cash',
      paymentStatus: 'PAID',
      paidAmount: 1180,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ],
  spa: [
    {
      id: 'inv-spa-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'spa',
      customerName: 'Kavita Menon',
      phone: '+919876543220',
      lineItems: [
        { serviceName: 'Balinese Massage (60 min)', quantity: 1, unitPrice: 3000, gstRate: 18, gstAmount: 540, totalPrice: 3540 }
      ],
      subtotal: 3000,
      totalGst: 540,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 3540,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 3540,
      remainingBalance: 0,
      dueDate: '2026-08-10',
      createdDate: '2026-08-10',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-spa-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'spa',
      customerName: 'Suresh Kumar',
      phone: '+919876543221',
      lineItems: [
        { serviceName: 'Aromatherapy Massage', quantity: 2, unitPrice: 3500, gstRate: 18, gstAmount: 1260, totalPrice: 8260 }
      ],
      subtotal: 7000,
      totalGst: 1260,
      discountType: 'percent',
      discountValue: 10,
      discountAmount: 700,
      grandTotal: 7434,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 7434,
      remainingBalance: 0,
      dueDate: '2026-08-12',
      createdDate: '2026-08-12',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-spa-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'spa',
      customerName: 'Neha Gupta',
      phone: '+919876543222',
      lineItems: [
        { serviceName: 'Hot Stone Therapy', quantity: 1, unitPrice: 4500, gstRate: 18, gstAmount: 810, totalPrice: 5310 }
      ],
      subtotal: 4500,
      totalGst: 810,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5310,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 5310,
      dueDate: '2026-08-25',
      createdDate: '2026-08-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-spa-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'spa',
      customerName: 'Aditya Sen',
      phone: '+919876543223',
      lineItems: [
        { serviceName: 'Deep Tissue Massage', quantity: 1, unitPrice: 4000, gstRate: 18, gstAmount: 720, totalPrice: 4720 }
      ],
      subtotal: 4000,
      totalGst: 720,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 4720,
      paymentMethod: 'upi',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 4720,
      dueDate: '2026-07-30',
      createdDate: '2026-07-20',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-spa-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'spa',
      customerName: 'Sneha Roy',
      phone: '+919876543224',
      lineItems: [
        { serviceName: 'Couple Spa Package', quantity: 1, unitPrice: 8000, gstRate: 18, gstAmount: 1440, totalPrice: 9440 }
      ],
      subtotal: 8000,
      totalGst: 1440,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 9440,
      paymentMethod: 'card',
      paymentStatus: 'PARTIAL',
      paidAmount: 4000,
      remainingBalance: 5440,
      dueDate: '2026-08-20',
      createdDate: '2026-08-16',
      sentViaAi: false,
      isPackagePayment: true,
      packageSessionNumber: 1
    },
    {
      id: 'inv-spa-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'spa',
      customerName: 'Manoj Tiwari',
      phone: '+919876543225',
      lineItems: [
        { serviceName: 'Foot Reflexology', quantity: 1, unitPrice: 1500, gstRate: 18, gstAmount: 270, totalPrice: 1770 }
      ],
      subtotal: 1500,
      totalGst: 270,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1770,
      paymentMethod: 'cash',
      paymentStatus: 'PAID',
      paidAmount: 1770,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ],
  salon: [
    {
      id: 'inv-salon-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'salon',
      customerName: 'Pooja Bhatt',
      phone: '+919876543230',
      lineItems: [
        { serviceName: 'Global Hair Color', quantity: 1, unitPrice: 4500, gstRate: 18, gstAmount: 810, totalPrice: 5310 }
      ],
      subtotal: 4500,
      totalGst: 810,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5310,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 5310,
      remainingBalance: 0,
      dueDate: '2026-08-10',
      createdDate: '2026-08-10',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-salon-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'salon',
      customerName: 'Rahul Verma',
      phone: '+919876543231',
      lineItems: [
        { serviceName: 'Men\'s Haircut & Beard Styling', quantity: 1, unitPrice: 800, gstRate: 18, gstAmount: 144, totalPrice: 944 }
      ],
      subtotal: 800,
      totalGst: 144,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 944,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 944,
      remainingBalance: 0,
      dueDate: '2026-08-11',
      createdDate: '2026-08-11',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-salon-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'salon',
      customerName: 'Simran Kaur',
      phone: '+919876543232',
      lineItems: [
        { serviceName: 'Keratin Treatment', quantity: 1, unitPrice: 6000, gstRate: 18, gstAmount: 1080, totalPrice: 7080 }
      ],
      subtotal: 6000,
      totalGst: 1080,
      discountType: 'percent',
      discountValue: 15,
      discountAmount: 900,
      grandTotal: 6018,
      paymentMethod: 'cash',
      paymentStatus: 'PARTIAL',
      paidAmount: 3000,
      remainingBalance: 3018,
      dueDate: '2026-08-15',
      createdDate: '2026-08-14',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-salon-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'salon',
      customerName: 'Riya Singh',
      phone: '+919876543233',
      lineItems: [
        { serviceName: 'Bridal Makeup Advance Booking', quantity: 1, unitPrice: 15000, gstRate: 18, gstAmount: 2700, totalPrice: 17700 }
      ],
      subtotal: 15000,
      totalGst: 2700,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 17700,
      paymentMethod: 'upi',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 17700,
      dueDate: '2026-08-30',
      createdDate: '2026-08-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-salon-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'salon',
      customerName: 'Sunita Sharma',
      phone: '+919876543234',
      lineItems: [
        { serviceName: 'Hair Spa', quantity: 1, unitPrice: 1500, gstRate: 18, gstAmount: 270, totalPrice: 1770 }
      ],
      subtotal: 1500,
      totalGst: 270,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1770,
      paymentMethod: 'cash',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 1770,
      dueDate: '2026-07-28',
      createdDate: '2026-07-18',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-salon-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'salon',
      customerName: 'Anil Das',
      phone: '+919876543235',
      lineItems: [
        { serviceName: 'Pedicure & Manicure', quantity: 1, unitPrice: 1200, gstRate: 18, gstAmount: 216, totalPrice: 1416 }
      ],
      subtotal: 1200,
      totalGst: 216,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1416,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 1416,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ],
  dental: [
    {
      id: 'inv-dental-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'dental',
      customerName: 'Amitabh Bachchan',
      phone: '+919876543240',
      lineItems: [
        { serviceName: 'Root Canal Treatment', quantity: 1, unitPrice: 8000, gstRate: 18, gstAmount: 1440, totalPrice: 9440 },
        { serviceName: 'X-Ray', quantity: 1, unitPrice: 500, gstRate: 18, gstAmount: 90, totalPrice: 590 }
      ],
      subtotal: 8500,
      totalGst: 1530,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 10030,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 10030,
      remainingBalance: 0,
      dueDate: '2026-08-10',
      createdDate: '2026-08-10',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-dental-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'dental',
      customerName: 'Jaya Bhaduri',
      phone: '+919876543241',
      lineItems: [
        { serviceName: 'Teeth Whitening', quantity: 1, unitPrice: 5000, gstRate: 18, gstAmount: 900, totalPrice: 5900 }
      ],
      subtotal: 5000,
      totalGst: 900,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5900,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 5900,
      remainingBalance: 0,
      dueDate: '2026-08-12',
      createdDate: '2026-08-12',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-dental-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'dental',
      customerName: 'Abhishek Bachchan',
      phone: '+919876543242',
      lineItems: [
        { serviceName: 'Dental Implants (First Sitting)', quantity: 1, unitPrice: 20000, gstRate: 18, gstAmount: 3600, totalPrice: 23600 }
      ],
      subtotal: 20000,
      totalGst: 3600,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 23600,
      paymentMethod: 'card',
      paymentStatus: 'PARTIAL',
      paidAmount: 10000,
      remainingBalance: 13600,
      dueDate: '2026-08-25',
      createdDate: '2026-08-14',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-dental-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'dental',
      customerName: 'Aishwarya Rai',
      phone: '+919876543243',
      lineItems: [
        { serviceName: 'Braces Adjustment', quantity: 1, unitPrice: 2000, gstRate: 18, gstAmount: 360, totalPrice: 2360 }
      ],
      subtotal: 2000,
      totalGst: 360,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 2360,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 2360,
      dueDate: '2026-08-28',
      createdDate: '2026-08-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-dental-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'dental',
      customerName: 'Shweta Nanda',
      phone: '+919876543244',
      lineItems: [
        { serviceName: 'Tooth Extraction', quantity: 1, unitPrice: 1500, gstRate: 18, gstAmount: 270, totalPrice: 1770 }
      ],
      subtotal: 1500,
      totalGst: 270,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1770,
      paymentMethod: 'insurance',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 1770,
      dueDate: '2026-07-20',
      createdDate: '2026-07-10',
      sentViaAi: true,
      isPackagePayment: false,
      notes: 'Waiting for insurance clearance'
    },
    {
      id: 'inv-dental-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'dental',
      customerName: 'Navya Naveli',
      phone: '+919876543245',
      lineItems: [
        { serviceName: 'Dental Consultation', quantity: 1, unitPrice: 500, gstRate: 18, gstAmount: 90, totalPrice: 590 }
      ],
      subtotal: 500,
      totalGst: 90,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 590,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 590,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ],
  realestate: [
    {
      id: 'inv-re-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'realestate',
      customerName: 'Ratan Tata',
      phone: '+919876543250',
      lineItems: [
        { serviceName: 'Property Token Amount - Villa 4', quantity: 1, unitPrice: 500000, gstRate: 18, gstAmount: 90000, totalPrice: 590000 }
      ],
      subtotal: 500000,
      totalGst: 90000,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 590000,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 590000,
      remainingBalance: 0,
      dueDate: '2026-08-05',
      createdDate: '2026-08-01',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-re-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'realestate',
      customerName: 'Mukesh Ambani',
      phone: '+919876543251',
      lineItems: [
        { serviceName: 'Maintenance Charge - Q3 2026', quantity: 1, unitPrice: 25000, gstRate: 18, gstAmount: 4500, totalPrice: 29500 }
      ],
      subtotal: 25000,
      totalGst: 4500,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 29500,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 29500,
      remainingBalance: 0,
      dueDate: '2026-08-15',
      createdDate: '2026-08-10',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-re-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'realestate',
      customerName: 'Gautam Adani',
      phone: '+919876543252',
      lineItems: [
        { serviceName: 'Registration Processing Fee', quantity: 1, unitPrice: 15000, gstRate: 18, gstAmount: 2700, totalPrice: 17700 }
      ],
      subtotal: 15000,
      totalGst: 2700,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 17700,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 17700,
      dueDate: '2026-08-30',
      createdDate: '2026-08-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-re-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'realestate',
      customerName: 'Azim Premji',
      phone: '+919876543253',
      lineItems: [
        { serviceName: 'Apartment Down Payment Installment', quantity: 1, unitPrice: 1000000, gstRate: 5, gstAmount: 50000, totalPrice: 1050000 }
      ],
      subtotal: 1000000,
      totalGst: 50000,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 1050000,
      paymentMethod: 'card',
      paymentStatus: 'PARTIAL',
      paidAmount: 500000,
      remainingBalance: 550000,
      dueDate: '2026-08-20',
      createdDate: '2026-08-12',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-re-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'realestate',
      customerName: 'Shiv Nadar',
      phone: '+919876543254',
      lineItems: [
        { serviceName: 'Clubhouse Membership Fee (Annual)', quantity: 1, unitPrice: 50000, gstRate: 18, gstAmount: 9000, totalPrice: 59000 }
      ],
      subtotal: 50000,
      totalGst: 9000,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 59000,
      paymentMethod: 'upi',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 59000,
      dueDate: '2026-07-31',
      createdDate: '2026-07-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-re-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'realestate',
      customerName: 'Kiran Mazumdar-Shaw',
      phone: '+919876543255',
      lineItems: [
        { serviceName: 'Legal Consultation for Deed', quantity: 1, unitPrice: 10000, gstRate: 18, gstAmount: 1800, totalPrice: 11800 }
      ],
      subtotal: 10000,
      totalGst: 1800,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 11800,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 11800,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ],
  hotel: [
    {
      id: 'inv-hotel-1',
      invoiceNo: 'INV-2026-0001',
      nicheId: 'hotel',
      customerName: 'Rajinikanth',
      phone: '+919876543260',
      lineItems: [
        { serviceName: 'Presidential Suite - 2 Nights', quantity: 1, unitPrice: 40000, gstRate: 18, gstAmount: 7200, totalPrice: 47200 },
        { serviceName: 'Room Service', quantity: 1, unitPrice: 3500, gstRate: 18, gstAmount: 630, totalPrice: 4130 }
      ],
      subtotal: 43500,
      totalGst: 7830,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 51330,
      paymentMethod: 'card',
      paymentStatus: 'PAID',
      paidAmount: 51330,
      remainingBalance: 0,
      dueDate: '2026-08-10',
      createdDate: '2026-08-10',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-hotel-2',
      invoiceNo: 'INV-2026-0002',
      nicheId: 'hotel',
      customerName: 'Kamal Haasan',
      phone: '+919876543261',
      lineItems: [
        { serviceName: 'Deluxe Room - 3 Nights', quantity: 1, unitPrice: 15000, gstRate: 12, gstAmount: 1800, totalPrice: 16800 }
      ],
      subtotal: 15000,
      totalGst: 1800,
      discountType: 'percent',
      discountValue: 10,
      discountAmount: 1500,
      grandTotal: 15120,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 15120,
      remainingBalance: 0,
      dueDate: '2026-08-12',
      createdDate: '2026-08-12',
      sentViaAi: false,
      isPackagePayment: false
    },
    {
      id: 'inv-hotel-3',
      invoiceNo: 'INV-2026-0003',
      nicheId: 'hotel',
      customerName: 'Vijay',
      phone: '+919876543262',
      lineItems: [
        { serviceName: 'Conference Hall Booking Deposit', quantity: 1, unitPrice: 50000, gstRate: 18, gstAmount: 9000, totalPrice: 59000 }
      ],
      subtotal: 50000,
      totalGst: 9000,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 59000,
      paymentMethod: 'card',
      paymentStatus: 'PARTIAL',
      paidAmount: 25000,
      remainingBalance: 34000,
      dueDate: '2026-08-25',
      createdDate: '2026-08-14',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-hotel-4',
      invoiceNo: 'INV-2026-0004',
      nicheId: 'hotel',
      customerName: 'Ajith Kumar',
      phone: '+919876543263',
      lineItems: [
        { serviceName: 'Airport Transfer (SUV)', quantity: 1, unitPrice: 2500, gstRate: 18, gstAmount: 450, totalPrice: 2950 }
      ],
      subtotal: 2500,
      totalGst: 450,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 2950,
      paymentMethod: 'cash',
      paymentStatus: 'PENDING',
      paidAmount: 0,
      remainingBalance: 2950,
      dueDate: '2026-08-28',
      createdDate: '2026-08-16',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-hotel-5',
      invoiceNo: 'INV-2026-0005',
      nicheId: 'hotel',
      customerName: 'Suriya',
      phone: '+919876543264',
      lineItems: [
        { serviceName: 'Spa Package Add-on', quantity: 1, unitPrice: 8000, gstRate: 18, gstAmount: 1440, totalPrice: 9440 }
      ],
      subtotal: 8000,
      totalGst: 1440,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 9440,
      paymentMethod: 'card',
      paymentStatus: 'OVERDUE',
      paidAmount: 0,
      remainingBalance: 9440,
      dueDate: '2026-07-25',
      createdDate: '2026-07-15',
      sentViaAi: true,
      isPackagePayment: false
    },
    {
      id: 'inv-hotel-6',
      invoiceNo: 'INV-2026-0006',
      nicheId: 'hotel',
      customerName: 'Dhanush',
      phone: '+919876543265',
      lineItems: [
        { serviceName: 'Standard Room - 1 Night', quantity: 1, unitPrice: 5000, gstRate: 12, gstAmount: 600, totalPrice: 5600 }
      ],
      subtotal: 5000,
      totalGst: 600,
      discountType: 'amount',
      discountValue: 0,
      discountAmount: 0,
      grandTotal: 5600,
      paymentMethod: 'upi',
      paymentStatus: 'PAID',
      paidAmount: 5600,
      remainingBalance: 0,
      dueDate: '2026-08-17',
      createdDate: '2026-08-17',
      sentViaAi: false,
      isPackagePayment: false
    }
  ]
};

export function useInvoices() {
  const { currentNiche } = useNiche();
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);

  const storageKey = `zerodesk_invoices_${currentNiche}`;
  const syncEventName = 'zerodesk_invoices_changed';

  const loadInvoices = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setInvoices(Array.isArray(parsed) ? parsed : (DEFAULT_INVOICES_BY_NICHE[currentNiche] || []));
      } else {
        const defaults = DEFAULT_INVOICES_BY_NICHE[currentNiche] || [];
        setInvoices(defaults);
        localStorage.setItem(storageKey, JSON.stringify(defaults));
      }
    } catch (error) {
      console.error('Failed to load invoices:', error);
      const defaults = DEFAULT_INVOICES_BY_NICHE[currentNiche] || [];
      setInvoices(defaults);
    }
  }, [currentNiche, storageKey]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  useEffect(() => {
    const handleSync = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.nicheId === currentNiche) {
        loadInvoices();
      }
    };
    window.addEventListener(syncEventName, handleSync);
    return () => window.removeEventListener(syncEventName, handleSync);
  }, [currentNiche, syncEventName, loadInvoices]);

  const saveInvoices = useCallback((newInvoices: InvoiceRecord[]) => {
    setInvoices(newInvoices);
    localStorage.setItem(storageKey, JSON.stringify(newInvoices));
    window.dispatchEvent(new CustomEvent(syncEventName, { detail: { nicheId: currentNiche } }));
  }, [storageKey, syncEventName, currentNiche]);

  const addInvoice = useCallback((invoiceData: Omit<InvoiceRecord, 'id' | 'invoiceNo'>) => {
    const currentYear = new Date().getFullYear().toString();
    let maxNum = 0;
    invoices.forEach(inv => {
      const match = inv.invoiceNo.match(new RegExp(`INV-${currentYear}-(\\d+)`));
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (num > maxNum) maxNum = num;
      }
    });

    const nextNum = (maxNum + 1).toString().padStart(4, '0');
    const invoiceNo = `INV-${currentYear}-${nextNum}`;

    const newInvoice: InvoiceRecord = {
      ...invoiceData,
      id: crypto.randomUUID(),
      invoiceNo
    };

    saveInvoices([newInvoice, ...invoices]);
  }, [invoices, saveInvoices]);

  const updateInvoice = useCallback((id: string, updates: Partial<InvoiceRecord>) => {
    saveInvoices(invoices.map(inv => inv.id === id ? { ...inv, ...updates } : inv));
  }, [invoices, saveInvoices]);

  const deleteInvoice = useCallback((id: string) => {
    saveInvoices(invoices.filter(inv => inv.id !== id));
  }, [invoices, saveInvoices]);

  const getInvoicesByPatientId = useCallback((patientId: string) => {
    return invoices.filter(inv => inv.patientId === patientId);
  }, [invoices]);

  const getInvoicesByStatus = useCallback((status: InvoiceRecord['paymentStatus']) => {
    return invoices.filter(inv => inv.paymentStatus === status);
  }, [invoices]);

  const getInvoicesByDateRange = useCallback((startDate: string, endDate: string) => {
    return invoices.filter(inv => inv.createdDate >= startDate && inv.createdDate <= endDate);
  }, [invoices]);

  const resetToDefaults = useCallback(() => {
    const defaults = DEFAULT_INVOICES_BY_NICHE[currentNiche] || [];
    saveInvoices(defaults);
  }, [currentNiche, saveInvoices]);

  // Computed values
  const totalInvoiced = useMemo(() => invoices.reduce((sum, inv) => sum + inv.grandTotal, 0), [invoices]);
  const totalCollected = useMemo(() => invoices.filter(inv => inv.paymentStatus === 'PAID').reduce((sum, inv) => sum + inv.paidAmount, 0), [invoices]);
  const totalPending = useMemo(() => invoices.filter(inv => inv.paymentStatus === 'PENDING' || inv.paymentStatus === 'PARTIAL').reduce((sum, inv) => sum + inv.remainingBalance, 0), [invoices]);
  const totalOverdue = useMemo(() => invoices.filter(inv => inv.paymentStatus === 'OVERDUE').reduce((sum, inv) => sum + inv.remainingBalance, 0), [invoices]);

  return {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoicesByPatientId,
    getInvoicesByStatus,
    getInvoicesByDateRange,
    totalInvoiced,
    totalCollected,
    totalPending,
    totalOverdue,
    resetToDefaults
  };
}

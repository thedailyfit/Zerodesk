'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/nextjs';
import { apiClient } from '@/lib/api-client';
import Link from 'next/link';
import { Calendar, Clock, CheckCircle2, AlertCircle, Plus, FileText, ArrowUpRight } from 'lucide-react';

export default function StaffDashboardPage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    async function loadStaffData() {
      try {
        setLoading(true);
        const res = await apiClient('/appointments');
        if (Array.isArray(res)) {
          const todayStr = new Date().toISOString().slice(0, 10);
          const todayAppts = res
            .filter((a: any) => (a.scheduledAt || a.date || '').slice(0, 10) === todayStr)
            .map((a: any) => {
              const dateObj = new Date(a.scheduledAt || a.date);
              return {
                id: a.id,
                patient: a.customer?.name || 'Inquiry Patient',
                service: a.service?.name || 'Clinic Consultation',
                time: isNaN(dateObj.getTime()) ? '10:00 AM' : dateObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
                status: a.status === 'COMPLETED' ? 'COMPLETED' : a.status === 'IN_PROGRESS' ? 'IN PROGRESS' : 'UPCOMING',
                rawDate: dateObj,
              };
            });
          setAppointments(todayAppts);
        }
      } catch (err) {
        console.error('Error fetching staff schedule:', err);
      } finally {
        setLoading(false);
      }
    }

    loadStaffData();
  }, []);

  const staffName = user?.firstName ? `Dr. ${user.firstName}` : 'Practitioner';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 15
      }
    }
  };

  const completedCount = appointments.filter(a => a.status === 'COMPLETED').length;
  const upcomingAppts = appointments.filter(a => a.status !== 'COMPLETED');
  const nextAppt = upcomingAppts.length > 0 ? upcomingAppts[0] : null;

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text)' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <motion.div variants={itemVariants}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Practice Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Welcome, {staffName} 👋</p>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Appointments Today', value: String(appointments.length), highlight: true },
            { label: 'Patients Seen', value: String(completedCount) },
            { label: 'Next Patient In', value: nextAppt ? `${nextAppt.time}` : 'None pending' },
            { label: 'Avg Session Time', value: '30 min' }
          ].map((kpi, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.02 }}
              style={{
                background: kpi.highlight ? 'linear-gradient(135deg, var(--color-primary) 0%, rgba(139,92,246,0.8) 100%)' : 'var(--color-glass)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: '16px',
                padding: '1.5rem',
                backdropFilter: 'blur(10px)',
                color: kpi.highlight ? '#fff' : 'inherit'
              }}
            >
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{kpi.label}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* Schedule & Actions */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          <motion.div variants={itemVariants} style={{
            background: 'var(--color-glass)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: '16px',
            padding: '1.5rem',
            backdropFilter: 'blur(10px)'
          }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Today&apos;s Schedule</h2>

            {appointments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', border: '1px dashed var(--color-border)', borderRadius: '12px' }}>
                <Calendar style={{ width: '40px', height: '40px', margin: '0 auto 0.75rem', opacity: 0.4 }} />
                <p style={{ fontWeight: '600', marginBottom: '0.25rem' }}>No Appointments Scheduled Today</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                  Your schedule for today is completely open. Bookings made via Voice AI or WhatsApp will appear here automatically.
                </p>
                <Link href="/appointments" style={{ display: 'inline-block', marginTop: '1rem', color: 'var(--color-primary)', fontSize: '0.875rem', fontWeight: '600' }}>
                  Open Appointments Desk &rarr;
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {appointments.map((item, idx) => (
                  <div key={item.id || idx} style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    padding: '1rem',
                    borderBottom: idx !== appointments.length - 1 ? '1px solid var(--color-border)' : 'none',
                    position: 'relative'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>{item.patient}</span>
                      <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>{item.service}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                      <span style={{ fontWeight: '500' }}>{item.time}</span>
                      <span style={{
                        padding: '0.25rem 0.75rem',
                        borderRadius: '9999px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        background: item.status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 
                                    item.status === 'IN PROGRESS' ? 'rgba(59, 130, 246, 0.1)' : 
                                    'rgba(139, 92, 246, 0.1)',
                        color: item.status === 'COMPLETED' ? '#10B981' : 
                               item.status === 'IN PROGRESS' ? '#3B82F6' : 
                               'var(--color-primary)'
                      }}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Quick Actions</h2>
            <Link href="/appointments" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: '1rem', borderRadius: '12px', background: 'var(--color-primary)', color: '#fff', fontWeight: '600', textAlign: 'center', boxShadow: '0 4px 12px rgba(139,92,246,0.3)', cursor: 'pointer'
              }}>Manage Appointments</motion.div>
            </Link>
            <Link href="/customers" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-glass)', color: 'var(--color-text)', fontWeight: '600', textAlign: 'center', cursor: 'pointer'
              }}>View Patient Files</motion.div>
            </Link>
            <Link href="/unified-inbox" style={{ textDecoration: 'none' }}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
                padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-glass)', color: 'var(--color-text)', fontWeight: '600', textAlign: 'center', cursor: 'pointer'
              }}>Open Unified Inbox</motion.div>
            </Link>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

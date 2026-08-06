'use client';
import { motion } from 'framer-motion';

export default function SuperAdminDashboardPage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } }
  };

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  const tenants = [
    { name: 'GlowSkin Clinic', plan: 'Enterprise', mrr: 15000, users: 24, aiCalls: '14.2k', status: 'Active', active: 'Just now' },
    { name: 'Radiance Dermatology', plan: 'Growth', mrr: 8000, users: 12, aiCalls: '5.1k', status: 'Active', active: '5m ago' },
    { name: 'AyurVeda Wellness Center', plan: 'Starter', mrr: 3000, users: 4, aiCalls: '1.2k', status: 'Active', active: '1h ago' },
    { name: 'Smile & Shine Dental', plan: 'Enterprise', mrr: 12000, users: 18, aiCalls: '8.4k', status: 'Active', active: 'Just now' },
    { name: 'Elite Care Hospital', plan: 'Trial', mrr: 0, users: 2, aiCalls: '340', status: 'Active', active: '2d ago' },
    { name: 'Clear Vision Eye Care', plan: 'Growth', mrr: 7500, users: 9, aiCalls: '4.8k', status: 'Suspended', active: '1w ago' },
  ];

  const getPlanColor = (plan: string) => {
    switch(plan) {
      case 'Enterprise': return '#8B5CF6'; // purple
      case 'Growth': return '#3B82F6'; // blue
      case 'Starter': return '#10B981'; // green
      default: return '#6B7280'; // gray
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: 'var(--color-text)' }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        <motion.div variants={itemVariants} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          </div>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 'bold', background: 'linear-gradient(to right, #EF4444, #F87171)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.25rem' }}>
              SUPER ADMIN
            </h1>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>Platform Administration</p>
          </div>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Total Businesses', value: '12' },
            { label: 'Total Users', value: '156' },
            { label: 'Monthly Revenue (MRR)', value: formatCurrency(485000), highlight: true },
            { label: 'Platform Uptime', value: '99.97%' }
          ].map((kpi, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02 }} style={{
              background: kpi.highlight ? 'linear-gradient(135deg, rgba(239,68,68,0.9) 0%, rgba(153,27,27,0.9) 100%)' : 'var(--color-glass)',
              border: '1px solid var(--color-glass-border)', borderRadius: '16px', padding: '1.5rem',
              backdropFilter: 'blur(10px)', color: kpi.highlight ? '#fff' : 'inherit'
            }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{kpi.label}</p>
              <h3 style={{ fontSize: '2.25rem', fontWeight: 'bold' }}>{kpi.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        {/* System Health */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
          {[
            { label: 'API Latency', value: '45ms' },
            { label: 'DB Queries/min', value: '1,234' },
            { label: 'Redis Hit Rate', value: '98.2%' },
            { label: 'Sentry Errors', value: '0' }
          ].map((health, idx) => (
            <div key={idx} style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '12px', padding: '1rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>{health.label}</div>
              <div style={{ color: '#EF4444', fontSize: '1.25rem', fontWeight: 'bold' }}>{health.value}</div>
            </div>
          ))}
        </motion.div>

        {/* Tenants Table */}
        <motion.div variants={itemVariants} style={{ 
          background: 'var(--color-glass)', border: '1px solid var(--color-glass-border)', borderRadius: '16px', overflow: 'hidden'
        }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-glass-border)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Active Tenants</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Business Name</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Plan</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>MRR</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Users</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>AI Calls</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Status</th>
                  <th style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontWeight: '500', fontSize: '0.875rem' }}>Last Active</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((tenant, idx) => (
                  <tr key={idx} style={{ borderTop: '1px solid var(--color-glass-border)', background: 'transparent' }}>
                    <td style={{ padding: '1rem 1.5rem', fontWeight: '500' }}>{tenant.name}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <span style={{ 
                        background: `${getPlanColor(tenant.plan)}20`, color: getPlanColor(tenant.plan),
                        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600'
                      }}>{tenant.plan}</span>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace' }}>{formatCurrency(tenant.mrr)}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>{tenant.users}</td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)' }}>{tenant.aiCalls}</td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: tenant.status === 'Active' ? '#10B981' : '#EF4444' }} />
                        <span style={{ fontSize: '0.875rem' }}>{tenant.status}</span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{tenant.active}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}

'use client';
import { motion } from 'framer-motion';

export default function ManagerDashboardPage() {
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

  const staff = [
    { name: 'Dr. Meenakshi', role: 'Dermatologist', initials: 'DM', color: '#8B5CF6', apts: 12, rating: 4.8 },
    { name: 'Dr. Rajiv', role: 'Cosmetologist', initials: 'DR', color: '#EC4899', apts: 9, rating: 4.5 },
    { name: 'Priya S.', role: 'Wellness Expert', initials: 'PS', color: '#10B981', apts: 14, rating: 4.9 },
    { name: 'Amit K.', role: 'Physiotherapist', initials: 'AK', color: '#3B82F6', apts: 7, rating: 4.6 }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text)' }}>
      <motion.div initial="hidden" animate="visible" variants={containerVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        
        <motion.div variants={itemVariants}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Team Overview</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Welcome back, Sarah (Clinic Manager)</p>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Team Appointments Today', value: '24' },
            { label: 'Revenue This Week', value: formatCurrency(345000), highlight: true },
            { label: 'Staff Utilization', value: '87%' },
            { label: 'Pending Reviews', value: '3' }
          ].map((kpi, idx) => (
            <motion.div key={idx} whileHover={{ scale: 1.02 }} style={{
              background: kpi.highlight ? 'linear-gradient(135deg, rgba(236,72,153,0.9) 0%, rgba(139,92,246,0.9) 100%)' : 'var(--color-glass)',
              border: '1px solid var(--color-glass-border)', borderRadius: '16px', padding: '1.5rem',
              backdropFilter: 'blur(10px)', color: kpi.highlight ? '#fff' : 'inherit'
            }}>
              <p style={{ fontSize: '0.875rem', opacity: 0.8, marginBottom: '0.5rem' }}>{kpi.label}</p>
              <h3 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{kpi.value}</h3>
            </motion.div>
          ))}
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          
          {/* Staff Performance */}
          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Staff Performance</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {staff.map((s, idx) => (
                <div key={idx} style={{ 
                  background: 'var(--color-glass)', border: '1px solid var(--color-glass-border)', 
                  borderRadius: '16px', padding: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'center'
                }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', background: s.color, 
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem'
                  }}>{s.initials}</div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontWeight: '600' }}>{s.name}</h4>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{s.role}</p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>{s.apts}</div>
                    <div style={{ fontSize: '0.75rem', color: '#FBBF24' }}>★ {s.rating}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Dept & Approvals */}
          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            <div style={{ background: 'var(--color-glass)', border: '1px solid var(--color-glass-border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Department Utilization</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {[
                  { name: 'Dermatology', val: 92, color: '#8B5CF6' },
                  { name: 'Wellness', val: 85, color: '#10B981' },
                  { name: 'Cosmetology', val: 78, color: '#EC4899' }
                ].map(dept => (
                  <div key={dept.name}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem', fontSize: '0.875rem' }}>
                      <span>{dept.name}</span><span>{dept.val}%</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${dept.val}%`, background: dept.color, borderRadius: '4px' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'var(--color-glass)', border: '1px solid var(--color-glass-border)', borderRadius: '16px', padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Pending Approvals</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <strong>Leave Request</strong><br/><span style={{color:'var(--color-text-muted)'}}>Dr. Rajiv - Oct 12 to Oct 14</span>
                </div>
                <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '0.875rem' }}>
                  <strong>Schedule Change</strong><br/><span style={{color:'var(--color-text-muted)'}}>Amit K. - Shift Swap</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

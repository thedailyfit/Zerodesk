'use client';
import { motion } from 'framer-motion';

export default function StaffDashboardPage() {
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

  const schedule = [
    { id: 1, patient: 'Rahul Sharma', service: 'Acne Treatment', time: '10:00 AM', status: 'COMPLETED' },
    { id: 2, patient: 'Priya Patel', service: 'Chemical Peel', time: '11:30 AM', status: 'IN PROGRESS' },
    { id: 3, patient: 'Amit Kumar', service: 'Laser Hair Removal', time: '01:15 PM', status: 'UPCOMING' },
    { id: 4, patient: 'Neha Gupta', service: 'Skin Consultation', time: '03:00 PM', status: 'UPCOMING' }
  ];

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', color: 'var(--color-text)' }}>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}
      >
        <motion.div variants={itemVariants}>
          <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>My Dashboard</h1>
          <p style={{ color: 'var(--color-text-muted)', fontSize: '1.2rem' }}>Good Morning, Dr. Meenakshi 👋</p>
        </motion.div>

        {/* KPIs */}
        <motion.div variants={itemVariants} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {[
            { label: 'Appointments Today', value: '8', highlight: true },
            { label: 'Patients Seen', value: '5' },
            { label: 'Next Patient In', value: '12 min' },
            { label: 'Avg Session Time', value: '32 min' }
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
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem' }}>Today's Schedule</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {schedule.map((item, idx) => (
                <div key={idx} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: '1rem',
                  borderBottom: idx !== schedule.length - 1 ? '1px solid var(--color-border)' : 'none',
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
          </motion.div>

          <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>Quick Actions</h2>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
              padding: '1rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: '#fff', fontWeight: '600', cursor: 'pointer', boxShadow: '0 4px 12px rgba(139,92,246,0.3)'
            }}>Start Next Appointment</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
              padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-glass)', color: 'var(--color-text)', fontWeight: '600', cursor: 'pointer'
            }}>Mark Complete</motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={{
              padding: '1rem', borderRadius: '12px', border: '1px solid var(--color-border)', background: 'var(--color-glass)', color: 'var(--color-text)', fontWeight: '600', cursor: 'pointer'
            }}>View Patient File</motion.button>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}

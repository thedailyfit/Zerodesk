'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Phone, Mail, Calendar, Activity, Tag, FileText, Image as ImageIcon, Briefcase, Pill, CheckCircle2, Circle, User } from 'lucide-react';
import { useNiche } from '@/components/providers/niche-provider';
import { usePatients, type PatientRecord } from '@/lib/patients-store';
import { useParkedBills } from '@/lib/billing-store';
import { useServices } from '@/lib/services-store';
import { formatCurrency, cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';

const PRIORITY_STYLES = {
  VIP: 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20',
  High: 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20',
  Medium: 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20',
  Standard: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20',
};

const PRIORITY_ICONS = {
  VIP: '🌟',
  High: '🔴',
  Medium: '🟡',
  Standard: '⚪',
};

type DrawerTab = 'overview' | 'history' | 'treatments' | 'files';

export default function CustomersPage() {
  const { nicheConfig } = useNiche();
  const { patients, addPatient } = usePatients();

  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<string>('All');
  
  const [selectedPatient, setSelectedPatient] = useState<PatientRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('overview');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: '',
    phone: '',
    email: '',
    gender: 'Other' as const,
    age: '',
    priority: 'Standard' as const,
    tags: ''
  });

  const { addParkedBill } = useParkedBills();
  const { activeServices } = useServices();
  const [sendToBilling, setSendToBilling] = useState(true);
  const [billingReasonId, setBillingReasonId] = useState('Consultation Fee');


  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      const matchesSearch = 
        p.name.toLowerCase().includes(search.toLowerCase()) || 
        p.phone.includes(search) ||
        p.id.toLowerCase().includes(search.toLowerCase());
      const matchesPriority = filterPriority === 'All' || p.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [patients, search, filterPriority]);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPatient.name || !newPatient.phone) return;

    const added = addPatient({
      name: newPatient.name,
      phone: newPatient.phone,
      email: newPatient.email,
      gender: newPatient.gender,
      age: parseInt(newPatient.age) || undefined,
      priority: newPatient.priority,
      tags: newPatient.tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    
    if (sendToBilling) {
      let items = 'Consultation Fee';
      let tag = 'Consultation Fee';
      let totalAmount = 1500; // Default consultation fee
      let quantities: Record<string, number> = { 'consult': 1 };

      if (billingReasonId !== 'Consultation Fee') {
        const service = activeServices.find(s => s.id.toString() === billingReasonId);
        if (service) {
          items = service.name;
          tag = 'Service Session';
          totalAmount = service.price;
          quantities = { [service.id]: 1 };
        }
      }

      addParkedBill({
        patientId: added.id,
        patientName: added.name,
        phone: added.phone,
        items,
        totalAmount,
        tag,
        quantities
      });
    }

    setIsAddModalOpen(false);
    setNewPatient({
      name: '', phone: '', email: '', gender: 'Other', age: '', priority: 'Standard', tags: ''
    });
    setSendToBilling(true);
    setBillingReasonId('Consultation Fee');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {nicheConfig.terminology.customers}
          </h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            Manage your {nicheConfig.terminology.customers.toLowerCase()} directory
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder={`Search ${nicheConfig.terminology.customers.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-9 pr-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50 text-[var(--color-text)]"
            />
          </div>
          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add {nicheConfig.terminology.customer}</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['All', 'VIP', 'High', 'Medium', 'Standard'].map(pri => (
          <button
            key={pri}
            onClick={() => setFilterPriority(pri)}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
              filterPriority === pri 
                ? "bg-blue-600 border-blue-600 text-white shadow-sm" 
                : "bg-[var(--color-surface)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:bg-[var(--color-border)]"
            )}
          >
            {pri !== 'All' && PRIORITY_ICONS[pri as keyof typeof PRIORITY_ICONS] + ' '}
            {pri}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredPatients.map((patient) => {
            const activePlans = patient.treatmentPlans.filter(tp => tp.status === 'Active');
            
            return (
              <motion.div
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className="group relative bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 cursor-pointer hover:border-blue-600/50 hover:shadow-md transition-all flex flex-col gap-4 overflow-hidden"
              >
                {/* PID Badge */}
                <div className="absolute top-4 right-4 text-[10px] font-mono font-medium px-2 py-1 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                  {patient.id}
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <Avatar3D name={patient.name} size="md" />
                  <div>
                    <h3 className="font-semibold text-base text-[var(--color-text)] group-hover:text-blue-600 transition-colors line-clamp-1 pr-14">
                      {patient.name}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)] mt-1">
                      <Phone className="w-3 h-3" />
                      <span>{patient.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[var(--color-text-muted)]">
                  {patient.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3"/> {patient.email.split('@')[0]}</span>}
                  {patient.age && <span>{patient.age}y</span>}
                  {patient.gender && <span>{patient.gender.charAt(0)}</span>}
                </div>

                <div className="bg-[var(--color-bg)] rounded-lg p-3 text-xs flex flex-col gap-2 border border-[var(--color-border)]">
                  <div className="flex justify-between items-center">
                    <span className="text-[var(--color-text-muted)]">Visits</span>
                    <span className="font-medium text-[var(--color-text)]">{patient.totalVisits}</span>
                  </div>
                  {patient.lastVisit && (
                    <div className="flex justify-between items-center">
                      <span className="text-[var(--color-text-muted)]">Last</span>
                      <span className="font-medium text-[var(--color-text)]">{new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                  )}
                  {activePlans.length > 0 && (
                    <div className="mt-1 pt-2 border-t border-[var(--color-border)] flex flex-col gap-1">
                      <span className="text-blue-600 font-medium line-clamp-1 flex items-center gap-1">
                        <Activity className="w-3 h-3" />
                        {activePlans[0].packageName}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2 mt-auto">
                  <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1", PRIORITY_STYLES[patient.priority])}>
                    {PRIORITY_ICONS[patient.priority]} {patient.priority}
                  </span>
                  {patient.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="px-2 py-0.5 rounded text-[10px] bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                      {tag}
                    </span>
                  ))}
                  {patient.tags.length > 2 && (
                    <span className="text-[10px] text-[var(--color-text-muted)]">+{patient.tags.length - 2}</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {filteredPatients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-[var(--color-text-muted)]">No {nicheConfig.terminology.customers.toLowerCase()} found.</p>
        </div>
      )}

      {/* Detail Drawer */}
      <AnimatePresence>
        {selectedPatient && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPatient(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[var(--color-surface)] shadow-2xl z-50 flex flex-col border-l border-[var(--color-border)]"
            >
              {/* Header */}
              <div className="p-6 border-b border-[var(--color-border)] relative">
                <button 
                  onClick={() => setSelectedPatient(null)}
                  className="absolute top-4 right-4 p-2 rounded-full hover:bg-[var(--color-bg)] text-[var(--color-text-muted)] transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="flex gap-5 items-start mt-4">
                  <Avatar3D name={selectedPatient.name} size="lg" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold text-[var(--color-text)]">{selectedPatient.name}</h2>
                      <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold border flex items-center gap-1", PRIORITY_STYLES[selectedPatient.priority])}>
                        {PRIORITY_ICONS[selectedPatient.priority]} {selectedPatient.priority}
                      </span>
                    </div>
                    <p className="font-mono text-xs text-[var(--color-text-muted)] mb-3">{selectedPatient.id}</p>
                    
                    <div className="grid grid-cols-2 gap-y-2 text-sm text-[var(--color-text)]">
                      <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-[var(--color-text-muted)]" /> {selectedPatient.phone}</div>
                      {selectedPatient.email && <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-[var(--color-text-muted)]" /> <span className="truncate">{selectedPatient.email}</span></div>}
                      <div className="flex items-center gap-2"><User className="w-4 h-4 text-[var(--color-text-muted)]" /> {selectedPatient.age || '--'}y, {selectedPatient.gender || '--'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center border-b border-[var(--color-border)] px-4">
                {[
                  { id: 'overview', label: 'Overview' },
                  { id: 'history', label: 'Visits' },
                  { id: 'treatments', label: 'Plans' },
                  { id: 'files', label: 'Files' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setDrawerTab(tab.id as DrawerTab)}
                    className={cn(
                      "px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                      drawerTab === tab.id 
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Drawer Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {drawerTab === 'overview' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Total Visits</p>
                        <p className="text-xl font-bold text-[var(--color-text)]">{selectedPatient.totalVisits}</p>
                      </div>
                      <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <p className="text-xs text-[var(--color-text-muted)] mb-1">Lifetime Value</p>
                        <p className="text-xl font-bold text-[var(--color-text)]">{formatCurrency(selectedPatient.ltv)}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedPatient.tags.length > 0 ? selectedPatient.tags.map(tag => (
                          <span key={tag} className="px-3 py-1 rounded-full text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] flex items-center gap-1.5">
                            <Tag className="w-3 h-3 text-[var(--color-text-muted)]" /> {tag}
                          </span>
                        )) : <p className="text-sm text-[var(--color-text-muted)]">No tags added</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3">Registration Info</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                          <span className="text-[var(--color-text-muted)]">Registered On</span>
                          <span className="text-[var(--color-text)] font-medium">{new Date(selectedPatient.registrationDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-[var(--color-border)]">
                          <span className="text-[var(--color-text-muted)]">Last Visit</span>
                          <span className="text-[var(--color-text)] font-medium">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : '--'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {drawerTab === 'history' && (
                  <div className="space-y-4">
                    {/* Dummy history for now, use totalVisits and lastVisit to fake it */}
                    {selectedPatient.totalVisits > 0 ? (
                      <div className="relative border-l border-[var(--color-border)] ml-3 space-y-6">
                        <div className="relative pl-6">
                          <div className="absolute w-3 h-3 rounded-full bg-blue-600 -left-[6.5px] top-1 ring-4 ring-[var(--color-surface)]" />
                          <p className="text-xs text-[var(--color-text-muted)] mb-1">{selectedPatient.lastVisit ? new Date(selectedPatient.lastVisit).toLocaleDateString() : 'Recent'}</p>
                          <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                            <h4 className="text-sm font-medium text-[var(--color-text)]">Latest Appointment</h4>
                            <p className="text-xs text-[var(--color-text-muted)] mt-1">Status: Completed</p>
                          </div>
                        </div>
                        {selectedPatient.totalVisits > 1 && (
                          <div className="relative pl-6">
                            <div className="absolute w-3 h-3 rounded-full bg-[var(--color-border)] -left-[6.5px] top-1 ring-4 ring-[var(--color-surface)]" />
                            <p className="text-xs text-[var(--color-text-muted)] mb-1">Previous visits</p>
                            <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                              <p className="text-sm text-[var(--color-text-muted)]">{selectedPatient.totalVisits - 1} earlier visits recorded</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">No visits recorded yet.</p>
                    )}
                  </div>
                )}

                {drawerTab === 'treatments' && (
                  <div className="space-y-4">
                    {selectedPatient.treatmentPlans.length > 0 ? selectedPatient.treatmentPlans.map(plan => (
                      <div key={plan.id} className="p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg)]">
                        <div className="flex justify-between items-start mb-3">
                          <div>
                            <h4 className="font-semibold text-[var(--color-text)] text-sm">{plan.packageName}</h4>
                            <p className="text-xs text-[var(--color-text-muted)] mt-0.5">Started {new Date(plan.startDate).toLocaleDateString()}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded text-[10px] font-medium border",
                            plan.status === 'Active' ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-[var(--color-surface)] text-[var(--color-text-muted)] border-[var(--color-border)]"
                          )}>
                            {plan.status}
                          </span>
                        </div>

                        <div className="space-y-3 mt-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-[var(--color-text-muted)]">Sessions Progress</span>
                              <span className="font-medium text-[var(--color-text)]">{plan.completedSessions} / {plan.totalSessions}</span>
                            </div>
                            <div className="h-1.5 w-full bg-[var(--color-surface)] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 rounded-full" 
                                style={{ width: `${(plan.completedSessions / plan.totalSessions) * 100}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex justify-between text-xs pt-2 border-t border-[var(--color-border)]">
                            <span className="text-[var(--color-text-muted)]">Balance</span>
                            <span className="font-medium text-[var(--color-text)]">{formatCurrency(plan.remainingBalance)}</span>
                          </div>
                        </div>
                      </div>
                    )) : (
                      <p className="text-center text-sm text-[var(--color-text-muted)] mt-8">No active treatment plans.</p>
                    )}
                  </div>
                )}

                {drawerTab === 'files' && (
                  <div className="space-y-6">
                    {/* Prescriptions */}
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                        <Pill className="w-4 h-4 text-blue-600" />
                        Prescriptions ({selectedPatient.prescriptions.length})
                      </h4>
                      {selectedPatient.prescriptions.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPatient.prescriptions.map(rx => (
                            <div key={rx.id} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center group cursor-pointer hover:border-blue-600/50">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text)]">{rx.doctorName}</p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{rx.diagnosis} · {new Date(rx.date).toLocaleDateString()}</p>
                              </div>
                              <FileText className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-blue-600 transition-colors" />
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-[var(--color-text-muted)]">No prescriptions found.</p>}
                    </div>

                    {/* Files */}
                    <div>
                      <h4 className="text-sm font-semibold text-[var(--color-text)] mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-blue-600" />
                        Uploaded Files ({selectedPatient.uploadedFiles.length})
                      </h4>
                      {selectedPatient.uploadedFiles.length > 0 ? (
                        <div className="space-y-3">
                          {selectedPatient.uploadedFiles.map(file => (
                            <div key={file.id} className="p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] flex justify-between items-center group cursor-pointer hover:border-blue-600/50">
                              <div>
                                <p className="text-sm font-medium text-[var(--color-text)]">{file.fileName}</p>
                                <p className="text-xs text-[var(--color-text-muted)] mt-0.5">{file.category} · {new Date(file.uploadDate).toLocaleDateString()}</p>
                              </div>
                              <FileText className="w-4 h-4 text-[var(--color-text-muted)] group-hover:text-blue-600 transition-colors" />
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-xs text-[var(--color-text-muted)]">No files uploaded.</p>}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Add Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-[var(--color-border)]">
                <h3 className="text-lg font-bold text-[var(--color-text)]">Add New {nicheConfig.terminology.customer}</h3>
                <button onClick={() => setIsAddModalOpen(false)} className="p-2 rounded-lg hover:bg-[var(--color-bg)] text-[var(--color-text-muted)]">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">Full Name *</label>
                    <input required type="text" value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50" />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Phone Number *</label>
                    <input required type="tel" value={newPatient.phone} onChange={e => setNewPatient({...newPatient, phone: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Email Address</label>
                    <input type="email" value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Age</label>
                    <input type="number" value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Gender</label>
                    <select value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value as any})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-[var(--color-text)]">Priority</label>
                    <select value={newPatient.priority} onChange={e => setNewPatient({...newPatient, priority: e.target.value as any})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50">
                      <option value="VIP">VIP 🌟</option>
                      <option value="High">High 🔴</option>
                      <option value="Medium">Medium 🟡</option>
                      <option value="Standard">Standard ⚪</option>
                    </select>
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-sm font-medium text-[var(--color-text)]">Tags (comma-separated)</label>
                    <input type="text" placeholder="e.g. Regular, Acne, Laser" value={newPatient.tags} onChange={e => setNewPatient({...newPatient, tags: e.target.value})} className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50" />
                  </div>
                </div>

                {/* Billing Park Integration */}
                <div className="mt-4 p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="sendToBilling" 
                      checked={sendToBilling} 
                      onChange={(e) => setSendToBilling(e.target.checked)} 
                      className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-600 cursor-pointer" 
                    />
                    <label htmlFor="sendToBilling" className="text-sm font-semibold text-slate-800 cursor-pointer">
                      Send to Billing Park
                    </label>
                  </div>
                  
                  {sendToBilling && (
                    <div className="pl-6 flex items-center gap-2">
                      <span className="text-xs text-slate-500 font-medium">Reason:</span>
                      <select 
                        value={billingReasonId}
                        onChange={(e) => setBillingReasonId(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                      >
                        <option value="Consultation Fee">Consultation Fee</option>
                        {activeServices.map(s => (
                          <option key={s.id} value={s.id.toString()}>{s.name} ({formatCurrency(s.price)})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                <div className="pt-4 flex justify-end gap-3 mt-4 border-t border-[var(--color-border)]">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[var(--color-text)] bg-[var(--color-bg)] border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-surface)]">
                    Cancel
                  </button>
                  <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm">
                    Save {nicheConfig.terminology.customer}
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


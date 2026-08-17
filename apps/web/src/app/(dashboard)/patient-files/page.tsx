'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Calendar, Clock, X, FileText, Upload, CheckCircle2, FileUp, User, Pill, FileStack, Receipt, HeartPulse, Plus, Info, MapPin } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';
import { usePatients, type PatientRecord, type UploadedFile } from '@/lib/patients-store';
import { useInvoices } from '@/lib/invoices-store';

const FILE_CATEGORIES = [
  'Prescription',
  'Lab Result',
  'X-Ray/Scan',
  'Pre-op Photo',
  'Before/After Photo',
  'Consent Form',
  'Invoice/Receipt',
  'Insurance Document',
  'Treatment Plan'
] as const;

type FileCategory = typeof FILE_CATEGORIES[number];

export default function PatientFilesPage() {
  const { isManager, isAdmin, isSuperAdmin } = useRole();
  const { nicheConfig } = useNiche();
  const { patients, updatePatient } = usePatients();
  const { getInvoicesByPatientId } = useInvoices();
  
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'files' | 'billing' | 'treatment'>('overview');

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [fileCategory, setFileCategory] = useState<FileCategory>('Lab Result');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Prescription Upload Modal State
  const [isPrescriptionOpen, setIsPrescriptionOpen] = useState(false);
  const [prescriptionForm, setPrescriptionForm] = useState({
    doctorName: '',
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    medications: '',
    notes: ''
  });

  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const canUpload = isManager || isAdmin || isSuperAdmin;

  const filtered = patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patientIdToUse = selected?.id || selectedPatientId;
    if (!uploadedFile || !patientIdToUse) return;

    const patient = patients.find(p => p.id === patientIdToUse);
    if (patient) {
      const newFile = {
        id: crypto.randomUUID(),
        fileName: uploadedFile.name,
        category: fileCategory,
        uploadDate: new Date().toISOString().split('T')[0],
        uploadedBy: 'Current User',
      };
      
      const currentFiles = patient.uploadedFiles || [];
      
      updatePatient(patientIdToUse, {
        uploadedFiles: [...currentFiles, newFile]
      });

      if (selected?.id === patientIdToUse) {
        setSelected(prev => prev ? { ...prev, uploadedFiles: [...(prev.uploadedFiles || []), newFile] } : null);
      }
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadOpen(false);
      setUploadedFile(null);
    }, 1500);
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const newPrescription = {
      id: crypto.randomUUID(),
      ...prescriptionForm
    };
    
    const currentPrescriptions = selected.prescriptions || [];
    
    updatePatient(selected.id, {
      prescriptions: [...currentPrescriptions, newPrescription]
    });

    setSelected(prev => prev ? { ...prev, prescriptions: [...(prev.prescriptions || []), newPrescription] } : null);

    setIsPrescriptionOpen(false);
    setPrescriptionForm({
      doctorName: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      medications: '',
      notes: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2">
            <FileText className="text-blue-400" /> {nicheConfig.terminology?.patientFiles || "Patient Files"}
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">Digital {nicheConfig.terminology?.customer?.toLowerCase() || "patient"} profiles, treatment history & diagnostic logs</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <input 
              type="text" 
              placeholder={`Search ${nicheConfig.terminology?.customers?.toLowerCase() || "patients"}...`} 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-[var(--color-text)]"
            />
          </div>

          {canUpload && (
            <button
              onClick={() => {
                setSelectedPatientId(patients[0]?.id || '');
                setIsUploadOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Upload Files</span>
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.map((patient, i) => (
          <motion.div
            key={patient.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => {
              setSelected(patient);
              setActiveTab('overview');
            }}
            className="p-5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar3D name={patient.name} size="sm" />
              <div>
                <h3 className="font-bold text-[var(--color-text)] group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Age {patient.age || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {(patient.tags || []).map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{tag}</span>
              ))}
              {(!patient.tags || patient.tags.length === 0) && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">New Profile</span>
              )}
            </div>
            
            <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
              <Calendar size={12} /> Registered: {new Date(patient.registrationDate).toLocaleDateString()}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload File Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5 relative"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2">
                  <Upload className="text-blue-400" size={20} />
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Upload Document / File</h2>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(false)} 
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
                  <h3 className="text-xl font-bold text-emerald-400">File Uploaded Successfully!</h3>
                  <p className="text-xs text-[var(--color-text-muted)]">Document saved under profile records.</p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {!selected && (
                    <div>
                      <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Select Profile</label>
                      <select
                        value={selectedPatientId}
                        onChange={(e) => setSelectedPatientId(e.target.value)}
                        className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="" disabled>Select a profile...</option>
                        {patients.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Age {p.age || 'N/A'})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">File Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {FILE_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFileCategory(cat)}
                          className={cn(
                            "py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center",
                            fileCategory === cat
                              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                              : "bg-[var(--color-bg)] border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Upload File / Media</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative",
                        dragActive ? "border-blue-500 bg-blue-500/10" : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text-muted)]"
                      )}
                    >
                      <input
                        type="file"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                      <FileUp size={32} className="text-blue-400 mb-2" />
                      {uploadedFile ? (
                        <div>
                          <p className="text-sm font-semibold text-[var(--color-text)]">{uploadedFile.name}</p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB · Ready for upload</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-[var(--color-text)]">Drag & drop your document here, or <span className="text-blue-400 underline">browse</span></p>
                          <p className="text-[10px] text-[var(--color-text-muted)] mt-1">Supports PDF, PNG, JPG (max 25MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 text-xs font-semibold bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadedFile || (!selected && !selectedPatientId)}
                      className={cn(
                        "px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-md flex items-center gap-2",
                        uploadedFile && (selected || selectedPatientId) ? "bg-blue-600 hover:bg-blue-500 cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      )}
                    >
                      <Upload size={14} />
                      <span>Confirm Upload</span>
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Prescription Upload Modal */}
      <AnimatePresence>
        {isPrescriptionOpen && selected && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex justify-between items-center border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2">
                  <Pill className="text-blue-400" size={20} />
                  <h2 className="text-lg font-bold text-[var(--color-text)]">Add Prescription</h2>
                </div>
                <button 
                  onClick={() => setIsPrescriptionOpen(false)} 
                  className="p-1 text-[var(--color-text-muted)] hover:text-[var(--color-text)] rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Doctor Name</label>
                    <input
                      type="text"
                      required
                      value={prescriptionForm.doctorName}
                      onChange={e => setPrescriptionForm({...prescriptionForm, doctorName: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Date</label>
                    <input
                      type="date"
                      required
                      value={prescriptionForm.date}
                      onChange={e => setPrescriptionForm({...prescriptionForm, date: e.target.value})}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Diagnosis</label>
                  <input
                    type="text"
                    required
                    value={prescriptionForm.diagnosis}
                    onChange={e => setPrescriptionForm({...prescriptionForm, diagnosis: e.target.value})}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Medications (One per line)</label>
                  <textarea
                    required
                    rows={4}
                    value={prescriptionForm.medications}
                    onChange={e => setPrescriptionForm({...prescriptionForm, medications: e.target.value})}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text-muted)] mb-1.5">Optional File/Scan</label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative",
                      dragActive ? "border-blue-500 bg-blue-500/10" : "border-[var(--color-border)] bg-[var(--color-bg)] hover:border-[var(--color-text-muted)]"
                    )}
                  >
                    <input
                      type="file"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                    <FileUp size={24} className="text-blue-400 mb-1" />
                    {uploadedFile ? (
                      <p className="text-xs font-semibold text-[var(--color-text)]">{uploadedFile.name}</p>
                    ) : (
                      <p className="text-[10px] text-[var(--color-text-muted)]">Drag & drop scanned copy here (optional)</p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-[var(--color-border)]">
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionOpen(false)}
                    className="px-4 py-2 text-xs font-semibold bg-[var(--color-bg)] hover:bg-[var(--color-border)] text-[var(--color-text)] rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md flex items-center gap-2"
                  >
                    <Plus size={14} />
                    <span>Save Prescription</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="w-full max-w-5xl bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-[var(--color-border)]">
                <div className="flex items-center gap-4">
                  <Avatar3D name={selected.name} size="lg" />
                  <div>
                    <h2 className="text-2xl font-bold text-[var(--color-text)]">{selected.name}</h2>
                    <p className="text-[var(--color-text-muted)] text-sm">
                      ID: #{selected.id.substring(0, 8)} • {selected.email} • {selected.phone}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)] rounded-xl transition-colors">
                  <X size={24} />
                </button>
              </div>

              {/* Tabs Nav */}
              <div className="flex px-6 border-b border-[var(--color-border)] bg-[var(--color-bg)]/50 overflow-x-auto no-scrollbar">
                {[
                  { id: 'overview', icon: User, label: 'Overview' },
                  { id: 'prescriptions', icon: Pill, label: 'Prescriptions' },
                  { id: 'files', icon: FileStack, label: 'Documents & Files' },
                  { id: 'billing', icon: Receipt, label: 'Billing History' },
                  { id: 'treatment', icon: HeartPulse, label: 'Treatment Plans' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-4 text-sm font-semibold transition-colors border-b-2 whitespace-nowrap",
                      activeTab === tab.id 
                        ? "border-blue-500 text-blue-500" 
                        : "border-transparent text-[var(--color-text-muted)] hover:text-[var(--color-text)] hover:border-[var(--color-border)]"
                    )}
                  >
                    <tab.icon size={16} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-[var(--color-bg)]">
                <AnimatePresence mode="wait">
                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <motion.div
                      key="overview"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold mb-1">Registration Date</p>
                          <p className="text-lg font-bold text-[var(--color-text)]">{new Date(selected.registrationDate).toLocaleDateString()}</p>
                        </div>
                        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold mb-1">Total Visits</p>
                          <p className="text-lg font-bold text-[var(--color-text)]">{selected.totalVisits}</p>
                        </div>
                        <div className="bg-[var(--color-surface)] p-4 rounded-2xl border border-[var(--color-border)]">
                          <p className="text-xs text-[var(--color-text-muted)] font-semibold mb-1">Lifetime Value</p>
                          <p className="text-lg font-bold text-green-500">{formatCurrency(selected.ltv)}</p>
                        </div>
                      </div>

                      <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
                        <h3 className="font-bold text-[var(--color-text)] mb-4 flex items-center gap-2"><Info size={18} className="text-blue-400"/> Personal Information</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-4 gap-x-8">
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Age</p>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{selected.age || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Gender</p>
                            <p className="text-sm font-semibold text-[var(--color-text)] capitalize">{selected.gender || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Registration Date</p>
                            <p className="text-sm font-semibold text-[var(--color-text)]">{selected.registrationDate}</p>
                          </div>
                          <div>
                            <p className="text-xs text-[var(--color-text-muted)]">Priority</p>
                            <span className={cn(
                              "text-xs px-2 py-0.5 rounded-full inline-block mt-1 font-semibold",
                              selected.priority === 'High' ? "bg-red-500/10 text-red-500 border border-red-500/20" :
                              selected.priority === 'Medium' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                              selected.priority === 'VIP' ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" :
                              "bg-green-500/10 text-green-500 border border-green-500/20"
                            )}>
                              {selected.priority.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {selected.tags && selected.tags.length > 0 && (
                        <div className="bg-[var(--color-surface)] p-6 rounded-2xl border border-[var(--color-border)]">
                          <h3 className="font-bold text-[var(--color-text)] mb-2 flex items-center gap-2"><MapPin size={18} className="text-blue-400"/> Tags</h3>
                          <div className="flex flex-wrap gap-2">
                            {selected.tags.map((t, idx) => (
                              <span key={idx} className="px-2.5 py-1 rounded-lg text-xs bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)]">{t}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* PRESCRIPTIONS TAB */}
                  {activeTab === 'prescriptions' && (
                    <motion.div
                      key="prescriptions"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-[var(--color-text)]">Medical Prescriptions</h3>
                        {canUpload && (
                          <button
                            onClick={() => setIsPrescriptionOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            <Plus size={14} /> Upload Prescription
                          </button>
                        )}
                      </div>

                      {(!selected.prescriptions || selected.prescriptions.length === 0) ? (
                        <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                          <Pill size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
                          <p className="text-[var(--color-text-muted)] text-sm">No prescriptions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {[...selected.prescriptions].reverse().map(rx => (
                            <div key={rx.id} className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                              <div className="flex justify-between items-start mb-3">
                                <div>
                                  <h4 className="font-bold text-[var(--color-text)] text-lg">{rx.diagnosis}</h4>
                                  <p className="text-xs text-[var(--color-text-muted)]">Prescribed by {rx.doctorName} • {new Date(rx.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              <div className="bg-[var(--color-bg)] p-3 rounded-xl border border-[var(--color-border)]">
                                <p className="text-xs font-semibold text-[var(--color-text-muted)] mb-1">Medications</p>
                                <p className="text-sm text-[var(--color-text)] whitespace-pre-line">{rx.medications}</p>
                              </div>
                              {rx.notes && (
                                <p className="text-xs text-[var(--color-text-muted)] mt-3">Notes: {rx.notes}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* FILES TAB */}
                  {activeTab === 'files' && (
                    <motion.div
                      key="files"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-[var(--color-text)]">Uploaded Documents</h3>
                        {canUpload && (
                          <button
                            onClick={() => setIsUploadOpen(true)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-all"
                          >
                            <Upload size={14} /> Upload File
                          </button>
                        )}
                      </div>

                      {(!selected.uploadedFiles || selected.uploadedFiles.length === 0) ? (
                        <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                          <FileStack size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
                          <p className="text-[var(--color-text-muted)] text-sm">No files uploaded yet.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {[...selected.uploadedFiles].reverse().map(file => (
                            <div key={file.id} className="flex items-center gap-4 bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                              <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                                <FileText size={20} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--color-text)] truncate">{file.fileName}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-muted)]">
                                    {file.category}
                                  </span>
                                  <span className="text-[10px] text-[var(--color-text-muted)]">
                                    {new Date(file.uploadDate).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}

                  {/* BILLING TAB */}
                  {activeTab === 'billing' && (
                    <motion.div
                      key="billing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-[var(--color-text)] mb-4">Billing History</h3>
                      
                      {(() => {
                        const invoices = getInvoicesByPatientId(selected.id);
                        if (invoices.length === 0) {
                          return (
                            <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                              <Receipt size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
                              <p className="text-[var(--color-text-muted)] text-sm">No billing records found.</p>
                            </div>
                          );
                        }
                        
                        return (
                          <div className="space-y-3">
                            {invoices.map(inv => (
                              <div key={inv.id} className="flex items-center justify-between bg-[var(--color-surface)] p-4 rounded-xl border border-[var(--color-border)]">
                                <div>
                                  <p className="text-sm font-semibold text-[var(--color-text)]">Invoice #{inv.invoiceNo}</p>
                                  <p className="text-xs text-[var(--color-text-muted)] mt-1">{inv.createdDate} • {inv.lineItems?.length || 1} items</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(inv.grandTotal)}</p>
                                  <span className={cn(
                                    "text-[10px] px-2 py-0.5 rounded-full inline-block mt-1 font-semibold",
                                    inv.paymentStatus === 'PAID' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                                    inv.paymentStatus === 'PARTIAL' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                                    "bg-red-500/10 text-red-500 border border-red-500/20"
                                  )}>
                                    {inv.paymentStatus}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </motion.div>
                  )}

                  {/* TREATMENT PLANS TAB */}
                  {activeTab === 'treatment' && (
                    <motion.div
                      key="treatment"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      <h3 className="font-bold text-[var(--color-text)] mb-4">Treatment Plans</h3>

                      {(!selected.treatmentPlans || selected.treatmentPlans.length === 0) ? (
                        <div className="text-center py-12 bg-[var(--color-surface)] rounded-2xl border border-[var(--color-border)]">
                          <HeartPulse size={32} className="mx-auto text-[var(--color-text-muted)] mb-3 opacity-50" />
                          <p className="text-[var(--color-text-muted)] text-sm">No active treatment plans.</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {selected.treatmentPlans.map(plan => (
                            <div key={plan.id} className="bg-[var(--color-surface)] p-5 rounded-2xl border border-[var(--color-border)]">
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className="font-bold text-[var(--color-text)]">{plan.packageName}</h4>
                                  <p className="text-xs text-[var(--color-text-muted)] mt-1">Started on {new Date(plan.startDate).toLocaleDateString()}</p>
                                </div>
                                <span className={cn(
                                  "text-[10px] px-2 py-1 rounded-full font-semibold border",
                                  plan.status === 'Active' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                  plan.status === 'Completed' ? "bg-blue-500/10 text-blue-500 border-blue-500/20" :
                                  "bg-amber-500/10 text-amber-500 border-amber-500/20"
                                )}>
                                  {plan.status.toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                  <span className="text-[var(--color-text-muted)]">Progress</span>
                                  <span className="font-semibold text-[var(--color-text)]">{plan.completedSessions} / {plan.totalSessions} Sessions</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden border border-[var(--color-border)]">
                                  <div 
                                    className="bg-blue-500 h-full rounded-full transition-all duration-500" 
                                    style={{ width: `${(plan.completedSessions / plan.totalSessions) * 100}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

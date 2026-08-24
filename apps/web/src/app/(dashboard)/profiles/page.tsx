'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Activity, 
  Calendar, 
  Clock, 
  X, 
  FileText, 
  Upload, 
  CheckCircle2, 
  FileUp, 
  User, 
  Pill, 
  FileStack, 
  Receipt, 
  HeartPulse, 
  Plus, 
  Info, 
  Sparkles,
  Phone,
  Mail,
  Shield,
  Download,
  Eye,
  Filter
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';
import { usePatients, type PatientRecord, type UploadedFile, type PrescriptionRecord, type TreatmentPlan } from '@/lib/patients-store';
import { useInvoices, type InvoiceRecord } from '@/lib/invoices-store';
import { PatientSearchInput } from '@/components/ui/patient-search-input';

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

export default function ProfilesPage() {
  const { isManager, isAdmin, isSuperAdmin } = useRole();
  const { nicheConfig } = useNiche();
  const { patients, updatePatient } = usePatients();
  const { getInvoicesByPatientId } = useInvoices();
  
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<PatientRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'prescriptions' | 'files' | 'billing' | 'treatment'>('overview');

  // Dynamic terminology
  const customerSingular = nicheConfig?.terminology.customer || 'Customer';
  const customerPlural = nicheConfig?.terminology.customers || 'Customers';
  const pageTitle = nicheConfig?.terminology.patientFiles || 'Customer Profiles & Records';

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [fileCategory, setFileCategory] = useState<FileCategory>('Lab Result');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  // Prescription / Notes Modal State
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

  const filtered = patients.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.phone.includes(search) || 
    p.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !uploadedFile) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    const newFile: UploadedFile = {
      id: `file-${Date.now()}`,
      fileName: uploadedFile.name,
      category: fileCategory,
      fileSize: `${(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: 'Frontdesk AI & Staff'
    };

    const updatedFiles = [...(patient.uploadedFiles || []), newFile];
    updatePatient(patient.id, { uploadedFiles: updatedFiles });

    if (selected && selected.id === patient.id) {
      setSelected({ ...patient, uploadedFiles: updatedFiles });
    }

    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadOpen(false);
      setUploadedFile(null);
      setSelectedPatientId('');
    }, 1200);
  };

  const handlePrescriptionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;

    const newPrescription: PrescriptionRecord = {
      id: `rx-${Date.now()}`,
      date: prescriptionForm.date,
      doctorName: prescriptionForm.doctorName || 'Senior Specialist',
      diagnosis: prescriptionForm.diagnosis,
      medications: prescriptionForm.medications,
      notes: prescriptionForm.notes
    };

    const updatedPrescriptions = [...(selected.prescriptions || []), newPrescription];
    updatePatient(selected.id, { prescriptions: updatedPrescriptions });
    setSelected({ ...selected, prescriptions: updatedPrescriptions });

    setIsPrescriptionOpen(false);
    setPrescriptionForm({
      doctorName: '',
      date: new Date().toISOString().split('T')[0],
      diagnosis: '',
      medications: '',
      notes: ''
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-[var(--color-text)] tracking-tight">
              {pageTitle}
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {patients.length} {customerPlural}
            </span>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Complete digital history, documentation, intake forms, notes, and billing records.
          </p>
        </div>

        {canUpload && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/20"
            >
              <Upload className="w-4 h-4" />
              Upload Document
            </button>
          </div>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Customer/Patient List */}
        <div className="lg:col-span-1 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden flex flex-col h-[740px]">
          <div className="p-4 border-b border-[var(--color-border)] space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[var(--color-text-secondary)] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={`Search ${customerPlural.toLowerCase()} by name, phone, or ID...`}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl pl-9 pr-4 py-2 text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            <div className="flex items-center justify-between text-xs text-[var(--color-text-secondary)] px-1">
              <span>Showing {filtered.length} of {patients.length}</span>
              <span className="text-blue-500 font-medium">Sorted by Recent Activity</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[var(--color-border)]">
            {filtered.map(patient => (
              <button
                key={patient.id}
                onClick={() => setSelected(patient)}
                className={cn(
                  "w-full p-4 text-left transition-all flex items-start gap-3.5 hover:bg-[var(--color-bg)] relative",
                  selected?.id === patient.id && "bg-blue-500/10 dark:bg-blue-500/15 border-l-4 border-l-blue-500"
                )}
              >
                <Avatar3D name={patient.name} className="w-10 h-10 shrink-0 text-sm font-bold mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-sm text-[var(--color-text)] truncate">{patient.name}</h4>
                    <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      {patient.id}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-1">
                    <span>{patient.gender || 'Client'}, {patient.age || 28} yrs</span>
                    <span>•</span>
                    <span className="truncate">{patient.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text-secondary)]">
                      {patient.uploadedFiles?.length || 0} files
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium">
                      {patient.totalVisits || 1} visits
                    </span>
                  </div>
                </div>
              </button>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-[var(--color-text-secondary)]">
                No matching {customerPlural.toLowerCase()} found.
              </div>
            )}
          </div>
        </div>

        {/* Right: Detailed Record View */}
        <div className="lg:col-span-2 border border-[var(--color-border)] rounded-2xl bg-[var(--color-bg-secondary)] overflow-hidden flex flex-col h-[740px]">
          {selected ? (
            <div className="flex flex-col h-full">
              {/* Profile Banner */}
              <div className="p-6 border-b border-[var(--color-border)] bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-transparent">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <Avatar3D name={selected.name} className="w-14 h-14 text-lg font-bold" />
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-[var(--color-text)]">{selected.name}</h2>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                          {selected.id}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-[var(--color-text-secondary)] mt-1.5">
                        <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-blue-500" /> {selected.phone}</span>
                        {selected.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-blue-500" /> {selected.email}</span>}
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Priority: {selected.priority}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canUpload && (
                      <button
                        onClick={() => setIsPrescriptionOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Note / Rx
                      </button>
                    )}
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex items-center gap-2 mt-6 border-b border-[var(--color-border)] pb-2 overflow-x-auto">
                  {(['overview', 'treatment', 'files', 'prescriptions', 'billing'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={cn(
                        "px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all shrink-0",
                        activeTab === tab 
                          ? "bg-blue-600 text-white shadow-sm" 
                          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg)]"
                      )}
                    >
                      {tab === 'files' ? `Documents (${selected.uploadedFiles?.length || 0})` : 
                       tab === 'prescriptions' ? 'Notes / Rx' : 
                       tab === 'billing' ? 'Invoices & Folio' : 
                       tab === 'treatment' ? 'Treatment Plans' : 'Overview'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tab Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {activeTab === 'overview' && (
                  <div className="space-y-6">
                    {/* Quick Stats Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Lifetime Value</span>
                        <p className="text-base font-bold text-[var(--color-text)] mt-0.5">{formatCurrency(selected.ltv || 0)}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Total Visits</span>
                        <p className="text-base font-bold text-blue-600 dark:text-blue-400 mt-0.5">{selected.totalVisits || 1}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Last Visit</span>
                        <p className="text-base font-bold text-[var(--color-text)] mt-0.5">{selected.lastVisit || 'Recent'}</p>
                      </div>
                      <div className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)]">
                        <span className="text-[11px] text-[var(--color-text-secondary)] font-medium">Member Priority</span>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{selected.priority}</p>
                      </div>
                    </div>

                    {/* Profile Summary */}
                    <div className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-3">
                      <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider flex items-center gap-2">
                        <Activity className="w-4 h-4 text-blue-500" />
                        Account & Preference Tags
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Assigned Tags:</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {(selected.tags || []).map((t, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-semibold">
                                {t}
                              </span>
                            ))}
                            {(!selected.tags || selected.tags.length === 0) && <span className="text-[var(--color-text-secondary)]">Standard Profile</span>}
                          </div>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Registered Date:</span>
                          <p className="font-semibold text-[var(--color-text)] mt-0.5">{selected.registrationDate}</p>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Active Plans:</span>
                          <p className="font-semibold text-[var(--color-text)] mt-0.5">{selected.treatmentPlans?.length || 0} ongoing packages</p>
                        </div>
                        <div>
                          <span className="text-[var(--color-text-secondary)]">Preferred Channel:</span>
                          <p className="font-semibold text-blue-600 dark:text-blue-400 mt-0.5">WhatsApp & Voice AI</p>
                        </div>
                      </div>
                    </div>

                    {/* Recent Documents Preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-[var(--color-text)] uppercase tracking-wider">
                          Attached Documents ({selected.uploadedFiles?.length || 0})
                        </h4>
                        <button onClick={() => setActiveTab('files')} className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                          View All
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(selected.uploadedFiles || []).slice(0, 4).map(file => (
                          <div key={file.id} className="p-3 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="w-4 h-4 text-blue-500 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[var(--color-text)] truncate">{file.fileName}</p>
                                <span className="text-[10px] text-[var(--color-text-secondary)]">{file.category} • {file.fileSize || 'PDF'}</span>
                              </div>
                            </div>
                            <span className="text-[10px] text-[var(--color-text-secondary)]">{file.uploadDate}</span>
                          </div>
                        ))}
                        {(!selected.uploadedFiles || selected.uploadedFiles.length === 0) && (
                          <p className="text-xs text-[var(--color-text-secondary)] col-span-2 italic">No documents attached yet.</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'files' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[var(--color-text)]">All Attached Files & Scans</h4>
                      <button
                        onClick={() => {
                          setSelectedPatientId(selected.id);
                          setIsUploadOpen(true);
                        }}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        Upload To Profile
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(selected.uploadedFiles || []).map(file => (
                        <div key={file.id} className="p-3.5 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                              <FileText className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-[var(--color-text)]">{file.fileName}</p>
                              <div className="flex items-center gap-2 text-xs text-[var(--color-text-secondary)] mt-0.5">
                                <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium text-[10px]">
                                  {file.category}
                                </span>
                                <span>•</span>
                                <span>{file.fileSize || 'Document'}</span>
                                <span>•</span>
                                <span>Uploaded {file.uploadDate}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-blue-500 transition-colors">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button className="p-2 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-blue-500 transition-colors">
                              <Download className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}

                      {(!selected.uploadedFiles || selected.uploadedFiles.length === 0) && (
                        <div className="p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl space-y-3">
                          <FileStack className="w-8 h-8 text-[var(--color-text-secondary)] mx-auto opacity-50" />
                          <p className="text-sm text-[var(--color-text-secondary)]">No files or digital scans uploaded for this {customerSingular.toLowerCase()}.</p>
                          <button
                            onClick={() => {
                              setSelectedPatientId(selected.id);
                              setIsUploadOpen(true);
                            }}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl inline-flex items-center gap-2"
                          >
                            <Upload className="w-4 h-4" />
                            Upload First File
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'prescriptions' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-[var(--color-text)]">Clinical Notes & Prescriptions</h4>
                      <button
                        onClick={() => setIsPrescriptionOpen(true)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        New Entry
                      </button>
                    </div>

                    <div className="space-y-3">
                      {(selected.prescriptions || []).map(rx => (
                        <div key={rx.id} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] space-y-2.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Pill className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-sm text-[var(--color-text)]">{rx.diagnosis || 'Clinical Consultation'}</span>
                            </div>
                            <span className="text-xs text-[var(--color-text-secondary)]">{rx.date} • {rx.doctorName}</span>
                          </div>
                          {rx.medications && (
                            <div className="p-2.5 rounded-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-xs space-y-1">
                              <span className="font-semibold text-[var(--color-text)]">Prescription / Protocol:</span>
                              <p className="text-[var(--color-text-secondary)] font-mono whitespace-pre-wrap">{rx.medications}</p>
                            </div>
                          )}
                          {rx.notes && (
                            <p className="text-xs text-[var(--color-text-secondary)] italic">Notes: {rx.notes}</p>
                          )}
                        </div>
                      ))}

                      {(!selected.prescriptions || selected.prescriptions.length === 0) && (
                        <div className="p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                          <p className="text-sm text-[var(--color-text-secondary)]">No clinical notes or prescriptions logged yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'treatment' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-text)]">Active Packages & Treatment Plans</h4>
                    <div className="space-y-3">
                      {(selected.treatmentPlans || []).map((plan) => (
                        <div key={plan.id} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                          <div>
                            <p className="text-sm font-bold text-[var(--color-text)]">{plan.packageName}</p>
                            <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                              Sessions: {plan.completedSessions} / {plan.totalSessions} • Started: {plan.startDate}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={cn(
                              "px-2.5 py-1 rounded-full text-xs font-semibold",
                              plan.status === 'Active' ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-blue-500/10 text-blue-600"
                            )}>
                              {plan.status}
                            </span>
                            <p className="text-xs font-bold text-[var(--color-text)] mt-1">{formatCurrency(plan.totalAmount)}</p>
                          </div>
                        </div>
                      ))}

                      {(!selected.treatmentPlans || selected.treatmentPlans.length === 0) && (
                        <div className="p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                          <p className="text-sm text-[var(--color-text-secondary)]">No ongoing treatment plans or packages recorded.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div className="space-y-4">
                    <h4 className="text-sm font-bold text-[var(--color-text)]">Invoice & Payment History</h4>
                    <div className="space-y-3">
                      {getInvoicesByPatientId(selected.id).map(inv => (
                        <div key={inv.id} className="p-4 rounded-xl bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Receipt className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="text-sm font-bold text-[var(--color-text)]">{inv.invoiceNo}</p>
                              <p className="text-xs text-[var(--color-text-secondary)]">{inv.createdDate} • {inv.lineItems?.map(i => i.serviceName).join(', ')}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-[var(--color-text)]">{formatCurrency(inv.grandTotal)}</p>
                            <span className={cn(
                              "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                              inv.paymentStatus === 'PAID' ? "bg-emerald-500/10 text-emerald-500" : "bg-amber-500/10 text-amber-500"
                            )}>
                              {inv.paymentStatus}
                            </span>
                          </div>
                        </div>
                      ))}

                      {getInvoicesByPatientId(selected.id).length === 0 && (
                        <div className="p-12 text-center border-2 border-dashed border-[var(--color-border)] rounded-2xl">
                          <p className="text-sm text-[var(--color-text-secondary)]">No previous invoices found for this {customerSingular.toLowerCase()}.</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
              <User className="w-12 h-12 text-[var(--color-text-secondary)] opacity-40" />
              <h3 className="text-lg font-bold text-[var(--color-text)]">Select a {customerSingular} Record</h3>
              <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
                Choose a {customerSingular.toLowerCase()} from the left sidebar to view digital files, past sessions, prescriptions, and billing.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Upload Document Modal */}
      <AnimatePresence>
        {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Upload className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[var(--color-text)]">Upload Digital Record</h3>
                </div>
                <button onClick={() => setIsUploadOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Target {customerSingular}</label>
                  <PatientSearchInput
                    onSelect={(p) => setSelectedPatientId(p?.id || '')}
                    placeholder={`Search and assign ${customerSingular.toLowerCase()}...`}
                    selectedPatientId={selectedPatientId || selected?.id}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Document Category</label>
                  <select
                    value={fileCategory}
                    onChange={(e) => setFileCategory(e.target.value as FileCategory)}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  >
                    {FILE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">File Attachment</label>
                  <div 
                    onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setDragActive(false);
                      if (e.dataTransfer.files?.[0]) setUploadedFile(e.dataTransfer.files[0]);
                    }}
                    className={cn(
                      "border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer",
                      dragActive ? "border-blue-500 bg-blue-500/5" : "border-[var(--color-border)] hover:border-blue-500/50"
                    )}
                    onClick={() => document.getElementById('file-upload-input')?.click()}
                  >
                    <input 
                      id="file-upload-input" 
                      type="file" 
                      className="hidden" 
                      onChange={(e) => {
                        if (e.target.files?.[0]) setUploadedFile(e.target.files[0]);
                      }}
                    />
                    <FileUp className="w-8 h-8 text-blue-500 mx-auto mb-2 opacity-80" />
                    {uploadedFile ? (
                      <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">{uploadedFile.name} ({(uploadedFile.size / 1024).toFixed(1)} KB)</p>
                    ) : (
                      <p className="text-xs text-[var(--color-text-secondary)]">Click to browse or drag and drop PDF, JPG, PNG or DICOM</p>
                    )}
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsUploadOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!uploadedFile || !selectedPatientId}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    {uploadSuccess ? 'Uploaded Successfully!' : 'Save & Attach'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Clinical Note / Rx Modal */}
      <AnimatePresence>
        {isPrescriptionOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-5 border-b border-[var(--color-border)] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <Pill className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-[var(--color-text)]">New Clinical Entry / Note</h3>
                </div>
                <button onClick={() => setIsPrescriptionOpen(false)} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)]">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePrescriptionSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text)]">Practitioner / Specialist</label>
                    <input
                      type="text"
                      placeholder="e.g. Dr. Rajesh"
                      value={prescriptionForm.doctorName}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, doctorName: e.target.value })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-[var(--color-text)]">Date</label>
                    <input
                      type="date"
                      value={prescriptionForm.date}
                      onChange={(e) => setPrescriptionForm({ ...prescriptionForm, date: e.target.value })}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Diagnosis / Observation</label>
                  <input
                    type="text"
                    placeholder="e.g. Consultation & Assessment"
                    value={prescriptionForm.diagnosis}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Prescription / Recommended Plan</label>
                  <textarea
                    rows={3}
                    placeholder="Recommendations & Action Items&#10;Follow up schedule"
                    value={prescriptionForm.medications}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, medications: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500 resize-none font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-[var(--color-text)]">Additional Notes</label>
                  <input
                    type="text"
                    placeholder="Next follow up in 7 days"
                    value={prescriptionForm.notes}
                    onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
                    className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-xs text-[var(--color-text)] focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionOpen(false)}
                    className="px-4 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/20"
                  >
                    Save Entry
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

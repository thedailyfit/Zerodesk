'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Activity, Calendar, Clock, X, FileText, Upload, CheckCircle2, FileUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar3D } from '@/components/ui/avatar-3d';
import { useRole } from '@/components/providers/role-provider';
import { useNiche } from '@/components/providers/niche-provider';

const PATIENTS = [
  { id: 1, name: 'Vikram Singh', age: 34, lastVisit: '2026-08-01', tags: ['Active Plan', 'Verified'], frontMarkers: [{x: 45, y: 15, type: 'active', label: 'Primary Area'}, {x: 65, y: 40, type: 'treated', label: 'Review'}], backMarkers: [] },
  { id: 2, name: 'Priya Sharma', age: 28, lastVisit: '2026-07-25', tags: ['In Progress', 'Monitoring'], frontMarkers: [{x: 55, y: 20, type: 'monitoring', label: 'Consultation'}], backMarkers: [{x: 50, y: 35, type: 'active', label: 'Follow-up'}] },
  { id: 3, name: 'Rajesh Kumar', age: 42, lastVisit: '2026-08-05', tags: ['VIP Client', 'Active'], frontMarkers: [{x: 50, y: 8, type: 'active', label: 'Routine Care'}], backMarkers: [] },
  { id: 4, name: 'Sneha Reddy', age: 31, lastVisit: '2026-06-15', tags: ['Completed', 'Review Done'], frontMarkers: [], backMarkers: [{x: 40, y: 60, type: 'treated', label: 'Completed'}] },
  { id: 5, name: 'Amit Patel', age: 45, lastVisit: '2026-08-03', tags: ['General Assessment'], frontMarkers: [{x: 40, y: 22, type: 'active', label: 'Inquiry Area'}], backMarkers: [] },
  { id: 6, name: 'Meera Joshi', age: 26, lastVisit: '2026-07-30', tags: ['VIP Package'], frontMarkers: [{x: 48, y: 14, type: 'monitoring', label: 'Assessment'}], backMarkers: [] },
  { id: 7, name: 'Kiran Tiwari', age: 38, lastVisit: '2026-07-12', tags: ['Annual Check'], frontMarkers: [], backMarkers: [] },
  { id: 8, name: 'Rahul Bose', age: 29, lastVisit: '2026-08-06', tags: ['Specialist Session'], frontMarkers: [{x: 35, y: 38, type: 'treated', label: 'Review'}], backMarkers: [] },
];

export default function PatientFilesPage() {
  const { isManager, isAdmin, isSuperAdmin } = useRole();
  const { nicheConfig } = useNiche();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof PATIENTS[0] | null>(null);

  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<number>(PATIENTS[0].id);
  const [fileCategory, setFileCategory] = useState<'Lab Result' | 'Pre-op Photo' | 'Consent Form'>('Lab Result');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const canUpload = isManager || isAdmin || isSuperAdmin;

  const filtered = PATIENTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

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
    setUploadSuccess(true);
    setTimeout(() => {
      setUploadSuccess(false);
      setIsUploadOpen(false);
      setUploadedFile(null);
    }, 1500);
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
              onClick={() => setIsUploadOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shrink-0 cursor-pointer"
            >
              <Upload size={16} />
              <span>Upload Patient Files</span>
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
            onClick={() => setSelected(patient)}
            className="p-5 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl cursor-pointer hover:border-blue-500/50 transition-all group shadow-sm"
          >
            <div className="flex items-center gap-4 mb-4">
              <Avatar3D name={patient.name} size="sm" />
              <div>
                <h3 className="font-bold text-[var(--color-text)] group-hover:text-blue-400 transition-colors">{patient.name}</h3>
                <p className="text-xs text-[var(--color-text-muted)]">Age {patient.age}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {patient.tags.map(tag => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">{tag}</span>
              ))}
            </div>
            
            <div className="text-[10px] text-[var(--color-text-muted)] flex items-center gap-1">
              <Calendar size={12} /> Last Visit: {patient.lastVisit}
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
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-white space-y-5 relative"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Upload className="text-blue-400" size={20} />
                  <h2 className="text-lg font-bold">Upload Patient Document / File</h2>
                </div>
                <button 
                  onClick={() => setIsUploadOpen(false)} 
                  className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {uploadSuccess ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                  <CheckCircle2 size={48} className="text-emerald-400 animate-bounce" />
                  <h3 className="text-xl font-bold text-emerald-400">File Uploaded Successfully!</h3>
                  <p className="text-xs text-slate-400">Document saved under patient profile records.</p>
                </div>
              ) : (
                <form onSubmit={handleUploadSubmit} className="space-y-4">
                  {/* Select Patient */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Patient</label>
                    <select
                      value={selectedPatientId}
                      onChange={(e) => setSelectedPatientId(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {PATIENTS.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Age {p.age} - PID: #{p.id.toString().padStart(4, '0')})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* File Category Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">File Category</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['Lab Result', 'Pre-op Photo', 'Consent Form'] as const).map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFileCategory(cat)}
                          className={cn(
                            "py-2 px-3 text-xs font-semibold rounded-xl border transition-all text-center",
                            fileCategory === cat
                              ? "bg-blue-600 border-blue-500 text-white shadow-md shadow-blue-600/20"
                              : "bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700"
                          )}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* File Dropzone */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Upload File / Media</label>
                    <div
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      className={cn(
                        "border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center relative",
                        dragActive ? "border-blue-500 bg-blue-500/10" : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
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
                          <p className="text-sm font-semibold text-white">{uploadedFile.name}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{(uploadedFile.size / 1024).toFixed(1)} KB · Ready for upload</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-xs font-semibold text-slate-200">Drag & drop your document here, or <span className="text-blue-400 underline">browse</span></p>
                          <p className="text-[10px] text-slate-500 mt-1">Supports PDF, PNG, JPG, DICOM (max 25MB)</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                    <button
                      type="button"
                      onClick={() => setIsUploadOpen(false)}
                      className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!uploadedFile}
                      className={cn(
                        "px-5 py-2 text-xs font-semibold text-white rounded-xl transition-all shadow-md flex items-center gap-2",
                        uploadedFile ? "bg-blue-600 hover:bg-blue-500 cursor-pointer" : "bg-slate-800 text-slate-500 cursor-not-allowed"
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

      {/* Patient Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[90vh]"
            >
              {/* Left Panel: Info & Timeline */}
              <div className="w-full md:w-1/2 p-6 border-r border-slate-800 overflow-y-auto">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <Avatar3D name={selected.name} size="lg" />
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selected.name}</h2>
                      <p className="text-slate-400 text-sm">Age {selected.age} • Patient ID: #PID-{selected.id.toString().padStart(4, '0')}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelected(null)} className="md:hidden p-2 text-slate-400"><X /></button>
                </div>

                <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock size={16} className="text-blue-400"/> Medical History</h3>
                <div className="space-y-4 relative before:absolute before:inset-y-0 before:left-2 before:w-px before:bg-slate-800">
                  {[1, 2, 3].map((_, idx) => (
                    <div key={idx} className="relative z-10 pl-6">
                      <div className="absolute left-1 top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-slate-900" />
                      <p className="text-xs font-bold text-slate-200">Consultation & Treatment</p>
                      <p className="text-[10px] text-slate-500 mb-1">{selected.lastVisit}</p>
                      <p className="text-xs text-slate-400 bg-slate-950 p-2 rounded-lg border border-slate-800">Discussed concerns. Recommended course of action for next 3 months.</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Panel: Body Map */}
              <div className="w-full md:w-1/2 bg-slate-950 p-6 relative flex flex-col items-center justify-center">
                <button onClick={() => setSelected(null)} className="hidden md:block absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full transition-colors"><X size={18} /></button>
                
                <h3 className="font-bold text-white mb-6 text-center w-full flex items-center justify-center gap-2"><Activity size={18} className="text-rose-400"/> Digital Body Map</h3>
                
                <div className="flex gap-8 items-center justify-center h-64 w-full">
                  {/* Front Silhouette */}
                  <div className="relative w-32 h-64">
                    <svg viewBox="0 0 100 200" className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M50 10 C35 10 35 30 50 30 C65 30 65 10 50 10 Z" />
                      <path d="M50 30 L50 40 M30 50 C40 40 60 40 70 50 L90 100 M10 100 L30 50 M30 120 L30 50 M70 120 L70 50 M30 120 L40 190 M70 120 L60 190 M40 190 L50 120 L60 190" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {selected.frontMarkers.map((m, idx) => (
                      <div key={idx} className="absolute group" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={cn("w-3 h-3 rounded-full animate-pulse", m.type === 'active' ? 'bg-red-500' : m.type === 'treated' ? 'bg-green-500' : 'bg-amber-500')} />
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-black text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{m.label}</div>
                      </div>
                    ))}
                    <div className="text-center text-[10px] text-slate-500 mt-2 font-bold uppercase">Front</div>
                  </div>

                  {/* Back Silhouette */}
                  <div className="relative w-32 h-64">
                    <svg viewBox="0 0 100 200" className="w-full h-full text-slate-800" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M50 10 C35 10 35 30 50 30 C65 30 65 10 50 10 Z" />
                      <path d="M50 30 L50 40 M30 50 C40 40 60 40 70 50 L90 100 M10 100 L30 50 M30 120 L30 50 M70 120 L70 50 M30 120 L40 190 M70 120 L60 190 M40 190 L50 120 L60 190" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {selected.backMarkers.map((m, idx) => (
                      <div key={idx} className="absolute group" style={{ left: `${m.x}%`, top: `${m.y}%`, transform: 'translate(-50%, -50%)' }}>
                        <div className={cn("w-3 h-3 rounded-full animate-pulse", m.type === 'active' ? 'bg-red-500' : m.type === 'treated' ? 'bg-green-500' : 'bg-amber-500')} />
                        <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-black text-white text-[9px] px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">{m.label}</div>
                      </div>
                    ))}
                    <div className="text-center text-[10px] text-slate-500 mt-2 font-bold uppercase">Back</div>
                  </div>
                </div>

                <div className="flex gap-4 mt-12 text-[10px] text-slate-400">
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-red-500 rounded-full"/> Active Concern</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-amber-500 rounded-full"/> Monitoring</span>
                  <span className="flex items-center gap-1"><div className="w-2 h-2 bg-green-500 rounded-full"/> Treated</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

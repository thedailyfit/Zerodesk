'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, Phone, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePatients, type PatientRecord, searchPatients } from '@/lib/patients-store';

interface PatientSearchInputProps {
  onSelect: (patient: PatientRecord) => void;
  onClear?: () => void;
  selectedPatientId?: string;
  placeholder?: string;
  label?: string;
  className?: string;
}

export function PatientSearchInput({
  onSelect,
  onClear,
  selectedPatientId,
  placeholder = 'Search by Patient ID (e.g. PID-0001), Name, or Phone...',
  label = 'Patient Details / ID',
  className,
}: PatientSearchInputProps) {
  const { patients } = usePatients();
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const selectedPatient = selectedPatientId
    ? patients.find((p) => p.id === selectedPatientId)
    : null;

  const results = query.trim() ? searchPatients(query, patients).slice(0, 6) : patients.slice(0, 5);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={cn('space-y-2', className)} ref={wrapperRef}>
      {label && (
        <label className="block text-xs font-semibold text-[var(--color-text-muted)]">
          {label}
        </label>
      )}

      {selectedPatient ? (
        <div className="flex items-center justify-between p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
              {selectedPatient.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-[var(--color-text)] truncate">{selectedPatient.name}</span>
                <span className="font-mono text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded font-semibold">
                  {selectedPatient.id}
                </span>
                {selectedPatient.age && (
                  <span className="text-[var(--color-text-muted)]">Age {selectedPatient.age}</span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[var(--color-text-muted)] text-[11px] mt-0.5">
                <span className="flex items-center gap-1">
                  <Phone size={10} /> {selectedPatient.phone}
                </span>
                <span>•</span>
                <span className="text-emerald-400 font-medium">{selectedPatient.priority}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setIsOpen(true);
              }}
              className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold px-2 py-1 rounded hover:bg-blue-500/10 transition-colors"
            >
              Change
            </button>
            {onClear && (
              <button
                type="button"
                onClick={onClear}
                title="Clear Selection"
                className="text-[11px] text-[var(--color-text-muted)] hover:text-rose-400 font-semibold p-1 rounded hover:bg-rose-500/10 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Search input if not selected or changing */}
      {(!selectedPatient || isOpen) && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder={placeholder}
            className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] text-xs rounded-xl pl-10 pr-8 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
            >
              <X size={14} />
            </button>
          )}

          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-[var(--color-bg-elevated)] backdrop-blur-md border border-[var(--color-border)] rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto divide-y divide-[var(--color-border)]">
              {results.length > 0 ? (
                results.map((patient) => (
                  <button
                    key={patient.id}
                    type="button"
                    onClick={() => {
                      onSelect(patient);
                      setIsOpen(false);
                      setQuery('');
                    }}
                    className="w-full p-2.5 text-left hover:bg-[var(--color-surface)] flex items-center justify-between transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                        {patient.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-bold text-[var(--color-text)] group-hover:text-blue-400 transition-colors truncate">
                            {patient.name}
                          </span>
                          <span className="font-mono text-[10px] bg-[var(--color-surface)] text-blue-400 px-1.5 py-0.5 rounded border border-[var(--color-border)]">
                            {patient.id}
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--color-text-muted)] mt-0.5 truncate">
                          {patient.phone} {patient.age ? `• ${patient.age} yrs` : ''}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-medium shrink-0 ml-2">
                      Select
                    </span>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-[var(--color-text-muted)]">
                  {query.trim() ? `No patient found matching "${query}"` : 'No registered patients found in records.'}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

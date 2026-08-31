'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic2, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Volume2, 
  Sparkles, 
  Radio, 
  Save, 
  X,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSuperAdminStore, AdminVoice } from '@/lib/superadmin-store';
import { toast } from 'sonner';

export default function SuperAdminVoiceFleetPage() {
  const { voices, addVoice, updateVoice, deleteVoice, toggleVoiceStatus } = useSuperAdminStore();
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const [newVoice, setNewVoice] = useState<Partial<AdminVoice>>({
    provider: 'sarvam',
    voiceId: '',
    name: '',
    gender: 'female',
    language: 'hi-IN',
    accent: 'Indian Neutral',
    sampleText: 'Namaste! Welcome to our reception desk.',
    isDefault: false,
    isActive: true,
    tags: ['Bilingual', 'Clinics']
  });

  const handleCreateVoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoice.name || !newVoice.voiceId) {
      toast.error('Please enter Voice Name and Provider Voice ID');
      return;
    }
    const voiceToAdd: AdminVoice = {
      id: `v-${Date.now()}`,
      provider: newVoice.provider || 'sarvam',
      voiceId: newVoice.voiceId || '',
      name: newVoice.name || '',
      gender: newVoice.gender || 'female',
      language: newVoice.language || 'hi-IN',
      accent: newVoice.accent || 'Indian Neutral',
      sampleText: newVoice.sampleText || 'Namaste!',
      isDefault: Boolean(newVoice.isDefault),
      isActive: true,
      tags: newVoice.tags || ['Custom Voice']
    };
    addVoice(voiceToAdd);
    toast.success(`Added ${voiceToAdd.name} to global voice fleet!`);
    setShowAddModal(false);
  };

  const togglePlaySimulation = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      setTimeout(() => setPlayingId(null), 4000);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <Mic2 className="w-6 h-6 text-rose-500" />
            <span>Voice AI Fleet & Persona Management</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Centrally curate ElevenLabs, Sarvam AI, and Cartesia voices. Active personas automatically sync to client Voice AI settings.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all flex items-center gap-2"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Global Voice Persona</span>
        </button>
      </div>

      {/* Grid of Global Voices */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {voices.map((voice: any) => {
          const isPlaying = playingId === voice.id;
          return (
            <motion.div
              key={voice.id}
              whileHover={{ y: -2 }}
              className={cn(
                'p-5 rounded-2xl border transition-all flex flex-col justify-between relative overflow-hidden',
                voice.isActive 
                  ? 'bg-[#0D111D] border-slate-800/80 shadow-lg' 
                  : 'bg-slate-950/40 border-slate-900 opacity-60'
              )}
            >
              {voice.isDefault && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono text-[9px] border border-emerald-500/30 uppercase font-semibold">
                  Platform Default
                </div>
              )}

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{voice.name}</h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                      <span className="uppercase font-semibold text-rose-400">{voice.provider}</span>
                      <span>•</span>
                      <span>{voice.language}</span>
                      <span>•</span>
                      <span>{voice.gender}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/60 text-xs text-slate-300 italic mb-4">
                  "{voice.sampleText}"
                </div>

                <div className="flex flex-wrap gap-1.5 mb-4">
                  {voice.tags.map((tag: string, idx: number) => (
                    <span key={idx} className="text-[10px] bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
                <button
                  onClick={() => togglePlaySimulation(voice.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all',
                    isPlaying 
                      ? 'bg-emerald-600 text-white animate-pulse' 
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                  )}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPlaying ? 'Playing Audio...' : 'Preview Voice'}</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleVoiceStatus(voice.id)}
                    className={cn(
                      'text-[10px] font-semibold px-2.5 py-1 rounded-md border transition-all',
                      voice.isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                        : 'bg-slate-800 text-slate-500 border-slate-700'
                    )}
                  >
                    {voice.isActive ? 'Active' : 'Disabled'}
                  </button>
                  <button 
                    onClick={() => deleteVoice(voice.id)}
                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Add Voice Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0D111D] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Plus className="w-4 h-4 text-rose-500" />
                  <span>Register Global Voice Persona</span>
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateVoice} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Provider</label>
                    <select
                      value={newVoice.provider}
                      onChange={(e) => setNewVoice({ ...newVoice, provider: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="sarvam">Sarvam AI (Indic Speech)</option>
                      <option value="elevenlabs">ElevenLabs Multi-Lingual</option>
                      <option value="cartesia">Cartesia Sonic (Fast)</option>
                      <option value="openai">OpenAI TTS</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-400 mb-1 block">Gender</label>
                    <select
                      value={newVoice.gender}
                      onChange={(e) => setNewVoice({ ...newVoice, gender: e.target.value as any })}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="neutral">Neutral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Display Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Maya (Telugu & English)"
                    value={newVoice.name}
                    onChange={(e) => setNewVoice({ ...newVoice, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Provider Voice ID</label>
                  <input
                    type="text"
                    placeholder="e.g. 21m00Tcm4TlvDq8ikWAM or sarvam-maya-te-in"
                    value={newVoice.voiceId}
                    onChange={(e) => setNewVoice({ ...newVoice, voiceId: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-400 mb-1 block">Sample Greeting Text</label>
                  <textarea
                    rows={2}
                    value={newVoice.sampleText}
                    onChange={(e) => setNewVoice({ ...newVoice, sampleText: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button 
                    type="button" 
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold"
                  >
                    Save Voice Persona
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

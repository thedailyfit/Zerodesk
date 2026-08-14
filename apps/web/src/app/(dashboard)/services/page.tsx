'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Plus, 
  Search, 
  Clock, 
  IndianRupee, 
  Tag, 
  UserCheck, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  RotateCcw, 
  Layers, 
  Receipt,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import { useNiche } from '@/components/providers/niche-provider';
import { useServices, type ServiceOffering } from '@/lib/services-store';
import { cn, formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const { 
    services, 
    activeServices, 
    addService, 
    updateService, 
    deleteService, 
    toggleServiceStatus, 
    resetToDefaults 
  } = useServices();

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceOffering | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [duration, setDuration] = useState('45');
  const [price, setPrice] = useState('3500');
  const [staffRole, setStaffRole] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach(s => {
      if (s.category) set.add(s.category);
    });
    return Array.from(set);
  }, [services]);

  // Filtered services
  const filteredServices = useMemo(() => {
    return services.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase()) ||
        (s.description && s.description.toLowerCase().includes(search.toLowerCase())) ||
        (s.staffRole && s.staffRole.toLowerCase().includes(search.toLowerCase()));

      const matchesCat = selectedCategory === 'ALL' || s.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [services, search, selectedCategory]);

  // KPIs
  const totalServices = services.length;
  const activeCount = activeServices.length;
  const avgPrice = totalServices > 0 
    ? Math.round(services.reduce((acc, s) => acc + s.price, 0) / totalServices) 
    : 0;
  const avgDuration = totalServices > 0 
    ? Math.round(services.reduce((acc, s) => acc + s.duration, 0) / totalServices) 
    : 0;

  const handleOpenAddModal = () => {
    setEditingService(null);
    setName('');
    setCategory(categories[0] || 'General');
    setDuration('45');
    setPrice('3000');
    setStaffRole(nicheConfig.terminology?.staff || 'Specialist');
    setDescription('');
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceOffering) => {
    setEditingService(service);
    setName(service.name);
    setCategory(service.category);
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setStaffRole(service.staffRole || '');
    setDescription(service.description || '');
    setIsActive(service.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        category: category.trim() || 'General',
        duration: parseInt(duration) || 30,
        price: parseFloat(price) || 0,
        staffRole: staffRole.trim() || undefined,
        description: description.trim(),
        isActive,
      });
      setSuccessToast(`"${name}" updated successfully!`);
    } else {
      addService({
        name: name.trim(),
        category: category.trim() || 'General',
        duration: parseInt(duration) || 30,
        price: parseFloat(price) || 0,
        staffRole: staffRole.trim() || undefined,
        description: description.trim(),
        isActive,
      });
      setSuccessToast(`New service "${name}" added to catalog & Quick Bill!`);
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  const handleDelete = (id: string, serviceName: string) => {
    if (confirm(`Are you sure you want to delete "${serviceName}"?`)) {
      deleteService(id);
      setSuccessToast(`Deleted "${serviceName}" from catalog.`);
      setTimeout(() => setSuccessToast(null), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-500/90 text-white font-medium text-sm shadow-xl backdrop-blur-md border border-emerald-400/30"
          >
            <CheckCircle2 size={18} className="text-white" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
              {nicheConfig.label} Catalog
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-text)] flex items-center gap-2.5">
            <Sparkles className="text-purple-400" size={24} />
            <span>{nicheConfig.terminology?.services || 'Services'} & Pricing Management</span>
          </h1>
          <p className="text-[var(--color-text-muted)] text-sm mt-1">
            Configure {nicheConfig.terminology?.service?.toLowerCase() || 'service'} packages, pricing, durations & staff assignments. Synced live with Quick Bill and Appointments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={resetToDefaults}
            title="Reset catalog to niche defaults"
            className="p-2.5 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-semibold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add New {nicheConfig.terminology?.service || 'Service'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Active Offerings</p>
            <ShieldCheck size={16} className="text-emerald-400" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-400 mt-1 font-mono">{activeCount} / {totalServices}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Live on billing & reception</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Average Ticket Price</p>
            <IndianRupee size={16} className="text-purple-400" />
          </div>
          <p className="text-2xl font-extrabold text-purple-300 mt-1 font-mono">{formatCurrency(avgPrice)}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Across all active items</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Avg Session Time</p>
            <Clock size={16} className="text-blue-400" />
          </div>
          <p className="text-2xl font-extrabold text-blue-400 mt-1 font-mono">{avgDuration} mins</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Slot scheduling duration</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="p-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] rounded-2xl shadow-sm"
        >
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Categories</p>
            <Layers size={16} className="text-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-amber-300 mt-1 font-mono">{categories.length}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">Service taxonomy tiers</p>
        </motion.div>
      </div>

      {/* Search & Category Filter Pills */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--color-glass)] backdrop-blur border border-[var(--color-glass-border)] p-4 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder={`Search ${nicheConfig.terminology?.services?.toLowerCase() || 'services'} by title, category, or specialist...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-[var(--color-text)]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
              selectedCategory === 'ALL'
                ? "bg-purple-600 text-white shadow-sm"
                : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
            )}
          >
            All ({services.length})
          </button>
          {categories.map((cat) => {
            const count = services.filter(s => s.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer",
                  selectedCategory === cat
                    ? "bg-purple-600 text-white shadow-sm"
                    : "bg-[var(--color-surface)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className={cn(
              "p-5 rounded-2xl border transition-all relative flex flex-col justify-between group shadow-sm bg-[var(--color-glass)] backdrop-blur",
              service.isActive 
                ? "border-[var(--color-glass-border)] hover:border-purple-500/50" 
                : "border-slate-800 opacity-60 bg-slate-900/40"
            )}
          >
            <div>
              {/* Card Header: Category & Active status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {service.category}
                </span>

                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  title={service.isActive ? "Click to Deactivate" : "Click to Activate"}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1",
                    service.isActive 
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                      : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", service.isActive ? "bg-emerald-400 animate-pulse" : "bg-zinc-500")}></span>
                  <span>{service.isActive ? "Active" : "Inactive"}</span>
                </button>
              </div>

              {/* Service Title & Pricing */}
              <h3 className="font-bold text-base text-[var(--color-text)] group-hover:text-purple-300 transition-colors">
                {service.name}
              </h3>

              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-xl font-extrabold text-white font-mono">
                  {formatCurrency(service.price)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                  <Clock size={12} className="text-blue-400" />
                  {service.duration} mins
                </span>
              </div>

              {/* Description */}
              {service.description && (
                <p className="text-xs text-[var(--color-text-muted)] mt-2.5 line-clamp-2 leading-relaxed">
                  {service.description}
                </p>
              )}

              {/* Assigned Staff */}
              {service.staffRole && (
                <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-[var(--color-border)] text-[11px] text-zinc-400">
                  <UserCheck size={13} className="text-purple-400" />
                  <span className="truncate">{service.staffRole}</span>
                </div>
              )}
            </div>

            {/* Card Actions */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(service)}
                  title="Edit Service"
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-purple-300 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  title="Delete Service"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-400 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <Link
                href="/billing"
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-400 hover:text-purple-300 transition-colors bg-purple-500/10 hover:bg-purple-500/20 px-2.5 py-1 rounded-lg border border-purple-500/20 cursor-pointer"
              >
                <Receipt size={12} />
                <span>Quick Bill</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full text-center py-16 bg-[var(--color-glass)] border border-[var(--color-glass-border)] rounded-2xl">
            <Sparkles size={36} className="mx-auto text-purple-400 mb-3 opacity-60" />
            <h3 className="text-base font-bold text-white">No services found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your search query or category filter</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add Service Offering
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[var(--color-text)]">
                      {editingService ? `Edit ${nicheConfig.terminology?.service || 'Service'}` : `Create New ${nicheConfig.terminology?.service || 'Service'}`}
                    </h2>
                    <p className="text-xs text-[var(--color-text-muted)]">
                      Saved offerings sync immediately with POS billing and booking forms.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-800 text-[var(--color-text-muted)] hover:text-white transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">
                    {nicheConfig.terminology?.service || 'Service'} Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Laser Hair Removal / RCT / Abhyanga Massage"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Category</label>
                    <input
                      type="text"
                      placeholder="e.g. Laser, Aesthetics, Endodontics"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Assigned Specialist Role</label>
                    <input
                      type="text"
                      placeholder="e.g. Consultant Dermatologist"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Price (₹ INR) *</label>
                    <div className="relative">
                      <IndianRupee size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="3500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Duration (Minutes) *</label>
                    <div className="relative">
                      <Clock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                      <input
                        type="number"
                        required
                        min="5"
                        placeholder="45"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-9 pr-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1.5">Clinical Protocol / Description</label>
                  <textarea
                    rows={3}
                    placeholder="Brief description of the procedure, equipment used, or guidelines for front desk staff."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Active in billing & appointment catalog</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-zinc-300 text-xs font-semibold rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      {editingService ? 'Save Changes' : 'Create Service'}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

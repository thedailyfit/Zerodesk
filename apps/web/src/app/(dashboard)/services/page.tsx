'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Search, 
  Clock, 
  IndianRupee, 
  Edit3, 
  Trash2, 
  X, 
  RotateCcw, 
  Receipt,
  ArrowRight,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { useNiche } from '@/components/providers/niche-provider';
import { useServices, type ServiceOffering, SERVICE_CATEGORIES_BY_NICHE } from '@/lib/services-store';
import { cn, formatCurrency } from '@/lib/utils';

export default function ServicesPage() {
  const { currentNiche, nicheConfig } = useNiche();
  const { 
    services, 
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

  const [customCategory, setCustomCategory] = useState('');
  const [gstEnabled, setGstEnabled] = useState(true);
  const [gstRate, setGstRate] = useState('18');

  const [isPackage, setIsPackage] = useState(false);
  const [totalSessions, setTotalSessions] = useState('6');
  const [sessionDuration, setSessionDuration] = useState('45');
  const [packageValidityDays, setPackageValidityDays] = useState('180');
  const [packageDiscount, setPackageDiscount] = useState('10');

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

  const handleOpenAddModal = () => {
    setEditingService(null);
    setName('');
    const nicheCategories = SERVICE_CATEGORIES_BY_NICHE[currentNiche] || [];
    setCategory(nicheCategories.length > 0 ? nicheCategories[0] : 'General');
    setCustomCategory('');
    setDuration('45');
    setPrice('3000');
    setStaffRole(nicheConfig.terminology?.staff || 'Specialist');
    setDescription('');
    setIsActive(true);
    setGstEnabled(true);
    setGstRate('18');
    setIsPackage(false);
    setTotalSessions('6');
    setSessionDuration('45');
    setPackageValidityDays('180');
    setPackageDiscount('10');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceOffering) => {
    setEditingService(service);
    setName(service.name);
    
    const nicheCategories = SERVICE_CATEGORIES_BY_NICHE[currentNiche] || [];
    if (nicheCategories.includes(service.category)) {
      setCategory(service.category);
      setCustomCategory('');
    } else {
      setCategory('Other');
      setCustomCategory(service.category);
    }
    
    setDuration(service.duration.toString());
    setPrice(service.price.toString());
    setStaffRole(service.staffRole || '');
    setDescription(service.description || '');
    setIsActive(service.isActive);
    setGstEnabled(service.gstEnabled ?? true);
    setGstRate(String(service.gstRate ?? 18));
    setIsPackage(service.isPackage ?? false);
    setTotalSessions(String(service.totalSessions ?? 6));
    setSessionDuration(String(service.sessionDuration ?? 45));
    setPackageValidityDays(String(service.packageValidityDays ?? 180));
    setPackageDiscount(String(service.packageDiscount ?? 10));
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const finalCategory = category === 'Other' ? customCategory.trim() : category;

    if (editingService) {
      updateService(editingService.id, {
        name: name.trim(),
        category: finalCategory || 'General',
        duration: parseInt(duration) || 30,
        price: parseFloat(price) || 0,
        staffRole: staffRole.trim() || undefined,
        description: description.trim(),
        isActive,
        gstEnabled,
        gstRate: parseInt(gstRate) || 18,
        isPackage,
        totalSessions: isPackage ? parseInt(totalSessions) : undefined,
        sessionDuration: isPackage ? parseInt(sessionDuration) : undefined,
        packageValidityDays: isPackage ? parseInt(packageValidityDays) : undefined,
        packageDiscount: isPackage ? parseFloat(packageDiscount) : undefined,
      });
      setSuccessToast(`"${name}" updated successfully!`);
    } else {
      addService({
        name: name.trim(),
        category: finalCategory || 'General',
        duration: parseInt(duration) || 30,
        price: parseFloat(price) || 0,
        staffRole: staffRole.trim() || undefined,
        description: description.trim(),
        isActive,
        gstEnabled,
        gstRate: parseInt(gstRate) || 18,
        isPackage,
        totalSessions: isPackage ? parseInt(totalSessions) : undefined,
        sessionDuration: isPackage ? parseInt(sessionDuration) : undefined,
        packageValidityDays: isPackage ? parseInt(packageValidityDays) : undefined,
        packageDiscount: isPackage ? parseFloat(packageDiscount) : undefined,
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
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      {/* Toast Notification */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium text-sm shadow-xl backdrop-blur-md border border-emerald-400/30"
          >
            <CheckCircle2 size={18} className="text-white" />
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean, Simple Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-text)]">
            {nicheConfig.terminology?.services || 'Services'}
          </h1>
          <p className="text-xs text-[var(--color-text-muted)] mt-0.5">
            Manage your service offerings, prices, and durations.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={resetToDefaults}
            title="Reset catalog to niche defaults"
            className="p-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-medium transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] p-3 rounded-2xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
          <input
            type="text"
            placeholder="Search services by name, category, or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 text-[var(--color-text)] placeholder:text-[var(--color-text-muted)]"
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
                : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
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
                    : "bg-[var(--color-bg)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] border border-[var(--color-border)]"
                )}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Services List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service, i) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className={cn(
              "p-5 rounded-2xl border transition-all relative flex flex-col justify-between group shadow-sm bg-[var(--color-surface)]",
              service.isActive 
                ? "border-[var(--color-border)] hover:border-purple-500/40" 
                : "border-[var(--color-border)] opacity-60 bg-[var(--color-bg)]"
            )}
          >
            <div>
              {/* Header: Title & Active Status */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-[11px] font-semibold text-purple-500 uppercase tracking-wider">
                    {service.category}
                  </span>
                  <h3 className="font-bold text-base text-[var(--color-text)] mt-0.5">
                    {service.name}
                  </h3>
                </div>

                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  title={service.isActive ? "Click to Deactivate" : "Click to Activate"}
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide transition-all cursor-pointer flex items-center gap-1 shrink-0",
                    service.isActive 
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30" 
                      : "bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700"
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full", service.isActive ? "bg-emerald-500" : "bg-zinc-400")}></span>
                  <span>{service.isActive ? "Active" : "Inactive"}</span>
                </button>
              </div>

              {/* Pricing & Duration */}
              <div className="flex items-baseline gap-2.5 my-2">
                <span className="text-xl font-extrabold text-[var(--color-text)] font-mono">
                  {formatCurrency(service.price)}
                </span>
                <span className="text-xs text-[var(--color-text-muted)] flex items-center gap-1 font-mono">
                  <Clock size={12} className="text-blue-500" />
                  {service.duration} mins
                </span>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-1.5 mb-2">
                {service.gstEnabled && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                    GST {service.gstRate ?? 18}%
                  </span>
                )}
                {service.isPackage && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                    📦 Package · {service.totalSessions} Sessions
                  </span>
                )}
                {service.isPackage && service.packageValidityDays && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                    Valid: {service.packageValidityDays} days
                  </span>
                )}
              </div>

              {/* Description */}
              {service.description && (
                <p className="text-xs text-[var(--color-text-muted)] line-clamp-2 leading-relaxed mt-1">
                  {service.description}
                </p>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-[var(--color-border)]">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenEditModal(service)}
                  title="Edit Service"
                  className="p-1.5 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-purple-600 transition-colors cursor-pointer"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(service.id, service.name)}
                  title="Delete Service"
                  className="p-1.5 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <Link
                href="/billing"
                className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:opacity-80 transition-opacity bg-purple-500/10 px-2.5 py-1 rounded-lg border border-purple-500/20 cursor-pointer"
              >
                <Receipt size={12} />
                <span>Quick Bill</span>
                <ArrowRight size={11} />
              </Link>
            </div>
          </motion.div>
        ))}

        {filteredServices.length === 0 && (
          <div className="col-span-full text-center py-16 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl">
            <Sparkles size={32} className="mx-auto text-purple-500 mb-2 opacity-60" />
            <h3 className="text-sm font-bold text-[var(--color-text)]">No services found</h3>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">Try adjusting your search query or add a new service.</p>
            <button
              onClick={handleOpenAddModal}
              className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              Add Service
            </button>
          </div>
        )}
      </div>

      {/* Add / Edit Service Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto scrollbar-none"
            >
              <div className="flex items-center justify-between border-b border-[var(--color-border)] pb-3">
                <h2 className="text-base font-bold text-[var(--color-text)]">
                  {editingService ? 'Edit Service' : 'Add New Service'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-[var(--color-surface-hover)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">
                    Service Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Face Laser / RCT / Villa Tour"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Category</label>
                    <div className="space-y-2">
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {(SERVICE_CATEGORIES_BY_NICHE[currentNiche] || []).map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                        <option value="Other">Other...</option>
                      </select>
                      {category === 'Other' && (
                        <input
                          type="text"
                          placeholder="Enter custom category"
                          value={customCategory}
                          onChange={(e) => setCustomCategory(e.target.value)}
                          className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Staff / Specialist</label>
                    <input
                      type="text"
                      placeholder="e.g. Specialist In-Charge"
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value)}
                      className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Price (₹ INR) *</label>
                    <div className="relative">
                      <IndianRupee size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="number"
                        required
                        min="0"
                        placeholder="3500"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Duration (Minutes) *</label>
                    <div className="relative">
                      <Clock size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" />
                      <input
                        type="number"
                        required
                        min="5"
                        placeholder="45"
                        value={duration}
                        onChange={(e) => setDuration(e.target.value)}
                        className="w-full pl-8 pr-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl">
                  <div className="flex flex-col gap-2 justify-center">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
                      <input
                        type="checkbox"
                        checked={gstEnabled}
                        onChange={(e) => setGstEnabled(e.target.checked)}
                        className="rounded text-purple-600 focus:ring-purple-500"
                      />
                      <span>Apply GST</span>
                    </label>
                  </div>
                  {gstEnabled && (
                    <div>
                      <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">GST Rate (%)</label>
                      <select
                        value={gstRate}
                        onChange={(e) => setGstRate(e.target.value)}
                        className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="0">0%</option>
                        <option value="5">5%</option>
                        <option value="12">12%</option>
                        <option value="18">18%</option>
                        <option value="28">28%</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="p-3 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={isPackage}
                      onChange={(e) => setIsPackage(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Is Treatment Package</span>
                  </label>

                  {isPackage && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Total Sessions</label>
                        <input
                          type="number"
                          min="1"
                          value={totalSessions}
                          onChange={(e) => setTotalSessions(e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Session Duration (min)</label>
                        <input
                          type="number"
                          min="1"
                          value={sessionDuration}
                          onChange={(e) => setSessionDuration(e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Validity (days)</label>
                        <input
                          type="number"
                          min="1"
                          value={packageValidityDays}
                          onChange={(e) => setPackageValidityDays(e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-[var(--color-text-muted)] mb-1">Discount (%)</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={packageDiscount}
                          onChange={(e) => setPackageDiscount(e.target.value)}
                          className="w-full px-3.5 py-1.5 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[var(--color-text)] mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of the service..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl text-xs text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-[var(--color-text)]">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span>Active in catalog</span>
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="px-3.5 py-1.5 bg-[var(--color-surface-hover)] border border-[var(--color-border)] text-[var(--color-text-muted)] hover:text-[var(--color-text)] text-xs font-medium rounded-xl transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md cursor-pointer"
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

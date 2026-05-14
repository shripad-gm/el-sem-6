import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserPlus } from 'lucide-react';
import { useStaffStore } from '../../store/useStaffStore';

export function AddWorkerModal({ isOpen, onClose }) {
  const createWorker = useStaffStore((s) => s.createWorker);
  const meta = useStaffStore((s) => s.meta);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: meta.roles[0] || '',
    department: meta.departments[0] || '',
    shiftId: meta.shifts[0]?.id || '',
    workflowId: meta.workflows[0]?.id || '',
    baseSalary: 15000,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'baseSalary' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await createWorker({
      ...formData,
      employeeId: `EMP-${Date.now().toString().slice(-4)}${Math.floor(Math.random() * 10)}`,
      status: 'active',
      attendance: 'present',
    });
    setIsSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="w-full max-w-lg bg-industrial-bg border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-brand-primary" />
              <h2 className="text-lg font-bold text-white">Add New Staff</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Employee Name</label>
                <input
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Phone Number</label>
                <input
                  required
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                  placeholder="e.g. +91 9876543210"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Role</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                >
                  {meta.roles.map((r) => (
                    <option key={r} value={r} className="bg-industrial-bg">{r}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Department</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                >
                  {meta.departments.map((d) => (
                    <option key={d} value={d} className="bg-industrial-bg">{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Shift</label>
                <select
                  name="shiftId"
                  value={formData.shiftId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                >
                  {meta.shifts.map((s) => (
                    <option key={s.id} value={s.id} className="bg-industrial-bg">{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Workflow</label>
                <select
                  name="workflowId"
                  value={formData.workflowId}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
                >
                  {meta.workflows.map((w) => (
                    <option key={w.id} value={w.id} className="bg-industrial-bg">{w.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-white/60 uppercase tracking-wider">Base Salary (INR)</label>
              <input
                required
                type="number"
                name="baseSalary"
                value={formData.baseSalary}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-brand-primary/50"
              />
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-bold text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-sm font-bold text-black bg-brand-primary rounded-lg hover:bg-brand-primary/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Adding...' : 'Add Worker'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

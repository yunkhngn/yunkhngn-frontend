'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase/config';
import { ref, update, get } from 'firebase/database';
import { X, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function EditStatusModal({ isOpen, onClose }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState('none');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !database) return;

    // Fetch current status
    const statusRef = ref(database, 'status/admin');
    get(statusRef)
      .then((snapshot) => {
        if (snapshot.exists()) {
          const val = snapshot.val();
          setText(val.text || '');
          setBusy(Boolean(val.busy));
        }
      })
      .catch((err) => {
        console.error('Error fetching status:', err);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!database) {
      toast.error('Database connection not available');
      return;
    }

    setSaving(true);
    try {
      let expiresAt = null;
      const now = Date.now();

      if (duration === '30m') expiresAt = now + 30 * 60 * 1000;
      else if (duration === '1h') expiresAt = now + 60 * 60 * 1000;
      else if (duration === '4h') expiresAt = now + 4 * 60 * 60 * 1000;
      else if (duration === 'today') {
        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);
        expiresAt = endOfDay.getTime();
      }

      const statusRef = ref(database, 'status/admin');
      await update(statusRef, {
        text: text.trim(),
        busy,
        expires_at: expiresAt,
        lastChange: now,
      });

      toast.success('Status updated successfully');
      onClose();
    } catch (err) {
      console.error('Failed to update status:', err);
      toast.error('Failed to update status. Check Firebase RTDB rules.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden border border-white/10 rounded-2xl bg-[#0d0d0d] shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <h3 className="text-sm font-semibold font-mono text-white tracking-wider uppercase">
              Update Custom Status
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors duration-200"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Status Text Input */}
          <div className="space-y-2">
            <label className="block text-xs font-mono text-zinc-400">
              What's your current vibe/status?
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="e.g. Coding some magic, In a meeting, Sleeping"
              maxLength={60}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
          </div>

          {/* Busy toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-neutral-900/50">
            <div className="space-y-0.5">
              <label className="block text-xs font-mono text-zinc-300 font-medium">
                Do Not Disturb
              </label>
              <span className="text-[10px] text-zinc-500 block">
                Turn indicator dot red & show as busy.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setBusy(!busy)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                busy ? 'bg-rose-600' : 'bg-zinc-800'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                  busy ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Duration Selector */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Clock size={12} /> Clear status after
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'none', label: "Don't clear" },
                { value: '30m', label: '30 Minutes' },
                { value: '1h', label: '1 Hour' },
                { value: '4h', label: '4 Hours' },
                { value: 'today', label: 'End of today' },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDuration(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all text-center ${
                    duration === opt.value
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/5 bg-neutral-900/30 text-zinc-400 hover:border-white/10 hover:text-white'
                  } ${opt.value === 'today' ? 'col-span-2' : ''}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-white/5 bg-neutral-900/30 text-zinc-400 hover:bg-neutral-900 hover:text-white text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
            >
              {saving ? 'Saving...' : 'Save Status'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

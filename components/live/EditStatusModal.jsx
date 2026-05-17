'use client';

import { useState, useEffect } from 'react';
import { database } from '@/lib/firebase/config';
import { ref, update, serverTimestamp } from 'firebase/database';
import { Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';

const MAX_LENGTH = 80;

const SUGGESTIONS = [
  { label: 'On vacation', emoji: '🌴' },
  { label: 'Out sick', emoji: '🤒' },
  { label: 'Working from home', emoji: '🏠' },
  { label: 'Focusing', emoji: '🎯' },
];

const DURATIONS = [
  { value: 'none', label: "Don't clear" },
  { value: '30m', label: '30 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: 'today', label: 'End of today' },
  { value: 'week', label: 'This week' },
];

function computeExpiresAt(option) {
  const now = Date.now();
  switch (option) {
    case '30m':
      return now + 30 * 60 * 1000;
    case '1h':
      return now + 60 * 60 * 1000;
    case '4h':
      return now + 4 * 60 * 60 * 1000;
    case 'today': {
      const d = new Date();
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    case 'week': {
      const d = new Date();
      const dow = d.getDay();
      const daysUntilSunday = (7 - dow) % 7 || 7;
      d.setDate(d.getDate() + daysUntilSunday);
      d.setHours(23, 59, 59, 999);
      return d.getTime();
    }
    default:
      return null;
  }
}

export default function EditStatusModal({ isOpen, onClose, current }) {
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState('none');
  const [saving, setSaving] = useState(false);

  // Seed from current status snapshot whenever the modal opens.
  useEffect(() => {
    if (!isOpen) return;
    setText(current?.text ?? '');
    setBusy(Boolean(current?.busy));
    setDuration('none');
  }, [isOpen, current?.text, current?.busy]);

  const charsRemaining = MAX_LENGTH - text.length;
  const canSubmit = text.trim().length > 0 && !saving;

  const writeStatus = async (payload) => {
    if (!database) {
      toast.error('Database connection not available');
      return;
    }
    setSaving(true);
    try {
      await update(ref(database, 'status/admin'), {
        ...payload,
        lastChange: serverTimestamp(),
      });
      onClose();
    } catch (err) {
      console.error('Status write failed', err);
      toast.error('Failed to update status. Check Firebase RTDB rules.');
    } finally {
      setSaving(false);
    }
  };

  const handleSave = (e) => {
    e?.preventDefault?.();
    if (!canSubmit) return;
    writeStatus({
      text: text.trim(),
      busy,
      expires_at: computeExpiresAt(duration),
    });
  };

  const handleClear = () => {
    writeStatus({ text: '', busy: false, expires_at: null });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md border-white/10 bg-[#0d0d0d] text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-sm font-mono uppercase tracking-wider">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Edit status
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-5">
          {/* Text input */}
          <div className="space-y-2">
            <label
              htmlFor="status-text"
              className="block text-xs font-mono text-zinc-400"
            >
              What&apos;s happening
            </label>
            <input
              id="status-text"
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
              placeholder="e.g. Senior Vibe Coder"
              maxLength={MAX_LENGTH}
              className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-neutral-900 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
            <p className="text-[10px] font-mono text-zinc-500">
              {charsRemaining} characters remaining
            </p>
          </div>

          {/* Suggestion chips */}
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.label}
                type="button"
                onClick={() => setText(s.label)}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-neutral-900/60 px-3 py-1 text-[11px] font-mono text-zinc-300 hover:border-blue-500/50 hover:bg-neutral-900 hover:text-white transition-colors"
              >
                <span>{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>

          {/* Busy toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-neutral-900/50">
            <div className="space-y-0.5">
              <label
                htmlFor="status-busy"
                className="block text-xs font-mono text-zinc-300 font-medium"
              >
                Busy
              </label>
              <span className="text-[10px] text-zinc-500 block">
                Show as a red dot instead of green.
              </span>
            </div>
            <button
              id="status-busy"
              type="button"
              role="switch"
              aria-checked={busy}
              onClick={() => setBusy(!busy)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
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

          {/* Duration */}
          <div className="space-y-2">
            <label className="flex items-center gap-1.5 text-xs font-mono text-zinc-400">
              <Clock size={12} /> Clear status after
            </label>
            <div className="grid grid-cols-2 gap-2">
              {DURATIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={duration === opt.value}
                  onClick={() => setDuration(opt.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-mono border transition-all text-center ${
                    duration === opt.value
                      ? 'border-blue-500 bg-blue-500/10 text-white'
                      : 'border-white/5 bg-neutral-900/30 text-zinc-400 hover:border-white/10 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-2">
            <button
              type="button"
              onClick={handleClear}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl border border-white/5 bg-neutral-900/30 text-zinc-400 hover:bg-neutral-900 hover:text-white text-xs font-mono transition-colors disabled:opacity-50"
            >
              Clear status
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-medium disabled:opacity-50 transition-colors shadow-lg shadow-blue-600/20"
            >
              {saving ? 'Saving...' : 'Set status'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

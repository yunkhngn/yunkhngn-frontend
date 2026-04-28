import { useState } from 'react';
import { readNestJson } from '@/lib/api/readJson';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PasswordGate({ code, onVerified }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/letters/verify/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        onVerified(await readNestJson(res));
      } else {
        setError('Mật khẩu không đúng');
      }
    } catch {
      setError('Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#2a2119] via-[#140e0b] to-[#0a0705] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="w-full max-w-sm"
      >
        <form
          onSubmit={handleSubmit}
          className="space-y-8 text-center"
        >
          <div className="relative group">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute inset-x-0 -inset-y-4 border border-amber-900/10 rounded-full scale-150 blur-sm pointer-events-none"
            />
            <div className="relative w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-amber-900/20 to-black/40 border border-amber-800/20 flex items-center justify-center shadow-2xl backdrop-blur-sm">
              <Lock className="w-8 h-8 text-amber-600/60" />
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-serif text-amber-100/80 tracking-wide">
              Bức thư được bảo vệ
            </h2>
            <p className="text-xs text-amber-100/30 uppercase tracking-[0.2em]">
              Nhập mật khẩu để đọc nội dung
            </p>
          </div>

          <div className="relative group/input">
            <input
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-black/40 border border-amber-900/20 rounded-xl px-6 py-4 pr-24 text-amber-100/90 placeholder:text-amber-100/10 focus:outline-none focus:border-amber-700/40 transition-all backdrop-blur-md font-mono text-lg text-center tracking-widest"
              autoFocus
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShow(!show)}
                className="p-2 text-amber-100/20 hover:text-amber-100/50 transition-colors"
                title={show ? "Ẩn" : "Hiện"}
              >
                {show ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                type="submit"
                disabled={loading || !password.trim()}
                className="w-10 h-10 rounded-lg bg-amber-700/10 border border-amber-700/20 flex items-center justify-center text-amber-600 hover:bg-amber-700/20 hover:text-amber-500 disabled:opacity-20 transition-all"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="text-red-400/60 text-xs font-serif italic tracking-wide"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </form>
      </motion.div>
    </div>
  );
}

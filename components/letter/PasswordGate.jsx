import { useState } from 'react';
import { Lock, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';

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
        onVerified(await res.json());
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
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm space-y-6 text-center"
      >
        <div className="w-16 h-16 mx-auto rounded-full bg-amber-900/20 border border-amber-800/30 flex items-center justify-center">
          <Lock className="w-7 h-7 text-amber-600/80" />
        </div>
        <div>
          <h2 className="text-xl font-serif text-amber-100/90 mb-1">
            Bức thư được bảo vệ
          </h2>
          <p className="text-sm text-amber-100/40">Nhập mật khẩu để đọc thư</p>
        </div>
        <div className="relative">
          <input
            type={show ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu..."
            className="w-full bg-[#2a2218] border border-amber-900/30 rounded-lg px-4 py-3 pr-20 text-amber-100/90 placeholder:text-amber-100/20 focus:outline-none focus:border-amber-700/50 font-mono text-sm"
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            <button
              type="button"
              onClick={() => setShow(!show)}
              className="p-1.5 text-amber-100/30 hover:text-amber-100/60"
            >
              {show ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
            <button
              type="submit"
              disabled={loading || !password.trim()}
              className="p-1.5 text-amber-600 hover:text-amber-500 disabled:opacity-30"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
        {error && <p className="text-red-400/80 text-sm">{error}</p>}
      </form>
    </div>
  );
}

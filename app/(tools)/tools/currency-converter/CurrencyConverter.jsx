// yunkhngn-fe/app/(tools)/tools/currency-converter/CurrencyConverter.jsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { ArrowLeftRight, RefreshCw } from 'lucide-react';

const CURRENCIES = ['USD', 'EUR', 'VND', 'JPY', 'GBP', 'SGD', 'AUD', 'KRW', 'CNY', 'THB'];

export default function CurrencyConverter() {
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('VND');
  const [amount, setAmount] = useState('1');
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const fetchRates = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`https://api.frankfurter.app/latest?from=${from}&symbols=${CURRENCIES.filter(c => c !== from).join(',')}`);
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setRates(data.rates);
      setLastUpdated(data.date);
    } catch {
      setError('Không tải được tỷ giá. Kiểm tra kết nối mạng.');
    } finally {
      setLoading(false);
    }
  }, [from]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  function swap() {
    setFrom(to);
    setTo(from);
  }

  const result = rates && amount && to !== from
    ? (parseFloat(amount) * (to === from ? 1 : (rates[to] ?? 0))).toLocaleString(undefined, { maximumFractionDigits: 4 })
    : to === from ? amount : null;

  const Select = ({ value, onChange }) => (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
    >
      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
    </select>
  );

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Số tiền</label>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="1"
          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>
      <div className="flex items-center gap-2">
        <Select value={from} onChange={v => setFrom(v)} />
        <button onClick={swap} className="p-2 rounded-lg bg-muted hover:bg-accent transition-colors">
          <ArrowLeftRight size={14} />
        </button>
        <Select value={to} onChange={v => setTo(v)} />
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      {result !== null && !error && (
        <div className="bg-muted/40 rounded-xl px-4 py-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">{amount} {from} =</p>
          <p className="text-2xl font-mono font-bold">{result} {to}</p>
          {lastUpdated && <p className="text-xs text-muted-foreground mt-2">Tỷ giá ngày {lastUpdated}</p>}
        </div>
      )}
      <button
        onClick={fetchRates}
        disabled={loading}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
      >
        <RefreshCw size={11} className={loading ? 'animate-spin' : ''} />
        Cập nhật tỷ giá
      </button>
    </div>
  );
}

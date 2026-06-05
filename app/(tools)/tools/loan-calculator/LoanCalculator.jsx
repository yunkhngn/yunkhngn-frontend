// yunkhngn-fe/app/(tools)/tools/loan-calculator/LoanCalculator.jsx
'use client';

import { useState } from 'react';

function calcEMI(principal, annualRate, months) {
  if (annualRate === 0) return principal / months;
  const r = annualRate / 12 / 100;
  return principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
}

export default function LoanCalculator() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [months, setMonths] = useState('');

  const p = parseFloat(principal) || 0;
  const r = parseFloat(rate) || 0;
  const n = parseInt(months) || 0;

  const emi = p && n ? calcEMI(p, r, n) : 0;
  const totalPayment = emi * n;
  const totalInterest = totalPayment - p;

  const fmt = v => v.toLocaleString('vi-VN', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const fields = [
    { label: 'Số tiền vay', value: principal, set: setPrincipal, placeholder: 'VD: 100000000' },
    { label: 'Lãi suất/năm (%)', value: rate, set: setRate, placeholder: 'VD: 8.5' },
    { label: 'Kỳ hạn (tháng)', value: months, set: setMonths, placeholder: 'VD: 60' },
  ];

  return (
    <div className="space-y-4">
      {fields.map(({ label, value, set, placeholder }) => (
        <div key={label}>
          <label className="text-xs text-muted-foreground mb-1 block">{label}</label>
          <input
            type="number"
            value={value}
            onChange={e => set(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      ))}
      {emi > 0 && (
        <div className="grid grid-cols-1 gap-3 pt-2">
          {[
            { label: 'EMI hàng tháng', value: fmt(emi), highlight: true },
            { label: 'Tổng phải trả', value: fmt(totalPayment) },
            { label: 'Tổng lãi suất', value: fmt(totalInterest) },
          ].map(({ label, value, highlight }) => (
            <div key={label} className={`rounded-lg px-3 py-2 ${highlight ? 'bg-foreground/5 border border-foreground/10' : 'bg-muted/40'}`}>
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-lg font-semibold font-mono">{value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

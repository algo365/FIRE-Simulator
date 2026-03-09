import React from 'react';
import { formatINR, formatPct } from '../utils/formatting';

function Card({ label, value, sub, color = 'blue', icon }) {
  const colorMap = {
    blue:  { bg: 'bg-blue-50',   border: 'border-blue-100',  text: 'text-blue-700',  icon: 'text-blue-400' },
    green: { bg: 'bg-green-50',  border: 'border-green-100', text: 'text-green-700', icon: 'text-green-400' },
    amber: { bg: 'bg-amber-50',  border: 'border-amber-100', text: 'text-amber-700', icon: 'text-amber-400' },
    red:   { bg: 'bg-red-50',    border: 'border-red-100',   text: 'text-red-700',   icon: 'text-red-400' },
    purple:{ bg: 'bg-purple-50', border: 'border-purple-100',text: 'text-purple-700',icon: 'text-purple-400' },
  };
  const c = colorMap[color] || colorMap.blue;

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4 flex flex-col gap-1`}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">{label}</p>
        <span className={`text-lg ${c.icon}`}>{icon}</span>
      </div>
      <p className={`text-xl font-bold ${c.text} tabular-nums leading-tight`}>{value}</p>
      {sub && <p className="text-xs text-gray-500 leading-tight">{sub}</p>}
    </div>
  );
}

export default function SummaryCards({ results, corpusZeroAge, params }) {
  if (!results || results.length === 0) return null;

  const first = results[0];
  const last  = results[results.length - 1];

  const finalCorpus     = last.corpus;
  const annualWithdrawal = first.netWithdrawal;
  const initialWithdrawalRate = first.withdrawalRate;
  const survives        = corpusZeroAge === null;
  const retirementYears = params.lifeExpectancy - params.currentAge;

  // Real return (inflation-adjusted)
  const realReturn = params.cagr - params.inflationRate;

  // Status
  let statusColor = 'green';
  let statusValue = `✔ Lasts to ${params.lifeExpectancy}`;
  let statusSub   = `Surplus: ${formatINR(finalCorpus)} at age ${params.lifeExpectancy}`;

  if (!survives) {
    const yearsShort = params.lifeExpectancy - corpusZeroAge;
    if (yearsShort <= 5) {
      statusColor = 'amber';
      statusValue = `⚠ Depletes at ${corpusZeroAge}`;
      statusSub   = `${yearsShort} years short of target`;
    } else {
      statusColor = 'red';
      statusValue = `✘ Depletes at ${corpusZeroAge}`;
      statusSub   = `${yearsShort} years short of target`;
    }
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <Card
        label="Retirement Status"
        value={statusValue}
        sub={statusSub}
        color={statusColor}
        icon="🔥"
      />
      <Card
        label="Starting Corpus"
        value={formatINR(params.initialCorpus)}
        sub={`Age ${params.currentAge} → ${params.lifeExpectancy}`}
        color="blue"
        icon="🏦"
      />
      <Card
        label="Annual Withdrawal"
        value={formatINR(annualWithdrawal)}
        sub={`${formatPct(initialWithdrawalRate)} initial withdrawal rate`}
        color={initialWithdrawalRate > 6 ? 'amber' : 'green'}
        icon="💸"
      />
      <Card
        label="Real Return"
        value={`${realReturn.toFixed(1)}%`}
        sub={`CAGR ${params.cagr}% − Inflation ${params.inflationRate}%`}
        color={realReturn >= 4 ? 'purple' : 'amber'}
        icon="📈"
      />
    </div>
  );
}

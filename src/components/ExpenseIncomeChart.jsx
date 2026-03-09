import React, { useMemo } from 'react';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { formatINR, yAxisFormatter, COLORS } from '../utils/formatting';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-bold text-gray-700 mb-2 border-b pb-1">Age {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-semibold tabular-nums">{formatINR(entry.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ExpenseIncomeChart({ results }) {
  const chartData = useMemo(
    () =>
      results.map(r => ({
        age:           r.age,
        expense:       r.annualExpense,
        income:        r.annualIncome,
        netWithdrawal: r.netWithdrawal,
        withdrawalRate: parseFloat(r.withdrawalRate?.toFixed(1) || 0),
      })),
    [results]
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="mb-4">
        <h2 className="text-base font-bold text-gray-800">Expense vs Income Over Time</h2>
        <p className="text-xs text-gray-500 mt-0.5">Annual expenses (inflation-adjusted) compared to additional income sources</p>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="age"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{ value: 'Age', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis
            yAxisId="left"
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            width={70}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 'dataMax + 2']}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="circle" iconSize={8} />

          <Bar yAxisId="left" dataKey="expense" name="Annual Expense" fill="#FCA5A5" opacity={0.8} radius={[2,2,0,0]} />
          <Bar yAxisId="left" dataKey="income"  name="Annual Income"  fill="#86EFAC" opacity={0.8} radius={[2,2,0,0]} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="withdrawalRate"
            name="Withdrawal Rate %"
            stroke={COLORS.purple}
            strokeWidth={2}
            dot={false}
            strokeDasharray="4 2"
          />

          {/* 4% rule reference */}
          <ReferenceLine yAxisId="right" y={4} stroke="#F59E0B" strokeDasharray="3 3"
            label={{ value: '4% Rule', position: 'insideTopRight', fontSize: 11, fill: '#F59E0B' }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      <p className="text-xs text-gray-400 mt-2 text-center">
        Right axis: Annual withdrawal rate % — the 4% rule line is shown for reference
      </p>
    </div>
  );
}

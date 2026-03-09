import React, { useMemo } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer, Dot,
} from 'recharts';
import { formatINR, yAxisFormatter, COLORS } from '../utils/formatting';
import { mergeChartData } from '../utils/simulation';

/* ──────────────────────────────────────────────
   Custom Tooltip
   ────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  const d = payload[0]?.payload || {};

  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-3 text-xs min-w-[190px]">
      <div className="font-bold text-gray-700 mb-2 border-b pb-1.5">
        Age {label} &nbsp;·&nbsp; {d.year}
      </div>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: entry.color }} className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ background: entry.color }} />
            {entry.name}
          </span>
          <span className="font-semibold tabular-nums">{formatINR(entry.value)}</span>
        </div>
      ))}
      {d.yearBigExp > 0 && (
        <div className="mt-1.5 pt-1 border-t border-amber-100 text-amber-700 flex justify-between">
          <span>⚠ One-time expense</span>
          <span className="font-bold">{formatINR(d.yearBigExp)}</span>
        </div>
      )}
      {d.withdrawalRate != null && (
        <div className="mt-1 text-gray-400 flex justify-between">
          <span>Withdrawal Rate</span>
          <span>{d.withdrawalRate.toFixed(1)}%</span>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────
   Main Chart
   ────────────────────────────────────────────── */
export default function CorpusChart({ results, noWdResults, params, corpusZeroAge }) {
  const chartData = useMemo(() => mergeChartData(results, noWdResults), [results, noWdResults]);

  const bigExpenseMarkers = useMemo(
    () => results.filter(r => r.yearBigExp > 0),
    [results]
  );

  const horizonLine = params.lifeExpectancy;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Corpus Projection</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Year-by-year portfolio balance from age {params.currentAge} to {params.lifeExpectancy}
          </p>
        </div>
        {corpusZeroAge ? (
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center min-w-[110px]">
            <p className="text-xs font-semibold text-red-500 uppercase tracking-wide">Money Runs Out</p>
            <p className="text-2xl font-black text-red-600 tabular-nums">Age {corpusZeroAge}</p>
            <p className="text-xs text-red-400">{params.lifeExpectancy - corpusZeroAge} yrs short</p>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center min-w-[110px]">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">Portfolio Lasts</p>
            <p className="text-2xl font-black text-green-600">Age {params.lifeExpectancy}+</p>
            <p className="text-xs text-green-400">Fully funded ✔</p>
          </div>
        )}
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={380}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
          <defs>
            <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor={COLORS.primary} stopOpacity={0.25} />
              <stop offset="90%"  stopColor={COLORS.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />

          <XAxis
            dataKey="age"
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={{ stroke: '#E5E7EB' }}
            label={{ value: 'Age', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#9CA3AF' }}
          />
          <YAxis
            tickFormatter={yAxisFormatter}
            tick={{ fontSize: 12, fill: '#9CA3AF' }}
            tickLine={false}
            axisLine={false}
            width={70}
          />

          <Tooltip content={<CustomTooltip />} />

          <Legend
            wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }}
            iconType="circle"
            iconSize={8}
          />

          {/* Zero line */}
          <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 2" />

          {/* Life expectancy marker */}
          <ReferenceLine
            x={horizonLine}
            stroke="#CBD5E1"
            strokeDasharray="3 3"
            label={{ value: `Target: ${horizonLine}`, position: 'insideTopRight', fontSize: 11, fill: '#94A3B8' }}
          />

          {/* Big expense vertical markers */}
          {bigExpenseMarkers.map(d => (
            <ReferenceLine
              key={d.age}
              x={d.age}
              stroke={COLORS.warning}
              strokeDasharray="3 3"
              strokeWidth={1.5}
              label={{
                value: `₹${(d.yearBigExp / 100000).toFixed(0)}L`,
                position: 'insideTopLeft',
                fontSize: 10,
                fill: COLORS.warning,
              }}
            />
          ))}

          {/* No-withdrawal comparison line */}
          <Line
            type="monotone"
            dataKey="corpusNoWd"
            name="Growth Only (No Withdrawals)"
            stroke={COLORS.growth}
            strokeWidth={1.5}
            strokeDasharray="5 4"
            dot={false}
            legendType="line"
          />

          {/* Main corpus area */}
          <Area
            type="monotone"
            dataKey="corpus"
            name="Portfolio Balance"
            stroke={COLORS.primary}
            strokeWidth={2.5}
            fill="url(#corpusGrad)"
            dot={false}
            activeDot={{ r: 5, fill: COLORS.primary, stroke: '#fff', strokeWidth: 2 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* Legend note for big expenses */}
      {bigExpenseMarkers.length > 0 && (
        <p className="text-xs text-amber-600 mt-2 text-center">
          ⚠ Dashed amber lines mark one-time expense events
        </p>
      )}
    </div>
  );
}

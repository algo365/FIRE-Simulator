import React, { useState, useCallback } from 'react';
import {
  ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { runMonteCarlo } from '../utils/monteCarlo';
import { formatINR, yAxisFormatter, COLORS } from '../utils/formatting';

function SurvivalTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[170px]">
      <p className="font-bold text-gray-700 mb-1.5 border-b pb-1">Age {label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex justify-between gap-3 mb-0.5">
          <span style={{ color: e.color }}>{e.name}</span>
          <span className="font-semibold tabular-nums">
            {e.dataKey === 'probability' ? `${e.value.toFixed(1)}%` : formatINR(e.value)}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function MonteCarloPanel({ params }) {
  const [result, setResult]       = useState(null);
  const [running, setRunning]     = useState(false);
  const [numSims, setNumSims]     = useState(1000);
  const [volatility, setVolatility] = useState(4);
  const [chartMode, setChartMode] = useState('survival'); // 'survival' | 'corpus'

  const run = useCallback(() => {
    setRunning(true);
    // Defer to next tick so UI can update
    setTimeout(() => {
      const res = runMonteCarlo(params, numSims, volatility);
      setResult(res);
      setRunning(false);
    }, 10);
  }, [params, numSims, volatility]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Monte Carlo Simulation</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Runs multiple simulations with randomised annual returns to estimate risk
          </p>
        </div>
        {result && (
          <div
            className={`text-center px-3 py-2 rounded-lg border min-w-[120px] ${
              result.survivalAtTarget >= 80
                ? 'bg-green-50 border-green-200'
                : result.survivalAtTarget >= 50
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Survival to {params.lifeExpectancy}
            </p>
            <p
              className={`text-2xl font-black tabular-nums ${
                result.survivalAtTarget >= 80
                  ? 'text-green-600'
                  : result.survivalAtTarget >= 50
                  ? 'text-amber-600'
                  : 'text-red-600'
              }`}
            >
              {result.survivalAtTarget.toFixed(0)}%
            </p>
          </div>
        )}
      </div>

      {/* ── What is Monte Carlo? ── */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">🎲 What is Monte Carlo Simulation?</p>
        <p className="text-xs text-blue-700 leading-relaxed mb-2">
          In the real world, your portfolio never earns a steady 10% every year — some years it surges 20%,
          others it drops 8%. A Monte Carlo simulation runs <strong>hundreds of possible futures</strong> where annual
          returns randomly vary (mimicking real market behaviour), then asks: <em>"In how many of these futures did
          the money last long enough?"</em>
        </p>
        <p className="text-xs text-blue-700 leading-relaxed">
          The result — your <strong>survival probability</strong> — is far more honest than a single straight-line
          projection. A score above <strong className="text-green-700">80%</strong> is considered financially safe;
          below <strong className="text-amber-700">50%</strong> is a warning sign worth addressing.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-4 mb-5 p-3 bg-gray-50 rounded-lg">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Simulations
          </label>
          <select
            value={numSims}
            onChange={e => setNumSims(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-300"
          >
            <option value={500}>500</option>
            <option value={1000}>1,000</option>
            <option value={5000}>5,000</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">
            Return Volatility (σ)
          </label>
          <select
            value={volatility}
            onChange={e => setVolatility(Number(e.target.value))}
            className="text-sm border border-gray-200 rounded px-2 py-1 focus:outline-none focus:border-blue-300"
          >
            <option value={2}>Low (σ = 2%)</option>
            <option value={4}>Medium (σ = 4%)</option>
            <option value={6}>High (σ = 6%)</option>
            <option value={8}>Very High (σ = 8%)</option>
          </select>
          {/* σ explanation */}
          <p className="text-xs text-gray-400 mt-1.5 leading-snug max-w-[220px]">
            <strong className="text-gray-500">σ (sigma)</strong> measures how wildly returns swing
            year-to-year. Low σ = stable FD-like returns. High σ = equity boom-bust cycles.
            Indian equity markets typically sit at <strong className="text-gray-500">σ ≈ 6–8%</strong>.
          </p>
        </div>
        {result && (
          <div className="flex gap-2">
            <button
              onClick={() => setChartMode('survival')}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                chartMode === 'survival'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              Survival %
            </button>
            <button
              onClick={() => setChartMode('corpus')}
              className={`text-xs px-3 py-1.5 rounded border transition-colors ${
                chartMode === 'corpus'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
              }`}
            >
              Corpus Range
            </button>
          </div>
        )}
        <button
          onClick={run}
          disabled={running}
          className="ml-auto text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          {running ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                <path d="M4 12a8 8 0 018-8" stroke="currentColor" strokeWidth="4" className="opacity-75" />
              </svg>
              Running…
            </>
          ) : (
            '▶ Run Simulation'
          )}
        </button>
      </div>

      {/* Chart */}
      {!result && (
        <div className="flex items-center justify-center h-48 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
          Click "Run Simulation" to start Monte Carlo analysis
        </div>
      )}

      {result && chartMode === 'survival' && (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={result.data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false}
              label={{ value: 'Age', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#9CA3AF' }} />
            <YAxis tickFormatter={v => `${v}%`} domain={[0, 100]}
              tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false} axisLine={false} width={40} />
            <Tooltip content={<SurvivalTooltip />} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />

            <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3"
              label={{ value: '80% safe', position: 'insideTopRight', fontSize: 11, fill: '#10b981' }} />
            <ReferenceLine y={50} stroke="#f59e0b" strokeDasharray="3 3"
              label={{ value: '50%', position: 'insideTopRight', fontSize: 11, fill: '#f59e0b' }} />

            <Area type="monotone" dataKey="probability" name="Survival Probability"
              stroke={COLORS.primary} strokeWidth={2.5} fill={COLORS.primary} fillOpacity={0.15} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {result && chartMode === 'corpus' && (
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart data={result.data} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="mcBand" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.15} />
                <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
            <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false}
              label={{ value: 'Age', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#9CA3AF' }} />
            <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: '#9CA3AF' }}
              tickLine={false} axisLine={false} width={70} />
            <Tooltip content={<SurvivalTooltip />} />
            <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '10px' }} />

            <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 2" />

            {/* Shaded band p10–p90 */}
            <Area type="monotone" dataKey="p90" name="P90 (optimistic)" fill="url(#mcBand)"
              stroke="transparent" legendType="none" />
            <Area type="monotone" dataKey="p10" name="P10 (pessimistic)"
              fill="white" stroke="transparent" legendType="none" />

            <Line type="monotone" dataKey="p90" name="P90 corpus" stroke={COLORS.growth}
              strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
            <Line type="monotone" dataKey="p50" name="Median corpus" stroke={COLORS.primary}
              strokeWidth={2.5} dot={false} />
            <Line type="monotone" dataKey="p10" name="P10 corpus" stroke={COLORS.danger}
              strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      )}

      {/* Key stats row */}
      {result && (
        <div className="mt-4 grid grid-cols-3 gap-3 text-center">
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Simulations Run</p>
            <p className="text-sm font-bold text-gray-700">{result.numSims.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Return Volatility</p>
            <p className="text-sm font-bold text-gray-700">σ = {volatility}%</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-2.5">
            <p className="text-xs text-gray-500 uppercase tracking-wide">Median Depletion</p>
            <p className="text-sm font-bold text-gray-700">
              {result.medianDepletionAge ? `Age ${result.medianDepletionAge}` : `Age ${params.lifeExpectancy}+`}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

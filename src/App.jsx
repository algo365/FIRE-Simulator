import React, { useState, useMemo, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import SummaryCards from './components/SummaryCards';
import CorpusChart from './components/CorpusChart';
import ExpenseIncomeChart from './components/ExpenseIncomeChart';
import MonteCarloPanel from './components/MonteCarloPanel';
import ScenarioPanel from './components/ScenarioPanel';
import {
  runSimulation,
  runNoWithdrawalSimulation,
} from './utils/simulation';
import { formatINR } from './utils/formatting';

/* ─── Default simulation parameters ─────────────────────────── */
const DEFAULT_PARAMS = {
  currentAge:               40,
  retireAge:                40,            // same as currentAge → already retired
  lifeExpectancy:           90,
  initialCorpus:            50_000_000,    // ₹5 Crore
  monthlyExpense:           150_000,        // ₹1.5 Lakh (₹18L/yr)
  cagr:                     10,             // 10%
  inflationRate:            8,              // 8%
  additionalMonthlyIncome:  0,
  monthlySIP:               0,
  bigExpenses:              [],
  expenseAdjustments:       [],
};

/* ─── Demo scenarios (pre-computed at load time) ─────────────── */
const _DEMO_CONS_PARAMS = { ...DEFAULT_PARAMS, cagr: 6 };
const _DEMO_AGGR_PARAMS = { ...DEFAULT_PARAMS, cagr: 12 };
const _demoConsResult   = runSimulation(_DEMO_CONS_PARAMS);
const _demoAggrResult   = runSimulation(_DEMO_AGGR_PARAMS);
const DEFAULT_SCENARIOS = [
  {
    name: '🐢 Conservative — 6% CAGR',
    params: _DEMO_CONS_PARAMS,
    results: _demoConsResult.results,
    corpusZeroAge: _demoConsResult.corpusZeroAge,
  },
  {
    name: '🚀 Aggressive — 12% CAGR',
    params: _DEMO_AGGR_PARAMS,
    results: _demoAggrResult.results,
    corpusZeroAge: _demoAggrResult.corpusZeroAge,
  },
];

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: '📊 Overview',   short: '📊' },
  { id: 'montecarlo', label: '🎲 Monte Carlo', short: '🎲' },
  { id: 'scenarios',  label: '📋 Scenarios',   short: '📋' },
];

/* ─── Hero Banner ────────────────────────────────────────────── */
function HeroBanner({ onDismiss }) {
  return (
    <div className="relative bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 border border-blue-100 rounded-xl overflow-hidden">
      {/* Accent bar */}
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-500 rounded-l-xl" />

      {/* Dismiss button */}
      <button
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-white/60 transition-colors"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <div className="pl-5 pr-10 py-4 sm:pl-6 sm:pr-12 sm:py-5">
        {/* Headline */}
        <p className="text-base sm:text-lg font-black text-gray-800 leading-snug mb-2">
          <span className="text-blue-600">"How much is enough?"</span>
          {' '}— Most of us never stop to ask.
        </p>

        {/* Body */}
        <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-2">
          We chase more — a bigger salary, a larger corpus, one more promotion — yet the
          finish line keeps moving. Not because we're greedy, but because{' '}
          <span className="font-semibold text-gray-700">nobody ever told us where to stop.</span>
        </p>
        <p className="text-sm sm:text-[15px] text-gray-600 leading-relaxed mb-2">
          <span className="font-bold text-indigo-700">FIRE</span>
          {' '}— <em>Financial Independence, Retire Early</em> — is not about quitting
          work and lying on a beach. It's about reaching the point where{' '}
          <span className="font-semibold text-gray-700">work becomes a choice, not a compulsion.</span>
          {' '}The freedom to pursue what genuinely matters — to you, your family, and the world.
        </p>
        <p className="text-sm sm:text-[15px] text-indigo-700 font-semibold leading-relaxed">
          🔥 This simulator helps you answer the one question most financial plans ignore:{' '}
          <span className="italic">"Do I already have enough?"</span>
        </p>

        {/* Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {[
            { icon: '📐', label: 'SWP Withdrawal Model' },
            { icon: '🎲', label: 'Monte Carlo Risk Analysis' },
            { icon: '📊', label: 'Inflation-Adjusted Projections' },
            { icon: '🇮🇳', label: 'India Edition (₹)' },
          ].map(chip => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1.5 text-xs bg-white/70 border border-blue-100 rounded-full px-3 py-1 text-blue-700 font-medium whitespace-nowrap"
            >
              <span>{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Privacy / Trust Banner ─────────────────────────────────── */
function PrivacyBanner() {
  return (
    <div className="relative bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 rounded-xl overflow-hidden shadow-md">
      {/* Subtle dot-grid overlay */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '22px 22px',
        }}
      />

      <div className="relative px-5 py-4 sm:px-7 sm:py-5">
        {/* Headline row */}
        <div className="flex items-start sm:items-center gap-3 sm:gap-4 mb-2.5">
          <div className="flex-shrink-0 bg-white/20 rounded-full w-11 h-11 flex items-center justify-center text-2xl shadow-inner">
            🛡️
          </div>
          <div>
            <p className="text-white font-black text-base sm:text-xl leading-snug tracking-tight">
              100% Private &mdash; Runs Entirely In Your Browser
            </p>
            <p className="text-emerald-200 text-[11px] sm:text-xs font-semibold uppercase tracking-widest mt-0.5">
              Zero server · Zero data collection · Zero surveillance
            </p>
          </div>
        </div>

        {/* Body text */}
        <p className="text-emerald-50 text-xs sm:text-sm leading-relaxed mb-3">
          This calculator runs <strong className="text-white">only within your browser</strong> — on your own device (mobile or computer).{' '}
          No numbers, no inputs, no results are ever transmitted to any server.
          All financial modelling and calculations happen{' '}
          <strong className="text-white">locally, in real-time, entirely in client-side code.</strong>{' '}
          What you type stays with you — not stored, not logged, not seen by anyone.{' '}
          <span className="text-white font-semibold">Feel completely safe to experiment freely. ✌️</span>
        </p>

        {/* Trust chips */}
        <div className="flex flex-wrap gap-2">
          {[
            { icon: '🚫', text: 'No Server Calls' },
            { icon: '💻', text: '100% Client-Side' },
            { icon: '🙈', text: 'Zero Data Storage' },
            { icon: '🔐', text: 'Your Numbers Stay Yours' },
            { icon: '📴', text: 'Works Offline Too' },
          ].map(chip => (
            <span
              key={chip.text}
              className="inline-flex items-center gap-1.5 text-xs bg-white/15 hover:bg-white/25 transition-colors border border-white/20 rounded-full px-3 py-1 text-white font-semibold"
            >
              <span>{chip.icon}</span>
              {chip.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Page Footer ────────────────────────────────────────────── */
function PageFooter() {
  return (
    <footer className="border-t border-gray-200 mt-6 pt-5 pb-20 sm:pb-6 space-y-3">
      {/* Disclaimer */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex gap-2.5 items-start">
        <span className="text-amber-500 text-base flex-shrink-0 mt-0.5">⚠</span>
        <p className="text-xs text-amber-800 leading-relaxed">
          <span className="font-bold">Disclaimer:</span>{' '}
          This tool is based on established SWP (Systematic Withdrawal Plan) models.
          Please tweak inputs as per your investment style and actual expenses.
          This is for educational purposes only and does not constitute financial advice.
        </p>
      </div>

      {/* Feedback / contact */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <p className="text-xs text-blue-700 leading-relaxed">
          <span className="text-base mr-1">💬</span>
          <span className="font-bold">Got feedback or want to thank us?</span>
          {' '}We'd love to hear from you — drop us a note!
        </p>
        <a
          href="mailto:mahesh@algorithms365.com"
          className="inline-flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap flex-shrink-0"
        >
          ✉ mahesh@algorithms365.com
        </a>
      </div>

      {/* Credit + fine print */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-xs text-gray-400 text-center">
        <span>Designed and developed by</span>
        <a
          href="https://www.algorithms365.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:text-blue-700 font-semibold transition-colors"
        >
          algorithms365.com
        </a>
        <span className="hidden sm:inline">·</span>
        <span>Not financial advice</span>
      </div>
    </footer>
  );
}

/* ─── Main App ───────────────────────────────────────────────── */
export default function App() {
  const [params,        setParams]        = useState(DEFAULT_PARAMS);
  const [scenarios,     setScenarios]     = useState(DEFAULT_SCENARIOS);
  const [activeTab,     setActiveTab]     = useState('overview');
  const [sidebarOpen,   setSidebarOpen]   = useState(false);
  const [heroDismissed, setHeroDismissed] = useState(
    () => localStorage.getItem('fire_hero_dismissed') === '1'
  );

  /* ── Simulation results ──────────────────────────────────── */
  const { results, corpusZeroAge } = useMemo(
    () => runSimulation(params),
    [params]
  );
  const noWdResults = useMemo(
    () => runNoWithdrawalSimulation(params),
    [params]
  );

  /* ── Param updater (with cascading age constraints) ─────── */
  const updateParam = useCallback((key, value) => {
    setParams(prev => {
      const next = { ...prev, [key]: value };
      // Cascade: currentAge ≤ retireAge < lifeExpectancy
      if (key === 'currentAge') {
        next.retireAge      = Math.max(value, prev.retireAge);
        next.lifeExpectancy = Math.max(next.retireAge + 1, prev.lifeExpectancy);
      }
      if (key === 'retireAge') {
        next.currentAge     = Math.min(prev.currentAge, value);
        next.lifeExpectancy = Math.max(value + 1, prev.lifeExpectancy);
      }
      if (key === 'lifeExpectancy') {
        next.retireAge  = Math.min(prev.retireAge,  value - 1);
        next.currentAge = Math.min(prev.currentAge, next.retireAge);
      }
      return next;
    });
  }, []);
  const resetParams = useCallback(() => setParams(DEFAULT_PARAMS), []);

  /* ── Hero dismiss ────────────────────────────────────────── */
  const dismissHero = useCallback(() => {
    localStorage.setItem('fire_hero_dismissed', '1');
    setHeroDismissed(true);
  }, []);

  /* ── Scenario management ─────────────────────────────────── */
  const saveScenario = useCallback(
    (name) => {
      if (scenarios.length >= 5) return;
      setScenarios(prev => [
        ...prev,
        { name, params: { ...params }, results, corpusZeroAge },
      ]);
    },
    [params, results, corpusZeroAge, scenarios.length]
  );
  const clearScenarios = useCallback(() => setScenarios([]), []);

  const realReturn = params.cagr - params.inflationRate;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-30">
        <div className="flex items-center justify-between px-3 md:px-5 py-3 max-w-screen-2xl mx-auto">

          {/* Left: hamburger (mobile) + logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(o => !o)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 text-gray-600"
              aria-label="Toggle parameters"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={sidebarOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
              </svg>
            </button>
            <span className="text-2xl">🔥</span>
            <div>
              <h1 className="text-base font-black text-gray-800 leading-tight">FIRE Simulator</h1>
              <p className="text-xs text-gray-400 leading-none hidden sm:block">
                India Edition · Financial Independence Retire Early
              </p>
            </div>
          </div>

          {/* Right: quick stats */}
          <div className="hidden sm:flex items-center gap-3 md:gap-5">
            <div className="hidden md:block text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Invested</p>
              <p className="text-sm font-bold text-gray-700 tabular-nums">{formatINR(params.initialCorpus)}</p>
            </div>
            <div className="hidden md:block text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Monthly Spend</p>
              <p className="text-sm font-bold text-gray-700 tabular-nums">{formatINR(params.monthlyExpense)}</p>
            </div>
            <div className="text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400 font-semibold">Real Return</p>
              <p className={`text-sm font-bold tabular-nums ${realReturn >= 2 ? 'text-green-600' : 'text-amber-600'}`}>
                {realReturn.toFixed(1)}%
              </p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg font-bold text-sm ${
              corpusZeroAge ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {corpusZeroAge ? `✘ Age ${corpusZeroAge}` : `✔ Age ${params.lifeExpectancy}+`}
            </div>
          </div>
        </div>
      </header>

      {/* ── Mobile overlay backdrop ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Main layout: sidebar + content ── */}
      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full">

        {/* ── Sidebar ── */}
        <aside className={`
          fixed md:sticky top-0 md:top-14 z-20 md:z-auto
          w-[300px] md:w-80 bg-white border-r border-gray-100 shadow-xl md:shadow-sm
          flex flex-col h-screen md:h-auto md:self-start
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          {/* Mobile: close row */}
          <div className="flex items-center justify-between px-4 py-2 md:hidden border-b border-gray-100 bg-gray-50">
            <span className="text-sm font-bold text-gray-700">⚙ Parameters</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded hover:bg-gray-200 text-gray-500"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <InputPanel params={params} onUpdate={updateParam} onReset={resetParams} />
        </aside>

        {/* ── Right content ── */}
        <main className="flex-1 min-w-0">
          <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">

            {/* ── Privacy / Trust Banner ── */}
            <PrivacyBanner />

            {/* ── Hero Banner ── */}
            {!heroDismissed && <HeroBanner onDismiss={dismissHero} />}

            {/* ── Tabs ── */}
            <div className="flex bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-full sm:w-fit gap-1">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 sm:flex-none text-sm font-semibold px-3 sm:px-5 py-2 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <span className="sm:hidden">{tab.short}</span>
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              ))}
            </div>

            {/* ── Overview ── */}
            {activeTab === 'overview' && (
              <>
                <SummaryCards results={results} corpusZeroAge={corpusZeroAge} params={params} />
                <CorpusChart results={results} noWdResults={noWdResults} params={params} corpusZeroAge={corpusZeroAge} />
                <ExpenseIncomeChart results={results} />
                <ProjectionTable results={results} />
              </>
            )}

            {/* ── Monte Carlo ── */}
            {activeTab === 'montecarlo' && <MonteCarloPanel params={params} />}

            {/* ── Scenarios ── */}
            {activeTab === 'scenarios' && (
              <ScenarioPanel
                scenarios={scenarios}
                onSave={saveScenario}
                onClear={clearScenarios}
                currentParams={params}
              />
            )}

            {/* ── Footer (shown on all tabs) ── */}
            <PageFooter />

          </div>
        </main>
      </div>

      {/* ── Mobile floating button ── */}
      <button
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-10 bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-3 shadow-lg flex items-center gap-2 text-sm font-semibold"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
        </svg>
        Parameters
      </button>
    </div>
  );
}

/* ─── Collapsible projection table ──────────────────────────── */
function ProjectionTable({ results }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center p-4 hover:bg-gray-50 transition-colors rounded-xl"
      >
        <div>
          <h3 className="text-sm font-bold text-gray-800 text-left">Year-by-Year Projection Table</h3>
          <p className="text-xs text-gray-500 mt-0.5">Click to {open ? 'collapse' : 'expand'} detailed data</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-xs sm:text-sm min-w-[640px]">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Age', 'Year', 'Portfolio', 'Annual Expense', 'Annual Income', 'Net Withdrawal', 'WR %', 'Big Expense'].map(h => (
                  <th key={h} className="text-right first:text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wide text-xs whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r) => (
                <tr key={r.age}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${r.corpus === 0 ? 'bg-red-50' : ''}`}
                >
                  <td className="py-2 px-3 font-semibold text-gray-700">{r.age}</td>
                  <td className="text-right py-2 px-3 text-gray-500">{r.year}</td>
                  <td className="text-right py-2 px-3 font-bold tabular-nums"
                    style={{ color: r.corpus === 0 ? '#ef4444' : '#1d4ed8' }}>
                    {formatINR(r.corpus)}
                  </td>
                  <td className="text-right py-2 px-3 text-gray-600 tabular-nums">{formatINR(r.annualExpense)}</td>
                  <td className="text-right py-2 px-3 text-green-600 tabular-nums">{r.annualIncome > 0 ? formatINR(r.annualIncome) : '—'}</td>
                  <td className="text-right py-2 px-3 text-red-600 tabular-nums">{formatINR(r.netWithdrawal)}</td>
                  <td className="text-right py-2 px-3 tabular-nums"
                    style={{ color: r.withdrawalRate > 6 ? '#f59e0b' : '#6b7280' }}>
                    {r.withdrawalRate?.toFixed(1)}%
                  </td>
                  <td className="text-right py-2 px-3 text-amber-600 tabular-nums font-medium">
                    {r.yearBigExp > 0 ? formatINR(r.yearBigExp) : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

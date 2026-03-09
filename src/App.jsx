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

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: '📊 Overview',   short: '📊' },
  { id: 'montecarlo', label: '🎲 Monte Carlo', short: '🎲' },
  { id: 'scenarios',  label: '📋 Scenarios',   short: '📋' },
];

/* ─── Main App ───────────────────────────────────────────────── */
export default function App() {
  const [params,      setParams]      = useState(DEFAULT_PARAMS);
  const [scenarios,   setScenarios]   = useState([]);
  const [activeTab,   setActiveTab]   = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  /* ── Simulation results ──────────────────────────────────── */
  const { results, corpusZeroAge } = useMemo(
    () => runSimulation(params),
    [params]
  );
  const noWdResults = useMemo(
    () => runNoWithdrawalSimulation(params),
    [params]
  );

  /* ── Param updater ───────────────────────────────────────── */
  const updateParam = useCallback((key, value) => {
    setParams(prev => ({ ...prev, [key]: value }));
  }, []);
  const resetParams = useCallback(() => setParams(DEFAULT_PARAMS), []);

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
      <div className="flex flex-1 max-w-screen-2xl mx-auto w-full overflow-hidden">

        {/* ── Sidebar ── */}
        <aside className={`
          fixed md:sticky top-0 md:top-14 z-20 md:z-auto
          w-[300px] md:w-80 bg-white border-r border-gray-100 shadow-xl md:shadow-sm
          flex flex-col h-screen md:h-[calc(100vh-56px)]
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
        <main className="flex-1 overflow-y-auto custom-scroll min-w-0">
          <div className="p-3 sm:p-5 space-y-4 sm:space-y-5">

            {/* Tabs */}
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

            {/* Overview */}
            {activeTab === 'overview' && (
              <>
                <SummaryCards results={results} corpusZeroAge={corpusZeroAge} params={params} />
                <CorpusChart results={results} noWdResults={noWdResults} params={params} corpusZeroAge={corpusZeroAge} />
                <ExpenseIncomeChart results={results} />
                <ProjectionTable results={results} />
              </>
            )}

            {/* Monte Carlo */}
            {activeTab === 'montecarlo' && <MonteCarloPanel params={params} />}

            {/* Scenarios */}
            {activeTab === 'scenarios' && (
              <ScenarioPanel
                scenarios={scenarios}
                onSave={saveScenario}
                onClear={clearScenarios}
                currentParams={params}
              />
            )}
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

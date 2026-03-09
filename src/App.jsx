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
  currentAge:               43,
  lifeExpectancy:           90,
  initialCorpus:            100_000_000,   // ₹10 Crore
  monthlyExpense:           100_000,        // ₹1 Lakh
  cagr:                     12,             // 12%
  inflationRate:            6,              // 6%
  additionalMonthlyIncome:  0,
  monthlySIP:               0,
  bigExpenses:              [],
  expenseAdjustments:       [],
};

/* ─── Tab definitions ────────────────────────────────────────── */
const TABS = [
  { id: 'overview',    label: '📊 Overview' },
  { id: 'montecarlo', label: '🎲 Monte Carlo' },
  { id: 'scenarios',  label: '📋 Scenarios' },
];

/* ─── Main App ───────────────────────────────────────────────── */
export default function App() {
  const [params,    setParams]    = useState(DEFAULT_PARAMS);
  const [scenarios, setScenarios] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');

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

  const resetParams = useCallback(() => {
    setParams(DEFAULT_PARAMS);
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

  /* ── Real return ─────────────────────────────────────────── */
  const realReturn = params.cagr - params.inflationRate;

  /* ─────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">

      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="flex items-center justify-between px-4 py-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔥</span>
            <div>
              <h1 className="text-base font-black text-gray-800 leading-tight">
                FIRE Simulator
              </h1>
              <p className="text-[10px] text-gray-400 leading-none">India Edition · Financial Independence Retire Early</p>
            </div>
          </div>

          {/* Quick stats in header */}
          <div className="hidden md:flex items-center gap-5 text-xs text-gray-500">
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Corpus</p>
              <p className="font-bold text-gray-700 tabular-nums">{formatINR(params.initialCorpus)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">Monthly Spend</p>
              <p className="font-bold text-gray-700 tabular-nums">{formatINR(params.monthlyExpense)}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">CAGR vs Inflation</p>
              <p className={`font-bold tabular-nums ${realReturn >= 4 ? 'text-green-600' : 'text-amber-600'}`}>
                {params.cagr}% − {params.inflationRate}% = {realReturn.toFixed(1)}%
              </p>
            </div>
            <div className={`text-center px-3 py-1.5 rounded-lg font-bold text-sm ${
              corpusZeroAge ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'
            }`}>
              {corpusZeroAge ? `✘ Depletes Age ${corpusZeroAge}` : `✔ Lasts to ${params.lifeExpectancy}+`}
            </div>
          </div>
        </div>
      </header>

      {/* ── Main layout: sidebar + content ── */}
      <div className="flex flex-1 overflow-hidden max-w-screen-2xl mx-auto w-full">

        {/* ── Left Sidebar ── */}
        <aside className="w-80 min-w-[280px] bg-white border-r border-gray-100 shadow-sm flex flex-col h-[calc(100vh-56px)] sticky top-14 overflow-hidden">
          <InputPanel
            params={params}
            onUpdate={updateParam}
            onReset={resetParams}
          />
        </aside>

        {/* ── Right Content ── */}
        <main className="flex-1 overflow-y-auto custom-scroll">
          <div className="p-5 space-y-5 max-w-5xl">

            {/* Tab nav */}
            <div className="flex gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`text-xs font-semibold px-4 py-1.5 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* ── Overview Tab ── */}
            {activeTab === 'overview' && (
              <>
                <SummaryCards
                  results={results}
                  corpusZeroAge={corpusZeroAge}
                  params={params}
                />
                <CorpusChart
                  results={results}
                  noWdResults={noWdResults}
                  params={params}
                  corpusZeroAge={corpusZeroAge}
                />
                <ExpenseIncomeChart results={results} />

                {/* Detailed table */}
                <ProjectionTable results={results} />
              </>
            )}

            {/* ── Monte Carlo Tab ── */}
            {activeTab === 'montecarlo' && (
              <MonteCarloPanel params={params} />
            )}

            {/* ── Scenarios Tab ── */}
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
          <p className="text-xs text-gray-500">Click to {open ? 'collapse' : 'expand'} detailed data</p>
        </div>
        <svg className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="overflow-x-auto border-t border-gray-100">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Age', 'Year', 'Portfolio', 'Annual Expense', 'Annual Income', 'Net Withdrawal', 'WR %', 'Big Expense'].map(h => (
                  <th key={h} className="text-right first:text-left py-2.5 px-3 text-gray-500 font-semibold uppercase tracking-wide text-[10px] whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr
                  key={r.age}
                  className={`border-b border-gray-50 hover:bg-gray-50 ${r.corpus === 0 ? 'bg-red-50' : ''}`}
                >
                  <td className="py-1.5 px-3 font-semibold text-gray-700">{r.age}</td>
                  <td className="text-right py-1.5 px-3 text-gray-500">{r.year}</td>
                  <td className="text-right py-1.5 px-3 font-bold tabular-nums" style={{ color: r.corpus === 0 ? '#ef4444' : '#1d4ed8' }}>
                    {formatINR(r.corpus)}
                  </td>
                  <td className="text-right py-1.5 px-3 text-gray-600 tabular-nums">{formatINR(r.annualExpense)}</td>
                  <td className="text-right py-1.5 px-3 text-green-600 tabular-nums">{r.annualIncome > 0 ? formatINR(r.annualIncome) : '—'}</td>
                  <td className="text-right py-1.5 px-3 text-red-600 tabular-nums">{formatINR(r.netWithdrawal)}</td>
                  <td className="text-right py-1.5 px-3 tabular-nums" style={{ color: r.withdrawalRate > 6 ? '#f59e0b' : '#6b7280' }}>
                    {r.withdrawalRate?.toFixed(1)}%
                  </td>
                  <td className="text-right py-1.5 px-3 text-amber-600 tabular-nums font-medium">
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

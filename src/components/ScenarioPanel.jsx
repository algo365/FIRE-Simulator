import React, { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { mergeScenarioData } from '../utils/simulation';
import { formatINR, yAxisFormatter, COLORS } from '../utils/formatting';

function ScenarioTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-3 text-xs min-w-[180px]">
      <p className="font-bold text-gray-700 mb-1.5 border-b pb-1">Age {label}</p>
      {payload.map((e, i) => (
        <div key={i} className="flex justify-between gap-4 mb-0.5">
          <span style={{ color: e.color }}>{e.name}</span>
          <span className="font-semibold tabular-nums">{formatINR(e.value)}</span>
        </div>
      ))}
    </div>
  );
}

export default function ScenarioPanel({ scenarios, onSave, onClear, currentParams }) {
  const [newName, setNewName] = useState('');

  const handleSave = () => {
    const name = newName.trim() || `Scenario ${scenarios.length + 1}`;
    onSave(name);
    setNewName('');
  };

  const scenarioColors = COLORS.scenario;
  const chartData = scenarios.length > 0 ? mergeScenarioData(scenarios) : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-800">Scenario Comparison</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Compare multiple investment strategies side-by-side on the same chart
          </p>
        </div>
        {scenarios.length > 0 && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-300 px-2 py-1 rounded transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {/* ── How-to guide ── */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-3">📋 How to Use Scenario Comparison</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { step: '1', icon: '⚙️', title: 'Tweak Parameters', desc: 'Use the left panel to adjust CAGR, expenses, corpus, or any other input to represent an investment style.' },
            { step: '2', icon: '💾', title: 'Save the Scenario', desc: 'Give it a descriptive name (e.g. "Conservative 6%") and click Save Scenario below.' },
            { step: '3', icon: '📊', title: 'Compare Outcomes', desc: 'Repeat for another strategy. An overlay chart appears once you have 2+ scenarios saved.' },
          ].map(s => (
            <div key={s.step} className="flex gap-2.5 items-start">
              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-black flex items-center justify-center flex-shrink-0 mt-0.5">
                {s.step}
              </span>
              <div>
                <p className="text-xs font-semibold text-indigo-800">{s.icon} {s.title}</p>
                <p className="text-xs text-indigo-600 leading-relaxed mt-0.5">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-indigo-500 mt-3 pt-2.5 border-t border-indigo-100">
          💡 <strong>Demo loaded below</strong> — Conservative (6% CAGR) vs Aggressive (12% CAGR) with the same ₹5 Cr corpus and ₹1.5L/mo expenses, so you can see the impact of return assumptions immediately.
        </p>
      </div>

      {/* Save current scenario */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Scenario name (e.g. ₹1L expenses, Low returns…)"
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSave()}
          className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-300"
        />
        <button
          onClick={handleSave}
          disabled={scenarios.length >= 5}
          className="text-sm bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-4 py-1.5 rounded-lg font-semibold transition-colors whitespace-nowrap"
        >
          Save Scenario
        </button>
      </div>

      {scenarios.length === 0 ? (
        <div className="flex items-center justify-center h-36 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
          Save 2+ scenarios to compare them on an overlay chart
        </div>
      ) : (
        <>
          {/* Saved scenario list */}
          <div className="flex flex-wrap gap-2 mb-4">
            {scenarios.map((s, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border"
                style={{
                  borderColor: scenarioColors[i % scenarioColors.length] + '80',
                  background:  scenarioColors[i % scenarioColors.length] + '15',
                  color:       scenarioColors[i % scenarioColors.length],
                }}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: scenarioColors[i % scenarioColors.length] }}
                />
                <span className="font-semibold">{s.name}</span>
                {s.corpusZeroAge ? (
                  <span className="text-xs opacity-70">💀 {s.corpusZeroAge}</span>
                ) : (
                  <span className="text-xs opacity-70">✔ {s.params.lifeExpectancy}+</span>
                )}
              </div>
            ))}
          </div>

          {/* Comparison chart */}
          {scenarios.length >= 2 && (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="age" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickLine={false}
                  label={{ value: 'Age', position: 'insideBottom', offset: -12, fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tickFormatter={yAxisFormatter} tick={{ fontSize: 12, fill: '#9CA3AF' }}
                  tickLine={false} axisLine={false} width={70} />
                <Tooltip content={<ScenarioTooltip />} />
                <Legend wrapperStyle={{ fontSize: '13px', paddingTop: '12px' }} iconType="circle" iconSize={8} />
                <ReferenceLine y={0} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 2" />
                {scenarios.map((s, i) => (
                  <Line
                    key={i}
                    type="monotone"
                    dataKey={`s${i}`}
                    name={s.name}
                    stroke={scenarioColors[i % scenarioColors.length]}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          )}

          {scenarios.length === 1 && (
            <div className="flex items-center justify-center h-24 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
              Add at least one more scenario to see the comparison chart
            </div>
          )}

          {/* Scenario comparison table */}
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 pr-3 text-gray-500 font-semibold">Scenario</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">Corpus</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">Expense/mo</th>
                  <th className="text-right py-2 px-2 text-gray-500 font-semibold">CAGR</th>
                  <th className="text-right py-2 pl-2 text-gray-500 font-semibold">Outcome</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="py-1.5 pr-3 font-semibold" style={{ color: scenarioColors[i % scenarioColors.length] }}>
                      {s.name}
                    </td>
                    <td className="text-right py-1.5 px-2 text-gray-700 tabular-nums">
                      {formatINR(s.params.initialCorpus)}
                    </td>
                    <td className="text-right py-1.5 px-2 text-gray-700 tabular-nums">
                      {formatINR(s.params.monthlyExpense)}
                    </td>
                    <td className="text-right py-1.5 px-2 text-gray-700">
                      {s.params.cagr}%
                    </td>
                    <td className="text-right py-1.5 pl-2">
                      {s.corpusZeroAge ? (
                        <span className="text-red-600 font-bold">✘ Age {s.corpusZeroAge}</span>
                      ) : (
                        <span className="text-green-600 font-bold">✔ Age {s.params.lifeExpectancy}+</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {scenarios.length >= 5 && (
        <p className="text-xs text-amber-600 mt-2 text-center">Maximum 5 scenarios reached. Clear to add new ones.</p>
      )}
    </div>
  );
}

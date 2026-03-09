import React, { useState } from 'react';
import SliderInput from './SliderInput';
import BigExpensesInput from './BigExpensesInput';
import ExpenseRulesInput from './ExpenseRulesInput';
import { formatINR } from '../utils/formatting';

function Section({ title, icon, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex justify-between items-center py-3 px-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-bold text-gray-700 flex items-center gap-2">
          <span className="text-base">{icon}</span>
          {title}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-4 pb-5 pt-1">{children}</div>}
    </div>
  );
}

export default function InputPanel({ params, onUpdate, onReset }) {
  return (
    <div className="h-full md:h-auto flex flex-col">
      {/* Panel header */}
      <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50">
        <h2 className="text-sm font-bold text-gray-700">Simulation Parameters</h2>
        <button
          onClick={onReset}
          className="text-xs text-gray-500 hover:text-blue-600 border border-gray-200 hover:border-blue-300 px-2.5 py-1 rounded transition-colors font-medium"
        >
          Reset Defaults
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scroll md:flex-none md:overflow-visible">
        {/* ── Core Parameters ── */}
        <Section title="Core Parameters" icon="📊">
          <SliderInput
            label="Current Age"
            value={params.currentAge}
            min={25} max={60} step={1}
            onChange={v => onUpdate('currentAge', Math.min(v, params.lifeExpectancy - 1))}
            format={v => `${v} yrs`}
          />
          <SliderInput
            label="Life Expectancy"
            value={params.lifeExpectancy}
            min={70} max={100} step={1}
            onChange={v => onUpdate('lifeExpectancy', Math.max(v, params.currentAge + 1))}
            format={v => `${v} yrs`}
          />
          <SliderInput
            label="Total Invested Amount"
            value={params.initialCorpus}
            min={5000000} max={500000000} step={5000000}
            onChange={v => onUpdate('initialCorpus', v)}
            format={v => formatINR(v)}
          />
          <SliderInput
            label="Expected CAGR Return"
            value={params.cagr}
            min={5} max={20} step={0.5}
            onChange={v => onUpdate('cagr', v)}
            format={v => `${v}%`}
          />
          <SliderInput
            label="Inflation Rate"
            value={params.inflationRate}
            min={3} max={12} step={0.5}
            onChange={v => onUpdate('inflationRate', v)}
            format={v => `${v}%`}
          />
        </Section>

        {/* ── Monthly Cash Flows ── */}
        <Section title="Monthly Cash Flows" icon="💰">
          <SliderInput
            label="Monthly Expenses"
            value={params.monthlyExpense}
            min={25000} max={500000} step={5000}
            onChange={v => onUpdate('monthlyExpense', v)}
            format={v => formatINR(v)}
            hint={`≈ ${formatINR(params.monthlyExpense * 12)} per annum`}
          />
          <SliderInput
            label="Additional Monthly Income"
            value={params.additionalMonthlyIncome}
            min={0} max={300000} step={5000}
            onChange={v => onUpdate('additionalMonthlyIncome', v)}
            format={v => v === 0 ? 'None' : formatINR(v)}
            hint="Rent, consulting, pension, part-time work"
          />
          <SliderInput
            label="Monthly SIP Contribution"
            value={params.monthlySIP}
            min={0} max={300000} step={5000}
            onChange={v => onUpdate('monthlySIP', v)}
            format={v => v === 0 ? 'None' : formatINR(v)}
            hint="Ongoing SIP investment post retirement"
          />
        </Section>

        {/* ── One-Time Future Expenses ── */}
        <Section title="One-Time Future Expenses" icon="🎯" defaultOpen={false}>
          <BigExpensesInput
            expenses={params.bigExpenses}
            onChange={v => onUpdate('bigExpenses', v)}
          />
        </Section>

        {/* ── Expense Adjustments ── */}
        <Section title="Expense Adjustments by Age" icon="📈" defaultOpen={false}>
          <p className="text-xs text-gray-500 mb-3">
            Define how expenses change at specific ages (on top of base inflation).
          </p>
          <ExpenseRulesInput
            rules={params.expenseAdjustments}
            onChange={v => onUpdate('expenseAdjustments', v)}
          />
        </Section>
      </div>
    </div>
  );
}

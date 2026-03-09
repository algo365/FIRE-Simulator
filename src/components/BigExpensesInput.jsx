import React from 'react';
import { formatINR } from '../utils/formatting';

const PRESETS = [
  { description: "Child's Wedding", age: 50, amount: 3000000 },
  { description: 'House Renovation', age: 55, amount: 2000000 },
  { description: 'Medical Emergency', age: 65, amount: 1000000 },
  { description: "Child's Education", age: 48, amount: 2500000 },
];

export default function BigExpensesInput({ expenses, onChange }) {
  const add = () =>
    onChange([...expenses, { id: Date.now(), description: '', age: '', amount: '' }]);

  const remove = (id) => onChange(expenses.filter(e => e.id !== id));

  const update = (id, field, value) =>
    onChange(expenses.map(e => (e.id === id ? { ...e, [field]: value } : e)));

  const addPreset = (p) =>
    onChange([...expenses, { id: Date.now(), ...p }]);

  return (
    <div>
      {/* Preset buttons */}
      <div className="mb-2">
        <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">Quick add preset</p>
        <div className="flex flex-wrap gap-1">
          {PRESETS.map((p, i) => (
            <button
              key={i}
              onClick={() => addPreset(p)}
              className="text-[10px] bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-700 border border-gray-200 hover:border-blue-200 px-1.5 py-0.5 rounded transition-colors"
            >
              {p.description}
            </button>
          ))}
        </div>
      </div>

      {/* Expense rows */}
      {expenses.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic text-center py-2">No one-time expenses added</p>
      ) : (
        <div className="space-y-1.5 mb-2">
          {expenses.map(exp => (
            <div key={exp.id} className="flex gap-1 items-center">
              <input
                type="text"
                placeholder="Description"
                value={exp.description}
                onChange={e => update(exp.id, 'description', e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 flex-1 min-w-0 focus:outline-none focus:border-blue-300"
              />
              <input
                type="number"
                placeholder="Age"
                value={exp.age}
                onChange={e => update(exp.id, 'age', e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 w-14 focus:outline-none focus:border-blue-300"
              />
              <input
                type="number"
                placeholder="₹ Amount"
                value={exp.amount}
                onChange={e => update(exp.id, 'amount', e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 w-24 focus:outline-none focus:border-blue-300"
              />
              <button
                onClick={() => remove(exp.id)}
                className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {expenses.filter(e => e.age && e.amount).length > 0 && (
        <div className="bg-amber-50 border border-amber-100 rounded p-2 mt-2 space-y-0.5">
          {expenses
            .filter(e => e.age && e.amount)
            .sort((a, b) => parseInt(a.age) - parseInt(b.age))
            .map(e => (
              <div key={e.id + '_sum'} className="flex justify-between text-[10px] text-amber-800">
                <span>Age {e.age}{e.description ? ` — ${e.description}` : ''}</span>
                <span className="font-bold">{formatINR(parseFloat(e.amount))}</span>
              </div>
            ))}
          <div className="border-t border-amber-200 mt-1 pt-1 flex justify-between text-[10px] font-bold text-amber-900">
            <span>Total one-time expenses</span>
            <span>
              {formatINR(expenses.filter(e => e.amount).reduce((s, e) => s + parseFloat(e.amount || 0), 0))}
            </span>
          </div>
        </div>
      )}

      <button
        onClick={add}
        className="mt-2 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded transition-colors"
      >
        + Add Expense
      </button>
    </div>
  );
}

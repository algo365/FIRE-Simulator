import React from 'react';

const PRESETS = [
  { description: 'Reduce at retirement', age: 60, percentChange: -20 },
  { description: 'Healthcare increase', age: 75, percentChange: 30 },
  { description: 'Kids independent', age: 55, percentChange: -15 },
  { description: 'Travel splurge phase', age: 65, percentChange: 10 },
];

export default function ExpenseRulesInput({ rules, onChange }) {
  const add = () =>
    onChange([...rules, { id: Date.now(), description: '', age: '', percentChange: '' }]);

  const remove = (id) => onChange(rules.filter(r => r.id !== id));

  const update = (id, field, value) =>
    onChange(rules.map(r => (r.id === id ? { ...r, [field]: value } : r)));

  const addPreset = (p) =>
    onChange([...rules, { id: Date.now(), ...p }]);

  return (
    <div>
      <div className="mb-2">
        <p className="text-[10px] text-gray-400 mb-1.5 font-semibold uppercase tracking-wide">Quick add</p>
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

      {rules.length === 0 ? (
        <p className="text-[11px] text-gray-400 italic text-center py-2">No adjustments added</p>
      ) : (
        <div className="space-y-1.5 mb-2">
          {rules.map(rule => (
            <div key={rule.id} className="flex gap-1 items-center">
              <input
                type="text"
                placeholder="Description"
                value={rule.description}
                onChange={e => update(rule.id, 'description', e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 flex-1 min-w-0 focus:outline-none focus:border-blue-300"
              />
              <input
                type="number"
                placeholder="Age"
                value={rule.age}
                onChange={e => update(rule.id, 'age', e.target.value)}
                className="text-xs border border-gray-200 rounded px-1.5 py-1 w-14 focus:outline-none focus:border-blue-300"
              />
              <div className="relative">
                <input
                  type="number"
                  placeholder="±%"
                  value={rule.percentChange}
                  onChange={e => update(rule.id, 'percentChange', e.target.value)}
                  className="text-xs border border-gray-200 rounded px-1.5 py-1 w-14 focus:outline-none focus:border-blue-300"
                />
              </div>
              <button
                onClick={() => remove(rule.id)}
                className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Show summary of rules sorted by age */}
      {rules.filter(r => r.age && r.percentChange).length > 0 && (
        <div className="bg-blue-50 border border-blue-100 rounded p-2 mt-2 space-y-0.5">
          {rules
            .filter(r => r.age && r.percentChange)
            .sort((a, b) => parseInt(a.age) - parseInt(b.age))
            .map(r => {
              const pct = parseFloat(r.percentChange);
              return (
                <div key={r.id + '_sum'} className="flex justify-between text-[10px] text-blue-800">
                  <span>Age {r.age}{r.description ? ` — ${r.description}` : ''}</span>
                  <span className={`font-bold ${pct >= 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {pct >= 0 ? '+' : ''}{pct}%
                  </span>
                </div>
              );
            })}
        </div>
      )}

      <button
        onClick={add}
        className="mt-2 w-full text-xs bg-blue-600 hover:bg-blue-700 text-white py-1.5 rounded transition-colors"
      >
        + Add Rule
      </button>
    </div>
  );
}

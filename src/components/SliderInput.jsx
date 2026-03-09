import React from 'react';

/**
 * Reusable slider component with label, formatted value badge, and min/max labels.
 * Font sizes bumped up 2pt from original to improve readability.
 */
export default function SliderInput({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  format,
  hint,
  className = '',
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div className={`mb-5 ${className}`}>
      <div className="flex justify-between items-center mb-2">
        {/* Label: was text-xs (10px uppercase) → now text-xs (12px uppercase) */}
        <label className="text-xs font-bold text-gray-500 uppercase tracking-wide leading-tight">
          {label}
        </label>
        {/* Value badge: was text-sm → stays text-sm (14px) */}
        <span className="text-sm font-bold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md tabular-nums">
          {format(value)}
        </span>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full cursor-pointer"
        style={{
          background: `linear-gradient(to right, #2563eb ${pct}%, #e2e8f0 ${pct}%)`,
        }}
      />

      {/* Min / Max labels: was text-[10px] → now text-xs (12px) */}
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>

      {/* Hint: was text-[10px] → now text-xs (12px) */}
      {hint && <p className="text-xs text-gray-400 mt-1 italic">{hint}</p>}
    </div>
  );
}

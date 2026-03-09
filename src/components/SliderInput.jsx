import React from 'react';

/**
 * Reusable slider component with label, formatted value badge, and min/max labels.
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
  return (
    <div className={`mb-4 ${className}`}>
      <div className="flex justify-between items-center mb-1.5">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide leading-tight">
          {label}
        </label>
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
          background: `linear-gradient(to right, #2563eb ${((value - min) / (max - min)) * 100}%, #e2e8f0 ${((value - min) / (max - min)) * 100}%)`,
        }}
      />
      <div className="flex justify-between text-[10px] text-gray-400 mt-0.5">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
      {hint && <p className="text-[10px] text-gray-400 mt-0.5 italic">{hint}</p>}
    </div>
  );
}

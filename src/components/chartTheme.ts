/** Shared Recharts styling: recessive grid/axes, text in neutral ink, series from validated palette. */
export const SERIES = ['#0aa3be', '#ec4899', '#c97a0a', '#8b5cf6'];
export const axis = { stroke: '#475569', tick: { fill: '#cbd5e1', fontSize: 16 }, tickLine: false };
export const grid = { stroke: '#202840', strokeDasharray: '0', vertical: false };
export const tooltip = {
  contentStyle: { background: '#0d111c', border: '1px solid #2e3958', borderRadius: 12, fontSize: 16, color: '#e2e8f0' },
  labelStyle: { color: '#94a3b8' },
  itemStyle: { color: '#e2e8f0' },
  cursor: { stroke: '#64748b', strokeWidth: 1 },
};
export const legend = { wrapperStyle: { fontSize: 16, color: '#cbd5e1' } };

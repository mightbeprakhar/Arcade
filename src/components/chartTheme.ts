/** Recharts on the night screen: Pixelify ticks, faint grid. Series: class/A = blue, rival/B = red, theory = gold (dashed). */
export const SERIES = { pen: '#5aa7ff', graphite: '#ef5a4b', mark: '#ffcc4d', blue: '#5aa7ff', red: '#ef5a4b', gold: '#ffcc4d', teal: '#47c9a8' };
export const axis = { stroke: 'rgba(246,240,220,0.35)', tick: { fill: '#d4cdee', fontSize: 20, fontFamily: 'VT323' }, tickLine: false };
export const grid = { stroke: 'rgba(246,240,220,0.08)', vertical: false };
export const tooltip = {
  contentStyle: { background: '#151233', border: '4px solid #0f0d22', borderRadius: 0, fontSize: 20, color: '#f6f0dc', fontFamily: 'VT323' },
  labelStyle: { color: '#a39bc9' },
  itemStyle: { color: '#f6f0dc' },
  cursor: { stroke: 'rgba(246,240,220,0.35)', strokeWidth: 1 },
};
export const legend = { wrapperStyle: { fontSize: 16, color: '#d4cdee', fontFamily: 'Pixelify Sans' } };

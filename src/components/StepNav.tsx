import type { Stage, StageId } from './GameShell';

export function StepNav({
  stages,
  index,
  onSelect,
  accent,
}: {
  stages: Stage[];
  index: number;
  onSelect: (i: number | StageId) => void;
  accent: string;
}) {
  return (
    <nav aria-label="Game stages" className="flex flex-wrap gap-1.5 rounded-2xl border border-ink-700 bg-ink-900 p-1.5">
      {stages.map((s, i) => {
        const active = i === index;
        const past = i < index;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            aria-current={active ? 'step' : undefined}
            className={`btn px-3 py-1.5 text-base ${active ? 'text-ink-950' : past ? 'text-slate-200' : 'text-slate-400'}`}
            style={active ? { background: accent } : undefined}
          >
            <span className="font-mono text-sm opacity-70">{i + 1}</span>
            {s.label}
          </button>
        );
      })}
    </nav>
  );
}

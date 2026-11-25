import type { Stage, StageId } from './GameShell';

export function StepNav({ stages, index, onSelect }: { stages: Stage[]; index: number; onSelect: (i: number | StageId) => void; accent?: string }) {
  return (
    <nav aria-label="Game stages" className="flex flex-wrap gap-2">
      {stages.map((s, i) => {
        const active = i === index;
        const done = i < index;
        return (
          <button
            key={s.id}
            onClick={() => onSelect(i)}
            aria-current={active ? 'step' : undefined}
            className={`flex h-9 items-center gap-2 border-4 border-black px-3 font-pixel text-xs focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold ${
              active ? 'bg-gold text-black' : done ? 'bg-panel2 text-ink' : 'bg-panel text-ink-3 hover:text-ink'
            }`}
          >
            {s.label.toUpperCase()}
          </button>
        );
      })}
    </nav>
  );
}

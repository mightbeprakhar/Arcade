import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../games/meta';
import { clearAllResults, useResults } from '../state/results';
import { ActionWord, Bubble, Narration, Panel } from '../components/comic';
import { Sprite } from '../components/pixel/Sprite';
import { C, face } from '../components/pixel/sprites';
import { T } from '../components/motion';
import { usePresenter, toggleFullscreen } from '../state/presenter';

const fmt = (n: number) => (Number.isInteger(n) ? n.toLocaleString('en-IN') : n.toFixed(2));

/** Two pixel bars on a shared scale for one game (units differ between games, so never across rows). */
function PairBars({ a, b }: { a: number; b: number }) {
  const m = Math.max(Math.abs(a), Math.abs(b), 1e-9);
  const bar = (v: number, color: string, label: string) => (
    <div className="flex items-center gap-2">
      <span className="w-14 font-pixel text-xs text-ink-3">{label}</span>
      <div className="relative h-6 flex-1 border-2 border-black bg-deep">
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-ink-3" />
        <motion.div
          className="absolute inset-y-0"
          style={{ background: color, left: v >= 0 ? '50%' : undefined, right: v < 0 ? '50%' : undefined }}
          initial={{ width: 0 }}
          animate={{ width: `${(Math.abs(v) / m) * 50}%` }}
          transition={T}
        />
      </div>
    </div>
  );
  return (
    <div className="space-y-2">
      {bar(a, '#5aa7ff', 'CLASS')}
      {bar(b, '#ffcc4d', 'NASH')}
    </div>
  );
}

export default function Results() {
  const results = useResults();
  const { togglePresenter } = usePresenter();
  const played = GAMES.filter((g) => results[g.id]);
  const beat = played.filter((g) => results[g.id]!.classPayoff > results[g.id]!.nashPayoff).length;
  const nash = face(beat > played.length / 2 ? 'shocked' : 'smug', '#a39bc9', C.skin);

  useEffect(() => {
    document.title = 'Humans vs Nash · Game Theory Arcade';
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'p' || e.key === 'P') togglePresenter();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePresenter]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link to="/" className="btn-text">
          ◀ ARCADE
        </Link>
        <span className="chip text-gold">FINAL SCREEN</span>
      </div>

      <header className="mt-8 grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <div>
          <h1 className="text-4xl text-gold sm:text-5xl" style={{ textShadow: '6px 6px 0 #0f0d22' }}>
            HUMANS
            <br />
            <span className="text-ink">VS NASH</span>
          </h1>
          <p className="mt-6 max-w-xl text-2xl text-ink-2">What the class actually did in each game, against what a perfectly rational player would expect to get.</p>
        </div>
        <Panel className="bg-[#241f52] p-6">
          <div className="flex items-end justify-between gap-4">
            <Sprite {...nash} px={10} title="John Nash, pixelated" />
            <Bubble side="bottom-right">
              {played.length === 0
                ? 'Play a level and I’ll keep score.'
                : beat > played.length / 2
                  ? 'Irrational… and richer. Interesting.'
                  : beat === 0
                    ? 'As predicted. Mostly.'
                    : 'Some wins for humanity. Some for me.'}
            </Bubble>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4 text-center">
            <div className="border-4 border-black bg-deep p-3">
              <div className="font-pixel text-xs text-ink-3">PLAYED</div>
              <div className="font-mono text-6xl leading-none">
                {played.length}/{GAMES.length}
              </div>
            </div>
            <div className="border-4 border-black bg-deep p-3">
              <div className="font-pixel text-xs text-ink-3">CLASS BEAT NASH</div>
              <div className="font-mono text-6xl leading-none text-blue">{beat}</div>
            </div>
          </div>
        </Panel>
      </header>

      <section className="mt-12 space-y-6" aria-label="Results by game">
        {GAMES.map((g) => {
          const r = results[g.id];
          if (!r)
            return (
              <div key={g.id} className="flex flex-wrap items-center justify-between gap-4 border-4 border-dashed border-panel2 p-4">
                <span className="text-2xl font-bold text-ink-3">
                  <span className="font-pixel text-xs">LVL {g.number}</span> · {g.title}
                </span>
                <Link to={g.path} className="btn-ghost">
                  NOT PLAYED · PLAY ▶
                </Link>
              </div>
            );
          const gap = r.classPayoff - r.nashPayoff;
          const won = gap > 0;
          return (
            <Panel key={g.id} className="p-4">
              <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <div>
                  <div className="font-pixel text-xs text-gold">LVL {g.number}</div>
                  <div className="text-3xl font-bold">{g.title}</div>
                  <div className="text-lg text-teal">{g.concept}</div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="font-pixel text-xs text-blue">CLASS </span>
                    <span className="text-lg">{r.classChoice}</span>
                    <span className="ml-2 font-mono text-3xl text-blue">{fmt(r.classPayoff)}</span>
                  </div>
                  <div>
                    <span className="font-pixel text-xs text-gold">NASH </span>
                    <span className="text-lg">{r.nashPrediction}</span>
                    <span className="ml-2 font-mono text-3xl text-gold">{fmt(r.nashPayoff)}</span>
                  </div>
                  <div className="text-sm text-ink-3">Units: {r.unit}</div>
                </div>
                <PairBars a={r.classPayoff} b={r.nashPayoff} />
                <div className="text-center">
                  <div className="font-pixel text-xs text-ink-3">GAP</div>
                  <div className={`font-mono text-6xl leading-none ${won ? 'text-teal' : gap < 0 ? 'text-red' : 'text-ink'}`}>
                    {gap > 0 ? '+' : ''}
                    {fmt(gap)}
                  </div>
                </div>
              </div>
            </Panel>
          );
        })}
      </section>

      {played.length > 0 && (
        <div className="mt-12 grid grid-cols-1 items-center gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
          <Narration>
            Nash equilibrium predicts what players do if everyone is rational, selfish and knows everyone else is too. Where the class beat it, humans cooperated, punished or
            gambled in ways the model leaves out. Where it lost, the logic of the equilibrium bit back.
          </Narration>
          <ActionWord text="GAME OVER" size={36} />
        </div>
      )}

      <div className="mt-12 flex flex-wrap gap-4">
        <Link to="/" className="btn-primary">
          ◀ BACK TO ARCADE
        </Link>
        <button
          className="btn-ghost"
          onClick={() => {
            if (window.confirm('Clear all recorded class results?')) clearAllResults();
          }}
        >
          CLEAR RESULTS
        </button>
      </div>
    </div>
  );
}

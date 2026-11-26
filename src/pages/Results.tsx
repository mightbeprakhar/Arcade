import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../games/meta';
import { beatNashFor, clearAllResults, pointsFor, usePredictions, useResults } from '../state/results';
import { ActionWord, Bubble, Narration, Panel } from '../components/comic';
import { Sprite } from '../components/pixel/Sprite';
import { robot } from '../components/pixel/sprites';
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
  const preds = usePredictions();
  const totalPts = GAMES.reduce((s, g) => s + (pointsFor(g.id, results, preds) ?? 0), 0);
  const { togglePresenter } = usePresenter();
  const played = GAMES.filter((g) => results[g.id]);
  const beat = played.filter((g) => beatNashFor(results[g.id])).length;
  const nash = robot(played.length === 0 ? 'happy' : beat > played.length / 2 ? 'shocked' : 'smug');

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
            <div className="flex flex-col items-center gap-2">
              <Sprite {...nash} px={7} title="NASH-BOT, the arcade’s scorekeeper" />
              <span className="chip whitespace-nowrap text-gold">NASH-BOT</span>
            </div>
            <Bubble side="bottom-right">
              {played.length === 0
                ? 'Play a game and I’ll keep score.'
                : beat > played.length / 2
                  ? 'Irrational… and richer. Interesting.'
                  : beat === 0
                    ? 'As predicted. Mostly.'
                    : 'Some wins for humanity. Some for me.'}
            </Bubble>
          </div>
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="border-4 border-black bg-deep p-3">
              <div className="font-pixel text-xs text-ink-3">PLAYED</div>
              <div className="font-mono text-6xl leading-none">
                {played.length}/{GAMES.length}
              </div>
            </div>
            <div className="border-4 border-black bg-deep p-3">
              <div className="font-pixel text-xs text-ink-3">BEAT NASH</div>
              <div className="font-mono text-6xl leading-none text-blue">{beat}</div>
            </div>
            <div className="border-4 border-black bg-deep p-3">
              <div className="font-pixel text-xs text-ink-3">POINTS</div>
              <div className="font-mono text-5xl leading-none text-gold">{totalPts.toLocaleString('en-IN')}</div>
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
                <span className="font-display text-2xl font-bold text-ink-3">
                  <span className="font-pixel text-xs">GAME {g.number}</span> · {g.title}
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
                  <div className="font-pixel text-xs text-gold">GAME {g.number}</div>
                  <div className="font-display text-3xl font-bold">{g.title}</div>
                  <div className="text-lg text-teal">{g.concept}</div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="font-pixel text-xs text-blue">CLASS</div>
                    <div className="text-lg">{r.classChoice}</div>
                  </div>
                  <div>
                    <div className="font-pixel text-xs text-gold">NASH</div>
                    <div className="text-lg">{r.nashPrediction}</div>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t-2 border-black pt-2">
                    {(r.details ?? [{ label: '', classPayoff: r.classPayoff, nashPayoff: r.nashPayoff }]).map((d) => (
                      <div key={d.label} className="flex flex-wrap items-baseline gap-x-4">
                        {d.label && <span className="text-sm text-ink-3">{d.label}</span>}
                        <span>
                          <span className="font-pixel text-xs text-blue">CLASS </span>
                          <span className="font-mono text-3xl text-blue">{fmt(d.classPayoff)}</span>
                        </span>
                        <span>
                          <span className="font-pixel text-xs text-gold">NASH </span>
                          <span className="font-mono text-3xl text-gold">{fmt(d.nashPayoff)}</span>
                        </span>
                      </div>
                    ))}
                    <span className="text-sm text-ink-3">{r.unit}</span>
                  </div>
                </div>
                <PairBars a={r.classPayoff} b={r.nashPayoff} />
                <div className="text-center">
                  {beatNashFor(r) && <div className="chip mb-2 bg-gold text-black">★ BEAT NASH</div>}
                  <div className="font-mono text-3xl leading-none text-gold">{(pointsFor(g.id, results, preds) ?? 0).toLocaleString('en-IN')} pts</div>
                  {preds[g.id] !== undefined && <div className="mt-1 text-sm text-ink-3">prediction {preds[g.id] ? 'right' : 'missed'}</div>}
                  <div className="mt-3 font-pixel text-xs text-ink-3">GAP</div>
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

      {played.length === GAMES.length && (
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

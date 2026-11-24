import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../games/meta';
import { useResults } from '../state/results';
import { usePresenter, toggleFullscreen } from '../state/presenter';

const LOOP = ['Story', 'Play', 'Solve', 'Simulate', 'Debrief'];

export default function Hub() {
  const results = useResults();
  const { presenter, togglePresenter } = usePresenter();
  const played = GAMES.filter((g) => results[g.id]).length;

  useEffect(() => {
    document.title = 'Game Theory Arcade';
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'p' || e.key === 'P') togglePresenter();
      if (e.key === 'f' || e.key === 'F') toggleFullscreen();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [togglePresenter]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="font-mono text-sm font-semibold uppercase tracking-[0.3em] text-neon-cyan">Game Theory · RV University · SoCSE</div>
          <h1 className="mt-2 text-5xl font-bold leading-none sm:text-7xl">
            Game Theory <span className="bg-gradient-to-r from-neon-cyan via-neon-violet to-neon-pink bg-clip-text text-transparent">Arcade</span>
          </h1>
          <p className="mt-4 max-w-2xl text-xl text-slate-300">
            Five classic games. The class plays each one live, then we solve it on screen and see how close humans come to Nash.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-ghost" onClick={toggleFullscreen}>
            ⛶ Fullscreen <span className="kbd">F</span>
          </button>
          <button className={`btn ${presenter ? 'bg-neon-amber text-ink-950' : 'border border-ink-600 bg-ink-800'}`} onClick={togglePresenter} aria-pressed={presenter}>
            Presenter Mode <span className="kbd">P</span>
          </button>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2 text-base text-slate-300">
        <span className="label mr-1">Every level</span>
        {LOOP.map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="chip">{s}</span>
            {i < LOOP.length - 1 && <span className="text-slate-500">→</span>}
          </span>
        ))}
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {GAMES.map((g, i) => {
          const done = !!results[g.id];
          return (
            <motion.div key={g.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Link
                to={g.path}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-ink-700 bg-ink-900 p-6 transition hover:-translate-y-1 focus:outline-none focus-visible:ring-4"
                style={{ ['--tw-ring-color' as string]: g.accent }}
              >
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-20 blur-2xl transition group-hover:opacity-40" style={{ background: g.accent }} />
                <div className="flex items-center justify-between">
                  <span className="font-mono text-lg font-bold" style={{ color: g.accent }}>
                    LEVEL 0{g.number}
                  </span>
                  {done ? <span className="chip border-neon-lime/50 text-neon-lime">✓ Played</span> : <span className="text-4xl" aria-hidden>{g.icon}</span>}
                </div>
                <h2 className="mt-4 text-3xl font-bold">{g.title}</h2>
                <div className="mt-1 text-base font-semibold" style={{ color: g.accent }}>
                  {g.concept}
                </div>
                <p className="mt-3 flex-1 text-lg text-slate-300">{g.hook}</p>
                <div className="mt-5 inline-flex items-center gap-2 text-lg font-semibold">
                  Play <span className="transition group-hover:translate-x-1">→</span>
                </div>
              </Link>
            </motion.div>
          );
        })}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.32 }}>
          <Link
            to="/results"
            className="group flex h-full flex-col rounded-3xl border-2 border-dashed border-ink-600 bg-gradient-to-br from-ink-900 to-ink-800 p-6 transition hover:-translate-y-1 hover:border-neon-violet focus:outline-none focus-visible:ring-4 focus-visible:ring-neon-violet"
          >
            <span className="font-mono text-lg font-bold text-neon-violet">FINAL SCREEN</span>
            <h2 className="mt-4 text-3xl font-bold">Humans vs Nash</h2>
            <p className="mt-3 flex-1 text-lg text-slate-300">What the class did against what theory predicted, game by game — with the payoff gap.</p>
            <div className="mt-5 flex items-center justify-between">
              <span className="text-lg font-semibold">
                See results <span className="inline-block transition group-hover:translate-x-1">→</span>
              </span>
              <span className="chip">
                {played}/{GAMES.length} played
              </span>
            </div>
          </Link>
        </motion.div>
      </section>

      <footer className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-base text-slate-400">
        <span>
          <span className="kbd">→</span> / <span className="kbd">Space</span> next step
        </span>
        <span>
          <span className="kbd">←</span> back
        </span>
        <span>
          <span className="kbd">R</span> reset game
        </span>
        <span>
          <span className="kbd">F</span> fullscreen
        </span>
        <span>
          <span className="kbd">P</span> Presenter Mode
        </span>
      </footer>
    </div>
  );
}

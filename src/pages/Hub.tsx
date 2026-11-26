import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../games/meta';
import { beatNashFor, clearAllResults, pointsFor, usePredictions, useResults } from '../state/results';
import { usePresenter, toggleFullscreen } from '../state/presenter';
import { ArcadeCabinet } from './hub/ArcadeCabinet';
import { BackgroundFx, NeonOpen, StringLights } from './hub/Decor';

/** The sixth machine: a high-score board for Humans vs Nash. */
function HighScores({ played, total, rows }: { played: number; total: number; rows: { n: number; title: string; pts: number | null; beat: boolean }[] }) {
  return (
    <Link
      to="/results"
      aria-label={`Humans vs Nash: ${played} of ${GAMES.length} games played, ${total} points`}
      className="group block select-none focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
    >
      <div className="border-4 border-black bg-[#ff4fd8] px-2 py-2 text-center shadow-hard halftone">
        <div className="min-h-[2.5em] font-pixel text-xs leading-tight text-[#1a0b3a]">HIGH SCORES</div>
        <div className="mt-1 font-pixel text-[8px] text-[#1a0b3a]">HUMANS VS NASH</div>
      </div>
      <div className="border-4 border-t-0 border-black bg-[#1a0b3a] px-3 pb-3 pt-3 shadow-hard">
        <div className="border-4 border-black bg-black p-2">
          <ol className="space-y-1">
            {rows.map((r) => (
              <li key={r.n} className="flex items-baseline justify-between gap-2">
                <span className="font-pixel text-[8px] text-ink-3">G{r.n}</span>
                <span className={`font-mono text-2xl leading-none ${r.pts === null ? 'text-ink-3' : 'text-gold'}`}>{r.pts === null ? '---' : r.pts.toLocaleString('en-IN')}</span>
                <span className="w-3 text-center text-gold">{r.beat ? '★' : ''}</span>
              </li>
            ))}
          </ol>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-center">
          <div className="border-4 border-black bg-deep p-1">
            <div className="font-pixel text-[8px] text-ink-3">PLAYED</div>
            <div className="font-mono text-3xl leading-none">
              {played}/{GAMES.length}
            </div>
          </div>
          <div className="border-4 border-black bg-deep p-1">
            <div className="font-pixel text-[8px] text-ink-3">POINTS</div>
            <div className="font-mono text-3xl leading-none text-gold">{total.toLocaleString('en-IN')}</div>
          </div>
        </div>
        <div className="mt-3 border-4 border-black bg-gold py-1 text-center font-pixel text-[8px] text-black group-hover:bg-[#ffd76e]">SEE RESULTS ▶</div>
      </div>
    </Link>
  );
}

export default function Hub() {
  const results = useResults();
  const preds = usePredictions();
  const { togglePresenter } = usePresenter();
  const played = GAMES.filter((g) => results[g.id]).length;
  const rows = GAMES.map((g) => ({ n: g.number, title: g.title, pts: pointsFor(g.id, results, preds), beat: beatNashFor(results[g.id]) }));
  const total = rows.reduce((s, r) => s + (r.pts ?? 0), 0);

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
    <div className="relative min-h-screen overflow-x-hidden">
      <BackgroundFx />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-6xl">
            {/* Each line carries its own cyan-to-magenta fill. */}
            <span className="arcade-title inline-block">GAME THEORY</span>
            <br />
            <span className="arcade-title inline-block">ARCADE</span>
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-2xl text-ink-2">Five games. The class plays each one live, then Nash reveals what “rational” would have done.</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link to={GAMES[0].path} className="btn-primary">
              PRESS START ▶
            </Link>
            <button
              className="btn-ghost"
              onClick={() => {
                if (window.confirm('Start a new session? This clears every game result, prediction and point in this tab.')) clearAllResults();
              }}
            >
              ↺ NEW SESSION
            </button>
            <button className="btn-text" onClick={toggleFullscreen}>
              FULLSCREEN [F]
            </button>
          </div>
        </header>

        {/* The arcade floor: wall with string lights and a neon sign, six machines, a checkered floor. */}
        <section className="relative mt-16 overflow-hidden border-4 border-black bg-[#2b1d63] shadow-hard" aria-label="Choose a game">
          <StringLights />
          <div className="absolute right-6 top-16 hidden sm:block">
            <NeonOpen />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden" aria-hidden>
            <div className="checker-floor absolute -inset-x-1/4 top-0 h-[200%]" />
          </div>
          <div className="relative px-4 pb-8 pt-24 sm:px-6">
            <h2 className="mb-6 text-sm text-ink-2">CHOOSE A GAME</h2>
            <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
              {GAMES.map((g) => {
                const r = results[g.id];
                const pts = pointsFor(g.id, results, preds);
                return (
                  <div key={g.id} className="w-[200px] shrink-0 snap-start lg:w-auto">
                    <ArcadeCabinet
                      only={g.id}
                      badge={
                        r ? (
                          <span className="chip bg-teal text-black">
                            PLAYED · {(pts ?? 0).toLocaleString('en-IN')}
                            {beatNashFor(r) ? ' ★' : ''}
                          </span>
                        ) : null
                      }
                    />
                    <p className="mt-3 text-center text-base text-ink-2">{g.concept}</p>
                  </div>
                );
              })}
              <div className="w-[200px] shrink-0 snap-start lg:w-auto">
                <HighScores played={played} total={total} rows={rows} />
                <p className="mt-3 text-center text-base text-ink-2">The closing screen</p>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-lg text-ink-3">
          <span>
            <span className="kbd">→</span> / <span className="kbd">SPACE</span> / <span className="kbd">PGDN</span> next step
          </span>
          <span>
            <span className="kbd">←</span> / <span className="kbd">PGUP</span> back
          </span>
          <span>
            <span className="kbd">R</span> reset game
          </span>
          <span>
            <span className="kbd">F</span> fullscreen
          </span>
          <span>
            <span className="kbd">P</span> presenter mode
          </span>
        </footer>
      </div>
    </div>
  );
}

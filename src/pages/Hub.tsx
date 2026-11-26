import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../games/meta';
import { beatNashFor, clearAllResults, pointsFor, usePredictions, useResults } from '../state/results';
import { usePresenter, toggleFullscreen } from '../state/presenter';
import { ArcadeCabinet, PAINT } from './hub/ArcadeCabinet';
import { Cabinet3D } from './hub/Cabinet3D';
import { FitWidth } from '../components/FitWidth';
import { BackgroundFx, DicePoster, NeonOpen, StringLights } from './hub/Decor';

/** The sixth machine: a claw machine whose glass case holds the Humans vs Nash high scores. */
function HighScores({ played, total, rows }: { played: number; total: number; rows: { n: number; title: string; pts: number | null; beat: boolean }[] }) {
  return (
    <Link
      to="/results"
      aria-label={`Humans vs Nash: ${played} of ${GAMES.length} games played, ${total} points`}
      className="group relative block select-none focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
    >
      <FitWidth grow>
      <div className="relative leading-tight" style={{ width: 200, height: 452 }}>
      <svg className="absolute left-0 top-0" width="200" height="400" viewBox="0 0 200 400" aria-hidden>
        <ellipse cx="100" cy="396" rx="94" ry="6" fill="#0f0d22" opacity="0.45" />
        {/* cabinet shell */}
        <rect x="6" y="6" width="188" height="388" rx="16" fill="#0f0d22" />
        <rect x="10" y="10" width="180" height="380" rx="13" fill="#a32a8a" />
        {/* lit header */}
        <rect x="16" y="16" width="168" height="44" rx="9" fill="#0f0d22" />
        <rect x="19" y="19" width="162" height="38" rx="7" fill="#ff4fd8" />
        {/* glass case */}
        <rect x="16" y="66" width="168" height="196" rx="8" fill="#0f0d22" />
        <rect x="20" y="70" width="160" height="188" rx="6" fill="#1a0b3a" />
        <path d="M30 76 L60 76 L36 250 L24 250 Z" fill="#ffffff" opacity="0.07" />
        {/* claw rail and claw */}
        <rect x="24" y="74" width="152" height="4" fill="#6b62a8" />
        <rect x="139" y="78" width="2" height="18" fill="#a39bc9" />
        <path d="M132 96 L148 96 L146 100 L134 100 Z" fill="#a39bc9" />
        <path d="M134 100 L128 112 L131 113 L137 102 Z M146 100 L152 112 L149 113 L143 102 Z" fill="#d4cdee" />
        {/* control ledge with joystick and button */}
        <path d="M10 266 L190 266 L190 292 L10 292 Z" fill="#0f0d22" />
        <path d="M14 269 L186 269 L186 289 L14 289 Z" fill="#ffb3ef" />
        <circle cx="46" cy="276" r="5" fill="#ef5a4b" stroke="#0f0d22" strokeWidth="2" />
        <rect x="45" y="280" width="2" height="7" fill="#0f0d22" />
        <ellipse cx="150" cy="279" rx="9" ry="5" fill="#ffcc4d" stroke="#0f0d22" strokeWidth="2" />
        {/* prize chute and lower body */}
        <rect x="26" y="304" width="52" height="44" rx="5" fill="#0f0d22" />
        <rect x="30" y="308" width="44" height="36" rx="3" fill="#2b2659" />
        <rect x="104" y="304" width="70" height="70" rx="6" fill="#0f0d22" opacity="0.35" />
        <path d="M10 374 L190 374 L190 382 Q190 390 182 390 L18 390 Q10 390 10 382 Z" fill="#0f0d22" opacity="0.55" />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center" style={{ left: 19, top: 19, width: 162, height: 38 }}>
        <span className="font-pixel text-[#1a0b3a]" style={{ fontSize: 10 }}>
          HIGH SCORES
        </span>
        <span className="mt-1 font-pixel text-[#1a0b3a]" style={{ fontSize: 6 }}>
          HUMANS VS NASH
        </span>
      </div>
      {/* the "prizes" in the glass: one line per game */}
      <ol className="absolute" style={{ left: 32, top: 122, width: 136 }}>
        {rows.map((r) => (
          <li key={r.n} className="flex items-baseline justify-between" style={{ height: 24 }}>
            <span className="font-pixel text-ink-3" style={{ fontSize: 6 }}>
              GAME {r.n}
            </span>
            <span className={`font-mono leading-none ${r.pts === null ? 'text-ink-3' : 'text-gold'}`} style={{ fontSize: 18 }}>
              {r.pts === null ? '---' : r.pts.toLocaleString('en-IN')}
              <span className="inline-block w-3 text-center text-gold" style={{ fontSize: 10 }}>
                {r.beat ? '★' : ''}
              </span>
            </span>
          </li>
        ))}
      </ol>
      <div className="absolute flex flex-col items-center justify-center" style={{ left: 30, top: 308, width: 44, height: 36 }}>
        <span className="font-pixel text-gold group-hover:text-cream" style={{ fontSize: 6 }}>
          SEE
        </span>
        <span className="font-pixel text-gold group-hover:text-cream" style={{ fontSize: 6 }}>
          RESULTS
        </span>
        <span className="font-pixel text-gold group-hover:text-cream" style={{ fontSize: 6 }}>
          ▶
        </span>
      </div>
      <div className="absolute flex flex-col items-center text-center" style={{ left: 104, top: 308, width: 70 }}>
        <span className="font-pixel text-ink-2" style={{ fontSize: 5 }}>
          PLAYED
        </span>
        <span className="font-mono leading-none" style={{ fontSize: 18 }}>
          {played}/{GAMES.length}
        </span>
        <span className="mt-1 font-pixel text-ink-2" style={{ fontSize: 5 }}>
          POINTS
        </span>
        <span className="font-mono leading-none text-gold" style={{ fontSize: 18 }}>
          {total.toLocaleString('en-IN')}
        </span>
      </div>
      </div>
      </FitWidth>
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
          <div className="absolute left-1/2 top-12 hidden -translate-x-1/2 sm:block">
            <NeonOpen />
          </div>
          <div className="absolute left-[30%] top-16 hidden rotate-[-8deg] lg:block">
            <DicePoster />
          </div>
          <div className="absolute right-[24%] top-14 hidden rotate-[6deg] lg:block">
            <DicePoster flip />
          </div>
          <div className="absolute inset-x-0 bottom-0 h-40 overflow-hidden" aria-hidden>
            <div className="checker-floor absolute -inset-x-1/4 top-0 h-[200%]" />
          </div>
          <div className="relative px-4 pb-8 pt-24 sm:px-6 lg:px-12">
            <h2 className="mb-6 text-sm text-ink-2">CHOOSE A GAME</h2>
            <div className="arcade-row flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-6 lg:overflow-visible lg:pb-0">
              {GAMES.map((g, i) => {
                const r = results[g.id];
                const pts = pointsFor(g.id, results, preds);
                return (
                  <div key={g.id} className="w-[200px] shrink-0 snap-start lg:w-auto">
                    <Cabinet3D k={i - GAMES.length / 2} paint={PAINT[g.id]}>
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
                    </Cabinet3D>
                    <p className="mt-3 text-center text-base text-ink-2">{g.concept}</p>
                  </div>
                );
              })}
              <div className="w-[200px] shrink-0 snap-start lg:w-auto">
                <Cabinet3D k={GAMES.length / 2} paint={{ side: '#a32a8a', trim: '#ffb3ef', body: '#ff4fd8' }}>
                  <HighScores played={played} total={total} rows={rows} />
                </Cabinet3D>
                <p className="mt-3 text-center text-base text-ink-2">Humans vs Nash: the closing screen</p>
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

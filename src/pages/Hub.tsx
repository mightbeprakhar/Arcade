import { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { GAMES } from '../games/meta';
import { useResults, type GameId } from '../state/results';
import { usePresenter, toggleFullscreen } from '../state/presenter';
import { Sprite } from '../components/pixel/Sprite';
import { C, chickenThumb, face, icons } from '../components/pixel/sprites';
import { Bubble } from '../components/comic';

const THUMBS: Record<GameId, { map: string[]; pal: Record<string, string> }> = {
  ultimatum: icons.coins,
  chicken: chickenThumb,
  advertising: icons.cup,
  attrition: icons.bin,
  startup: icons.rocket,
};

/** Static pixel starfield (deterministic, no animation). */
function Stars() {
  const stars = useMemo(() => Array.from({ length: 80 }, (_, i) => ({ x: (i * 197) % 1440, y: (i * 89) % 900, s: i % 5 ? 3 : 6, o: 0.2 + (i % 4) * 0.15 })), []);
  return (
    <svg className="pixel pointer-events-none fixed inset-0 h-full w-full" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {stars.map((s, i) => (
        <rect key={i} x={s.x} y={s.y} width={s.s} height={s.s} fill="#fff4dc" opacity={s.o} />
      ))}
    </svg>
  );
}

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

  const a = face('grim', C.brown);
  const b = face('smug', C.K);

  return (
    <div className="relative min-h-screen">
      <Stars />
      <div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-8">
        <header className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <h1 className="text-4xl leading-tight text-gold sm:text-5xl" style={{ textShadow: '6px 6px 0 #0f0d22' }}>
              GAME THEORY
              <br />
              <span className="text-ink">ARCADE</span>
            </h1>
            <p className="mt-6 max-w-xl text-2xl text-ink-2">Five games. The class plays each one live, then Nash reveals what “rational” would have done.</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link to={GAMES[0].path} className="btn-primary">
                PRESS START ▶
              </Link>
              <button className={presenter ? 'btn-primary' : 'btn-ghost'} onClick={togglePresenter} aria-pressed={presenter}>
                PRESENTER {presenter ? 'ON' : 'OFF'}
              </button>
              <button className="btn-text" onClick={toggleFullscreen}>
                FULLSCREEN [F]
              </button>
            </div>
          </div>

          {/* Product moment: a pixel comic panel straight out of Level 2. */}
          <Link to="/chicken" className="group block focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold" aria-label="Preview of Level 2, Game of Chicken">
            <div className="relative border-4 border-black bg-[#241f52] shadow-hard halftone-light">
              <div className="grid grid-cols-2">
                <div className="flex flex-col items-start gap-6 border-r-4 border-black p-6">
                  <Bubble side="bottom-left">I’m not swerving.</Bubble>
                  <Sprite {...a} px={9} title="Driver A, determined" />
                </div>
                <div className="flex flex-col items-end gap-6 p-6">
                  <Bubble side="bottom-right">Neither am I.</Bubble>
                  <Sprite {...b} px={9} flip title="Driver B, smug" />
                </div>
              </div>
              <div className="border-t-4 border-black bg-gold px-4 py-2 text-lg text-black">
                <span className="font-pixel text-xs">LVL 2 · CHICKEN</span> · Who blinks first? The class decides. ▶
              </div>
            </div>
          </Link>
        </header>

        <section className="mt-16" aria-label="Level select">
          <h2 className="mb-6 text-sm text-ink-3">SELECT LEVEL</h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {GAMES.map((g) => {
              const done = !!results[g.id];
              const t = THUMBS[g.id];
              return (
                <Link
                  key={g.id}
                  to={g.path}
                  className="group flex flex-col border-4 border-black bg-panel shadow-hard transition-transform duration-100 ease-out hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold active:translate-x-1 active:translate-y-1"
                >
                  <div className="flex h-32 items-center justify-center border-b-4 border-black bg-deep halftone-light">
                    <Sprite map={t.map} pal={t.pal} px={g.id === 'chicken' ? 9 : 8} title={`${g.title} icon`} />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-pixel text-xs text-gold">LEVEL {g.number}</span>
                      {done && <span className="chip bg-teal text-black">CLEARED</span>}
                    </div>
                    <div className="mt-3 text-3xl font-bold">{g.title}</div>
                    <div className="mt-1 text-lg text-teal">{g.concept}</div>
                    <p className="mt-3 flex-1 text-xl text-ink-2">{g.hook}</p>
                    <span className="mt-4 font-pixel text-xs text-ink group-hover:text-gold">PLAY ▶</span>
                  </div>
                </Link>
              );
            })}
            <Link
              to="/results"
              className="group flex flex-col border-4 border-black bg-gold text-black shadow-hard transition-transform duration-100 ease-out hover:-translate-x-1 hover:-translate-y-1 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-ink halftone"
            >
              <div className="flex h-32 items-center justify-center border-b-4 border-black">
                <span className="font-pixel text-4xl" style={{ textShadow: '4px 4px 0 #fff4dc' }}>
                  VS
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <span className="font-pixel text-xs">FINAL SCREEN</span>
                <div className="mt-3 text-3xl font-bold">Humans vs Nash</div>
                <p className="mt-3 flex-1 text-xl">What the class did against what theory predicted, with the payoff gap.</p>
                <span className="mt-4 font-pixel text-xs">
                  {played}/{GAMES.length} CLEARED ▶
                </span>
              </div>
            </Link>
          </div>
        </section>

        <footer className="mt-12 flex flex-wrap gap-x-6 gap-y-2 text-lg text-ink-3">
          <span>
            <span className="kbd">→</span> / <span className="kbd">SPACE</span> next step
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
            <span className="kbd">P</span> presenter mode
          </span>
        </footer>
      </div>
    </div>
  );
}

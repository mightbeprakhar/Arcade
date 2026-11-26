import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../../games/meta';
import type { GameId } from '../../state/results';
import { FitWidth } from '../../components/FitWidth';
import { BridgeScene, type ScenePhase } from '../../games/chicken/BridgeScene';
import { PixelShop } from '../../games/advertising/Shop';
import { Sprite } from '../../components/pixel/Sprite';
import { C, garage, icons, tower, trashBag } from '../../components/pixel/sprites';
import { T } from '../../components/motion';

const FRAME_MS = 3000;

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setReduced(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return reduced;
}

/** Runs `step` every `ms` while `active`. Used for the small in-frame animations. */
function useTicker(active: boolean, ms: number, max: number) {
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setN((x) => Math.min(max, x + 1)), ms);
    return () => clearInterval(id);
  }, [active, ms, max]);
  return n;
}

function Frame({ number, caption, children }: { number?: number; caption: string; children: ReactNode }) {
  return (
    <motion.div className="absolute inset-0 flex flex-col" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={T}>
      {number && <span className="chip absolute left-2 top-2 z-10 bg-gold text-black">GAME {number}</span>}
      <div className="flex flex-1 items-center justify-center overflow-hidden px-3 pt-8">{children}</div>
      <div className="pb-3 text-center font-pixel text-xs text-gold sm:text-sm" style={{ textShadow: '2px 2px 0 #0f0d22' }}>
        {caption}
      </div>
    </motion.div>
  );
}

function CoinsFrame() {
  return (
    <Frame number={1} caption="TAKE IT OR LEAVE IT">
      <div className="text-center">
        <div className="flex items-end justify-center gap-1">
          <Sprite {...icons.coins} px={5} />
          <Sprite {...icons.coins} px={7} />
          <Sprite {...icons.coins} px={5} />
        </div>
        <div className="mt-2 font-mono text-5xl leading-none text-gold">₹10,000</div>
      </div>
    </Frame>
  );
}

function BridgeFrame({ animate }: { animate: boolean }) {
  const [phase, setPhase] = useState<ScenePhase>(animate ? 'idle' : 'approach');
  useEffect(() => {
    if (!animate) return;
    const t = setTimeout(() => setPhase('approach'), 150);
    return () => clearTimeout(t);
  }, [animate]);
  return (
    <Frame number={2} caption="WHO BLINKS FIRST?">
      <div className="w-full border-2 border-black">
        <BridgeScene phase={phase} a={null} b={null} truck={false} />
      </div>
    </Frame>
  );
}

function ShopsFrame({ animate }: { animate: boolean }) {
  const t = useTicker(animate, 900, 2);
  const step = animate ? t : 2;
  return (
    <Frame number={3} caption="AD OR SAVE?">
      <div className="flex items-end gap-4">
        <PixelShop name="Brew Theory" color={C.blue} ad={step >= 1} px={2} />
        <PixelShop name="Bean There" color={C.red} ad={step >= 2} px={2} />
      </div>
    </Frame>
  );
}

function BinFrame({ animate }: { animate: boolean }) {
  const t = useTicker(animate, 450, 6);
  const minute = animate ? t : 6;
  return (
    <Frame number={4} caption="WHO CRACKS FIRST?">
      <div className="flex items-end gap-4">
        <div className="flex flex-col items-center">
          <div className="flex w-28 flex-wrap-reverse justify-center gap-1">
            {Array.from({ length: Math.max(1, minute) }, (_, i) => (
              <Sprite key={i} {...trashBag} px={3} />
            ))}
          </div>
          <Sprite {...icons.bin} px={5} />
        </div>
        <div className="border-4 border-black bg-deep px-3 py-1 text-center">
          <div className="font-pixel text-xs text-ink-3">MIN</div>
          <div className="font-mono text-5xl leading-none text-gold">{String(minute).padStart(2, '0')}</div>
        </div>
      </div>
    </Frame>
  );
}

function MarketFrame({ animate }: { animate: boolean }) {
  return (
    <Frame number={5} caption="ENTER OR STAY OUT?">
      <div className="flex items-end gap-3">
        <Sprite {...garage} px={5} />
        <motion.div initial={animate ? { x: -24, y: 8 } : false} animate={{ x: 24, y: -8 }} transition={{ duration: 2.4, ease: 'easeInOut' }}>
          <Sprite {...icons.rocket} px={4} />
        </motion.div>
        <Sprite {...tower} px={6} />
      </div>
    </Frame>
  );
}

function StartFrame({ animate }: { animate: boolean }) {
  const t = useTicker(animate, 500, 5);
  const show = !animate || t % 2 === 0;
  return (
    <Frame caption="">
      <div className="text-center">
        <div className="font-pixel text-xl text-ink sm:text-2xl" style={{ textShadow: '3px 3px 0 #0f0d22' }}>
          HUMANS VS NASH
        </div>
        <div className={`mt-6 font-pixel text-base text-gold sm:text-lg ${show ? '' : 'invisible'}`}>PRESS START</div>
      </div>
    </Frame>
  );
}

/** Cabinet paint per game: body, side panels (darker), trim (lighter). */
const PAINT: Record<GameId, { body: string; side: string; trim: string; marquee: string }> = {
  ultimatum: { body: '#c04dff', side: '#7a2aa8', trim: '#e3a6ff', marquee: '#ffcc4d' },
  chicken: { body: '#ef5a4b', side: '#9c2f25', trim: '#ffa99f', marquee: '#fff4dc' },
  advertising: { body: '#5aa7ff', side: '#2f62a8', trim: '#b5d8ff', marquee: '#ffcc4d' },
  attrition: { body: '#47c9a8', side: '#237a64', trim: '#a8f0dc', marquee: '#fff4dc' },
  startup: { body: '#ff4fd8', side: '#a32a8a', trim: '#ffb3ef', marquee: '#ffcc4d' },
};

/** Bar stool in front of a cabinet. */
function Stool({ seat }: { seat: string }) {
  return (
    <svg className="pixel mx-auto block" width="88" height="60" viewBox="0 0 16 11" aria-hidden>
      <rect x="1" y="0" width="14" height="3" fill="#0f0d22" />
      <rect x="2" y="0" width="12" height="2" fill={seat} />
      <rect x="2" y="0" width="12" height="1" fill="#ffffff" opacity="0.25" />
      <rect x="7" y="3" width="2" height="6" fill="#0f0d22" />
      <rect x="4" y="9" width="8" height="2" fill="#0f0d22" />
      <rect x="5" y="9" width="6" height="1" fill="#6b62a8" />
    </svg>
  );
}

/**
 * A pixel arcade cabinet for the arcade floor. With `only`, it carries that game's name on the
 * lit marquee and loops just that game's teaser; without it, the screen runs the full attract mode.
 * Clicking the screen opens the game shown. Hover pauses; reduced motion shows one static frame.
 */
export function ArcadeCabinet({ only, badge }: { only?: GameId; badge?: ReactNode }) {
  const reduced = usePrefersReducedMotion();
  const single = only ? GAMES.find((g) => g.id === only)! : null;
  const frames = single ? 1 : GAMES.length + 1;
  const [idx, setIdx] = useState(reduced && !single ? GAMES.length : 0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const animate = !reduced;

  useEffect(() => {
    if (reduced && !single) setIdx(GAMES.length);
  }, [reduced, single]);
  useEffect(() => {
    if (reduced || paused) return;
    const id = setTimeout(() => {
      setIdx((i) => (i + 1) % frames);
      setCycle((c) => c + 1); // remounts the frame so a single game's teaser replays
    }, FRAME_MS);
    return () => clearTimeout(id);
  }, [idx, cycle, paused, reduced, frames]);

  const game = single ?? (idx < GAMES.length ? GAMES[idx] : null);
  const to = game ? game.path : GAMES[0].path;
  const label = game ? `Open game ${game.number}: ${game.title}` : `Press start: open game 1, ${GAMES[0].title}`;
  const byId = {
    ultimatum: <CoinsFrame key={`u${cycle}`} />,
    chicken: <BridgeFrame key={`c${cycle}`} animate={animate} />,
    advertising: <ShopsFrame key={`a${cycle}`} animate={animate} />,
    attrition: <BinFrame key={`w${cycle}`} animate={animate} />,
    startup: <MarketFrame key={`s${cycle}`} animate={animate} />,
  } as const;
  const paint = PAINT[single?.id ?? 'ultimatum'];

  return (
    <div className="relative mx-auto w-full select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {badge && <div className="absolute -right-2 top-8 z-20">{badge}</div>}
      <div className="relative">
        {/* hood: dark cap, then the backlit marquee */}
        <div className="h-3 border-4 border-b-0 border-black" style={{ background: paint.side }} />
        <div className="border-x-4 border-black px-2 pb-2" style={{ background: paint.side }}>
          <div className="border-4 border-black px-1 py-2 text-center" style={{ background: '#1a0b3a', boxShadow: `inset 0 0 10px ${paint.body}` }}>
            <div className="min-h-[2.5em] font-pixel text-xs leading-tight" style={{ color: paint.marquee, textShadow: `0 0 6px ${paint.body}, 2px 2px 0 #0f0d22` }}>
              {single ? single.title.toUpperCase() : 'GAME THEORY ARCADE'}
            </div>
          </div>
        </div>
        {/* screen section: front face with side panels as thick borders, recessed bezel, glass glare */}
        <div className="border-x-[10px] border-black" style={{ borderLeftColor: paint.side, borderRightColor: paint.side, outline: '4px solid #0f0d22', background: paint.body }}>
          <div className="px-2 pb-3 pt-2">
            <div className="h-1" style={{ background: paint.trim, opacity: 0.6 }} />
            <div className="mt-2 border-4 border-black bg-black p-1" style={{ boxShadow: `0 0 14px ${paint.trim}66, inset 0 0 0 2px #2b2659` }}>
              <Link
                to={to}
                aria-label={label}
                title={label}
                className="relative block overflow-hidden bg-[#0b0a1c] focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
              >
                <FitWidth>
                  <div className="relative" style={{ width: 320, height: 240 }}>
                    {game ? byId[game.id] : <StartFrame key={`p${cycle}`} animate={animate} />}
                  </div>
                </FitWidth>
                {/* glass glare */}
                <span className="pointer-events-none absolute -left-1/4 -top-1/2 h-[200%] w-1/4 rotate-[25deg] bg-white opacity-[0.07]" aria-hidden />
                {paused && !reduced && <span className="chip absolute right-1 top-1 z-10 text-ink-3">PAUSED</span>}
              </Link>
            </div>
          </div>
        </div>
        {/* control deck juts out past the sides: lighter top face, darker front lip */}
        <div className="relative z-10 -mx-2">
          <div className="flex items-center justify-between gap-2 border-4 border-black px-3 py-2" style={{ background: paint.trim }}>
            <svg className="pixel" width="24" height="28" viewBox="0 0 16 18" aria-label="Joystick" role="img">
              <rect x="2" y="14" width="12" height="4" fill="#0f0d22" />
              <rect x="7" y="6" width="2" height="8" fill="#0f0d22" />
              <rect x="5" y="1" width="6" height="6" fill="#0f0d22" />
              <rect x="6" y="2" width="4" height="4" fill="#ef5a4b" />
              <rect x="6" y="2" width="2" height="1" fill="#fff4dc" />
            </svg>
            <div className="flex items-center gap-2" aria-label="Buttons: cooperate and defect" role="img">
              <span className="block h-5 w-5 rounded-full border-2 border-black bg-teal" style={{ boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3)' }} title="COOPERATE" />
              <span className="block h-5 w-5 rounded-full border-2 border-black bg-red" style={{ boxShadow: 'inset -2px -2px 0 rgba(0,0,0,0.3)' }} title="DEFECT" />
              <span className="block h-3 w-3 rounded-full border-2 border-black bg-gold" />
            </div>
          </div>
          <div className="h-3 border-4 border-t-0 border-black" style={{ background: paint.side }} />
        </div>
        {/* lower cabinet: coin door with two lit slots, vents, kick plate */}
        <div className="border-x-[10px]" style={{ borderLeftColor: paint.side, borderRightColor: paint.side, outline: '4px solid #0f0d22', background: paint.body }}>
          <div className="flex flex-col items-center gap-2 px-3 py-3">
            <div className="w-full border-4 border-black bg-[#1a1838] px-2 py-2">
              <div className="flex justify-center gap-3">
                {[0, 1].map((i) => (
                  <span key={i} className="flex h-6 w-5 items-center justify-center border-2 border-black bg-red">
                    <span className="block h-4 w-1 bg-black" />
                  </span>
                ))}
              </div>
              <div className="mt-1 text-center text-gold">
                <span className="font-pixel text-[8px]">INSERT </span>
                <span className="font-mono text-lg leading-none">₹10</span>
              </div>
            </div>
            <div className="flex w-full flex-col gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="block h-1 w-full bg-black opacity-40" />
              ))}
            </div>
          </div>
          <div className="h-4 bg-black opacity-60" />
        </div>
      </div>
      <div className="mt-2">
        <Stool seat={paint.trim} />
      </div>
    </div>
  );
}

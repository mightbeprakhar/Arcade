import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../games/meta';
import { BridgeScene, type ScenePhase } from '../games/chicken/BridgeScene';
import { PixelShop } from '../games/advertising/Shop';
import { Sprite } from './pixel/Sprite';
import { C, garage, icons, tower, trashBag } from './pixel/sprites';
import { T } from './motion';

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

/**
 * Home-page hero: a pixel arcade cabinet whose screen runs an attract mode, a ~3 s teaser
 * per game and then a "Humans vs Nash · Press start" frame, looping. Clicking the screen
 * opens the game on screen. Hovering pauses it; with reduced motion it shows one static frame.
 */
export function ArcadeCabinet() {
  const reduced = usePrefersReducedMotion();
  const [idx, setIdx] = useState(reduced ? GAMES.length : 0);
  const [cycle, setCycle] = useState(0);
  const [paused, setPaused] = useState(false);
  const frames = GAMES.length + 1;
  const animate = !reduced;

  useEffect(() => {
    if (reduced) setIdx(GAMES.length);
  }, [reduced]);
  useEffect(() => {
    if (reduced || paused) return;
    const id = setTimeout(() => {
      setIdx((i) => (i + 1) % frames);
      setCycle((c) => c + 1);
    }, FRAME_MS);
    return () => clearTimeout(id);
  }, [idx, paused, reduced, frames]);

  const game = idx < GAMES.length ? GAMES[idx] : null;
  const to = game ? game.path : GAMES[0].path;
  const label = game ? `Open game ${game.number}: ${game.title}` : `Press start: open game 1, ${GAMES[0].title}`;
  const byId = {
    ultimatum: <CoinsFrame key={`u${cycle}`} />,
    chicken: <BridgeFrame key={`c${cycle}`} animate={animate} />,
    advertising: <ShopsFrame key={`a${cycle}`} animate={animate} />,
    attrition: <BinFrame key={`w${cycle}`} animate={animate} />,
    startup: <MarketFrame key={`s${cycle}`} animate={animate} />,
  } as const;

  return (
    <div className="mx-auto w-full max-w-[30rem] select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* marquee */}
      <div className="relative border-4 border-black bg-red px-4 py-3 text-center shadow-hard halftone">
        <div className="font-pixel text-base text-gold sm:text-xl" style={{ textShadow: '3px 3px 0 #0f0d22' }}>
          GAME THEORY ARCADE
        </div>
        <div className="mt-2 flex justify-center gap-2" aria-hidden>
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className={`h-2 w-2 border border-black ${i % 2 ? 'bg-cream' : 'bg-gold'}`} />
          ))}
        </div>
      </div>
      {/* cabinet body */}
      <div className="border-4 border-t-0 border-black bg-panel2 px-6 pb-6 pt-6 shadow-hard halftone-light">
        <div className="border-4 border-black bg-black p-3">
          <Link
            to={to}
            aria-label={label}
            title={label}
            className="relative block aspect-[4/3] overflow-hidden border-2 border-[#2b2659] bg-[#0b0a1c] focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
          >
            {game ? byId[game.id] : <StartFrame key={`p${cycle}`} animate={animate} />}
            {paused && !reduced && <span className="chip absolute right-2 top-2 z-10 text-ink-3">PAUSED</span>}
          </Link>
        </div>
        {/* control panel */}
        <div className="mt-6 flex items-end justify-between gap-4 border-4 border-black bg-[#241f52] px-6 py-4">
          <svg className="pixel" width="64" height="72" viewBox="0 0 16 18" aria-label="Joystick" role="img">
            <rect x="2" y="14" width="12" height="4" fill="#0f0d22" />
            <rect x="3" y="13" width="10" height="2" fill="#3a3378" />
            <rect x="7" y="6" width="2" height="8" fill="#a39bc9" />
            <rect x="5" y="1" width="6" height="6" fill="#0f0d22" />
            <rect x="6" y="2" width="4" height="4" fill="#ef5a4b" />
            <rect x="6" y="2" width="2" height="1" fill="#fff4dc" />
          </svg>
          {(
            [
              ['COOPERATE', 'bg-teal'],
              ['DEFECT', 'bg-red'],
            ] as const
          ).map(([l, c]) => (
            <div key={l} className="flex flex-col items-center gap-2">
              <span className={`block h-12 w-12 rounded-full border-4 border-black ${c}`} style={{ boxShadow: 'inset -4px -4px 0 rgba(0,0,0,0.3)' }} aria-hidden />
              <span className="font-pixel text-xs text-ink">{l}</span>
            </div>
          ))}
        </div>
        {/* coin door */}
        <div className="mx-auto mt-6 flex w-52 items-center gap-4 border-4 border-black bg-deep px-4 py-3">
          <span className="block h-10 w-2 border-2 border-gold bg-black" aria-hidden />
          <span className="text-gold">
            <span className="font-pixel text-xs">INSERT </span>
            <span className="font-mono text-3xl leading-none">₹10</span>
          </span>
        </div>
      </div>
    </div>
  );
}

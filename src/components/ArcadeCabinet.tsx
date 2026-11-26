import { useEffect, useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GAMES } from '../games/meta';
import type { GameId } from '../state/results';
import { FitWidth } from './FitWidth';
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
 * A pixel arcade cabinet. With `only`, it shows that game's name on the marquee and loops just
 * that game's teaser; without it, the screen runs the full attract mode (every game, then
 * "Humans vs Nash · Press start"). Clicking the screen opens the game shown. Hover pauses;
 * reduced motion shows one static frame. `size="sm"` is the compact cabinet for the arcade floor.
 */
export function ArcadeCabinet({ only, size = 'lg', badge }: { only?: GameId; size?: 'lg' | 'sm'; badge?: ReactNode }) {
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
  const sm = size === 'sm';

  return (
    <div className={`relative mx-auto w-full select-none ${sm ? '' : 'max-w-[30rem]'}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* marquee */}
      <div className={`relative border-4 border-black bg-red text-center shadow-hard halftone ${sm ? 'px-2 py-2' : 'px-4 py-3'}`}>
        <div className={`font-pixel text-gold ${sm ? 'min-h-[2.5em] text-xs leading-tight' : 'text-base sm:text-xl'}`} style={{ textShadow: `${sm ? 2 : 3}px ${sm ? 2 : 3}px 0 #0f0d22` }}>
          {single ? single.title.toUpperCase() : 'GAME THEORY ARCADE'}
        </div>
        <div className={`flex justify-center ${sm ? 'mt-1 gap-1' : 'mt-2 gap-2'}`} aria-hidden>
          {Array.from({ length: sm ? 8 : 12 }, (_, i) => (
            <span key={i} className={`${sm ? 'h-1 w-1' : 'h-2 w-2'} border border-black ${i % 2 ? 'bg-cream' : 'bg-gold'}`} />
          ))}
        </div>
      </div>
      {/* cabinet body */}
      <div className={`relative border-4 border-t-0 border-black bg-panel2 shadow-hard halftone-light ${sm ? 'px-3 pb-3 pt-3' : 'px-6 pb-6 pt-6'}`}>
        {badge && <div className="absolute -right-2 -top-3 z-10">{badge}</div>}
        <div className={`border-4 border-black bg-black ${sm ? 'p-1' : 'p-3'}`}>
          <Link
            to={to}
            aria-label={label}
            title={label}
            className="relative block overflow-hidden border-2 border-[#2b2659] bg-[#0b0a1c] focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
          >
            {/* Frames are laid out at a fixed 320×240 and scaled to the screen, so they look the same in every cabinet size. */}
            <FitWidth>
              <div className="relative" style={{ width: 320, height: 240 }}>
                {game ? byId[game.id] : <StartFrame key={`p${cycle}`} animate={animate} />}
              </div>
            </FitWidth>
            {paused && !reduced && <span className="chip absolute right-1 top-1 z-10 text-ink-3">PAUSED</span>}
          </Link>
        </div>
        {/* control panel */}
        <div className={`flex items-end justify-between border-4 border-black bg-[#241f52] ${sm ? 'mt-3 gap-2 px-2 py-2' : 'mt-6 gap-4 px-6 py-4'}`}>
          <svg className="pixel" width={sm ? 28 : 64} height={sm ? 32 : 72} viewBox="0 0 16 18" aria-label="Joystick" role="img">
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
            <div key={l} className={`flex flex-col items-center ${sm ? 'gap-1' : 'gap-2'}`}>
              <span className={`block rounded-full border-black ${sm ? 'h-6 w-6 border-2' : 'h-12 w-12 border-4'} ${c}`} style={{ boxShadow: 'inset -3px -3px 0 rgba(0,0,0,0.3)' }} aria-hidden />
              <span className={`font-pixel text-ink ${sm ? 'text-[7px]' : 'text-xs'}`}>{l}</span>
            </div>
          ))}
        </div>
        {/* coin door */}
        <div className={`mx-auto flex items-center border-4 border-black bg-deep ${sm ? 'mt-3 w-full justify-center gap-2 px-2 py-1' : 'mt-6 w-52 gap-4 px-4 py-3'}`}>
          <span className={`block border-2 border-gold bg-black ${sm ? 'h-5 w-1' : 'h-10 w-2'}`} aria-hidden />
          <span className="text-gold">
            <span className={`font-pixel ${sm ? 'text-[8px]' : 'text-xs'}`}>INSERT </span>
            <span className={`font-mono leading-none ${sm ? 'text-xl' : 'text-3xl'}`}>₹10</span>
          </span>
        </div>
      </div>
    </div>
  );
}

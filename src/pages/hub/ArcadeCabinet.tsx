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

/** Round-seat bar stool in front of a cabinet. */
function Stool({ seat, side }: { seat: string; side: string }) {
  return (
    <svg className="mx-auto block w-[46%]" viewBox="0 0 80 64" aria-hidden>
      <ellipse cx="40" cy="60" rx="22" ry="4" fill="#0f0d22" opacity="0.35" />
      <rect x="37" y="16" width="6" height="40" fill="#0f0d22" />
      <rect x="38" y="16" width="2" height="40" fill="#6b62a8" />
      <ellipse cx="40" cy="58" rx="16" ry="4" fill="#0f0d22" />
      <ellipse cx="40" cy="57" rx="14" ry="3" fill="#4b4278" />
      <ellipse cx="40" cy="14" rx="30" ry="10" fill="#0f0d22" />
      <ellipse cx="40" cy="12" rx="28" ry="8" fill={side} />
      <ellipse cx="40" cy="10" rx="26" ry="6" fill={seat} />
      <ellipse cx="33" cy="8" rx="10" ry="2" fill="#ffffff" opacity="0.35" />
    </svg>
  );
}

/*
 * Cabinet silhouette, drawn in a 200 × 400 box, front view with the side panels showing:
 * the panels curve in around the recessed screen and out again at the control deck.
 * The HTML screen and marquee sit on top at matching percentage positions.
 */
const SIDE_PATH =
  'M18 22 Q18 8 32 8 L168 8 Q182 8 182 22 L182 70 Q182 82 172 92 L170 196 Q192 204 194 222 L194 246 Q194 252 186 256 L180 392 L20 392 L14 256 Q6 252 6 246 L6 222 Q8 204 30 196 L28 92 Q18 82 18 70 Z';
const SCREEN = { x: 44, y: 98, w: 112, h: 84 }; // 4:3 to match the 320 × 240 teaser

function CabinetArt({ p }: { p: { body: string; side: string; trim: string; marquee: string } }) {
  return (
    <svg className="block h-auto w-full" viewBox="0 0 200 400" aria-hidden>
      {/* floor shadow */}
      <ellipse cx="100" cy="396" rx="92" ry="6" fill="#0f0d22" opacity="0.45" />
      {/* side panels (outline + darker paint) */}
      <path d={SIDE_PATH} fill="#0f0d22" />
      <path d={SIDE_PATH} fill={p.side} transform="translate(100 200) scale(0.97 0.985) translate(-100 -200)" />
      {/* front face: hood + marquee box */}
      <rect x="26" y="14" width="148" height="58" rx="12" fill="#0f0d22" />
      <rect x="30" y="18" width="140" height="50" rx="9" fill="#1a0b3a" />
      <rect x="34" y="22" width="132" height="42" rx="7" fill={p.body} opacity="0.35" />
      {/* screen hood: curved bezel */}
      <path d="M34 80 Q34 76 38 76 L162 76 Q166 76 166 80 L164 196 L36 196 Z" fill="#0f0d22" />
      <path d="M38 82 L162 82 L160 192 L40 192 Z" fill={p.body} />
      <rect x={SCREEN.x - 6} y={SCREEN.y - 8} width={SCREEN.w + 12} height={SCREEN.h + 14} rx="8" fill="#0f0d22" />
      <rect x={SCREEN.x - 3} y={SCREEN.y - 5} width={SCREEN.w + 6} height={SCREEN.h + 8} rx="6" fill="#2b2659" />
      {/* control deck: sloped top face, then a front lip */}
      <path d="M22 200 L178 200 L192 226 L8 226 Z" fill="#0f0d22" />
      <path d="M26 203 L174 203 L186 223 L14 223 Z" fill={p.trim} />
      <path d="M8 226 L192 226 L192 244 Q192 248 188 248 L12 248 Q8 248 8 244 Z" fill="#0f0d22" />
      <path d="M12 229 L188 229 L188 243 L12 243 Z" fill={p.side} />
      {/* joystick */}
      <ellipse cx="52" cy="216" rx="10" ry="3.5" fill="#0f0d22" />
      <rect x="50" y="203" width="4" height="13" fill="#0f0d22" />
      <circle cx="52" cy="203" r="6" fill="#0f0d22" />
      <circle cx="52" cy="203" r="4.5" fill="#ef5a4b" />
      <circle cx="50.5" cy="201.5" r="1.5" fill="#fff4dc" />
      {/* buttons: cooperate (teal), defect (red), start (gold) */}
      {[
        [104, '#47c9a8'],
        [124, '#ef5a4b'],
        [144, '#ffcc4d'],
      ].map(([x, c]) => (
        <g key={x as number}>
          <ellipse cx={x as number} cy="215" rx="7" ry="4" fill="#0f0d22" />
          <ellipse cx={x as number} cy="213.5" rx="5.5" ry="3" fill={c as string} />
          <ellipse cx={(x as number) - 1.5} cy="212.5" rx="2" ry="0.8" fill="#ffffff" opacity="0.5" />
        </g>
      ))}
      {/* lower body */}
      <path d="M22 250 L178 250 L176 388 L24 388 Z" fill="#0f0d22" />
      <path d="M26 252 L174 252 L172 384 L28 384 Z" fill={p.body} />
      <path d="M26 252 L44 252 L44 384 L28 384 Z" fill="#ffffff" opacity="0.08" />
      {/* coin door */}
      <rect x="66" y="270" width="68" height="66" rx="6" fill="#0f0d22" />
      <rect x="70" y="274" width="60" height="58" rx="4" fill="#1a1838" />
      {[84, 106].map((x) => (
        <g key={x}>
          <rect x={x} y="282" width="10" height="16" rx="2" fill="#0f0d22" />
          <rect x={x + 1.5} y="283.5" width="7" height="13" rx="1.5" fill="#ef5a4b" />
          <rect x={x + 4} y="285" width="2" height="10" fill="#0f0d22" />
        </g>
      ))}
      {/* speaker vents and kick plate */}
      {[348, 354, 360].map((y) => (
        <rect key={y} x="54" y={y} width="92" height="2.5" rx="1" fill="#0f0d22" opacity="0.45" />
      ))}
      <path d="M24 370 L176 370 L176 388 L24 388 Z" fill="#0f0d22" opacity="0.55" />
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
  const title = single ? single.title.toUpperCase() : 'GAME THEORY ARCADE';

  return (
    <div className="relative mx-auto w-full select-none" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {badge && <div className="absolute -right-1 top-[19%] z-20">{badge}</div>}
      {/* The machine is composed at a fixed 200 × 452 px and scaled as one piece, so text never drifts off the art. */}
      <FitWidth grow>
        <div className="relative leading-tight" style={{ width: 200, height: 452 }}>
          <div className="absolute left-0 top-0" style={{ width: 200, height: 400 }}>
            <CabinetArt p={paint} />
          </div>
          {/* lit marquee text */}
          <div className="absolute flex items-center justify-center px-1 text-center" style={{ left: 34, top: 22, width: 132, height: 42 }}>
            <span className="font-pixel leading-tight" style={{ fontSize: title.length > 14 ? 8 : 9, color: paint.marquee, textShadow: `0 0 6px ${paint.body}, 1px 1px 0 #0f0d22` }}>
              {title}
            </span>
          </div>
          {/* coin door label */}
          <div className="absolute whitespace-nowrap text-center text-gold" style={{ left: 66, top: 304, width: 68 }}>
            <span className="font-pixel" style={{ fontSize: 5 }}>
              INSERT{' '}
            </span>
            <span className="font-mono leading-none" style={{ fontSize: 14 }}>
              ₹10
            </span>
          </div>
          {/* the screen */}
          <Link
            to={to}
            aria-label={label}
            title={label}
            className="absolute block overflow-hidden rounded-md bg-[#0b0a1c] focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold"
            style={{ left: SCREEN.x, top: SCREEN.y, width: SCREEN.w, height: SCREEN.h, boxShadow: `0 0 14px ${paint.trim}55` }}
          >
            <div className="origin-top-left" style={{ width: 320, height: 240, transform: `scale(${SCREEN.w / 320})` }}>
              <div className="relative" style={{ width: 320, height: 240 }}>
                {game ? byId[game.id] : <StartFrame key={`p${cycle}`} animate={animate} />}
              </div>
            </div>
            <span className="pointer-events-none absolute -left-1/4 -top-1/2 h-[200%] w-1/4 rotate-[25deg] bg-white opacity-[0.08]" aria-hidden />
            {paused && !reduced && (
              <span className="absolute right-1 top-1 z-10 border border-black bg-deep px-1 font-pixel text-ink-3" style={{ fontSize: 5 }}>
                PAUSED
              </span>
            )}
          </Link>
          {/* stool */}
          <div className="absolute left-0" style={{ top: 392, width: 200 }}>
            <Stool seat={paint.trim} side={paint.side} />
          </div>
        </div>
      </FitWidth>
    </div>
  );
}

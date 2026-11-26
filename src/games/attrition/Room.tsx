import { motion } from 'framer-motion';
import { Sprite } from '../../components/pixel/Sprite';
import { C, face, fly, icons, trashBag, type Mood } from '../../components/pixel/sprites';
import { T } from '../../components/motion';

/** Pixel kitchen: two roommates, one overflowing bin, a pile that grows each minute. */
export function Room({ minute, moodA, moodB, costEach, maxCost }: { minute: number; moodA: Mood; moodB: Mood; costEach: number; maxCost: number }) {
  const bags = Math.min(minute, 14);
  const A = face(moodA, C.brown, C.skin, C.blueD, 'short');
  const B = face(moodB, C.K, C.skin2, C.redD, 'long');
  return (
    <div className="relative grid grid-cols-1 items-end sm:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-4 border-4 border-black bg-[#2d2a52] p-6 shadow-hard halftone-light">
      <div className="flex flex-col items-center gap-3">
        <Sprite {...A} px={7} title="Roommate A (the class)" />
        <span className="font-pixel text-xs text-blue">YOU (A)</span>
        <Meter value={costEach} max={maxCost} color="#5aa7ff" />
      </div>
      <div className="flex flex-col items-center">
        <div className="mb-2 border-4 border-black bg-deep px-4 py-2 text-center">
          <div className="font-pixel text-xs text-ink-3">MINUTE</div>
          <div className="font-mono text-6xl leading-none text-gold">{String(minute).padStart(2, '0')}</div>
        </div>
        <div className="relative flex h-48 w-64 flex-wrap-reverse content-start items-end justify-center gap-1">
          {Array.from({ length: bags }, (_, i) => (
            <motion.div key={i} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={T}>
              <Sprite {...trashBag} px={5} />
            </motion.div>
          ))}
          {minute >= 3 && (
            <div className="absolute -top-2 left-8">
              <Sprite {...fly} px={4} />
            </div>
          )}
          {minute >= 6 && (
            <div className="absolute right-10 top-6">
              <Sprite {...fly} px={4} />
            </div>
          )}
        </div>
        <Sprite {...icons.bin} px={8} title="The kitchen bin" />
      </div>
      <div className="flex flex-col items-center gap-3">
        <Sprite {...B} px={7} flip title="Roommate B" />
        <span className="font-pixel text-xs text-red">ROOMMATE (B)</span>
        <Meter value={costEach} max={maxCost} color="#ef5a4b" />
      </div>
    </div>
  );
}

function Meter({ value, max, color }: { value: number; max: number; color: string }) {
  return (
    <div className="w-full max-w-[14rem]">
      <div className="flex justify-between text-sm text-ink-3">
        <span>misery spent</span>
        <span className="font-mono text-2xl leading-none text-ink">₹{Math.round(value)}</span>
      </div>
      <div className="mt-1 h-5 border-4 border-black bg-deep">
        <motion.div className="h-full" style={{ background: color }} initial={false} animate={{ width: `${Math.min(100, (value / max) * 100)}%` }} transition={T} />
      </div>
    </div>
  );
}

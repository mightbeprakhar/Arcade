/**
 * Bottom bar inside a game: only Back and Reset. Everything else is on the keyboard:
 * → / Space / PageDown next, ← / PageUp back, R reset, F fullscreen, P presenter mode.
 */
export function PresenterBar({ onPrev, onReset }: { onPrev: () => void; onReset: () => void }) {
  const b = 'flex h-10 items-center gap-2 border-4 border-black bg-panel px-3 font-pixel text-xs text-ink hover:bg-panel2 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-black bg-deep">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:px-8">
        <button className={b} onClick={onPrev} aria-label="Back (Left arrow or Page Up)">
          ◀ BACK
        </button>
        <button className={`${b} ml-auto`} onClick={onReset} aria-label="Reset game (R)">
          RESET <span className="hidden text-ink-3 md:inline">R</span>
        </button>
      </div>
    </div>
  );
}

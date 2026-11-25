import { usePresenter, toggleFullscreen } from '../state/presenter';

/** Keyboard-mirroring controls. All quiet: the stage's own action is the one gold button. */
export function PresenterBar({ onNext, onPrev, onReset }: { onNext: () => void; onPrev: () => void; onReset: () => void }) {
  const { presenter, togglePresenter } = usePresenter();
  const b = 'flex h-10 items-center gap-2 border-4 border-black bg-panel px-3 font-pixel text-xs text-ink hover:bg-panel2 focus:outline-none focus-visible:outline focus-visible:outline-4 focus-visible:outline-gold';
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-4 border-black bg-deep">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:px-8">
        <button className={b} onClick={onPrev} aria-label="Back (Left arrow)">
          ◀ BACK
        </button>
        <button className={b} onClick={onNext} aria-label="Next (Right arrow or Space)">
          NEXT ▶ <span className="hidden text-ink-3 md:inline">SPACE</span>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className={b} onClick={onReset} aria-label="Reset game (R)">
            RESET <span className="hidden text-ink-3 md:inline">R</span>
          </button>
          <button className={`${b} hidden sm:flex`} onClick={toggleFullscreen} aria-label="Fullscreen (F)">
            FULL <span className="hidden text-ink-3 md:inline">F</span>
          </button>
          <button className={`${b} ${presenter ? 'bg-gold text-black hover:bg-gold' : ''}`} onClick={togglePresenter} aria-pressed={presenter} aria-label="Presenter mode (P)">
            PRESENTER{presenter ? ' ON' : ''} <span className={`hidden md:inline ${presenter ? 'text-black' : 'text-ink-3'}`}>P</span>
          </button>
        </div>
      </div>
    </div>
  );
}

import { usePresenter, toggleFullscreen } from '../state/presenter';

export function PresenterBar({
  onNext,
  onPrev,
  onReset,
  canPrev,
  canNext,
}: {
  onNext: () => void;
  onPrev: () => void;
  onReset: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const { presenter, togglePresenter } = usePresenter();
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-700 bg-ink-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-2 px-4 py-2 sm:px-6">
        <button className="btn-ghost px-3 py-2" onClick={onPrev} aria-label="Back (Left arrow)">
          ← <span className="hidden sm:inline">Back</span> <span className="kbd hidden md:inline">←</span>
        </button>
        <button className="btn-primary px-4 py-2" onClick={onNext} aria-label="Next (Right arrow or Space)">
          <span className="hidden sm:inline">{canNext ? 'Next' : 'Reveal'}</span> → <span className="kbd hidden md:inline">Space</span>
        </button>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button className="btn-ghost px-3 py-2" onClick={onReset} aria-label="Reset game (R)">
            ↺ <span className="hidden sm:inline">Reset</span> <span className="kbd hidden md:inline">R</span>
          </button>
          <button className="btn-ghost px-3 py-2" onClick={toggleFullscreen} aria-label="Fullscreen (F)">
            ⛶ <span className="hidden sm:inline">Full</span> <span className="kbd hidden md:inline">F</span>
          </button>
          <button
            className={`btn px-3 py-2 ${presenter ? 'bg-neon-amber text-ink-950' : 'border border-ink-600 bg-ink-800'}`}
            onClick={togglePresenter}
            aria-pressed={presenter}
            aria-label="Presenter Mode (P)"
          >
            <span className="hidden sm:inline">Presenter</span>
            <span className="sm:hidden">Pres.</span> <span className="kbd hidden md:inline">P</span>
          </button>
        </div>
        <span className="sr-only">{canPrev ? '' : 'At first stage'}</span>
      </div>
    </div>
  );
}

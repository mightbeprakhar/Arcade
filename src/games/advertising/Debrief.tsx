import { Link } from 'react-router-dom';
import { RecordedVersus } from '../../components/RecordedVersus';
import { SectionTitle, Takeaways } from '../../components/ui';
import { grimDeltaThreshold } from '../../engine/advertising';
import type { AdState } from './AdvertisingGame';

export function AdDebrief({ accent }: { st: AdState; accent: string }) {
  return (
    <div>
      <SectionTitle kicker="Debrief" title="Humans vs Nash: the coffee wars" color={accent} />
      <RecordedVersus game="advertising" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Takeaways
          color={accent}
          items={[
            <>In one week, Ad is dominant — yet both shops would rather both Save. Individual rationality ≠ collective rationality.</>,
            <>With a known last week, backward induction unravels cooperation all the way to week 1. Humans rarely play it that way.</>,
            <>
              With an uncertain end, cooperation survives if the future matters enough: δ ≥ {grimDeltaThreshold()}.
            </>,
            <>Nice, retaliatory, forgiving, clear: reciprocal strategies win clean tournaments.</>,
            <>Add noise and strict reciprocity collapses into feuds — forgiveness (Generous TFT, Pavlov) becomes valuable, and Always Ad climbs the table.</>,
          ]}
        />
        <div className="self-start">
          <h3 className="mb-3 text-xl">Discuss</h3>
          <ul className="list-disc space-y-2 pl-6 text-lg text-ink-2">
            <li>When did the class start or stop trusting the rival? What triggered it?</li>
            <li>Did the class advertise in the last week? Why does the end of the game matter?</li>
            <li>Where do you see this in real markets — cola wars, telecom price cuts, food delivery discounts?</li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/" className="btn-ghost">
              ← Back to arcade
            </Link>
            <Link to="/results" className="btn-ghost">
              Humans vs Nash →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

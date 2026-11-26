import { Link } from 'react-router-dom';
import { RecordedVersus } from '../../components/RecordedVersus';
import { Notes, SectionTitle, Takeaways } from '../../components/ui';
import { PIE, STEP } from '../../engine/ultimatum';
import type { UltState } from './UltimatumGame';

const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function UltDebrief({}: { st: UltState }) {
  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the split" />
      <RecordedVersus game="ultimatum" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Takeaways
          items={[
            <>Backward induction says the Proposer keeps almost everything: offer {r(STEP)} of {r(PIE)}.</>,
            <>Real people reject “insulting” offers, burning money to punish unfairness. In lab studies, typical offers are 40–50% and offers under 20% are often rejected (Camerer, Behavioral Game Theory, 2003).</>,
            <>Fairness can be written into the payoff (Fehr–Schmidt). Then rejecting a lowball is rational, and the best offer depends on how fair-minded the other side is.</>,
            <>The strategy method (setting a minimum in advance) shows what people would do at every offer, not just the one they happened to see.</>,
          ]}
        />
        <div className="space-y-6">
          <Notes
            title="DISCUSS"
            items={[
              'Was the class’s offer generous, strategic, or afraid of rejection?',
              'Would you reject ₹1,000 from a stranger? From a friend? Why does that change?',
              'Where do take-it-or-leave-it offers happen in real life? (salary offers, final prices, treaties)',
            ]}
          />
          <div className="flex flex-wrap gap-4">
            <Link to="/" className="btn-ghost">
              ◀ ARCADE
            </Link>
            <Link to="/results" className="btn-ghost">
              HUMANS VS NASH ▶
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

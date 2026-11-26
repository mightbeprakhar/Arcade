import { Link } from 'react-router-dom';
import { RecordedVersus } from '../../components/RecordedVersus';
import { Notes, SectionTitle, Takeaways } from '../../components/ui';
import { solveTree } from '../../engine/startup';
import type { StartupState } from './StartupGame';

export function StartupDebrief({}: { st: StartupState }) {
  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the market" />
      <RecordedVersus game="startup" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Takeaways
          items={[
            <>A threat only matters if carrying it out is in the threatener’s interest when the time comes. Otherwise backward induction prunes it.</>,
            <>Chance moves are handled with expected values: average Nature’s branches by their probabilities, then keep solving backwards.</>,
            <>Reputation can make a threat credible. Then the startup’s decision depends on how likely the good market is (break-even at p = {solveTree({ p: 0.5, credible: true }).breakEvenP!.toFixed(3)}).</>,
            <>Risk aversion lowers the value of a gamble, so a cautious founder needs better odds before entering.</>,
          ]}
        />
        <div className="space-y-6">
          <Notes
            title="DISCUSS"
            items={['Did the threat scare the class? Should it have?', 'How do real incumbents make threats credible? (capacity, contracts, reputation)', 'Is one bad outcome a sign of a bad decision?']}
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

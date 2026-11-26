import { Link } from 'react-router-dom';
import { RecordedVersus } from '../../components/RecordedVersus';
import { Notes, SectionTitle, Takeaways } from '../../components/ui';
import { ATTRITION, solveSymmetric } from '../../engine/attrition';
import type { AttState } from './AttritionGame';

export function AttDebrief({}: { st: AttState }) {
  const { V, c } = ATTRITION;
  const s = solveSymmetric(V, c);
  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the bin" />
      <RecordedVersus game="attrition" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Takeaways
          items={[
            <>In a war of attrition, the equilibrium is to quit at a steady rate λ = c/V: just enough that your rival is indifferent between waiting and quitting.</>,
            <>On average the standoff lasts {s.expectedStandoff} minutes and burns ₹{s.expectedTotalCost}, the entire value of the prize. That is rent dissipation.</>,
            <>Your quitting rate is set by your opponent’s cost and value, not your own: tough rivals make you quit faster.</>,
            <>Real versions: strikes, price wars, patent races, bidding for a monopoly, and who replies first in a group chat.</>,
          ]}
        />
        <div className="space-y-6">
          <Notes title="DISCUSS" items={['How long did the class hold out? Did it feel like a plan or stubbornness?', 'What would end the standoff faster? (a rota, a coin flip, a deadline)', 'Why does committing in advance ("I never take out the trash") change everything?']} />
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

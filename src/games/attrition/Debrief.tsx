import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Notes, SectionTitle, Takeaways, VersusCard } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { Narration } from '../../components/comic';
import { ATTRITION, attritionPayoffs, solveSymmetric } from '../../engine/attrition';
import { recordResult } from '../../state/results';
import type { AttState } from './AttritionGame';

export function AttDebrief({ st }: { st: AttState }) {
  const { V, c } = ATTRITION;
  const s = solveSymmetric(V, c);
  const rd = st.round;
  const pay = rd ? attritionPayoffs(rd.minute, rd.classConceded, V, c, rd.escalating ? rd.g : 0).classPayoff : 0;
  const choice = rd ? `${rd.classConceded ? 'Conceded' : 'Outlasted the roommate'} after ${rd.minute} min` : '';
  const nashLabel = `Quit at rate λ = ${s.lambda}/min (mean ${s.meanPerPlayer} min)`;

  useEffect(() => {
    if (!rd) return;
    recordResult('attrition', { classChoice: choice, classPayoff: Math.round(pay), nashPrediction: nashLabel, nashPayoff: s.expectedPayoff, unit: '₹' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rd]);

  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the bin" />
      {rd ? (
        <VersusCard classChoice={choice} classPayoff={`₹${Math.round(pay)}`} nashPrediction={nashLabel} nashPayoff={`₹${s.expectedPayoff} expected`} unit="to roommate A" />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Narration>The class hasn’t played yet.</Narration>
          <NextStageButton label="GO TO PLAY" to="play" />
        </div>
      )}
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

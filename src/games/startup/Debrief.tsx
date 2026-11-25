import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Notes, SectionTitle, Takeaways, VersusCard } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { Narration } from '../../components/comic';
import { STARTUP, leafPayoff, solveTree } from '../../engine/startup';
import { recordResult } from '../../state/results';
import type { StartupState } from './StartupGame';

export function StartupDebrief({ st }: { st: StartupState }) {
  const rd = st.round;
  const pay = rd ? (rd.entered ? leafPayoff(rd.demand, rd.action, st.credible)[0] : STARTUP.stayOut[0]) : 0;
  const choice = rd ? (rd.entered ? `Entered; demand ${rd.demand}; incumbent chose ${rd.action}` : 'Stayed out') : '';
  const nashPay = st.sol.decision === 'Enter' ? st.sol.euEnter : STARTUP.stayOut[0];
  const nashLabel = `${st.sol.decision} (p = ${st.p.toFixed(2)}${st.credible ? ', credible threat' : ''})`;

  useEffect(() => {
    if (!rd) return;
    recordResult('startup', { classChoice: choice, classPayoff: pay, nashPrediction: nashLabel, nashPayoff: +nashPay.toFixed(2), unit: 'profit pts', note: 'Nash payoff is the expected value' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rd]);

  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the market" />
      {rd ? (
        <VersusCard classChoice={choice} classPayoff={String(pay)} nashPrediction={nashLabel} nashPayoff={`${nashPay.toFixed(2)} expected`} unit="startup profit" />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Narration>The class hasn’t played yet.</Narration>
          <NextStageButton label="GO TO PLAY" to="play" />
        </div>
      )}
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

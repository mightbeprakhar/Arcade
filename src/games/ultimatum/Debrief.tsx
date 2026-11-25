import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Notes, SectionTitle, Takeaways, VersusCard } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { Narration } from '../../components/comic';
import { PIE, STEP, outcome, rationalAccepts, spne } from '../../engine/ultimatum';
import { recordResult } from '../../state/results';
import type { UltState } from './UltimatumGame';

const r = (n: number) => `₹${Math.round(n).toLocaleString('en-IN')}`;

export function UltDebrief({ st }: { st: UltState }) {
  const rd = st.round;
  const [s1] = spne();
  // Nash benchmark for whichever role the class played.
  const classPay = rd ? outcome(rd.offer, rd.accepted)[rd.mode === 'proposer' ? 0 : 1] : 0;
  const nash = rd
    ? rd.mode === 'proposer'
      ? { label: `Offer ${r(s1.offer)} (SPNE)`, pay: s1.payoffs[0] }
      : { label: 'Accept any offer above ₹0', pay: rationalAccepts(rd.offer) ? rd.offer : 0 }
    : null;
  const choice = rd ? (rd.mode === 'proposer' ? `Offered ${r(rd.offer)}: ${rd.accepted ? 'accepted' : 'rejected'}` : `Minimum ${r(rd.min)}; offered ${r(rd.offer)}: ${rd.accepted ? 'accepted' : 'rejected'}`) : '';

  useEffect(() => {
    if (!rd || !nash) return;
    recordResult('ultimatum', { classChoice: choice, classPayoff: classPay, nashPrediction: nash.label, nashPayoff: nash.pay, unit: '₹' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rd]);

  return (
    <div>
      <SectionTitle kicker="DEBRIEF" title="Humans vs Nash: the split" />
      {rd && nash ? (
        <VersusCard classChoice={choice} classPayoff={r(classPay)} nashPrediction={nash.label} nashPayoff={r(nash.pay)} unit={rd.mode === 'proposer' ? 'to the Proposer' : 'to the Responder'} />
      ) : (
        <div className="flex flex-wrap items-center gap-4">
          <Narration>The class hasn’t played a round yet.</Narration>
          <NextStageButton label="GO TO PLAY" to="play" />
        </div>
      )}
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

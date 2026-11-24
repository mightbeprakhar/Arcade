import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { SectionTitle, Takeaways, VersusCard } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { PD, ROUNDS, finiteHorizonSPNE, grimDeltaThreshold, strategyById } from '../../engine/advertising';
import { recordResult } from '../../state/results';
import { cumulative } from './Tally';
import type { AdState } from './AdvertisingGame';

export function AdDebrief({ st, accent }: { st: AdState; accent: string }) {
  const done = st.classMoves.length >= ROUNDS;
  const cum = cumulative(st.classMoves, st.aiMoves);
  const total = cum.at(-1)?.a ?? 0;
  const ads = st.classMoves.filter((m) => m === 'A').length;
  const spne = finiteHorizonSPNE();
  const nashTotal = spne.length * PD.P;
  const opp = strategyById(st.opponent);

  useEffect(() => {
    if (!done) return;
    recordResult('advertising', {
      classChoice: `Ad ${ads}/${ROUNDS} weeks vs ${opp.name}`,
      classPayoff: total,
      nashPrediction: `Ad every week (SPNE)`,
      nashPayoff: nashTotal,
      unit: '₹k',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [done]);

  return (
    <div>
      <SectionTitle kicker="Debrief" title="Humans vs Nash: the coffee wars" color={accent} />
      {done ? (
        <VersusCard
          classChoice={`Advertised ${ads} of ${ROUNDS} weeks vs ${opp.name}`}
          classPayoff={`₹${total}k`}
          nashPrediction="Ad every week (backward induction)"
          nashPayoff={`₹${nashTotal}k`}
          unit="over 20 weeks"
        />
      ) : (
        <div className="card text-lg">
          The class has played {st.classMoves.length} of {ROUNDS} weeks. <NextStageButton label="Finish the match" to="play" />
        </div>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
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
        <div className="card self-start">
          <div className="label mb-2">Discuss</div>
          <ul className="list-disc space-y-2 pl-5 text-lg">
            <li>When did the class start or stop trusting the rival? What triggered it?</li>
            <li>Did the class advertise in the last week? Why does the end of the game matter?</li>
            <li>Where do you see this in real markets — cola wars, telecom price cuts, food delivery discounts?</li>
          </ul>
          <div className="mt-5 flex flex-wrap gap-3">
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

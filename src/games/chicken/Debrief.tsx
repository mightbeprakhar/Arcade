import { Link } from 'react-router-dom';
import { RecordedVersus } from '../../components/RecordedVersus';
import { SectionTitle, Takeaways } from '../../components/ui';
import type { ChickenSolution } from '../../engine/chicken';
import type { ChickenState } from './ChickenGame';

const pct = (x: number) => `${+(x * 100).toFixed(1)}%`;

export function ChickenDebrief({ st, sol, accent }: { st: ChickenState; sol: ChickenSolution; accent: string }) {
  return (
    <div>
      <SectionTitle kicker="Debrief" title="Humans vs Nash: the bridge" color={accent} />
      <RecordedVersus game="chicken" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Takeaways
          color={accent}
          items={[
            <>Chicken has <b>two pure equilibria</b> — someone has to blink, and theory doesn’t say who. That’s a coordination problem.</>,
            <>
              The mixed equilibrium makes the other driver indifferent. Crashes still happen {pct(sol.crashProb)} of the time — rational players, bad outcomes.
            </>,
            <>
              <b>Your mix is set by your opponent’s payoffs.</b> Make the truck tougher and the <em>car</em> goes straight more often, not the truck.
            </>,
            <>Risk dominance picks the equilibrium that’s costlier to abandon: {st.asymmetric ? <>with a truck, “truck goes straight” wins, {sol.productRowStraight} to {sol.productColStraight}.</> : <>in the symmetric game the products tie ({sol.productRowStraight} = {sol.productColStraight}) — flip on Truck vs Car to break the tie.</>}</>,
            <>Real life: brinkmanship, price wars, merging traffic. Commitment (ripping out the steering wheel) wins Chicken — if the other side sees it.</>,
          ]}
        />
        <div className="self-start">
          <h3 className="mb-3 text-xl">Discuss</h3>
          <ul className="list-disc space-y-2 pl-6 text-lg text-ink-2">
            <li>Did either side try to signal before voting? Would cheap talk help here?</li>
            <li>If you could publicly commit to “straight” first, would you? What makes that credible?</li>
            <li>Why does making the truck safer make the <em>car</em> more aggressive in equilibrium?</li>
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

import { useState } from 'react';
import { VotePanel } from '../../components/VotePanel';
import { SectionTitle, Stat } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { ROUNDS, STRATEGIES, aiMove, payoffs, strategyById, type Move } from '../../engine/advertising';
import { CumulativeChart, TallyGrid, cumulative } from './Tally';
import type { AdState } from './AdvertisingGame';

const AUTOPLAY = ['tft', 'alwaysAd', 'alwaysSave'];

export function AdPlay({ st, accent }: { st: AdState; accent: string }) {
  const [mystery, setMystery] = useState(false);
  const round = st.classMoves.length;
  const started = round > 0;
  const done = round >= ROUNDS;
  const opp = strategyById(st.opponent);
  const oppName = mystery && !done ? 'Mystery rival' : `Bean There (${opp.name})`;
  const cum = cumulative(st.classMoves, st.aiMoves);
  const last = cum.at(-1);

  const playRound = (c: Move) => {
    const a = aiMove(opp, st.classMoves, st.aiMoves);
    st.push(c, a);
  };

  const autoplay = (id: string) => {
    const s = strategyById(id);
    const cm = [...st.classMoves];
    const am = [...st.aiMoves];
    while (cm.length < ROUNDS) {
      const c = s.move({ mine: cm, theirs: am }, Math.random);
      const a = aiMove(opp, cm, am);
      cm.push(c);
      am.push(a);
      st.push(c, a);
    }
  };

  return (
    <div>
      <SectionTitle kicker={`Play · week ${Math.min(round + 1, ROUNDS)} of ${ROUNDS}`} title="Ad or Save this week?" color={accent}>
        The class runs <b className="text-neon-cyan">Brew Theory</b>. Each week, vote — then see what the rival did.
      </SectionTitle>

      {!started && (
        <div className="card mb-5">
          <div className="label mb-3">Presenter: pick the rival’s playbook</div>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                className={`btn ${st.opponent === s.id && !mystery ? 'text-ink-950' : 'border border-ink-600 bg-ink-800'}`}
                style={st.opponent === s.id && !mystery ? { background: accent } : undefined}
                onClick={() => {
                  setMystery(false);
                  st.setOpponent(s.id);
                }}
              >
                {s.name}
              </button>
            ))}
            <button
              className={`btn ${mystery ? 'bg-neon-violet text-ink-950' : 'border border-ink-600 bg-ink-800'}`}
              onClick={() => {
                setMystery(true);
                st.setOpponent(STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)].id);
              }}
            >
              🎲 Mystery (revealed at the end)
            </button>
          </div>
          <p className="mt-3 text-lg text-slate-300">{mystery ? 'The rival’s strategy is hidden. Figure it out from its moves.' : opp.description}</p>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-5">
          {!done ? (
            <VotePanel
              key={round}
              title={`Week ${round + 1} · Brew Theory’s move`}
              options={[
                { id: 'S', label: 'Save', sub: 'Keep the ad budget', color: '#a3e635' },
                { id: 'A', label: 'Ad', sub: 'Launch the blitz', color: '#f472b6' },
              ]}
              onDecide={(id) => playRound(id as Move)}
              lockLabel="Lock in & reveal rival"
            />
          ) : (
            <div className="card border-neon-lime/50">
              <div className="label text-neon-lime">All {ROUNDS} weeks played</div>
              <div className="mt-1 text-2xl font-bold">The rival was {opp.name}.</div>
              <p className="mt-1 text-lg text-slate-300">{opp.description}</p>
            </div>
          )}
          {last && (
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Last week"
                value={`${st.classMoves[round - 1]} vs ${st.aiMoves[round - 1]}`}
                sub={`₹${payoffs(st.classMoves[round - 1], st.aiMoves[round - 1]).join('k / ₹')}k`}
              />
              <Stat label="Weeks both saved" value={st.classMoves.filter((m, i) => m === 'S' && st.aiMoves[i] === 'S').length} sub={`of ${round}`} color="#a3e635" />
              <Stat label="Brew Theory (class)" value={`₹${last.a}k`} color="#22d3ee" />
              <Stat label={mystery && !done ? 'Rival' : 'Bean There'} value={`₹${last.b}k`} color="#f472b6" />
            </div>
          )}
          {!done && (
            <div className="card">
              <div className="label mb-2">Short on time? Autoplay the remaining weeks as…</div>
              <div className="flex flex-wrap gap-2">
                {AUTOPLAY.map((id) => (
                  <button key={id} className="btn-ghost" onClick={() => autoplay(id)}>
                    {strategyById(id).name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="card">
          <div className="label mb-2">Cumulative profit</div>
          <CumulativeChart a={st.classMoves} b={st.aiMoves} nameA="Brew Theory (class)" nameB={oppName} />
        </div>
      </div>
      <div className="card mt-5">
        <TallyGrid a={st.classMoves} b={st.aiMoves} nameA="Brew Theory" nameB={mystery && !done ? 'Rival' : 'Bean There'} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {started && (
          <button className="btn-ghost" onClick={st.clear}>
            ↺ Restart match
          </button>
        )}
        {done && <NextStageButton label="Solve it" />}
      </div>
    </div>
  );
}

import { VotePanel } from '../../components/VotePanel';
import { GUESS_BONUS } from '../../engine/score';
import { PEN, RED, SectionTitle, Stat, rupeeK } from '../../components/ui';
import { NextStageButton } from '../../components/GameShell';
import { ROUNDS, STRATEGIES, aiMove, payoffs, strategyById, type Move } from '../../engine/advertising';
import { CumulativeChart, TallyGrid, cumulative } from './Tally';
import { PixelShop } from './Shop';
import { ActionWord, Panel } from '../../components/comic';
import { C } from '../../components/pixel/sprites';
import type { AdState } from './AdvertisingGame';

const AUTOPLAY = ['tft', 'alwaysAd', 'alwaysSave'];

export function AdPlay({ st, accent }: { st: AdState; accent: string }) {
  const { mystery, setMystery } = st;
  // Until the class has guessed, the mystery rival stays anonymous, even after week 20.
  const hidden = mystery && st.guess === null;
  const round = st.classMoves.length;
  const started = round > 0;
  const done = round >= ROUNDS;
  const opp = strategyById(st.opponent);
  const oppName = hidden ? 'Mystery rival' : `Bean There (${opp.name})`;
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
        The class runs <span className="text-blue">Brew Theory</span>. Each week, vote — then see what the rival did.
      </SectionTitle>

      <Panel className="mb-6 bg-[#241f52] p-4">
        <div className="flex flex-wrap items-end justify-around gap-4">
          <div className="text-center">
            <PixelShop name="Brew Theory" color={C.blue} ad={round > 0 && st.classMoves[round - 1] === 'A'} px={3} />
            {last && <div className="mt-2 font-mono text-3xl text-blue">+₹{last.pa}k</div>}
          </div>
          <div className="grid place-items-center gap-2 self-center">
            <span className="chip text-gold">WEEK {Math.min(round + (done ? 0 : 1), ROUNDS)}/{ROUNDS}</span>
            {last && st.classMoves[round - 1] === 'A' && st.aiMoves[round - 1] === 'A' && <ActionWord key={round} text="AD WAR!" size={22} />}
            {last && st.classMoves[round - 1] === 'S' && st.aiMoves[round - 1] === 'S' && <ActionWord key={round} text="TRUCE" size={22} color="#fff4dc" />}
          </div>
          <div className="text-center">
            <PixelShop name={hidden ? '???' : 'Bean There'} color={C.red} ad={round > 0 && st.aiMoves[round - 1] === 'A'} px={3} />
            {last && <div className="mt-2 font-mono text-3xl text-red">+₹{last.pb}k</div>}
          </div>
        </div>
      </Panel>

      {!started && (
        <div className="card mb-6">
          <div className="label mb-3">Presenter: pick the rival’s playbook</div>
          <div className="flex flex-wrap gap-2">
            {STRATEGIES.map((s) => (
              <button
                key={s.id}
                aria-pressed={st.opponent === s.id && !mystery}
                className={`btn-ghost ${st.opponent === s.id && !mystery ? '!border-gold !text-gold' : ''}`}
                onClick={() => {
                  setMystery(false);
                  st.setOpponent(s.id);
                }}
              >
                {s.name}
              </button>
            ))}
            <button
              aria-pressed={mystery}
              className={`btn-ghost ${mystery ? '!border-gold !text-gold' : ''}`}
              onClick={() => {
                setMystery(true);
                st.setOpponent(STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)].id);
              }}
            >
              Mystery rival (revealed at the end)
            </button>
          </div>
          <p className="mt-3 text-lg text-ink-2">{mystery ? 'The rival’s strategy is hidden. Figure it out from its moves.' : opp.description}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          {!done ? (
            <VotePanel
              key={round}
              title={`Week ${round + 1} · Brew Theory’s move`}
              options={[
                { id: 'S', label: 'Save', sub: 'Keep the ad budget' },
                { id: 'A', label: 'Ad', sub: 'Launch the blitz' },
              ]}
              onDecide={(id) => playRound(id as Move)}
              lockLabel="Lock in & reveal rival"
            />
          ) : hidden ? (
            <VotePanel
              title="All 20 weeks played: which playbook was the mystery rival using?"
              options={STRATEGIES.map((s) => ({ id: s.id, label: s.name }))}
              onDecide={(id) => st.setGuess(id)}
              lockLabel="Lock in our guess & reveal"
            />
          ) : (
            <div className="card space-y-3">
              <div className="label">All {ROUNDS} weeks played</div>
              {mystery && st.guess !== null && (
                <div className="flex flex-wrap items-center gap-3">
                  <ActionWord text={st.guess === st.opponent ? 'NAILED IT!' : 'WRONG GUESS'} size={22} />
                  <span className="text-lg">
                    {st.guess === st.opponent ? `+${GUESS_BONUS} points.` : `The class guessed ${strategyById(st.guess).name}.`}
                  </span>
                </div>
              )}
              <div className="text-2xl">The rival was {opp.name}.</div>
              <p className="text-lg text-ink-2">{opp.description}</p>
            </div>
          )}
          {last && (
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Last week"
                value={`${st.classMoves[round - 1]} vs ${st.aiMoves[round - 1]}`}
                sub={payoffs(st.classMoves[round - 1], st.aiMoves[round - 1]).map(rupeeK).join(' / ')}
              />
              <Stat label="Weeks both saved" value={st.classMoves.filter((m, i) => m === 'S' && st.aiMoves[i] === 'S').length} sub={`of ${round}`} color={RED} />
              <Stat label="Brew Theory (class)" value={rupeeK(last.a)} color={PEN} />
              <Stat label={hidden ? 'Rival' : 'Bean There'} value={rupeeK(last.b)} color={RED} />
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
      <div className="card mt-6">
        <TallyGrid a={st.classMoves} b={st.aiMoves} nameA="Brew Theory" nameB={hidden ? 'Rival' : 'Bean There'} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {started && (
          <button className="btn-ghost" onClick={st.clear}>
            Restart match
          </button>
        )}
        {done && !hidden && <NextStageButton label="Solve it" />}
      </div>
    </div>
  );
}

import { solveChicken } from './chicken';
import { finiteHorizonSPNE, ROUNDS } from './advertising';
import { spne, STEP, PIE } from './ultimatum';
import { STARTUP, solveTree } from './startup';
import { solveSymmetric } from './attrition';
import type { GameKey } from './score';

export type Prediction = { question: string; options: { id: string; label: string }[]; correct: string; explain: string };

const rupee = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const uniqSorted = (xs: number[]) => [...new Set(xs)].sort((a, b) => a - b);

/** The multiple-choice "Predict" question shown before each Solve stage. Answers come from the engine. */
export function predictionFor(game: GameKey): Prediction {
  switch (game) {
    case 'chicken': {
      const q = Math.round(solveChicken(false).mixed.colP1 * 100);
      const opts = uniqSorted([q, 25, 50, 90]);
      return {
        question: 'If both drivers mix in equilibrium, how often does each one go straight?',
        options: opts.map((v) => ({ id: String(v), label: `${v}% of the time` })),
        correct: String(q),
        explain: `Each driver goes straight ${q}% of the time: just often enough that the other driver doesn't care whether they swerve.`,
      };
    }
    case 'ultimatum': {
      const x = spne()[0].offer;
      const opts = uniqSorted([x, 3 * STEP, PIE / 2, PIE]);
      return {
        question: `What does backward induction say the Proposer should offer out of ${rupee(PIE)}?`,
        options: opts.map((v) => ({ id: String(v), label: rupee(v) })),
        correct: String(x),
        explain: `${rupee(x)}, the smallest positive step: a money-only Responder accepts anything above ₹0. (Offering ₹0 is also subgame perfect if they accept it.)`,
      };
    }
    case 'advertising': {
      const allAd = finiteHorizonSPNE().every((m) => m === 'A');
      return {
        question: `With exactly ${ROUNDS} weeks and both shops knowing it, what do perfectly rational shops do?`,
        options: [
          { id: 'save', label: 'Save every week' },
          { id: 'tft', label: 'Copy each other (tit-for-tat)' },
          { id: 'turns', label: 'Take turns advertising' },
          { id: 'ad', label: 'Advertise every week' },
        ],
        correct: allAd ? 'ad' : 'save',
        explain: `Advertise every week. The last week is a one-shot dilemma, so both advertise; knowing that, so is the week before, and so on back to week 1.`,
      };
    }
    case 'startup': {
      const s = solveTree({ p: STARTUP.pHigh, credible: false });
      const correct = s.decision === 'Stay Out' ? 'out' : s.low.choice === 'Fight' || s.high.choice === 'Fight' ? 'enter-fight' : 'enter-acc';
      return {
        question: `High demand has chance ${STARTUP.pHigh}. What does the startup do, and how does the incumbent respond?`,
        options: [
          { id: 'enter-acc', label: 'Enter; the incumbent accommodates' },
          { id: 'enter-fight', label: 'Enter; the incumbent starts a price war' },
          { id: 'out', label: 'Stay out: the threat works' },
        ],
        correct,
        explain: `The startup enters (expected payoff ${s.euEnter.toFixed(1)} > 0) and the incumbent accommodates: fighting is never its best reply, so the threat is empty.`,
      };
    }
    case 'attrition': {
      const t = solveSymmetric().expectedStandoff;
      const opts = uniqSorted([t, 2, 10, 20]);
      return {
        question: 'In equilibrium, how long does the trash standoff last on average?',
        options: opts.map((v) => ({ id: String(v), label: `${v} minutes` })),
        correct: String(t),
        explain: `${t} minutes. Each roommate quits at rate c/V per minute; the standoff ends at the first quit, at twice that rate.`,
      };
    }
  }
}

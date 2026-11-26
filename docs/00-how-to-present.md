# How to run the presentation

The arcade is built for a live, camera-free class session. One presenter drives the laptop on the projector; the room votes with a show of hands.

## The loop every game follows

| Stage | What happens on screen | What the presenter does |
|---|---|---|
| **Story** | A pixel comic strip, one panel per keypress | Read the yellow narration boxes aloud (or switch on Voiceover in Chicken) |
| **Play** | The game screen and a vote counter | Count hands, tap **+ / −**, press the gold button to lock in |
| **Solve** | First a **Predict** vote: the class guesses the equilibrium (multiple choice), the reveal says right or wrong (+100 points if right). Then the diagram builds step by step, then the maths | Count hands, press **→** to lock, **→** to reveal, **→** to start the solution; explain each step in your own words |
| **Simulate** | Sliders and charts that run thousands of games | Move one slider at a time and say what changed and why |
| **Debrief** | Class vs Nash, takeaways, discussion questions | Ask one discussion question and take two answers |

## What the class plays

| Game | Play mode |
|---|---|
| Ultimatum | 5 rounds against freshly drawn strangers, with a running bank. Round A: the class proposes; then **Next: Round B**, where it sets a minimum |
| Chicken | Best of 5 against an AI driver that mixes at the equilibrium. One **commit** power-up locks the class into Straight before the AI moves (the AI then swerves). A left-side-vs-right-side mode is still available |
| Advertising | 20 weeks against a chosen or mystery rival. With a mystery rival, the class guesses its strategy before the reveal (+100 points if right) |
| Waiting Game | Vote wait or concede every minute until someone cracks |
| Startup | 5 markets in a row, as the startup (enter or stay out) or as the incumbent (fight or accommodate after entry) |

## Points and the beat-Nash badge

Each game's payoff is scaled onto the same **0–500 points** using that game's worst and best possible payoff per round, so no single game dominates the total (formulas and ranges in `src/engine/score.ts`). Bonuses on top: **+100** for a correct prediction, **+100** for guessing the mystery rival.

- **Chicken** scores the class's payoff, not rounds won, so a crash hurts. Against the equilibrium AI driver every strategy has the same *expected* score; that is exactly what indifference means (the commit power-up is the exception, because the AI reacts to it).
- **Ultimatum** keeps Round A and Round B separately; the game scores the average of the two.
- **★ Beat Nash** means the class's payoff beat what the equilibrium player would have earned, in series games against the same strangers or markets.

Points and badges show on the hub and on Humans vs Nash and update after every round. A mystery rival's name stays hidden everywhere until the class locks in its guess. **GAME OVER** appears on Humans vs Nash once all five games are played.

The last screen of the talk is **Humans vs Nash** (`/results`): every game the class played, the class's payoff, the equilibrium payoff and the gap.

## Keyboard and clicker

| Key | Action |
|---|---|
| `→`, `Space` or `Page Down` | Next step. Reveals the next line or panel first; when there is none, goes to the next stage |
| `←` or `Page Up` | Back |
| `R` | Reset the current game |
| `F` | Fullscreen |
| `P` | Presenter Mode: bigger text for the projector |

Most presentation clickers send Page Down / Page Up, so a clicker works as next / back. Inside a game the bottom bar only has **◀ Back** and **Reset**; next, fullscreen and Presenter Mode are on the keyboard. The gold buttons on each screen (lock in, next round, solve it) also move things along with a mouse.

## Results and sessions

Results, predictions and points are kept for the current browser tab: refreshing keeps them, but a new tab or window starts a fresh session. To start over in the same tab, press **↺ New session** on the home page (it asks to confirm).

## Suggested running order and timing (about 40 minutes)

1. Hub, 1 min: walk the arcade floor: five cabinets, each looping its game's teaser (click one to open it), and the High Scores machine for Humans vs Nash.
2. **Chicken**, 10 min: the flagship game. Do every stage.
3. Ultimatum, 7 min: round A (class proposes), then the tree in Solve.
4. Advertising, 8 min: play 3–4 weeks live, then autoplay the rest; show the tournament at 0% and 5% noise.
5. Startup, 6 min: play once, then drag the probability slider and flip "credible threat".
6. Waiting Game, 6 min: play until someone cracks; show the survival curve.
7. Humans vs Nash, 2 min: the closing slide.

If time is short, Chicken is the game to do completely.

## Demo-day checklist

- `npm run build` then `npm run preview` on the presenting laptop as an offline backup. The app needs no internet once loaded.
- Open the live site once beforehand so fonts and code are cached.
- Turn on Presenter Mode (`P`) and Fullscreen (`F`).
- Press **↺ New session** on the home page before the class starts (or open the site in a new tab).
- Decide who counts hands on the left and right sides of the room (Chicken needs both).

## Where the maths lives

All numbers on screen come from `src/engine/*.ts`. The same numbers are checked by `src/engine/*.test.ts` (run `npm test`). If a question comes up about a number, the engine file is the source of truth.

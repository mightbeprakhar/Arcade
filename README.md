# Game Theory Arcade

A pixel-art arcade of five classic games from game theory, built for a live classroom presentation (Game Theory elective, RV University, School of CSE). The class plays each game by show of hands, then the app solves it on screen with the maths, runs simulations, and compares what the class did with the Nash prediction.

Every level runs the same loop: **Story → Play → Solve → Simulate → Debrief**. The last screen, **Humans vs Nash**, compares the class's results with the equilibrium in every game.

## The five levels

| Level | Game | What it teaches |
|---|---|---|
| 1 | **Ultimatum Game** | Backward induction and subgame-perfect equilibrium; why the "rational" offer is almost nothing; fairness as a payoff (Fehr–Schmidt inequity aversion); the strategy method |
| 2 | **Game of Chicken** | Two pure equilibria and a coordination problem; mixed strategies by indifference; why your mix depends on your opponent's payoffs; risk dominance |
| 3 | **Advertising Game** | Dominant strategies and the Prisoner's Dilemma; finite vs infinite horizons (δ ≥ 0.5); reciprocity, tournaments, and how noise breaks strict reciprocity |
| 4 | **The Waiting Game** | War of attrition; equilibrium as a constant quitting (hazard) rate λ = c/V; full rent dissipation; escalating and asymmetric costs |
| 5 | **Startup Entry** | Sequential games with a chance move; credible vs non-credible threats; expected utility and risk attitude |

Study guides with every derivation, the numbers to remember and likely questions are in [`docs/`](docs/):

- [How to run the presentation](docs/00-how-to-present.md)
- [Ultimatum Game](docs/01-ultimatum.md)
- [Game of Chicken](docs/02-chicken.md)
- [Advertising Game](docs/03-advertising.md)
- [The Waiting Game](docs/04-waiting-game.md)
- [Startup Entry](docs/05-startup.md)

## Run it locally

Requires Node 18 or newer.

```bash
npm install
npm run dev        # development server
npm test           # engine and design tests
npm run build      # production build
npm run preview    # serve the build locally (offline backup for demo day)
```

## Presenter controls

`→` / `Space` next step · `←` back · `R` reset game · `F` fullscreen · `P` Presenter Mode (larger text for projectors). Every control is also an on-screen button.

## How it's built

- **Vite + React + TypeScript**, Tailwind CSS, Framer Motion, Recharts, KaTeX, React Router.
- All game maths lives in `src/engine/` as plain TypeScript, with Vitest tests for every equilibrium value. The UI reads every number from the engine; nothing is hard-coded on screen.
- Works offline once loaded: fonts are bundled and there are no runtime API calls.
- Deployed on Vercel; `vercel.json` rewrites all routes to `index.html` so deep links work.

## Live link

_Add the Vercel URL here._

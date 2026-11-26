# Game Theory Arcade

A pixel-art arcade of five classic games from game theory. The class plays each game by show of hands, then the app solves it on screen with the maths, runs simulations, and compares what the class did with the Nash prediction.

**Play it live:** https://arcade-gt.vercel.app

Every game runs the same loop: **Story → Play → Solve → Simulate → Debrief**. The last screen, **Humans vs Nash**, compares the class's results with the equilibrium in every game.

## The five games

| # | Game | What it teaches |
|---|---|---|
| 1 | **Ultimatum Game** | Backward induction and subgame-perfect equilibrium; why the "rational" offer is almost nothing; fairness as a payoff (Fehr–Schmidt inequity aversion); the strategy method |
| 2 | **Game of Chicken** | Two pure equilibria and a coordination problem; mixed strategies by indifference; why your mix depends on your opponent's payoffs; risk dominance |
| 3 | **Advertising Game** | Dominant strategies and the Prisoner's Dilemma; finite vs infinite horizons (δ ≥ 0.5); reciprocity, tournaments, and how noise breaks strict reciprocity |
| 4 | **The Waiting Game** | War of attrition; equilibrium as a constant quitting (hazard) rate λ = c/V; full rent dissipation; escalating and asymmetric costs |
| 5 | **Startup Entry** | Sequential games with a chance move; credible vs non-credible threats; expected utility and risk attitude |


## Presenter controls

`→` / `Space` / `Page Down` next step · `←` / `Page Up` back · `R` reset game · `F` fullscreen · `P` Presenter Mode (larger text for projectors). Page Up / Page Down make a presentation clicker work. Inside a game the bottom bar has **Back** and **Reset**; everything else is on the keyboard.

Results are kept per browser tab: a refresh keeps them, a new tab or window starts a fresh class session. **New session** on the home page clears them.

## How it's built

- **Vite + React + TypeScript**, Tailwind CSS, Framer Motion, Recharts, KaTeX, React Router.
- All game maths lives in `src/engine/` as plain TypeScript, with Vitest tests for every equilibrium value. The UI reads every number from the engine; nothing is hard-coded on screen.
- Works offline once loaded: fonts are bundled and there are no runtime API calls.
- Deployed on Vercel; `vercel.json` rewrites all routes to `index.html` so deep links work.


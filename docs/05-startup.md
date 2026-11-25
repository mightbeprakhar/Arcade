# Level 5: Startup Entry (sequential game with chance)

**One line:** a startup decides whether to enter a market; Nature then decides whether demand is high or low; the incumbent then fights a price war or accommodates.

## The tree (payoffs are Startup, Incumbent)

- **Stay out** → (0, 10)
- **Enter** → Nature draws demand:
  - **High** (p = 0.6) → Incumbent: Accommodate (6, 6) or Fight (−2, 3)
  - **Low** (0.4) → Incumbent: Accommodate (1, 4) or Fight (−3, 2)

## What the class does

The class is the startup and votes Enter or Stay out. If it enters, an animated coin decides demand, then the incumbent plays its best reply. A toggle lets the incumbent "have a reputation to protect" (the credible-threat version).

## Solving it: backward induction with a chance node

1. **Incumbent's choices.** High: Accommodate 6 > Fight 3. Low: Accommodate 4 > Fight 2. **Fight is never a best reply**, so the price-war threat is not credible and is pruned.
2. **Nature's node.** Nature isn't a player with goals; take the expectation: EU(Enter) = 0.6·6 + 0.4·1 = **4.0**.
3. **Startup's choice.** 4.0 > 0 → **Enter**.

## Credible threat toggle

With reputation, fighting in a low-demand market is worth **5** to the incumbent (it scares off future entrants). Now:
- High: Accommodate 6 > Fight 3 → Accommodate (startup gets 6).
- Low: Fight 5 > Accommodate 4 → **Fight** (startup gets −3).
- EU(Enter) = 6p − 3(1 − p) = 9p − 3.

| p | EU(Enter) | Decision |
|---|---|---|
| 0.6 | **2.4** | Enter |
| 1/3 | **0** | Indifferent (break-even) |
| 0.2 | **−1.2** | Stay out |

Break-even: 9p − 3 = 0 → **p = 1/3**.

## Risk attitude (optional slider)

Replace money x with utility u(x) = (1 − e^(−r·x)) / r. r → 0 is risk-neutral (u(x) = x); larger r means losses hurt more than equal gains help.

With the credible threat at p = 0.6:
- r = 0.1 → E[u(Enter)] ≈ 1.31 > 0 → still Enter; break-even p rises to ≈ 0.44.
- r = 0.3 → E[u(Enter)] ≈ −0.28 < 0 → **Stay out**, even though the expected money is +2.4. Break-even p ≈ 0.64.

The certainty equivalent is the sure amount that gives the same utility as the gamble.

## Simulation insights

- EU(Enter) plotted against p: the empty-threat line stays above 0 at every p; the credible-threat line crosses 0 at p = 1/3. Risk aversion pulls both lines down.
- Simulating 1,000 founders who all enter: individual results are luck, but the average lands on the expected value. That is why backward induction uses expectations, and why one bad outcome doesn't prove a bad decision.

## Likely questions

- **What makes a threat credible?** Carrying it out must be in the threatener's interest *when the moment comes*. Reputation, sunk capacity or contracts can change payoffs so that it is.
- **Why can we average over Nature?** Nature has no strategy; its move is a lottery, so a rational (risk-neutral) player values it by its expected payoff.
- **Why did the risk-averse founder stay out with a positive expected profit?** Because utility, not money, is what's maximised, and the −3 loss weighs more than the +6 gain.

**Code:** `src/engine/startup.ts`, tests in `src/engine/startup.test.ts`.

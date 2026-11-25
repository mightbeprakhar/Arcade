# Level 1: Ultimatum Game

**One line:** one player proposes how to split ₹10,000, the other accepts or rejects; a rejection means both get nothing.

## Rules

- Pie: ₹10,000. Offers come in ₹1,000 steps (₹0, ₹1,000, …, ₹10,000).
- The Proposer offers *x* to the Responder.
- Accept → (Proposer, Responder) = (10,000 − x, x). Reject → (0, 0).

## What the class does

- **Round A:** the class is the Proposer. The Responder is a stranger with a hidden fairness level α, drawn from an illustrative population (see below).
- **Round B:** the class is the Responder and uses the *strategy method*: it sets the smallest offer it will accept before seeing the offer. The offer comes from an illustrative "human-like" Proposer.
- The round ends on one of two screens: **Accepted** or **Zero payout**.

## Solving it: backward induction

1. **Start at the last move.** A Responder who only cares about money compares *x* with 0. Any *x* > 0 beats 0, so they accept. At *x* = 0 they are indifferent.
2. **Go back one move.** The Proposer knows this, so they offer the smallest positive amount: **₹1,000**, keeping ₹9,000.
3. **Two subgame-perfect equilibria (SPNE)** exist in the discrete game:
   - Responder accepts any x > 0 and rejects 0 → Proposer offers ₹1,000 → payoffs (9,000, 1,000).
   - Responder accepts any x ≥ 0 → Proposer offers ₹0 → payoffs (10,000, 0).

**Why "subgame perfect"?** A threat like "I'll reject anything under ₹5,000" is a Nash equilibrium strategy, but it is not credible: once a ₹1,000 offer is actually on the table, rejecting it gives the Responder 0 instead of 1,000. SPNE throws out such empty threats by requiring optimal play in every subgame.

## Fairness as a payoff (Fehr–Schmidt)

Real people reject low offers. Fehr–Schmidt inequity aversion explains this by adding a penalty for getting less than the other person:

U_R(x) = x − α · max(10,000 − 2x, 0)

- α measures how much a rupee of disadvantage hurts.
- The Responder rejects when U_R(x) < 0, which happens when **x < 10,000·α / (1 + 2α)**.

| α | Rejects below | Best offer on the ₹1,000 grid |
|---|---|---|
| 0.25 | ₹1,667 | ₹2,000 |
| 0.5 | ₹2,500 | ₹3,000 |
| 1.0 | ₹3,333 | ₹4,000 |

As α → ∞ the threshold approaches ₹5,000 (half the pie) but never reaches it.

## Simulation insights

The populations below are **illustrative** (shaped like classic lab results, not measured):

- Hidden-α Responders: 25% α = 0, 30% α = 0.25, 30% α = 0.5, 15% α = 1.
- Expected Proposer payoff per offer: ₹1,000 → ₹2,250 (accepted 25%), ₹2,000 → ₹4,400, ₹3,000 → ₹5,950, **₹4,000 → ₹6,000 (best, accepted 100%)**, ₹5,000 → ₹5,000.
- As Responder against human-like offers, expected money is ₹3,880 for a minimum of ₹0 or ₹1,000 and falls as the minimum rises (₹4,000 → ₹3,220, ₹5,000 → ₹2,020). Pride costs money.

## Numbers to remember

- SPNE offer: **₹1,000** (and ₹0).
- Thresholds: **₹1,667 / ₹2,500 / ₹3,333** for α = 0.25 / 0.5 / 1.
- In lab studies (Camerer, *Behavioral Game Theory*, 2003) typical offers are 40–50% and offers under 20% are often rejected.

## Likely questions

- **Why doesn't the Responder threaten to reject low offers?** The threat isn't credible: carrying it out lowers their own payoff. Backward induction removes it.
- **Is rejecting a low offer irrational?** Only if payoff = money. If fairness enters the utility (Fehr–Schmidt), rejecting is a best response.
- **Why are there two SPNEs?** Because at x = 0 the Responder is exactly indifferent; either tie-break is optimal. With continuous money the "smallest positive offer" doesn't exist, which is why the discrete version is cleaner.
- **What is the strategy method?** Asking for a full plan (a minimum acceptable offer) before seeing the move, so you learn what the player would do at every offer.

**Code:** `src/engine/ultimatum.ts`, tests in `src/engine/ultimatum.test.ts`.

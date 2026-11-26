# Game 4: The Waiting Game (war of attrition)

**One line:** two roommates wait to see who cracks and takes out the trash; waiting costs both of them every minute.

## Setup

- Not having to take the trash out is worth **V = ₹200** to each roommate.
- Every minute of the standoff costs each roommate **c = ₹20**.
- Whoever concedes takes the trash. If the standoff lasts t minutes, the winner gets V − c·t and the loser gets −c·t.

## What the class does

The class is roommate A and votes every simulated minute: **wait** or **concede**. The other roommate plays the equilibrium: it concedes in each minute with the equilibrium probability (1 − e^(−λ) ≈ 9.5% per minute with constant cost). The screen shows a minute counter, a growing trash pile and both "misery spent" meters.

## Solving it: the indifference condition

In a tiny moment dt:
- Waiting costs c·dt.
- With probability λ·dt the rival gives in, and you win V.

You only randomise if you're indifferent, so **λ·V = c**, giving

**λ* = c / V = 20 / 200 = 0.1 per minute.**

λ is a *hazard rate*: the chance of quitting right now, given you haven't yet.

## Consequences

- Each player's quitting time is exponential with mean 1/λ = **10 minutes**.
- The standoff ends at the *first* quit. Two independent quitters at rate λ means the standoff ends at rate 2λ, so its expected length is 1/(2λ) = **5 minutes**.
- Expected total waiting cost = 2c × 5 = **₹200 = V**. **Full rent dissipation:** on average the fight burns the entire prize, and each player's expected payoff is ₹0.
- P(both still waiting after 10 minutes) = e^(−2λ·10) = e^(−2) ≈ **0.135**.
- Constant hazard means the process is **memoryless**: having waited 9 minutes tells you nothing about minute 10.

## Escalating cost toggle (the trash piles up)

If the cost grows, c(t) = c₀ + g·t, then:
- hazard λ(t) = c(t) / V (rises in a straight line)
- survival S(t) = exp(−(c₀·t + g·t²/2) / V)

Quitting gets more attractive every minute, so standoffs end sooner.

## Asymmetric toggle

If the roommates differ, **λ_A = c_B / V_B** and **λ_B = c_A / V_A**. Your quitting rate keeps your *opponent* indifferent, so it is set by *their* cost and value. If the rival finds waiting cheap (low c_B) or the prize precious (high V_B), *you* quit more slowly, because a slower quitting rate is what keeps a patient rival indifferent. Their rate c_A/V_A is set by *your* numbers. This mirrors the Chicken result: your mix is set by your opponent's payoffs.

## Simulation insights

Thousands of equilibrium standoffs: average length ≈ 5 minutes, average total burned ≈ ₹200, each roommate wins about 50%, and about 13.5% are still going at 10 minutes. The histogram of lengths follows the exponential curve with rate 2λ.

## Likely questions

- **Why randomise instead of picking a time?** If you always quit at a fixed time, your rival waits one second longer and wins. Only a constant hazard leaves no time worth deviating from.
- **Why is the expected payoff zero?** The prize gets competed away: the expected waiting cost exactly equals V.
- **Real examples?** Strikes and lockouts, price wars, patent races, bidding for a monopoly, two people waiting to see who apologises first.

**Code:** `src/engine/attrition.ts`, tests in `src/engine/attrition.test.ts`.

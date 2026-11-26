# Game 2: Game of Chicken (the flagship game)

**One line:** two drivers on a one-lane bridge choose to swerve or go straight at the same time; whoever swerves alone loses face, and if neither swerves they crash.

## Payoffs (row = Driver A, column = Driver B)

|  | B swerves | B straight |
|---|---|---|
| **A swerves** | (0, 0) | (−1, 1) |
| **A straight** | (1, −1) | (−10, −10) |

## What the class does

The left half of the room drives car A and the right half drives car B. Both sides count hands, then one button locks both sides at once, so neither side sees the other first (a simultaneous move). The cars drive, and the freeze frame shows the class's cell in the matrix.

## Solving it

### 1. Best responses
- If B goes straight, A's best reply is swerve (−1 beats −10).
- If B swerves, A's best reply is straight (1 beats 0).
- Same for B by symmetry.

### 2. Pure Nash equilibria
Where both best responses meet: **(Swerve, Straight)** and **(Straight, Swerve)**. Someone has to blink, but the theory doesn't say who. That is a coordination problem.

### 3. Mixed-strategy equilibrium (by indifference)
Let q = P(B goes straight). A must be indifferent between its two moves, or it wouldn't randomise:

- E[A swerves] = (1 − q)·0 + q·(−1) = −q
- E[A straight] = (1 − q)·1 + q·(−10) = 1 − 11q
- −q = 1 − 11q → **q = 0.1**

By symmetry, p = P(A goes straight) = **0.1**.

- P(crash) = p · q = **0.01**
- Expected payoff = **−0.1** each, worse than either pure equilibrium for at least one driver.

**Key idea:** each player's mix is chosen to make the *other* player indifferent, so it is determined by the *opponent's* payoffs.

### 4. Risk dominance (Harsanyi–Selten)
For each pure equilibrium, multiply the two players' losses from deviating alone (the "Nash product"):

- (A straight, B swerve): A's loss (1 − 0) × B's loss (−1 − (−10)) = 1 × 9 = **9**
- (A swerve, B straight): 9 × 1 = **9**

The products tie, so **neither equilibrium is risk dominant** in the symmetric game.

## Asymmetric toggle: truck vs car

The truck (row) only loses 4 in a crash; the car still loses 10. Everything else is unchanged.

- Truck straight probability q = **0.1** (set by the **car's** payoffs: the car has to be indifferent)
- Car straight probability r = **0.25** (set by the **truck's** payoffs)
- P(crash) = 0.1 × 0.25 = **0.025**
- Expected payoffs: truck −0.25, car −0.1
- Nash products: (Truck straight, Car swerve) = 1 × 9 = **9**; (Truck swerve, Car straight) = 3 × 1 = **3** → **truck-straight is risk dominant**.

The surprise to point out: making the truck *tougher* makes the **car** go straight more often, not the truck.

## Simulation insights

- Run thousands of nights at the mixed equilibrium: the crash rate settles on 1% (2.5% in truck mode).
- "Expected payoff for each of your own mixes" is a **flat line** when the opponent plays the equilibrium mix. That flatness *is* the indifference condition.
- The best-response diagram crosses three times: two pure equilibria at the corners and the mixed one at (0.1, 0.1).

## Numbers to remember

p = q = 0.1 · crash 1% · payoff −0.1 · Nash products 9 = 9. Truck mode: 0.1 / 0.25 · crash 2.5% · products 9 > 3.

## Likely questions

- **Why would anyone randomise?** If your choice were predictable, the other driver would exploit it. Mixing so they're indifferent is the only stable way to play without coordinating.
- **Why does the truck's toughness change the car's behaviour?** The truck mixes to keep the car indifferent, so its mix depends on the car's payoffs. The car mixes to keep the truck indifferent, so the car's mix depends on the truck's payoffs. A tougher truck needs the car to go straight more often before the truck is willing to swerve.
- **Which equilibrium happens in real life?** Theory can't say in the symmetric game. Commitment (visibly removing your steering wheel), reputation or asymmetry decides it, which is the risk-dominance point.
- **Is the mixed equilibrium good?** No: crashes still happen. Rational players, bad outcome.

**Code:** `src/engine/chicken.ts` and the generic 2×2 solver `src/engine/bimatrix.ts`; tests in `src/engine/chicken.test.ts`.

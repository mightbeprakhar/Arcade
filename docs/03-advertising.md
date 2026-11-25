# Level 3: Advertising Game (repeated Prisoner's Dilemma)

**One line:** two coffee shops choose each week to advertise or save; advertising is always individually better, yet both end up worse off.

## Payoffs per week (₹ thousands; row = Brew Theory, column = Bean There)

|  | Rival saves | Rival advertises |
|---|---|---|
| **Save** | (60, 60) | (30, 80) |
| **Ad** | (80, 30) | (40, 40) |

T (temptation) = 80, R (reward) = 60, P (punishment) = 40, S (sucker) = 30.

**Why it's a Prisoner's Dilemma:** T > R > P > S (80 > 60 > 40 > 30), and 2R > T + S (120 > 110), so taking turns exploiting each other is worse than steady cooperation.

## What the class does

The class runs Brew Theory for 20 weeks against a rival with a fixed playbook (chosen by the presenter, or a hidden "mystery" one). Each week: vote, lock, see the rival's move. "Autoplay the rest" finishes the match quickly if time is short.

## Solving it

### One week
- Rival saves: Ad gives 80 > Save 60.
- Rival advertises: Ad gives 40 > Save 30.
- So **Ad strictly dominates**; the only Nash equilibrium is (Ad, Ad) = (40, 40), which is **Pareto-dominated** by (Save, Save) = (60, 60).

### Finite horizon (20 known weeks)
Week 20 is a one-shot game → Ad. Knowing that, week 19 is effectively one-shot too → Ad. Unravelling back to week 1: the **SPNE is Ad every week**, giving 20 × 40 = **₹800k**.

### Infinite horizon (unknown end)
Let δ be how much next week matters (or the chance there is a next week).
- Cooperate forever: R + δR + δ²R + … = R / (1 − δ)
- Deviate once against Grim Trigger: T now, then P forever = T + δP / (1 − δ)
- Cooperation is self-enforcing iff R/(1 − δ) ≥ T + δP/(1 − δ), i.e. **δ ≥ (T − R)/(T − P) = 20/40 = 0.5**.

## The strategies

| Strategy | Rule |
|---|---|
| Always Ad | Advertise every week |
| Always Save | Never advertise |
| Tit-for-Tat (TFT) | Save first, then copy the rival's last move |
| Grim Trigger | Save until the rival advertises once, then advertise forever |
| Pavlov (win-stay, lose-shift) | Repeat your move after a good result (T or R), switch after a bad one (P or S) |
| Generous TFT | Like TFT, but forgives an Ad 25% of the time |
| Random | Fair coin each week |

Checks from the tests: **TFT vs Always Ad over 20 weeks = (790, 840)**; **TFT vs TFT = (1,200, 1,200)**.

## Tournament (round robin plus self-play, 20 weeks, averaged over 200 repeats)

| Noise | Top of the table |
|---|---|
| 0% | Grim Trigger 7,969 · Tit-for-Tat 7,829 · Pavlov 7,750 · Generous TFT 7,745 · Always Save 7,510 · Always Ad 7,501 · Random 7,186 |
| 5% | Grim Trigger 7,605 · **Always Ad 7,569** · Pavlov 7,464 · Tit-for-Tat 7,436 · … |
| 10% | **Always Ad 7,602** · Grim Trigger 7,562 · Pavlov 7,360 · … |

Noise means each intended move is flipped by mistake with that probability. One accidental Ad sends Grim into permanent war and TFT into echoing retaliation, so the reciprocal strategies lose their edge and Always Ad climbs. We show this rather than hide it.

## Likely questions

- **If Ad is dominant, why did the class save?** Repetition: future weeks make cooperation valuable, and people reciprocate. The finite-horizon SPNE says otherwise, but it relies on everyone reasoning all the way back from week 20.
- **Why does Grim beat TFT at 0% noise?** Against Random, Grim switches to Ad permanently and stops being exploited; TFT keeps getting suckered every other week.
- **What does noise teach?** Strict reciprocity is fragile. Forgiveness (Generous TFT, Pavlov) helps recover from mistakes, and at high noise unconditional defection does well.
- **Real examples?** Cola wars, telecom price cuts, food-delivery discounts, arms races.

**Code:** `src/engine/advertising.ts`, tests in `src/engine/advertising.test.ts`.

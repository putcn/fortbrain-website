---
title: Sales forecasting: what we tried on real store data, and how accurate it got
date: 2026-10-02
tags: tech
summary: Rolling backtests of the Chronos-2 foundation model on 16 months of real sales from a 21-store chain: three targets, two models, calibration, holidays, weather. What passed, what failed, and how large the errors really are.
---

Fortbrain's forecast engine answers three questions for a store: **how much revenue each day for the next two weeks** (revenue), **how many units of this product this store will sell in the next 45 days** (purchasing), and **how many in the next two weeks** (replenishment). In September 2026 the production model lagged one to two weeks behind the post-summer drop; weekly WAPE reached 1.04, worse than simply repeating last week. We stopped and ran a systematic set of experiments. This is what we did, what we concluded, and what is still missing.

## Rules first, results second

- **No peeking**: every backtest window uses only data before its start, including for fine-tuning.
- **Pass criteria written down in advance**: each experiment states how much better it must be before it runs. An idea that came from looking at results cannot be validated on the same data.
- **Two random seeds**: LoRA fine-tuning is stochastic; differences smaller than the seed spread are not conclusions.
- **Nothing ships unless it beats the production model and "repeat last week".**

Data: a local chain, 21 stores, 1,314 products, 2,864 store × product series, 480 days from June 2025 to September 2026. At store × product × day granularity, **eight cells in ten are zero**.

## Three targets, two models

| Target | What is forecast | Model |
|---|---|---|
| Revenue | Each store's daily revenue, next 14 days | Store × day revenue series (21 series, dense) |
| Purchasing | Units per store × product over the next 45 days | Store × product × 7-day blocks (2,864 series) |
| Replenishment | Units per store × product over the next 14 days | Same model, first two blocks |

The base model is Chronos-2, fine-tuned with LoRA on local data and re-tuned every 28 days; both models take calendar covariates (holidays, summer break, weekends, weekday) and "same period last year". Revenue is **not summed from products**: a store's daily revenue is an aggregate series and far more stable.

We also tried a dedicated replenishment model tuned to predict only two weeks. It was worse by 1.3–2.2 points: tuning on a longer horizon forces the model to learn multi-week movements, and that helps the near term too. **Two models, not three.**

## How accurate

The final scheme, rolling backtests on cut-offs from June 2026 (bias = forecast ÷ actual − 1, negative = under-forecast):

| Target | Total bias | WAPE | Note |
|---|---|---|---|
| Revenue (store × day, 14 d) | **−4.7%** | 40.8% | 49.5% of chain-wide days within ±20%; only 25% of single store-days |
| Purchasing (store × product, 45 d) | −17.1% | 42.6% | only 5 cut-offs, small sample |
| Replenishment (store × product, 14 d) | −7.3% | 45.0% | |

Three patterns. **Aggregates are more accurate than parts.** **The median per-product bias is negative** (most products under, a few far over), so purchasing and replenishment that must avoid stock-outs should take a high quantile by service level instead. **Seasonal transitions carry the largest errors** (purchasing −29.5% in July as summer ramps up, revenue +21.5% in September as it ends). Only about 4 of the 21 stores have last-year data that could warn the model of the turn; after a full year of data this improves by itself.

## Calibration: what works, what overshoots

The median minimises WAPE but is **systematically low**. We compared ten calibrations:

- **Quantile selected by backtest** is the sound one: before each forecast, pick the quantile (60%–80%) whose total was closest to actual on the last two historical folds. Weekly total error fell from 0.390 to 0.268 (**a third less**), WAPE unchanged, no hand-written numbers anywhere.
- **Rolling calibration overshoots every time**: correcting the next forecast by the last few errors turned under-forecasts into +6% to +24% over. Bias swings with the season; this correction is always one step behind.
- **Top-down** (forecast the total, split by share) does not help: the aggregate cannot keep up with a ramp either.

## Holidays: feed them, and fine-tune with them

- Holiday covariates fed to an un-tuned model help sometimes and hurt sometimes; **with fine-tuning they improve all five windows**. The model has to learn from our own data how holiday days map to sales.
- Adding the calendar to the per-product daily model cut holiday-week WAPE from 78% to 66% and under-forecasting from −53% to −34%, at roughly 4× inference time.
- **Make-up workdays** (weekend days worked to extend a holiday) were treated as weekends and over-forecast by 47%–61%; fed as workdays, their WAPE dropped from 106% to 70%.
- **Last day of a holiday block**: in our data the model systematically over-forecasts the last day (90% over on Mid-Autumn day). That idea came from looking at results, so it could not be validated on the same data. We tested it on an independent public dataset, eight years of daily visitor counts at the Jiuzhaigou national park: a single "last day of the block" column cut last-day WAPE from 43% to 22% and bias from +41% to +8%, with other days unaffected. Spring Festival is the exception (its last day stays busy) and is excluded. The column is in production now.

## Weather: the effect is real, the gate was not passed

- Precipitation and temperature as covariates in the revenue model: rainy days were corrected (from +15% over to −2%), but non-rainy days got 1 point worse, rain is only a fifth of days, and the two cancelled out; overall WAPE slightly worse. **Not shipped.**
- A narrower rule: when the forecast says ≥ 10 mm of rain in the next 1–3 days, multiply those days by a factor learned from history (about 0.83). Both seeds passed: triggered days improved by 3.8 WAPE points, bias from +21% to −5%. Only 13 days a year trigger, so the weight is modest.
- Folding cold, heat, rain, wind and snow into a three-level "comfort" score: **failed**; the score does not separate good days from bad. The only clear single factor is a **temperature drop of ≥ 8 °C** (actual revenue 63% of forecast), on 16 days only, pending new data.

## Next

1. National Day 2026 is a true out-of-sample test: forecasts stored at the end of September, compared with actuals in November. More credible than any backtest.
2. With a full year of data, every store gets a last-year reference and transition-month errors should narrow.
3. The calendar-aware product model is 4× slower at inference; before it ships, either offload to a local GPU or cut nightly inference volume by most of it.

Every script, criterion and result stays in the repository, and every conclusion can be reproduced. Whether a forecast is good is decided by the data.

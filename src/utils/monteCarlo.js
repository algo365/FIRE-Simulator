/**
 * Monte Carlo simulation for FIRE.
 *
 * Runs `numSims` simulations, each using a randomly drawn annual return
 * from a Normal distribution with mean=CAGR and stdDev=volatility (default 4%).
 *
 * Returns survival probability at each age, plus corpus percentile bands.
 */

function gaussianRandom(mean, stdDev) {
  // Box-Muller transform
  let u, v;
  do { u = Math.random(); } while (u === 0);
  do { v = Math.random(); } while (v === 0);
  return mean + stdDev * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

export function runMonteCarlo(params, numSims = 1000, volatility = 4) {
  const {
    currentAge,
    retireAge    = currentAge,
    lifeExpectancy,
    initialCorpus,
    monthlyExpense,
    cagr,
    inflationRate,
    additionalMonthlyIncome,
    monthlySIP,
    bigExpenses = [],
  } = params;

  const inflationFactor = 1 + inflationRate / 100;
  const annualIncome    = additionalMonthlyIncome * 12;
  const annualSIP       = monthlySIP * 12;
  const ageRange        = lifeExpectancy - currentAge + 1;

  const survivalCounts  = new Array(ageRange).fill(0);
  const corpusMatrix    = Array.from({ length: ageRange }, () => []); // [ageIdx][simIdx]

  for (let sim = 0; sim < numSims; sim++) {
    let corpus       = initialCorpus;
    let annualExpense = monthlyExpense * 12;
    let alive        = true;

    for (let i = 0; i < ageRange; i++) {
      const age = currentAge + i;

      if (!alive) {
        corpusMatrix[i].push(0);
        continue;
      }

      corpusMatrix[i].push(Math.max(0, corpus));
      survivalCounts[i]++;

      const yearBigExp = (bigExpenses || [])
        .filter(e => parseInt(e.age) === age)
        .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

      const yearReturn = gaussianRandom(cagr, volatility) / 100;

      if (age < retireAge) {
        // Pre-retirement: corpus grows + SIP, no living-expense withdrawals
        corpus = corpus * (1 + yearReturn) - yearBigExp + annualSIP;
        annualExpense *= inflationFactor;  // expense inflates toward retireAge
      } else {
        // Retirement: full SWP withdrawal
        corpus = corpus * (1 + yearReturn)
               - annualExpense
               - yearBigExp
               + annualIncome
               + annualSIP;
        annualExpense *= inflationFactor;
      }

      if (corpus <= 0) alive = false;
    }
  }

  // Compute percentile bands per age
  const pct = (arr, p) => {
    const sorted = [...arr].sort((a, b) => a - b);
    return sorted[Math.floor(sorted.length * p)];
  };

  const data = Array.from({ length: ageRange }, (_, i) => ({
    age:         currentAge + i,
    probability: (survivalCounts[i] / numSims) * 100,
    p10:         pct(corpusMatrix[i], 0.10),
    p25:         pct(corpusMatrix[i], 0.25),
    p50:         pct(corpusMatrix[i], 0.50),
    p75:         pct(corpusMatrix[i], 0.75),
    p90:         pct(corpusMatrix[i], 0.90),
  }));

  const survivalAtTarget = (survivalCounts[ageRange - 1] / numSims) * 100;

  // Find median depletion age (age where probability drops below 50%)
  const medianDepletionPoint = data.find(d => d.probability < 50);
  const medianDepletionAge   = medianDepletionPoint?.age ?? null;

  return { data, numSims, survivalAtTarget, medianDepletionAge };
}

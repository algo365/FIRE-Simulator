/**
 * FIRE Simulation Engine — Annual compounding model.
 *
 * Formula each year:
 *   corpus_next = corpus × (1 + CAGR) − annualExpense − bigExpenses + annualIncome + annualSIP
 *
 * Expenses increase by inflation each year.
 * Age-specific expense adjustments (e.g. "reduce by 20% at age 60") are applied once.
 */
export function runSimulation(params) {
  const {
    currentAge,
    lifeExpectancy,
    initialCorpus,
    monthlyExpense,
    cagr,
    inflationRate,
    additionalMonthlyIncome,
    monthlySIP,
    bigExpenses = [],
    expenseAdjustments = [],
  } = params;

  const cagrFactor      = 1 + cagr / 100;
  const inflationFactor = 1 + inflationRate / 100;
  const annualIncome    = additionalMonthlyIncome * 12;
  const annualSIP       = monthlySIP * 12;

  let corpus       = initialCorpus;
  let annualExpense = monthlyExpense * 12;
  let corpusZeroAge = null;
  const results = [];

  for (let age = currentAge; age <= lifeExpectancy; age++) {
    // Apply age-specific expense adjustments (one-time, at entry of this age)
    expenseAdjustments
      .filter(adj => parseInt(adj.age) === age)
      .forEach(adj => {
        annualExpense *= (1 + parseFloat(adj.percentChange || 0) / 100);
      });

    // One-time large expenses deducted at start of this age's year
    const yearBigExp = bigExpenses
      .filter(e => parseInt(e.age) === age)
      .reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);

    const displayCorpus   = Math.max(0, corpus);
    const netWithdrawal   = Math.max(0, annualExpense - annualIncome);
    const withdrawalRate  = displayCorpus > 0 ? (netWithdrawal / displayCorpus) * 100 : 0;

    results.push({
      age,
      year:          new Date().getFullYear() + (age - currentAge),
      corpus:        displayCorpus,
      annualExpense,
      annualIncome,
      annualSIP,
      yearBigExp,
      netWithdrawal,
      withdrawalRate,
    });

    if (corpus <= 0) {
      if (corpusZeroAge === null) corpusZeroAge = age;
      break;
    }

    // Compute next year corpus
    corpus = corpus * cagrFactor
           - annualExpense
           - yearBigExp
           + annualIncome
           + annualSIP;

    // Inflate expenses for next year
    annualExpense *= inflationFactor;
  }

  return { results, corpusZeroAge };
}

/**
 * Simulate corpus with NO withdrawals — pure compounding + SIP.
 * Used as a comparison line in charts.
 */
export function runNoWithdrawalSimulation(params) {
  const { currentAge, lifeExpectancy, initialCorpus, cagr, monthlySIP } = params;
  const cagrFactor = 1 + cagr / 100;
  const annualSIP  = monthlySIP * 12;

  let corpus = initialCorpus;
  return Array.from({ length: lifeExpectancy - currentAge + 1 }, (_, i) => {
    const point = { age: currentAge + i, corpusNoWd: Math.max(0, corpus) };
    corpus = corpus * cagrFactor + annualSIP;
    return point;
  });
}

/**
 * Merge base simulation results with no-withdrawal comparison into
 * a single array for charting.
 */
export function mergeChartData(results, noWdResults) {
  const noWdMap = {};
  noWdResults.forEach(r => { noWdMap[r.age] = r.corpusNoWd; });
  return results.map(r => ({ ...r, corpusNoWd: noWdMap[r.age] ?? 0 }));
}

/**
 * Merge scenario results for comparison chart.
 * Returns: [{ age, scenario_0, scenario_1, ... }]
 */
export function mergeScenarioData(scenarios) {
  const allAges = new Set();
  scenarios.forEach(s => s.results.forEach(r => allAges.add(r.age)));

  return Array.from(allAges)
    .sort((a, b) => a - b)
    .map(age => {
      const point = { age };
      scenarios.forEach((s, i) => {
        const yr = s.results.find(r => r.age === age);
        point[`s${i}`] = yr ? yr.corpus : 0;
      });
      return point;
    });
}

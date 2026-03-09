# 🔥 FIRE Simulator — India Edition

An interactive **Financial Independence Retire Early** simulation tool built with React + Recharts + Tailwind CSS.

## Features

| Feature | Details |
|---------|---------|
| **Core Simulation** | Year-by-year corpus projection with annual compounding |
| **Real-time sliders** | Every parameter updates graphs instantly |
| **Expense modeling** | Constant expenses with inflation, age-based adjustments |
| **One-time expenses** | Add big future costs (wedding, renovation, medical) |
| **Monte Carlo** | 500–5000 simulations with variable volatility (σ = 2–8%) |
| **Scenario comparison** | Save and overlay up to 5 different scenarios |
| **Projection table** | Full year-by-year data table with all metrics |
| **Indian formatting** | All amounts in ₹ Cr / ₹ L notation |

## Default Scenario

| Parameter | Value |
|-----------|-------|
| Current Age | 43 |
| Life Expectancy | 90 |
| Corpus | ₹10 Crore |
| Monthly Expense | ₹1 Lakh |
| CAGR Return | 12% |
| Inflation | 6% |
| Debt / EMI | None |
| Additional Income | ₹0 |
| Monthly SIP | ₹0 |

## Getting Started

### Prerequisites
- Node.js 18+
- npm or pnpm

### Install and Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for production

```bash
npm run build
npm run preview
```

## Simulation Formula

```
Corpus_next = Corpus × (1 + CAGR%)
            − Annual Expense (inflation-adjusted)
            − One-time Expenses (for this year)
            + Additional Annual Income
            + Annual SIP Contribution
```

Annual expenses grow by the inflation rate each year.
Age-specific adjustments (e.g., "reduce 20% at age 60") modify the expense base permanently.

## Monte Carlo Methodology

- Annual returns are drawn from a Normal distribution: **N(CAGR, σ)**
- Default σ = 4% (configurable to 2%, 4%, 6%, 8%)
- Each simulation runs independently from age 0 to life expectancy
- Results show:
  - **Survival probability** at each age
  - **Corpus percentile bands** (P10, P50, P90)
  - **Probability of lasting** to life expectancy

## Tech Stack

- **React 18** — UI framework
- **Recharts 2** — All charts (AreaChart, LineChart, ComposedChart)
- **Tailwind CSS 3** — Styling
- **Vite 5** — Build tool

## Project Structure

```
src/
├── App.jsx                     # Main app, state, tabs
├── utils/
│   ├── simulation.js           # Core FIRE simulation math
│   ├── monteCarlo.js           # Monte Carlo engine
│   └── formatting.js           # Indian number formatting, colors
└── components/
    ├── InputPanel.jsx          # Left sidebar with all inputs
    ├── SliderInput.jsx         # Reusable slider component
    ├── BigExpensesInput.jsx    # One-time future expenses
    ├── ExpenseRulesInput.jsx   # Age-based expense adjustments
    ├── SummaryCards.jsx        # Key metrics cards
    ├── CorpusChart.jsx         # Main corpus projection chart
    ├── ExpenseIncomeChart.jsx  # Expense vs income + withdrawal rate
    ├── MonteCarloPanel.jsx     # Monte Carlo chart + controls
    └── ScenarioPanel.jsx       # Scenario comparison + table
```

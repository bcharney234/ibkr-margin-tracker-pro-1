# IBKR Margin Tracker Pro

IBKR Margin Tracker Pro is a comprehensive, client-side dashboard for advanced portfolio risk and margin analysis. It provides traders with critical insights into their portfolio's health, leverage, potential risks, and dividend performance without needing to send any data to a server.

The application loads with a default mock portfolio and allows users to upload their own data via a simple CSV file for real-time analysis.

---

## Features

-   **Real-Time Portfolio Metrics**: Instantly calculate and display Net Liquidation Value (NLV), Excess Liquidity, Buying Power, Leverage, and overall Margin Health.
-   **Advanced Dividend Analysis**: Project future dividend income, calculate Yield on Cost (YOC), and determine how well dividends cover margin interest.
-   **Robust Stress Testing**:
    -   Run multi-scenario simulations to see how market downturns affect your portfolio's health.
    -   Calculate the exact market drop percentage that would trigger a margin call.
    -   Estimate potential single-day losses using a simplified Monte Carlo for Value at Risk (VaR).
-   **Options Hedging Payoff Analysis**: Model the max profit, max loss, and breakeven points for common hedging strategies like Long Puts, Bear Put Spreads, Cash-Secured Puts, and Covered Calls.
-   **Secure CSV Import**: Upload your portfolio data using a CSV file. All processing happens locally in your browser, ensuring your financial data remains private.

---

## Key Formulas Used

-   **Net Liquidation Value (NLV)**: `Market Value of Holdings + Cash - Margin Used`
-   **Excess Liquidity**: `NLV - Maintenance Margin Requirement (25% of Market Value)`
-   **Buying Power**: `Excess Liquidity / Initial Margin Requirement (50%)`
-   **Leverage**: `Market Value / NLV`
-   **Margin Health**: `(Excess Liquidity / NLV) * 100`
-   **Yield on Cost (YOC)**: `Total Annual Dividends / Total Cost Basis`
-   **Margin Call Threshold (%)**: `(1 - (Margin Loan / (Market Value * (1 - Maintenance Margin Requirement)))) * 100`

---

## Example Usage & Instructions

### Prerequisites

-   Node.js and npm (or yarn) installed on your system.

### 1. Installation

Clone the repository or save all the files from this project into a local directory. Open your terminal in the project's root directory and run:

```bash
npm install
```

### 2. Running the Application

To start the development server and launch the application in your browser, run:

```bash
npm start
```

The application will open at `http://localhost:3000`.

### 3. Running Tests

To run the complete Jest test suite and see a coverage report, run:

```bash
npm test
```

The tests will verify all utility functions and the main component rendering, ensuring all calculations are correct.

### 4. Using the CSV Upload

1.  Use the `public/portfolio-template.csv` file as a reference.
2.  Create a CSV with your own portfolio data, ensuring all columns are present. Note that `cash` and `marginUsed` values are only read from the first data row.
3.  Drag and drop the file onto the upload area in the dashboard, or click to select it. The dashboard will update instantly with your data.

---

## ⚠️ Risk Warning

This is a tool for educational and informational purposes only. It is **not** financial advice. The calculations are based on standard financial formulas but may not perfectly reflect the specific margin calculations of your broker (e.g., Interactive Brokers), which can be more complex.

Always consult with a qualified financial professional before making any investment decisions. Do not rely solely on this tool for managing your portfolio's risk.
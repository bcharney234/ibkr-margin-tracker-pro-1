import { calculateAllMetrics } from './metrics';

/**
 * Runs a single stress scenario by applying a market drop percentage.
 *
 * @param {object} portfolio - The original portfolio object.
 * @param {number} dropPercent - The percentage drop to apply to holdings.
 * @returns {object} The new portfolio metrics after the drop.
 */
export function runSingleScenario(portfolio, dropPercent) {
  if (!portfolio || !portfolio.holdings) return {};
  const stressedHoldings = portfolio.holdings.map(h => ({
    ...h,
    marketValue: h.marketValue * (1 - dropPercent),
  }));

  const stressedPortfolio = { ...portfolio, holdings: stressedHoldings };
  return calculateAllMetrics(stressedPortfolio);
}

/**
 * Calculates Value at Risk (VaR) using a simplified Monte Carlo method.
 *
 * @param {object} portfolio - The portfolio object.
 * @param {number} confidenceLevel - The confidence level (e.g., 0.95).
 * @param {number} timeHorizonDays - The time horizon in days.
 * @param {number} [dailyVolatility=0.02] - Assumed average daily market volatility.
 * @param {number} [simulations=1000] - Number of simulations to run.
 * @returns {object} An object containing the VaR.
 */
export function calculateVaR(portfolio, confidenceLevel, timeHorizonDays, dailyVolatility = 0.02, simulations = 1000) {
    if (!portfolio || !portfolio.holdings) return { VaR: "0.00" };
    const marketValue = portfolio.holdings.reduce((acc, h) => acc + h.marketValue, 0);
    if (marketValue === 0) {
        return { VaR: "0.00", confidenceLevel: `${confidenceLevel * 100}%`, timeHorizon: `${timeHorizonDays} day(s)` };
    }

    const losses = [];
    for (let i = 0; i < simulations; i++) {
        let simMarketValue = marketValue;
        for (let t = 0; t < timeHorizonDays; t++) {
            const u1 = Math.random();
            const u2 = Math.random();
            const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
            simMarketValue *= (1 + z * dailyVolatility);
        }
        losses.push(marketValue - simMarketValue);
    }

    losses.sort((a, b) => a - b);
    const varIndex = Math.floor(simulations * confidenceLevel);
    const valueAtRisk = losses[varIndex];

    return {
        VaR: valueAtRisk > 0 ? valueAtRisk.toFixed(2) : "0.00",
        confidenceLevel: `${confidenceLevel * 100}%`,
        timeHorizon: `${timeHorizonDays} day(s)`,
    };
}

/**
 * Determines the market drop percentage at which a margin call would be triggered.
 *
 * @param {object} portfolio - The portfolio object.
 * @param {number} [maintMarginReq=0.25] - Maintenance margin requirement.
 * @returns {object} The margin call threshold as a percentage and value.
 */
export function getMarginCallThreshold(portfolio, maintMarginReq = 0.25) {
    if (!portfolio || !portfolio.holdings) return { dropPercentage: "N/A", marketValueDrop: "N/A" };
    const marketValue = portfolio.holdings.reduce((acc, h) => acc + h.marketValue, 0);
    const metrics = calculateAllMetrics(portfolio, 0.5, maintMarginReq);
    const nlv = parseFloat(metrics.netLiquidationValue);

    const marginLoan = marketValue + portfolio.cash - nlv;

    if (marginLoan <= 0 || marketValue === 0) {
        return { dropPercentage: "N/A", marketValueDrop: "N/A" };
    }

    const thresholdMarketValue = marginLoan / (1 - maintMarginReq);

    if (marketValue <= thresholdMarketValue) {
        return { dropPercentage: "0.00", marketValueDrop: "0.00" };
    }

    const marketValueDrop = marketValue - thresholdMarketValue;
    const dropPercentage = (marketValueDrop / marketValue) * 100;

    return {
        dropPercentage: dropPercentage.toFixed(2),
        marketValueDrop: marketValueDrop.toFixed(2),
    };
}

/**
 * Performs a basic correlation analysis based on sector concentration.
 *
 * @param {Array<object>} holdings - The portfolio holdings.
 * @returns {string} A descriptive analysis of portfolio concentration.
 */
export function analyzeCorrelation(holdings) {
    if (!holdings || holdings.length === 0) return "No assets to analyze.";
    const totalMarketValue = holdings.reduce((acc, h) => acc + (h.marketValue || 0), 0);
    if (totalMarketValue === 0) return "No market value to analyze.";
    if (holdings.length < 2) return "Portfolio is 100% concentrated in a single asset.";

    const sectors = holdings.reduce((acc, h) => {
        const sector = h.sector || 'Uncategorized';
        acc[sector] = (acc[sector] || 0) + h.marketValue;
        return acc;
    }, {});

    const sortedSectors = Object.entries(sectors).sort(([, a], [, b]) => b - a);
    const topSector = sortedSectors[0];
    const topSectorConcentration = (topSector[1] / totalMarketValue) * 100;

    if (topSectorConcentration > 50) {
        return `High concentration risk: ${topSectorConcentration.toFixed(1)}% in ${topSector[0]}.`;
    }
    if (topSectorConcentration > 30) {
        return `Moderate concentration risk: ${topSectorConcentration.toFixed(1)}% in ${topSector[0]}.`;
    }

    return "Portfolio appears reasonably diversified across sectors.";
}
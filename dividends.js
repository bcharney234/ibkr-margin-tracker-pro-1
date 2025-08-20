/**
 * Calculates the annualized yield on the original cost of the holdings.
 *
 * @param {Array<object>} holdings - Array of portfolio holdings.
 * @returns {number} The yield on cost as a percentage.
 */
export function calcYieldOnCost(holdings) {
  if (!holdings || holdings.length === 0) return 0;
  const totalCost = holdings.reduce((acc, h) => acc + (h.costBasis || 0), 0);
  const totalAnnualDividend = holdings.reduce((acc, h) => acc + (h.annualDividend || 0), 0);
  if (totalCost <= 0) return 0;
  return (totalAnnualDividend / totalCost) * 100;
}

/**
 * Projects future dividend income over a given number of years.
 *
 * @param {Array<object>} holdings - Array of portfolio holdings.
 * @param {number} years - The number of years to project.
 * @param {number} [growthRate=0.05] - Assumed annual dividend growth rate.
 * @returns {Array<object>} An array of objects with year and projected income.
 */
export function projectDividends(holdings, years = 5, growthRate = 0.05) {
  if (!holdings) return [];
  const initialAnnualDividend = holdings.reduce((acc, h) => acc + (h.annualDividend || 0), 0);
  let projections = [];
  for (let i = 1; i <= years; i++) {
    const projectedIncome = initialAnnualDividend * Math.pow(1 + growthRate, i);
    projections.push({ year: new Date().getFullYear() + i, income: parseFloat(projectedIncome.toFixed(2)) });
  }
  return projections;
}

/**
 * Calculates the dividend coverage ratio against margin interest.
 *
 * @param {Array<object>} holdings - Array of portfolio holdings.
 * @param {number} marginUsed - The amount of margin used.
 * @param {number} [marginRate=0.06] - The annual margin interest rate.
 * @returns {number} The coverage ratio.
 */
export function dividendMarginCoverage(holdings, marginUsed, marginRate = 0.06) {
  if (!holdings) return 0;
  const totalAnnualDividend = holdings.reduce((acc, h) => acc + (h.annualDividend || 0), 0);
  const annualMarginInterest = marginUsed * marginRate;
  if (annualMarginInterest <= 0) return Infinity;
  return totalAnnualDividend / annualMarginInterest;
}

/**
 * Estimates the time in years to pay off margin debt using only dividends.
 *
 * @param {Array<object>} holdings - Array of portfolio holdings.
 * @param {number} marginUsed - The amount of margin used.
 * @returns {number|string} The number of years to pay off the margin, or "N/A".
 */
export function marginPayoffTime(holdings, marginUsed) {
  if (!holdings) return "N/A";
  const totalAnnualDividend = holdings.reduce((acc, h) => acc + (h.annualDividend || 0), 0);
  if (totalAnnualDividend <= 0 || marginUsed <= 0) return "N/A";
  const years = marginUsed / totalAnnualDividend;
  return isFinite(years) ? years : "N/A";
}
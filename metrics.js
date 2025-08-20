/**
 * Calculates all key portfolio and margin metrics.
 *
 * @param {object} portfolio - The portfolio object.
 * @param {number} [initialMarginReq=0.5] - Initial margin requirement (Reg T).
 * @param {number} [maintMarginReq=0.25] - Maintenance margin requirement.
 * @returns {object} An object containing all calculated metrics.
 */
export function calculateAllMetrics(portfolio, initialMarginReq = 0.5, maintMarginReq = 0.25) {
  if (!portfolio || !Array.isArray(portfolio.holdings) || typeof portfolio.cash !== 'number' || typeof portfolio.marginUsed !== 'number') {
    return {
      netLiquidationValue: "0.00", totalEquity: "0.00", marketValue: "0.00",
      leverage: "0.00", maintenanceMargin: "0.00", excessLiquidity: "0.00",
      buyingPower: "0.00", marginHealth: "0.00",
    };
  }

  const marketValue = portfolio.holdings.reduce((acc, h) => acc + (h.marketValue || 0), 0);
  const totalEquity = marketValue + portfolio.cash - portfolio.marginUsed;
  const netLiquidationValue = totalEquity;

  const totalMaintenanceMargin = marketValue * maintMarginReq;
  const excessLiquidity = netLiquidationValue - totalMaintenanceMargin;

  const buyingPower = Math.max(0, excessLiquidity / initialMarginReq);
  const leverage = netLiquidationValue > 0 ? marketValue / netLiquidationValue : 0;
  const marginHealth = netLiquidationValue > 0 ? (excessLiquidity / netLiquidationValue) * 100 : 0;

  return {
    netLiquidationValue: netLiquidationValue.toFixed(2),
    totalEquity: totalEquity.toFixed(2),
    marketValue: marketValue.toFixed(2),
    leverage: isFinite(leverage) ? leverage.toFixed(2) : "0.00",
    maintenanceMargin: totalMaintenanceMargin.toFixed(2),
    excessLiquidity: excessLiquidity.toFixed(2),
    buyingPower: buyingPower.toFixed(2),
    marginHealth: marginHealth.toFixed(2),
  };
}
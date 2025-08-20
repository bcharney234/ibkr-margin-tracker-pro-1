/**
 * Calculates the payoff profile for a long put option.
 *
 * @param {number} strike - The strike price of the put.
 * @param {number} premium - The premium paid for the option.
 * @param {number} contracts - The number of contracts.
 * @returns {object} Payoff profile.
 */
export function longPutPayoff(strike, premium, contracts = 1) {
  const perContractCost = premium * 100;
  const maxLoss = perContractCost * contracts;
  const breakeven = strike - premium;
  const maxProfit = (strike * 100 - perContractCost) * contracts;

  return {
    strategy: "Long Put",
    maxLoss: maxLoss.toFixed(2),
    maxProfit: maxProfit.toFixed(2),
    breakeven: breakeven.toFixed(2),
    description: "Profit when the underlying asset's price falls below the breakeven point.",
  };
}

/**
 * Calculates the payoff profile for a bear put spread.
 *
 * @param {number} longStrike - The strike price of the long put.
 * @param {number} shortStrike - The strike price of the short put.
 * @param {number} netPremium - The net premium paid for the spread.
 * @param {number} contracts - The number of contracts.
 * @returns {object} Payoff profile.
 */
export function bearPutSpreadPayoff(longStrike, shortStrike, netPremium, contracts = 1) {
  const maxLoss = netPremium * 100 * contracts;
  const maxProfit = (longStrike - shortStrike - netPremium) * 100 * contracts;
  const breakeven = longStrike - netPremium;

  return {
    strategy: "Bear Put Spread",
    maxLoss: maxLoss.toFixed(2),
    maxProfit: maxProfit.toFixed(2),
    breakeven: breakeven.toFixed(2),
    description: "A bearish strategy with limited risk and limited profit potential.",
  };
}

/**
 * Calculates the payoff profile for a cash-secured put.
 *
 * @param {number} strike - The strike price of the put.
 * @param {number} premium - The premium received.
 * @param {number} contracts - The number of contracts.
 * @returns {object} Payoff profile.
 */
export function cashSecuredPutPayoff(strike, premium, contracts = 1) {
  const maxProfit = premium * 100 * contracts;
  const breakeven = strike - premium;
  const maxLoss = (strike * 100 * contracts) - maxProfit;

  return {
    strategy: "Cash-Secured Put",
    maxLoss: maxLoss.toFixed(2),
    maxProfit: maxProfit.toFixed(2),
    breakeven: breakeven.toFixed(2),
    description: "A neutral to bullish strategy used to acquire stock at a lower price or generate income.",
  };
}

/**
 * Calculates the payoff profile for a covered call.
 *
 * @param {number} strike - The strike price of the call.
 * @param {number} premium - The premium received.
 * @param {number} costBasis - The cost basis of the underlying 100 shares.
 * @param {number} contracts - The number of contracts.
 * @returns {object} Payoff profile.
 */
export function coveredCallPayoff(strike, premium, costBasis, contracts = 1) {
  const premiumReceived = premium * 100 * contracts;
  const sharesCost = costBasis * 100 * contracts;
  const maxProfit = ((strike * 100 * contracts) - sharesCost) + premiumReceived;
  const breakeven = costBasis - premium;
  const maxLoss = sharesCost - premiumReceived;

  return {
    strategy: "Covered Call",
    maxLoss: maxLoss.toFixed(2),
    maxProfit: maxProfit.toFixed(2),
    breakeven: breakeven.toFixed(2),
    description: "Generate income from owned stock, with upside potential capped at the strike price.",
  };
}
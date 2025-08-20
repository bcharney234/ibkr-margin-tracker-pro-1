import { longPutPayoff, bearPutSpreadPayoff, cashSecuredPutPayoff, coveredCallPayoff } from '../utils/hedges';

describe('hedges utilities', () => {
  it('calculates long put payoff correctly', () => {
    const result = longPutPayoff(100, 5, 2);
    expect(result.maxLoss).toBe("1000.00");
    expect(result.breakeven).toBe("95.00");
    expect(result.maxProfit).toBe("19000.00");
  });

  it('calculates bear put spread payoff correctly', () => {
    const result = bearPutSpreadPayoff(100, 90, 3, 1);
    expect(result.maxLoss).toBe("300.00");
    expect(result.maxProfit).toBe("700.00");
    expect(result.breakeven).toBe("97.00");
  });

  it('calculates cash-secured put payoff correctly', () => {
    const result = cashSecuredPutPayoff(50, 2, 1);
    expect(result.maxProfit).toBe("200.00");
    expect(result.breakeven).toBe("48.00");
    expect(result.maxLoss).toBe("4800.00");
  });

  it('calculates covered call payoff correctly', () => {
    const result = coveredCallPayoff(120, 4, 110, 1);
    expect(result.maxProfit).toBe("1400.00");
    expect(result.breakeven).toBe("106.00");
    expect(result.maxLoss).toBe("10600.00");
  });
});
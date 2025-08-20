import { calcYieldOnCost, projectDividends, dividendMarginCoverage, marginPayoffTime } from '../utils/dividends';

describe('dividend utilities', () => {
  const mockHoldings = [
    { costBasis: 10000, annualDividend: 400 },
    { costBasis: 15000, annualDividend: 600 },
  ];

  it('calcYieldOnCost works correctly', () => {
    expect(calcYieldOnCost(mockHoldings)).toBeCloseTo(4.0);
    expect(calcYieldOnCost([])).toBe(0);
    expect(calcYieldOnCost(null)).toBe(0);
    expect(calcYieldOnCost([{ costBasis: 0, annualDividend: 100 }])).toBe(0);
  });

  it('projectDividends works correctly', () => {
    const projections = projectDividends(mockHoldings, 2, 0.1);
    expect(projections.length).toBe(2);
    expect(projections[0].income).toBeCloseTo(1100);
    expect(projectDividends(null)).toEqual([]);
  });

  it('dividendMarginCoverage works correctly', () => {
    expect(dividendMarginCoverage(mockHoldings, 20000, 0.05)).toBeCloseTo(1.0);
    expect(dividendMarginCoverage(mockHoldings, 0)).toBe(Infinity);
    expect(dividendMarginCoverage(null, 1000)).toBe(0);
  });

  it('marginPayoffTime works correctly', () => {
    expect(marginPayoffTime(mockHoldings, 25000)).toBeCloseTo(25);
    expect(marginPayoffTime(mockHoldings, 0)).toBe("N/A");
    expect(marginPayoffTime([], 1000)).toBe("N/A");
    expect(marginPayoffTime(null, 1000)).toBe("N/A");
  });
});
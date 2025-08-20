import { runSingleScenario, calculateVaR, getMarginCallThreshold, analyzeCorrelation } from '../utils/stress';

describe('stress testing utilities', () => {
  const mockPortfolio = {
    cash: 10000,
    marginUsed: 40000,
    holdings: [{ marketValue: 80000, sector: 'Tech' }],
  };

  it('runSingleScenario applies market drop correctly', () => {
    const stressedMetrics = runSingleScenario(mockPortfolio, 0.2);
    expect(stressedMetrics.marketValue).toBe("64000.00");
    expect(runSingleScenario(null, 0.2)).toEqual({});
  });

  it('calculateVaR returns valid results', () => {
    const varResult = calculateVaR(mockPortfolio, 0.95, 1);
    expect(varResult).toHaveProperty('VaR');
    expect(parseFloat(varResult.VaR)).toBeGreaterThanOrEqual(0);
    expect(calculateVaR(null, 0.95, 1).VaR).toBe("0.00");
  });

  it('getMarginCallThreshold calculates correctly', () => {
    const threshold = getMarginCallThreshold(mockPortfolio);
    expect(parseFloat(threshold.dropPercentage)).toBeCloseTo(37.50);
    expect(getMarginCallThreshold({ ...mockPortfolio, marginUsed: 0 }).dropPercentage).toBe("N/A");
    expect(getMarginCallThreshold(null).dropPercentage).toBe("N/A");
  });

  it('analyzeCorrelation provides correct analysis', () => {
    expect(analyzeCorrelation(mockPortfolio.holdings)).toContain('single asset');
    expect(analyzeCorrelation(null)).toBe('No assets to analyze.');
    const diversified = [{ marketValue: 40000, sector: 'Tech' }, { marketValue: 60000, sector: 'Finance' }];
    expect(analyzeCorrelation(diversified)).toBe('Portfolio appears reasonably diversified across sectors.');
  });
});
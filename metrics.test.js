import { calculateAllMetrics } from '../utils/metrics';

describe('calculateAllMetrics', () => {
  const mockPortfolio = {
    cash: 10000,
    marginUsed: 40000,
    holdings: [{ marketValue: 50000 }, { marketValue: 30000 }],
  };

  it('should return a default state for invalid or null input', () => {
    const defaultState = {
      netLiquidationValue: "0.00", totalEquity: "0.00", marketValue: "0.00",
      leverage: "0.00", maintenanceMargin: "0.00", excessLiquidity: "0.00",
      buyingPower: "0.00", marginHealth: "0.00",
    };
    expect(calculateAllMetrics(null)).toEqual(defaultState);
    expect(calculateAllMetrics({})).toEqual(defaultState);
  });

  it('should calculate all metrics correctly', () => {
    const metrics = calculateAllMetrics(mockPortfolio);
    expect(metrics.marketValue).toBe("80000.00");
    expect(metrics.totalEquity).toBe("50000.00");
    expect(metrics.netLiquidationValue).toBe("50000.00");
    expect(metrics.leverage).toBe("1.60");
    expect(metrics.maintenanceMargin).toBe("20000.00");
    expect(metrics.excessLiquidity).toBe("30000.00");
    expect(metrics.buyingPower).toBe("60000.00");
    expect(metrics.marginHealth).toBe("60.00");
  });

  it('should handle negative equity', () => {
    const underwaterPortfolio = { ...mockPortfolio, marginUsed: 100000 };
    const metrics = calculateAllMetrics(underwaterPortfolio);
    expect(metrics.netLiquidationValue).toBe("-10000.00");
    expect(metrics.excessLiquidity).toBe("-30000.00");
    expect(metrics.buyingPower).toBe("0.00");
    expect(metrics.marginHealth).toBe("0.00");
    expect(metrics.leverage).toBe("0.00");
  });
});
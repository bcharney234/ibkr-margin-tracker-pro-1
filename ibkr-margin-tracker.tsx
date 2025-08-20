import React, { useState, useCallback, useMemo } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

// Import all utility functions
import { calculateAllMetrics } from './utils/metrics';
import { calcYieldOnCost, projectDividends, dividendMarginCoverage, marginPayoffTime } from './utils/dividends';
import { longPutPayoff, bearPutSpreadPayoff, cashSecuredPutPayoff, coveredCallPayoff } from './utils/hedges';
import { runSingleScenario, calculateVaR, getMarginCallThreshold, analyzeCorrelation } from './utils/stress';

// Import the default data from the correct path
import defaultData from '../mock/account-snapshot.json';

// Define TypeScript interfaces for type safety
interface Holding {
    ticker: string;
    quantity: number;
    marketValue: number;
    costBasis: number;
    annualDividend: number;
    sector: string;
}

interface Portfolio {
    cash: number;
    marginUsed: number;
    holdings: Holding[];
}

const IBKRMarginTracker: React.FC = () => {
    const [portfolioData, setPortfolioData] = useState<Portfolio>(defaultData);
    const [errorMessage, setErrorMessage] = useState<string>('');

    // Callback for handling file drops for CSV import
    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (file) {
            setErrorMessage(''); // Clear previous errors
            Papa.parse(file, {
                header: true,
                dynamicTyping: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (!results.data || results.data.length === 0) {
                        setErrorMessage("CSV file is empty or could not be parsed.");
                        return;
                    }

                    const requiredCols = ['ticker', 'quantity', 'marketValue', 'costBasis', 'annualDividend', 'sector', 'cash', 'marginUsed'];
                    const hasAllCols = results.meta.fields && requiredCols.every(col => results.meta.fields.includes(col));

                    if (!hasAllCols) {
                        setErrorMessage("CSV file is missing required columns. Please check the format.");
                        return;
                    }

                    const holdings: Holding[] = results.data.map((row: any) => ({
                        ticker: row.ticker ?? 'N/A',
                        quantity: row.quantity ?? 0,
                        marketValue: row.marketValue ?? 0,
                        costBasis: row.costBasis ?? 0,
                        annualDividend: row.annualDividend ?? 0,
                        sector: row.sector ?? 'Uncategorized',
                    }));

                    const cash = (results.data[0] as any)?.cash ?? 0;
                    const marginUsed = (results.data[0] as any)?.marginUsed ?? 0;

                    setPortfolioData({ cash, marginUsed, holdings });
                },
                error: (error: Error) => {
                    setErrorMessage(`Error parsing CSV file: ${error.message}`);
                }
            });
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'text/csv': ['.csv'] } });

    // --- Memoized Calculations for Performance ---
    const metrics = useMemo(() => calculateAllMetrics(portfolioData), [portfolioData]);
    const dividendProjections = useMemo(() => projectDividends(portfolioData.holdings), [portfolioData.holdings]);
    const dividendInfo = useMemo(() => ({
        yieldOnCost: calcYieldOnCost(portfolioData.holdings),
        coverageRatio: dividendMarginCoverage(portfolioData.holdings, portfolioData.marginUsed),
        payoffTime: marginPayoffTime(portfolioData.holdings, portfolioData.marginUsed),
    }), [portfolioData]);

    const stressScenarios = useMemo(() => [0.1, 0.2, 0.3, 0.4, 0.5].map(drop => {
        const results = runSingleScenario(portfolioData, drop);
        return {
            name: `-${drop * 100}%`,
            'Excess Liquidity': parseFloat(results.excessLiquidity),
            'Margin Health (%)': parseFloat(results.marginHealth),
        };
    }), [portfolioData]);

    const riskInfo = useMemo(() => ({
        varResult: calculateVaR(portfolioData, 0.95, 1),
        marginCallInfo: getMarginCallThreshold(portfolioData),
        correlationAnalysis: analyzeCorrelation(portfolioData.holdings),
    }), [portfolioData]);

    const hedges = useMemo(() => [
        longPutPayoff(170, 5.50),
        bearPutSpreadPayoff(220, 210, 2.50),
        cashSecuredPutPayoff(190, 4.20),
        coveredCallPayoff(180, 3.80, 150),
    ], []);

    return (
        <div className="p-4 sm:p-6 bg-gray-900 text-gray-200 min-h-screen font-sans">
            <header className="text-center mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold text-teal-400">IBKR Margin Tracker Pro</h1>
                <p className="text-gray-400">Advanced Portfolio Risk & Margin Analysis</p>
            </header>

            <div {...getRootProps()} className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center mb-8 cursor-pointer hover:border-teal-400 transition bg-gray-800">
                <input {...getInputProps()} />
                <p className="text-lg">{isDragActive ? "Drop the CSV file here..." : "Drag & drop a portfolio CSV here, or click to select"}</p>
                <p className="text-sm text-gray-500 mt-2">Required columns: ticker, quantity, marketValue, costBasis, annualDividend, sector, cash, marginUsed</p>
                {errorMessage && <p className="text-red-500 mt-4">{errorMessage}</p>}
            </div>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-teal-400 mb-4">Portfolio Metrics</h2>
                        <ul className="space-y-2 text-md sm:text-lg">
                            <li><strong>Net Liquidation Value:</strong> ${metrics.netLiquidationValue}</li>
                            <li><strong>Excess Liquidity:</strong> <span className={parseFloat(metrics.excessLiquidity) > 0 ? 'text-green-400' : 'text-red-400'}>${metrics.excessLiquidity}</span></li>
                            <li><strong>Buying Power:</strong> ${metrics.buyingPower}</li>
                            <li><strong>Leverage:</strong> {metrics.leverage}x</li>
                            <li><strong>Margin Health:</strong> <span className={parseFloat(metrics.marginHealth) > 25 ? 'text-green-400' : 'text-red-400'}>{metrics.marginHealth}%</span></li>
                        </ul>
                    </section>

                    <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-teal-400 mb-4">Dividend Analysis</h2>
                        <ul className="space-y-2 text-md sm:text-lg">
                            <li><strong>Yield on Cost:</strong> {dividendInfo.yieldOnCost.toFixed(2)}%</li>
                            <li><strong>Margin Interest Coverage:</strong> {isFinite(dividendInfo.coverageRatio) ? `${dividendInfo.coverageRatio.toFixed(2)}x` : 'N/A'}</li>
                            <li><strong>Est. Margin Payoff Time:</strong> {typeof dividendInfo.payoffTime === 'number' ? `${dividendInfo.payoffTime.toFixed(2)} years` : dividendInfo.payoffTime}</li>
                        </ul>
                        <h3 className="text-xl font-semibold mt-6 mb-2 text-teal-500">5-Year Dividend Projection</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={dividendProjections}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="year" stroke="#9ca3af" />
                                <YAxis stroke="#9ca3af" domain={['dataMin', 'dataMax']}/>
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Legend />
                                <Line type="monotone" dataKey="income" name="Projected Income" stroke="#2dd4bf" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </section>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                     <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-red-400 mb-4">Risk & Stress Testing</h2>
                        <div className="space-y-3 text-md sm:text-lg mb-4">
                            <p><strong>Margin Call Threshold:</strong> A market drop of <strong className="text-red-400">{riskInfo.marginCallInfo.dropPercentage}%</strong> (${riskInfo.marginCallInfo.marketValueDrop}) could trigger a margin call.</p>
                            <p><strong>Value at Risk (1-day, 95%):</strong> Potential loss of <strong className="text-red-400">${riskInfo.varResult.VaR}</strong>.</p>
                            <p><strong>Concentration:</strong> {riskInfo.correlationAnalysis}</p>
                        </div>
                        <h3 className="text-xl font-semibold text-red-500 mb-2">Portfolio Drop Scenarios</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={stressScenarios}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" />
                                <XAxis dataKey="name" stroke="#9ca3af" />
                                <YAxis yAxisId="left" stroke="#4ade80" />
                                <YAxis yAxisId="right" orientation="right" stroke="#f87171" />
                                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                                <Legend />
                                <Bar yAxisId="left" dataKey="Excess Liquidity" fill="#4ade80" />
                                <Bar yAxisId="right" dataKey="Margin Health (%)" fill="#f87171" />
                            </BarChart>
                        </ResponsiveContainer>
                    </section>
                </div>

                <div className="lg:col-span-1 flex flex-col gap-6">
                    <section className="bg-gray-800 p-6 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Options Hedge Analysis</h2>
                        <div className="space-y-4">
                            {hedges.map((hedge, index) => (
                                <div key={index} className="bg-gray-700 p-4 rounded">
                                    <h3 className="text-lg font-bold text-blue-300">{hedge.strategy}</h3>
                                    <p className="text-sm text-gray-400 mb-2">{hedge.description}</p>
                                    <div className="grid grid-cols-2 gap-x-4 text-sm">
                                        <p><strong>Max Profit:</strong> <span className="text-green-400">${hedge.maxProfit}</span></p>
                                        <p><strong>Max Loss:</strong> <span className="text-red-400">${hedge.maxLoss}</span></p>
                                        <p><strong>Breakeven:</strong> ${hedge.breakeven}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default IBKRMarginTracker;
import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import IBKRMarginTracker from '../ibkr-margin-tracker';

// Mock Recharts to prevent errors in JSDOM
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }) => (
      <div className="recharts-responsive-container" style={{ width: 500, height: 500 }}>
        {children}
      </div>
    ),
  };
});

describe('IBKRMarginTracker Integration Test', () => {
  beforeEach(() => {
    render(<IBKRMarginTracker />);
  });

  it('renders the dashboard with default mock data', () => {
    expect(screen.getByText(/IBKR Margin Tracker Pro/i)).toBeInTheDocument();
    // Check for a key metric from mock/account-snapshot.json
    expect(screen.getByText(/\$44000.00/i)).toBeInTheDocument(); // Net Liquidation Value
    expect(screen.getByText(/1.91x/i)).toBeInTheDocument(); // Leverage
  });

  it('renders all main sections', () => {
    expect(screen.getByText(/Portfolio Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Dividend Analysis/i)).toBeInTheDocument();
    expect(screen.getByText(/Risk & Stress Testing/i)).toBeInTheDocument();
    expect(screen.getByText(/Options Hedge Analysis/i)).toBeInTheDocument();
  });

  it('renders the CSV dropzone', () => {
    expect(screen.getByText(/Drag & drop a portfolio CSV here/i)).toBeInTheDocument();
  });
});
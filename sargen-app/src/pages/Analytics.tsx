import { useQuery } from '@tanstack/react-query';
import { TrendingUp, DollarSign, AlertTriangle, Activity, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_BASE = 'http://localhost:8001';

interface KPIData {
  summary: {
    total_cases: number;
    high_risk_cases: number;
    medium_risk_cases: number;
    low_risk_cases: number;
    total_amount: number;
    avg_amount_per_case: number;
    max_case_amount: number;
    total_transactions: number;
    avg_transactions_per_case: number;
    detection_rate: number;
    avg_patterns_per_case: number;
    total_sample_size?: number;
  };
  risk_distribution: {
    by_count: Array<{ name: string; value: number; color: string }>;
    by_amount: Record<string, number>;
  };
  risk_breakdown: Record<string, any>;
  pattern_distribution: Array<{ name: string; count: number }>;
  top_accounts: Array<any>;
  trends: {
    high_risk_percentage: number;
    medium_risk_percentage: number;
    low_risk_percentage: number;
  };
  temporal_analysis?: {
    daily_trends: Array<{ date: string; count: number; amount: number }>;
    peak_day?: { date: string; count: number; amount: number };
    total_days: number;
  };
  bank_analysis?: {
    top_sending_banks: Array<{ bank: string; count: number }>;
    top_receiving_banks: Array<{ bank: string; count: number }>;
    unique_banks: number;
  };
  currency_analysis?: {
    distribution: Array<{ currency: string; count: number; percentage: number }>;
    unique_currencies: number;
  };
  account_type_analysis?: {
    distribution: Array<{ type: string; count: number; percentage: number }>;
  };
  amount_statistics?: {
    min: number;
    max: number;
    median: number;
    std_dev: number;
    total: number;
  };
  investigation_metrics?: {
    avg_investigation_time_days: number;
    case_closure_rate: number;
    escalation_rate: number;
    false_positive_rate: number;
    true_positive_rate: number;
  };
  alert_velocity?: {
    total_alerts: number;
    alerts_per_1000_txns: number;
    high_priority_percentage: number;
  };
}

export default function Analytics() {
  const { data: kpiData, isLoading } = useQuery<KPIData>({
    queryKey: ['analytics-kpis'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/api/analytics/kpis`);
      return response.json();
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-dark-bg rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-dark-bg rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!kpiData) {
    return <div className="p-8">No data available</div>;
  }

  const { summary, risk_distribution, risk_breakdown, pattern_distribution, top_accounts, trends } = kpiData;

  // Prepare data for amount range chart
  const amountRangeData = Object.entries(risk_distribution.by_amount).map(([name, value]) => ({
    name,
    cases: value
  }));

  // Prepare risk breakdown data for comparison
  const riskComparisonData = [
    {
      risk: 'HIGH',
      cases: risk_breakdown.HIGH.count,
      avgAmount: risk_breakdown.HIGH.avg_amount,
      avgTxns: risk_breakdown.HIGH.avg_transactions
    },
    {
      risk: 'MEDIUM',
      cases: risk_breakdown.MEDIUM.count,
      avgAmount: risk_breakdown.MEDIUM.avg_amount,
      avgTxns: risk_breakdown.MEDIUM.avg_transactions
    },
    {
      risk: 'LOW',
      cases: risk_breakdown.LOW.count,
      avgAmount: risk_breakdown.LOW.avg_amount,
      avgTxns: risk_breakdown.LOW.avg_transactions
    }
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-gray-400">Comprehensive KPI metrics and insights</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Cases */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Cases</p>
              <p className="text-3xl font-bold">{summary.total_cases}</p>
              <p className="text-green-500 text-sm mt-2">
                {summary.high_risk_cases} High Risk ({trends.high_risk_percentage.toFixed(1)}%)
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Total Amount */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Total Amount</p>
              <p className="text-3xl font-bold">${(summary.total_amount / 1000000).toFixed(2)}M</p>
              <p className="text-gray-400 text-sm mt-2">
                Avg: ${(summary.avg_amount_per_case / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Detection Rate */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Detection Rate</p>
              <p className="text-3xl font-bold">{summary.detection_rate.toFixed(2)}%</p>
              <p className="text-gray-400 text-sm mt-2">
                {summary.total_transactions.toLocaleString()} suspicious txns
              </p>
            </div>
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Avg Patterns */}
        <div className="card">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Avg Patterns per Case</p>
              <p className="text-3xl font-bold">{summary.avg_patterns_per_case.toFixed(1)}</p>
              <p className="text-gray-400 text-sm mt-2">
                Complexity metric
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-600 rounded-lg flex items-center justify-center">
              <PieChartIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Distribution Pie Chart */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Risk Distribution by Case Count</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={risk_distribution.by_count}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {risk_distribution.by_count.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Amount Range Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Cases by Amount Range</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={amountRangeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="cases" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Risk Level Comparison */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Risk Level Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={riskComparisonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="risk" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Bar dataKey="cases" fill="#3b82f6" name="Case Count" />
              <Bar dataKey="avgTxns" fill="#10b981" name="Avg Transactions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pattern Distribution */}
        <div className="card">
          <h3 className="text-xl font-bold mb-4">Top Suspicious Patterns</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pattern_distribution.slice(0, 6)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis type="number" stroke="#9ca3af" />
              <YAxis type="category" dataKey="name" stroke="#9ca3af" width={150} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Bar dataKey="count" fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Accounts Table */}
      <div className="card">
        <h3 className="text-xl font-bold mb-4">Top 10 High-Value Cases</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4">Rank</th>
                <th className="text-left py-3 px-4">Account</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Amount</th>
                <th className="text-left py-3 px-4">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {top_accounts.map((account, idx) => (
                <tr key={idx} className="border-b border-dark-border hover:bg-dark-bg">
                  <td className="py-3 px-4">#{idx + 1}</td>
                  <td className="py-3 px-4 font-mono text-sm">{account.account}</td>
                  <td className="py-3 px-4">{account.customer}</td>
                  <td className="py-3 px-4 font-bold">${account.amount.toLocaleString()}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      account.risk === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      account.risk === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {account.risk}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="card">
          <h4 className="text-lg font-bold mb-2">High Risk Cases</h4>
          <p className="text-3xl font-bold text-red-400">{summary.high_risk_cases}</p>
          <p className="text-sm text-gray-400 mt-1">
            Total Amount: ${(risk_breakdown.HIGH.total_amount / 1000000).toFixed(2)}M
          </p>
          <p className="text-sm text-gray-400">
            Avg: ${(risk_breakdown.HIGH.avg_amount / 1000).toFixed(1)}K per case
          </p>
        </div>

        <div className="card">
          <h4 className="text-lg font-bold mb-2">Medium Risk Cases</h4>
          <p className="text-3xl font-bold text-yellow-400">{summary.medium_risk_cases}</p>
          <p className="text-sm text-gray-400 mt-1">
            Total Amount: ${(risk_breakdown.MEDIUM.total_amount / 1000).toFixed(2)}K
          </p>
          <p className="text-sm text-gray-400">
            Avg: ${(risk_breakdown.MEDIUM.avg_amount / 1000).toFixed(1)}K per case
          </p>
        </div>

        <div className="card">
          <h4 className="text-lg font-bold mb-2">Low Risk Cases</h4>
          <p className="text-3xl font-bold text-green-400">{summary.low_risk_cases}</p>
          <p className="text-sm text-gray-400 mt-1">
            Total Amount: ${(risk_breakdown.LOW.total_amount / 1000).toFixed(2)}K
          </p>
          <p className="text-sm text-gray-400">
            Avg: ${(risk_breakdown.LOW.avg_amount / 1000).toFixed(1)}K per case
          </p>
        </div>
      </div>

      {/* Temporal Analysis */}
      {kpiData.temporal_analysis?.daily_trends && kpiData.temporal_analysis.daily_trends.length > 0 && (
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-4">Suspicious Activity Trend (Last 30 Days)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={kpiData.temporal_analysis.daily_trends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" stroke="#9ca3af" angle={-45} textAnchor="end" height={100} />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                labelStyle={{ color: '#fff' }}
              />
              <Legend />
              <Line type="monotone" dataKey="count" stroke="#3b82f6" name="Case Count" strokeWidth={2} />
              <Line type="monotone" dataKey="amount" stroke="#10b981" name="Amount ($)" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
          {kpiData.temporal_analysis.peak_day && (
            <p className="text-sm text-gray-400 mt-2">
              Peak Activity: {kpiData.temporal_analysis.peak_day.date} with {kpiData.temporal_analysis.peak_day.count} suspicious transactions
            </p>
          )}
        </div>
      )}

      {/* Bank Network Analysis */}
      {kpiData.bank_analysis?.top_sending_banks && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Top Sending Banks (Suspicious Transactions)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.bank_analysis.top_sending_banks.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="bank" stroke="#9ca3af" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Top Receiving Banks (Suspicious Transactions)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.bank_analysis.top_receiving_banks.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis type="number" stroke="#9ca3af" />
                <YAxis type="category" dataKey="bank" stroke="#9ca3af" width={100} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Currency & Account Type Analysis */}
      {kpiData.currency_analysis?.distribution && kpiData.account_type_analysis?.distribution && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <div className="card">
            <h3 className="text-xl font-bold mb-4">Currency Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={kpiData.currency_analysis.distribution.slice(0, 6)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ currency, percentage }) => `${currency}: ${percentage.toFixed(1)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {kpiData.currency_analysis.distribution.slice(0, 6).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'][index % 6]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card">
            <h3 className="text-xl font-bold mb-4">Account Type Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kpiData.account_type_analysis.distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="type" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Investigation Metrics */}
      {kpiData.investigation_metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <div className="card">
            <h4 className="text-sm text-gray-400 mb-1">Avg Investigation Time</h4>
            <p className="text-2xl font-bold">{kpiData.investigation_metrics.avg_investigation_time_days} days</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-400 mb-1">Escalation Rate</h4>
            <p className="text-2xl font-bold text-red-400">{kpiData.investigation_metrics.escalation_rate.toFixed(1)}%</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-400 mb-1">True Positive Rate</h4>
            <p className="text-2xl font-bold text-green-400">{kpiData.investigation_metrics.true_positive_rate}%</p>
          </div>
          <div className="card">
            <h4 className="text-sm text-gray-400 mb-1">Alert Velocity</h4>
            <p className="text-2xl font-bold">{kpiData.alert_velocity?.alerts_per_1000_txns.toFixed(2)}</p>
            <p className="text-xs text-gray-400">per 1K transactions</p>
          </div>
        </div>
      )}

      {/* Amount Statistics */}
      {kpiData.amount_statistics && (
        <div className="card mt-6">
          <h3 className="text-xl font-bold mb-4">Transaction Amount Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div>
              <p className="text-sm text-gray-400">Minimum</p>
              <p className="text-lg font-bold">${kpiData.amount_statistics.min?.toFixed(2) || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Maximum</p>
              <p className="text-lg font-bold">${(kpiData.amount_statistics.max / 1000).toFixed(2)}K</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Median</p>
              <p className="text-lg font-bold">${kpiData.amount_statistics.median?.toFixed(2) || 0}</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Std Deviation</p>
              <p className="text-lg font-bold">${(kpiData.amount_statistics.std_dev / 1000).toFixed(2)}K</p>
            </div>
            <div>
              <p className="text-sm text-gray-400">Total</p>
              <p className="text-lg font-bold">${(kpiData.amount_statistics.total / 1000000).toFixed(2)}M</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

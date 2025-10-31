import { useEffect, useState } from 'react';
import { TrendingUp, AlertTriangle, CheckCircle, Clock, DollarSign, FileText, Activity } from 'lucide-react';
import { getStats, getCases } from '../lib/api';
import { Link } from 'react-router-dom';

interface Stats {
  total_cases: number;
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  total_transactions: number;
  network_nodes: number;
}

interface Case {
  case_id: string;
  customer: string;
  account: string;
  risk_level: string;
  amount: number;
  transaction_count: number;
  patterns: string[];
}

export default function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentCases, setRecentCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, casesData] = await Promise.all([
        getStats(),
        getCases()
      ]);
      setStats(statsData);
      setRecentCases(casesData.slice(0, 5));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading overview...</div>
      </div>
    );
  }

  const totalAmount = recentCases.reduce((sum, c) => sum + c.amount, 0);
  const avgAmount = totalAmount / (recentCases.length || 1);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Overview</h1>
        <p className="text-gray-400">Real-time insights into your AML detection system</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-600 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats?.total_cases || 0}</div>
              <div className="text-sm text-gray-400">Total Cases</div>
            </div>
          </div>
          <div className="flex items-center text-sm text-green-400">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>Active monitoring</span>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-red-600 rounded-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{stats?.high_risk || 0}</div>
              <div className="text-sm text-gray-400">High Risk</div>
            </div>
          </div>
          <div className="text-sm text-red-400">Requires immediate attention</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-green-600 rounded-lg">
              <DollarSign className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">${(totalAmount / 1000000).toFixed(1)}M</div>
              <div className="text-sm text-gray-400">Total Amount</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">Across all cases</div>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-purple-600 rounded-lg">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{(stats?.total_transactions || 0).toLocaleString()}</div>
              <div className="text-sm text-gray-400">Transactions</div>
            </div>
          </div>
          <div className="text-sm text-gray-400">Under analysis</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Risk Distribution */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-red-400">High Risk</span>
                <span>{stats?.high_risk || 0} cases</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full" 
                  style={{width: `${((stats?.high_risk || 0) / (stats?.total_cases || 1)) * 100}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-yellow-400">Medium Risk</span>
                <span>{stats?.medium_risk || 0} cases</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{width: `${((stats?.medium_risk || 0) / (stats?.total_cases || 1)) * 100}%`}}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-green-400">Low Risk</span>
                <span>{stats?.low_risk || 0} cases</span>
              </div>
              <div className="w-full bg-dark-bg rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{width: `${((stats?.low_risk || 0) / (stats?.total_cases || 1)) * 100}%`}}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">System Status</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Detection Engine</span>
              </div>
              <span className="text-sm text-green-400">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>AI Copilot</span>
              </div>
              <span className="text-sm text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <Activity className="w-5 h-5 text-blue-400" />
                <span>Data Processing</span>
              </div>
              <span className="text-sm text-blue-400">Running</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-dark-bg rounded-lg">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <span>Last Sync</span>
              </div>
              <span className="text-sm text-gray-400">2 min ago</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg. Amount per Case</span>
              <span className="font-semibold">${(avgAmount / 1000).toFixed(0)}K</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Network Nodes</span>
              <span className="font-semibold">{(stats?.network_nodes || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Detection Rate</span>
              <span className="font-semibold text-green-400">98.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">False Positives</span>
              <span className="font-semibold text-blue-400">1.5%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Avg. Processing Time</span>
              <span className="font-semibold">3.2 min</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Cases */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Recent High-Priority Cases</h3>
          <Link to="/" className="text-blue-400 hover:text-blue-300 text-sm">
            View All →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4">Case ID</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Risk Level</th>
                <th className="text-right py-3 px-4">Amount</th>
                <th className="text-right py-3 px-4">Transactions</th>
                <th className="text-left py-3 px-4">Patterns</th>
                <th className="text-right py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {recentCases.map((case_item) => (
                <tr key={case_item.case_id} className="border-b border-dark-border hover:bg-dark-bg">
                  <td className="py-3 px-4 font-mono text-sm">{case_item.case_id}</td>
                  <td className="py-3 px-4">{case_item.customer}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      case_item.risk_level === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                      case_item.risk_level === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-green-500/20 text-green-400'
                    }`}>
                      {case_item.risk_level}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">${case_item.amount.toLocaleString()}</td>
                  <td className="py-3 px-4 text-right">{case_item.transaction_count}</td>
                  <td className="py-3 px-4 text-sm text-gray-400">
                    {case_item.patterns.slice(0, 2).join(', ')}
                    {case_item.patterns.length > 2 && '...'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link 
                      to={`/case/${case_item.case_id}`}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getStats, getCases } from '../lib/api';
import { Search, FileText, AlertTriangle, Network, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats'],
    queryFn: getStats,
  });
  
  const { data: cases, isLoading: casesLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: getCases,
  });
  
  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'HIGH': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'MEDIUM': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'LOW': return 'bg-green-500/20 text-green-400 border-green-500/30';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Case Inbox</h1>
            <p className="text-gray-400">Manage and review suspicious activity reports</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-gray-400">Open Cases</div>
              <div className="text-2xl font-bold">{stats?.total_cases || 0}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">High Risk</div>
              <div className="text-2xl font-bold text-red-500">{stats?.high_risk || 0}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400">Pending Review</div>
              <div className="text-2xl font-bold">{stats?.total_cases || 0}</div>
            </div>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search cases, customers, or transactions..."
            className="w-full bg-dark-card border border-dark-border rounded-lg pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 transition"
          />
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="card border-l-4 border-l-blue-500">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-400">TOTAL CASES</div>
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold">{statsLoading ? '...' : stats?.total_cases || 0}</div>
        </div>
        
        <div className="card border-l-4 border-l-red-500">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-400">HIGH RISK</div>
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold">{statsLoading ? '...' : stats?.high_risk || 0}</div>
        </div>
        
        <div className="card border-l-4 border-l-yellow-500">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-400">NETWORK NODES</div>
            <div className="w-12 h-12 bg-yellow-600 rounded-lg flex items-center justify-center">
              <Network className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold">{statsLoading ? '...' : stats?.network_nodes.toLocaleString() || 0}</div>
        </div>
        
        <div className="card border-l-4 border-l-green-500">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-gray-400">TRANSACTIONS</div>
            <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
              <RefreshCw className="w-6 h-6" />
            </div>
          </div>
          <div className="text-4xl font-bold">{statsLoading ? '...' : stats?.total_transactions.toLocaleString() || 0}</div>
        </div>
      </div>
      
      {/* Cases Table */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              🔍
            </div>
            <h2 className="text-xl font-bold">Suspicious Cases</h2>
          </div>
          <button className="btn btn-primary">+ Create New Case</button>
        </div>
        
        {casesLoading ? (
          <div className="text-center py-12 text-gray-400">Loading cases...</div>
        ) : cases && cases.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Case ID</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Customer</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Risk Level</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Patterns</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((caseItem) => (
                  <tr key={caseItem.case_id} className="border-b border-dark-border hover:bg-blue-600/5 transition">
                    <td className="py-4 px-4">
                      <Link to={`/case/${caseItem.case_id}`} className="font-mono text-blue-400 hover:text-blue-300">
                        {caseItem.case_id}
                      </Link>
                    </td>
                    <td className="py-4 px-4">{caseItem.customer}</td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getRiskColor(caseItem.risk_level)}`}>
                        {caseItem.risk_level}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-2">
                        {caseItem.patterns.map((pattern, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-400 rounded text-xs">
                            {pattern}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-4 px-4 font-semibold">${caseItem.amount.toLocaleString()}</td>
                    <td className="py-4 px-4">
                      <div className="flex gap-2">
                        <Link to={`/case/${caseItem.case_id}`} className="btn btn-secondary text-sm">
                          View Details
                        </Link>
                        <button className="btn btn-primary text-sm">
                          Generate SAR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-gray-400">No cases found</div>
        )}
      </div>
    </div>
  );
}

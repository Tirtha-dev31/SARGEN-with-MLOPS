import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCaseDetail, generateSAR } from '../lib/api';
import { ArrowLeft, Download, FileText, Network } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import NetworkGraph from '../components/NetworkGraph';

export default function CaseDetails() {
  const { caseId } = useParams<{ caseId: string }>();
  const [showSAR, setShowSAR] = useState(false);
  
  const { data: caseData, isLoading } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => getCaseDetail(caseId!),
    enabled: !!caseId,
  });
  
  const { data: sarData, refetch: fetchSAR, isLoading: sarLoading } = useQuery({
    queryKey: ['sar', caseId],
    queryFn: () => generateSAR(caseId!),
    enabled: false,
  });
  
  const handleGenerateSAR = async () => {
    await fetchSAR();
    setShowSAR(true);
  };
  
  if (isLoading) {
    return <div className="p-8 text-center">Loading case details...</div>;
  }
  
  if (!caseData) {
    return <div className="p-8 text-center">Case not found</div>;
  }
  
  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link to="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 mb-4">
          <ArrowLeft className="w-4 h-4" />
          Back to Cases
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold mb-2">{caseData.case_id}</h1>
            <p className="text-gray-400">{caseData.customer}</p>
          </div>
          <div className="flex gap-3">
            <button onClick={handleGenerateSAR} disabled={sarLoading} className="btn btn-primary flex items-center gap-2">
              <FileText className="w-4 h-4" />
              {sarLoading ? 'Generating...' : 'Generate SAR'}
            </button>
            {showSAR && (
              <button className="btn btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Case Info */}
      <div className="grid grid-cols-3 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-400 mb-2">Risk Level</div>
          <div className={`text-2xl font-bold ${
            caseData.risk_level === 'HIGH' ? 'text-red-500' :
            caseData.risk_level === 'MEDIUM' ? 'text-yellow-500' : 'text-green-500'
          }`}>
            {caseData.risk_level}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-2">Total Amount</div>
          <div className="text-2xl font-bold">${caseData.amount.toLocaleString()}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-400 mb-2">Transactions</div>
          <div className="text-2xl font-bold">{caseData.transaction_count}</div>
        </div>
      </div>
      
      {/* Patterns */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold mb-4">Detected Patterns</h3>
        <div className="flex flex-wrap gap-2">
          {caseData.patterns.map((pattern, idx) => (
            <span key={idx} className="px-4 py-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-600/30">
              {pattern}
            </span>
          ))}
        </div>
      </div>
      
      {/* Network Graph */}
      <div className="card mb-8">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Network className="w-5 h-5" />
          Transaction Network
        </h3>
        <NetworkGraph caseId={caseData.case_id} />
      </div>
      
      {/* SAR Report */}
      {showSAR && sarData && (
        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Suspicious Activity Report (SAR)
            </h3>
            <button
              onClick={() => window.open(`http://localhost:8001/api/export/sar-pdf/${caseData.case_id}`, '_blank')}
              className="btn btn-secondary flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
          
          {/* SAR Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
              <div className="text-sm text-gray-400 mb-1">Filing Date</div>
              <div className="font-semibold">{sarData.filing_date}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
              <div className="text-sm text-gray-400 mb-1">Report Type</div>
              <div className="font-semibold">{sarData.regulatory_information?.report_type || 'SAR-FinCEN Form'}</div>
            </div>
            <div className="bg-dark-bg p-4 rounded-lg border border-dark-border">
              <div className="text-sm text-gray-400 mb-1">Priority</div>
              <div className={`font-semibold ${
                sarData.regulatory_information?.priority === 'High' ? 'text-red-400' :
                sarData.regulatory_information?.priority === 'Medium' ? 'text-yellow-400' : 'text-green-400'
              }`}>
                {sarData.regulatory_information?.priority || 'Medium'}
              </div>
            </div>
          </div>

          {/* Primary Concerns */}
          {sarData.suspicious_activity?.primary_concerns && sarData.suspicious_activity.primary_concerns.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3 text-red-400">⚠️ Primary Concerns:</h4>
              <ul className="space-y-2">
                {sarData.suspicious_activity.primary_concerns.map((concern: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <span className="text-red-400 mt-1">•</span>
                    <span>{concern}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Risk Indicators */}
          {sarData.supporting_documentation?.risk_indicators && (
            <div className="mb-6">
              <h4 className="font-bold mb-3">📊 Risk Indicators:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {sarData.supporting_documentation.risk_indicators.map((indicator: any, idx: number) => (
                  <div key={idx} className="bg-dark-bg p-3 rounded border border-dark-border">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-semibold">{indicator.indicator}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        indicator.severity === 'High' ? 'bg-red-500/20 text-red-400' :
                        indicator.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {indicator.severity}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      Value: {indicator.value} | Threshold: {indicator.threshold}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recommendations */}
          {sarData.recommendations && sarData.recommendations.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold mb-3">📋 Recommended Actions:</h4>
              <div className="space-y-3">
                {sarData.recommendations.slice(0, 5).map((rec: any, idx: number) => (
                  <div key={idx} className="bg-dark-bg p-3 rounded border-l-4 border-blue-500">
                    <div className="flex items-start gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        rec.priority === 'Immediate' ? 'bg-red-500/20 text-red-400' :
                        rec.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {rec.priority}
                      </span>
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">{rec.action}</div>
                        <div className="text-xs text-gray-400">{rec.rationale}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Full Narrative */}
          <div className="mt-6">
            <h4 className="font-bold mb-3">📄 Complete SAR Narrative:</h4>
            <pre className="bg-dark-bg p-4 rounded-lg whitespace-pre-wrap text-xs leading-relaxed border border-dark-border max-h-96 overflow-y-auto">
              {sarData.narrative}
            </pre>
          </div>
        </div>
      )}
      
      {/* Transactions */}
      <div className="card">
        <h3 className="text-lg font-bold mb-4">Suspicious Transactions ({caseData.transactions?.length || 0})</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">From Bank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">To Bank</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Currency</th>
              </tr>
            </thead>
            <tbody>
              {(caseData.transactions || []).map((txn, idx) => (
                <tr key={idx} className="border-b border-dark-border hover:bg-blue-600/5">
                  <td className="py-3 px-4 text-sm">{txn.Timestamp}</td>
                  <td className="py-3 px-4 text-sm">{txn['From Bank']}</td>
                  <td className="py-3 px-4 text-sm">{txn['To Bank']}</td>
                  <td className="py-3 px-4 text-sm font-semibold">${parseFloat(String(txn['Amount Paid'])).toLocaleString()}</td>
                  <td className="py-3 px-4 text-sm">{txn['Receiving Currency']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

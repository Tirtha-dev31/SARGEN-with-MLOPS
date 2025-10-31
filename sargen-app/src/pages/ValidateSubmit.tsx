import { CheckCircle, AlertTriangle, Eye, Send, RotateCcw, FileText, Shield, Database, FileCheck } from 'lucide-react';

export default function ValidateSubmit() {
  const validationMetrics = [
    { name: 'Content Validation', score: 95, issues: 0, status: 'pass' },
    { name: 'Regulatory Compliance', score: 88, issues: 2, status: 'warning' },
    { name: 'Data Quality', score: 92, issues: 1, status: 'pass' },
    { name: 'Evidence Completeness', score: 85, issues: 3, status: 'warning' },
  ];

  const issues = [
    { id: 1, type: 'warning', category: 'Regulatory Compliance', message: 'Geographic risk factors section needs additional detail', severity: 'medium' },
    { id: 2, type: 'warning', category: 'Evidence Completeness', message: 'Missing transaction screenshots for 3 high-value transfers', severity: 'high' },
    { id: 3, type: 'info', category: 'Data Quality', message: 'Consider adding more context to timeline events', severity: 'low' },
  ];

  const overallScore = Math.round(validationMetrics.reduce((sum, m) => sum + m.score, 0) / validationMetrics.length);
  const totalIssues = validationMetrics.reduce((sum, m) => sum + m.issues, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Validate & Submit</h1>
          <p className="text-gray-400">Final review and submission for SAR-2024-001</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Re-validate
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Submit SAR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Validation Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Overall Score */}
          <div className="card">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Shield className="w-6 h-6 text-blue-400" />
                Submission Readiness
              </h2>
              <div className="text-right">
                <div className="text-4xl font-bold">{overallScore}%</div>
                <div className="text-sm text-gray-400">Overall Score</div>
              </div>
            </div>

            <div className="relative pt-1 mb-6">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-xs font-semibold inline-block text-blue-400">
                    Progress
                  </span>
                </div>
                <div>
                  <span className="text-xs font-semibold inline-block text-red-400">
                    {totalIssues} Issues Found
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-4 text-xs flex rounded-full bg-dark-bg">
                <div
                  style={{ width: `${overallScore}%` }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-green-500"
                />
              </div>
            </div>

            {/* Validation Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {validationMetrics.map((metric, idx) => (
                <div key={idx} className="p-4 bg-dark-bg rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm">{metric.name}</h3>
                    <div className={`flex items-center gap-1 ${
                      metric.status === 'pass' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {metric.status === 'pass' ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        <AlertTriangle className="w-4 h-4" />
                      )}
                      <span className="text-sm font-bold">{metric.score}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        metric.status === 'pass' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>
                  {metric.issues > 0 && (
                    <p className="text-xs text-gray-400 mt-2">{metric.issues} issue{metric.issues > 1 ? 's' : ''} found</p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Issues List */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
              Issues & Recommendations
            </h3>
            <div className="space-y-3">
              {issues.map((issue) => (
                <div
                  key={issue.id}
                  className={`p-4 rounded-lg border-l-4 ${
                    issue.severity === 'high'
                      ? 'bg-red-500/10 border-red-500'
                      : issue.severity === 'medium'
                      ? 'bg-yellow-500/10 border-yellow-500'
                      : 'bg-blue-500/10 border-blue-500'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        issue.severity === 'high'
                          ? 'text-red-400'
                          : issue.severity === 'medium'
                          ? 'text-yellow-400'
                          : 'text-blue-400'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-sm">{issue.category}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            issue.severity === 'high'
                              ? 'bg-red-500/20 text-red-400'
                              : issue.severity === 'medium'
                              ? 'bg-yellow-500/20 text-yellow-400'
                              : 'bg-blue-500/20 text-blue-400'
                          }`}
                        >
                          {issue.severity}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{issue.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Checklist */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-green-400" />
              Pre-Submission Checklist
            </h3>
            <div className="space-y-3">
              {[
                { text: 'All required fields completed', checked: true },
                { text: 'Supporting documentation attached', checked: true },
                { text: 'Narrative reviewed for clarity', checked: true },
                { text: 'Transaction data verified', checked: true },
                { text: 'Compliance officer approval obtained', checked: false },
                { text: 'Final quality check performed', checked: false },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      item.checked ? 'bg-green-500 border-green-500' : 'border-gray-600'
                    }`}
                  >
                    {item.checked && <CheckCircle className="w-3 h-3 text-white" />}
                  </div>
                  <span className={item.checked ? 'text-gray-400 line-through' : 'text-white'}>
                    {item.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submission Status Panel */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card">
            <h3 className="font-bold mb-4">Submission Status</h3>
            <div className="text-center p-6 bg-blue-500/10 rounded-lg border border-blue-500/30 mb-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-8 h-8" />
              </div>
              <p className="font-bold text-lg mb-1">Ready for Review</p>
              <p className="text-sm text-gray-400">Case validation in progress</p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Case ID</span>
                <span className="font-semibold">SAR-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Filing Type</span>
                <span className="font-semibold">Suspicious Activity</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Priority</span>
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-xs">High</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Deadline</span>
                <span className="font-semibold">2024-01-20</span>
              </div>
            </div>
          </div>

          {/* Required Actions */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Required Actions
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Evidence collection</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Narrative draft</p>
                  <p className="text-xs text-gray-400">Completed</p>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Manager approval</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400">Final compliance check</p>
                  <p className="text-xs text-gray-400">Pending</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submission History */}
          <div className="card">
            <h3 className="font-bold mb-4">Recent Submissions</h3>
            <div className="space-y-2">
              <div className="p-3 bg-dark-bg rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">SAR-2024-015</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-xs text-gray-400">Submitted 2 days ago</p>
              </div>
              <div className="p-3 bg-dark-bg rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm">SAR-2024-014</span>
                  <CheckCircle className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-xs text-gray-400">Submitted 5 days ago</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

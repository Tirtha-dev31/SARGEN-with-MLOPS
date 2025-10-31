import { useState } from 'react';
import { FileText, Download, Copy, RotateCcw, Send, Sparkles, CheckCircle, AlertTriangle } from 'lucide-react';

export default function DraftingStudio() {
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [completion, setCompletion] = useState(50);

  const checklistItems = [
    { id: 1, text: 'Suspicious activity clearly described', completed: true, required: true },
    { id: 2, text: 'Transaction amounts and dates included', completed: true, required: true },
    { id: 3, text: 'Customer identification complete', completed: true, required: true },
    { id: 4, text: 'Geographic risk factors addressed', completed: false, required: true },
    { id: 5, text: 'Timeline of events established', completed: false, required: true },
    { id: 6, text: 'Supporting documentation referenced', completed: true, required: false },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Drafting Studio</h1>
          <p className="text-gray-400">SAR-2024-001 • v1.0</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-secondary flex items-center gap-2">
            <RotateCcw className="w-4 h-4" />
            Revert
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Duplicate
          </button>
          <button className="btn btn-secondary flex items-center gap-2">
            <Download className="w-4 h-4" />
            Export
          </button>
          <button className="btn btn-primary flex items-center gap-2">
            <Send className="w-4 h-4" />
            Send to Review
          </button>
        </div>
      </div>

      {/* Template & Enhancement Bar */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <FileText className="w-5 h-5 text-blue-400" />
            <div className="flex items-center gap-2">
              <span className="font-semibold">Generate Draft</span>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="bg-dark-bg border border-dark-border rounded px-3 py-1 text-sm"
              >
                <option value="standard">Standard SAR Template</option>
                <option value="enhanced">Enhanced Narrative</option>
                <option value="brief">Brief Format</option>
              </select>
            </div>
            <button className="btn btn-secondary text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              GPT-4 Enhanced
            </button>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Completion:</span>
            <div className="flex items-center gap-2">
              <div className="w-32 h-2 bg-dark-bg rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <span className="font-semibold">{completion}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SAR Document */}
        <div className="lg:col-span-2">
          <div className="card h-[70vh] overflow-y-auto">
            <div className="font-mono text-sm space-y-4">
              <div>
                <h2 className="text-lg font-bold mb-2">SUSPICIOUS ACTIVITY REPORT</h2>
              </div>

              <div>
                <p className="text-gray-400 mb-2">Case ID: SAR-2024-001</p>
                <p className="text-gray-400 mb-2">Filing Date: January 15, 2024</p>
                <p className="text-gray-400 mb-2">Institution: First National Bank</p>
              </div>

              <div>
                <h3 className="font-bold mb-2">PART I - SUBJECT INFORMATION</h3>
                <div className="bg-dark-bg p-4 rounded space-y-2">
                  <p>Name: Marcus Johnson</p>
                  <p>Address: 123 Main Street, New York, NY 10001</p>
                  <p>SSN: ***-**-4521</p>
                  <p>Account Number: ****-4521</p>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">PART II - SUSPICIOUS ACTIVITY</h3>
                <div className="bg-dark-bg p-4 rounded">
                  <p className="mb-4">
                    The subject account has exhibited patterns of suspicious activity consistent with potential
                    money laundering operations. Over the period from December 1, 2023 to January 10, 2024,
                    the account has demonstrated the following red flags:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>Rapid movement of funds through multiple accounts (Fan-Out pattern)</li>
                    <li>Unusual transaction volumes inconsistent with business profile</li>
                    <li>Structured deposits just below reporting thresholds</li>
                    <li>Transactions involving high-risk jurisdictions</li>
                  </ul>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">PART III - TRANSACTION DETAILS</h3>
                <div className="bg-dark-bg p-4 rounded space-y-3">
                  <p className="font-semibold">Total Amount: $14,925,482.78</p>
                  <p>Transaction Count: 2,547</p>
                  <p>Date Range: 12/01/2023 - 01/10/2024</p>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400 mb-2">Sample Transactions:</p>
                    <div className="space-y-1 text-xs">
                      <p>01/08/2024 - $45,000.00 from Bank of America to Wells Fargo</p>
                      <p>01/09/2024 - $38,500.00 from Chase to Citibank</p>
                      <p>01/10/2024 - $52,000.00 from TD Bank to PNC</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-bold mb-2">PART IV - NARRATIVE</h3>
                <div className="bg-dark-bg p-4 rounded">
                  <p className="whitespace-pre-wrap text-gray-300">
                    The investigation into account ****-4521 belonging to Marcus Johnson revealed a
                    sophisticated pattern of financial activity that raises significant concerns regarding
                    potential money laundering. The account demonstrated characteristics of a "Fan-Out"
                    scheme, wherein funds are rapidly distributed across multiple recipient accounts to
                    obscure the money trail...
                    
                    [Generated content would continue here with AI-enhanced narrative]
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Compliance Checklist */}
        <div className="space-y-6">
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              Compliance Checklist
            </h3>
            <div className="space-y-3">
              {checklistItems.map((item) => (
                <div key={item.id} className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 ${
                    item.completed ? 'bg-green-500/20' : 'bg-gray-700'
                  }`}>
                    {item.completed && <CheckCircle className="w-3 h-3 text-green-400" />}
                    {!item.completed && item.required && <AlertTriangle className="w-3 h-3 text-yellow-400" />}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${item.completed ? 'text-gray-300' : 'text-white'}`}>
                      {item.text}
                    </p>
                    {item.required && (
                      <span className="text-xs text-red-400">Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Version History */}
          <div className="card">
            <h3 className="font-bold mb-4">Version History</h3>
            <div className="space-y-2">
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-blue-400">v1.0</span>
                  <span className="text-xs text-gray-400">Current</span>
                </div>
                <p className="text-xs text-gray-400">Edited by Jane Doe • 2 hours ago</p>
              </div>
              <div className="p-3 bg-dark-bg rounded">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold">v0.9</span>
                </div>
                <p className="text-xs text-gray-400">Draft by Mike Chen • 1 day ago</p>
              </div>
            </div>
          </div>

          {/* AI Suggestions */}
          <div className="card">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Suggestions
            </h3>
            <div className="space-y-2 text-sm">
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-purple-400 mb-1">Add temporal analysis</p>
                <p className="text-xs text-gray-400">
                  Consider including timeline of suspicious activity
                </p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded">
                <p className="text-purple-400 mb-1">Enhance narrative</p>
                <p className="text-xs text-gray-400">
                  Use GPT-4 to improve language clarity
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

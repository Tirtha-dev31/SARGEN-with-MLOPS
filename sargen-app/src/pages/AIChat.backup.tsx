import { Bot, Send, Download, Sparkles, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useState } from 'react';
import { aiChat } from '../lib/api';

const SUGGESTED_QUESTIONS = [
  "What are the high risk cases?",
  "Summarize the suspicious patterns detected",
  "Which accounts have the highest transaction volumes?",
  "Show me cases with multiple recipients",
  "What are the most common laundering patterns?",
  "Analyze the risk distribution across cases",
  "Which banks are most frequently involved?",
  "What's the total amount of suspicious transactions?"
];

const AVAILABLE_MODELS = [
  { id: 'llama3.2', name: 'Llama 3.2', description: 'Fast & Recommended' },
  { id: 'llama3.1:8b', name: 'Llama 3.1', description: 'Higher Quality' },
  { id: 'mistral', name: 'Mistral', description: 'Balanced' },
  { id: 'phi3', name: 'Phi-3', description: 'Fast & Small' },
  { id: 'gemma:2b', name: 'Gemma', description: 'Very Fast' }
];

export default function AIChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai' | 'system', content: string, timestamp?: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState('llama3.2');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [ollamaStatus, setOllamaStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');

  // Check Ollama availability on component mount
  useState(() => {
    checkOllamaStatus();
  });

  const checkOllamaStatus = async () => {
    try {
      const response = await aiChat("test", selectedModel);
      if (response.error) {
        setOllamaStatus('unavailable');
        setMessages([{
          role: 'system',
          content: '⚠️ Ollama is not running. Please install and start Ollama to use the AI Copilot. Visit https://ollama.ai for installation instructions.',
          timestamp: new Date().toISOString()
        }]);
      } else {
        setOllamaStatus('available');
      }
    } catch {
      setOllamaStatus('unavailable');
      setMessages([{
        role: 'system',
        content: '⚠️ Ollama is not running. Please install and start Ollama to use the AI Copilot. Visit https://ollama.ai for installation instructions.',
        timestamp: new Date().toISOString()
      }]);
    }
  };

  const handleSend = async () => {
    if (!question.trim() || loading) return;

    const userMessage = question;
    const timestamp = new Date().toISOString();
    
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp }]);
    setLoading(true);

    try {
      const response = await aiChat(userMessage, selectedModel);
      
      if (response.error) {
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `❌ Error: ${response.error}\n\nMake sure Ollama is installed and running with the model '${selectedModel}' downloaded.\n\nRun: ollama pull ${selectedModel}`,
          timestamp: new Date().toISOString()
        }]);
        setOllamaStatus('unavailable');
      } else {
        setMessages(prev => [...prev, { 
          role: 'ai', 
          content: response.answer,
          timestamp: new Date().toISOString()
        }]);
        setOllamaStatus('available');
      }
    } catch (error: any) {
      setMessages(prev => [...prev, { 
        role: 'system', 
        content: `❌ Connection Error: Unable to reach Ollama service.\n\nPlease ensure:\n1. Ollama is installed (https://ollama.ai)\n2. Ollama service is running\n3. Model '${selectedModel}' is downloaded (run: ollama pull ${selectedModel})`,
        timestamp: new Date().toISOString()
      }]);
      setOllamaStatus('unavailable');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestedQuestion = (suggestedQuestion: string) => {
    setQuestion(suggestedQuestion);
  };

  const clearChat = () => {
    setMessages([]);
  };

  const exportChat = () => {
    const chatText = messages.map(msg => 
      `[${msg.role.toUpperCase()}] ${msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ''}\n${msg.content}\n\n`
    ).join('---\n\n');
    
    const blob = new Blob([chatText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SARGEN_AI_Chat_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">AI Copilot 🤖</h1>
          <p className="text-gray-400">Powered by Ollama - Ask questions about your AML cases</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Status Indicator */}
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
            ollamaStatus === 'available' ? 'bg-green-500/20 text-green-400' :
            ollamaStatus === 'unavailable' ? 'bg-red-500/20 text-red-400' :
            'bg-yellow-500/20 text-yellow-400'
          }`}>
            {ollamaStatus === 'available' && <CheckCircle className="w-4 h-4" />}
            {ollamaStatus === 'unavailable' && <AlertCircle className="w-4 h-4" />}
            <span className="text-sm font-semibold">
              {ollamaStatus === 'available' ? 'Ollama Connected' :
               ollamaStatus === 'unavailable' ? 'Ollama Offline' :
               'Checking...'}
            </span>
          </div>
          
          {/* Action Buttons */}
          {messages.length > 0 && (
            <>
              <button onClick={exportChat} className="btn btn-secondary flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export
              </button>
              <button onClick={clearChat} className="btn btn-secondary">
                Clear
              </button>
            </>
          )}
        </div>
      </div>

      {/* Model Selector */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-blue-400" />
            <div>
              <div className="font-semibold">AI Model</div>
              <div className="text-sm text-gray-400">
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.description || 'Select a model'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="bg-dark-bg border border-dark-border rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              {AVAILABLE_MODELS.map(model => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
            <button
              onClick={checkOllamaStatus}
              className="btn btn-secondary text-sm"
              disabled={loading}
            >
              Test Connection
            </button>
          </div>
        </div>
      </div>
      
      {/* Chat Area */}
      <div className="card h-[60vh] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto mb-4 space-y-4 p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-6">
                <Bot className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start a conversation with AI</h2>
              <p className="text-gray-400 text-center max-w-md mb-6">
                Ask me anything about your suspicious cases, patterns, risk analysis, or AML insights.
              </p>
              
              {/* Ollama Setup Warning */}
              {ollamaStatus === 'unavailable' && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 max-w-2xl">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="font-bold text-red-400 mb-2">Ollama Not Detected</h3>
                      <p className="text-sm text-gray-300 mb-3">
                        To use the AI Copilot, you need to install and run Ollama:
                      </p>
                      <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                        <li>Download Ollama from <a href="https://ollama.ai" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">ollama.ai</a></li>
                        <li>Install and start Ollama service</li>
                        <li>Run: <code className="bg-dark-bg px-2 py-1 rounded text-blue-400">ollama pull {selectedModel}</code></li>
                        <li>Click "Test Connection" button above</li>
                      </ol>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Suggested Questions */}
              <div className="w-full max-w-2xl">
                <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Suggested Questions:
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {SUGGESTED_QUESTIONS.slice(0, 6).map((q, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestedQuestion(q)}
                      className="text-left px-4 py-3 bg-dark-bg hover:bg-blue-600/20 border border-dark-border hover:border-blue-500/50 rounded-lg text-sm transition-all"
                      disabled={ollamaStatus === 'unavailable'}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-2xl p-4 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : msg.role === 'system'
                    ? 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-200'
                    : 'bg-dark-bg text-gray-200 border border-dark-border'
                }`}>
                  <div className="flex items-start gap-3">
                    {msg.role === 'ai' && <Bot className="w-5 h-5 flex-shrink-0 mt-1 text-blue-400" />}
                    {msg.role === 'system' && <AlertCircle className="w-5 h-5 flex-shrink-0 mt-1 text-yellow-400" />}
                    <div className="flex-1">
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                      {msg.timestamp && (
                        <div className="text-xs opacity-50 mt-2">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
          {loading && (
            <div className="flex justify-start">
              <div className="max-w-2xl p-4 rounded-lg bg-dark-bg border border-dark-border">
                <div className="flex items-center gap-3">
                  <Bot className="w-5 h-5 text-blue-400 animate-pulse" />
                  <div className="flex gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-sm text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-dark-border pt-4 px-4 pb-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="Ask about cases, patterns, risk levels, or request analysis..."
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              disabled={loading || ollamaStatus === 'unavailable'}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !question.trim() || ollamaStatus === 'unavailable'}
              className="btn btn-primary flex items-center gap-2 px-6"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <span>Press Enter to send • Shift+Enter for new line</span>
            {ollamaStatus === 'available' && (
              <span className="ml-auto text-green-400">● Using {selectedModel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Tips Card */}
      <div className="card mt-6">
        <h3 className="font-bold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Pro Tips for AI Copilot
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-400">
          <div>
            <strong className="text-white">• Be specific:</strong> "Show cases over $100K" instead of "big cases"
          </div>
          <div>
            <strong className="text-white">• Request analysis:</strong> "Analyze risk trends" or "Compare patterns"
          </div>
          <div>
            <strong className="text-white">• Ask for summaries:</strong> "Summarize high-risk cases"
          </div>
          <div>
            <strong className="text-white">• Query specific data:</strong> "Which banks appear most frequently?"
          </div>
        </div>
      </div>
    </div>
  );
}

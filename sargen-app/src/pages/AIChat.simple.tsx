import { useState, useEffect } from 'react';
import { Bot, Send } from 'lucide-react';
import { aiChat } from '../lib/api';

export default function AIChat() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{role: 'user' | 'ai', content: string}>>([]);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!question.trim() || loading) return;
    
    const userMessage = question;
    setQuestion('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await aiChat(userMessage, 'llama3.2');
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: response.response || response.error || 'No response'
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Error: ' + (error as Error).message
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">AI Copilot 🤖</h1>
        <p className="text-gray-400">Ask questions about your AML cases</p>
      </div>

      <div className="card h-[60vh] flex flex-col">
        <div className="flex-1 overflow-y-auto mb-4 p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
                <Bot className="w-10 h-10" />
              </div>
              <h2 className="text-xl font-bold mb-2">Start a conversation</h2>
              <p className="text-gray-400 mb-4">Ask me about your cases, patterns, or risks</p>
              
              <div className="grid grid-cols-2 gap-2 max-w-2xl">
                <button 
                  onClick={() => setQuestion("What are the high risk cases?")}
                  className="btn btn-secondary text-sm"
                >
                  High risk cases?
                </button>
                <button 
                  onClick={() => setQuestion("Summarize suspicious patterns")}
                  className="btn btn-secondary text-sm"
                >
                  Suspicious patterns?
                </button>
                <button 
                  onClick={() => setQuestion("Which accounts have highest volumes?")}
                  className="btn btn-secondary text-sm"
                >
                  Top accounts?
                </button>
                <button 
                  onClick={() => setQuestion("Show cases with multiple recipients")}
                  className="btn btn-secondary text-sm"
                >
                  Multiple recipients?
                </button>
              </div>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'ai' && (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5" />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-dark-card border border-dark-border'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))
          )}
          
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-dark-card border border-dark-border p-4 rounded-lg">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-dark-border pt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about cases, patterns, risks..."
              className="input flex-1"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !question.trim()}
              className="btn btn-primary flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

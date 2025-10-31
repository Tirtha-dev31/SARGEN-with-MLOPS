# SARGEN AI Copilot - Quick Reference Guide

## 🤖 Overview
The AI Copilot is powered by Ollama and provides intelligent analysis of your AML cases using Large Language Models (LLMs).

## 📋 Prerequisites
1. **Ollama installed** - Download from https://ollama.ai
2. **At least one AI model downloaded** - Recommended: `llama3.2`
3. **SARGEN backend running** - Port 8001
4. **SARGEN frontend running** - Port 5173

## 🚀 Quick Start

### Install Ollama (Windows)
```powershell
# Run the automated setup script
cd "c:\Users\Vivek\Downloads\archive (1)\sargen"
.\INSTALL_OLLAMA.ps1
```

OR manually:
1. Download from https://ollama.ai/download
2. Install the application
3. Download a model: `ollama pull llama3.2`

### Verify Installation
```powershell
ollama --version
ollama list
ollama pull llama3.2
```

## 💬 Using AI Copilot

### Access
1. Open SARGEN: http://localhost:5173
2. Click **"AI Copilot"** in the sidebar
3. Check the status indicator (should show "Ollama Connected")

### Example Questions

#### Case Analysis
- "What are all the high risk cases?"
- "Show me cases with amounts over $100,000"
- "Which case has the most transactions?"
- "List all cases involving Corporation accounts"

#### Pattern Detection
- "Summarize the suspicious patterns detected"
- "What are the most common laundering patterns?"
- "Explain the Fan-Out pattern found in cases"
- "Which patterns indicate highest risk?"

#### Risk Assessment
- "Analyze the risk distribution"
- "Compare high risk vs medium risk cases"
- "What makes a case high risk?"
- "Which accounts should we investigate first?"

#### Banking Analysis
- "Which banks appear most frequently?"
- "Show me the banking network complexity"
- "What are the top sending banks?"
- "Analyze cross-border transaction patterns"

#### Statistical Queries
- "What's the total amount of suspicious transactions?"
- "Calculate the average transaction amount per case"
- "What's the median transaction size?"
- "Show transaction volume trends"

#### Recommendations
- "What actions should we take on high risk cases?"
- "Generate a priority list for investigations"
- "What regulatory steps are required?"
- "Recommend next steps for Case SAR-2024-001"

## 🎯 Pro Tips

### Be Specific
❌ "Tell me about cases"
✅ "Show me high risk cases with multiple recipients pattern"

### Request Analysis
❌ "What's happening?"
✅ "Analyze the correlation between transaction count and risk level"

### Use Context
✅ "Compare the high risk cases and identify common patterns"
✅ "What distinguishes high risk from medium risk cases?"

### Follow-up Questions
✅ "Tell me more about that"
✅ "Can you elaborate on the Fan-Out pattern?"
✅ "What are the implications?"

## 🔧 Model Selection

### Available Models

| Model | Size | Speed | Quality | Use Case |
|-------|------|-------|---------|----------|
| llama3.2 | ~2GB | ⚡⚡⚡ | ⭐⭐⭐ | **Recommended** - Best balance |
| llama3.1:8b | ~4.7GB | ⚡⚡ | ⭐⭐⭐⭐ | Detailed analysis |
| mistral | ~4.1GB | ⚡⚡ | ⭐⭐⭐⭐ | Professional reports |
| phi3 | ~2.3GB | ⚡⚡⚡⚡ | ⭐⭐ | Quick queries |
| gemma:2b | ~1.4GB | ⚡⚡⚡⚡⚡ | ⭐⭐ | Very fast responses |

### Download Models
```powershell
ollama pull llama3.2      # Recommended
ollama pull llama3.1:8b   # Better quality
ollama pull mistral       # Alternative
ollama pull phi3          # Faster
ollama pull gemma:2b      # Fastest
```

## 🎨 Features

### Real-time Chat
- ✅ Instant responses from AI
- ✅ Context-aware answers based on your actual case data
- ✅ Conversational follow-ups

### Status Monitoring
- 🟢 **Green**: Ollama connected and ready
- 🔴 **Red**: Ollama offline or not installed
- 🟡 **Yellow**: Checking connection

### Export Capability
- **Export Chat**: Save entire conversation to text file
- **Clear Chat**: Start fresh conversation
- **Timestamps**: Every message timestamped

### Model Switching
- Change AI models on-the-fly
- Test different models for best results
- No restart required

## 🐛 Troubleshooting

### "Ollama Offline" Error
**Solution:**
```powershell
# Check if Ollama is running
Get-Process ollama

# If not, start it
ollama serve

# Or restart Ollama application
```

### Model Not Found
**Solution:**
```powershell
# Download the model
ollama pull llama3.2

# Verify installation
ollama list
```

### Slow First Response
**Expected Behavior**: First response loads model into memory (10-30 seconds)
**Subsequent responses**: Much faster (1-5 seconds)

### Connection Timeout
**Check:**
1. Backend running on port 8001
2. Ollama running on port 11434
3. No firewall blocking connections

### Poor Quality Responses
**Solutions:**
1. Try a larger model (llama3.1:8b or mistral)
2. Be more specific in your questions
3. Provide more context in follow-up questions

## 🔐 Security Notes

### Data Privacy
- ✅ All processing is **local** - no data sent to cloud
- ✅ Ollama runs on your machine
- ✅ Your case data stays private
- ✅ No API keys required

### Firewall
- Ollama uses port **11434** locally
- SARGEN backend uses port **8001**
- Both should be allowed in firewall

## 📊 Integration with SARGEN

### AI-Generated SAR Narratives
1. Go to any case
2. Click "Generate SAR"
3. Click "Generate AI Narrative" button
4. Get professional SAR narrative in seconds

### Intelligent Case Analysis
- AI understands your complete case database
- Provides insights across all 15+ cases
- Identifies patterns and correlations
- Suggests investigation priorities

### Automated Insights
- Pattern frequency analysis
- Risk factor identification
- Banking network mapping
- Regulatory compliance checks

## 🎓 Learning Resources

### Ollama Documentation
- Website: https://ollama.ai
- GitHub: https://github.com/ollama/ollama
- Model Library: https://ollama.ai/library

### SARGEN Documentation
- See: `OLLAMA_SETUP.md` for detailed installation
- See: `README.md` for system overview
- See: `SIMPLE_README.md` for quick start

## 💡 Sample Workflow

### Daily AML Review with AI
1. **Morning Briefing**
   - "Summarize all high risk cases"
   - "What new patterns were detected?"
   
2. **Investigation Priority**
   - "Which cases should I investigate first?"
   - "Compare risk indicators across cases"
   
3. **Deep Dive**
   - "Analyze Case SAR-2024-001 in detail"
   - "What makes this case suspicious?"
   
4. **Reporting**
   - "Generate recommendations for high risk cases"
   - "Summarize findings for management review"

## 🆘 Support

### Need Help?
1. Check status indicator in AI Copilot
2. Run connection test
3. Review error messages in chat
4. Check Ollama process: `Get-Process ollama`
5. Review backend logs

### Common Commands
```powershell
# Check Ollama
ollama --version
ollama list
ollama ps

# Test model
ollama run llama3.2

# SARGEN
cd "c:\Users\Vivek\Downloads\archive (1)\sargen"
python app.py  # Backend
cd sargen-app
npm run dev    # Frontend
```

## 🎉 Tips for Best Results

1. **Start Simple**: Ask basic questions first
2. **Be Specific**: Include details like case IDs, amounts, patterns
3. **Follow Up**: Ask clarifying questions
4. **Use Examples**: Reference specific cases when asking
5. **Request Formats**: Ask for lists, summaries, or analysis
6. **Compare**: Ask AI to compare and contrast cases
7. **Explain**: Request explanations of patterns and risks

---

**Ready to start?** 
1. Ensure Ollama is running
2. Open http://localhost:5173/ai-chat
3. Ask your first question! 🚀

# Ollama Setup Guide for SARGEN AI Copilot

## Installation Steps

### 1. Download and Install Ollama

1. Visit: https://ollama.ai/download
2. Download the Windows installer
3. Run the installer and follow the installation wizard
4. Ollama will automatically start as a service

### 2. Verify Installation

Open PowerShell and run:
```powershell
ollama --version
```

You should see the Ollama version number.

### 3. Download AI Models

SARGEN supports multiple models. Start with the recommended models:

#### Recommended: Llama 3.2 (Fast and efficient)
```powershell
ollama pull llama3.2
```

#### Alternative Models:

**For Better Quality (Larger, slower):**
```powershell
ollama pull llama3.1:8b
ollama pull mistral
ollama pull mixtral
```

**For Speed (Smaller, faster):**
```powershell
ollama pull phi3
ollama pull gemma:2b
```

### 4. Verify Model Installation

```powershell
ollama list
```

This will show all downloaded models.

### 5. Test Ollama

```powershell
ollama run llama3.2
```

Type a test message and press Enter. Type `/bye` to exit.

## Using AI Copilot in SARGEN

Once Ollama is installed and models are downloaded:

### Features Available:

1. **AI SAR Narrative Generation**
   - Go to any case in SARGEN
   - Click "Generate SAR"
   - Click "Generate AI Narrative" button
   - Get professional SAR narratives written by AI

2. **AI Copilot Chat**
   - Click "AI Copilot" in the sidebar
   - Ask questions like:
     - "What are the high risk cases?"
     - "Summarize the suspicious patterns"
     - "Which accounts have the most transactions?"
     - "Analyze the risk trends"
   - Get intelligent responses based on your actual case data

### Model Selection

The chatbot supports multiple models:
- `llama3.2` (Default - Recommended)
- `llama3.1:8b`
- `mistral`
- `phi3`
- `gemma:2b`

You can switch models in the chat interface.

## Troubleshooting

### Ollama Not Responding
1. Check if Ollama service is running:
   ```powershell
   Get-Process ollama
   ```

2. Restart Ollama:
   ```powershell
   Stop-Process -Name ollama -Force
   ollama serve
   ```

### Model Not Found
```powershell
ollama pull llama3.2
```

### Port Issues
Ollama runs on port 11434 by default. Make sure it's not blocked.

## Performance Tips

1. **First Response**: The first AI response may be slow as the model loads into memory
2. **Subsequent Responses**: Much faster after the model is loaded
3. **Model Size**: Smaller models (phi3, gemma:2b) are faster but less accurate
4. **RAM**: Ensure you have enough RAM for the model (8GB minimum recommended)

## API Endpoints in SARGEN

### Generate AI Narrative
```
POST /api/ai/generate-narrative/{case_id}?model=llama3.2
```

### AI Chat
```
POST /api/ai/chat
Body: {"question": "your question", "model": "llama3.2"}
```

## Quick Start Commands

```powershell
# Install Ollama (download from https://ollama.ai/download first)

# After installation:
ollama pull llama3.2

# Start using SARGEN's AI Copilot!
```

## Support

For Ollama documentation: https://github.com/ollama/ollama
For SARGEN support: Check the application logs

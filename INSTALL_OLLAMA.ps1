# Ollama Installation and Setup Script for SARGEN
# Run this script in PowerShell as Administrator

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  SARGEN AI Copilot - Ollama Setup Script" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if running as Administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Warning: Not running as Administrator" -ForegroundColor Yellow
    Write-Host "   Some features may require admin privileges" -ForegroundColor Yellow
    Write-Host ""
}

# Step 1: Check if Ollama is installed
Write-Host "Step 1: Checking Ollama installation..." -ForegroundColor Yellow
$ollamaInstalled = Get-Command ollama -ErrorAction SilentlyContinue

if ($ollamaInstalled) {
    Write-Host "✅ Ollama is already installed!" -ForegroundColor Green
    ollama --version
} else {
    Write-Host "❌ Ollama is not installed" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please download and install Ollama:" -ForegroundColor Cyan
    Write-Host "1. Visit: https://ollama.ai/download" -ForegroundColor White
    Write-Host "2. Download the Windows installer" -ForegroundColor White
    Write-Host "3. Run the installer" -ForegroundColor White
    Write-Host "4. Restart this script after installation" -ForegroundColor White
    Write-Host ""
    
    $openBrowser = Read-Host "Open download page in browser? (Y/N)"
    if ($openBrowser -eq "Y" -or $openBrowser -eq "y") {
        Start-Process "https://ollama.ai/download"
    }
    
    Write-Host ""
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    exit
}

Write-Host ""

# Step 2: Check if Ollama service is running
Write-Host "Step 2: Checking Ollama service..." -ForegroundColor Yellow
$ollamaProcess = Get-Process ollama -ErrorAction SilentlyContinue

if ($ollamaProcess) {
    Write-Host "✅ Ollama service is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Ollama service is not running" -ForegroundColor Yellow
    Write-Host "   Attempting to start Ollama..." -ForegroundColor Yellow
    Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    Write-Host "✅ Ollama service started" -ForegroundColor Green
}

Write-Host ""

# Step 3: Check installed models
Write-Host "Step 3: Checking installed AI models..." -ForegroundColor Yellow
$modelList = ollama list 2>&1

if ($modelList -match "NAME") {
    Write-Host "Installed models:" -ForegroundColor Green
    Write-Host $modelList
} else {
    Write-Host "❌ No models installed yet" -ForegroundColor Red
}

Write-Host ""

# Step 4: Recommend and install models
Write-Host "Step 4: Downloading recommended AI models..." -ForegroundColor Yellow
Write-Host ""

$models = @(
    @{Name="llama3.2"; Description="Recommended - Fast and efficient"; Size="~2GB"},
    @{Name="llama3.1:8b"; Description="Higher quality responses"; Size="~4.7GB"},
    @{Name="mistral"; Description="Balanced performance"; Size="~4.1GB"},
    @{Name="phi3"; Description="Very fast, smaller model"; Size="~2.3GB"}
)

Write-Host "Available models:" -ForegroundColor Cyan
for ($i=0; $i -lt $models.Count; $i++) {
    Write-Host "$($i+1). $($models[$i].Name) - $($models[$i].Description) [$($models[$i].Size)]" -ForegroundColor White
}
Write-Host ""

Write-Host "Which models would you like to install?" -ForegroundColor Cyan
Write-Host "Enter numbers separated by commas (e.g., 1,2) or 'A' for all, or 'S' to skip:" -ForegroundColor Cyan
$selection = Read-Host

if ($selection -ne "S" -and $selection -ne "s") {
    $modelsToInstall = @()
    
    if ($selection -eq "A" -or $selection -eq "a") {
        $modelsToInstall = $models
    } else {
        $indices = $selection -split "," | ForEach-Object { [int]$_.Trim() - 1 }
        foreach ($index in $indices) {
            if ($index -ge 0 -and $index -lt $models.Count) {
                $modelsToInstall += $models[$index]
            }
        }
    }
    
    Write-Host ""
    foreach ($model in $modelsToInstall) {
        Write-Host "⬇️  Downloading $($model.Name)..." -ForegroundColor Cyan
        Write-Host "   This may take several minutes..." -ForegroundColor Yellow
        ollama pull $model.Name
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $($model.Name) installed successfully!" -ForegroundColor Green
        } else {
            Write-Host "❌ Failed to install $($model.Name)" -ForegroundColor Red
        }
        Write-Host ""
    }
} else {
    Write-Host "⏭️  Skipping model installation" -ForegroundColor Yellow
}

Write-Host ""

# Step 5: Test Ollama
Write-Host "Step 5: Testing Ollama installation..." -ForegroundColor Yellow

# Check if at least one model is installed
$installedModels = ollama list 2>&1
if ($installedModels -match "llama3.2|llama3.1|mistral|phi3|gemma") {
    Write-Host "✅ Ollama is ready to use!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Testing with a simple query..." -ForegroundColor Cyan
    
    # Get the first installed model
    $testModel = "llama3.2"
    if ($installedModels -notmatch "llama3.2" -and $installedModels -match "llama3.1") {
        $testModel = "llama3.1:8b"
    }
    
    Write-Host "Running test query with $testModel..." -ForegroundColor Yellow
    $testResult = ollama run $testModel "Say hello in one sentence" 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Test successful! Response:" -ForegroundColor Green
        Write-Host $testResult -ForegroundColor White
    } else {
        Write-Host "⚠️  Test had issues, but Ollama is installed" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  No models installed. Install at least one model to use AI Copilot" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Setup Complete!" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Green
Write-Host "1. Make sure SARGEN backend is running (python app.py)" -ForegroundColor White
Write-Host "2. Open SARGEN in your browser (http://localhost:5173)" -ForegroundColor White
Write-Host "3. Click 'AI Copilot' in the sidebar" -ForegroundColor White
Write-Host "4. Start asking questions about your AML cases!" -ForegroundColor White
Write-Host ""
Write-Host "Useful Ollama commands:" -ForegroundColor Cyan
Write-Host "  ollama list          - Show installed models" -ForegroundColor White
Write-Host "  ollama pull <model>  - Download a new model" -ForegroundColor White
Write-Host "  ollama run <model>   - Test a model interactively" -ForegroundColor White
Write-Host "  ollama rm <model>    - Remove a model" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

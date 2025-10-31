# SARGEN Complete Start Script
Write-Host "🚀 Starting SARGEN Complete System..." -ForegroundColor Cyan
Write-Host ""

# Start Backend
Write-Host "📊 Starting Backend API on port 8001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; & 'C:\Users\Vivek\anaconda3\python.exe' app.py"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start Frontend
Write-Host "⚛️  Starting React Frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process; cd '$PSScriptRoot\sargen-app'; npm run dev"

# Wait for frontend to start
Start-Sleep -Seconds 8

# Open browser
Write-Host "🌐 Opening browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "✅ SARGEN is running!" -ForegroundColor Green
Write-Host "   Backend:  http://localhost:8001" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "   API Docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

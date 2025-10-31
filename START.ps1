# SARGEN Simple - Start Script

Write-Host "=" -NoNewline -ForegroundColor Blue
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host "  SMART SAR - Simple System" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Blue

Write-Host "`n📊 Starting backend server..." -ForegroundColor Yellow

# Start the server in background
Start-Process powershell -ArgumentList "-NoExit", "-Command", "C:/Users/Vivek/anaconda3/Scripts/conda.exe run -p C:\Users\Vivek\anaconda3 --no-capture-output python app.py"

Start-Sleep -Seconds 3

Write-Host "✅ Backend started on http://localhost:8001" -ForegroundColor Green

Write-Host "`n🌐 Opening frontend..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

# Open the frontend
Start-Process "index.html"

Write-Host "✅ Frontend opened in browser" -ForegroundColor Green

Write-Host "`n" -ForegroundColor White
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host "  System Ready!" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Blue
Write-Host "`nBackend API: http://localhost:8001" -ForegroundColor Cyan
Write-Host "API Docs: http://localhost:8001/docs" -ForegroundColor Cyan
Write-Host "`nPress any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

@echo off
echo ========================================================
echo Dang dung Rich Fish AI KCS Service (cong 8000)...
echo ========================================================

for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000') do (
    taskkill /f /pid %%a >nul 2>&1
)

echo [OK] Da dung hoan tat AI KCS Service!
pause

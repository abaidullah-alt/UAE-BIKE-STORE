@echo off
REM ============================================================
REM UAE Bicycle — One-click start
REM Double-click this file to start the website and open it
REM in your browser automatically. Close this window to stop
REM the website.
REM ============================================================

cd /d "%~dp0"

echo Starting UAE Bicycle website...
echo (Keep this window open while using the site. Close it to stop.)
echo.

REM Open the browser after a short delay to give the server time to boot
start "" cmd /c "timeout /t 6 /nobreak >nul && start http://localhost:3000"

REM Start the dev server (this keeps running until you close the window)
call npm run dev

pause

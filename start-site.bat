@echo off
title Ember ^& Oak website
cd /d "%~dp0"

echo.
echo  Ember ^& Oak - starting the website...
echo.

if not exist ".next\BUILD_ID" (
  echo  First run: building the site, this takes a minute...
  call npm run build || goto :error
)

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
  echo  On a phone or tablet on the same Wi-Fi, open:  http://%%a:3000
)
echo  On this computer, open:                         http://localhost:3000
echo.
echo  Keep this window open while you use the site. Close it to stop.
echo.

call npm run start -- -H 0.0.0.0 -p 3000
goto :eof

:error
echo.
echo  Build failed - see the messages above.
pause

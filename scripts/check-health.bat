@echo off
setlocal

set HEALTH_URL=http://127.0.0.1:4000/api/health
where curl >nul 2>&1
if errorlevel 1 (
  echo curl was not found.
  echo Open this link manually in a browser:
  echo %HEALTH_URL%
  echo.
  pause
  exit /b 0
)

echo Checking backend health...
curl --fail --silent --show-error "%HEALTH_URL%"
if errorlevel 1 (
  echo.
  echo Backend health check failed.
) else (
  echo.
  echo Backend health check completed.
)

echo.
pause

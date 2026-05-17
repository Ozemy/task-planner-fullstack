@echo off
setlocal
cd /d "%~dp0.."

echo Stopping PostgreSQL Docker container...
call npm run db:down
if errorlevel 1 (
  echo.
  echo PostgreSQL could not be stopped automatically. Check the error above.
) else (
  echo.
  echo PostgreSQL stopped.
)

echo Close the backend and frontend windows manually if they are still open.
echo.
pause

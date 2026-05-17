@echo off
setlocal
cd /d "%~dp0.."

if not exist "server\.env" (
  echo Creating server\.env from server\.env.example...
  copy /Y "server\.env.example" "server\.env" >nul
  if errorlevel 1 (
    echo Failed to create server\.env.
    pause
    exit /b 1
  )
)

echo [1/4] Starting PostgreSQL in Docker...
call npm run db:up
if errorlevel 1 (
  echo.
  echo Failed to start PostgreSQL. Make sure Docker Desktop is open.
  pause
  exit /b 1
)

echo.
echo [2/4] Applying Prisma migrations...
call npm run db:migrate
if errorlevel 1 (
  echo.
  echo Failed to apply migrations. Check the error above.
  pause
  exit /b 1
)

echo.
echo [3/4] Opening backend window...
start "Task Planner Backend" cmd /k "cd /d ""%CD%"" && npm run dev:server"

echo [4/4] Opening frontend window...
start "Task Planner Frontend" cmd /k "cd /d ""%CD%"" && npm run dev:web"

echo.
echo Project startup commands were launched.
echo Open http://127.0.0.1:5173
echo.
pause

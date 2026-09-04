@echo off
echo ?? Installing frontend dependencies...
cd binercraft-frontend
call npm install
echo ? Frontend ready!
cd ..
echo ?? Installing backend dependencies...
cd binercraft-backend
call npm install
echo ? Backend ready!
echo.
echo ?? BinerCraft project setup complete!
echo.
echo To start the backend: cd binercraft-backend && npm run dev
echo To start the frontend: cd binercraft-frontend && npm run dev
echo.
pause

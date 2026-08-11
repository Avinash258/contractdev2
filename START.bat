@echo off
title VaultMesh
cd /d "%~dp0"

echo.
echo  Project folder:
echo    C:\Project\contractTestingGraphQl
echo.
echo  Website  http://localhost:4000
echo  GraphQL  http://localhost:4000/graphql
echo  gRPC     localhost:50051
echo  Login    demo@fintech.com / demo123
echo.

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

echo Starting VaultMesh — leave this window open.
echo Then double-click RUN-TESTS.bat in this same folder.
echo.
node src\server.js
pause

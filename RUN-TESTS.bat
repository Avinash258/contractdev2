@echo off
title VaultMesh contract tests
cd /d "%~dp0"

echo.
echo  App folder:  C:\Project\contractTestingGraphQl
echo  Tests hit:   http://localhost:4000  and  localhost:50051
echo.
echo  Keep START.bat running. This script does not start or stop the app.
echo.

node tests\contract\run-vaultmesh.js --no-start
echo.
pause

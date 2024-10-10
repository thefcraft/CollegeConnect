@echo off
cd "frontend"
start cmd /c "npx next dev -H 0.0.0.0 -p 3000"
cd "../backend"
start cmd /c "python api.py"
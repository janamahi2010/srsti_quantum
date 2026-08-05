@echo off
cd /d "%~dp0"
echo Starting local preview with clean URLs (like the live Render site)...
python scripts\dev-server.py
pause

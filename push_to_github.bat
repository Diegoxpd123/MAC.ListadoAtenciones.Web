@echo off
cd /d "%~dp0"
git add .
git commit -m "Initial commit: Proyecto MAC.ListadoAtenciones.Web"
git branch -M main
git push -u origin main
pause


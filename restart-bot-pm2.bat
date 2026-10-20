
@echo off
setlocal EnableExtensions
title S1MORG - BOT RESTART
mode con: cols=76 lines=32
color 0B
cd /d "%~dp0"

cls
echo.
echo  ==============================================================
echo.
echo     _____    ___     __  ___    ____     ____    ______
echo    / ___/   ^<  /    /  ^|/  /   / __ \   / __ \  / ____/
echo    \__ \    / /    / /^|_/ /   / / / /  / /_/ /  / / __
echo   ___/ /   / /    / /  / /   / /_/ /  / _, _/ / /_/ /
echo  /____/   /_/    /_/  /_/    \____/  /_/ ^|_^|  \____/
echo.
echo                    S 1 M O R G
echo                 SYSTEM INITIALIZING
echo.
echo  ==============================================================
echo.
echo  [SYSTEM] Bot yeniden baslatiliyor...
echo.

echo  [01] PM2 kontrol ediliyor...
where pm2 >nul 2>nul
if not errorlevel 1 goto pm2_ok

echo  [WARN] PM2 yuklu degil.
where npm >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] npm bulunamadi! Once Node.js kur: https://nodejs.org
    goto error
)
choice /c YN /n /m "  PM2 simdi yuklensin mi? [Y/N]: "
if errorlevel 2 (
    echo.
    echo  [INFO] Yukleme reddedildi, cikiliyor.
    timeout /t 2 /nobreak >nul
    exit /b 1
)
echo.
echo  [WAIT] PM2 yukleniyor...
call npm install -g pm2
if errorlevel 1 (
    echo  [ERROR] PM2 yuklenemedi!
    goto error
)
where pm2 >nul 2>nul
if errorlevel 1 (
    echo  [OK] PM2 yuklendi. PATH icin bu betigi KAPATIP TEKRAR AC.
    goto error
)

:pm2_ok
echo  [OK] PM2 hazir.
echo.

echo  [02] Yapilandirma kontrol ediliyor...
if not exist "%~dp0ecosystem.config.cjs" (
    echo  [ERROR] ecosystem.config.cjs bulunamadi!
    goto error
)
if not exist "%~dp0dist\src\index.js" (
    echo  [ERROR] dist\src\index.js bulunamadi! Once "npm run build" calistir.
    goto error
)
echo  [OK] Yapilandirma tamam.
echo.

echo  [03] Bot yeniden baslatiliyor...
echo  --------------------------------------------------------------
call pm2 startOrRestart "%~dp0ecosystem.config.cjs" --update-env
if errorlevel 1 (
    echo  [ERROR] pm2 startOrRestart basarisiz oldu!
    goto error
)
echo.
call pm2 status

echo.
echo  ==============================================================
echo.
echo               [ SUCCESS ] S1MORG BOT RESTART
echo.
echo                    PROCESS COMPLETED
echo.
echo  ==============================================================
echo.
pause
exit /b 0

:error
echo.
echo  ==============================================================
echo                  [ SYSTEM ERROR ]
echo  ==============================================================
echo.
echo  Islem basarisiz oldu. Yukaridaki hatayi kontrol et.
echo.
pause
exit /b 1


@echo off
setlocal EnableExtensions EnableDelayedExpansion
title S1MORG - INFRASTRUCTURE SYSTEM
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
echo              INFRASTRUCTURE CONTROL
echo.
echo  ==============================================================
echo.
echo  [SYSTEM] Altyapi yoneticisi baslatiliyor...
timeout /t 1 /nobreak >nul

echo.
echo  [01] Servis betigi kontrol ediliyor...

if not exist "%~dp0scripts\start-infra.ps1" (
    echo.
    echo  [ERROR] scripts\start-infra.ps1 bulunamadi!
    goto error
)

where powershell.exe >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] PowerShell bulunamadi!
    goto error
)

echo  [OK] Betik bulundu.
echo.

echo  [01b] Docker / Java kontrol ediliyor...
where docker >nul 2>nul
if not errorlevel 1 goto deps_ok
where java >nul 2>nul
if not errorlevel 1 goto deps_ok

echo  [WARN] Ne Docker ne de Java bulundu. Lavalink icin Java 17+ gerekli.
where winget >nul 2>nul
if errorlevel 1 (
    echo  [ERROR] winget bulunamadi, Java'yi elle kur: https://adoptium.net
    goto error
)
choice /c YN /n /m "  Java 17 (Temurin) simdi yuklensin mi? [Y/N]: "
if errorlevel 2 (
    echo.
    echo  [INFO] Yukleme reddedildi, cikiliyor.
    timeout /t 2 /nobreak >nul
    exit /b 1
)
echo.
echo  [WAIT] Java 17 yukleniyor...
winget install --id EclipseAdoptium.Temurin.17.JRE -e --accept-package-agreements --accept-source-agreements
if errorlevel 1 (
    echo  [ERROR] Java yuklenemedi!
    goto error
)
echo.
echo  [OK] Java yuklendi. PATH'in gelmesi icin bu betigi KAPATIP TEKRAR AC.
echo.
pause
exit /b 0

:deps_ok
echo  [OK] Gerekli arac bulundu.
echo.
echo  [02] MONGODB + REDIS + LAVALINK
echo  --------------------------------------------------------------
echo.
echo  [WAIT] Servisler baslatiliyor...
echo.

powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-infra.ps1"
set "RESULT=%ERRORLEVEL%"

echo.
if not "%RESULT%"=="0" goto error

echo.
echo  ==============================================================
echo.
echo               [ SUCCESS ] S1MORG INFRASTRUCTURE
echo.
echo                    PROCESS COMPLETED
echo.
echo  ==============================================================
echo.
echo  Betik basariyla tamamlandi.
echo  Servis baglantilarini ayrica dogrula.
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

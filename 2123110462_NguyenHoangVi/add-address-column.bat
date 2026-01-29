@echo off
REM Execute SQL to add missing columns to orders table

echo Adding address column to orders table...

REM Change to script directory
cd /d "%~dp0"

REM Execute SQL file using mysql command line
mysql -u root -h 127.0.0.1 candy_shop_db < add-address-column.sql

if %errorlevel% equ 0 (
    echo.
    echo ✅ Column added successfully!
    echo.
) else (
    echo.
    echo ❌ Error executing SQL
    echo.
)

pause

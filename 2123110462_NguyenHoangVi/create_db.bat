@echo off
REM Execute MySQL script to create fresh database
echo Dropping old database and creating new one...

mysql -h localhost -u root < "d:\Didong\2123110462_NguyenHoangVi\create_fresh_database.sql"

if %errorlevel% equ 0 (
    echo.
    echo ✅ Database created successfully!
    echo.
) else (
    echo.
    echo ❌ Database creation failed!
    echo.
)

pause

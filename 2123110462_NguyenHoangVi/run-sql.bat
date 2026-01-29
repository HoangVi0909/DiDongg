@echo off
echo Creating orders tables...
mysql -u root -h 127.0.0.1 candy_shop_db < create-orders-table.sql
if %errorlevel% equ 0 (
    echo ✅ Tables created successfully!
) else (
    echo ❌ Failed to create tables
)
pause

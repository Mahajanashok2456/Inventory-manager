@echo off
echo Starting Mahajan's Store in Production Mode...

cd backend
set DJANGO_SETTINGS_MODULE=backend.settings_production

echo Creating production database...
python manage.py migrate

echo Starting production server...
echo.
echo Your store will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.

python manage.py runserver 0.0.0.0:8000
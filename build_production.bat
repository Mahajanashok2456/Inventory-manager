@echo off
echo Building Mahajan's Store for Production...

REM Backend setup
echo Setting up backend...
cd backend
pip install -r ../requirements_production.txt

REM Create production database
echo Setting up production database...
set DJANGO_SETTINGS_MODULE=backend.settings_production
python manage.py migrate
python manage.py collectstatic --noinput

REM Frontend setup
echo Building React frontend...
cd ../frontend
npm install
npm run build

echo Build complete!
echo.
echo To run production server:
echo cd backend
echo set DJANGO_SETTINGS_MODULE=backend.settings_production
echo python manage.py runserver
pause

#!/bin/bash
# Production build script for Mahajan's Store

echo "Building Mahajan's Store for Production..."

# Backend setup
echo "Setting up backend..."
cd backend
pip install -r ../requirements_production.txt

# Create production database
echo "Setting up production database..."
python manage.py migrate --settings=backend.settings_production
python manage.py collectstatic --noinput --settings=backend.settings_production

# Create superuser (optional)
echo "Creating admin user..."
python manage.py createsuperuser --settings=backend.settings_production || echo "Admin user already exists"

# Frontend setup
echo "Building React frontend..."
cd ../frontend
npm install
npm run build

echo "Build complete!"
echo ""
echo "To deploy:"
echo "1. Upload files to your server"
echo "2. Configure Nginx (use nginx.conf template)"
echo "3. Start backend: cd backend && gunicorn backend.wsgi:application --bind 127.0.0.1:8000"
echo "4. Your store will be available at your domain!"

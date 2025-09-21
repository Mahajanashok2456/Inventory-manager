#!/usr/bin/env python3
"""
Production deployment script for Mahajan's Store
Supports SQLite deployment with production-ready configuration
"""

import os
import shutil
import subprocess
import json
from pathlib import Path

def create_production_settings():
    """Create production Django settings"""
    settings_content = '''
import os
from pathlib import Path

# Build paths inside the project
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings for production
SECRET_KEY = os.environ.get('DJANGO_SECRET_KEY', 'your-production-secret-key-here')
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com', 'www.your-domain.com', 'localhost', '127.0.0.1']

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'corsheaders',
    'inventory',
    'orders',
    'analytics',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # For static files
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'backend.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'backend.wsgi.application'

# Production SQLite Database
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'production_db.sqlite3',  # Separate production DB
        'OPTIONS': {
            'timeout': 20,
        }
    }
}

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'Asia/Kolkata'
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS settings for production
CORS_ALLOW_ALL_ORIGINS = False
CORS_ALLOWED_ORIGINS = [
    "https://your-domain.com",
    "https://www.your-domain.com",
    "http://localhost:3000",  # For development
]

# Security settings
SECURE_SSL_REDIRECT = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_RENDERER_CLASSES': [
        'rest_framework.renderers.JSONRenderer',
    ],
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50
}

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'file': {
            'level': 'INFO',
            'class': 'logging.FileHandler',
            'filename': BASE_DIR / 'django.log',
            'formatter': 'verbose',
        },
    },
    'loggers': {
        'django': {
            'handlers': ['file'],
            'level': 'INFO',
            'propagate': True,
        },
    },
}
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/backend/settings_production.py', 'w') as f:
        f.write(settings_content)

def create_deployment_files():
    """Create production deployment files"""
    
    # Requirements for production
    requirements_prod = '''
Django==4.2.5
djangorestframework==3.14.0
django-cors-headers==4.2.0
python-decouple==3.8
whitenoise==6.5.0
gunicorn==21.2.0
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/requirements_production.txt', 'w') as f:
        f.write(requirements_prod)
    
    # Procfile for deployment platforms like Heroku
    procfile = 'web: cd backend && python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:$PORT'
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/Procfile', 'w') as f:
        f.write(procfile)
    
    # Docker configuration
    dockerfile = '''FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements_production.txt .
RUN pip install --no-cache-dir -r requirements_production.txt

# Copy project
COPY . .

# Set environment variables
ENV DJANGO_SETTINGS_MODULE=backend.settings_production
ENV PYTHONPATH=/app/backend

# Collect static files and migrate
WORKDIR /app/backend
RUN python manage.py collectstatic --noinput
RUN python manage.py migrate

# Expose port
EXPOSE 8000

# Run gunicorn
CMD ["gunicorn", "backend.wsgi:application", "--bind", "0.0.0.0:8000"]
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/Dockerfile', 'w') as f:
        f.write(dockerfile)
    
    # Production environment template
    env_prod = '''# Production Environment Variables
DJANGO_SECRET_KEY=your-super-secret-production-key-here
DJANGO_SETTINGS_MODULE=backend.settings_production
ALLOWED_HOSTS=your-domain.com,www.your-domain.com
CORS_ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/.env.production', 'w') as f:
        f.write(env_prod)

def create_nginx_config():
    """Create Nginx configuration for reverse proxy"""
    nginx_config = '''server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;
    
    # SSL configuration
    ssl_certificate /etc/ssl/certs/your-domain.crt;
    ssl_certificate_key /etc/ssl/private/your-domain.key;
    
    # Frontend static files
    location / {
        root /var/www/mahajan-store/frontend/build;
        try_files $uri $uri/ /index.html;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Django admin
    location /admin/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Static files
    location /static/ {
        alias /var/www/mahajan-store/backend/staticfiles/;
    }
    
    # Media files
    location /media/ {
        alias /var/www/mahajan-store/backend/media/;
    }
}'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/nginx.conf', 'w') as f:
        f.write(nginx_config)

def create_deployment_scripts():
    """Create deployment automation scripts"""
    
    # Build script
    build_script = '''#!/bin/bash
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
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/build_production.sh', 'w') as f:
        f.write(build_script)
    
    # Windows batch file
    build_bat = '''@echo off
echo Building Mahajan's Store for Production...

REM Backend setup
echo Setting up backend...
cd backend
pip install -r ../requirements_production.txt

REM Create production database
echo Setting up production database...
python manage.py migrate --settings=backend.settings_production
python manage.py collectstatic --noinput --settings=backend.settings_production

REM Frontend setup
echo Building React frontend...
cd ../frontend
npm install
npm run build

echo Build complete!
echo.
echo To run production server:
echo cd backend
echo python manage.py runserver --settings=backend.settings_production
pause
'''
    
    with open('c:/Users/MAHAJAN ASHOK/OneDrive/Desktop/manager/build_production.bat', 'w') as f:
        f.write(build_bat)

def main():
    """Main deployment setup function"""
    print("Creating production deployment files for Mahajan's Store...")
    
    create_production_settings()
    create_deployment_files()
    create_nginx_config()
    create_deployment_scripts()
    
    print("Production deployment files created!")
    print("")
    print("Files created:")
    print("  - backend/settings_production.py    (Production Django settings)")
    print("  - requirements_production.txt       (Production dependencies)")
    print("  - Dockerfile                       (Docker container)")
    print("  - Procfile                         (Platform deployment)")
    print("  - nginx.conf                       (Web server config)")
    print("  - build_production.bat             (Windows build script)")
    print("  - .env.production                  (Environment template)")
    print("")
    print("Next steps:")
    print("1. Run: build_production.bat")
    print("2. Choose deployment platform:")
    print("   - Heroku (easiest)")
    print("   - DigitalOcean/Linode")
    print("   - Your own VPS")
    print("3. Configure domain and SSL")
    print("")
    print("SQLite will work perfectly for small to medium stores!")

if __name__ == "__main__":
    main()
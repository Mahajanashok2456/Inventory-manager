# Vercel-specific settings
from .settings import *

# Vercel deployment settings
DEBUG = False

ALLOWED_HOSTS = [
    '.vercel.app',
    'localhost',
    '127.0.0.1',
]

# Add WhiteNoise to middleware for static files
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',  # Add WhiteNoise
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Database configuration for Supabase PostgreSQL
DATABASES = {
    'default': dj_database_url.config(
        default=config('DATABASE_URL'),
        conn_max_age=600,
        conn_health_checks=True,
    )
}

# Static files for Vercel - simplified approach
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

# WhiteNoise configuration
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# CORS settings for Vercel
CORS_ALLOWED_ORIGINS = [
    "https://inventory-manager-rflg.vercel.app",  # Your frontend
    "https://*.vercel.app",  # Any Vercel domain
    "http://localhost:3000",  # Local development
]

CORS_ALLOW_CREDENTIALS = True

# Security settings
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'

# Remove HTTPS settings for Vercel (it handles SSL)
SECURE_SSL_REDIRECT = False
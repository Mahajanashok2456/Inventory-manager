#!/bin/bash

# Build script for Vercel
echo "🚀 Building Django for Vercel..."

# Install dependencies
pip install -r requirements.txt

# Navigate to backend
cd backend

# Collect static files
python manage.py collectstatic --noinput --clear

echo "✅ Build complete!"
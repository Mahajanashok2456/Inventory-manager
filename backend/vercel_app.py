import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings_vercel')

application = get_wsgi_application()

# Vercel handler
app = application
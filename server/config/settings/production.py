from .base import *

DEBUG = False

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',') if os.getenv('ALLOWED_HOSTS') else ['*']

# Add CORS configuration for production
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        'CORS_ALLOWED_ORIGINS',
        'https://k12-erp-dev.vercel.app'
    ).split(',')
    if origin.strip()
]

# Debug: Print CORS origins for troubleshooting
print(f"🔍 CORS_ALLOWED_ORIGINS env var: {os.getenv('CORS_ALLOWED_ORIGINS', 'NOT SET')}")
print(f"🔍 Parsed CORS_ALLOWED_ORIGINS: {CORS_ALLOWED_ORIGINS}")

# Allow credentials if needed
CORS_ALLOW_CREDENTIALS = True

# Temporarily allow all origins for debugging - REMOVE AFTER TESTING
CORS_ALLOW_ALL_ORIGINS = True
print("⚠️  WARNING: CORS_ALLOW_ALL_ORIGINS is enabled for debugging")

# Ensure custom headers are allowed (inherited from base.py but made explicit)
# This includes x-district-id for multi-tenancy
from corsheaders.defaults import default_headers
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-district-id',
]

CSRF_TRUSTED_ORIGINS = [
    'https://*.railway.app',
    'https://*.up.railway.app',
    'https://k12-erp-dev.vercel.app',
]

SECURE_SSL_REDIRECT = False
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
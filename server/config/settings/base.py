import os
from pathlib import Path
from datetime import timedelta
from dotenv import load_dotenv
import dj_database_url
from corsheaders.defaults import default_headers

# Load environment variables from .env file
BASE_DIR = Path(__file__).resolve().parent.parent.parent
load_dotenv(BASE_DIR / '.env')

SECRET_KEY = os.getenv(
    'SECRET_KEY', 'django-insecure-change-this-in-production')

DEBUG = os.getenv('DEBUG', 'False') == 'True'

ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '*').split(',')

DEMO_MODE = True  # Always demo mode - no authentication required

# Application definition
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third party apps
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',

    # Local apps
    'core',
    'hiring',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    # 'core.middleware.TenantMiddleware',  # Disabled for demo - no multi-tenancy
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'config.urls'

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

WSGI_APPLICATION = 'config.wsgi.application'
ASGI_APPLICATION = 'config.asgi.application'

# Database Configuration
DATABASE_URL = os.getenv('DATABASE_URL')

if DATABASE_URL:
    # Use DATABASE_URL (Railway provides this automatically)
    DATABASES = {
        'default': dj_database_url.config(
            default=DATABASE_URL,
            conn_max_age=600,
            conn_health_checks=True,
        )
    }
else:
    # Fallback to individual environment variables for local development
    def _get_db_setting(key: str, default: str) -> str:
        mapping = {
            'NAME': ['PGDATABASE', 'POSTGRES_DB', 'DB_NAME'],
            'USER': ['PGUSER', 'POSTGRES_USER', 'DB_USER'],
            'PASSWORD': ['PGPASSWORD', 'POSTGRES_PASSWORD', 'DB_PASSWORD'],
            'HOST': ['PGHOST', 'POSTGRES_HOST', 'DB_HOST'],
            'PORT': ['PGPORT', 'POSTGRES_PORT', 'DB_PORT'],
        }
        for env_key in mapping.get(key, []):
            val = os.getenv(env_key)
            if val:
                return val
        return default

    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME': _get_db_setting('NAME', 'mydb'),
            'USER': _get_db_setting('USER', 'postgres'),
            'PASSWORD': _get_db_setting('PASSWORD', 'postgres'),
            'HOST': _get_db_setting('HOST', 'localhost'),
            'PORT': _get_db_setting('PORT', '5432'),
        }
    }

    # Enable SSL for managed Postgres providers
    if os.getenv('RAILWAY_ENVIRONMENT'):
        DATABASES['default'].setdefault('OPTIONS', {})
        DATABASES['default']['OPTIONS']['sslmode'] = 'require'

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# Static files
STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Media files
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# REST Framework
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.AllowAny' if DEMO_MODE
        else 'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
}

# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=60),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

# CORS Settings
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv('CORS_ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://k12-erp-dev.vercel.app').split(',')
    if origin.strip()
]

# Allow custom headers for multi-tenancy
CORS_ALLOW_HEADERS = list(default_headers) + [
    'x-district-id',
]

# Frontend URL for redirects after SSO
FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')

# Using default Django User model (authentication module removed for demo)

# Email Configuration
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.getenv('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.getenv('EMAIL_PORT', '587'))
EMAIL_USE_TLS = os.getenv('EMAIL_USE_TLS', 'True') == 'True'
EMAIL_HOST_USER = os.getenv('EMAIL_HOST_USER', 'example@example.com')
EMAIL_HOST_PASSWORD = os.getenv('EMAIL_HOST_PASSWORD', 'examplepassword')
DEFAULT_FROM_EMAIL = os.getenv('DEFAULT_FROM_EMAIL', 'example@example.com')

# Microsoft Entra ID (Azure AD) Configuration
ENTRA_ENABLED = os.getenv('ENTRA_ENABLED', 'False') == 'True'
ENTRA_TENANT_ID = os.getenv('ENTRA_TENANT_ID', '')
ENTRA_CLIENT_ID = os.getenv('ENTRA_CLIENT_ID', '')
ENTRA_CLIENT_SECRET = os.getenv('ENTRA_CLIENT_SECRET', '')

SSO_CLIENT_ID = os.getenv('SSO_CLIENT_ID', '')
SSO_TENANT_ID = os.getenv('SSO_TENANT_ID', '')
SSO_CLIENT_SECRET = os.getenv('SSO_CLIENT_SECRET', '')
SSO_REDIRECT_URI = os.getenv('SSO_REDIRECT_URI', '')

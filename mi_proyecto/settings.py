"""
Django settings for mi_proyecto project.

Generated by 'django-admin startproject' using Django 5.1.7.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/5.1/ref/settings/
"""

from pathlib import Path
import os
from pathlib import Path

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.1/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-8-lmq$2^_6hc-2tsfy^b^3mo^)s5!k7_2o%-w^@iu)i2db=30$'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

ALLOWED_HOSTS = ['scar-rilf.onrender.com', 'localhost', '127.0.0.1']

# Application definition

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'accounts',
    'distribucion',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    #'mi_proyecto.middleware.AuthRequiredMiddleware',
]

ROOT_URLCONF = 'mi_proyecto.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR, 'templates'),  # Directorio global de templates
            os.path.join(BASE_DIR, 'accounts/templates')  # Directorio específico de la app
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
            'builtins': [  # Añade esta sección para cargar tags personalizados fácilmente
                'django.templatetags.static',
            ],
        },
    },
]

WSGI_APPLICATION = 'mi_proyecto.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.1/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'base_de_datos',
        'USER': 'root',
        'PASSWORD': r'450642Osr$_&',  # La 'r' es clave para caracteres especiales
        'HOST': 'localhost',
        'PORT': '3307',
        'OPTIONS': {
            'init_command': "SET sql_mode='STRICT_TRANS_TABLES', default_storage_engine=INNODB",
            'charset': 'utf8mb4',
        },
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.1/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.1/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/

# ... (todo el código anterior permanece igual hasta STATIC_URL)

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.1/howto/static-files/
# Configuración de archivos estáticos
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
# Default primary key field type
# https://docs.djangoproject.com/en/5.1/ref/settings/#default-auto-field
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# Configuración del Admin (añade esto justo después de DEFAULT_AUTO_FIELD)
ADMIN_SITE = 'mi_proyecto.admin.site'  # Para personalizar el admin

# Configuración de Autenticación (añade esta sección)
AUTHENTICATION_BACKENDS = [
    'django.contrib.auth.backends.ModelBackend',
]

# URLs de autenticación
LOGIN_URL = '/accounts/login/'
LOGOUT_REDIRECT_URL = '/accounts/logout/'
LOGIN_REDIRECT_URL = '/accounts/inicio/'  # Cambia esto'
LOGOUT_REDIRECT_TIMEOUT = 3

# settings.py
SESSION_COOKIE_AGE = 86400  # 1440 minutos de inactividad
SESSION_EXPIRE_AT_BROWSER_CLOSE = True  # Sesión se cierra al cerrar navegador
SESSION_COOKIE_SECURE = False  # True en producción con HTTPS
SESSION_COOKIE_SAMESITE = 'Lax'  # Para compatibilidad entre navegadores
CSRF_COOKIE_HTTPONLY = False  # Permite leer CSRF token desde JavaScript
CSRF_USE_SESSIONS = False
CSRF_COOKIE_SAMESITE = 'Lax'


# Configuración de archivos estáticos (esta parte ya la tienes, verifica que coincida)
# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]

# WhiteNoise configuration (production only)
if not DEBUG:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')
    STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'
WHITENOISE_LOGGING = True
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mi_proyecto.settings')

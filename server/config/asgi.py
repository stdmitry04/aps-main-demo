import os
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                      os.getenv('DJANGO_SETTINGS_MODULE', 'config.settings.production'))

# Enable remote debugging if ENABLE_REMOTE_DEBUG is set
if os.environ.get('ENABLE_REMOTE_DEBUG', 'False').lower() == 'true':
    try:
        import debugpy
        # Check if debugpy is already listening to avoid "Address already in use" error
        if not debugpy.is_client_connected():
            try:
                debugpy.listen(("0.0.0.0", 5678))
                print(
                    "🐛 Debugpy is listening on port 5678. Waiting for debugger to attach...")
                # Uncomment the next line if you want the server to wait for debugger before starting
                # debugpy.wait_for_client()
            except RuntimeError as e:
                if "already in use" in str(e):
                    print(
                        "⚠️  Debugpy port already in use (debugger may already be attached)")
                else:
                    raise
    except ImportError:
        print("⚠️  debugpy not installed. Remote debugging disabled.")

print("ASGI settings module:", os.environ['DJANGO_SETTINGS_MODULE'])
if os.environ['DJANGO_SETTINGS_MODULE'] == 'config.settings.production':
    print('Starting in production mode')
else:
    print('Starting in development mode')

application = get_asgi_application()

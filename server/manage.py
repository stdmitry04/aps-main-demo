#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault('DJANGO_SETTINGS_MODULE',
                          'config.settings.development')

    # Enable remote debugging if ENABLE_REMOTE_DEBUG is set
    # Only initialize debugpy in the main process (not in the reloader process)
    if os.environ.get('ENABLE_REMOTE_DEBUG', 'False').lower() == 'true':
        if os.environ.get('RUN_MAIN') == 'true':
            import debugpy
            # Check if debugpy is already listening to avoid "Address already in use" error
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

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()

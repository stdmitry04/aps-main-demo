from time import time
from django.http import JsonResponse
from django.db import connection

# record process start time to report uptime
START_TIME = time()

def health(request):
    """
    Simple healthcheck for Railway (GET /health).
    Returns 200 JSON with status, uptime (seconds) and basic DB check.
    """
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
            cursor.fetchone()
        db_status = "ok"
    except Exception:
        db_status = "error"

    return JsonResponse({
        "status": "ok",
        "uptime": time() - START_TIME,
        "db": db_status,
    })
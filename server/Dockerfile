FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies (relative to this Dockerfile)
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy entire server directory (relative to this Dockerfile)
COPY . .

# Set environment variables
ENV PYTHONUNBUFFERED=1
# Default to production settings; can be overridden in Railway variables if needed
ENV DJANGO_SETTINGS_MODULE=config.settings.production
# Default port (Railway will set PORT dynamically)
ENV PORT=8000

# Run migrations, collect static, and start Uvicorn (ASGI) bound to $PORT
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && uvicorn config.asgi:application --host 0.0.0.0 --port $PORT --workers 3"]

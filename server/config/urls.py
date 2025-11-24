
"""
[DEMO VERSION]
Non-hiring modules and authentication have been removed.
This demo focuses on the hiring and onboarding functionality.
"""

from django.contrib import admin
from django.urls import path, include
from core.views import health

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/hiring/', include('hiring.urls')),
    path('api/onboarding/', include('onboarding.urls')),
    path('health/', health),
]

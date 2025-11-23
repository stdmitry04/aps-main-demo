import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from core.models import SchoolDistrict

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to detect and set current school district.
    
    Detection methods (in order of priority):
    1. X-District-ID header (primary method for API calls)
    2. User's district (if authenticated and no header provided)
    
    The district is attached to request.district for use in views.
    """
    
    # Paths that don't require a district
    EXEMPT_PATHS = [
        '/admin/',
        '/health/',
        '/api/auth/request-verification/',
        '/api/auth/verify/',
        '/api/auth/sso/',
    ]
    
    def process_request(self, request):
        """Detect and attach district to request"""
        
        # Check if path is exempt
        for exempt_path in self.EXEMPT_PATHS:
            if request.path.startswith(exempt_path):
                request.district = None
                return None
        
        district = None
        
        # Method 1: Check X-District-ID header (primary method)
        district_id = request.headers.get('X-District-ID')
        if district_id:
            try:
                district = SchoolDistrict.objects.get(id=district_id, is_active=True)
                logger.debug(f"District detected from header: {district.name}")
            except SchoolDistrict.DoesNotExist:
                logger.warning(f"Invalid district ID in header: {district_id}")
                return JsonResponse({
                    'error': 'Invalid district',
                    'detail': 'The specified district does not exist or is inactive'
                }, status=400)
            except ValueError:
                logger.warning(f"Malformed district ID in header: {district_id}")
                return JsonResponse({
                    'error': 'Invalid district ID format',
                    'detail': 'District ID must be a valid UUID'
                }, status=400)
        
        # Method 2: Use authenticated user's district
        if not district and request.user.is_authenticated:
            if hasattr(request.user, 'district'):
                district = request.user.district
                logger.debug(f"District detected from user: {district.name}")
        
        # Attach district to request
        request.district = district
        
        # For API endpoints that require district, return error if missing
        if request.path.startswith('/api/') and not district:
            # Skip district requirement for authentication and public endpoints
            auth_exempt = [
                '/api/auth/request-verification/',
                '/api/auth/verify/',
                '/api/auth/sso/',
                '/api/auth/token/',
                '/api/auth/profile/',
                '/api/hiring/positions/public/',  # Public job board
                '/api/hiring/applications/',  # Public job applications (district comes from position)
                '/api/hiring/offer-templates',  # Offer templates are not district-specific (removed trailing slash)
                '/api/hiring/offers/',  # Public offer accept/decline endpoints
            ]

            if not any(request.path.startswith(path) for path in auth_exempt):
                return JsonResponse({
                    'error': 'District required',
                    'detail': 'Please provide X-District-ID header or authenticate with a user that has a district'
                }, status=400)
        
        return None
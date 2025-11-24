from rest_framework import permissions


def _is_hr_or_admin(user):
    """Helper function to check if user has HR or Admin internal group"""
    print(user)
    if not user or not user.is_authenticated:
        return False
    internal_groups = user.get_internal_groups()
    print(internal_groups)
    return 'hr' in internal_groups or 'admin' in internal_groups


class IsHRStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow HR staff to edit onboarding data.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions are only allowed to HR staff or admins
        return _is_hr_or_admin(request.user)


class IsHRStaff(permissions.BasePermission):
    """
    Permission to only allow HR staff to access the endpoint.
    """

    def has_permission(self, request, view):
        return _is_hr_or_admin(request.user)


class IsCandidateOrHRStaff(permissions.BasePermission):
    """
    Permission for candidates to access their own data via token or HR staff to access all.
    """

    def has_permission(self, request, view):
        # Check if it's a token-based candidate access
        access_token = request.query_params.get(
            'token') or request.headers.get('X-Onboarding-Token')
        if access_token:
            return True

        # Otherwise, must be authenticated HR staff or admin
        return _is_hr_or_admin(request.user)

    def has_object_permission(self, request, view, obj):
        # Check token-based access
        access_token = request.query_params.get(
            'token') or request.headers.get('X-Onboarding-Token')
        if access_token and obj.access_token == access_token:
            # Candidates can only read and update, not delete
            if request.method == 'DELETE':
                return False
            return not obj.is_expired

        # HR staff or admins can access any candidate
        return _is_hr_or_admin(request.user)


class CanSubmitOnboarding(permissions.BasePermission):
    """
    Permission to submit onboarding form.
    """

    def has_object_permission(self, request, view, obj):
        # Check token-based access
        access_token = request.query_params.get(
            'token') or request.headers.get('X-Onboarding-Token')
        if access_token and obj.access_token == access_token:
            # Must have completed all sections
            return obj.completed_sections == 8 and not obj.is_expired

        # HR staff or admins can also submit on behalf of candidate
        return _is_hr_or_admin(request.user)


class CanReviewOnboarding(permissions.BasePermission):
    """
    Permission to review and approve onboarding submissions.
    """

    def has_permission(self, request, view):
        return _is_hr_or_admin(request.user)


class CanUploadDocuments(permissions.BasePermission):
    """
    Permission to upload documents during onboarding.
    """

    def has_permission(self, request, view):
        # Check token-based access
        access_token = request.query_params.get(
            'token') or request.headers.get('X-Onboarding-Token')
        if access_token:
            return True

        # Or authenticated HR staff or admin
        return _is_hr_or_admin(request.user)

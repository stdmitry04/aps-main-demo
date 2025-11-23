from rest_framework import permissions


class IsHRStaffOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow HR staff to edit hiring data.
    """

    def has_permission(self, request, view):
        # Read permissions are allowed to any authenticated request
        if request.method in permissions.SAFE_METHODS:
            return request.user and request.user.is_authenticated

        # Write permissions are only allowed to HR staff
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            hasattr(request.user, 'role') and request.user.role in [
                'HR', 'Admin']
        )


class IsHRStaff(permissions.BasePermission):
    """
    Permission to only allow HR staff to access the endpoint.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            hasattr(request.user, 'role') and request.user.role in [
                'HR', 'Admin']
        )


class CanViewApplicantData(permissions.BasePermission):
    """
    Permission to view applicant personal data.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            hasattr(request.user, 'role') and request.user.role in [
                'HR', 'Admin', 'Hiring Manager']
        )

    def has_object_permission(self, request, view, obj):
        # HR staff and admins can view any application
        if request.user.is_staff or (hasattr(request.user, 'role') and request.user.role in ['HR', 'Admin']):
            return True

        # Applicants can view their own applications
        if hasattr(obj, 'applicant_email'):
            return obj.applicant_email == request.user.email

        return False


class CanScheduleInterviews(permissions.BasePermission):
    """
    Permission to schedule interviews.
    """

    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and (
            request.user.is_staff or
            hasattr(request.user, 'role') and request.user.role in [
                'HR', 'Admin', 'Hiring Manager']
        )


class CanManageOffers(permissions.BasePermission):
    """
    Permission to manage job offers.
    """

    def has_permission(self, request, view):
        # Only HR and Admin can create/update offers
        if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
            return request.user and request.user.is_authenticated and (
                request.user.is_staff or
                hasattr(request.user, 'role') and request.user.role in [
                    'HR', 'Admin']
            )

        # Anyone authenticated can view offers
        return request.user and request.user.is_authenticated


class IsApplicantOrHRStaff(permissions.BasePermission):
    """
    Permission for applicants to access their own data or HR staff to access all.
    """

    def has_object_permission(self, request, view, obj):
        # HR staff can access any application
        if request.user.is_staff or (hasattr(request.user, 'role') and request.user.role in ['HR', 'Admin']):
            return True

        # Applicants can only access their own application
        if hasattr(obj, 'applicant_email'):
            return obj.applicant_email == request.user.email

        return False

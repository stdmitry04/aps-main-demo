from django.db import models


class DistrictQuerySet(models.QuerySet):
    """
    QuerySet that provides district-specific filtering methods.
    """

    def for_district(self, district):
        """
        Filter queryset to only include objects from the specified district.

        Args:
            district: SchoolDistrict instance or district ID (UUID)

        Returns:
            QuerySet filtered by district
        """
        if district is None:
            # If no district provided, return empty queryset for safety
            return self.none()

        return self.filter(district=district)


class DistrictManager(models.Manager):
    """
    Custom manager that automatically filters by district.

    Usage in models:
        class MyModel(BaseModel):
            district = models.ForeignKey(SchoolDistrict, ...)

            objects = DistrictManager()  # Use this manager

    Then in views:
        # Automatically filtered by request.district
        MyModel.objects.for_district(request.district).all()
    """

    def get_queryset(self):
        """Return custom queryset with district filtering methods"""
        return DistrictQuerySet(self.model, using=self._db)

    def for_district(self, district):
        """
        Filter to only include objects from the specified district.

        Args:
            district: SchoolDistrict instance or district ID (UUID)

        Returns:
            QuerySet filtered by district
        """
        return self.get_queryset().for_district(district)

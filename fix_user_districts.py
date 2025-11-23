#!/usr/bin/env python
"""
Quick script to fix users without districts.
Assigns all users without a district to the default district.
"""
import os
import sys
import django

# Setup Django
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'server'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()

from core.models import SchoolDistrict
from authentication.models import User

def main():
    print("=" * 60)
    print("DISTRICT ASSIGNMENT FIX")
    print("=" * 60)

    # Get or create default district
    district, created = SchoolDistrict.objects.get_or_create(
        code='default',
        defaults={
            'name': 'Default School District',
            'is_active': True
        }
    )

    if created:
        print(f"[OK] Created default district: {district.id}")
    else:
        print(f"[OK] Using existing default district: {district.id}")

    print()

    # Find users without districts
    users_without_district = User.objects.filter(district__isnull=True)
    count = users_without_district.count()

    print(f"Found {count} user(s) without a district")

    if count > 0:
        # List users
        for user in users_without_district:
            print(f"  - {user.email} (ID: {user.id})")

        print()
        print("Assigning them to default district...")

        # Update users
        updated = users_without_district.update(district=district)
        print(f"[OK] Updated {updated} user(s)")
    else:
        print("[OK] All users already have districts assigned")

    print()

    # Verify all users
    all_users = User.objects.all()
    print(f"Total users in database: {all_users.count()}")
    for user in all_users:
        print(f"  - {user.email}: District = {user.district.name if user.district else 'NULL'}")

    print()
    print("=" * 60)
    print("DONE! You can now log out and log back in to get the district_id.")
    print("=" * 60)

if __name__ == '__main__':
    main()

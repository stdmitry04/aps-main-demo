#!/usr/bin/env python
"""
Script to update job applications from 'Offer Accepted' stage to 'Offer' stage.
This script:
1. Fetches all applications at 'Offer Accepted' stage
2. Displays them for review
3. Updates them to 'Offer' stage
"""

from django.db.models import Q
from hiring.models import JobApplication
import os
import sys
import django

# Setup Django environment
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')
django.setup()


def main():
    print("=" * 80)
    print("Update Job Applications: 'Offer Accepted' -> 'Offer'")
    print("=" * 80)
    print()

    # Fetch applications at 'Offer Accepted' stage
    print("Fetching applications at 'Offer Accepted' stage...")
    applications = JobApplication.objects.filter(
        stage='Offer Accepted').select_related('position')

    count = applications.count()

    if count == 0:
        print("✓ No applications found at 'Offer Accepted' stage.")
        return

    print(f"✓ Found {count} application(s) at 'Offer Accepted' stage:\n")

    # Display applications
    print("-" * 80)
    print(f"{'ID':<38} {'Applicant Name':<25} {'Position':<20}")
    print("-" * 80)

    for app in applications:
        app_id = str(app.id)
        name = app.applicant_name[:24]
        position = app.position.title[:19] if app.position else 'N/A'
        print(f"{app_id:<38} {name:<25} {position:<20}")

    print("-" * 80)
    print()

    # Confirm update
    response = input(
        f"Do you want to update these {count} application(s) to 'Offer' stage? (yes/no): ")

    if response.lower() not in ['yes', 'y']:
        print("\n✗ Update cancelled.")
        return

    # Update applications
    print("\nUpdating applications...")
    updated_count = 0

    for app in applications:
        app.stage = 'Offer'
        app.save()
        updated_count += 1
        print(f"✓ Updated: {app.applicant_name} ({app.id})")

    print()
    print("=" * 80)
    print(
        f"✓ Successfully updated {updated_count} application(s) to 'Offer' stage.")
    print("=" * 80)


if __name__ == '__main__':
    main()

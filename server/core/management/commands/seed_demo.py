from django.core.management.base import BaseCommand
import subprocess
import sys

class Command(BaseCommand):
    help = 'Seed the database with demo data for all modules'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before seeding',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Running demo data seeding script...'))
        
        # Run the seed_demo_data.py script
        cmd = [sys.executable, 'seed_demo_data.py']
        if options['clear']:
            cmd.append('--clear')
        
        result = subprocess.run(cmd, cwd='/app' if options.get('docker') else '.')
        
        if result.returncode == 0:
            self.stdout.write(self.style.SUCCESS('Demo data seeding completed successfully!'))
        else:
            self.stdout.write(self.style.ERROR('Demo data seeding failed!'))
            sys.exit(1)

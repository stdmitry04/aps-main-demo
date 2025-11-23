from django.apps import AppConfig


class HiringOnboardingConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'hiring'

    def ready(self):
        import hiring.signals
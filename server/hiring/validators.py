from django.core.exceptions import ValidationError
from django.utils import timezone


def validate_future_date(value):
    """Validate that a date is in the future"""
    if value < timezone.now().date():
        raise ValidationError('Date must be in the future')


def validate_file_size(value):
    """Validate that uploaded file is not too large (max 5MB)"""
    filesize = value.size
    max_size = 5 * 1024 * 1024  # 5MB

    if filesize > max_size:
        raise ValidationError(f'File size must be less than 5MB. Current size: {filesize / (1024 * 1024):.2f}MB')


def validate_phone_number(value):
    """Basic phone number validation"""
    import re
    phone_pattern = re.compile(r'^\+?1?\d{9,15}$')

    # Remove common separators
    cleaned = value.replace('-', '').replace('(', '').replace(')', '').replace(' ', '')

    if not phone_pattern.match(cleaned):
        raise ValidationError('Enter a valid phone number')


def validate_salary_range(value):
    """Validate salary range format"""
    import re
    pattern = re.compile(r'^\$[\d,]+ - \$[\d,]+$')

    if not pattern.match(value):
        raise ValidationError('Salary range must be in format: $XX,XXX - $XX,XXX')

    # Extract min and max values
    parts = value.replace('$', '').replace(',', '').split(' - ')
    try:
        min_salary = int(parts[0])
        max_salary = int(parts[1])

        if min_salary >= max_salary:
            raise ValidationError('Minimum salary must be less than maximum salary')
    except (ValueError, IndexError):
        raise ValidationError('Invalid salary range format')


def validate_fte(value):
    """Validate FTE is between 0 and 1"""
    if value <= 0 or value > 1:
        raise ValidationError('FTE must be between 0 and 1.0')


def validate_positive_years(value):
    """Validate years of experience is non-negative"""
    if value < 0:
        raise ValidationError('Years of experience cannot be negative')


def validate_interview_stage_number(value):
    """Validate interview stage number is positive"""
    if value < 1:
        raise ValidationError('Interview stage number must be at least 1')


def validate_rating(value):
    """Validate rating is between 1 and 5"""
    if value < 1 or value > 5:
        raise ValidationError('Rating must be between 1 and 5')


def validate_json_time_slots(value):
    """Validate that time slots are in correct format"""
    if not isinstance(value, list):
        raise ValidationError('Time slots must be a list')

    for slot in value:
        if not isinstance(slot, str):
            raise ValidationError('Each time slot must be a string')


def validate_json_benefits(value):
    """Validate benefits list"""
    if not isinstance(value, list):
        raise ValidationError('Benefits must be a list')

    for benefit in value:
        if not isinstance(benefit, str):
            raise ValidationError('Each benefit must be a string')


def validate_screening_answers(value):
    """Validate screening answers JSON structure"""
    if not isinstance(value, dict):
        raise ValidationError('Screening answers must be a dictionary')

    for key, val in value.items():
        if not isinstance(key, str) or not isinstance(val, str):
            raise ValidationError('Screening answers must be string key-value pairs')
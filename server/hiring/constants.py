# Hardcoded offer template with {{field}} placeholders
DEFAULT_OFFER_TEMPLATE = """{{districtName}}
{{districtAddress}}

{{offerDate}}

Dear {{candidateName}},

We are pleased to offer you the position of {{positionTitle}} with {{districtName}}. We were impressed by your qualifications and believe you will be an excellent addition to our team.

POSITION DETAILS:
- Position Title: {{positionTitle}}
- Department: {{department}}
- Worksite: {{worksite}}
- FTE (Full-Time Equivalent): {{fte}}
- Salary: {{salary}}
- Start Date: {{startDate}}

BENEFITS PACKAGE:
{{benefits}}

This offer is contingent upon successful completion of a background check and verification of your credentials. This offer will expire on {{expirationDate}}.

We are excited about the possibility of you joining our team and look forward to your response.

Sincerely,

{{hrDirectorName}}
{{hrDirectorTitle}}
{{districtName}}
"""

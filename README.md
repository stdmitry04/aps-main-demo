# Hiring & Onboarding System - Demo

A full-stack applicant tracking and hiring management system built with Django REST Framework and Next.js.

**Note:** This is a demonstration version of a production hiring system. Proprietary business logic, company-specific workflows, and sensitive integrations have been removed or genericized.

## Overview

This system demonstrates a complete hiring workflow from job posting through applicant tracking, interviews, offers, and onboarding. Built for educational institutions but applicable to any organization's hiring needs.

## Tech Stack

**Backend:**
- Django 5.2
- Django REST Framework
- PostgreSQL with SQLite fallback
- RESTful API design

**Frontend:**
- Next.js 15
- React 19
- TypeScript
- Tailwind CSS

## Features (Demo Version)

### ✅ Hiring Module
- Job posting management
- Applicant tracking system (ATS)
- Application review and scoring
- Interview scheduling
- Offer generation and management
- Email notifications

### ✅ Onboarding (Frontend)
- New hire onboarding workflows
- Document collection
- Task tracking

### ⚠️ Removed for Demo
- Multi-tenant district management
- SSO/Authentication (disabled - direct access)
- DocuSign integration (proprietary)
- Email templates (company-specific)
- Custom validation logic
- Business-specific workflows

## Quick Start

### Prerequisites
- Docker and Docker Compose (recommended)
- OR Python 3.11+ and Node.js 20+ for local development

### With Docker Compose

```bash
# Clone the repository
git clone https://github.com/stdmitry04/aps-main-demo.git
cd aps-main-demo

# Start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate
docker-compose exec web python manage.py createsuperuser

# Seed demo data (optional)
docker-compose exec web python manage.py seed_demo_data
```

Access the application:
- **API:** http://localhost:8000
- **Admin:** http://localhost:8000/admin
- **Frontend:** http://localhost:3000

### Local Development

**Backend:**
```bash
cd server
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copy and configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate
python manage.py createsuperuser

# Start server
python manage.py runserver
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env.local

# Start dev server
npm run dev
```

## Project Structure

```
aps-main-demo/
├── server/                    # Django backend
│   ├── config/               # Django configuration
│   ├── core/                 # Core utilities
│   ├── hiring/               # Hiring module (main feature)
│   └── manage.py
├── frontend/                 # Next.js frontend
│   ├── app/
│   │   ├── (modules)/
│   │   │   ├── hiring/      # Hiring pages
│   │   │   └── careers/     # Public job board
│   │   └── onboarding/      # Onboarding workflows
│   ├── components/
│   └── lib/
└── docker-compose.yml
```

## API Endpoints

### Hiring Module

```
GET    /api/hiring/positions/              # List job positions
POST   /api/hiring/positions/              # Create position
GET    /api/hiring/positions/{id}/         # Position details
PUT    /api/hiring/positions/{id}/         # Update position
DELETE /api/hiring/positions/{id}/         # Delete position

GET    /api/hiring/applications/           # List applications
POST   /api/hiring/applications/           # Submit application
GET    /api/hiring/applications/{id}/      # Application details

GET    /api/hiring/interviews/             # List interviews
POST   /api/hiring/interviews/             # Schedule interview
GET    /api/hiring/interviews/{id}/        # Interview details

GET    /api/hiring/offers/                 # List offers
POST   /api/hiring/offers/                 # Create offer
GET    /api/hiring/offers/{id}/            # Offer details
```

## Configuration

### Environment Variables

**Backend (`server/.env`):**
```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=*

# Database (optional - defaults to SQLite)
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname

# Email (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your@email.com
EMAIL_HOST_PASSWORD=your-password
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Demo Features vs Production

| Feature | Demo | Production (Removed) |
|---------|------|---------------------|
| Job Posting | ✅ Fully functional | Same |
| Applicant Tracking | ✅ Fully functional | + Advanced scoring algorithms |
| Interview Scheduling | ✅ Basic scheduling | + Calendar integrations |
| Offer Management | ✅ Mock offers | + DocuSign integration |
| Email Notifications | ✅ Basic templates | + Custom branded templates |
| Authentication | ⚠️ Disabled for demo | SSO with Microsoft Entra ID |
| Multi-tenancy | ⚠️ Disabled | District-based isolation |

## Development Notes

### Authentication Disabled
For demo purposes, all API endpoints are accessible without authentication. In production, this used JWT authentication with SSO.

### Database
Defaults to SQLite for easy setup. PostgreSQL recommended for production use.

### Email Configuration
Configure SMTP settings in `.env` to enable email notifications for interview invites and offers.

## Testing

```bash
# Backend tests
cd server
pytest

# Frontend tests
cd frontend
npm test
```

## Deployment

This is a demo repository. For production deployment:

1. Enable authentication
2. Configure PostgreSQL
3. Set `DEBUG=False`
4. Configure proper `ALLOWED_HOSTS`
5. Set up environment variables securely
6. Enable SSL/HTTPS
7. Configure email service
8. Set up monitoring

## License

MIT License - This is a demonstration project

## Author

**Dmitry** - Full-Stack Engineer

This system demonstrates production-level hiring system architecture while respecting proprietary business requirements.

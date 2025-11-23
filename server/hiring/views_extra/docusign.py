from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from ..services.docusign_service import DocuSignService


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_docusign_envelope(request):
    """Create DocuSign envelope from template"""
    try:
        data = request.data

        print("\n" + "="*80)
        print("FRONTEND REQUEST RECEIVED")
        print("="*80)
        print(f"User: {request.user}")
        print(f"Email Subject: {data.get('emailSubject', 'N/A')}")
        print(f"Recipients Count: {len(data.get('recipients', []))}")
        if data.get('recipients'):
            print(f"Recipient: {data['recipients'][0].get('name')} ({data['recipients'][0].get('email')})")
        print(f"Tabs Provided: {len(data.get('tabs', {}).get('textTabs', []))} text tabs")
        print("="*80 + "\n")

        service = DocuSignService()

        recipient = data['recipients'][0]

        result = service.create_envelope_from_template(
            recipient_email=recipient['email'],
            recipient_name=recipient['name'],
            subject=data['emailSubject'],
            tabs_data=data.get('tabs', {})
        )

        print("\n" + "="*80)
        print("RETURNING TO FRONTEND")
        print("="*80)
        print(f"Envelope ID: {result.get('envelopeId')}")
        print(f"Status: {result.get('status')}")
        print(f"Signing URL: {result.get('signingUrl')[:100]}..." if result.get('signingUrl') else "No URL")
        print("="*80 + "\n")

        return Response(result, status=status.HTTP_201_CREATED)

    except Exception as e:
        print("\n" + "="*80)
        print("ERROR OCCURRED")
        print("="*80)
        print(f"Error: {str(e)}")
        import traceback
        traceback.print_exc()
        print("="*80 + "\n")

        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )

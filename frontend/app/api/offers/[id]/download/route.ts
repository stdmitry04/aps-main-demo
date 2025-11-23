import { NextRequest, NextResponse } from 'next/server';
import { Document, Paragraph, TextRun, Packer } from 'docx';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: offerId } = await params;

    // Fetch offer data from backend using public endpoint (no auth required)
    // Priority: BACKEND_URL (server-side, can use Docker service name) > NEXT_PUBLIC_API_URL (client/server) > fallback
    let backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'http://backend:8000';

    // Remove '/api' suffix if present in NEXT_PUBLIC_API_URL since we add it below
    backendUrl = backendUrl.replace(/\/api\/?$/, '');

    console.log('Fetching offer from backend:', { backendUrl, offerId });

    // Use public-detail endpoint - UUID acts as secure token
    const response = await fetch(`${backendUrl}/api/hiring/offers/${offerId}/public-detail/`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch offer from backend:', {
        backendUrl,
        offerId,
        status: response.status,
        statusText: response.statusText
      });
      return NextResponse.json(
        { error: 'Failed to fetch offer from backend', details: response.statusText },
        { status: response.status }
      );
    }

    const offer = await response.json();

    // Split into paragraphs
    const filledText = offer.filled_text || '';
    const paragraphs = filledText.split('\n').map((line: string) =>
      new Paragraph({
        children: [new TextRun(line || ' ')],
        spacing: { after: 200 }
      })
    );

    // Create document
    const doc = new Document({
      sections: [{
        properties: {},
        children: paragraphs
      }]
    });

    // Generate buffer
    const buffer = await Packer.toBuffer(doc);

    // Return as downloadable file
    const fileName = `Offer_${offer.candidate_name?.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.docx`;

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error generating DOCX:', error);
    return NextResponse.json(
      { error: 'Failed to generate document' },
      { status: 500 }
    );
  }
}

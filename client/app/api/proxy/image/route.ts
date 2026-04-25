
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new NextResponse('Missing URL', { status: 400 });

  try {
    // Use weserv.nl as a reliable upstream proxy that isn't blocked and can resolve the domains
    const cleanUrl = url.replace(/^https?:\/\//, '');
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}&default=https://placehold.co/300x300/12122A/7B5EFF?text=BDW+Game`;
    
    const response = await fetch(proxyUrl);

    if (!response.ok) throw new Error(`Weserv Proxy failed with ${response.status}`);

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (error: any) {
    console.error('Image Proxy Error:', error.message);
    // Fallback to a nice placeholder if proxy fails
    return NextResponse.redirect(`https://placehold.co/300x300/12122A/7B5EFF?text=Game+Image`);
  }
}

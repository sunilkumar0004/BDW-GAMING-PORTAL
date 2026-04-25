
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const referer = request.headers.get('referer');

  // If this is a request for an asset (js, css, png, etc.) and we have a proxy referer
  if (referer && (referer.includes('/api/proxy/game'))) {
    try {
      const refererUrl = new URL(referer);
      const proxiedUrlStr = refererUrl.searchParams.get('url');
      
      if (proxiedUrlStr) {
        const proxiedUrl = new URL(proxiedUrlStr);
        // Reconstruct the full URL for the missing asset
        // We use the directory of the referer to resolve relative assets
        const refererDir = proxiedUrl.origin + proxiedUrl.pathname.substring(0, proxiedUrl.pathname.lastIndexOf('/') + 1);
        
        // Strip common prefixes that might be added by the browser resolving relative to our proxy path
        let relativePath = url.pathname;
        const prefixesToStrip = ['/api/proxy/game', '/api/proxy', '/api'];
        
        for (const prefix of prefixesToStrip) {
            if (relativePath.startsWith(prefix)) {
                relativePath = relativePath.substring(prefix.length);
                break;
            }
        }
        
        if (relativePath.startsWith('/')) relativePath = relativePath.substring(1);
        
        const assetUrl = `${refererDir}${relativePath}${url.search}`;

        console.log(`🔀 Proxying missing asset: ${url.pathname} -> ${assetUrl}`);

        // If it's a Service Worker, we MUST serve it from the current origin without a redirect
        if (url.pathname.includes('sw') && url.pathname.endsWith('.js')) {
            const resp = await fetch(assetUrl, {
                headers: { 'User-Agent': request.headers.get('user-agent') || '' }
            }).catch(() => null);
            
            if (resp && resp.ok) {
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    headers: { 'Content-Type': 'application/javascript', 'Service-Worker-Allowed': '/' }
                });
            }
            // Fallback to our local mock SW if upstream fails
            return new NextResponse("// Mock SW\nself.addEventListener('install', e => self.skipWaiting());", {
                headers: { 'Content-Type': 'application/javascript' }
            });
        }

        // Redirect to the proxy
        return NextResponse.redirect(new URL(`/api/proxy/game?url=${encodeURIComponent(assetUrl)}`, request.url));
      }
    } catch (e) {
      console.error('Failed to resolve missing asset:', e);
    }
  }

  return new NextResponse('Not Found', { status: 404 });
}



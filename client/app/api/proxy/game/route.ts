import { NextResponse } from 'next/server';
import https from 'https';

// Multi-provider IP rotation
const IPS = [
  '104.16.248.249', // Cloudflare 1
  '104.16.249.249', // Cloudflare 2
  '172.67.11.16',   // Cloudflare 3
  '104.22.42.14',   // GamePix
  '52.30.53.241',   // AWS 1
  '3.248.83.181',   // AWS 2
  '104.26.12.31'    // GameMonetize
];

const SAFE_SNIS = ['google.com', 'cloudflare.com', 'microsoft.com'];

// Memory cache for last working IP for a host
const lastWorkingIP: Record<string, string> = {};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) return new NextResponse('Missing URL', { status: 400 });

  try {
    const targetUrl = new URL(url);
    const host = targetUrl.host;
    const isAsset = !url.endsWith('.html') && !url.includes('index') && url.includes('.');

    // 1. Direct fetch attempt (often fastest if server is not blocked)
    // For assets, we try this first
    if (isAsset) {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 2000);
            const resp = await fetch(url, { 
                headers: { 'User-Agent': 'Mozilla/5.0' },
                signal: controller.signal
            });
            clearTimeout(timeout);
            if (resp.ok) {
                const body = await resp.arrayBuffer();
                return new NextResponse(body, {
                    headers: {
                        'Content-Type': resp.headers.get('Content-Type') || 'application/octet-stream',
                        'Cache-Control': 'public, max-age=31536000, immutable',
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            }
        } catch (e) { /* ignore and move to proxy */ }
    }

    // 2. Try the last working IP for this host first
    const prioritizedIPs = lastWorkingIP[host] 
        ? [lastWorkingIP[host], ...IPS.filter(ip => ip !== lastWorkingIP[host])]
        : IPS;

    // Use proxy for gaming domains
    const isGaming = host.includes('gamedistribution') || host.includes('gamemonetize') || host.includes('gamepix');
    
    // Probing logic
    for (const ip of prioritizedIPs) {
      for (const sni of SAFE_SNIS.slice(0, 2)) { // Only try first 2 SNIs for speed
        try {
          const result = await new Promise<NextResponse>((resolve, reject) => {
            const options = {
              hostname: ip,
              port: 443,
              path: targetUrl.pathname + targetUrl.search,
              method: 'GET',
              headers: {
                'Host': host,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                'Referer': `https://${host}/`,
              },
              servername: sni,
              rejectUnauthorized: false,
              timeout: 1500 // Short timeout for probing
            };

            const req = https.get(options, (res) => {
              if (res.statusCode === 404) return reject(new Error('404'));
              if (res.statusCode && res.statusCode >= 400) return reject(new Error('Fail'));

              const chunks: any[] = [];
              res.on('data', (chunk) => chunks.push(chunk));
              res.on('end', () => {
                const buffer = Buffer.concat(chunks);
                const contentType = res.headers['content-type'] || 'text/html';
                
                // Remember this working IP
                lastWorkingIP[host] = ip;

                if (contentType.includes('text/html')) {
                  let html = buffer.toString('utf-8');
                  const proxyPrefix = '/api/proxy/game?url=';
                  const baseDir = targetUrl.origin + targetUrl.pathname.substring(0, targetUrl.pathname.lastIndexOf('/') + 1);
                  
                  const patchScript = `
                  <script>
                    (function() {
                      const proxyUrl = '${proxyPrefix}';
                      const base = '${baseDir}';
                      function resolve(url) {
                        if (!url || url.startsWith('data:') || url.startsWith('blob:') || url.startsWith(window.location.origin) || url.startsWith('/api/proxy')) return url;
                        try { return proxyUrl + encodeURIComponent(new URL(url, base).href); } catch(e) { return url; }
                      }
                      const origFetch = window.fetch;
                      window.fetch = function(r, i) { return origFetch(typeof r === 'string' ? resolve(r) : r, i); };
                      const origOpen = XMLHttpRequest.prototype.open;
                      XMLHttpRequest.prototype.open = function(m, u) { return origOpen.apply(this, [m, resolve(u), ...Array.from(arguments).slice(2)]); };
                    })();
                  </script>`;
                  
                  const baseTag = `<base href="${targetUrl.origin}${targetUrl.pathname}">`;
                  if (html.includes('<head>')) html = html.replace('<head>', `<head>${baseTag}${patchScript}`);
                  else if (html.includes('<html>')) html = html.replace('<html>', `<html><head>${baseTag}${patchScript}</head>`);
                  else html = baseTag + patchScript + html;
                  
                  resolve(new NextResponse(html, { headers: { 'Content-Type': 'text/html', 'X-Proxied-Node': ip } }));
                } else {
                  resolve(new NextResponse(buffer, {
                    headers: { 
                      'Content-Type': contentType,
                      'Cache-Control': 'public, max-age=31536000, immutable',
                      'Access-Control-Allow-Origin': '*',
                      'X-Proxied-Node': ip
                    }
                  }));
                }
              });
            });

            req.on('error', (e) => reject(e));
            req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
          });
          
          return result;
        } catch (e) { continue; }
      }
    }

    // Fallback to direct if all else fails
    const finalResp = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const finalBody = await finalResp.arrayBuffer();
    return new NextResponse(finalBody, {
        headers: { 
            'Content-Type': finalResp.headers.get('Content-Type') || 'application/octet-stream',
            'Cache-Control': isAsset ? 'public, max-age=31536000' : 'no-cache'
        }
    });
  } catch (error: any) {
    return new NextResponse('Error: ' + error.message, { status: 500 });
  }
}



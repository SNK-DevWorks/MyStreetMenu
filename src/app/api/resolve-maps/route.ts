import { NextRequest, NextResponse } from 'next/server';

/**
 * Extracts a human-readable place name from a full Google Maps URL.
 */
function extractPlaceFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);

    // Format: /maps/place/PLACE_NAME/...
    const placeMatch = urlObj.pathname.match(/\/maps\/place\/([^/@]+)/);
    if (placeMatch?.[1]) {
      const name = decodeURIComponent(placeMatch[1]).replace(/\+/g, ' ').trim();
      // Skip if it's just coordinates
      if (name && !/^[-\d.,\s]+$/.test(name)) return name;
    }

    // Format: ?q=PLACE or ?query=PLACE
    const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query');
    if (q) {
      const decoded = decodeURIComponent(q).replace(/\+/g, ' ').trim();
      if (decoded && !/^[-\d.,+\s]+$/.test(decoded)) return decoded;
    }
  } catch {
    // ignore parse errors
  }
  return null;
}

/**
 * Extracts lat/lng from a Google Maps URL (various formats).
 */
function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    const urlObj = new URL(url);

    // Format: /maps/@lat,lng,... or /maps/search/lat,+lng
    const atMatch = urlObj.pathname.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    // Decode the path (handles %2B, + as space, etc.) and match lat,lng
    const decodedPath = decodeURIComponent(urlObj.pathname);
    const searchMatch = decodedPath.match(/\/search\/([-\d.]+)[,\s]+([-\d.]+)/);
    if (searchMatch) return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };

    // Also try with raw path (+ not decoded)
    const rawSearchMatch = urlObj.pathname.match(/\/search\/([-\d.]+)[,+%2B\s]+([-\d.]+)/);
    if (rawSearchMatch) return { lat: parseFloat(rawSearchMatch[1]), lng: parseFloat(rawSearchMatch[2]) };

    // From q=lat,lng param
    const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
    const coordMatch = q.replace(/\+/g, ' ').match(/^([-\d.]+)[,\s]+([-\d.]+)$/);
    if (coordMatch) return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  } catch {
    // ignore
  }
  return null;
}

/**
 * Reverse geocodes lat/lng using OpenStreetMap Nominatim (free, no key needed).
 */
async function reverseGeocodeOSM(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'MyStreetMenu/1.0 (contact@mystreetmenu.com)',
          'Accept': 'application/json',
          'Accept-Language': 'en',
        },
        signal: AbortSignal.timeout(6000),
      }
    );
    if (!res.ok) return null;
    const data = await res.json() as { display_name?: string; name?: string };
    // display_name is a rich comma-separated address
    return data.display_name || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url');
  if (!url) {
    return NextResponse.json({ address: null }, { status: 400 });
  }

  // Step 1: For full google.com/maps URLs, try URL extraction first
  if (/google\.com\/maps/i.test(url)) {
    const place = extractPlaceFromUrl(url);
    if (place) return NextResponse.json({ address: place });
  }

  // Step 2: Follow redirects server-side to get the final Google Maps URL
  let finalUrl = url;
  let resolvedHtml = '';
  try {
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
    });
    finalUrl = res.url;
    resolvedHtml = await res.text();
  } catch {
    // continue with what we have
  }

  // Step 3: Try to extract a named place from the final URL
  const placeFromUrl = extractPlaceFromUrl(finalUrl);
  if (placeFromUrl) return NextResponse.json({ address: placeFromUrl });

  // Step 4: Try to extract coords from URL and reverse-geocode via OSM
  const coords = extractCoordsFromUrl(finalUrl);
  if (coords) {
    const osmAddress = await reverseGeocodeOSM(coords.lat, coords.lng);
    if (osmAddress) {
      // OSM gives a very long address — trim to first 3 parts for readability
      const parts = osmAddress.split(', ');
      const short = parts.slice(0, 5).join(', ');
      return NextResponse.json({ address: short });
    }
  }

  // Step 5: Try page HTML title as last resort
  if (resolvedHtml) {
    const titleMatch = resolvedHtml.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch?.[1]) {
      const name = titleMatch[1]
        .replace(/ - Google Maps$/i, '')
        .replace(/ · Google Maps$/i, '')
        .trim();
      if (name && name.toLowerCase() !== 'google maps') {
        return NextResponse.json({ address: name });
      }
    }
  }

  return NextResponse.json({ address: null });
}

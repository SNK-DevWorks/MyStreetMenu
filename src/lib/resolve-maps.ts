/**
 * Server-side helper to resolve Google Maps links to human-readable addresses.
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

function extractCoordsFromUrl(url: string): { lat: number; lng: number } | null {
  try {
    const urlObj = new URL(url);

    const atMatch = urlObj.pathname.match(/@([-\d.]+),([-\d.]+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };

    const decodedPath = decodeURIComponent(urlObj.pathname);
    const searchMatch = decodedPath.match(/\/search\/([-\d.]+)[,\s]+([-\d.]+)/);
    if (searchMatch) return { lat: parseFloat(searchMatch[1]), lng: parseFloat(searchMatch[2]) };

    const rawSearchMatch = urlObj.pathname.match(/\/search\/([-\d.]+)[,+%2B\s]+([-\d.]+)/);
    if (rawSearchMatch) return { lat: parseFloat(rawSearchMatch[1]), lng: parseFloat(rawSearchMatch[2]) };

    const q = urlObj.searchParams.get('q') || urlObj.searchParams.get('query') || '';
    const coordMatch = q.replace(/\+/g, ' ').match(/^([-\d.]+)[,\s]+([-\d.]+)$/);
    if (coordMatch) return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };
  } catch {
    // ignore
  }
  return null;
}

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
    const data = (await res.json()) as { display_name?: string; name?: string };
    return data.display_name || null;
  } catch {
    return null;
  }
}

/**
 * Resolves a raw location string or Google Maps URL.
 * If raw input is a URL (e.g. https://maps.app.goo.gl/...), follows redirect,
 * extracts human readable place/address, and returns { address, mapUrl }.
 * If raw input is plain text address, returns { address: rawInput, mapUrl: null }.
 */
export async function resolveLocationInput(input: string): Promise<{ address: string; mapUrl: string | null }> {
  const trimmed = input.trim();
  if (!trimmed) {
    return { address: '', mapUrl: null };
  }

  // Check if it's a URL
  const isUrl = /^https?:\/\//i.test(trimmed);
  if (!isUrl) {
    return { address: trimmed, mapUrl: null };
  }

  const mapUrl = trimmed;

  // Step 1: For full google.com/maps URLs, try direct URL extraction first
  if (/google\.com\/maps/i.test(mapUrl)) {
    const place = extractPlaceFromUrl(mapUrl);
    if (place) return { address: place, mapUrl };
  }

  // Step 2: Follow redirects server-side
  let finalUrl = mapUrl;
  let resolvedHtml = '';
  try {
    const res = await fetch(mapUrl, {
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
    // continue
  }

  // Step 3: Try to extract a named place from the final URL
  const placeFromUrl = extractPlaceFromUrl(finalUrl);
  if (placeFromUrl) return { address: placeFromUrl, mapUrl };

  // Step 4: Try to extract coords from URL and reverse-geocode via OSM
  const coords = extractCoordsFromUrl(finalUrl);
  if (coords) {
    const osmAddress = await reverseGeocodeOSM(coords.lat, coords.lng);
    if (osmAddress) {
      const parts = osmAddress.split(', ');
      const short = parts.slice(0, 5).join(', ');
      return { address: short, mapUrl };
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
        return { address: name, mapUrl };
      }
    }
  }

  // Fallback: return mapUrl as address if resolution yielded nothing cleaner
  return { address: mapUrl, mapUrl };
}

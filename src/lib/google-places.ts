export interface GooglePlaceMatch {
  placeId: string;
  rating: number | null;
  reviewCount: number | null;
  googleMapsUri?: string;
}

/**
 * Fetches live Google Place ID, rating, and review count using Google Places API (New).
 * Requires process.env.GOOGLE_PLACES_API_KEY.
 */
export async function fetchGooglePlaceData({
  name,
  address,
  city,
}: {
  name: string;
  address: string;
  city: string;
}): Promise<GooglePlaceMatch | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    return null;
  }

  const textQuery = `${name} ${address} ${city}, TX`;

  try {
    const response = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "places.id,places.displayName,places.rating,places.userRatingCount,places.googleMapsUri",
      },
      body: JSON.stringify({
        textQuery,
        maxResultCount: 1,
      }),
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const place = data?.places?.[0];

    if (!place?.id) {
      return null;
    }

    return {
      placeId: place.id,
      rating: typeof place.rating === "number" ? place.rating : null,
      reviewCount: typeof place.userRatingCount === "number" ? place.userRatingCount : null,
      googleMapsUri: place.googleMapsUri,
    };
  } catch (err) {
    console.error("Failed to fetch Google Places data for", name, err);
    return null;
  }
}

/**
 * Constructs a verified Google Maps destination URL from a Google Place ID or fallback address query.
 */
export function getGoogleMapsPlaceUrl({
  placeId,
  name,
  address,
  city,
}: {
  placeId?: string | null;
  name: string;
  address: string;
  city: string;
}): string {
  if (placeId) {
    return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
  }
  const query = `${name}, ${address}, ${city}, TX`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

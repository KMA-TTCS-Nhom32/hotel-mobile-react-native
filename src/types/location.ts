/**
 * Location Types
 * Defines location-related data structures
 */

/**
 * Location with Google Place ID
 * Used for map integration and navigation
 */
export interface Location {
  latitude: string;
  longitude: string;
  /** Google Place ID for richer business information */
  google_place_id?: string;
  /** Full Google Maps embed URL (optional, from Share > Embed a map) */
  google_maps_embed_url?: string;
}

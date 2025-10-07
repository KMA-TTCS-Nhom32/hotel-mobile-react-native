/**
 * Filter types for branches API
 * Based on FilterBranchesDto from backend SDK
 */

/**
 * Branch filter conditions
 */
export interface BranchFilters {
  /**
   * Search by keyword
   */
  keyword?: string;

  /**
   * Filter by active status
   */
  is_active?: boolean;

  /**
   * Filter by rating
   */
  rating?: number;

  /**
   * Filter by province ID
   */
  provinceId?: string;

  /**
   * Filter by province slug
   */
  provinceSlug?: string;

  /**
   * Filter by amenities (array of amenity IDs)
   */
  amenities?: string[];
}

/**
 * Province filter conditions
 */
export interface ProvinceFilters {
  /**
   * Search by keyword (name, slug)
   */
  keyword?: string;

  /**
   * Filter by ZIP code
   */
  zip_code?: string;
}

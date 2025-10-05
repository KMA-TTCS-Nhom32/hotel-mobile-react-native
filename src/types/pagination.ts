/**
 * Common pagination types for API responses
 * Based on UsersPaginationResultDtoMeta structure
 */

/**
 * Pagination metadata returned by API
 */
export interface PaginationMeta {
  /**
   * Total number of items
   */
  total: number;

  /**
   * Current page number (1-indexed)
   */
  page: number;

  /**
   * Number of items per page
   */
  pageSize: number;

  /**
   * Total number of pages
   */
  totalPages: number;
}

/**
 * Generic pagination result
 * @template T - Type of items in the data array
 */
export interface PaginationResult<T> {
  /**
   * Array of items for current page
   */
  data: T[];

  /**
   * Pagination metadata
   */
  meta: PaginationMeta;
}

/**
 * Query parameters for paginated requests
 */
export interface PaginationParams {
  /**
   * Page number (default: 1)
   */
  page?: number;

  /**
   * Items per page (default: 10)
   */
  pageSize?: number;

  /**
   * Filter conditions (JSON string)
   */
  filters?: string;

  /**
   * Sort conditions (JSON string)
   */
  sort?: string;
}

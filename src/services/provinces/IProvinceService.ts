import type { Province } from '@ahomevilla-hotel/node-sdk';

import type { PaginationResult } from '@/types/pagination';

/**
 * Province service interface
 * Handles province-related API calls
 */
export interface IProvinceService {
  /**
   * Get all provinces with pagination
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @returns Paginated provinces
   */
  getProvinces(
    page?: number,
    pageSize?: number
  ): Promise<PaginationResult<Province>>;
}

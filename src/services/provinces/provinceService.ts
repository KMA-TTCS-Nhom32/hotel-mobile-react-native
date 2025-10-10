import type { Province } from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS, publicRequest } from '@/config/api';
import { DEFAULT_PAGE_SIZE } from '@/constants/common';
import type { PaginationResult } from '@/types/pagination';
import { handleServiceError } from '@/utils/errors';

import type { IProvinceService } from './IProvinceService';

/**
 * Province service implementation
 * Handles province-related API calls
 */
export class ProvinceService implements IProvinceService {
  /**
   * Get all provinces with pagination
   */
  async getProvinces(
    page: number = 1,
    pageSize: number = DEFAULT_PAGE_SIZE
  ): Promise<PaginationResult<Province>> {
    try {
      const response = await publicRequest.get<PaginationResult<Province>>(
        ENDPOINTS.PROVINCE,
        {
          params: {
            page,
            pageSize,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Failed to fetch provinces');
    }
  }
}

// Export singleton instance
export const provinceService = new ProvinceService();

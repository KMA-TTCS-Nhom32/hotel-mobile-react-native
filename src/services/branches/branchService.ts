import type { Branch, BranchDetail } from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS, publicRequest } from '@/config/api';
import type { BranchFilters } from '@/types/filters';
import type { PaginationResult } from '@/types/pagination';

import type { IBranchService } from './IBranchService';

/**
 * Branch service implementation
 * Handles hotel branch-related API calls
 */
export class BranchService implements IBranchService {
  /**
   * Get latest branches
   */
  async getLatestBranches(): Promise<Branch[]> {
    const response = await publicRequest.get<Branch[]>(
      ENDPOINTS.GET_LATEST_BRANCHES
    );
    return response.data;
  }

  /**
   * Get branches with pagination and filters
   */
  async getBranches(
    page: number = 1,
    pageSize: number = 10,
    filters?: BranchFilters
  ): Promise<PaginationResult<Branch>> {
    const params: {
      page: number;
      pageSize: number;
      filters?: string;
    } = {
      page,
      pageSize,
    };

    // Stringify filters if provided (backend expects JSON string)
    if (filters && Object.keys(filters).length > 0) {
      params.filters = JSON.stringify(filters);
    }

    const response = await publicRequest.get<PaginationResult<Branch>>(
      ENDPOINTS.BRANCHES,
      { params }
    );
    return response.data;
  }

  /**
   * Get branch details by ID or slug
   */
  async getBranchDetail(idOrSlug: string): Promise<BranchDetail> {
    const response = await publicRequest.get<BranchDetail>(
      `${ENDPOINTS.BRANCHES}/${idOrSlug}`
    );
    return response.data;
  }
}

// Export singleton instance
export const branchService = new BranchService();

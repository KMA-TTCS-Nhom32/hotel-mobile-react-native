import type { Branch } from '@ahomevilla-hotel/node-sdk';

import type { BranchFilters } from '@/types/filters';
import type { PaginationResult } from '@/types/pagination';

/**
 * Branch service interface
 * Handles hotel branch-related API calls
 */
export interface IBranchService {
  /**
   * Get latest branches
   * Returns array of Branch models
   */
  getLatestBranches(): Promise<Branch[]>;

  /**
   * Get branches with pagination and filters
   * @param page - Page number (default: 1)
   * @param pageSize - Items per page (default: 10)
   * @param filters - Filter conditions (will be stringified)
   * @returns Paginated branches
   */
  getBranches(
    page?: number,
    pageSize?: number,
    filters?: BranchFilters
  ): Promise<PaginationResult<Branch>>;
}

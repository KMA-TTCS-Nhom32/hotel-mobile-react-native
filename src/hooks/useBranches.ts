import type { Branch } from '@ahomevilla-hotel/node-sdk';
import { useQuery } from '@tanstack/react-query';

import { branchService } from '@/services/branches/branchService';
import type { BranchFilters } from '@/types/filters';
import type { PaginationResult } from '@/types/pagination';

// Query keys for React Query
export const BRANCH_QUERY_KEYS = {
  latest: ['branches', 'latest'] as const,
  all: ['branches', 'all'] as const,
  list: (page?: number, pageSize?: number, filters?: BranchFilters) =>
    ['branches', 'list', page, pageSize, filters] as const,
  byProvince: (provinceId: string) =>
    ['branches', 'province', provinceId] as const,
  byProvinceSlug: (provinceSlug: string, page?: number, pageSize?: number) =>
    ['branches', 'province-slug', provinceSlug, page, pageSize] as const,
  byId: (branchId: string) => ['branches', 'detail', branchId] as const,
} as const;

/**
 * Hook to fetch latest branches
 */
export const useLatestBranches = () => {
  return useQuery<Branch[], Error>({
    queryKey: BRANCH_QUERY_KEYS.latest,
    queryFn: () => branchService.getLatestBranches(),
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch branches with pagination and filters
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10)
 * @param filters - Filter conditions
 */
export const useBranches = (
  page: number = 1,
  pageSize: number = 10,
  filters?: BranchFilters
) => {
  return useQuery<PaginationResult<Branch>, Error>({
    queryKey: BRANCH_QUERY_KEYS.list(page, pageSize, filters),
    queryFn: () => branchService.getBranches(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to fetch branches by province slug
 * @param provinceSlug - Province slug to filter by
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10)
 */
export const useBranchesByProvince = (
  provinceSlug: string,
  page: number = 1,
  pageSize: number = 10
) => {
  return useQuery<PaginationResult<Branch>, Error>({
    queryKey: BRANCH_QUERY_KEYS.byProvinceSlug(provinceSlug, page, pageSize),
    queryFn: () => branchService.getBranches(page, pageSize, { provinceSlug }),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled: !!provinceSlug, // Only run query if provinceSlug is provided
  });
};

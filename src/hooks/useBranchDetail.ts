import { useQuery } from '@tanstack/react-query';

import { branchService } from '@/services/branches/branchService';

/**
 * Query keys for branch detail
 */
export const BRANCH_DETAIL_QUERY_KEYS = {
  all: ['branchDetail'] as const,
  detail: (idOrSlug: string) =>
    [...BRANCH_DETAIL_QUERY_KEYS.all, idOrSlug] as const,
};

/**
 * Hook to fetch branch details by ID or slug
 * @param idOrSlug - Branch ID or slug
 * @returns React Query result with branch detail data
 */
export function useBranchDetail(idOrSlug: string | undefined) {
  return useQuery({
    queryKey: BRANCH_DETAIL_QUERY_KEYS.detail(idOrSlug || ''),
    queryFn: () => branchService.getBranchDetail(idOrSlug!),
    enabled: !!idOrSlug,
    staleTime: 10 * 60 * 1000, // 10 minutes - branch details don't change often
  });
}

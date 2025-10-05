import type { Province } from '@ahomevilla-hotel/node-sdk';
import { useQuery } from '@tanstack/react-query';

import { provinceService } from '@/services/provinces';
import type { PaginationResult } from '@/types/pagination';

// Query keys for React Query
export const PROVINCE_QUERY_KEYS = {
  all: ['provinces'] as const,
  list: (page?: number, pageSize?: number) =>
    ['provinces', 'list', page, pageSize] as const,
  byId: (provinceId: string) => ['provinces', 'detail', provinceId] as const,
} as const;

/**
 * Hook to fetch provinces with pagination
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 20)
 */
export const useProvinces = (page: number = 1, pageSize: number = 20) => {
  return useQuery<PaginationResult<Province>, Error>({
    queryKey: PROVINCE_QUERY_KEYS.list(page, pageSize),
    queryFn: () => provinceService.getProvinces(page, pageSize),
    staleTime: 30 * 60 * 1000, // 30 minutes (provinces rarely change)
    retry: 2,
  });
};

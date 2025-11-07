import { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { useQuery } from '@tanstack/react-query';

import { RoomService } from '@/services/rooms/roomService';
import type { PaginationResult } from '@/types/pagination';

/**
 * Hook to fetch rooms with pagination and filters (for search functionality)
 * @param page - Page number (default: 1)
 * @param pageSize - Items per page (default: 10)
 * @param filters - Filter conditions (e.g., { keyword: "deluxe" })
 * @param enabled - Whether to enable query (default: false, trigger manually)
 * @returns React Query result with paginated rooms data
 */
export const useRooms = (
  page: number = 1,
  pageSize: number = 10,
  filters?: Record<string, any>,
  enabled: boolean = false
) => {
  return useQuery<PaginationResult<RoomDetail>, Error>({
    queryKey: ['rooms', 'list', page, pageSize, filters],
    queryFn: () => RoomService.getRooms(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    enabled, // Only fetch when enabled
  });
};

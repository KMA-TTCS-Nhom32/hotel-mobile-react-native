import type {
  FilterRoomDetailDto,
  RoomDetail,
  RoomDetailInfinitePaginationResultDto,
} from '@ahomevilla-hotel/node-sdk';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { roomService } from '@/services/rooms/roomService';

// Query keys for room-related queries
export const ROOM_QUERY_KEYS = {
  all: ['rooms'] as const,
  detail: (id: string) => ['rooms', 'detail', id] as const,
  infinite: (filters: FilterRoomDetailDto) =>
    ['rooms', 'infinite', filters] as const,
} as const;

/**
 * Hook to fetch a single room's details
 * @param id - Room detail ID
 */
export const useRoomDetail = (id: string) => {
  return useQuery<RoomDetail, Error>({
    queryKey: ROOM_QUERY_KEYS.detail(id),
    queryFn: () => roomService.getRoomDetail(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!id,
  });
};

/**
 * Hook to search rooms with infinite scroll pagination
 * Uses the /room-details/infinite endpoint with server-side filtering
 *
 * @param filters - Filter criteria matching FilterRoomDetailDto from SDK
 * @param enabled - Whether the query should run
 * @returns Infinite query result with rooms data, hasNextPage, fetchNextPage, etc.
 */
export const useInfiniteRooms = (
  filters: FilterRoomDetailDto,
  enabled: boolean = true
) => {
  return useInfiniteQuery<
    RoomDetailInfinitePaginationResultDto,
    Error,
    { pages: RoomDetailInfinitePaginationResultDto[]; pageParams: number[] },
    ReturnType<typeof ROOM_QUERY_KEYS.infinite>,
    number
  >({
    queryKey: ROOM_QUERY_KEYS.infinite(filters),
    queryFn: ({ pageParam }) =>
      roomService.searchRoomsInfinite(filters, pageParam),
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      // If hasNextPage is true, return next page number
      return lastPage.hasNextPage ? lastPageParam + 1 : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled,
  });
};

/**
 * Helper to flatten all rooms from infinite query pages
 */
export const flattenInfiniteRooms = (
  data:
    | {
        pages: RoomDetailInfinitePaginationResultDto[];
        pageParams: number[];
      }
    | undefined
): RoomDetail[] => {
  if (!data?.pages) return [];
  return data.pages.flatMap(page => page.data);
};

import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { useQuery } from '@tanstack/react-query';

import { roomService } from '@/services/rooms/roomService';

/**
 * Hook to fetch room detail by ID
 * @param roomId - Room detail ID
 * @returns React Query result with room detail data
 */
export function useRoomDetail(roomId: string | undefined) {
  return useQuery<RoomDetail, Error>({
    queryKey: ['roomDetail', roomId],
    queryFn: () => {
      if (!roomId) {
        throw new Error('Room ID is required');
      }
      return roomService.getRoomDetail(roomId);
    },
    enabled: !!roomId,
    staleTime: 1000 * 60 * 10, // 10 minutes - room details don't change often
    gcTime: 1000 * 60 * 15, // 15 minutes garbage collection
  });
}

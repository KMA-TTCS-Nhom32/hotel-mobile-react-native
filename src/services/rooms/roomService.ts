import type {
  FilterRoomDetailDto,
  RoomDetail,
  RoomDetailInfinitePaginationResultDto,
} from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS } from '@/config/api/endpoints';
import publicRequest from '@/config/api/public-request';

import type { IRoomService } from './IRoomService';

/**
 * Room service for handling room-related API operations
 * Implements IRoomService interface
 */
export class RoomService implements IRoomService {
  /**
   * Get detailed information about a specific room
   * @param id - Room detail ID
   */
  getRoomDetail = async (id: string): Promise<RoomDetail> => {
    const response = await publicRequest.get<RoomDetail>(
      `${ENDPOINTS.ROOM_DETAIL}/${id}`
    );
    return response.data;
  };

  /**
   * Search rooms with infinite pagination
   * Uses the /room-details/infinite endpoint with FilterRoomDetailDto
   * @param filters - Filter criteria from SDK DTO
   * @param page - Page number for pagination (default: 1)
   * pageSize is 10 in backend by default
   */
  searchRoomsInfinite = async (
    filters: FilterRoomDetailDto,
    page: number = 1
  ): Promise<RoomDetailInfinitePaginationResultDto> => {
    const response =
      await publicRequest.get<RoomDetailInfinitePaginationResultDto>(
        ENDPOINTS.ROOM_DETAILS_INFINITE,
        {
          params: {
            page,
            ...filters,
          },
        }
      );
    return response.data;
  };
}

// Export singleton instance
export const roomService = new RoomService();

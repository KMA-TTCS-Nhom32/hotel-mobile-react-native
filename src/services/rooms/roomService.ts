import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS } from '@/config/api/endpoints';
import publicRequest from '@/config/api/public-request';

/**
 * Room service for handling room-related API operations
 */
export const RoomService = {
  /**
   * Get detailed information about a specific room
   * @param id - Room detail ID
   * @returns Promise<RoomDetail>
   */
  async getRoomDetail(id: string): Promise<RoomDetail> {
    const response = await publicRequest.get<RoomDetail>(
      `${ENDPOINTS.ROOM_DETAIL}/${id}`
    );
    return response.data;
  },
};

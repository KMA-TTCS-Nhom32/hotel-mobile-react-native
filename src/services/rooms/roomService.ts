import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS } from '@/config/api/endpoints';
import publicRequest from '@/config/api/public-request';
import type { PaginationResult } from '@/types/pagination';

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

  async getRooms(
    page: number = 1,
    pageSize: number = 10,
    filters?: Record<string, any>
  ): Promise<PaginationResult<any>> {
    const params: any = { page, pageSize };
    if (filters && Object.keys(filters).length > 0) {
      params.filters = JSON.stringify(filters);
      console.log('API call with filters:', params.filters); // Debug log
    }
    console.log('Fetching rooms with params:', params); // Debug log
    const response = await publicRequest.get('/room-details', { params });
    console.log('API response:', response.data); // Debug log
    return response.data;
  },
};
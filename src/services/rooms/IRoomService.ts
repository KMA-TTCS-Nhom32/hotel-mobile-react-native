import type {
  FilterRoomDetailDto,
  RoomDetail,
  RoomDetailInfinitePaginationResultDto,
} from '@ahomevilla-hotel/node-sdk';

/**
 * Interface for Room Service operations
 */
export interface IRoomService {
  /**
   * Get detailed information about a specific room
   * @param id - Room detail ID
   */
  getRoomDetail(id: string): Promise<RoomDetail>;

  /**
   * Search rooms with infinite pagination
   * @param filters - Filter criteria from SDK DTO
   * @param page - Page number for pagination (default: 1)
   */
  searchRoomsInfinite(
    filters: FilterRoomDetailDto,
    page?: number
  ): Promise<RoomDetailInfinitePaginationResultDto>;
}

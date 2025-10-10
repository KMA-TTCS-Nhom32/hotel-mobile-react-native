import { ENDPOINTS, privateRequest } from '@/config/api';
import { handleServiceError } from '@/utils/errors';

class BookingService {
  /**
   * Get all bookings of current user
   * @returns Promise with array of bookings
   */
  async getMyBookings() {
    try {
      console.log('Calling API:', ENDPOINTS.GET_MYBOOKING);
      const response = await privateRequest.get(ENDPOINTS.GET_MYBOOKING);
      
      // API trả về dữ liệu trong response.data.data, kèm theo meta
      const bookingsResponse = response.data;
      return bookingsResponse.data || [];
    } catch (error) {
      console.error('Error in getMyBookings:', error);
      throw handleServiceError(error, 'Không thể lấy danh sách đặt phòng');
    }
  }

  /**
   * Get booking details by ID
   * @param bookingId Booking ID
   */
  async getBookingById(bookingId: string) {
    try {
      const response = await privateRequest.get(`${ENDPOINTS.BOOKING}/${bookingId}`);
      return response.data;
    } catch (error) {
      throw handleServiceError(error, 'Không thể lấy thông tin đặt phòng');
    }
  }

  /**
   * Cancel booking by ID
   * @param bookingId Booking ID to cancel
   * @param reason Reason for cancellation (optional)
   */
  async cancelBooking(bookingId: string, reason?: string) {
    try {
      console.log(`Canceling booking ${bookingId} with reason: ${reason || 'Không có lý do'}`);
      // Sử dụng đúng endpoint từ API
      const response = await privateRequest.patch(
        `${ENDPOINTS.CANCEL_BOOKING(bookingId)}`, 
        reason ? { cancel_reason: reason } : {}
      );
      return response.data;
    } catch (error) {
      console.error('Error canceling booking:', error);
      throw handleServiceError(error, 'Không thể hủy đặt phòng');
    }
  }
}

export const bookingService = new BookingService();
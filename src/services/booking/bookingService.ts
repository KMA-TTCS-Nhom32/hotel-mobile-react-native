import { ENDPOINTS, privateRequest } from '@/config/api';

class BookingService {
  /**
   * Get all bookings of current user
   * @returns Promise with array of bookings
   */
  async getMyBookings() {
    // console.log('Calling API:', ENDPOINTS.GET_MYBOOKING);
    const response = await privateRequest.get(ENDPOINTS.GET_MYBOOKING);

    // API trả về dữ liệu trong response.data.data, kèm theo meta
    const bookingsResponse = response.data;
    return bookingsResponse.data || [];
  }

  /**
   * Get booking details by ID
   * @param bookingId Booking ID
   */
  async getBookingById(bookingId: string) {
    const response = await privateRequest.get(
      `${ENDPOINTS.BOOKING}/${bookingId}`
    );
    return response.data;
  }

  /**
   * Cancel booking by ID
   * @param bookingId Booking ID to cancel
   * @param reason Reason for cancellation (optional)
   */
  async cancelBooking(bookingId: string, reason?: string) {
    // Sử dụng đúng endpoint từ API
    const response = await privateRequest.patch(
      `${ENDPOINTS.CANCEL_BOOKING(bookingId)}`,
      reason ? { cancel_reason: reason } : {}
    );
    return response.data;
  }
}

export const bookingService = new BookingService();

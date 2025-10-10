import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// Xóa hoặc sửa import này vì nó đang gây ra lỗi
// import { Booking } from '@ahomevilla-hotel/node-sdk';
import { bookingService } from '@/services/booking/bookingService';

// Query key for React Query
export const BOOKING_QUERY_KEYS = {
  myBookings: ['bookings', 'my-bookings'] as const,
};

/**
 * Hook to fetch user's bookings
 */
export const useMyBookings = () => {
  return useQuery({
    queryKey: BOOKING_QUERY_KEYS.myBookings,
    queryFn: () => bookingService.getMyBookings(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook to cancel booking
 */
export const useCancelBooking = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bookingId: string) => bookingService.cancelBooking(bookingId),
    onSuccess: () => {
      // Invalidate and refetch bookings after cancellation
      queryClient.invalidateQueries({
        queryKey: BOOKING_QUERY_KEYS.myBookings,
      });
    },
  });
};
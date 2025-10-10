/**
 * useCreateBooking Hook
 * React Query mutation for creating online bookings
 */

import type {
  Booking,
  CreateBookingOnlineDto,
} from '@ahomevilla-hotel/node-sdk';
import { useMutation } from '@tanstack/react-query';

import { createBookingService } from '@/services/booking';

interface UseCreateBookingOptions {
  onSuccess?: (booking: Booking) => void;
  onError?: (error: Error) => void;
}

/**
 * Hook for creating a new booking
 * Returns mutation object with loading, error states
 */
export const useCreateBooking = (options?: UseCreateBookingOptions) => {
  return useMutation({
    mutationFn: async (data: CreateBookingOnlineDto) => {
      const response = await createBookingService(data);
      return response.data;
    },
    onSuccess: data => {
      options?.onSuccess?.(data);
    },
    onError: (error: Error) => {
      console.error('Booking creation error:', error);
      options?.onError?.(error);
    },
  });
};

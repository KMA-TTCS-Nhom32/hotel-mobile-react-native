import {
  Booking,
  CancelBookingDto,
  CreateBookingOnlineDto,
} from '@ahomevilla-hotel/node-sdk';

import { ENDPOINTS, privateRequest } from '@/config/api';

export function createBookingService(data: CreateBookingOnlineDto) {
  return privateRequest.post<Booking>(ENDPOINTS.BOOKING, data);
}

export function cancelBookingService(id: string, data: CancelBookingDto) {
  return privateRequest.post<{ success: boolean }>(
    ENDPOINTS.CANCEL_BOOKING(id),
    data
  );
}

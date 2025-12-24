import { formatDateForAPI } from '@/utils/format';

/**
 * Standardized booking request format for API
 * This format applies to all booking types (HOURLY, NIGHTLY, DAILY)
 */
export interface BookingRequest {
  type: 'HOURLY' | 'NIGHTLY' | 'DAILY';
  start_date: string; // Format: DD-MM-YYYY
  end_date: string; // Format: DD-MM-YYYY
  start_time: string; // Format: HH:mm (24-hour)
  end_time: string; // Format: HH:mm (24-hour)
}

export type BookingType = 'HOURLY' | 'NIGHTLY' | 'DAILY';

/**
 * Booking filters for room search
 */
export interface BookingFilters {
  bookingType: BookingType;
  startDate: Date;
  endDate: Date;
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  adults: number;
  children: number;
  infants: number;
}

/**
 * Helper function to calculate end time from start time and duration (hours)
 */
export function calculateEndTime(
  startTime: string,
  durationHours: number
): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationHours * 60;
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
}

/**
 * Convert hourly booking data to API format
 */
export function hourlyBookingToRequest(
  date: Date,
  checkInTime: string,
  duration: number
): BookingRequest {
  const startDate = formatDateForAPI(date);
  const endTime = calculateEndTime(checkInTime, duration);

  return {
    type: 'HOURLY',
    start_date: startDate,
    end_date: startDate, // Same day for hourly
    start_time: checkInTime,
    end_time: endTime,
  };
}

/**
 * Convert nightly booking data to API format
 */
export function nightlyBookingToRequest(date: Date): BookingRequest {
  const checkInDate = new Date(date);
  const checkOutDate = new Date(date);
  checkOutDate.setDate(checkOutDate.getDate() + 1);

  return {
    type: 'NIGHTLY',
    start_date: formatDateForAPI(checkInDate),
    end_date: formatDateForAPI(checkOutDate),
    start_time: '21:00',
    end_time: '09:00',
  };
}

/**
 * Convert daily booking data to API format
 */
export function dailyBookingToRequest(
  checkInDate: Date,
  checkOutDate: Date
): BookingRequest {
  return {
    type: 'DAILY',
    start_date: formatDateForAPI(checkInDate),
    end_date: formatDateForAPI(checkOutDate),
    start_time: '14:00', // Standard check-in time
    end_time: '12:00', // Standard check-out time
  };
}

/**
 * Calculate the next available time slot based on current time
 * Rounds up to the nearest 30-minute interval within business hours (9:00-20:00)
 * Returns null if it's too late to book today
 */
export function getNextAvailableTimeSlot(): string | null {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  let totalMinutes = hours * 60 + minutes;
  const remainder = totalMinutes % 30;
  if (remainder > 0) {
    totalMinutes += 30 - remainder;
  }

  const nextHours = Math.floor(totalMinutes / 60);
  const nextMinutes = totalMinutes % 60;

  if (nextHours < 9) {
    return '09:00';
  }

  const checkInMinutes = nextHours * 60 + nextMinutes;
  const canBook2Hours = checkInMinutes + 120 <= 22 * 60;

  if (!canBook2Hours) {
    return null;
  }

  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

/**
 * Get default booking filters with smart defaults based on current time
 */
export function getDefaultBookingFilters(): BookingFilters {
  const now = new Date();
  const nextSlot = getNextAvailableTimeSlot();
  const defaultDuration = 2;

  if (nextSlot !== null) {
    return {
      bookingType: 'HOURLY',
      startDate: now,
      endDate: now,
      startTime: nextSlot,
      endTime: calculateEndTime(nextSlot, defaultDuration),
      adults: 2,
      children: 0,
      infants: 0,
    };
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    bookingType: 'HOURLY',
    startDate: tomorrow,
    endDate: tomorrow,
    startTime: '09:00',
    endTime: '11:00',
    adults: 2,
    children: 0,
    infants: 0,
  };
}

/**
 * Format booking filters for display
 */
export function formatBookingFiltersDisplay(
  filters: BookingFilters,
  t: (key: string) => string
): { dateTimeText: string; guestsText: string } {
  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return t('booking.today');
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return t('booking.tomorrow');
    }
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  let dateTimeText = '';

  switch (filters.bookingType) {
    case 'HOURLY':
      dateTimeText = `${t('booking.hourly')} · ${formatDate(filters.startDate)}, ${filters.startTime}-${filters.endTime}`;
      break;
    case 'NIGHTLY':
      dateTimeText = `${t('booking.nightly')} · ${formatDate(filters.startDate)}`;
      break;
    case 'DAILY':
      const days = Math.ceil(
        (filters.endDate.getTime() - filters.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      dateTimeText = `${t('booking.daily')} · ${formatDate(filters.startDate)} - ${formatDate(filters.endDate)} (${days} ${t('booking.days')})`;
      break;
  }

  const guestsText =
    filters.children + filters.infants > 0
      ? `${filters.adults} ${t('guests.adults')}, ${filters.children + filters.infants} ${t('guests.children')}`
      : `${filters.adults} ${t('guests.adults')}`;

  return { dateTimeText, guestsText };
}

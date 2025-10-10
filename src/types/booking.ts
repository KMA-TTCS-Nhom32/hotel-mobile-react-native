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

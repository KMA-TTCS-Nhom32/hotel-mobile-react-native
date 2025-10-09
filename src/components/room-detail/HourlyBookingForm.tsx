import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { DatePicker, DurationBadgeSelector, TimePicker } from '@/components/ui';

export interface HourlyBookingData {
  date?: Date;
  checkInTime?: string;
  duration?: number;
}

interface HourlyBookingFormProps {
  value: HourlyBookingData;
  onChange: (data: HourlyBookingData) => void;
  _pricePerHour: number;
  disabled?: boolean;
}

/**
 * Hourly booking form with date, time, and duration selection
 * Business hours: 9:00 AM - 10:00 PM (22:00)
 * Minimum booking: 2 hours
 */
export function HourlyBookingForm({
  value,
  onChange,
  _pricePerHour,
  disabled = false,
}: HourlyBookingFormProps) {
  const { t, i18n } = useTranslation();
  const [localData, setLocalData] = useState<HourlyBookingData>(value);

  const formatBookingDate = (date: Date) =>
    date.toLocaleDateString(i18n.language, {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  // Calculate maximum hours based on check-in time
  const calculateMaxHours = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    const checkInMinutes = hours * 60 + minutes;
    const checkOutMaxMinutes = 22 * 60; // 22:00 (10:00 PM) - Business closes
    const maxMinutes = checkOutMaxMinutes - checkInMinutes;
    const calculatedMaxHours = Math.floor(maxMinutes / 60);

    // Ensure minimum 2 hours and maximum 12 hours
    return Math.min(Math.max(calculatedMaxHours, 2), 12);
  };

  // Calculate disabled time slots based on selected date
  const getDisabledTimes = (dateToCheck?: Date): string[] => {
    const checkDate = dateToCheck || localData.date;
    if (!checkDate) return [];

    const today = new Date();
    const isToday = checkDate.toDateString() === today.toDateString();

    if (!isToday) return []; // No restrictions for future dates

    // For today, disable all times before current time + 30 min buffer
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes + 30; // 30 min buffer

    const disabledTimes: string[] = [];

    // Generate all time slots from 9:00 to 20:00 with 30-min intervals
    for (let hour = 9; hour <= 20; hour++) {
      for (const minute of [0, 30]) {
        if (hour === 20 && minute === 30) continue; // Skip 20:30, last slot is 20:00

        const slotTotalMinutes = hour * 60 + minute;

        // Disable if this slot is in the past or doesn't allow 2-hour minimum
        const canBook2Hours = slotTotalMinutes + 120 <= 22 * 60; // Can book 2 hours before 22:00?

        if (slotTotalMinutes < currentTotalMinutes || !canBook2Hours) {
          const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          disabledTimes.push(timeString);
        }
      }
    }

    return disabledTimes;
  };

  // Calculate check-out time for display
  const calculateCheckOutTime = (
    checkInTime: string,
    durationHours: number
  ): string => {
    const [hours, minutes] = checkInTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + durationHours * 60;
    const checkOutHours = Math.floor(totalMinutes / 60);
    const checkOutMinutes = totalMinutes % 60;
    return `${String(checkOutHours).padStart(2, '0')}:${String(checkOutMinutes).padStart(2, '0')}`;
  };

  const maxHours = localData.checkInTime
    ? calculateMaxHours(localData.checkInTime)
    : 12;

  const checkOutTime =
    localData.checkInTime && localData.duration
      ? calculateCheckOutTime(localData.checkInTime, localData.duration)
      : null;

  // Reset duration if it exceeds max hours when check-in time changes
  useEffect(() => {
    if (localData.checkInTime && localData.duration) {
      const max = calculateMaxHours(localData.checkInTime);
      if (localData.duration > max) {
        setLocalData(prev => ({
          ...prev,
          duration: Math.min(prev.duration || 2, max),
        }));
      }
    }
  }, [localData.checkInTime, localData.duration]);

  const handleDateChange = (date: Date) => {
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();

    let updatedCheckInTime = localData.checkInTime;

    // If switching to today, ALWAYS re-validate and update check-in time
    if (isToday) {
      // Calculate next available time for today
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      let currentTotalMinutes = currentHours * 60 + currentMinutes;

      // Round up to next 30-minute interval
      const remainder = currentTotalMinutes % 30;
      if (remainder > 0) {
        currentTotalMinutes += 30 - remainder;
      }

      const nextHours = Math.floor(currentTotalMinutes / 60);
      const nextMinutes = currentTotalMinutes % 60;
      const nextAvailableMinutes = nextHours * 60 + nextMinutes;

      // Check if current selected time is valid for today
      if (updatedCheckInTime) {
        const [selectedHours, selectedMinutes] = updatedCheckInTime
          .split(':')
          .map(Number);
        const selectedTotalMinutes = selectedHours * 60 + selectedMinutes;

        // Check if selected time is in the past or doesn't allow 2-hour booking
        const isPast = selectedTotalMinutes < currentTotalMinutes;
        const canBook2Hours = selectedTotalMinutes + 120 <= 22 * 60;

        if (isPast || !canBook2Hours) {
          // Selected time is invalid, use next available time
          const canBookAtNextTime =
            nextAvailableMinutes >= 9 * 60 &&
            nextAvailableMinutes <= 20 * 60 &&
            nextAvailableMinutes + 120 <= 22 * 60;

          if (canBookAtNextTime) {
            updatedCheckInTime = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
          } else if (nextHours < 9) {
            updatedCheckInTime = '09:00';
          } else {
            // Too late today - keep empty, user should select another date
            updatedCheckInTime = undefined;
          }
        }
      } else {
        // No time selected, set to next available
        const canBookAtNextTime =
          nextAvailableMinutes >= 9 * 60 &&
          nextAvailableMinutes <= 20 * 60 &&
          nextAvailableMinutes + 120 <= 22 * 60;

        if (canBookAtNextTime) {
          updatedCheckInTime = `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
        } else if (nextHours < 9) {
          updatedCheckInTime = '09:00';
        }
      }
    }

    const newData = { ...localData, date, checkInTime: updatedCheckInTime };
    setLocalData(newData);
    onChange(newData);
  };

  const handleTimeChange = (time: string) => {
    const newData = { ...localData, checkInTime: time };
    setLocalData(newData);
    onChange(newData);
  };

  const handleDurationChange = (hours: number) => {
    const newData = { ...localData, duration: hours };
    setLocalData(newData);
    onChange(newData);
  };

  // Calculate if today is still bookable
  const getMinBookableDate = (): Date => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();
    const currentTotalMinutes = currentHours * 60 + currentMinutes;

    // Round up to next 30-minute interval
    let nextAvailableMinutes = currentTotalMinutes;
    const remainder = nextAvailableMinutes % 30;
    if (remainder > 0) {
      nextAvailableMinutes += 30 - remainder;
    }

    // Check if we can still book today (need at least 2 hours before 22:00)
    const canBookToday =
      nextAvailableMinutes + 120 <= 22 * 60 && nextAvailableMinutes <= 20 * 60;

    if (!canBookToday) {
      // Too late today, minimum date is tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      return tomorrow;
    }

    return now;
  };

  return (
    <View className='gap-4'>
      {/* Date Picker */}
      <DatePicker
        label={t('booking.selectDate')}
        value={localData.date}
        onChange={handleDateChange}
        minDate={getMinBookableDate()}
        disabled={disabled}
        placeholder={t('booking.selectDatePlaceholder')}
      />

      {/* Time Picker */}
      <TimePicker
        label={t('booking.checkInTime')}
        value={localData.checkInTime}
        onChange={handleTimeChange}
        minTime='09:00'
        maxTime='20:00'
        step={30} // 30-minute intervals (9:00, 9:30, 10:00, etc.)
        disabled={disabled || !localData.date}
        placeholder={t('booking.selectTimePlaceholder')}
        disabledTimes={getDisabledTimes()}
      />

      {/* Duration Badge Selector */}
      <DurationBadgeSelector
        label={t('booking.duration')}
        value={value.duration}
        onChange={handleDurationChange}
        minHours={2}
        maxHours={maxHours}
        disabled={disabled || !value.checkInTime}
      />

      {/* Booking Summary */}
      {localData.date && localData.checkInTime && localData.duration && (
        <View className='rounded-xl border border-neutral-main bg-background-secondary p-4'>
          <Text className='mb-3 text-sm font-semibold text-text-primary'>
            {t('booking.summary')}
          </Text>

          <View className='gap-2'>
            {/* Check-in */}
            <View className='flex-row items-center justify-between'>
              <Text className='text-sm text-text-secondary'>
                {t('booking.checkIn')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {formatBookingDate(localData.date)} - {localData.checkInTime}
              </Text>
            </View>

            {/* Check-out */}
            <View className='flex-row items-center justify-between'>
              <Text className='text-sm text-text-secondary'>
                {t('booking.checkOut')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {formatBookingDate(localData.date)} - {checkOutTime}
              </Text>
            </View>

            {/* Duration */}
            <View className='flex-row items-center justify-between'>
              <Text className='text-sm text-text-secondary'>
                {t('booking.totalDuration')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {localData.duration} {t('booking.hours')}
              </Text>
            </View>

            {/* Business Hours Note */}
            {checkOutTime && checkOutTime > '22:00' && (
              <View className='bg-error/10 mt-2 rounded-lg p-2'>
                <Text className='text-error text-xs'>
                  {t('booking.checkOutTimeLimitExceeded')}
                </Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Business Hours Info */}
      <View className='rounded-lg bg-primary-lighter/10 p-3'>
        <Text className='text-xs text-text-secondary'>
          ℹ️ {t('booking.businessHoursNote')}
        </Text>
      </View>
    </View>
  );
}

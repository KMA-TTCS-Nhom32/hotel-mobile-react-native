import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { DateRangePicker } from '@/components/ui';

export interface DailyBookingData {
  checkInDate?: Date;
  checkOutDate?: Date;
}

interface DailyBookingFormProps {
  value: DailyBookingData;
  onChange: (data: DailyBookingData) => void;
  _pricePerDay: number;
  disabled?: boolean;
}

/**
 * Daily booking form with date range selection
 * Standard times: Check-in 14:00, Check-out 12:00
 * Uses price_per_day from room details
 * Minimum stay: 1 day
 */
export function DailyBookingForm({
  value,
  onChange,
  _pricePerDay,
  disabled = false,
}: DailyBookingFormProps) {
  const { t } = useTranslation();
  const [localData, setLocalData] = useState<DailyBookingData>(value);

  useEffect(() => {
    setLocalData(value);
  }, [value]);

  const handleDateRangeChange = (range: {
    startDate?: Date;
    endDate?: Date;
  }) => {
    const newData = {
      checkInDate: range.startDate,
      checkOutDate: range.endDate,
    };
    setLocalData(newData);
    onChange(newData);
  };

  // Calculate number of days
  const calculateDays = (): number => {
    if (!localData.checkInDate || !localData.checkOutDate) return 0;
    const diffTime =
      localData.checkOutDate.getTime() - localData.checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const numberOfDays = calculateDays();

  return (
    <View className='gap-4'>
      {/* Date Range Picker */}
      <DateRangePicker
        label={t('booking.selectDateRange')}
        value={{
          startDate: localData.checkInDate,
          endDate: localData.checkOutDate,
        }}
        onChange={handleDateRangeChange}
        minDate={new Date()}
        disabled={disabled}
        placeholder={t('booking.selectDateRangePlaceholder')}
      />

      {/* Booking Summary */}
      {localData.checkInDate && localData.checkOutDate && (
        <View className='rounded-xl border border-neutral-main bg-background-secondary p-4'>
          <Text className='mb-3 text-sm font-semibold text-text-primary'>
            {t('booking.dailyBookingInfo')}
          </Text>

          <View className='gap-3'>
            {/* Check-in Info */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.checkIn')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {format(localData.checkInDate, 'EEE, dd MMM yyyy')} - 14:00
              </Text>
            </View>

            {/* Check-out Info */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.checkOut')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {format(localData.checkOutDate, 'EEE, dd MMM yyyy')} - 12:00
              </Text>
            </View>

            {/* Duration */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.duration')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {numberOfDays}{' '}
                {numberOfDays === 1 ? t('booking.day') : t('booking.days')}
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Business Hours Info */}
      <View className='rounded-lg bg-primary-lighter/10 p-3'>
        <Text className='text-xs text-text-secondary'>
          ℹ️ {t('booking.dailyBookingNote')}
        </Text>
      </View>
    </View>
  );
}

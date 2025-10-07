import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { DatePicker } from '@/components/ui';

export interface NightlyBookingData {
  date?: Date;
}

interface NightlyBookingFormProps {
  value: NightlyBookingData;
  onChange: (data: NightlyBookingData) => void;
  _pricePerNight: number;
  disabled?: boolean;
}

/**
 * Nightly booking form with date selection
 * Fixed times: Check-in 21:00, Check-out 09:00 next day
 * Uses price_per_night from room details
 */
export function NightlyBookingForm({
  value,
  onChange,
  _pricePerNight,
  disabled = false,
}: NightlyBookingFormProps) {
  const { t } = useTranslation();
  const [localData, setLocalData] = useState<NightlyBookingData>(value);

  const handleDateChange = (date: Date) => {
    const newData = { date };
    setLocalData(newData);
    onChange(newData);
  };

  // Calculate check-out date (next day)
  const getCheckOutDate = (checkInDate: Date): Date => {
    const checkOut = new Date(checkInDate);
    checkOut.setDate(checkOut.getDate() + 1);
    return checkOut;
  };

  const checkOutDate = localData.date ? getCheckOutDate(localData.date) : null;

  return (
    <View className='gap-4'>
      {/* Date Picker */}
      <DatePicker
        label={t('booking.selectDate')}
        value={localData.date}
        onChange={handleDateChange}
        minDate={new Date()}
        disabled={disabled}
        placeholder={t('booking.selectDatePlaceholder')}
      />

      {/* Fixed Time Info */}
      {localData.date && (
        <View className='rounded-xl border border-neutral-main bg-background-secondary p-4'>
          <Text className='mb-3 text-sm font-semibold text-text-primary'>
            {t('booking.nightlyBookingInfo')}
          </Text>

          <View className='gap-3'>
            {/* Check-in Info */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.checkIn')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {format(localData.date, 'EEE, dd MMM yyyy')} - 21:00
              </Text>
            </View>

            {/* Check-out Info */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.checkOut')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {checkOutDate && format(checkOutDate, 'EEE, dd MMM yyyy')} -
                09:00
              </Text>
            </View>

            {/* Duration */}
            <View className='gap-1'>
              <Text className='text-xs text-text-tertiary'>
                {t('booking.duration')}
              </Text>
              <Text className='text-sm font-medium text-text-primary'>
                {t('booking.oneNight')} (12 {t('booking.hours')})
              </Text>
            </View>
          </View>
        </View>
      )}

      {/* Business Hours Info */}
      <View className='rounded-lg bg-primary-lighter/10 p-3'>
        <Text className='text-xs text-text-secondary'>
          ℹ️ {t('booking.nightlyBookingNote')}
        </Text>
      </View>
    </View>
  );
}

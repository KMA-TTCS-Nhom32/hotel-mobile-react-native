import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { useCommonTranslation } from '@/i18n/hooks';
import {
  type BookingFilters,
  formatBookingFiltersDisplay,
} from '@/types/booking';

interface BookingFilterBarProps {
  filters: BookingFilters;
  onPress: () => void;
}

/**
 * Compact filter bar showing current booking selections
 * Tapping opens the full filter modal
 */
export function BookingFilterBar({ filters, onPress }: BookingFilterBarProps) {
  const { t } = useCommonTranslation();
  const { dateTimeText, guestsText } = formatBookingFiltersDisplay(filters, t);

  return (
    <Pressable
      onPress={onPress}
      className='mb-4 flex-row items-center justify-between rounded-xl border border-primary-light bg-primary-lighter p-3 active:opacity-80'
    >
      {/* Left: Date/Time Info */}
      <View className='flex-1 flex-row items-center gap-3'>
        <View className='rounded-lg bg-primary-main p-2'>
          <Ionicons name='calendar' size={18} color='white' />
        </View>
        <View className='flex-1'>
          <Text
            className='text-sm font-semibold text-primary-darkest'
            numberOfLines={1}
          >
            {dateTimeText}
          </Text>
          <Text className='text-sm text-primary-dark'>{guestsText}</Text>
        </View>
      </View>

      {/* Right: Change Button */}
      <View className='flex-row items-center gap-1 rounded-lg bg-primary-main px-3 py-1.5'>
        <Text className='text-xs font-semibold text-white'>
          {t('search.change')}
        </Text>
        <Ionicons name='chevron-down' size={14} color='white' />
      </View>
    </Pressable>
  );
}

/**
 * Room Booking Summary Card
 * Displays selected room details, booking filters, and user info from stores
 */

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useMemo } from 'react';
import { Text, View } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';
import { useAuthStore } from '@/store/authStore';
import { useBookingStore } from '@/store/bookingStore';
import { formatCurrency } from '@/utils/format';

/**
 * Calculate total price based on booking type and room prices
 */
function calculateTotalPrice(
  room: {
    base_price_per_hour: string | number;
    base_price_per_night: string | number;
    base_price_per_day: string | number;
    special_price_per_hour?: string | number;
    special_price_per_night?: string | number;
    special_price_per_day?: string | number;
  },
  bookingType: string,
  startDate: Date,
  endDate: Date,
  startTime: string,
  endTime: string
): number {
  if (bookingType === 'HOURLY') {
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    const duration = endHour - startHour;
    const pricePerHour = Number(
      room.special_price_per_hour || room.base_price_per_hour
    );
    return pricePerHour * duration;
  }

  if (bookingType === 'NIGHTLY') {
    return Number(room.special_price_per_night || room.base_price_per_night);
  }

  if (bookingType === 'DAILY') {
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const pricePerDay = Number(
      room.special_price_per_day || room.base_price_per_day
    );
    return pricePerDay * days;
  }

  return 0;
}

/**
 * RoomBookingSummary - Uses booking store and auth store directly for all data
 */
export const RoomBookingSummary: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const { t } = useCommonTranslation();

  // Get all data from stores
  const { filters, selectedRoom } = useBookingStore();
  const { user } = useAuthStore();

  // Format dates for display
  const formatDisplayDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Calculate price
  const totalPrice = useMemo(() => {
    if (!selectedRoom) return 0;
    return calculateTotalPrice(
      selectedRoom,
      filters.bookingType,
      filters.startDate,
      filters.endDate,
      filters.startTime,
      filters.endTime
    );
  }, [selectedRoom, filters]);

  // Get booking type label
  const bookingTypeLabel = useMemo(() => {
    switch (filters.bookingType) {
      case 'HOURLY':
        return t('booking.hourly');
      case 'NIGHTLY':
        return t('booking.nightly');
      case 'DAILY':
        return t('booking.daily');
      default:
        return filters.bookingType;
    }
  }, [filters.bookingType, t]);

  // Calculate duration text
  const durationText = useMemo(() => {
    if (filters.bookingType === 'HOURLY') {
      const [startHour] = filters.startTime.split(':').map(Number);
      const [endHour] = filters.endTime.split(':').map(Number);
      const hours = endHour - startHour;
      return `${hours} ${t('booking.hours')}`;
    }
    if (filters.bookingType === 'NIGHTLY') {
      return `1 ${t('booking.night')}`;
    }
    if (filters.bookingType === 'DAILY') {
      const days = Math.ceil(
        (filters.endDate.getTime() - filters.startDate.getTime()) /
          (1000 * 60 * 60 * 24)
      );
      return `${days} ${t('booking.days')}`;
    }
    return '';
  }, [filters, t]);

  // Total guests
  const totalGuests = filters.adults + filters.children + filters.infants;

  if (!selectedRoom) {
    return (
      <View className='rounded-2xl border border-neutral-light bg-white p-4'>
        <Text className='text-center text-neutral-dark'>
          {t('roomDetail.loadingRoom')}
        </Text>
      </View>
    );
  }

  return (
    <View className='rounded-2xl border border-neutral-light bg-white p-4'>
      {/* Room Info Row */}
      <View className='flex-row gap-3'>
        {/* Thumbnail */}
        <View className='h-20 w-20 overflow-hidden rounded-lg'>
          {selectedRoom.thumbnail?.url ? (
            <Image
              source={{ uri: selectedRoom.thumbnail.url }}
              style={{ width: '100%', height: '100%' }}
              contentFit='cover'
            />
          ) : (
            <View className='flex-1 items-center justify-center bg-neutral-lighter'>
              <Ionicons name='image-outline' size={24} color='#9CA3AF' />
            </View>
          )}
        </View>

        {/* Room Details */}
        <View className='flex-1'>
          <Text
            className='text-base font-semibold text-neutral-darkest'
            numberOfLines={2}
          >
            {selectedRoom.translations.find(
              tr => tr.language === currentLanguage.toUpperCase()
            )?.name || selectedRoom.name}
          </Text>
          <Text className='mt-1 text-xs text-neutral-main'>
            {t(`branchDetail.roomType.${selectedRoom.room_type}`)} •{' '}
            {t(`branchDetail.bedType.${selectedRoom.bed_type}`)}
          </Text>
          <View className='mt-1 flex-row items-center'>
            <Ionicons
              name='people-outline'
              size={12}
              color={HEX_COLORS.text.secondary}
            />
            <Text className='ml-1 text-xs text-neutral-main'>
              {t('roomDetail.maxGuests', {
                adults: selectedRoom.max_adults,
                children: selectedRoom.max_children,
              })}
            </Text>
          </View>
        </View>
      </View>

      {/* Divider */}
      <View className='my-3 h-px bg-neutral-light' />

      {/* Booking Creator Info */}
      {user && (
        <>
          <View className='mb-3'>
            <Text className='mb-2 text-sm font-medium text-neutral-darkest'>
              {t('booking.bookedBy')}
            </Text>
            <View className='flex-row items-center gap-3 rounded-lg bg-neutral-lightest p-3'>
              <View className='h-10 w-10 items-center justify-center rounded-full bg-primary-lighter'>
                <Ionicons
                  name='person'
                  size={20}
                  color={HEX_COLORS.primary.main}
                />
              </View>
              <View className='flex-1'>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {user.name}
                </Text>
                <Text className='text-xs text-neutral-main'>
                  {user.email || user.phone || t('account.noEmailAvailable')}
                </Text>
              </View>
            </View>
          </View>
          {/* Divider */}
          <View className='mb-3 h-px bg-neutral-light' />
        </>
      )}

      {/* Booking Details */}
      <View className='gap-2'>
        {/* Booking Type & Duration */}
        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>
            {t('booking.bookingType')}
          </Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {bookingTypeLabel} • {durationText}
          </Text>
        </View>

        {/* Check-in */}
        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>
            {t('booking.checkIn')}
          </Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {formatDisplayDate(filters.startDate)} • {filters.startTime}
          </Text>
        </View>

        {/* Check-out */}
        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>
            {t('booking.checkOut')}
          </Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {formatDisplayDate(filters.endDate)} • {filters.endTime}
          </Text>
        </View>

        {/* Guests */}
        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>{t('guests.title')}</Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {filters.adults} {t('guests.adults')}
            {filters.children > 0 &&
              `, ${filters.children} ${t('guests.children')}`}
            {filters.infants > 0 &&
              `, ${filters.infants} ${t('guests.infants')}`}{' '}
            ({totalGuests} {t('guests.total')})
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className='my-3 h-px bg-neutral-light' />

      {/* Price */}
      <View className='flex-row items-center justify-between'>
        <Text className='text-sm font-medium text-neutral-dark'>
          {t('booking.roomPrice')}
        </Text>
        <Text className='text-lg font-bold text-primary-main'>
          {formatCurrency(totalPrice)}
        </Text>
      </View>
    </View>
  );
};

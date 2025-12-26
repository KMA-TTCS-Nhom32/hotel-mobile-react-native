import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMemo } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import { RoomImageGallery, RoomInfoCard } from '@/components/room-detail';
import { Button, ErrorState, LoadingSpinner } from '@/components/ui';
import { HEX_COLORS } from '@/config/colors';
import { useRoomDetail } from '@/hooks/useRoomDetail';
import { useCommonTranslation } from '@/i18n/hooks';
import { useBookingStore } from '@/store/bookingStore';
import type { BookingFilters } from '@/types/booking';

/**
 * Format booking summary for display in footer
 */
function formatBookingSummary(
  filters: BookingFilters,
  t: (key: string) => string
) {
  const {
    bookingType,
    startDate,
    endDate,
    startTime,
    endTime,
    adults,
    children,
    // infants,
  } = filters;

  let timeText = '';
  let checkInText = '';
  let checkOutText = '';
  let dateText = '';

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  if (bookingType === 'HOURLY') {
    checkInText = startTime;
    checkOutText = endTime;
    // Calculate duration
    const [startHour] = startTime.split(':').map(Number);
    const [endHour] = endTime.split(':').map(Number);
    const duration = endHour - startHour;

    // Format: "02 hours | 9:00 → 11:00, 25/12"
    timeText = `${String(duration).padStart(2, '0')} ${t('booking.hours')}`;
    dateText = formatDate(startDate);
  } else if (bookingType === 'NIGHTLY') {
    checkInText = '21:00';
    checkOutText = '09:00';
    // Format: "1 night | 21:00 → 09:00, 25/12"
    timeText = `1 ${t('booking.night')}`;
    dateText = formatDate(startDate);
  } else if (bookingType === 'DAILY') {
    checkInText = `14:00 ${formatDate(startDate)}`;
    checkOutText = `10:00 ${formatDate(endDate)}`;
    // Calculate days
    const days = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    timeText = `${days} ${t('booking.days')}`;
    dateText = '';
  }

  const totalGuests = adults + children;
  const guestText = `${t('guests.title')}: ${String(totalGuests).padStart(2, '0')}`;

  return {
    line1: {
      timeDuration: timeText,
      checkIn: checkInText,
      checkOut: checkOutText,
      date: dateText,
    },
    line2: guestText,
  };
}

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
  filters: BookingFilters
): number {
  const { bookingType, startDate, endDate, startTime, endTime } = filters;

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
 * Room Detail Screen
 * Displays comprehensive room information with booking summary footer
 */
export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useCommonTranslation();
  const insets = useSafeAreaInsets();

  // Get booking state from store
  const { filters, selectedRoom } = useBookingStore();

  // Use room from store if available, otherwise fetch
  const {
    data: fetchedRoom,
    isLoading,
    isError,
    error,
    refetch,
  } = useRoomDetail(id);

  // Prefer stored room, fallback to fetched
  const room = selectedRoom?.id === id ? selectedRoom : fetchedRoom;

  const bookingSummary = useMemo(
    () => formatBookingSummary(filters, t),
    [filters, t]
  );

  const totalPrice = useMemo(() => {
    if (!room) return 0;
    return calculateTotalPrice(room, filters);
  }, [room, filters]);

  const handleProceedToPayment = () => {
    if (!room) return;
    router.push('/payment');
  };

  if (isLoading && !room) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <View className='h-screen w-screen items-center justify-center bg-inherit'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  if ((isError || !room) && !selectedRoom) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <ErrorState
          description={error?.message || t('roomDetail.failedToLoadRoom')}
          onRetry={refetch}
        />
      </Screen>
    );
  }

  if (!room) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <View className='h-screen w-screen items-center justify-center bg-inherit'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  return (
    <Screen backgroundColor='#ffffff' safeArea={false} padding={false}>
      <StatusBar style='light' />

      {/* Header with back button - Overlay on image */}
      <View className='absolute left-0 right-0 top-12 z-10 flex-row items-center justify-between px-4'>
        <Pressable
          onPress={() => router.back()}
          className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'
        >
          <Ionicons name='arrow-back' size={24} color='white' />
        </Pressable>

        {/* Share/Favorite buttons */}
        <View className='flex-row gap-2'>
          <Pressable className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'>
            <Ionicons name='share-outline' size={20} color='white' />
          </Pressable>
          <Pressable className='h-10 w-10 items-center justify-center rounded-full bg-black/30 backdrop-blur-md active:opacity-70'>
            <Ionicons name='heart-outline' size={20} color='white' />
          </Pressable>
        </View>
      </View>

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Image Gallery */}
        <RoomImageGallery thumbnail={room.thumbnail} images={room.images} />

        {/* Content Sections */}
        <View className='-mt-4 rounded-t-3xl bg-background-primary pt-6'>
          {/* Room Info Card */}
          <RoomInfoCard room={room} />

          {/* Price Overview */}
          <View className='border-t border-neutral-light px-4 py-6'>
            <Text className='mb-4 text-lg font-semibold text-text-primary'>
              {t('roomDetail.priceOverview')}
            </Text>
            <View className='flex-row flex-wrap gap-4'>
              {Number(room.base_price_per_hour) > 0 && (
                <View className='flex-1 rounded-xl border border-neutral-light bg-background-secondary p-4'>
                  <View className='mb-2 flex-row items-center gap-2'>
                    <MaterialIcons
                      name='schedule'
                      size={18}
                      color={HEX_COLORS.primary.main}
                    />
                    <Text className='text-sm text-text-secondary'>
                      {t('booking.perHour')}
                    </Text>
                  </View>
                  <Text className='text-lg font-bold text-primary-main'>
                    {Number(
                      room.special_price_per_hour || room.base_price_per_hour
                    ).toLocaleString('vi-VN')}
                    ₫
                  </Text>
                </View>
              )}
              {Number(room.base_price_per_night) > 0 && (
                <View className='flex-1 rounded-xl border border-neutral-light bg-background-secondary p-4'>
                  <View className='mb-2 flex-row items-center gap-2'>
                    <MaterialIcons
                      name='nightlight'
                      size={18}
                      color={HEX_COLORS.primary.main}
                    />
                    <Text className='text-sm text-text-secondary'>
                      {t('booking.perNight')}
                    </Text>
                  </View>
                  <Text className='text-lg font-bold text-primary-main'>
                    {Number(
                      room.special_price_per_night || room.base_price_per_night
                    ).toLocaleString('vi-VN')}
                    ₫
                  </Text>
                </View>
              )}
              {Number(room.base_price_per_day) > 0 && (
                <View className='flex-1 rounded-xl border border-neutral-light bg-background-secondary p-4'>
                  <View className='mb-2 flex-row items-center gap-2'>
                    <MaterialIcons
                      name='wb-sunny'
                      size={18}
                      color={HEX_COLORS.primary.main}
                    />
                    <Text className='text-sm text-text-secondary'>
                      {t('booking.perDay')}
                    </Text>
                  </View>
                  <Text className='text-lg font-bold text-primary-main'>
                    {Number(
                      room.special_price_per_day || room.base_price_per_day
                    ).toLocaleString('vi-VN')}
                    ₫
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* Bottom spacing for fixed footer */}
          <View className='h-44' />
        </View>
      </ScrollView>

      {/* Fixed Footer with Booking Summary and Proceed Button */}
      <View
        className='absolute bottom-0 left-0 right-0 border-t border-neutral-light bg-background-primary shadow-lg'
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <View className='w-full flex-col gap-5 px-4 pb-4 pt-5'>
          <View className='flex-1 rounded-[9999px] border border-[1.5px] border-primary-main bg-primary-lighter px-3 py-2'>
            <View className='flex-row items-center'>
              <Text className='text-base font-medium text-primary-main'>
                {bookingSummary.line1.timeDuration}
              </Text>
              <Text className='mx-2 text-base font-medium'>|</Text>
              <View className='flex-row items-center gap-1'>
                <Text className='text-base font-medium text-primary-main'>
                  {bookingSummary.line1.checkIn}
                </Text>
                <Ionicons
                  name='arrow-forward'
                  size={14}
                  color={HEX_COLORS.text.secondary}
                />
                <Text className='text-base font-medium text-primary-main'>
                  {bookingSummary.line1.checkOut}
                </Text>
              </View>
              {bookingSummary.line1.date && (
                <Text className='text-base font-medium text-primary-main'>
                  , {bookingSummary.line1.date}
                </Text>
              )}
              <Text className='mx-2 text-base font-medium'>|</Text>
              <Text className='text-base text-text-secondary'>
                {bookingSummary.line2}
              </Text>
            </View>
          </View>

          {/* Right: Price + Button */}
          <View className='flex-row items-center justify-between'>
            {totalPrice > 0 && (
              <Text className='mb-1 text-xl font-bold text-primary-main'>
                {totalPrice.toLocaleString('vi-VN')}₫
              </Text>
            )}
            <Button
              title={t('roomDetail.bookNow')}
              onPress={handleProceedToPayment}
              disabled={!room.is_available}
              // style={{ paddingHorizontal: 24, paddingVertical: 10 }}
              className='rounded-3xl px-6 py-2.5'
              textStyle={{
                fontSize: 15,
              }}
            />
          </View>
        </View>
      </View>
    </Screen>
  );
}

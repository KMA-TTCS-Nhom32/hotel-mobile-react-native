import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Screen } from '@/components/layout';
import {
  BookingTypeSelector,
  DailyBookingForm,
  HourlyBookingForm,
  NightlyBookingForm,
  RoomImageGallery,
  RoomInfoCard,
  type BookingType,
  type DailyBookingData,
  type HourlyBookingData,
  type NightlyBookingData,
} from '@/components/room-detail';
import { Button, ErrorState, LoadingSpinner } from '@/components/ui';
import { useRoomDetail } from '@/hooks/useRoomDetail';
import { useCommonTranslation } from '@/i18n/hooks';

/**
 * Calculate the next available time slot based on current time
 * Rounds up to the nearest 30-minute interval within business hours (9:00-20:00)
 * Returns null if it's too late to book today (after 20:00 or not enough time for 2 hours)
 */
function getNextAvailableTimeSlot(): string | null {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Convert to minutes since midnight
  let totalMinutes = hours * 60 + minutes;

  // Round up to next 30-minute interval
  const remainder = totalMinutes % 30;
  if (remainder > 0) {
    totalMinutes += 30 - remainder;
  }

  // Convert back to hours and minutes
  const nextHours = Math.floor(totalMinutes / 60);
  const nextMinutes = totalMinutes % 60;

  // If before 9:00, return 9:00
  if (nextHours < 9) {
    return '09:00';
  }

  // Check if we have enough time for 2-hour booking (need to finish by 22:00)
  // Last valid check-in is 20:00 (20:00 + 2hrs = 22:00 close)
  const checkInMinutes = nextHours * 60 + nextMinutes;
  const canBook2Hours = checkInMinutes + 120 <= 22 * 60; // 22:00 in minutes

  if (!canBook2Hours) {
    return null; // Too late, should book for tomorrow
  }

  return `${String(nextHours).padStart(2, '0')}:${String(nextMinutes).padStart(2, '0')}`;
}

/**
 * Get initial daily booking data with smart defaults
 * If current time is before 14:00, default to today → tomorrow (1 day)
 * If current time is after 14:00, default to tomorrow → day after (1 day)
 */
function getInitialDailyData(): DailyBookingData {
  const now = new Date();
  const currentHour = now.getHours();

  if (currentHour < 14) {
    // Before 14:00 - can check in today
    const checkInDate = new Date();
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 1);
    return {
      checkInDate,
      checkOutDate,
    };
  } else {
    // After 14:00 - check in tomorrow
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + 1);
    const checkOutDate = new Date();
    checkOutDate.setDate(checkOutDate.getDate() + 2);
    return {
      checkInDate,
      checkOutDate,
    };
  }
}

/**
 * Room Detail Screen
 * Displays comprehensive room information and booking form
 */
export default function RoomDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useCommonTranslation();
  const insets = useSafeAreaInsets();

  // Initialize with smart defaults: today's date and next available time slot
  // If too late today, default to tomorrow at 9:00
  const getInitialHourlyData = (): HourlyBookingData => {
    const nextSlot = getNextAvailableTimeSlot();
    const today = new Date();

    if (nextSlot === null) {
      // Too late today, book for tomorrow
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      return {
        date: tomorrow,
        checkInTime: '09:00',
        duration: 2,
      };
    }

    return {
      date: today,
      checkInTime: nextSlot,
      duration: 2,
    };
  };

  const [bookingType, setBookingType] = useState<BookingType>('HOURLY');

  // Separate state for each booking type to preserve selections
  const [hourlyData, setHourlyData] = useState<HourlyBookingData>(
    getInitialHourlyData()
  );
  const [nightlyData, setNightlyData] = useState<NightlyBookingData>({
    date: new Date(),
  });
  const [dailyData, setDailyData] = useState<DailyBookingData>(
    getInitialDailyData()
  );

  const { data: room, isLoading, isError, error, refetch } = useRoomDetail(id);

  const handleBookingTypeChange = (type: BookingType) => {
    setBookingType(type);
    // No need to reset form data - each type maintains its own state
  };

  const handleHourlyDataChange = useCallback((data: HourlyBookingData) => {
    setHourlyData(data);
  }, []);

  const handleNightlyDataChange = useCallback((data: NightlyBookingData) => {
    setNightlyData(data);
  }, []);

  const handleDailyDataChange = useCallback((data: DailyBookingData) => {
    setDailyData(data);
  }, []);

  const handleProceedToPayment = () => {
    if (!room) return;

    // Calculate dates and times based on booking type
    let startDate: string;
    let endDate: string;
    let startTime: string;
    let endTime: string;

    if (bookingType === 'HOURLY' && hourlyData.date && hourlyData.checkInTime) {
      // Hourly booking
      startDate = hourlyData.date.toISOString().split('T')[0];
      endDate = startDate; // Same day
      startTime = hourlyData.checkInTime;

      // Calculate end time based on duration
      const [hours, minutes] = hourlyData.checkInTime.split(':').map(Number);
      const endHours = hours + (hourlyData.duration || 2);
      endTime = `${String(endHours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    } else if (bookingType === 'NIGHTLY' && nightlyData.date) {
      // Nightly booking (check-in today 14:00, check-out tomorrow 12:00)
      startDate = nightlyData.date.toISOString().split('T')[0];
      const nextDay = new Date(nightlyData.date);
      nextDay.setDate(nextDay.getDate() + 1);
      endDate = nextDay.toISOString().split('T')[0];
      startTime = '14:00';
      endTime = '12:00';
    } else if (
      bookingType === 'DAILY' &&
      dailyData.checkInDate &&
      dailyData.checkOutDate
    ) {
      // Daily booking
      startDate = dailyData.checkInDate.toISOString().split('T')[0];
      endDate = dailyData.checkOutDate.toISOString().split('T')[0];
      startTime = '14:00';
      endTime = '12:00';
    } else {
      return; // Invalid booking data
    }

    // Calculate total price
    const calculatePrice = () => {
      if (bookingType === 'HOURLY' && hourlyData.duration) {
        const pricePerHour = Number(
          room.special_price_per_hour || room.base_price_per_hour
        );
        return pricePerHour * hourlyData.duration;
      }
      if (bookingType === 'NIGHTLY') {
        return Number(
          room.special_price_per_night || room.base_price_per_night
        );
      }
      if (
        bookingType === 'DAILY' &&
        dailyData.checkInDate &&
        dailyData.checkOutDate
      ) {
        const days = Math.ceil(
          (dailyData.checkOutDate.getTime() - dailyData.checkInDate.getTime()) /
            (1000 * 60 * 60 * 24)
        );
        return (
          Number(room.special_price_per_day || room.base_price_per_day) * days
        );
      }
      return 0;
    };

    const totalPrice = calculatePrice();

    // Navigate to payment screen with roomId (React Query will fetch from cache)
    router.push({
      pathname: '/payment',
      params: {
        roomId: room.id, // Pass only room ID - payment screen uses useRoomDetail to get cached data
        bookingType,
        startDate,
        endDate,
        startTime,
        endTime,
        price: totalPrice.toString(),
      },
    });
  };

  if (isLoading) {
    return (
      <Screen backgroundColor='inherit'>
        <StatusBar style='dark' />
        <View className='h-screen w-screen items-center justify-center bg-inherit'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  if (isError || !room) {
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

  // Validate booking data based on type
  const canProceed = (() => {
    if (bookingType === 'HOURLY') {
      return !!(
        hourlyData.date &&
        hourlyData.checkInTime &&
        hourlyData.duration &&
        hourlyData.duration >= 2
      );
    }
    if (bookingType === 'NIGHTLY') {
      return !!nightlyData.date;
    }
    if (bookingType === 'DAILY') {
      return !!(
        dailyData.checkInDate &&
        dailyData.checkOutDate &&
        dailyData.checkOutDate > dailyData.checkInDate
      );
    }
    return false;
  })();

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
          {/* Room Info */}
          <RoomInfoCard room={room} />

          {/* Booking Type Selector */}
          <BookingTypeSelector
            selectedType={bookingType}
            onTypeChange={handleBookingTypeChange}
          />

          {/* Booking Forms */}
          <View className='px-4 py-6'>
            {bookingType === 'HOURLY' && (
              <HourlyBookingForm
                value={hourlyData}
                onChange={handleHourlyDataChange}
                _pricePerHour={Number(room.base_price_per_hour)}
                disabled={!room.is_available}
              />
            )}

            {bookingType === 'NIGHTLY' && (
              <NightlyBookingForm
                value={nightlyData}
                onChange={handleNightlyDataChange}
                _pricePerNight={Number(room.base_price_per_night)}
                disabled={!room.is_available}
              />
            )}

            {bookingType === 'DAILY' && (
              <DailyBookingForm
                value={dailyData}
                onChange={handleDailyDataChange}
                _pricePerDay={Number(room.base_price_per_day)}
                disabled={!room.is_available}
              />
            )}
          </View>

          {/* Bottom spacing for fixed footer */}
          <View className='h-40' />
        </View>
      </ScrollView>

      {/* Fixed Footer with Price and Proceed Button */}
      <View
        className='absolute bottom-0 left-0 right-0 border-t border-neutral-light bg-background-primary'
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        {/* Compact Price Summary */}
        {canProceed &&
          (() => {
            const calculatePrice = () => {
              if (bookingType === 'HOURLY' && hourlyData.duration) {
                const pricePerHour = Number(
                  room.special_price_per_hour || room.base_price_per_hour
                );
                return pricePerHour * hourlyData.duration;
              }
              if (bookingType === 'NIGHTLY') {
                const pricePerNight = Number(
                  room.special_price_per_night || room.base_price_per_night
                );
                return pricePerNight;
              }
              if (
                bookingType === 'DAILY' &&
                dailyData.checkInDate &&
                dailyData.checkOutDate
              ) {
                const days = Math.ceil(
                  (dailyData.checkOutDate.getTime() -
                    dailyData.checkInDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                const pricePerDay = Number(
                  room.special_price_per_day || room.base_price_per_day
                );
                return pricePerDay * days;
              }
              return 0;
            };

            const totalPrice = calculatePrice();

            return totalPrice > 0 ? (
              <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
                <Text className='text-sm text-text-secondary'>
                  {t('booking.totalPrice')}
                </Text>
                <Text className='text-xl font-bold text-primary-main'>
                  {totalPrice.toLocaleString('vi-VN')}₫
                </Text>
              </View>
            ) : null;
          })()}

        {/* Proceed Button */}
        <View className='px-4 pt-3'>
          <Button
            title={t('roomDetail.proceedToPayment')}
            onPress={handleProceedToPayment}
            disabled={!canProceed}
            fullWidth
            style={{ opacity: !canProceed ? 0.5 : 1 }}
          />
        </View>
      </View>
    </Screen>
  );
}

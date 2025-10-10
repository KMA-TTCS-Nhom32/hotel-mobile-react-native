import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Text, View } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';

import type { BookingType } from './BookingTypeSelector';

interface BookingData {
  type: BookingType;
  date?: Date;
  checkInDate?: Date;
  checkOutDate?: Date;
  checkInTime?: string;
  duration?: number;
}

interface PricingSummaryProps {
  room: RoomDetail;
  bookingData: BookingData;
}

/**
 * Pricing summary component that calculates and displays the booking price
 */
export function PricingSummary({ room, bookingData }: PricingSummaryProps) {
  const { t } = useCommonTranslation();

  const calculatePrice = () => {
    const { type, duration, checkInDate, checkOutDate } = bookingData;

    if (type === 'HOURLY' && duration) {
      const pricePerHour = Number(
        room.special_price_per_hour || room.base_price_per_hour
      );
      return pricePerHour * duration;
    }

    if (type === 'NIGHTLY') {
      const pricePerNight = Number(
        room.special_price_per_night || room.base_price_per_night
      );
      return pricePerNight;
    }

    if (type === 'DAILY' && checkInDate && checkOutDate) {
      const days = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const pricePerDay = Number(
        room.special_price_per_day || room.base_price_per_day
      );
      return pricePerDay * days;
    }

    return 0;
  };

  const getBookingDetails = () => {
    const { type, date, checkInDate, checkOutDate, checkInTime, duration } =
      bookingData;

    if (type === 'HOURLY' && date && checkInTime && duration) {
      const [hours, minutes] = checkInTime.split(':');
      const endHour = parseInt(hours) + duration;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      return {
        checkIn: `${format(date, 'MMM dd, yyyy')} - ${checkInTime}`,
        checkOut: `${format(date, 'MMM dd, yyyy')} - ${endTime}`,
        duration: `${duration} ${t('booking.hours')}`,
      };
    }

    if (type === 'NIGHTLY' && date) {
      const nextDay = new Date(date);
      nextDay.setDate(nextDay.getDate() + 1);
      return {
        checkIn: `${format(date, 'MMM dd, yyyy')} - 21:00`,
        checkOut: `${format(nextDay, 'MMM dd, yyyy')} - 09:00`,
        duration: t('booking.nightStay'),
      };
    }

    if (type === 'DAILY' && checkInDate && checkOutDate) {
      const days = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      return {
        checkIn: format(checkInDate, 'MMM dd, yyyy'),
        checkOut: format(checkOutDate, 'MMM dd, yyyy'),
        duration: `${days} ${t('booking.days')}`,
      };
    }

    return null;
  };

  const totalPrice = calculatePrice();
  const details = getBookingDetails();

  if (!details || totalPrice === 0) {
    return null;
  }

  const getUnitPrice = () => {
    const { type } = bookingData;
    if (type === 'HOURLY') {
      return Number(room.special_price_per_hour || room.base_price_per_hour);
    }
    if (type === 'NIGHTLY') {
      return Number(room.special_price_per_night || room.base_price_per_night);
    }
    return Number(room.special_price_per_day || room.base_price_per_day);
  };

  const getPriceLabel = () => {
    const { type } = bookingData;
    if (type === 'HOURLY') return t('booking.perHour');
    if (type === 'NIGHTLY') return t('booking.perNight');
    return t('booking.perDay');
  };

  return (
    <View className='border-t border-neutral-light bg-background-secondary px-4 py-6'>
      <Text className='mb-4 text-lg font-semibold text-text-primary'>
        {t('booking.summary')}
      </Text>

      {/* Booking Details */}
      <View className='mb-4 gap-3 rounded-xl bg-background-primary p-4'>
        {/* Check-in */}
        <View className='flex-row items-start gap-3'>
          <MaterialIcons
            name='login'
            size={20}
            color={HEX_COLORS.text.secondary}
          />
          <View className='flex-1'>
            <Text className='text-xs text-text-tertiary'>
              {t('booking.checkIn')}
            </Text>
            <Text className='font-medium text-text-primary'>
              {details.checkIn}
            </Text>
          </View>
        </View>

        {/* Check-out */}
        <View className='flex-row items-start gap-3'>
          <MaterialIcons
            name='logout'
            size={20}
            color={HEX_COLORS.text.secondary}
          />
          <View className='flex-1'>
            <Text className='text-xs text-text-tertiary'>
              {t('booking.checkOut')}
            </Text>
            <Text className='font-medium text-text-primary'>
              {details.checkOut}
            </Text>
          </View>
        </View>

        {/* Duration */}
        <View className='flex-row items-start gap-3'>
          <MaterialIcons
            name='schedule'
            size={20}
            color={HEX_COLORS.text.secondary}
          />
          <View className='flex-1'>
            <Text className='text-xs text-text-tertiary'>
              {t('booking.duration')}
            </Text>
            <Text className='font-medium text-text-primary'>
              {details.duration}
            </Text>
          </View>
        </View>
      </View>

      {/* Price Breakdown */}
      <View className='gap-2 rounded-xl bg-background-primary p-4'>
        <View className='flex-row items-center justify-between'>
          <Text className='text-sm text-text-secondary'>
            {t('booking.roomPrice')} ({getPriceLabel()})
          </Text>
          <Text className='font-medium text-text-primary'>
            {getUnitPrice().toLocaleString()}₫
          </Text>
        </View>

        {bookingData.type !== 'NIGHTLY' && (
          <View className='flex-row items-center justify-between'>
            <Text className='text-sm text-text-secondary'>
              {t('booking.duration')}
            </Text>
            <Text className='font-medium text-text-primary'>
              {details.duration}
            </Text>
          </View>
        )}

        {/* Total */}
        <View className='mt-2 border-t border-neutral-light pt-2'>
          <View className='flex-row items-center justify-between'>
            <Text className='text-base font-semibold text-text-primary'>
              {t('booking.totalPrice')}
            </Text>
            <Text className='text-2xl font-bold text-primary-main'>
              {totalPrice.toLocaleString()}₫
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

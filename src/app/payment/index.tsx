/**
 * Payment Method Screen
 * Allows users to review booking details and select payment method
 */

import type { CreateBookingOnlineDto } from '@ahomevilla-hotel/node-sdk';
import {
  CreateBookingOnlineDtoPaymentMethodEnum,
  CreateBookingOnlineDtoTypeEnum,
} from '@ahomevilla-hotel/node-sdk/dist/models/create-booking-online-dto';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { InputTextarea } from '@/components/forms';
import { Screen } from '@/components/layout';
import {
  GuestCounter,
  PaymentMethodSelector,
  PromotionSection,
  RoomBookingSummary,
} from '@/components/payment';
import { ErrorState, LoadingSpinner } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useCreateBooking } from '@/hooks/useCreateBooking';
import { useCreatePaymentLink } from '@/hooks/useCreatePaymentLink';
import { useRoomDetail } from '@/hooks/useRoomDetail';
import { usePaymentTranslation } from '@/i18n/hooks';
import { useBookingStore } from '@/store/bookingStore';
import type { GuestCount } from '@/types/payment';
import { formatCurrency, formatDateForAPI } from '@/utils/format';
import { showErrorToast } from '@/utils/toast';

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

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = usePaymentTranslation();

  // Get booking state from store
  const { filters, selectedRoom, clearBooking } = useBookingStore();

  // Fetch room data if not in store (fallback)
  const {
    data: fetchedRoom,
    isLoading,
    // isError,
  } = useRoomDetail(selectedRoom?.id);

  // Use room from store or fetched
  const room = selectedRoom || fetchedRoom;

  // Initialize guests from filters
  const [guests, setGuests] = React.useState<GuestCount>({
    adults: filters.adults,
    children: filters.children,
    infants: filters.infants,
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    React.useState<CreateBookingOnlineDtoPaymentMethodEnum>(
      CreateBookingOnlineDtoPaymentMethodEnum.Cash
    );

  const [promotionCode, setPromotionCode] = React.useState<string>('');

  // Form for special requests
  const form = useForm<{ special_requests?: string }>({
    defaultValues: {
      special_requests: '',
    },
  });

  // Calculate price from store data
  const basePrice = useMemo(() => {
    if (!room) return 0;
    return calculateTotalPrice(
      room,
      filters.bookingType,
      filters.startDate,
      filters.endDate,
      filters.startTime,
      filters.endTime
    );
  }, [room, filters]);

  const discount = 0; // TODO: Calculate discount based on promotion code
  const totalPrice = basePrice - discount;

  // Format dates for API
  const startDateFormatted = formatDateForAPI(filters.startDate);
  const endDateFormatted = formatDateForAPI(filters.endDate);

  // Format dates for display
  const formatDisplayDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}`;
  };

  // Booking creation mutation
  const { mutate: createBooking, isPending: isCreatingBooking } =
    useCreateBooking({
      onSuccess: booking => {
        // Check payment method to determine next step
        if (
          selectedPaymentMethod === CreateBookingOnlineDtoPaymentMethodEnum.Cash
        ) {
          // Clear booking state
          clearBooking();
          // For CASH payment, navigate directly to success screen
          router.push({
            pathname: '/payment/success' as any,
            params: {
              orderCode: booking.code,
              paymentMethod: CreateBookingOnlineDtoPaymentMethodEnum.Cash,
            },
          });
        } else if (
          selectedPaymentMethod ===
          CreateBookingOnlineDtoPaymentMethodEnum.VietQr
        ) {
          // For online payment, create payment link
          createPaymentLink({
            bookingCode: booking.code,
            amount: totalPrice,
            items: room
              ? [{ name: room.name, quantity: 1, price: basePrice / 100 }]
              : undefined,
          });
        } else {
          // Fallback for other payment methods
          clearBooking();
          router.push({
            pathname: '/payment/success' as any,
            params: {
              orderCode: booking.code,
              paymentMethod: selectedPaymentMethod,
            },
          });
        }
      },
      onError: error => {
        showErrorToast(
          error.message ||
            t('bookingErrorMessage') ||
            'Failed to create booking. Please try again.',
          t('bookingError') || 'Booking Failed'
        );
      },
    });

  // Payment link creation mutation
  const { mutate: createPaymentLink, isPending: isCreatingPaymentLink } =
    useCreatePaymentLink({
      onSuccess: paymentData => {
        console.log('created payment: ', paymentData);
        // Navigate to QR confirmation screen with payment data
        router.push({
          pathname: ROUTES.PAYMENT.QR_CONFIRMATION,
          params: {
            qrCode: paymentData.qrCode,
            accountName: paymentData.accountName,
            accountNumber: paymentData.accountNumber,
            bin: paymentData.bin,
            amount: paymentData.amount.toString(),
            orderCode: paymentData.orderCode,
          },
        });
      },
      onError: error => {
        console.log('fail to create booking', error.message);
        showErrorToast(
          error.message ||
            t('paymentErrorMessage') ||
            'Failed to create payment link. Please try again or use cash payment.',
          t('paymentError') || 'Payment Failed'
        );
      },
    });

  const handleBooking = () => {
    if (!room) return;

    const bookingData: CreateBookingOnlineDto = {
      type: filters.bookingType as CreateBookingOnlineDtoTypeEnum,
      detailId: room.id,
      start_date: startDateFormatted,
      end_date: endDateFormatted,
      start_time: filters.startTime,
      end_time: filters.endTime,
      number_of_guests: guests.adults,
      adults: guests.adults,
      children: guests.children,
      infants: guests.infants,
      special_requests: form.getValues('special_requests'),
      payment_method: selectedPaymentMethod,
    };

    console.log('booking payload', bookingData);
    // Create booking via API
    createBooking(bookingData);
  };

  // Check if booking or payment link is being created
  const isProcessing = isCreatingBooking || isCreatingPaymentLink;

  // Show loading state while fetching room data
  if (isLoading && !room) {
    return (
      <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
        <StatusBar style='dark' />
        <View className='flex-1 items-center justify-center'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  // Show error state if no room data
  if (!room) {
    return (
      <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
        <StatusBar style='dark' />
        <ErrorState
          description={t('failedToLoadRoom')}
          onRetry={() => router.back()}
        />
      </Screen>
    );
  }

  return (
    <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
      <StatusBar style='dark' />

      {/* Header */}
      <View className='mt-12 flex-row items-center justify-center border-b border-neutral-lighter bg-white px-4 py-4'>
        <Text className='text-xl font-bold text-neutral-darkest'>
          {t('title')}
        </Text>
      </View>

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Room Summary - Use store data */}
        <RoomBookingSummary
          room={room}
          checkInDate={formatDisplayDate(filters.startDate)}
          checkInTime={filters.startTime}
          checkOutDate={formatDisplayDate(filters.endDate)}
          checkOutTime={filters.endTime}
          bookingType={filters.bookingType as CreateBookingOnlineDtoTypeEnum}
          price={formatCurrency(basePrice)}
        />

        {/* Guest Counter */}
        <View className='mt-4'>
          <GuestCounter
            guests={guests}
            maxAdults={room.max_adults || 2}
            maxChildren={room.max_children || 0}
            onChange={setGuests}
          />
        </View>

        {/* Special Requests */}
        <View className='mt-4'>
          <FormProvider {...form}>
            <View className='rounded-2xl border border-neutral-light bg-white p-4'>
              <InputTextarea
                name='special_requests'
                label={t('specialRequests')}
                placeholder={t('specialRequestsPlaceholder')}
                rows={4}
                maxLength={500}
                helperText={t('specialRequestsHelper')}
              />
            </View>
          </FormProvider>
        </View>

        {/* Promotion Section */}
        <View className='mt-4'>
          <PromotionSection
            promotionCode={promotionCode}
            onApply={setPromotionCode}
          />
        </View>

        {/* Total Price */}
        <View className='mt-4 rounded-2xl border border-neutral-light bg-white p-4'>
          <Text className='mb-3 text-base font-semibold text-neutral-darkest'>
            {t('priceSummary')}
          </Text>

          <View className='gap-2'>
            <View className='flex-row justify-between'>
              <Text className='text-sm text-neutral-dark'>
                {t('roomPrice')}
              </Text>
              <Text className='text-sm font-medium text-neutral-darkest'>
                {formatCurrency(basePrice)}
              </Text>
            </View>

            {discount > 0 && (
              <View className='flex-row justify-between'>
                <Text className='text-sm text-neutral-dark'>
                  {t('discount')}
                </Text>
                <Text className='text-sm font-medium text-success-main'>
                  -{formatCurrency(discount)}
                </Text>
              </View>
            )}

            <View className='my-2 h-px bg-neutral-light' />

            <View className='flex-row items-center justify-between'>
              <Text className='text-base font-semibold text-neutral-darkest'>
                {t('total')}
              </Text>
              <Text className='text-xl font-bold text-primary-main'>
                {formatCurrency(totalPrice)}
              </Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View className='mt-4'>
          <PaymentMethodSelector
            selectedMethod={selectedPaymentMethod}
            onChange={setSelectedPaymentMethod}
          />
        </View>
      </ScrollView>

      {/* Fixed Bottom: Book Now Button */}
      <View className='absolute bottom-0 left-0 right-0 border-t border-neutral-lighter bg-white px-4 py-4'>
        <Pressable
          onPress={handleBooking}
          disabled={isProcessing}
          className='w-full rounded-xl bg-primary-main py-4 active:opacity-80'
          style={{ opacity: isProcessing ? 0.6 : 1 }}
        >
          {isProcessing ? (
            <View className='flex-row items-center justify-center gap-2'>
              <Text className='text-center text-base font-bold text-white'>
                {isCreatingBooking
                  ? t('creatingBooking') || 'Creating booking...'
                  : t('processingPayment') || 'Processing payment...'}
              </Text>
            </View>
          ) : (
            <Text className='text-center text-base font-bold text-white'>
              {t('confirmBooking')} • {formatCurrency(totalPrice)}
            </Text>
          )}
        </Pressable>
      </View>
    </Screen>
  );
}

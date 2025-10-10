/**
 * Payment Method Screen
 * Allows users to review booking details and select payment method
 */

import type { CreateBookingOnlineDto } from '@ahomevilla-hotel/node-sdk';
import {
  CreateBookingOnlineDtoPaymentMethodEnum,
  CreateBookingOnlineDtoTypeEnum,
} from '@ahomevilla-hotel/node-sdk/dist/models/create-booking-online-dto';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
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
import type { GuestCount } from '@/types/payment';
import { formatCurrency } from '@/utils/format';
import { showErrorToast } from '@/utils/toast';

export default function PaymentScreen() {
  const router = useRouter();
  const { t } = usePaymentTranslation();

  const params = useLocalSearchParams<{
    // Room ID - will fetch from React Query cache
    roomId: string;
    // Booking details
    bookingType: CreateBookingOnlineDtoTypeEnum;
    startDate: string;
    endDate: string;
    startTime: string;
    endTime: string;
    price: string;
  }>();

  console.log('payment params', params);

  // Fetch room data using React Query (will use cached data from room detail screen)
  const { data: room, isLoading, isError } = useRoomDetail(params.roomId);

  const [guests, setGuests] = React.useState<GuestCount>({
    adults: 2,
    children: 0,
    infants: 0,
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

  const basePrice = parseFloat(params.price || '0');
  const discount = 0; // TODO: Calculate discount based on promotion code
  const totalPrice = basePrice - discount;

  // Booking creation mutation
  const { mutate: createBooking, isPending: isCreatingBooking } =
    useCreateBooking({
      onSuccess: booking => {
        // Check payment method to determine next step
        if (
          selectedPaymentMethod === CreateBookingOnlineDtoPaymentMethodEnum.Cash
        ) {
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
      type: params.bookingType,
      detailId: room.id,
      start_date: params.startDate,
      end_date: params.endDate,
      start_time: params.startTime,
      end_time: params.endTime,
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
  if (isLoading) {
    return (
      <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
        <StatusBar style='dark' />
        <View className='flex-1 items-center justify-center'>
          <LoadingSpinner size='large' />
        </View>
      </Screen>
    );
  }

  // Show error state if room data fetch fails
  if (isError || !room) {
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
        {/* Room Summary */}
        <RoomBookingSummary
          room={room}
          checkInDate={params.startDate}
          checkInTime={params.startTime}
          checkOutDate={params.endDate}
          checkOutTime={params.endTime}
          bookingType={params.bookingType}
          price={formatCurrency(basePrice)}
        />

        {/* Guest Counter */}
        <View className='mt-4'>
          <GuestCounter
            guests={guests}
            maxAdults={room.max_adults || 2}
            maxChildren={room.max_children || 1}
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

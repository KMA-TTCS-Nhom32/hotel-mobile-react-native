/**
 * Payment Success Screen
 * Shows booking confirmation after successful payment
 */

import { AntDesign } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Screen } from '@/components/layout';
import { usePaymentTranslation } from '@/i18n/hooks';

export default function PaymentSuccessScreen() {
  const router = useRouter();
  const { t } = usePaymentTranslation();

  const params = useLocalSearchParams<{
    orderCode: string;
    paymentMethod?: string;
  }>();

  const getPaymentMethodLabel = (method?: string) => {
    if (!method) return t('payAtHotel');

    const methodMap: Record<string, string> = {
      CASH: t('payAtHotel'),
      BANKING: t('payAtHotel'),
      VIET_QR: t('vietqr'),
      MOMO: t('momo'),
    };

    return methodMap[method] || method;
  };

  const isCashPayment =
    params.paymentMethod === 'CASH' || params.paymentMethod === 'BANKING';

  return (
    <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
      <StatusBar style='dark' />

      <ScrollView
        className='flex-1'
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Icon */}
        <View className='mt-20 items-center justify-center px-4'>
          <View className='mb-6 h-24 w-24 items-center justify-center rounded-full bg-success-lighter'>
            <AntDesign name='check-circle' size={64} color='#10b981' />
          </View>

          {/* Success Title */}
          <Text className='mb-2 text-center text-2xl font-bold text-neutral-darkest'>
            {t('successTitle')}
          </Text>

          {/* Success Message */}
          <Text className='mb-8 text-center text-base text-neutral-main'>
            {t('successMessage')}
          </Text>
        </View>

        {/* Booking Details Card */}
        <View className='mx-4 mb-6 rounded-2xl border border-neutral-light bg-white p-6'>
          {/* Booking Code */}
          <View className='mb-6 items-center'>
            <Text className='mb-2 text-sm text-neutral-dark'>
              {t('bookingCode')}
            </Text>
            <View className='rounded-lg bg-primary-lighter px-6 py-3'>
              <Text className='text-2xl font-bold text-primary-main'>
                {params.orderCode}
              </Text>
            </View>
          </View>

          {/* Divider */}
          <View className='mb-6 h-px bg-neutral-light' />

          {/* Payment Method Info */}
          <View className='mb-4 flex-row items-center justify-between'>
            <Text className='text-sm text-neutral-dark'>
              {t('paymentMethod')}
            </Text>
            <Text className='text-base font-semibold text-neutral-darkest'>
              {getPaymentMethodLabel(params.paymentMethod)}
            </Text>
          </View>

          {/* Payment Status */}
          {isCashPayment && (
            <View className='rounded-lg bg-warning-lighter p-4'>
              <View className='flex-row items-start gap-2'>
                <AntDesign
                  name='exclamation-circle'
                  size={20}
                  color='#f59e0b'
                />
                <View className='flex-1'>
                  <Text className='mb-1 text-sm font-semibold text-warning-dark'>
                    {t('paymentPending')}
                  </Text>
                  <Text className='text-xs text-warning-dark'>
                    {t('payAtHotelNote')}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {!isCashPayment && (
            <View className='rounded-lg bg-success-lighter p-4'>
              <View className='flex-row items-start gap-2'>
                <AntDesign name='check-circle' size={20} color='#10b981' />
                <View className='flex-1'>
                  <Text className='mb-1 text-sm font-semibold text-success-dark'>
                    {t('paymentCompleted')}
                  </Text>
                  <Text className='text-xs text-success-dark'>
                    {t('paymentCompletedNote')}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>

        {/* Next Steps Card */}
        <View className='mx-4 mb-6 rounded-2xl border border-neutral-light bg-white p-6'>
          <Text className='mb-4 text-base font-semibold text-neutral-darkest'>
            {t('nextSteps')}
          </Text>

          <View className='gap-3'>
            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>1</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('step1')}
              </Text>
            </View>

            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>2</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {isCashPayment ? t('step2Cash') : t('step2Online')}
              </Text>
            </View>

            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>3</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('step3')}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom: Action Buttons */}
      <View className='border-t border-neutral-lighter bg-white px-4 py-4'>
        <Pressable
          onPress={() => router.push('/(tabs)/bookings')}
          className='mb-3 w-full rounded-xl bg-primary-main py-4 active:opacity-80'
        >
          <Text className='text-center text-base font-bold text-white'>
            {t('viewBookings')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)')}
          className='w-full rounded-xl border-2 border-neutral-light bg-white py-4 active:opacity-70'
        >
          <Text className='text-center text-base font-semibold text-neutral-darkest'>
            {t('backToHome')}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

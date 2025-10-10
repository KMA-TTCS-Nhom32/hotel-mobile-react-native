/**
 * QR Payment Confirmation Screen
 * Displays QR code for payment and monitors payment status via Socket.io
 */

import { CreateBookingOnlineDtoPaymentMethodEnum } from '@ahomevilla-hotel/node-sdk';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { io, Socket } from 'socket.io-client';

import { Screen } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';
import { TokenManager } from '@/config/api/private-request';
import { HEX_COLORS } from '@/config/colors';
import { ENV } from '@/config/env';
import { usePaymentTranslation } from '@/i18n/hooks';
import { formatCurrency } from '@/utils/format';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

export default function QRConfirmationScreen() {
  const router = useRouter();
  const { t } = usePaymentTranslation();
  const socketRef = useRef<Socket | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const params = useLocalSearchParams<{
    qrCode: string;
    accountName: string;
    accountNumber: string;
    bin: string;
    amount: string;
    orderCode: string;
  }>();

  // Handle copy to clipboard
  const handleCopyText = (_text: string) => {
    showSuccessToast(t('copied') || 'Copied to clipboard');
    // TODO: Implement actual clipboard copy using expo-clipboard
    // import * as Clipboard from 'expo-clipboard';
    // await Clipboard.setStringAsync(text);
  };

  // Socket.io connection and payment monitoring
  useEffect(() => {
    if (!params.orderCode) return;

    const initializeSocket = async () => {
      // Get access token from storage using TokenManager
      const token = await TokenManager.getAccessToken();
      if (!token) {
        showErrorToast(
          t('authRequired') || 'Authentication required. Please login again.'
        );
        return;
      }

      // Connect to Socket.io server
      const socketUrl = ENV.API_URL.replace('/api', '');
      const socket = io(socketUrl, {
        extraHeaders: {
          authorization: token,
        },
      });

      socketRef.current = socket;

      // Listen for connection
      socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
        // Join the order room to receive payment updates
        socket.emit('joinOrderRoom', params.orderCode);
      });

      // Listen for payment updates
      socket.on(
        'paymentUpdated',
        (data: { orderId: string; status: string }) => {
          console.log('Payment updated:', data);

          if (data.orderId === params.orderCode) {
            setIsPaymentProcessing(true);

            // Leave the order room
            socket.emit('leaveOrderRoom', params.orderCode);

            // Show success message
            showSuccessToast(
              t('paymentCompleted') || 'Payment completed successfully!'
            );

            // Navigate to success screen after 2 seconds
            setTimeout(() => {
              router.replace({
                pathname: '/payment/success',
                params: {
                  orderCode: params.orderCode,
                  paymentMethod: CreateBookingOnlineDtoPaymentMethodEnum.VietQr,
                },
              });
            }, 2000);
          }
        }
      );

      // Handle connection errors
      socket.on('connect_error', error => {
        console.error('Socket connection error:', error);
        showErrorToast(
          t('connectionError') ||
            'Connection error. Please check your internet.'
        );
      });

      socketRef.current = socket;
    };

    initializeSocket();

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leaveOrderRoom', params.orderCode);
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.orderCode]);

  // Handle cancel payment
  const handleCancel = () => {
    Alert.alert(
      t('cancelPayment') || 'Cancel Payment',
      t('cancelPaymentConfirm') ||
        'Are you sure you want to cancel this payment?',
      [
        {
          text: t('no') || 'No',
          style: 'cancel',
        },
        {
          text: t('yes') || 'Yes',
          style: 'destructive',
          onPress: () => {
            // Disconnect socket
            if (socketRef.current) {
              socketRef.current.emit('leaveOrderRoom', params.orderCode);
              socketRef.current.disconnect();
            }

            // Navigate back to payment screen
            router.back();
          },
        },
      ]
    );
  };

  return (
    <Screen backgroundColor='#f9fafb' safeArea={false} padding={false}>
      <StatusBar style='dark' />

      {/* Header */}
      <View className='mt-12 flex-row items-center justify-between border-b border-neutral-lighter bg-white px-4 py-4'>
        <Pressable onPress={handleCancel} className='p-2'>
          <AntDesign name='left' size={24} color={HEX_COLORS.text.primary} />
        </Pressable>
        <Text className='flex-1 text-center text-xl font-bold text-neutral-darkest'>
          {t('scanToPay') || 'Scan to Pay'}
        </Text>
        <View className='w-8' />
      </View>

      <ScrollView
        className='flex-1'
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
      >
        {/* Payment Processing Overlay */}
        {isPaymentProcessing && (
          <View className='mb-4 rounded-2xl border border-success-main bg-success-lighter p-4'>
            <View className='flex-row items-center gap-3'>
              <LoadingSpinner size='small' color={HEX_COLORS.success.main} />
              <View className='flex-1'>
                <Text className='text-sm font-semibold text-success-dark'>
                  {t('processingPayment') || 'Processing payment...'}
                </Text>
                <Text className='mt-1 text-xs text-success-dark'>
                  {t('redirecting') || 'Redirecting to success page...'}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Title */}
        <View className='mb-6 items-center'>
          <Text className='text-center text-2xl font-bold text-neutral-darkest'>
            {t('scanToPayTitle') || 'Scan QR Code to Pay'}
          </Text>
          <Text className='mt-2 text-center text-sm text-neutral-main'>
            {t('scanToPayDescription') ||
              'Use your banking app to scan this QR code'}
          </Text>
        </View>

        {/* QR Code Card */}
        <View className='mb-4 items-center rounded-2xl border border-neutral-light bg-white p-6'>
          {/* QR Code */}
          <View className='mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-200 via-purple-200 to-green-200 p-4'>
            <QRCode
              value={params.qrCode}
              size={240}
              backgroundColor='transparent'
              color='#25174E'
              quietZone={16}
            />
          </View>

          {/* Order Code */}
          <View className='mb-4 items-center'>
            <Text className='mb-1 text-xs text-neutral-dark'>
              {t('orderCode') || 'Order Code'}
            </Text>
            <Text className='text-lg font-bold text-primary-main'>
              {params.orderCode}
            </Text>
          </View>

          {/* Amount */}
          <View className='mb-2 items-center'>
            <Text className='mb-1 text-xs text-neutral-dark'>
              {t('amount') || 'Amount'}
            </Text>
            <Text className='text-2xl font-bold text-neutral-darkest'>
              {formatCurrency(parseFloat(params.amount))}
            </Text>
          </View>
        </View>

        {/* Bank Account Details */}
        <View className='mb-4 rounded-2xl border border-neutral-light bg-white p-4'>
          <Text className='mb-3 text-base font-semibold text-neutral-darkest'>
            {t('bankDetails') || 'Bank Account Details'}
          </Text>

          {/* Account Holder */}
          <View className='mb-3'>
            <Text className='mb-1 text-xs text-neutral-dark'>
              {t('accountHolder') || 'Account Holder'}
            </Text>
            <Text className='text-sm font-semibold text-neutral-darkest'>
              {params.accountName}
            </Text>
          </View>

          {/* Account Number */}
          <View className='mb-3 flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='mb-1 text-xs text-neutral-dark'>
                {t('accountNumber') || 'Account Number'}
              </Text>
              <Text className='text-sm font-semibold text-neutral-darkest'>
                {params.accountNumber}
              </Text>
            </View>
            <Pressable
              onPress={() => handleCopyText(params.accountNumber)}
              className='ml-2 rounded-lg bg-primary-lighter px-3 py-2 active:opacity-70'
            >
              <Text className='text-xs font-semibold text-primary-main'>
                {t('copy') || 'Copy'}
              </Text>
            </Pressable>
          </View>

          {/* Amount (for manual transfer) */}
          <View className='flex-row items-center justify-between'>
            <View className='flex-1'>
              <Text className='mb-1 text-xs text-neutral-dark'>
                {t('transferAmount') || 'Transfer Amount'}
              </Text>
              <Text className='text-sm font-semibold text-neutral-darkest'>
                {formatCurrency(parseFloat(params.amount))}
              </Text>
            </View>
            <Pressable
              onPress={() => handleCopyText(params.amount)}
              className='ml-2 rounded-lg bg-primary-lighter px-3 py-2 active:opacity-70'
            >
              <Text className='text-xs font-semibold text-primary-main'>
                {t('copy') || 'Copy'}
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Important Note */}
        <View className='mb-4 rounded-2xl border border-warning-main bg-warning-lighter p-4'>
          <View className='flex-row items-start gap-2'>
            <MaterialCommunityIcons
              name='alert-circle'
              size={20}
              color={HEX_COLORS.warning.dark}
            />
            <View className='flex-1'>
              <Text className='mb-2 text-sm font-semibold text-warning-dark'>
                {t('importantNote') || 'Important Note'}
              </Text>
              <Text className='text-xs leading-5 text-warning-dark'>
                {t('qrPaymentNote') ||
                  'Please ensure the transfer amount matches exactly. Your payment will be automatically confirmed once received.'}
              </Text>
            </View>
          </View>
        </View>

        {/* Instructions */}
        <View className='mb-4 rounded-2xl border border-neutral-light bg-white p-4'>
          <Text className='mb-3 text-base font-semibold text-neutral-darkest'>
            {t('howToPay') || 'How to Pay'}
          </Text>

          <View className='gap-3'>
            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>1</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('payStep1') || 'Open your banking app'}
              </Text>
            </View>

            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>2</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('payStep2') ||
                  'Scan the QR code or enter account details manually'}
              </Text>
            </View>

            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>3</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('payStep3') ||
                  'Confirm the payment amount and complete the transfer'}
              </Text>
            </View>

            <View className='flex-row items-start gap-3'>
              <View className='mt-1 h-6 w-6 items-center justify-center rounded-full bg-primary-lighter'>
                <Text className='text-xs font-bold text-primary-main'>4</Text>
              </View>
              <Text className='flex-1 text-sm text-neutral-dark'>
                {t('payStep4') ||
                  'Wait for automatic confirmation (usually within seconds)'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Fixed Bottom: Cancel Button */}
      <View className='absolute bottom-0 left-0 right-0 border-t border-neutral-lighter bg-white px-4 py-4'>
        <Pressable
          onPress={handleCancel}
          disabled={isPaymentProcessing}
          className='w-full rounded-xl border-2 border-neutral-main bg-white py-4 active:opacity-70'
          style={{ opacity: isPaymentProcessing ? 0.5 : 1 }}
        >
          <Text className='text-center text-base font-semibold text-neutral-darkest'>
            {t('cancelPayment') || 'Cancel Payment'}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

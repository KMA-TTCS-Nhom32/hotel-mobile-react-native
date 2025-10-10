/**
 * QR Payment Confirmation Screen
 * Displays QR code for payment and monitors payment status via Socket.io
 */

import { CreateBookingOnlineDtoPaymentMethodEnum } from '@ahomevilla-hotel/node-sdk';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as MediaLibrary from 'expo-media-library';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Text,
  View,
  Alert,
  Linking,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import ViewShot from 'react-native-view-shot';
import { io, Socket } from 'socket.io-client';

import { Screen } from '@/components/layout';
import { LoadingSpinner } from '@/components/ui';
import { TokenManager } from '@/config/api/private-request';
import { HEX_COLORS } from '@/config/colors';
import { ENV } from '@/config/env';
import { usePaymentTranslation } from '@/i18n/hooks';
import { formatCurrency } from '@/utils/format';
import { showErrorToast, showSuccessToast } from '@/utils/toast';

// Vietnamese Banking Apps URL Schemes
const BANKING_APPS = {
  MBBANK: {
    name: 'MB Bank',
    scheme: 'mbbank',
    qrScheme: 'mbbank://qr_payment',
    icon: '🏦',
  },
  VIETCOMBANK: {
    name: 'Vietcombank',
    scheme: 'vietcombank://',
    qrScheme: 'vietcombank://qr',
    icon: '🏦',
  },
  TECHCOMBANK: {
    name: 'Techcombank',
    scheme: 'tcb://',
    qrScheme: 'tcb://qr',
    icon: '🏦',
  },
  BIDV: {
    name: 'BIDV',
    scheme: 'bidv://',
    qrScheme: 'bidv://qr',
    icon: '🏦',
  },
  VPBANK: {
    name: 'VPBank',
    scheme: 'vpbank://',
    qrScheme: 'vpbank://qr',
    icon: '🏦',
  },
  ACB: {
    name: 'ACB',
    scheme: 'acb://',
    qrScheme: 'acb://qr',
    icon: '🏦',
  },
} as const;

export default function QRConfirmationScreen() {
  const router = useRouter();
  const { t } = usePaymentTranslation();
  const socketRef = useRef<Socket | null>(null);
  const qrRef = useRef<ViewShot>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(15 * 60); // 15 minutes in seconds
  const [isExpired, setIsExpired] = useState(false);

  const params = useLocalSearchParams<{
    qrCode: string;
    accountName: string;
    accountNumber: string;
    bin: string;
    amount: string;
    orderCode: string;
  }>();

  // Countdown timer - 15 minutes
  useEffect(() => {
    if (isPaymentProcessing || isExpired) return;

    const interval = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsExpired(true);
          clearInterval(interval);

          // Disconnect socket when expired
          if (socketRef.current) {
            socketRef.current.emit('leaveOrderRoom', params.orderCode);
            socketRef.current.disconnect();
          }

          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaymentProcessing, isExpired, params.orderCode]);

  // Format countdown display
  const formatTimeRemaining = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle copy to clipboard
  const handleCopyText = async (text: string) => {
    try {
      await Clipboard.setStringAsync(text);
      showSuccessToast(t('copied') || 'Copied to clipboard');
    } catch (error) {
      console.error('Copy error:', error);
      showErrorToast('Failed to copy');
    }
  };

  // Handle download QR code
  const handleDownloadQR = async () => {
    try {
      // Request media library permissions
      const { status } = await MediaLibrary.requestPermissionsAsync();

      if (status !== 'granted') {
        showErrorToast(
          t('permissionRequired') || 'Permission required to save image'
        );
        return;
      }

      // Capture the QR code view as an image
      if (qrRef.current) {
        const uri = await qrRef.current.capture?.();

        if (uri) {
          // Save to media library
          await MediaLibrary.createAssetAsync(uri);
          showSuccessToast(t('qrSaved') || 'QR code saved to gallery');
        }
      }
    } catch (error) {
      console.error('Download QR error:', error);
      showErrorToast(t('qrSaveError') || 'Failed to save QR code');
    }
  };

  // Handle opening banking app with deep link
  const handleOpenBankingApp = async (bankKey: keyof typeof BANKING_APPS) => {
    try {
      const bank = BANKING_APPS[bankKey];
      let url = `${bank.scheme}://`;

      if (bankKey === 'MBBANK' && params.qrCode) {
        const encodedQrData = encodeURIComponent(params.qrCode);
        url = `mbbank://qr-code/${encodedQrData}`;
      }

      // Check if the banking app is installed
      const canOpen = await Linking.canOpenURL(url);

      if (canOpen) {
        // Open the banking app
        // For VietQR compatible apps, they will automatically detect QR code scan mode
        await Linking.openURL(url);
        showSuccessToast(
          t('openBankApp') ||
            `Opening ${bank.name}. Please scan the QR code in the app.`
        );
      } else {
        // App not installed, show alert with options
        Alert.alert(
          t('appNotInstalled') || 'App Not Installed',
          t('appNotInstalledMessage') ||
            `${bank.name} app is not installed on your device. Please install it from the app store or use another banking app to scan the QR code.`,
          [
            {
              text: t('cancel') || 'Cancel',
              style: 'cancel',
            },
            {
              text: t('tryAnother') || 'Try Another App',
              onPress: () => {
                // User can manually select another bank
                showErrorToast(
                  t('selectAnotherBank') || 'Please select another bank'
                );
              },
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error opening banking app:', error);
      showErrorToast(
        t('openBankAppError') ||
          'Failed to open banking app. Please scan the QR code manually.'
      );
    }
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

      {/* Expired State */}
      {isExpired ? (
        <View className='flex-1 items-center justify-center p-6'>
          <View className='mb-6 h-20 w-20 items-center justify-center rounded-full bg-error-lighter'>
            <MaterialCommunityIcons
              name='clock-alert'
              size={40}
              color={HEX_COLORS.error.main}
            />
          </View>
          <Text className='mb-2 text-center text-2xl font-bold text-neutral-darkest'>
            {t('expired') || 'Payment link has expired'}
          </Text>
          <Text className='mb-6 text-center text-sm text-neutral-dark'>
            {t('expiredMessage') ||
              'This payment link has expired. Please create a new booking.'}
          </Text>
          <Pressable
            onPress={() => router.replace('/')}
            className='rounded-xl bg-primary-main px-8 py-4 active:opacity-70'
          >
            <Text className='text-center text-base font-semibold text-white'>
              {t('returnToHome') || 'Return to Home'}
            </Text>
          </Pressable>
        </View>
      ) : (
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

          {/* Countdown Timer */}
          <View className='mb-4 rounded-2xl border border-warning-main bg-warning-lighter p-4'>
            <View className='flex-row items-center justify-between'>
              <View className='flex-row items-center gap-2'>
                <MaterialCommunityIcons
                  name='clock-outline'
                  size={20}
                  color={HEX_COLORS.warning.dark}
                />
                <Text className='text-sm font-semibold text-warning-dark'>
                  {t('expiresIn') || 'Expires in'}
                </Text>
              </View>
              <Text className='text-lg font-bold text-warning-dark'>
                {formatTimeRemaining(timeRemaining)}
              </Text>
            </View>
          </View>

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
            {/* QR Code with ViewShot wrapper for download */}
            <ViewShot ref={qrRef} options={{ format: 'png', quality: 1.0 }}>
              <View className='mb-4 overflow-hidden rounded-2xl bg-gradient-to-br from-green-200 via-purple-200 to-green-200 p-4'>
                <QRCode
                  value={params.qrCode}
                  size={240}
                  backgroundColor='transparent'
                  color='#25174E'
                  quietZone={16}
                />
              </View>
            </ViewShot>

            {/* Download QR Button */}
            <Pressable
              onPress={handleDownloadQR}
              className='mb-4 flex-row items-center gap-2 rounded-xl bg-primary-main px-6 py-3 active:opacity-70'
            >
              <MaterialCommunityIcons
                name='download'
                size={20}
                color='#ffffff'
              />
              <Text className='text-sm font-semibold text-white'>
                {t('downloadQR') || 'Download QR Code'}
              </Text>
            </Pressable>

            {/* Divider with text */}
            <View className='mb-4 w-full flex-row items-center gap-3'>
              <View className='h-px flex-1 bg-neutral-light' />
              <Text className='text-xs font-medium text-neutral-main'>
                {t('orOpenInApp') || 'Or open in your banking app'}
              </Text>
              <View className='h-px flex-1 bg-neutral-light' />
            </View>

            {/* Banking App Buttons */}
            <View className='w-full gap-2'>
              {/* MBBank Button */}
              <Pressable
                onPress={() => handleOpenBankingApp('MBBANK')}
                className='flex-row items-center justify-center gap-2 rounded-xl border-2 border-blue-500 bg-blue-50 px-4 py-3 active:opacity-70'
              >
                <Text className='text-2xl'>🏦</Text>
                <Text className='text-sm font-semibold text-blue-700'>
                  {t('openMBBank') || 'Open in MBBank'}
                </Text>
                <MaterialCommunityIcons
                  name='open-in-new'
                  size={16}
                  color='#1d4ed8'
                />
              </Pressable>

              {/* Other Banks - Collapsed view */}
              <View className='flex-row gap-2'>
                <Pressable
                  onPress={() => handleOpenBankingApp('VIETCOMBANK')}
                  className='flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-neutral-light bg-white px-3 py-2 active:opacity-70'
                >
                  <Text className='text-lg'>🏦</Text>
                  <Text className='text-xs font-medium text-neutral-darkest'>
                    VCB
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleOpenBankingApp('TECHCOMBANK')}
                  className='flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-neutral-light bg-white px-3 py-2 active:opacity-70'
                >
                  <Text className='text-lg'>🏦</Text>
                  <Text className='text-xs font-medium text-neutral-darkest'>
                    TCB
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleOpenBankingApp('ACB')}
                  className='flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-neutral-light bg-white px-3 py-2 active:opacity-70'
                >
                  <Text className='text-lg'>🏦</Text>
                  <Text className='text-xs font-medium text-neutral-darkest'>
                    ACB
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => handleOpenBankingApp('VPBANK')}
                  className='flex-1 flex-row items-center justify-center gap-1 rounded-xl border border-neutral-light bg-white px-3 py-2 active:opacity-70'
                >
                  <Text className='text-lg'>🏦</Text>
                  <Text className='text-xs font-medium text-neutral-darkest'>
                    VPB
                  </Text>
                </Pressable>
              </View>
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
      )}

      {/* Fixed Bottom: Cancel Button */}
      {!isExpired && (
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
      )}
    </Screen>
  );
}

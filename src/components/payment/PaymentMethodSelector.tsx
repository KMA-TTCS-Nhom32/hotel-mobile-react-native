/**
 * Payment Method Selector
 * Allows selecting payment method category and specific method
 */

import {
  AntDesign,
  Ionicons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import { Image } from 'expo-image';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import { PAYMENT_OPTIONS } from '@/constants/payment';
import { usePaymentTranslation } from '@/i18n/hooks';
import type {
  PaymentCategory,
  PaymentMethod,
  PaymentOption,
} from '@/types/payment';

interface PaymentMethodSelectorProps {
  selectedMethod?: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChange,
}) => {
  const { t } = usePaymentTranslation();
  const [selectedCategory, setSelectedCategory] =
    React.useState<PaymentCategory>('PAY_AT_HOTEL');

  const payAtHotelOptions = PAYMENT_OPTIONS.filter(
    option => option.category === 'PAY_AT_HOTEL'
  );
  const onlineCheckoutOptions = PAYMENT_OPTIONS.filter(
    option => option.category === 'ONLINE_CHECKOUT'
  );

  const handleCategoryChange = (category: PaymentCategory) => {
    setSelectedCategory(category);
    // Auto-select first method in category
    const firstMethod =
      category === 'PAY_AT_HOTEL'
        ? payAtHotelOptions[0]?.method
        : onlineCheckoutOptions[0]?.method;
    if (firstMethod) {
      onChange(firstMethod);
    }
  };

  const renderPaymentOption = (option: PaymentOption) => {
    const isSelected = selectedMethod === option.method;

    return (
      <Pressable
        key={option.id}
        onPress={() => onChange(option.method)}
        className='flex-row items-center gap-3 rounded-xl border border-neutral-light bg-white p-4 active:opacity-70'
        style={
          isSelected && {
            borderColor: '#f97316',
            backgroundColor: '#fff7ed',
          }
        }
      >
        {/* Payment Icon/Logo */}
        {option.logo ? (
          <View className='h-12 w-12 overflow-hidden rounded-lg border border-neutral-lighter bg-white p-1'>
            <Image
              source={option.logo}
              style={{ width: '100%', height: '100%' }}
              contentFit='contain'
            />
          </View>
        ) : (
          <View className='h-12 w-12 items-center justify-center rounded-lg bg-primary-lighter'>
            <MaterialCommunityIcons
              name={option.method === 'CASH' ? 'cash' : 'bank'}
              size={24}
              color='#f97316'
            />
          </View>
        )}

        {/* Payment Info */}
        <View className='flex-1'>
          <Text className='text-base font-semibold text-neutral-darkest'>
            {t(option.label)}
          </Text>
          {option.description && (
            <Text className='mt-1 text-xs text-neutral-main'>
              {t(option.description)}
            </Text>
          )}
        </View>

        {/* Selection Indicator */}
        {isSelected && (
          <View className='h-6 w-6 items-center justify-center rounded-full bg-primary-main'>
            <AntDesign name='check' size={14} color='white' />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View className='rounded-2xl border border-neutral-light bg-white p-4'>
      <Text className='mb-4 text-base font-semibold text-neutral-darkest'>
        {t('paymentMethod')}
      </Text>

      {/* Category Tabs */}
      <View className='mb-4 flex-row gap-2'>
        <Pressable
          onPress={() => handleCategoryChange('PAY_AT_HOTEL')}
          className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border py-3'
          style={
            selectedCategory === 'PAY_AT_HOTEL'
              ? {
                  backgroundColor: '#f97316',
                  borderColor: '#f97316',
                }
              : {
                  backgroundColor: '#fff',
                  borderColor: '#e5e7eb',
                }
          }
        >
          <Ionicons
            name='business-outline'
            size={18}
            color={selectedCategory === 'PAY_AT_HOTEL' ? '#fff' : '#6b7280'}
          />
          <Text
            className='text-wrap text-sm font-semibold'
            style={{
              color: selectedCategory === 'PAY_AT_HOTEL' ? '#fff' : '#6b7280',
            }}
          >
            {t('payAtHotel')}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => handleCategoryChange('ONLINE_CHECKOUT')}
          className='flex-1 flex-row items-center justify-center gap-2 rounded-lg border py-3'
          style={
            selectedCategory === 'ONLINE_CHECKOUT'
              ? {
                  backgroundColor: '#f97316',
                  borderColor: '#f97316',
                }
              : {
                  backgroundColor: '#fff',
                  borderColor: '#e5e7eb',
                }
          }
        >
          <Ionicons
            name='card-outline'
            size={18}
            color={selectedCategory === 'ONLINE_CHECKOUT' ? '#fff' : '#6b7280'}
          />
          <Text
            className='text-sm font-semibold'
            style={{
              color:
                selectedCategory === 'ONLINE_CHECKOUT' ? '#fff' : '#6b7280',
            }}
          >
            {t('onlineCheckout')}
          </Text>
        </Pressable>
      </View>

      {/* Payment Options */}
      <View className='gap-3'>
        {selectedCategory === 'PAY_AT_HOTEL'
          ? payAtHotelOptions.map(renderPaymentOption)
          : onlineCheckoutOptions.map(renderPaymentOption)}
      </View>
    </View>
  );
};

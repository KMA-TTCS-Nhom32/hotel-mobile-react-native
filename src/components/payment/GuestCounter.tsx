/**
 * Guest Counter Component
 * Allows selecting number of adults, children, and infants
 */

import { AntDesign } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text, View } from 'react-native';

import type { GuestCount } from '@/types/payment';

interface GuestCounterProps {
  guests: GuestCount;
  maxAdults: number;
  maxChildren: number;
  onChange: (guests: GuestCount) => void;
}

export const GuestCounter: React.FC<GuestCounterProps> = ({
  guests,
  maxAdults,
  maxChildren,
  onChange,
}) => {
  const handleIncrement = (type: keyof GuestCount) => {
    const newGuests = { ...guests };

    if (type === 'adults' && guests.adults < maxAdults) {
      newGuests.adults += 1;
    } else if (
      type === 'children' &&
      guests.children < maxChildren &&
      maxChildren > 0
    ) {
      newGuests.children += 1;
    } else if (type === 'infants') {
      newGuests.infants += 1;
    }

    onChange(newGuests);
  };

  const handleDecrement = (type: keyof GuestCount) => {
    const newGuests = { ...guests };

    if (type === 'adults' && guests.adults > 1) {
      // At least 1 adult required
      newGuests.adults -= 1;
    } else if (type === 'children' && guests.children > 0) {
      newGuests.children -= 1;
    } else if (type === 'infants' && guests.infants > 0) {
      newGuests.infants -= 1;
    }

    onChange(newGuests);
  };

  const renderCounter = (
    label: string,
    type: keyof GuestCount,
    count: number,
    max?: number,
    min: number = 0
  ) => (
    <View className='flex-row items-center justify-between py-3'>
      <Text className='text-sm font-medium text-neutral-darkest'>{label}</Text>
      <View className='flex-row items-center gap-4'>
        <Pressable
          onPress={() => handleDecrement(type)}
          disabled={count <= min}
          className='h-8 w-8 items-center justify-center rounded-full border border-neutral-light active:opacity-50 disabled:opacity-30'
        >
          <AntDesign name='minus' size={16} color='#6B7280' />
        </Pressable>

        <Text className='w-8 text-center text-base font-semibold text-neutral-darkest'>
          {count}
        </Text>

        <Pressable
          onPress={() => handleIncrement(type)}
          disabled={max !== undefined && count >= max}
          className='h-8 w-8 items-center justify-center rounded-full bg-primary-main active:opacity-80 disabled:opacity-30'
        >
          <AntDesign name='plus' size={16} color='white' />
        </Pressable>
      </View>
    </View>
  );

  return (
    <View className='rounded-2xl border border-neutral-light bg-white p-4'>
      <Text className='mb-2 text-base font-semibold text-neutral-darkest'>
        Number of Guests
      </Text>

      {renderCounter('Adults', 'adults', guests.adults, maxAdults, 1)}
      <View className='h-px bg-neutral-lighter' />

      {renderCounter('Children', 'children', guests.children, maxChildren)}
      <View className='h-px bg-neutral-lighter' />

      {renderCounter('Infants', 'infants', guests.infants)}

      <View className='mt-2 rounded-lg bg-primary-lighter p-2'>
        <Text className='text-xs text-neutral-dark'>
          Total guests: {guests.adults + guests.children + guests.infants}
        </Text>
      </View>
    </View>
  );
};

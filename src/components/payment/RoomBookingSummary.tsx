/**
 * Room Booking Summary Card
 * Displays selected room details for booking confirmation
 */

import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { Image } from 'expo-image';
import React from 'react';
import { Text, View } from 'react-native';

interface RoomBookingSummaryProps {
  room: RoomDetail;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  bookingType: 'HOURLY' | 'NIGHTLY' | 'DAILY';
  price: string;
}

export const RoomBookingSummary: React.FC<RoomBookingSummaryProps> = ({
  room,
  checkInDate,
  checkInTime,
  checkOutDate,
  checkOutTime,
  bookingType,
  price,
}) => {
  return (
    <View className='rounded-2xl border border-neutral-light bg-white p-4'>
      {/* Room Info Row */}
      <View className='flex-row gap-3'>
        {/* Thumbnail */}
        <View className='h-20 w-20 overflow-hidden rounded-lg'>
          <Image
            source={{ uri: room.thumbnail.url }}
            style={{ width: '100%', height: '100%' }}
            contentFit='cover'
          />
        </View>

        {/* Room Details */}
        <View className='flex-1'>
          <Text className='text-base font-semibold text-neutral-darkest'>
            {room.name}
          </Text>
          <Text className='mt-1 text-xs text-neutral-main'>
            {room.room_type} • {room.bed_type}
          </Text>
          <Text className='mt-1 text-xs text-neutral-main'>
            Max: {room.max_adults} adults, {room.max_children} children
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className='my-3 h-px bg-neutral-light' />

      {/* Booking Details */}
      <View className='gap-2'>
        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>Booking Type</Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {bookingType === 'HOURLY'
              ? 'Hourly'
              : bookingType === 'NIGHTLY'
                ? 'Nightly'
                : 'Daily'}
          </Text>
        </View>

        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>Check-in</Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {checkInDate} • {checkInTime}
          </Text>
        </View>

        <View className='flex-row justify-between'>
          <Text className='text-sm text-neutral-dark'>Check-out</Text>
          <Text className='text-sm font-medium text-neutral-darkest'>
            {checkOutDate} • {checkOutTime}
          </Text>
        </View>
      </View>

      {/* Divider */}
      <View className='my-3 h-px bg-neutral-light' />

      {/* Price */}
      <View className='flex-row items-center justify-between'>
        <Text className='text-sm font-medium text-neutral-dark'>
          Room Price
        </Text>
        <Text className='text-lg font-bold text-primary-main'>{price}</Text>
      </View>
    </View>
  );
};

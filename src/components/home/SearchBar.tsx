import Ionicons from '@expo/vector-icons/Ionicons';
import React from 'react';
import { Pressable, Text, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  onPress?: () => void;
  onDatesPress?: () => void;
  onGuestsPress?: () => void;
  isSticky?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onPress,
  onDatesPress,
  onGuestsPress,
  isSticky = false,
}) => {
  return (
    <View
      className={`${
        isSticky
          ? 'border-b border-neutral-lighter bg-background-secondary shadow-sm'
          : 'bg-primary-main'
      } px-4 py-3`}
    >
      <Pressable
        onPress={onPress}
        className='flex-row items-center gap-3 rounded-lg border border-neutral-lighter bg-white px-4 py-3'
      >
        <Ionicons name='search' size={20} color='#737373' />
        <View className='flex-1'>
          <Text className='text-sm font-medium text-neutral-darkest'>
            Where are you going?
          </Text>
          <Text className='text-xs text-neutral-dark'>
            Search destinations, hotels...
          </Text>
        </View>
      </Pressable>

      {!isSticky && (
        <View className='mt-3 flex-row items-center gap-2'>
          <TouchableOpacity
            onPress={onDatesPress}
            className='flex-1 flex-row items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-2'
          >
            <Ionicons name='calendar-outline' size={16} color='white' />
            <Text className='flex-1 text-sm text-white'>
              Check-in · Check-out
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onGuestsPress}
            className='flex-row items-center gap-2 rounded-lg border border-white/30 bg-white/20 px-3 py-2'
          >
            <Ionicons name='people-outline' size={16} color='white' />
            <Text className='text-sm text-white'>Guests</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

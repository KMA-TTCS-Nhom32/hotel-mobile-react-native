import type { Branch } from '@ahomevilla-hotel/node-sdk';
import { Image } from 'expo-image';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface BranchCardProps {
  branch: Branch;
  onPress?: (branch: Branch) => void;
  width?: number;
  height?: number;
}

/**
 * Get display data from branch with translation fallback
 * Backend returns translations array with only the requested language (from accept-language header)
 */
const getBranchDisplayData = (branch: Branch) => {
  const translation = branch.translations?.[0]; // Backend only returns matching language

  return {
    name: translation?.name || branch.name,
    description: translation?.description || branch.description,
    address: translation?.address || branch.address,
    nearBy: translation?.nearBy || [],
  };
};

/**
 * Branch card component
 * Displays branch thumbnail, name, address, and rating
 */
export const BranchCard: React.FC<BranchCardProps> = ({
  branch,
  onPress,
  width,
  height = 200,
}) => {
  const { name, address } = getBranchDisplayData(branch);

  return (
    <TouchableOpacity
      onPress={() => onPress?.(branch)}
      className='overflow-hidden rounded-xl bg-white shadow-md'
      style={width ? { width } : undefined}
      activeOpacity={0.9}
    >
      <Image
        source={{ uri: branch.thumbnail.url }}
        style={{ width: '100%', height }}
        contentFit='cover'
        transition={300}
      />

      <View className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
        <Text className='text-lg font-bold text-white' numberOfLines={1}>
          {name}
        </Text>
        <Text className='mt-1 text-sm text-white/90' numberOfLines={1}>
          {address}
        </Text>

        {branch.rating && (
          <View className='mt-2 flex-row items-center gap-1'>
            <Text className='text-sm font-medium text-yellow-400'>★</Text>
            <Text className='text-sm font-medium text-white'>
              {branch.rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

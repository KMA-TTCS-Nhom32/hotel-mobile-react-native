import type { Amenity } from '@ahomevilla-hotel/node-sdk';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useLanguage } from '@/i18n/hooks';

interface AmenityBadgeProps {
  amenity: Amenity;
}

/**
 * Reusable amenity badge component with icon and name
 * Displays amenity with icon (if available) in a styled badge
 */
export function AmenityBadge({ amenity }: AmenityBadgeProps) {
  const { currentLanguage } = useLanguage();

  const displayName = useMemo(() => {
    const translation = amenity.translations?.find(
      tr => tr.language === currentLanguage.toUpperCase()
    );
    return translation?.name || amenity.name;
  }, [amenity, currentLanguage]);

  return (
    <View className='flex-row items-center gap-2 rounded-lg border border-neutral-light bg-background-secondary px-3 py-2'>
      {amenity.icon?.url && (
        <Image
          source={{ uri: amenity.icon.url }}
          style={{ width: 20, height: 20 }}
          contentFit='contain'
        />
      )}
      <Text className='text-sm text-text-secondary'>{displayName}</Text>
    </View>
  );
}

interface AmenitiesBadgeListProps {
  amenities: Amenity[];
  maxItems?: number;
}

/**
 * List of amenity badges in a flex-wrap layout
 */
export function AmenitiesBadgeList({
  amenities,
  maxItems,
}: AmenitiesBadgeListProps) {
  const displayedAmenities = maxItems
    ? amenities.slice(0, maxItems)
    : amenities;

  return (
    <View className='flex-row flex-wrap gap-3'>
      {displayedAmenities.map(amenity => (
        <AmenityBadge key={amenity.id} amenity={amenity} />
      ))}
    </View>
  );
}

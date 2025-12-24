import type { NearBy } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { View, Text } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';

interface NearbyPlacesSectionProps {
  nearBy: NearBy[];
}

/**
 * Nearby places section with distances
 */
export function NearbyPlacesSection({ nearBy }: NearbyPlacesSectionProps) {
  const { t } = useCommonTranslation();

  return (
    <View className='border-t border-neutral-light px-4 py-6'>
      <Text className='mb-4 text-xl font-bold text-text-primary'>
        {t('branchDetail.nearbyPlaces')}
      </Text>

      {nearBy.length > 0 ? (
        <View className='flex flex-wrap gap-3'>
          {nearBy.map(place => (
            <View
              key={`${place.name}-${place.distance}`}
              className='flex-row items-start gap-2'
            >
              <View className='mt-3'>
                <MaterialIcons
                  name='place'
                  size={24}
                  color={HEX_COLORS.primary.main}
                />
              </View>
              <View className='flex flex-col'>
                <Text className='mb-1 text-lg font-medium text-text-primary'>
                  {place.name}
                </Text>
                <Text className='text-base text-text-tertiary'>
                  {place.distance}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text className='text-sm text-text-tertiary'>
          {t('branchDetail.noNearbyPlaces')}
        </Text>
      )}
    </View>
  );
}

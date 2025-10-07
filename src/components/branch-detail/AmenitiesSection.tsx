import type { Amenity } from '@ahomevilla-hotel/node-sdk';
import { Text, View } from 'react-native';

import { AmenitiesBadgeList } from '@/components/ui';
import { useCommonTranslation } from '@/i18n/hooks';

interface AmenitiesSectionProps {
  amenities: Amenity[];
}

/**
 * Categorized amenities section with icons
 */
export function AmenitiesSection({ amenities }: AmenitiesSectionProps) {
  const { t } = useCommonTranslation();

  // Group amenities by type
  const groupedAmenities = {
    ROOM: amenities.filter(a => a.type === 'ROOM'),
    PROPERTY: amenities.filter(a => a.type === 'PROPERTY'),
    SERVICE: amenities.filter(a => a.type === 'SERVICE'),
  };

  const renderAmenityGroup = (
    type: 'ROOM' | 'PROPERTY' | 'SERVICE',
    items: Amenity[]
  ) => {
    if (items.length === 0) return null;

    const titleKey =
      type === 'ROOM'
        ? 'branchDetail.roomAmenities'
        : type === 'PROPERTY'
          ? 'branchDetail.propertyAmenities'
          : 'branchDetail.services';

    return (
      <View className='mb-6' key={type}>
        <Text className='mb-3 text-base font-semibold text-text-primary'>
          {t(titleKey)}
        </Text>
        <AmenitiesBadgeList amenities={items} />
      </View>
    );
  };

  return (
    <View className='border-t border-neutral-light px-4 py-6'>
      <Text className='mb-4 text-xl font-bold text-text-primary'>
        {t('branchDetail.amenities')}
      </Text>

      {Object.entries(groupedAmenities).some(
        ([_, items]) => items.length > 0
      ) ? (
        <>
          {renderAmenityGroup('PROPERTY', groupedAmenities.PROPERTY)}
          {renderAmenityGroup('ROOM', groupedAmenities.ROOM)}
          {renderAmenityGroup('SERVICE', groupedAmenities.SERVICE)}
        </>
      ) : (
        <Text className='text-sm text-text-tertiary'>
          {t('branchDetail.noAmenitiesAvailable')}
        </Text>
      )}
    </View>
  );
}

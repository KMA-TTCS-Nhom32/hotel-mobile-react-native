import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { AmenitiesBadgeList } from '@/components/ui';
import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';

interface RoomInfoCardProps {
  room: RoomDetail;
}

/**
 * Room information card displaying room type, bed type, area, capacity, and description
 */
export function RoomInfoCard({ room }: RoomInfoCardProps) {
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();

  const getRoomDisplayData = () => {
    const translation = room.translations?.find(
      tr => tr.language === currentLanguage.toUpperCase()
    );
    return {
      name: translation?.name || room.name,
      description: translation?.description || room.description,
    };
  };

  const displayData = getRoomDisplayData();

  return (
    <View className='border-b border-neutral-light px-4 py-6'>
      {/* Room Name and Availability */}
      <View className='mb-4 flex-row items-start justify-between'>
        <View className='flex-1 pr-2'>
          <Text className='mb-2 text-2xl font-bold text-text-primary'>
            {displayData.name}
          </Text>
          <View className='flex-row items-center gap-2'>
            <Text className='text-sm text-text-secondary'>
              {t(`branchDetail.roomType.${room.room_type}`)} •{' '}
              {t(`branchDetail.bedType.${room.bed_type}`)}
            </Text>
          </View>
        </View>

        {/* Availability Badge */}
        <View
          className={`rounded-full px-3 py-1.5 ${
            room.is_available ? 'bg-success-lighter' : 'bg-neutral-lighter'
          }`}
        >
          <Text
            className={`text-xs font-medium ${
              room.is_available
                ? 'text-success-darkest'
                : 'text-neutral-darkest'
            }`}
          >
            {room.is_available
              ? t('branchDetail.available')
              : t('branchDetail.notAvailable')}
          </Text>
        </View>
      </View>

      {/* Room Details Grid */}
      <View className='mb-4 flex-row flex-wrap gap-4'>
        {/* Area */}
        <View className='flex-row items-center gap-2'>
          <View className='h-10 w-10 items-center justify-center rounded-full bg-primary-lighter'>
            <MaterialIcons
              name='square-foot'
              size={20}
              color={HEX_COLORS.primary.main}
            />
          </View>
          <View>
            <Text className='text-xs text-text-tertiary'>
              {t('branchDetail.roomDetails')}
            </Text>
            <Text className='font-semibold text-text-primary'>
              {room.area} {t('branchDetail.sqm')}
            </Text>
          </View>
        </View>

        {/* Capacity */}
        <View className='flex-row items-center gap-2'>
          <View className='h-10 w-10 items-center justify-center rounded-full bg-primary-lighter'>
            <MaterialIcons
              name='people'
              size={20}
              color={HEX_COLORS.primary.main}
            />
          </View>
          <View>
            <Text className='text-xs text-text-tertiary'>
              {t('roomDetail.capacity')}
            </Text>
            <Text className='font-semibold text-text-primary'>
              {room.max_adults} {t('branchDetail.adults')}
              {room.max_children > 0 &&
                `, ${room.max_children} ${t('branchDetail.children')}`}
            </Text>
          </View>
        </View>

        {/* Quantity Available */}
        {room.availableRoomsCount && room.availableRoomsCount > 0 && (
          <View className='flex-row items-center gap-2'>
            <View className='h-10 w-10 items-center justify-center rounded-full bg-primary-lighter'>
              <MaterialIcons
                name='meeting-room'
                size={20}
                color={HEX_COLORS.primary.main}
              />
            </View>
            <View>
              <Text className='text-xs text-text-tertiary'>
                {t('branchDetail.available')}
              </Text>
              <Text className='font-semibold text-text-primary'>
                {/* {room.quantity}{' '} */}
                {t('branchDetail.roomsAvailable', {
                  count: room.availableRoomsCount,
                })}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Description */}
      {displayData.description && (
        <View className='mb-4'>
          <Text className='mb-2 text-base font-semibold text-text-primary'>
            {t('roomDetail.roomInformation')}
          </Text>
          <Text className='leading-6 text-text-secondary'>
            {displayData.description}
          </Text>
        </View>
      )}

      {/* Room Amenities */}
      {room.amenities && room.amenities.length > 0 && (
        <View>
          <Text className='mb-3 text-base font-semibold text-text-primary'>
            {t('roomDetail.roomAmenities')}
          </Text>
          <AmenitiesBadgeList amenities={room.amenities} />
        </View>
      )}
    </View>
  );
}

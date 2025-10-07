import type { Amenity, RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter, type Href } from 'expo-router';
import { Dimensions, Image, Pressable, Text, View } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { ROUTES } from '@/config/routes';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface RoomsSectionProps {
  rooms: RoomDetail[];
}

/**
 * Available rooms section with pricing and details
 */
export function RoomsSection({ rooms }: RoomsSectionProps) {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();

  const getRoomDisplayData = (room: RoomDetail) => {
    const translation = room.translations?.find(
      tr => tr.language === currentLanguage.toUpperCase()
    );
    return {
      name: translation?.name || room.name,
      description: translation?.description || room.description,
    };
  };

  const getAmenityDisplayName = (amenity: Amenity) => {
    const translation = amenity.translations?.find(
      tr => tr.language === currentLanguage.toUpperCase()
    );
    return translation?.name || amenity.name;
  };

  const getLowestPrice = (room: RoomDetail) => {
    const prices = [
      room.special_price_per_hour || room.base_price_per_hour,
      room.special_price_per_night || room.base_price_per_night,
      room.special_price_per_day || room.base_price_per_day,
    ].filter(Boolean);

    return Math.min(...prices.map(Number));
  };

  const handleRoomPress = (room: RoomDetail) => {
    router.push(ROUTES.ROOMS.DETAIL(room.id) as Href);
  };

  return (
    <View className='border-t border-neutral-light px-4 py-6'>
      <View className='mb-4 flex-row items-center justify-between'>
        <Text className='text-xl font-bold text-text-primary'>
          {t('branchDetail.availableRooms')}
        </Text>
        <Text className='text-sm text-primary-main'>
          {t('branchDetail.viewAllRooms')}
        </Text>
      </View>

      {rooms.length > 0 ? (
        <View className='gap-4'>
          {rooms.slice(0, 3).map(room => {
            const displayData = getRoomDisplayData(room);
            const lowestPrice = getLowestPrice(room);

            return (
              <Pressable
                key={room.id}
                onPress={() => handleRoomPress(room)}
                className='overflow-hidden rounded-xl border border-neutral-light bg-background-primary active:opacity-80'
                style={{ width: CARD_WIDTH }}
              >
                {/* Room Image */}
                <View className='relative h-48 w-full'>
                  <Image
                    source={{
                      uri: room.thumbnail?.url || room.images[0]?.url,
                    }}
                    className='h-full w-full'
                    resizeMode='cover'
                  />
                  {/* Availability Badge */}
                  <View
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 ${
                      room.is_available
                        ? 'bg-success-lighter'
                        : 'bg-neutral-lighter'
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

                {/* Room Info */}
                <View className='p-4'>
                  {/* Room Name and Type */}
                  <View className='mb-2 flex-row items-start justify-between'>
                    <View className='flex-1 pr-2'>
                      <Text className='mb-1 text-lg font-semibold text-text-primary'>
                        {displayData.name}
                      </Text>
                      <Text className='text-xs text-text-tertiary'>
                        {t(`branchDetail.roomType.${room.room_type}`)} •{' '}
                        {t(`branchDetail.bedType.${room.bed_type}`)}
                      </Text>
                    </View>
                    <View className='items-end'>
                      <Text className='text-xs text-text-tertiary'>
                        {t('branchDetail.from')}
                      </Text>
                      <Text className='text-xl font-bold text-primary-main'>
                        {lowestPrice.toLocaleString()}đ
                      </Text>
                    </View>
                  </View>

                  {/* Room Details */}
                  <View className='mb-3 flex-row flex-wrap gap-3'>
                    <View className='flex-row items-center gap-1'>
                      <MaterialIcons
                        name='square-foot'
                        size={16}
                        color={HEX_COLORS.text.secondary}
                      />
                      <Text className='text-xs text-text-secondary'>
                        {room.area} {t('branchDetail.sqm')}
                      </Text>
                    </View>
                    <View className='flex-row items-center gap-1'>
                      <MaterialIcons
                        name='people'
                        size={16}
                        color={HEX_COLORS.text.secondary}
                      />
                      <Text className='text-xs text-text-secondary'>
                        {room.max_adults} {t('branchDetail.adults')}
                        {room.max_children > 0 &&
                          `, ${room.max_children} ${t('branchDetail.children')}`}
                      </Text>
                    </View>
                  </View>

                  {/* Amenities */}
                  {room.amenities && room.amenities.length > 0 && (
                    <View className='flex-row flex-wrap gap-2'>
                      {room.amenities.slice(0, 3).map(amenity => (
                        <View
                          key={amenity.id}
                          className='flex-row items-center gap-1.5 rounded-md bg-background-secondary px-2 py-1'
                        >
                          {amenity.icon?.url && (
                            <ExpoImage
                              source={{ uri: amenity.icon.url }}
                              style={{ width: 14, height: 14 }}
                              contentFit='contain'
                            />
                          )}
                          <Text className='text-xs text-text-tertiary'>
                            {getAmenityDisplayName(amenity)}
                          </Text>
                        </View>
                      ))}
                      {room.amenities.length > 3 && (
                        <View className='rounded-md bg-background-secondary px-2 py-1'>
                          <Text className='text-xs text-text-tertiary'>
                            +{room.amenities.length - 3}
                          </Text>
                        </View>
                      )}
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <Text className='text-sm text-text-tertiary'>
          {t('branchDetail.noRoomsAvailable')}
        </Text>
      )}
    </View>
  );
}

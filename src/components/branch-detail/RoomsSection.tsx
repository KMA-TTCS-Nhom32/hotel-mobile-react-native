import type { Amenity, RoomDetail } from '@ahomevilla-hotel/node-sdk';
import { FilterRoomDetailDtoBookingTypeEnum } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';

import { Button } from '@/components/ui/Button';
import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation, useLanguage } from '@/i18n/hooks';
import { roomService } from '@/services/rooms/roomService';
import { useBookingStore } from '@/store/bookingStore';
import type { BookingFilters } from '@/types/booking';
import { formatDateForAPI } from '@/utils/format';

import { BookingFilterBar } from './BookingFilterBar';
import { BookingFilterModal } from './BookingFilterModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;

interface RoomsSectionProps {
  branchId: string;
}

/**
 * Available rooms section with dynamic filtering
 * Fetches rooms based on booking options (type, dates, guests)
 */
export function RoomsSection({ branchId }: RoomsSectionProps) {
  const router = useRouter();
  const { t } = useCommonTranslation();
  const { currentLanguage } = useLanguage();

  // Use booking store
  const { filters, setFilters, setSelectedRoom, setBranchId } =
    useBookingStore();
  const [showFilterModal, setShowFilterModal] = useState(false);

  // Set branch ID in store on mount
  useEffect(() => {
    setBranchId(branchId);
  }, [branchId, setBranchId]);

  // Fetch rooms based on filters
  const { data, isLoading, isError } = useQuery({
    queryKey: ['rooms', 'branch', branchId, filters],
    queryFn: () =>
      roomService.searchRoomsPagination(1, 100, {
        branchId,
        bookingType: filters.bookingType as FilterRoomDetailDtoBookingTypeEnum,
        startDate: formatDateForAPI(filters.startDate),
        endDate: formatDateForAPI(filters.endDate),
        startTime: filters.startTime,
        endTime: filters.endTime,
        adults: filters.adults,
        children: filters.children,
        excludeFullyBooked: false,
      }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const rooms = data?.data || [];
  // display logs in breaking lines
  // console.log('rooms', JSON.stringify(rooms, null, 2));
  console.log('data', JSON.stringify(data, null, 2));

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
    // Store selected room and navigate
    setSelectedRoom(room);
    router.push(`/rooms/${room.id}`);
  };

  const handleFiltersChange = (newFilters: BookingFilters) => {
    setFilters(newFilters);
  };

  return (
    <View className='border-t border-neutral-light px-4 py-6'>
      <View className='mb-4 flex-row items-center justify-between'>
        <Text className='text-xl font-bold text-text-primary'>
          {t('branchDetail.availableRooms')}
        </Text>
      </View>

      {/* Filter Bar */}
      <BookingFilterBar
        filters={filters}
        onPress={() => setShowFilterModal(true)}
      />

      {/* Content */}
      {isLoading ? (
        <View className='items-center justify-center py-12'>
          <ActivityIndicator size='large' color={HEX_COLORS.primary.main} />
          <Text className='mt-3 text-sm text-text-secondary'>
            {t('branchDetail.searchingRooms')}
          </Text>
        </View>
      ) : isError ? (
        <View className='items-center justify-center py-8'>
          <MaterialIcons
            name='error-outline'
            size={40}
            color={HEX_COLORS.error.main}
          />
          <Text className='mt-2 text-center text-sm text-text-secondary'>
            {t('roomSearch.error')}
          </Text>
        </View>
      ) : rooms.length > 0 ? (
        <View className='gap-4'>
          {/* <Text className='text-sm text-text-secondary'>
            {t('roomSearch.foundRooms', { count: rooms.length })}
          </Text> */}
          {rooms.map(room => {
            const displayData = getRoomDisplayData(room);
            const lowestPrice = getLowestPrice(room);
            const availableCount = room.availableRoomsCount ?? 0;
            const isAvailable = availableCount > 0;

            return (
              <Pressable
                key={room.id}
                onPress={() => isAvailable && handleRoomPress(room)}
                disabled={!isAvailable}
                className={`overflow-hidden rounded-xl border bg-background-primary ${
                  isAvailable
                    ? 'border-neutral-light active:opacity-80'
                    : 'border-neutral-lighter opacity-60'
                }`}
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
                    style={!isAvailable ? { opacity: 0.5 } : undefined}
                  />
                  {/* Availability Badge */}
                  <View
                    className={`absolute right-3 top-3 rounded-full px-3 py-1 ${
                      isAvailable ? 'bg-success-lighter' : 'bg-neutral-lighter'
                    }`}
                  >
                    <Text
                      className={`text-xs font-medium ${
                        isAvailable
                          ? 'text-success-darkest'
                          : 'text-neutral-darkest'
                      }`}
                    >
                      {isAvailable
                        ? t('branchDetail.roomsAvailable', {
                            count: availableCount,
                          })
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
                        {t(`branchDetail.roomType.${room.room_type}`)}
                        {' • '}
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

                  <View className='flex-row items-end justify-between'>
                    <View>
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
                    <Button
                      title={t('roomSearch.chooseRoom')}
                      onPress={() => handleRoomPress(room)}
                      disabled={!room.is_available}
                      // style={{ paddingHorizontal: 24, paddingVertical: 10 }}
                      className='rounded-3xl'
                      textStyle={{
                        fontSize: 14,
                      }}
                    />
                  </View>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View className='items-center justify-center py-8'>
          <MaterialIcons
            name='search-off'
            size={48}
            color={HEX_COLORS.text.secondary}
          />
          <Text className='mt-3 text-center text-base font-medium text-text-primary'>
            {t('branchDetail.noRoomsForFilter')}
          </Text>
          <Text className='mt-1 text-center text-sm text-text-secondary'>
            {t('branchDetail.tryDifferentOptions')}
          </Text>
        </View>
      )}

      {/* Filter Modal */}
      <BookingFilterModal
        visible={showFilterModal}
        initialFilters={filters}
        onClose={() => setShowFilterModal(false)}
        onApply={handleFiltersChange}
      />
    </View>
  );
}

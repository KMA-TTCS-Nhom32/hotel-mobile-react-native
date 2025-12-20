import type { RoomDetail } from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  DateRangePickerModal,
  GuestsModal,
  type GuestCounts,
  LocationPickerModal,
} from '@/components/home';
import { ROUTES } from '@/config/routes';
import { useRooms } from '@/hooks/useRooms';

export default function FilteredRoomsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params
  const locationName = params.locationName as string;
  const locationId = params.locationId as string;
  const locationType = params.locationType as string;

  const checkInDateParam = params.checkInDate as string;
  const checkOutDateParam = params.checkOutDate as string;

  const adults = parseInt(params.adults as string) || 2;
  const children = parseInt(params.children as string) || 0;
  const toddlers = parseInt(params.toddlers as string) || 0;
  const infants = parseInt(params.infants as string) || 0;

  // State for search filters
  const [location, setLocation] = useState<{
    type: 'city' | 'branch';
    id: string;
    name: string;
  } | null>(
    locationName
      ? {
          type: (locationType as 'city' | 'branch') || 'city',
          id: locationId || '',
          name: locationName,
        }
      : null
  );

  const [checkInDate, setCheckInDate] = useState<Date | null>(() => {
    if (checkInDateParam) return new Date(checkInDateParam);
    return null;
  });

  const [checkOutDate, setCheckOutDate] = useState<Date | null>(() => {
    if (checkOutDateParam) return new Date(checkOutDateParam);
    return null;
  });

  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults,
    children,
    toddlers,
    infants,
  });

  // Modal states
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);
  const [showSearchFilter, setShowSearchFilter] = useState(false);

  // Fetch all rooms with filters
  const filters: Record<string, string> = {};

  // Filter by location
  if (location) {
    if (location.type === 'branch') {
      // Filter by specific branch
      filters.branch_id = location.id;
    } else if (location.type === 'city') {
      // Filter by province/city
      filters.province_id = location.id;
    }
  }

  const {
    data: roomsData,
    isLoading,
    isError,
    error,
  } = useRooms(1, 100, Object.keys(filters).length > 0 ? filters : {}, true);

  const [filteredRooms, setFilteredRooms] = useState<RoomDetail[]>([]);

  useEffect(() => {
    if (roomsData?.data) {
      // Filter rooms based on:
      // 1. Guest requirements (adults + children capacity)
      // 2. Availability status
      const filtered = roomsData.data.filter((room: RoomDetail) => {
        // Check if room is available
        if (!room.is_available) return false;

        // Check guest capacity
        const meetsAdultRequirement = room.max_adults >= guestCounts.adults;
        const totalChildren =
          guestCounts.children + guestCounts.toddlers + guestCounts.infants;
        const meetsChildrenRequirement = room.max_children >= totalChildren;

        return meetsAdultRequirement && meetsChildrenRequirement;
      });
      setFilteredRooms(filtered);
    }
  }, [roomsData, guestCounts]);

  const formatDateRange = () => {
    if (!checkInDate || !checkOutDate) return 'Chọn ngày';

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    };

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}, ${diffDays} đêm`;
  };

  const formatGuests = () => {
    const totalChildren =
      guestCounts.children + guestCounts.toddlers + guestCounts.infants;
    if (totalChildren > 0) {
      return `${guestCounts.adults} người lớn, ${totalChildren} trẻ em`;
    }
    return `${guestCounts.adults} người lớn`;
  };

  const handleLocationSelect = (selectedLocation: {
    type: 'city' | 'branch';
    id: string;
    name: string;
  }) => {
    // If branch selected, go to branch detail page (same as home screen)
    if (selectedLocation.type === 'branch') {
      router.push(ROUTES.BRANCHES.DETAIL(selectedLocation.id));
    } else {
      // If city selected, update filter
      setLocation(selectedLocation);
    }
  };

  const handleDateConfirm = (checkIn: Date | null, checkOut: Date | null) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  const handleGuestsConfirm = (counts: GuestCounts) => {
    setGuestCounts(counts);
  };

  const formatPrice = (price: string | null) => {
    if (!price) return 'N/A';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(parseFloat(price));
  };

  const handleRoomPress = (room: RoomDetail) => {
    router.push(ROUTES.ROOMS.DETAIL(room.id));
  };

  const handleBack = () => {
    router.back();
  };

  const totalChildren =
    guestCounts.children + guestCounts.toddlers + guestCounts.infants;

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className='flex-1 bg-background-secondary' edges={['top']}>
        <StatusBar style='dark' />

        {/* Header */}
        <View className='border-b border-neutral-lighter bg-white px-4 py-3'>
          <View className='flex-row items-center justify-between'>
            <TouchableOpacity onPress={handleBack} className='mr-3'>
              <Ionicons name='arrow-back' size={24} color='#1e293b' />
            </TouchableOpacity>
            <Text className='flex-1 text-lg font-bold text-neutral-darkest'>
              Phòng phù hợp
            </Text>
            <TouchableOpacity
              onPress={() => setShowSearchFilter(!showSearchFilter)}
            >
              <Text className='text-sm font-semibold text-primary-main'>
                THAY ĐỔI
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Filter Summary */}
        {showSearchFilter && (
          <View className='border-b border-neutral-lighter bg-white px-4 py-3'>
            {/* Location */}
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              className='mb-2 flex-row items-center justify-between border-b border-neutral-lighter pb-2'
            >
              <View className='flex-1'>
                <Text className='text-xs text-neutral-dark'>Điểm Đến</Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {location ? location.name : 'Tất cả địa điểm'}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>

            {/* Date */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className='mb-2 flex-row items-center justify-between border-b border-neutral-lighter pb-2'
            >
              <View className='flex-1'>
                <Text className='text-xs text-neutral-dark'>Ngày</Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {formatDateRange()}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>

            {/* Guests */}
            <TouchableOpacity
              onPress={() => setShowGuestsPicker(true)}
              className='flex-row items-center justify-between pb-2'
            >
              <View className='flex-1'>
                <Text className='text-xs text-neutral-dark'>Khách</Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {formatGuests()}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>
          </View>
        )}

        {/* Content */}
        <ScrollView className='flex-1'>
          {isLoading ? (
            <View className='items-center py-8'>
              <ActivityIndicator size='large' color='#f97316' />
              <Text className='mt-2 text-sm text-neutral-dark'>
                Đang tìm phòng phù hợp...
              </Text>
            </View>
          ) : isError ? (
            <View className='items-center px-4 py-8'>
              <Ionicons name='alert-circle-outline' size={48} color='#ef4444' />
              <Text className='mt-2 text-center text-sm text-neutral-dark'>
                {error?.message || 'Không thể tải danh sách phòng'}
              </Text>
            </View>
          ) : filteredRooms.length > 0 ? (
            <View className='p-4'>
              <Text className='mb-4 text-sm text-neutral-dark'>
                Tìm thấy {filteredRooms.length} phòng phù hợp
              </Text>
              {filteredRooms.map(room => (
                <TouchableOpacity
                  key={room.id}
                  onPress={() => handleRoomPress(room)}
                  className='mb-4 overflow-hidden rounded-xl bg-white shadow-sm'
                >
                  {/* Room Image */}
                  <Image
                    source={{
                      uri:
                        room.thumbnail?.url ||
                        room.images?.[0]?.url ||
                        'https://via.placeholder.com/400x200',
                    }}
                    className='h-48 w-full'
                    resizeMode='cover'
                  />

                  {/* Room Info */}
                  <View className='p-4'>
                    <Text className='mb-2 text-lg font-bold text-neutral-darkest'>
                      {room.name}
                    </Text>

                    {/* Capacity Info */}
                    <View className='mb-3 flex-row items-center gap-4'>
                      <View className='flex-row items-center gap-1'>
                        <Ionicons name='people' size={16} color='#64748b' />
                        <Text className='text-sm text-neutral-dark'>
                          Tối đa {room.max_adults} người lớn
                        </Text>
                      </View>
                      {room.max_children > 0 && (
                        <View className='flex-row items-center gap-1'>
                          <Ionicons name='person' size={16} color='#64748b' />
                          <Text className='text-sm text-neutral-dark'>
                            {room.max_children} trẻ em
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Room Details */}
                    <View className='mb-3 flex-row flex-wrap gap-2'>
                      <View className='flex-row items-center gap-1 rounded-full bg-neutral-lighter px-3 py-1'>
                        <Ionicons
                          name='bed-outline'
                          size={14}
                          color='#64748b'
                        />
                        <Text className='text-xs text-neutral-dark'>
                          {room.bed_type}
                        </Text>
                      </View>
                      <View className='flex-row items-center gap-1 rounded-full bg-neutral-lighter px-3 py-1'>
                        <Ionicons
                          name='expand-outline'
                          size={14}
                          color='#64748b'
                        />
                        <Text className='text-xs text-neutral-dark'>
                          {room.area}m²
                        </Text>
                      </View>
                    </View>

                    {/* Description */}
                    <Text
                      className='mb-3 text-sm text-neutral-dark'
                      numberOfLines={2}
                    >
                      {room.description}
                    </Text>

                    {/* Price */}
                    <View className='flex-row items-end justify-between'>
                      <View>
                        {room.base_price_per_hour && (
                          <Text className='text-xs text-neutral-dark'>
                            Theo giờ:{' '}
                            <Text className='font-semibold text-primary-main'>
                              {formatPrice(room.base_price_per_hour)}
                            </Text>
                          </Text>
                        )}
                        {room.base_price_per_night && (
                          <Text className='text-xs text-neutral-dark'>
                            Qua đêm:{' '}
                            <Text className='font-semibold text-primary-main'>
                              {formatPrice(room.base_price_per_night)}
                            </Text>
                          </Text>
                        )}
                        {room.base_price_per_day && (
                          <Text className='text-xs text-neutral-dark'>
                            Theo ngày:{' '}
                            <Text className='font-semibold text-primary-main'>
                              {formatPrice(room.base_price_per_day)}
                            </Text>
                          </Text>
                        )}
                      </View>
                      <View className='rounded-lg bg-primary-main px-3 py-1.5'>
                        <Text className='text-xs font-semibold text-white'>
                          Xem chi tiết
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className='items-center px-4 py-8'>
              <Ionicons name='bed-outline' size={48} color='#a3a3a3' />
              <Text className='mt-2 text-center text-base font-semibold text-neutral-darkest'>
                Không tìm thấy phòng phù hợp
              </Text>
              <Text className='mt-1 text-center text-sm text-neutral-dark'>
                Không có phòng nào đáp ứng yêu cầu {guestCounts.adults} người
                lớn
                {totalChildren > 0 && ` và ${totalChildren} trẻ em`}
              </Text>
              <TouchableOpacity
                onPress={() => setShowGuestsPicker(true)}
                className='mt-4 rounded-lg bg-primary-main px-6 py-3'
              >
                <Text className='font-semibold text-white'>
                  Chọn lại số lượng khách
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Modals */}
        <LocationPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={handleLocationSelect}
          selectedLocation={location || undefined}
        />

        <DateRangePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateConfirm}
          initialCheckIn={checkInDate || undefined}
          initialCheckOut={checkOutDate || undefined}
        />

        <GuestsModal
          visible={showGuestsPicker}
          onClose={() => setShowGuestsPicker(false)}
          onConfirm={handleGuestsConfirm}
        />
      </SafeAreaView>
    </>
  );
}

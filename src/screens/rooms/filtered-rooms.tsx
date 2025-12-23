import type {
  FilterRoomDetailDto,
  RoomDetail,
} from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { format } from 'date-fns';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
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
import { flattenInfiniteRooms, useInfiniteRooms } from '@/hooks/useRooms';
import { useCommonTranslation } from '@/i18n/hooks';

export default function FilteredRoomsScreen() {
  const { t } = useCommonTranslation();
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
    infants,
  });

  // Modal states
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);
  const [showSearchFilter, setShowSearchFilter] = useState(false);

  // Build filters using SDK DTO
  const filters: FilterRoomDetailDto = useMemo(() => {
    const f: FilterRoomDetailDto = {};

    // Location filter
    if (location) {
      if (location.type === 'branch') {
        f.branchId = location.id;
      } else if (location.type === 'city') {
        f.provinceId = location.id;
      }
    }

    // Date filters - API expects DD-MM-YYYY format
    if (checkInDate) {
      f.startDate = format(checkInDate, 'dd-MM-yyyy');
    }
    if (checkOutDate) {
      f.endDate = format(checkOutDate, 'dd-MM-yyyy');
    }

    // Guest filters
    f.adults = guestCounts.adults;
    f.children = guestCounts.children + guestCounts.infants;

    return f;
  }, [location, checkInDate, checkOutDate, guestCounts]);

  // Use infinite query for room search
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteRooms(filters, true);

  // Flatten all pages into single array
  const rooms = flattenInfiniteRooms(data);

  const formatDateRange = () => {
    if (!checkInDate || !checkOutDate) return t('search.selectDate');

    const formatDate = (date: Date) => {
      const day = date.getDate();
      const month = date.getMonth() + 1;
      return `${day}/${month}`;
    };

    const diffTime = checkOutDate.getTime() - checkInDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return `${formatDate(checkInDate)} - ${formatDate(checkOutDate)}, ${diffDays} ${t('roomSearch.nights')}`;
  };

  const formatGuests = () => {
    const totalChildren = guestCounts.children + guestCounts.infants;
    if (totalChildren > 0) {
      return `${t('guests.adultsCount', { count: guestCounts.adults })}, ${t('guests.childrenCount', { count: totalChildren })}`;
    }
    return t('guests.adultsCount', { count: guestCounts.adults });
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

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  const totalChildren = guestCounts.children + guestCounts.infants;

  // Render individual room card
  const renderRoomCard = ({ item: room }: { item: RoomDetail }) => (
    <TouchableOpacity
      onPress={() => handleRoomPress(room)}
      className='mx-4 mb-4 overflow-hidden rounded-xl bg-white shadow-sm'
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
              {t('roomSearch.maxAdults', { count: room.max_adults })}
            </Text>
          </View>
          {room.max_children > 0 && (
            <View className='flex-row items-center gap-1'>
              <Ionicons name='person' size={16} color='#64748b' />
              <Text className='text-sm text-neutral-dark'>
                {t('roomSearch.maxChildren', { count: room.max_children })}
              </Text>
            </View>
          )}
        </View>

        {/* Room Details */}
        <View className='mb-3 flex-row flex-wrap gap-2'>
          <View className='flex-row items-center gap-1 rounded-full bg-neutral-lighter px-3 py-1'>
            <Ionicons name='bed-outline' size={14} color='#64748b' />
            <Text className='text-xs text-neutral-dark'>{room.bed_type}</Text>
          </View>
          <View className='flex-row items-center gap-1 rounded-full bg-neutral-lighter px-3 py-1'>
            <Ionicons name='expand-outline' size={14} color='#64748b' />
            <Text className='text-xs text-neutral-dark'>{room.area}m²</Text>
          </View>
        </View>

        {/* Description */}
        <Text className='mb-3 text-sm text-neutral-dark' numberOfLines={2}>
          {room.description}
        </Text>

        {/* Price */}
        <View className='flex-row items-end justify-between'>
          <View>
            {room.base_price_per_hour && (
              <Text className='text-xs text-neutral-dark'>
                {t('roomSearch.byHour')}:{' '}
                <Text className='font-semibold text-primary-main'>
                  {formatPrice(room.base_price_per_hour)}
                </Text>
              </Text>
            )}
            {room.base_price_per_night && (
              <Text className='text-xs text-neutral-dark'>
                {t('roomSearch.byNight')}:{' '}
                <Text className='font-semibold text-primary-main'>
                  {formatPrice(room.base_price_per_night)}
                </Text>
              </Text>
            )}
            {room.base_price_per_day && (
              <Text className='text-xs text-neutral-dark'>
                {t('roomSearch.byDay')}:{' '}
                <Text className='font-semibold text-primary-main'>
                  {formatPrice(room.base_price_per_day)}
                </Text>
              </Text>
            )}
          </View>
          <View className='rounded-lg bg-primary-main px-3 py-1.5'>
            <Text className='text-xs font-semibold text-white'>
              {t('roomSearch.viewDetails')}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render loading footer when fetching more pages
  const renderFooter = () => {
    if (!isFetchingNextPage) return null;
    return (
      <View className='items-center py-4'>
        <ActivityIndicator size='small' color='#f97316' />
        <Text className='mt-1 text-xs text-neutral-dark'>
          {t('roomSearch.loadingMore')}
        </Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className='items-center px-4 py-8'>
        <Ionicons name='bed-outline' size={48} color='#a3a3a3' />
        <Text className='mt-2 text-center text-base font-semibold text-neutral-darkest'>
          {t('roomSearch.noRoomsFound')}
        </Text>
        <Text className='mt-1 text-center text-sm text-neutral-dark'>
          {t('roomSearch.noRoomsMatchCriteria', { adults: guestCounts.adults })}
          {totalChildren > 0 &&
            t('roomSearch.andChildren', { count: totalChildren })}
        </Text>
        <TouchableOpacity
          onPress={() => setShowGuestsPicker(true)}
          className='mt-4 rounded-lg bg-primary-main px-6 py-3'
        >
          <Text className='font-semibold text-white'>
            {t('roomSearch.changeGuestCount')}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render header with room count
  const renderListHeader = () => {
    if (rooms.length === 0) return null;
    return (
      <Text className='mb-4 px-4 text-sm text-neutral-dark'>
        {t('roomSearch.foundRooms', { count: rooms.length })}
        {hasNextPage && ` ${t('roomSearch.scrollForMore')}`}
      </Text>
    );
  };

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
              {t('roomSearch.title')}
            </Text>
            <TouchableOpacity
              onPress={() => setShowSearchFilter(!showSearchFilter)}
            >
              <Text className='text-sm font-semibold text-primary-main'>
                {t('search.change')}
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
                <Text className='text-xs text-neutral-dark'>
                  {t('search.destination')}
                </Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {location ? location.name : t('search.allDestinations')}
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
                <Text className='text-xs text-neutral-dark'>
                  {t('search.dates')}
                </Text>
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
                <Text className='text-xs text-neutral-dark'>
                  {t('search.guests')}
                </Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {formatGuests()}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>
          </View>
        )}

        {/* Content - FlatList with infinite scroll */}
        {isLoading ? (
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size='large' color='#f97316' />
            <Text className='mt-2 text-sm text-neutral-dark'>
              {t('roomSearch.loading')}
            </Text>
          </View>
        ) : isError ? (
          <View className='flex-1 items-center justify-center px-4'>
            <Ionicons name='alert-circle-outline' size={48} color='#ef4444' />
            <Text className='mt-2 text-center text-sm text-neutral-dark'>
              {error?.message || t('roomSearch.error')}
            </Text>
          </View>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={item => item.id}
            renderItem={renderRoomCard}
            ListHeaderComponent={renderListHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmpty}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            contentContainerStyle={{ paddingVertical: 16 }}
            showsVerticalScrollIndicator={false}
          />
        )}

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

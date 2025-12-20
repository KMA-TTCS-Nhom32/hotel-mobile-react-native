import type { Branch } from '@ahomevilla-hotel/node-sdk';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
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
import { useBranches } from '@/hooks/useBranches';

export default function SearchResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Parse params
  const locationName = params.locationName as string;
  const locationId = params.locationId as string;
  const locationType = params.locationType as string;

  const checkInStr = params.checkIn as string;
  const checkOutStr = params.checkOut as string;

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

  const [checkInDate, setCheckInDate] = useState<Date>(() => {
    if (checkInStr) return new Date(checkInStr);
    return new Date();
  });

  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    if (checkOutStr) return new Date(checkOutStr);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
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

  // Fetch branches based on filters
  const filters: Record<string, string> = {};

  if (location?.type === 'city') {
    // Filter by city name
    filters.keyword = location.name;
  } else if (location?.type === 'branch' && location.id) {
    // Filter by specific branch ID
    filters.id = location.id;
  }

  const {
    data: branchesData,
    isLoading,
    isError,
    error,
  } = useBranches(1, 50, Object.keys(filters).length > 0 ? filters : undefined);

  const formatDateRange = () => {
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

  const handleDateConfirm = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  const handleGuestsConfirm = (counts: GuestCounts) => {
    setGuestCounts(counts);
  };

  const handleBranchPress = (branch: Branch) => {
    router.push(ROUTES.BRANCHES.DETAIL(branch.slug));
  };

  const handleBack = () => {
    router.back();
  };

  const branches = branchesData?.data || [];

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
              Khách sạn phù hợp
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
        <Pressable
          onPress={() => setShowSearchFilter(!showSearchFilter)}
          className='border-b border-neutral-lighter bg-white px-4 py-3'
        >
          {/* Destination */}
          {location && (
            <View className='mb-2'>
              <Text className='text-xs text-neutral-dark'>Điểm Đến</Text>
              <Text className='text-sm font-medium text-neutral-darkest'>
                {location.name}
              </Text>
            </View>
          )}

          {/* Date and Guests */}
          <View className='flex-row items-center gap-4'>
            <View className='flex-1'>
              <Text className='text-xs text-neutral-dark'>Ngày</Text>
              <Text className='text-sm font-medium text-neutral-darkest'>
                {formatDateRange()}
              </Text>
            </View>
            <View className='flex-1'>
              <Text className='text-xs text-neutral-dark'>Khách</Text>
              <Text className='text-sm font-medium text-neutral-darkest'>
                {formatGuests()}
              </Text>
            </View>
          </View>
        </Pressable>

        {/* Search Filter Modal (Expanded) */}
        {showSearchFilter && (
          <View className='border-b border-neutral-lighter bg-white px-4 py-3'>
            {/* Destination Field */}
            <TouchableOpacity
              onPress={() => {
                setShowLocationPicker(true);
                setShowSearchFilter(false);
              }}
              className='mb-3 flex-row items-center justify-between rounded-lg border border-neutral-lighter p-3'
            >
              <View className='flex-1'>
                <Text className='mb-1 text-xs text-neutral-dark'>Điểm Đến</Text>
                <Text
                  className='text-sm font-medium text-neutral-darkest'
                  numberOfLines={1}
                >
                  {location?.name || 'Chọn điểm đến'}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>

            {/* Date Field */}
            <TouchableOpacity
              onPress={() => {
                setShowDatePicker(true);
                setShowSearchFilter(false);
              }}
              className='mb-3 flex-row items-center justify-between rounded-lg border border-neutral-lighter p-3'
            >
              <View className='flex-1'>
                <Text className='mb-1 text-xs text-neutral-dark'>Ngày</Text>
                <Text className='text-sm font-medium text-neutral-darkest'>
                  {formatDateRange()}
                </Text>
              </View>
              <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
            </TouchableOpacity>

            {/* Guests Field */}
            <TouchableOpacity
              onPress={() => {
                setShowGuestsPicker(true);
                setShowSearchFilter(false);
              }}
              className='flex-row items-center justify-between rounded-lg border border-neutral-lighter p-3'
            >
              <View className='flex-1'>
                <Text className='mb-1 text-xs text-neutral-dark'>Khách</Text>
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
                Đang tìm khách sạn...
              </Text>
            </View>
          ) : isError ? (
            <View className='items-center px-4 py-8'>
              <Ionicons name='alert-circle-outline' size={48} color='#ef4444' />
              <Text className='mt-2 text-center text-sm text-neutral-dark'>
                {error?.message || 'Không thể tải danh sách khách sạn'}
              </Text>
            </View>
          ) : branches.length > 0 ? (
            <View className='p-4'>
              <Text className='mb-4 text-sm text-neutral-dark'>
                Tìm thấy {branches.length} khách sạn
              </Text>
              {branches.map((branch: Branch) => (
                <TouchableOpacity
                  key={branch.id}
                  onPress={() => handleBranchPress(branch)}
                  className='mb-4 overflow-hidden rounded-xl bg-white shadow-sm'
                >
                  {/* Branch Image */}
                  <Image
                    source={{
                      uri:
                        branch.thumbnail?.url ||
                        branch.images?.[0]?.url ||
                        'https://via.placeholder.com/400x200',
                    }}
                    className='h-48 w-full'
                    resizeMode='cover'
                  />

                  {/* Branch Info */}
                  <View className='p-4'>
                    <Text className='mb-2 text-lg font-bold text-neutral-darkest'>
                      {branch.name}
                    </Text>

                    {/* Address */}
                    <View className='mb-3 flex-row items-start gap-2'>
                      <Ionicons
                        name='location-outline'
                        size={16}
                        color='#64748b'
                        style={{ marginTop: 2 }}
                      />
                      <Text
                        className='flex-1 text-sm text-neutral-dark'
                        numberOfLines={2}
                      >
                        {branch.address}
                      </Text>
                    </View>

                    {/* Description */}
                    {branch.description && (
                      <Text
                        className='mb-3 text-sm text-neutral-dark'
                        numberOfLines={2}
                      >
                        {branch.description}
                      </Text>
                    )}

                    {/* CTA */}
                    <View className='flex-row items-center justify-between'>
                      <View className='rounded-lg bg-primary-main px-4 py-2'>
                        <Text className='text-sm font-semibold text-white'>
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
              <Ionicons name='business-outline' size={48} color='#a3a3a3' />
              <Text className='mt-2 text-center text-base font-semibold text-neutral-darkest'>
                Không tìm thấy khách sạn
              </Text>
              <Text className='mt-1 text-center text-sm text-neutral-dark'>
                Không có khách sạn nào phù hợp với tiêu chí tìm kiếm
              </Text>
              <TouchableOpacity
                onPress={handleBack}
                className='mt-4 rounded-lg bg-primary-main px-6 py-3'
              >
                <Text className='font-semibold text-white'>Tìm kiếm lại</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>

        {/* Sub-modals */}
        <LocationPickerModal
          visible={showLocationPicker}
          onClose={() => setShowLocationPicker(false)}
          onSelect={setLocation}
          selectedLocation={location || undefined}
        />

        <DateRangePickerModal
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
          onConfirm={handleDateConfirm}
          initialCheckIn={checkInDate}
          initialCheckOut={checkOutDate}
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

import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';

import { DateRangePickerModal } from './DateRangePickerModal';
import { GuestsModal, type GuestCounts } from './GuestsModal';
import { LocationPickerModal } from './LocationPickerModal';

import { ROUTES } from '@/config/routes';

interface SearchModalProps {
  visible: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  visible,
  onClose,
}) => {
  const router = useRouter();

  // State for location
  const [location, setLocation] = useState<{
    type: 'city' | 'branch';
    id: string;
    name: string;
  } | null>(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);

  // State for dates
  const [checkInDate, setCheckInDate] = useState<Date>(new Date());
  const [checkOutDate, setCheckOutDate] = useState<Date>(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow;
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // State for guests
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    toddlers: 0,
    infants: 0,
  });
  const [showGuestsPicker, setShowGuestsPicker] = useState(false);

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

  const handleSearch = () => {
    // Navigate to search results with filters
    router.push({
      pathname: '/search-results' as any,
      params: {
        locationId: location?.id || '',
        locationType: location?.type || '',
        locationName: location?.name || '',
        checkIn: checkInDate.toISOString(),
        checkOut: checkOutDate.toISOString(),
        adults: guestCounts.adults.toString(),
        children: guestCounts.children.toString(),
        toddlers: guestCounts.toddlers.toString(),
        infants: guestCounts.infants.toString(),
      },
    });
    onClose();
  };

  const handleDateConfirm = (checkIn: Date, checkOut: Date) => {
    setCheckInDate(checkIn);
    setCheckOutDate(checkOut);
  };

  const handleGuestsConfirm = (counts: GuestCounts) => {
    setGuestCounts(counts);
  };

  return (
    <>
      <Modal
        visible={visible}
        animationType='slide'
        transparent
        onRequestClose={onClose}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          }}
          onPress={onClose}
        >
          <Pressable
            style={{
              marginTop: 'auto',
              backgroundColor: 'white',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              paddingHorizontal: 20,
              paddingTop: 8,
              paddingBottom: 32,
            }}
            onPress={e => e.stopPropagation()}
          >
            {/* Handle bar */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: '#cbd5e1',
                borderRadius: 2,
                alignSelf: 'center',
                marginBottom: 16,
              }}
            />

            {/* Destination Field */}
            <TouchableOpacity
              onPress={() => setShowLocationPicker(true)}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontWeight: '600',
                  marginBottom: 4,
                }}
              >
                Điểm Đến
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: location ? '#1e293b' : '#94a3b8',
                    flex: 1,
                  }}
                  numberOfLines={1}
                >
                  {location?.name || 'Thành phố, Khách sạn, Điểm đến...'}
                </Text>
                {location && (
                  <TouchableOpacity
                    onPress={e => {
                      e.stopPropagation();
                      setLocation(null);
                    }}
                  >
                    <Ionicons name='close-circle' size={20} color='#94a3b8' />
                  </TouchableOpacity>
                )}
                <Ionicons
                  name='chevron-forward'
                  size={20}
                  color='#94a3b8'
                  style={{ marginLeft: 8 }}
                />
              </View>
            </TouchableOpacity>

            {/* Date Field */}
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={{
                paddingVertical: 12,
                borderBottomWidth: 1,
                borderBottomColor: '#f1f5f9',
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontWeight: '600',
                  marginBottom: 4,
                }}
              >
                Ngày
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: '#1e293b',
                  }}
                >
                  {formatDateRange()}
                </Text>
                <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
              </View>
            </TouchableOpacity>

            {/* Guests Field */}
            <TouchableOpacity
              onPress={() => setShowGuestsPicker(true)}
              style={{
                paddingVertical: 12,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  color: '#f97316',
                  fontWeight: '600',
                  marginBottom: 4,
                }}
              >
                Khách
              </Text>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    color: '#1e293b',
                  }}
                >
                  {formatGuests()}
                </Text>
                <Ionicons name='chevron-forward' size={20} color='#94a3b8' />
              </View>
            </TouchableOpacity>

            {/* Info Box */}
            <View
              style={{
                backgroundColor: '#fff7ed',
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '600',
                  color: '#f97316',
                  marginBottom: 8,
                }}
              >
                Đặt nhiều phòng?
              </Text>
              <Text style={{ fontSize: 14, color: '#92400e' }}>
                Chỉ cần gọi <Text style={{ fontWeight: '600' }}>1900 3311</Text>{' '}
                hoặc <Text style={{ fontWeight: '600' }}>email</Text>! Đã có
                AHomeVilla lo.
              </Text>
            </View>

            {/* Search Button */}
            <TouchableOpacity
              onPress={handleSearch}
              style={{
                backgroundColor: '#f97316',
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: 'white',
                }}
              >
                Tìm kiếm
              </Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

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
    </>
  );
};

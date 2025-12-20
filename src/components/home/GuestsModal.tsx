import Ionicons from '@expo/vector-icons/Ionicons';
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, ScrollView } from 'react-native';

interface GuestsModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (guestCounts: GuestCounts) => void;
}

interface GuestCounts {
  adults: number;
  children: number;
  toddlers: number;
  infants: number;
}

export type { GuestCounts };

export const GuestsModal: React.FC<GuestsModalProps> = ({
  visible,
  onClose,
  onConfirm,
}) => {
  const [guestCounts, setGuestCounts] = useState<GuestCounts>({
    adults: 2,
    children: 0,
    toddlers: 0,
    infants: 0,
  });

  const updateGuestCount = (type: keyof GuestCounts, value: number) => {
    setGuestCounts(prev => ({
      ...prev,
      [type]: Math.max(0, value),
    }));
  };

  // Tính tổng số trẻ em (thiếu nhi + trẻ nhỏ + em bé)
  const getTotalChildren = () => {
    return guestCounts.children + guestCounts.toddlers + guestCounts.infants;
  };

  // Kiểm tra xem có thể tăng số lượng không
  const canIncrement = (type: keyof GuestCounts) => {
    if (type === 'adults') {
      return guestCounts.adults < 4;
    }
    // Đối với trẻ em, kiểm tra tổng số trẻ em
    return getTotalChildren() < 2;
  };

  const handleConfirm = () => {
    // Call onConfirm callback with guest counts
    onConfirm?.(guestCounts);
    onClose();
  };

  const GuestCounter = ({
    label,
    description,
    count,
    onIncrement,
    onDecrement,
    disableIncrement = false,
  }: {
    label: string;
    description: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    disableIncrement?: boolean;
  }) => (
    <View
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
      }}
    >
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 16,
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: 4,
          }}
        >
          {label}
        </Text>
        <Text style={{ fontSize: 14, color: '#64748b' }}>{description}</Text>
      </View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <TouchableOpacity
          onPress={onDecrement}
          disabled={count === 0}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: count === 0 ? '#e2e8f0' : '#f97316',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name='remove'
            size={20}
            color={count === 0 ? '#cbd5e1' : '#f97316'}
          />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 18,
            fontWeight: '600',
            color: '#1e293b',
            minWidth: 30,
            textAlign: 'center',
          }}
        >
          {count}
        </Text>
        <TouchableOpacity
          onPress={onIncrement}
          disabled={disableIncrement}
          style={{
            width: 36,
            height: 36,
            borderRadius: 18,
            borderWidth: 1,
            borderColor: disableIncrement ? '#e2e8f0' : '#f97316',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons
            name='add'
            size={20}
            color={disableIncrement ? '#cbd5e1' : '#f97316'}
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType='slide'
      transparent
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          justifyContent: 'flex-end',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            paddingHorizontal: 20,
            paddingTop: 8,
            paddingBottom: 32,
            maxHeight: '80%',
          }}
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

          {/* Header */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: '#1e293b',
              }}
            >
              Khách
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name='close' size={28} color='#64748b' />
            </TouchableOpacity>
          </View>

          {/* Guest counters */}
          <ScrollView showsVerticalScrollIndicator={false}>
            <GuestCounter
              label='Người lớn'
              description='Từ 12 tuổi trở lên'
              count={guestCounts.adults}
              onIncrement={() =>
                updateGuestCount('adults', guestCounts.adults + 1)
              }
              onDecrement={() =>
                updateGuestCount('adults', guestCounts.adults - 1)
              }
              disableIncrement={!canIncrement('adults')}
            />
            <GuestCounter
              label='Thiếu nhi'
              description='Từ 6 đến 11 tuổi'
              count={guestCounts.children}
              onIncrement={() =>
                updateGuestCount('children', guestCounts.children + 1)
              }
              onDecrement={() =>
                updateGuestCount('children', guestCounts.children - 1)
              }
              disableIncrement={!canIncrement('children')}
            />
            <GuestCounter
              label='Trẻ nhỏ'
              description='Từ 3 đến 5 tuổi'
              count={guestCounts.toddlers}
              onIncrement={() =>
                updateGuestCount('toddlers', guestCounts.toddlers + 1)
              }
              onDecrement={() =>
                updateGuestCount('toddlers', guestCounts.toddlers - 1)
              }
              disableIncrement={!canIncrement('toddlers')}
            />
            <GuestCounter
              label='Em bé'
              description='Dưới 3 tuổi'
              count={guestCounts.infants}
              onIncrement={() =>
                updateGuestCount('infants', guestCounts.infants + 1)
              }
              onDecrement={() =>
                updateGuestCount('infants', guestCounts.infants - 1)
              }
              disableIncrement={!canIncrement('infants')}
            />

            {/* Info box */}
            <View
              style={{
                backgroundColor: '#fff7ed',
                borderRadius: 12,
                padding: 16,
                marginTop: 20,
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
          </ScrollView>

          {/* Confirm button */}
          <TouchableOpacity
            onPress={handleConfirm}
            style={{
              backgroundColor: '#f97316',
              borderRadius: 12,
              paddingVertical: 16,
              alignItems: 'center',
              marginTop: 20,
            }}
          >
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: 'white',
              }}
            >
              Xác nhận
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

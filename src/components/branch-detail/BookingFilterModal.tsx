import { Ionicons } from '@expo/vector-icons';
import React, { useState, useCallback, useEffect } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  BookingTypeSelector,
  DailyBookingForm,
  HourlyBookingForm,
  NightlyBookingForm,
  type DailyBookingData,
  type HourlyBookingData,
  type NightlyBookingData,
} from '@/components/room-detail';
import { Button } from '@/components/ui';
import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';
import {
  type BookingFilters,
  type BookingType,
  calculateEndTime,
} from '@/types/booking';

interface BookingFilterModalProps {
  visible: boolean;
  initialFilters: BookingFilters;
  onClose: () => void;
  onApply: (filters: BookingFilters) => void;
}

/**
 * Full-screen modal for configuring booking filters
 * Includes booking type, date/time selection, and guest counts
 */
export function BookingFilterModal({
  visible,
  initialFilters,
  onClose,
  onApply,
}: BookingFilterModalProps) {
  const { t } = useCommonTranslation();
  const insets = useSafeAreaInsets();

  // Local state for editing
  const [bookingType, setBookingType] = useState<BookingType>(
    initialFilters.bookingType
  );
  const [hourlyData, setHourlyData] = useState<HourlyBookingData>({
    date: initialFilters.startDate,
    checkInTime: initialFilters.startTime,
    duration: 2,
  });
  const [nightlyData, setNightlyData] = useState<NightlyBookingData>({
    date: initialFilters.startDate,
  });
  const [dailyData, setDailyData] = useState<DailyBookingData>({
    checkInDate: initialFilters.startDate,
    checkOutDate: initialFilters.endDate,
  });
  const [adults, setAdults] = useState(initialFilters.adults);
  const [children, setChildren] = useState(initialFilters.children);
  const [infants, setInfants] = useState(initialFilters.infants);

  // Reset to initial values when modal opens
  useEffect(() => {
    if (visible) {
      setBookingType(initialFilters.bookingType);
      setHourlyData({
        date: initialFilters.startDate,
        checkInTime: initialFilters.startTime,
        duration: 2,
      });
      setNightlyData({ date: initialFilters.startDate });
      setDailyData({
        checkInDate: initialFilters.startDate,
        checkOutDate: initialFilters.endDate,
      });
      setAdults(initialFilters.adults);
      setChildren(initialFilters.children);
      setInfants(initialFilters.infants);
    }
  }, [visible, initialFilters]);

  const handleHourlyDataChange = useCallback((data: HourlyBookingData) => {
    setHourlyData(data);
  }, []);

  const handleNightlyDataChange = useCallback((data: NightlyBookingData) => {
    setNightlyData(data);
  }, []);

  const handleDailyDataChange = useCallback((data: DailyBookingData) => {
    setDailyData(data);
  }, []);

  const updateGuests = (
    type: 'adults' | 'children' | 'infants',
    delta: number
  ) => {
    if (type === 'adults') {
      setAdults(prev => Math.max(1, Math.min(4, prev + delta)));
    } else if (type === 'children') {
      const totalChildren = children + infants + delta;
      if (totalChildren >= 0 && totalChildren <= 2) {
        setChildren(prev => Math.max(0, prev + delta));
      }
    } else {
      const totalChildren = children + infants + delta;
      if (totalChildren >= 0 && totalChildren <= 2) {
        setInfants(prev => Math.max(0, prev + delta));
      }
    }
  };

  const handleApply = () => {
    const guestData = {
      adults,
      children,
      infants,
    };
    let filters: BookingFilters;

    if (bookingType === 'HOURLY' && hourlyData.date && hourlyData.checkInTime) {
      filters = {
        bookingType: 'HOURLY',
        startDate: hourlyData.date,
        endDate: hourlyData.date,
        startTime: hourlyData.checkInTime,
        endTime: calculateEndTime(
          hourlyData.checkInTime,
          hourlyData.duration || 2
        ),
        ...guestData,
      };
    } else if (bookingType === 'NIGHTLY' && nightlyData.date) {
      const nextDay = new Date(nightlyData.date);
      nextDay.setDate(nextDay.getDate() + 1);
      filters = {
        bookingType: 'NIGHTLY',
        startDate: nightlyData.date,
        endDate: nextDay,
        startTime: '21:00',
        endTime: '09:00',
        ...guestData,
      };
    } else if (
      bookingType === 'DAILY' &&
      dailyData.checkInDate &&
      dailyData.checkOutDate
    ) {
      filters = {
        bookingType: 'DAILY',
        startDate: dailyData.checkInDate,
        endDate: dailyData.checkOutDate,
        startTime: '14:00',
        endTime: '12:00',
        ...guestData,
      };
    } else {
      return; // Invalid data
    }

    onApply(filters);
    onClose();
  };

  const GuestCounter = ({
    label,
    description,
    count,
    onIncrement,
    onDecrement,
    disableDecrement = false,
    disableIncrement = false,
  }: {
    label: string;
    description: string;
    count: number;
    onIncrement: () => void;
    onDecrement: () => void;
    disableDecrement?: boolean;
    disableIncrement?: boolean;
  }) => (
    <View className='flex-row items-center justify-between py-3'>
      <View className='flex-1'>
        <Text className='text-base font-medium text-text-primary'>{label}</Text>
        <Text className='text-sm text-text-secondary'>{description}</Text>
      </View>
      <View className='flex-row items-center gap-3'>
        <TouchableOpacity
          onPress={onDecrement}
          disabled={disableDecrement}
          className={`h-8 w-8 items-center justify-center rounded-full border ${
            disableDecrement ? 'border-neutral-light' : 'border-primary-main'
          }`}
        >
          <Ionicons
            name='remove'
            size={18}
            color={
              disableDecrement
                ? '#d1d5db' // neutral-light equivalent
                : HEX_COLORS.primary.main
            }
          />
        </TouchableOpacity>
        <Text className='min-w-[24px] text-center text-lg font-semibold text-text-primary'>
          {count}
        </Text>
        <TouchableOpacity
          onPress={onIncrement}
          disabled={disableIncrement}
          className={`h-8 w-8 items-center justify-center rounded-full border ${
            disableIncrement ? 'border-neutral-light' : 'border-primary-main'
          }`}
        >
          <Ionicons
            name='add'
            size={18}
            color={
              disableIncrement
                ? '#d1d5db' // neutral-light equivalent
                : HEX_COLORS.primary.main
            }
          />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType='slide'
      presentationStyle='pageSheet'
      onRequestClose={onClose}
    >
      <View
        className='flex-1 bg-background-primary'
        style={{ paddingTop: insets.top }}
      >
        {/* Header */}
        <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
          <Pressable onPress={onClose} className='p-1'>
            <Ionicons name='close' size={24} color={HEX_COLORS.text.primary} />
          </Pressable>
          <Text className='text-lg font-semibold text-text-primary'>
            {t('branchDetail.bookingOptions')}
          </Text>
          <View className='w-8' />
        </View>

        <ScrollView className='flex-1' showsVerticalScrollIndicator={false}>
          {/* Booking Type Selector */}
          <BookingTypeSelector
            selectedType={bookingType}
            onTypeChange={setBookingType}
          />

          {/* Time/Date Selection based on booking type */}
          <View className='px-4 py-4'>
            {bookingType === 'HOURLY' && (
              <HourlyBookingForm
                value={hourlyData}
                onChange={handleHourlyDataChange}
                _pricePerHour={0}
                disabled={false}
              />
            )}
            {bookingType === 'NIGHTLY' && (
              <NightlyBookingForm
                value={nightlyData}
                onChange={handleNightlyDataChange}
                _pricePerNight={0}
                disabled={false}
              />
            )}
            {bookingType === 'DAILY' && (
              <DailyBookingForm
                value={dailyData}
                onChange={handleDailyDataChange}
                _pricePerDay={0}
                disabled={false}
              />
            )}
          </View>

          {/* Guest Selection */}
          <View className='border-t border-neutral-light px-4 py-4'>
            <Text className='mb-4 text-lg font-semibold text-text-primary'>
              {t('guests.title')}
            </Text>

            <GuestCounter
              label={t('guests.adults')}
              description={t('guests.adultsDescription')}
              count={adults}
              onIncrement={() => updateGuests('adults', 1)}
              onDecrement={() => updateGuests('adults', -1)}
              disableDecrement={adults <= 1}
              disableIncrement={adults >= 4}
            />

            <GuestCounter
              label={t('guests.children')}
              description={t('guests.childrenDescription')}
              count={children}
              onIncrement={() => updateGuests('children', 1)}
              onDecrement={() => updateGuests('children', -1)}
              disableDecrement={children <= 0}
              disableIncrement={children + infants >= 2}
            />

            <GuestCounter
              label={t('guests.infants')}
              description={t('guests.infantsDescription')}
              count={infants}
              onIncrement={() => updateGuests('infants', 1)}
              onDecrement={() => updateGuests('infants', -1)}
              disableDecrement={infants <= 0}
              disableIncrement={children + infants >= 2}
            />
          </View>
        </ScrollView>

        {/* Apply Button */}
        <View
          className='border-t border-neutral-light px-4 py-4'
          style={{ paddingBottom: insets.bottom + 16 }}
        >
          <Button title={t('buttons.apply')} onPress={handleApply} fullWidth />
        </View>
      </View>
    </Modal>
  );
}

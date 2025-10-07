import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';

import { HEX_COLORS } from '@/config/colors';

interface DateRange {
  startDate?: Date;
  endDate?: Date;
}

interface DateRangePickerProps {
  label: string;
  value: DateRange;
  onChange: (range: DateRange) => void;
  minDate?: Date;
  disabled?: boolean;
  placeholder?: string;
}

/**
 * Date Range Picker Component
 * Allows users to select a date range (check-in and check-out dates)
 * with a modal calendar interface
 */
export function DateRangePicker({
  label,
  value,
  onChange,
  minDate = new Date(),
  disabled = false,
  placeholder = 'Select date range',
}: DateRangePickerProps) {
  const { t } = useTranslation();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tempRange, setTempRange] = useState<DateRange>(value);

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const parseDate = (dateString: string): Date => {
    const [year, month, day] = dateString.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const handleDayPress = (day: DateData) => {
    const selectedDate = parseDate(day.dateString);

    if (!tempRange.startDate || (tempRange.startDate && tempRange.endDate)) {
      // First selection or resetting selection
      setTempRange({ startDate: selectedDate, endDate: undefined });
    } else if (selectedDate < tempRange.startDate) {
      // Selected date is before start date, make it the new start date
      setTempRange({ startDate: selectedDate, endDate: undefined });
    } else {
      // Second selection - set end date
      setTempRange({ ...tempRange, endDate: selectedDate });
    }
  };

  const handleConfirm = () => {
    if (tempRange.startDate && tempRange.endDate) {
      onChange(tempRange);
      setIsModalVisible(false);
    }
  };

  const handleCancel = () => {
    setTempRange(value);
    setIsModalVisible(false);
  };

  const getMarkedDates = () => {
    const marked: Record<
      string,
      {
        startingDay?: boolean;
        endingDay?: boolean;
        color?: string;
        textColor?: string;
      }
    > = {};

    if (!tempRange.startDate) return marked;

    const startDateString = formatDateString(tempRange.startDate);
    marked[startDateString] = {
      startingDay: true,
      color: HEX_COLORS.primary.main,
      textColor: 'white',
    };

    if (tempRange.endDate) {
      const endDateString = formatDateString(tempRange.endDate);

      // Mark all dates in between
      const currentDate = new Date(tempRange.startDate);
      currentDate.setDate(currentDate.getDate() + 1);

      while (currentDate < tempRange.endDate) {
        const dateString = formatDateString(currentDate);
        marked[dateString] = {
          color: HEX_COLORS.primary.lighter,
          textColor: HEX_COLORS.text.primary,
        };
        currentDate.setDate(currentDate.getDate() + 1);
      }

      marked[endDateString] = {
        endingDay: true,
        color: HEX_COLORS.primary.main,
        textColor: 'white',
      };
    }

    return marked;
  };

  const displayText = () => {
    if (value.startDate && value.endDate) {
      const start = format(value.startDate, 'dd MMM');
      const end = format(value.endDate, 'dd MMM yyyy');
      return `${start} - ${end}`;
    }
    return placeholder;
  };

  const hasValue = value.startDate && value.endDate;

  return (
    <View className='gap-2'>
      {/* Label */}
      <Text className='text-sm font-medium text-text-primary'>{label}</Text>

      {/* Trigger Button */}
      <Pressable
        onPress={() => !disabled && setIsModalVisible(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-xl border px-4 py-3 ${
          disabled
            ? 'border-neutral-light bg-neutral-lighter'
            : 'border-neutral-main bg-background-primary active:border-primary-main'
        }`}
      >
        <Text
          className={`flex-1 text-sm ${
            hasValue ? 'text-text-primary' : 'text-text-tertiary'
          }`}
        >
          {displayText()}
        </Text>
        <MaterialIcons
          name='date-range'
          size={20}
          color={
            disabled ? HEX_COLORS.text.secondary : HEX_COLORS.text.secondary
          }
        />
      </Pressable>

      {/* Modal */}
      <Modal
        visible={isModalVisible}
        animationType='slide'
        transparent
        onRequestClose={handleCancel}
      >
        <View className='flex-1 justify-end bg-black/50'>
          <View className='max-h-[85%] rounded-t-3xl bg-background-primary pb-8'>
            {/* Header */}
            <View className='border-b border-neutral-light px-4 py-4'>
              <Text className='text-center text-lg font-semibold text-text-primary'>
                {label}
              </Text>
              <Text className='mt-1 text-center text-xs text-text-secondary'>
                {tempRange.startDate && !tempRange.endDate
                  ? t('booking.selectCheckOutDate')
                  : t('booking.selectCheckInDate')}
              </Text>
            </View>

            {/* Calendar */}
            <View className='px-4 pt-4'>
              <Calendar
                minDate={formatDateString(minDate)}
                onDayPress={handleDayPress}
                markingType='period'
                markedDates={getMarkedDates()}
                theme={{
                  todayTextColor: HEX_COLORS.primary.main,
                  selectedDayBackgroundColor: HEX_COLORS.primary.main,
                  selectedDayTextColor: 'white',
                  arrowColor: HEX_COLORS.primary.main,
                  monthTextColor: HEX_COLORS.text.primary,
                  textMonthFontWeight: '600',
                  textDayFontSize: 14,
                  textMonthFontSize: 16,
                }}
              />
            </View>

            {/* Selected Range Display */}
            {tempRange.startDate && (
              <View className='mx-4 mt-4 rounded-xl bg-background-secondary p-4'>
                <View className='flex-row items-center justify-between'>
                  <View className='flex-1'>
                    <Text className='text-xs text-text-tertiary'>
                      {t('booking.checkIn')}
                    </Text>
                    <Text className='mt-1 text-sm font-medium text-text-primary'>
                      {format(tempRange.startDate, 'EEE, dd MMM yyyy')}
                    </Text>
                  </View>

                  {tempRange.endDate && (
                    <>
                      <MaterialIcons
                        name='arrow-forward'
                        size={20}
                        color={HEX_COLORS.text.secondary}
                      />
                      <View className='flex-1'>
                        <Text className='text-xs text-text-tertiary'>
                          {t('booking.checkOut')}
                        </Text>
                        <Text className='mt-1 text-sm font-medium text-text-primary'>
                          {format(tempRange.endDate, 'EEE, dd MMM yyyy')}
                        </Text>
                      </View>
                    </>
                  )}
                </View>
              </View>
            )}

            {/* Action Buttons */}
            <View className='mx-4 mt-4 flex-row gap-3'>
              <Pressable
                onPress={handleCancel}
                className='flex-1 items-center rounded-xl border border-neutral-main bg-background-primary py-3 active:opacity-70'
              >
                <Text className='font-medium text-text-primary'>
                  {t('buttons.cancel')}
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={!tempRange.startDate || !tempRange.endDate}
                className={`flex-1 items-center rounded-xl py-3 ${
                  tempRange.startDate && tempRange.endDate
                    ? 'bg-primary-main active:opacity-90'
                    : 'bg-neutral-lighter'
                }`}
              >
                <Text
                  className={`font-semibold ${
                    tempRange.startDate && tempRange.endDate
                      ? 'text-white'
                      : 'text-text-tertiary'
                  }`}
                >
                  {t('buttons.confirm')}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Calendar, type DateData } from 'react-native-calendars';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';
import { formatDateForCalendar, parseDateFromCalendar } from '@/utils/format';

interface DatePickerProps {
  label: string;
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  maxDate?: Date;
  disabled?: boolean;
  placeholder?: string;
  markedDates?: { [date: string]: { marked?: boolean; selected?: boolean } };
}

/**
 * Reusable date picker component using react-native-calendars
 */
export function DatePicker({
  label,
  value,
  onChange,
  minDate,
  maxDate,
  disabled = false,
  placeholder,
  markedDates = {},
}: DatePickerProps) {
  const { t } = useCommonTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const handleDateSelect = (date: DateData) => {
    const selectedDate = parseDateFromCalendar(date.dateString);
    onChange(selectedDate);
    setIsVisible(false);
  };

  const formatDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getMinDateString = () => {
    if (minDate) return formatDateForCalendar(minDate);
    return formatDateForCalendar(new Date()); // Default to today
  };

  const getMaxDateString = () => {
    if (maxDate) return formatDateForCalendar(maxDate);
    return undefined;
  };

  const getMarkedDates = () => {
    const marked = { ...markedDates };
    if (value) {
      const dateString = formatDateForCalendar(value);
      marked[dateString] = {
        selected: true,
      };
    }
    return marked;
  };

  return (
    <View className='gap-2'>
      {/* Label */}
      <Text className='text-sm font-medium text-text-primary'>{label}</Text>

      {/* Date Display Button */}
      <Pressable
        onPress={() => !disabled && setIsVisible(true)}
        disabled={disabled}
        className={`flex-row items-center justify-between rounded-lg border px-4 py-3 ${
          disabled
            ? 'border-neutral-light bg-neutral-lighter'
            : 'border-neutral-main bg-background-primary active:border-primary-main'
        }`}
      >
        <Text
          className={`flex-1 ${
            value ? 'text-text-primary' : 'text-text-tertiary'
          }`}
        >
          {value ? formatDate(value) : placeholder || t('booking.selectDate')}
        </Text>
        <MaterialIcons
          name='calendar-today'
          size={20}
          color={disabled ? HEX_COLORS.text.secondary : HEX_COLORS.primary.main}
        />
      </Pressable>

      {/* Calendar Modal */}
      <Modal
        visible={isVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setIsVisible(false)}
      >
        <Pressable
          className='flex-1 items-center justify-center bg-black/50'
          onPress={() => setIsVisible(false)}
        >
          <Pressable
            className='w-11/12 max-w-md overflow-hidden rounded-2xl bg-background-primary'
            onPress={e => e.stopPropagation()}
          >
            {/* Header */}
            <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
              <Text className='text-lg font-semibold text-text-primary'>
                {label}
              </Text>
              <Pressable
                onPress={() => setIsVisible(false)}
                className='h-8 w-8 items-center justify-center rounded-full active:bg-neutral-lighter'
              >
                <MaterialIcons
                  name='close'
                  size={20}
                  color={HEX_COLORS.text.primary}
                />
              </Pressable>
            </View>

            {/* Calendar */}
            <Calendar
              current={value ? formatDateForCalendar(value) : undefined}
              onDayPress={handleDateSelect}
              minDate={getMinDateString()}
              maxDate={getMaxDateString()}
              markedDates={getMarkedDates()}
              theme={{
                backgroundColor: HEX_COLORS.background.primary,
                calendarBackground: HEX_COLORS.background.primary,
                textSectionTitleColor: HEX_COLORS.text.secondary,
                selectedDayBackgroundColor: HEX_COLORS.primary.main,
                selectedDayTextColor: '#ffffff',
                todayTextColor: HEX_COLORS.primary.main,
                dayTextColor: HEX_COLORS.text.primary,
                textDisabledColor: HEX_COLORS.text.secondary,
                monthTextColor: HEX_COLORS.text.primary,
                indicatorColor: HEX_COLORS.primary.main,
                textDayFontFamily: 'System',
                textMonthFontFamily: 'System',
                textDayHeaderFontFamily: 'System',
                textDayFontWeight: '400',
                textMonthFontWeight: '600',
                textDayHeaderFontWeight: '500',
                textDayFontSize: 14,
                textMonthFontSize: 16,
                textDayHeaderFontSize: 12,
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

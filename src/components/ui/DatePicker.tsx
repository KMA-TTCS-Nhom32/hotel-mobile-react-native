import { MaterialIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
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

// Generate an array of years for the picker
const generateYears = (minYear: number, maxYear: number): number[] => {
  const years: number[] = [];
  for (let year = maxYear; year >= minYear; year--) {
    years.push(year);
  }
  return years;
};

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type PickerMode = 'calendar' | 'year' | 'month';

/**
 * Reusable date picker component using react-native-calendars
 * with year/month selection for easy navigation
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
  const [pickerMode, setPickerMode] = useState<PickerMode>('calendar');
  const [currentDate, setCurrentDate] = useState(() => {
    return value || new Date();
  });

  // Generate available years
  const years = useMemo(() => {
    const minYear = minDate ? minDate.getFullYear() : 1900;
    const maxYear = maxDate ? maxDate.getFullYear() : new Date().getFullYear();
    return generateYears(minYear, maxYear);
  }, [minDate, maxDate]);

  const handleDateSelect = (date: DateData) => {
    const selectedDate = parseDateFromCalendar(date.dateString);
    onChange(selectedDate);
    setIsVisible(false);
    setPickerMode('calendar');
  };

  const handleClose = () => {
    setIsVisible(false);
    setPickerMode('calendar');
  };

  const formatDisplayDate = (date: Date) => {
    return format(date, 'MMM dd, yyyy');
  };

  const getMinDateString = () => {
    if (minDate) return formatDateForCalendar(minDate);
    return undefined;
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

  const handleYearSelect = useCallback(
    (year: number) => {
      const newDate = new Date(currentDate);
      newDate.setFullYear(year);
      setCurrentDate(newDate);
      setPickerMode('calendar');
    },
    [currentDate]
  );

  const handleMonthSelect = useCallback(
    (monthIndex: number) => {
      const newDate = new Date(currentDate);
      newDate.setMonth(monthIndex);
      setCurrentDate(newDate);
      setPickerMode('calendar');
    },
    [currentDate]
  );

  const handleMonthChange = useCallback((date: DateData) => {
    const newDate = parseDateFromCalendar(date.dateString);
    setCurrentDate(newDate);
  }, []);

  // Custom header component for the calendar
  const renderCustomHeader = useCallback(() => {
    const monthName = MONTHS[currentDate.getMonth()];
    const year = currentDate.getFullYear();

    return (
      <View className='mb-2 flex-row items-center justify-between px-2 py-3'>
        {/* Month/Year selector */}
        <View className='flex-row items-center gap-2'>
          <TouchableOpacity
            onPress={() => setPickerMode('month')}
            className='flex-row items-center rounded-lg bg-neutral-lighter px-3 py-2'
          >
            <Text className='font-semibold text-text-primary'>{monthName}</Text>
            <MaterialIcons
              name='arrow-drop-down'
              size={20}
              color={HEX_COLORS.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setPickerMode('year')}
            className='flex-row items-center rounded-lg bg-neutral-lighter px-3 py-2'
          >
            <Text className='font-semibold text-text-primary'>{year}</Text>
            <MaterialIcons
              name='arrow-drop-down'
              size={20}
              color={HEX_COLORS.text.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Navigation arrows */}
        <View className='flex-row items-center gap-1'>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() - 1);
              setCurrentDate(newDate);
            }}
            className='h-8 w-8 items-center justify-center rounded-full active:bg-neutral-lighter'
          >
            <MaterialIcons
              name='chevron-left'
              size={24}
              color={HEX_COLORS.primary.main}
            />
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              const newDate = new Date(currentDate);
              newDate.setMonth(newDate.getMonth() + 1);
              setCurrentDate(newDate);
            }}
            className='h-8 w-8 items-center justify-center rounded-full active:bg-neutral-lighter'
          >
            <MaterialIcons
              name='chevron-right'
              size={24}
              color={HEX_COLORS.primary.main}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }, [currentDate]);

  // Render year picker content
  const renderYearPicker = () => (
    <View style={{ height: 320 }}>
      <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
        <TouchableOpacity onPress={() => setPickerMode('calendar')}>
          <MaterialIcons
            name='arrow-back'
            size={24}
            color={HEX_COLORS.primary.main}
          />
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-text-primary'>
          Select Year
        </Text>
        <View className='w-6' />
      </View>
      <ScrollView
        showsVerticalScrollIndicator
        contentContainerStyle={{ paddingVertical: 8 }}
      >
        {years.map(year => (
          <TouchableOpacity
            key={year}
            onPress={() => handleYearSelect(year)}
            className={`items-center py-3 ${
              year === currentDate.getFullYear() ? 'bg-primary-lighter' : ''
            }`}
          >
            <Text
              className={`text-base ${
                year === currentDate.getFullYear()
                  ? 'font-bold text-primary-main'
                  : 'text-text-primary'
              }`}
            >
              {year}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  // Render month picker content
  const renderMonthPicker = () => (
    <View>
      <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
        <TouchableOpacity onPress={() => setPickerMode('calendar')}>
          <MaterialIcons
            name='arrow-back'
            size={24}
            color={HEX_COLORS.primary.main}
          />
        </TouchableOpacity>
        <Text className='text-lg font-semibold text-text-primary'>
          Select Month
        </Text>
        <View className='w-6' />
      </View>
      <View className='flex-row flex-wrap p-2'>
        {MONTHS.map((month, index) => (
          <TouchableOpacity
            key={month}
            onPress={() => handleMonthSelect(index)}
            className={`w-1/3 items-center rounded-lg py-4 ${
              index === currentDate.getMonth()
                ? 'bg-primary-lighter'
                : 'active:bg-neutral-lighter'
            }`}
          >
            <Text
              className={`text-sm ${
                index === currentDate.getMonth()
                  ? 'font-bold text-primary-main'
                  : 'text-text-primary'
              }`}
            >
              {month.slice(0, 3)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  // Render calendar content
  const renderCalendar = () => (
    <>
      {/* Header */}
      <View className='flex-row items-center justify-between border-b border-neutral-light px-4 py-3'>
        <Text className='text-lg font-semibold text-text-primary'>{label}</Text>
        <Pressable
          onPress={handleClose}
          className='h-8 w-8 items-center justify-center rounded-full active:bg-neutral-lighter'
        >
          <MaterialIcons
            name='close'
            size={20}
            color={HEX_COLORS.text.primary}
          />
        </Pressable>
      </View>

      {/* Calendar with custom header */}
      <Calendar
        key={formatDateForCalendar(currentDate)}
        current={formatDateForCalendar(currentDate)}
        onDayPress={handleDateSelect}
        onMonthChange={handleMonthChange}
        minDate={getMinDateString()}
        maxDate={getMaxDateString()}
        markedDates={getMarkedDates()}
        customHeader={renderCustomHeader}
        hideArrows
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
          arrowColor: HEX_COLORS.primary.main,
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
    </>
  );

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
          {value
            ? formatDisplayDate(value)
            : placeholder || t('booking.selectDate')}
        </Text>
        <MaterialIcons
          name='calendar-today'
          size={20}
          color={disabled ? HEX_COLORS.text.secondary : HEX_COLORS.primary.main}
        />
      </Pressable>

      {/* Single Modal with different content based on mode */}
      <Modal
        visible={isVisible}
        transparent
        animationType='fade'
        onRequestClose={handleClose}
      >
        <Pressable
          className='flex-1 items-center justify-center bg-black/50'
          onPress={handleClose}
        >
          <Pressable
            className='w-11/12 max-w-md overflow-hidden rounded-2xl bg-background-primary'
            onPress={e => e.stopPropagation()}
          >
            {pickerMode === 'calendar' && renderCalendar()}
            {pickerMode === 'year' && renderYearPicker()}
            {pickerMode === 'month' && renderMonthPicker()}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

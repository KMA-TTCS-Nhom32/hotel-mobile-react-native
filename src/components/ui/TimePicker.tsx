import { MaterialIcons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ListRenderItem,
} from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';

interface TimePickerProps {
  label: string;
  value?: string; // Format: "HH:mm" e.g., "09:00"
  onChange: (time: string) => void;
  minTime?: string; // Format: "HH:mm"
  maxTime?: string; // Format: "HH:mm"
  step?: number; // Minutes step (default: 30)
  disabled?: boolean;
  placeholder?: string;
  disabledTimes?: string[]; // Array of disabled time slots
}

/**
 * Generate time slots between min and max time with given step
 */
function generateTimeSlots(
  minTime: string,
  maxTime: string,
  step: number
): string[] {
  const slots: string[] = [];
  const [minHour, minMinute] = minTime.split(':').map(Number);
  const [maxHour, maxMinute] = maxTime.split(':').map(Number);

  const minTotalMinutes = minHour * 60 + minMinute;
  const maxTotalMinutes = maxHour * 60 + maxMinute;

  for (
    let minutes = minTotalMinutes;
    minutes <= maxTotalMinutes;
    minutes += step
  ) {
    const hour = Math.floor(minutes / 60);
    const minute = minutes % 60;
    slots.push(
      `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
    );
  }

  return slots;
}

/**
 * Reusable time picker component with scroll selection
 */
export function TimePicker({
  label,
  value,
  onChange,
  minTime = '00:00',
  maxTime = '23:59',
  step = 30,
  disabled = false,
  placeholder,
  disabledTimes = [],
}: TimePickerProps) {
  const { t } = useCommonTranslation();
  const [isVisible, setIsVisible] = useState(false);

  const timeSlots = generateTimeSlots(minTime, maxTime, step);

  const handleTimeSelect = (time: string) => {
    if (disabledTimes.includes(time)) return;
    onChange(time);
    setIsVisible(false);
  };

  const renderTimeSlot: ListRenderItem<string> = ({ item }) => {
    const isSelected = item === value;
    const isDisabled = disabledTimes.includes(item);
    return (
      <Pressable
        onPress={() => handleTimeSelect(item)}
        disabled={isDisabled}
        className={`border-b border-neutral-light px-6 py-4 ${
          isDisabled
            ? 'bg-neutral-lighter'
            : isSelected
              ? 'bg-primary-lighter'
              : 'bg-background-primary active:bg-primary-lighter'
        }`}
      >
        <Text
          className={`text-center text-base ${
            isDisabled
              ? 'font-normal text-text-tertiary line-through'
              : isSelected
                ? 'font-semibold text-primary-main'
                : 'font-normal text-text-primary'
          }`}
        >
          {item}
        </Text>
      </Pressable>
    );
  };

  const getInitialScrollIndex = () => {
    if (value) {
      const index = timeSlots.indexOf(value);
      return index !== -1 ? index : 0;
    }
    return 0;
  };

  return (
    <View className='gap-2'>
      {/* Label */}
      <Text className='text-sm font-medium text-text-primary'>{label}</Text>

      {/* Time Display Button */}
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
          {value || placeholder || t('booking.selectTime')}
        </Text>
        <MaterialIcons
          name='access-time'
          size={20}
          color={disabled ? HEX_COLORS.text.secondary : HEX_COLORS.primary.main}
        />
      </Pressable>

      {/* Time Picker Modal */}
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
            className='max-h-96 w-80 overflow-hidden rounded-2xl bg-background-primary'
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

            {/* Time Slots List */}
            <FlatList
              data={timeSlots}
              renderItem={renderTimeSlot}
              keyExtractor={item => item}
              initialScrollIndex={getInitialScrollIndex()}
              getItemLayout={(_, index) => ({
                length: 56, // py-4 = 16px * 2 + text height
                offset: 56 * index,
                index,
              })}
              onScrollToIndexFailed={() => {
                // Handle scroll failure gracefully
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

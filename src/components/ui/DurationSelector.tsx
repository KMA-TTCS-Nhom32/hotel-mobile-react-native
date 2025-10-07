import { MaterialIcons } from '@expo/vector-icons';
import { Text, View, Pressable } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';

interface DurationSelectorProps {
  label: string;
  value?: number; // Duration in hours
  onChange: (hours: number) => void;
  minHours: number;
  maxHours: number;
  unit?: 'hours' | 'days' | 'nights';
  disabled?: boolean;
  showPricePerUnit?: boolean;
  pricePerUnit?: number;
}

/**
 * Reusable duration selector for booking hours/days
 */
export function DurationSelector({
  label,
  value,
  onChange,
  minHours,
  maxHours,
  unit = 'hours',
  disabled = false,
  showPricePerUnit = false,
  pricePerUnit = 0,
}: DurationSelectorProps) {
  const { t } = useCommonTranslation();

  const getUnitLabel = (count: number) => {
    if (unit === 'hours') {
      return count === 1 ? t('booking.hour') : t('booking.hours');
    }
    if (unit === 'days') {
      return count === 1 ? t('booking.day') : t('booking.days');
    }
    return count === 1 ? t('booking.night') : t('booking.nights');
  };

  const handleDecrease = () => {
    if (value && value > minHours) {
      onChange(value - 1);
    }
  };

  const handleIncrease = () => {
    if (value && value < maxHours) {
      onChange(value + 1);
    }
  };

  const canDecrease = value !== undefined && value > minHours;
  const canIncrease = value !== undefined && value < maxHours;

  return (
    <View className='gap-2'>
      {/* Label */}
      <Text className='text-sm font-medium text-text-primary'>{label}</Text>

      {/* Duration Selector */}
      <View className='flex-row items-center justify-between rounded-lg border border-neutral-main bg-background-primary px-4 py-3'>
        {/* Decrease Button */}
        <Pressable
          onPress={handleDecrease}
          disabled={disabled || !canDecrease}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            disabled || !canDecrease
              ? 'bg-neutral-lighter'
              : 'bg-primary-lighter active:bg-primary-light'
          }`}
        >
          <MaterialIcons
            name='remove'
            size={20}
            color={
              disabled || !canDecrease
                ? HEX_COLORS.text.secondary
                : HEX_COLORS.primary.main
            }
          />
        </Pressable>

        {/* Duration Display */}
        <View className='flex-1 items-center gap-1'>
          <Text className='text-2xl font-bold text-primary-main'>
            {value || minHours}
          </Text>
          <Text className='text-xs text-text-secondary'>
            {getUnitLabel(value || minHours)}
          </Text>
          {showPricePerUnit && pricePerUnit > 0 && value && (
            <Text className='text-xs text-text-tertiary'>
              {(pricePerUnit * value).toLocaleString()}₫
            </Text>
          )}
        </View>

        {/* Increase Button */}
        <Pressable
          onPress={handleIncrease}
          disabled={disabled || !canIncrease}
          className={`h-10 w-10 items-center justify-center rounded-full ${
            disabled || !canIncrease
              ? 'bg-neutral-lighter'
              : 'bg-primary-lighter active:bg-primary-light'
          }`}
        >
          <MaterialIcons
            name='add'
            size={20}
            color={
              disabled || !canIncrease
                ? HEX_COLORS.text.secondary
                : HEX_COLORS.primary.main
            }
          />
        </Pressable>
      </View>

      {/* Min/Max Info */}
      <View className='flex-row items-center justify-between px-1'>
        <Text className='text-xs text-text-tertiary'>
          {t('booking.minimumDuration', { count: minHours })}
        </Text>
        <Text className='text-xs text-text-tertiary'>
          {t('booking.maximumDuration', { count: maxHours })}
        </Text>
      </View>
    </View>
  );
}

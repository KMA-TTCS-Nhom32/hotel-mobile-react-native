import { Pressable, Text, View } from 'react-native';

import { useCommonTranslation } from '@/i18n/hooks';

interface DurationBadgeSelectorProps {
  label: string;
  value?: number; // Duration in hours
  onChange: (hours: number) => void;
  minHours: number;
  maxHours: number;
  disabled?: boolean;
}

/**
 * Badge-based duration selector with rounded badges
 * Light orange background for selected, similar to amenity badges
 */
export function DurationBadgeSelector({
  label,
  value,
  onChange,
  minHours,
  maxHours,
  disabled = false,
}: DurationBadgeSelectorProps) {
  const { t } = useCommonTranslation();

  // Generate array of hours from min to max
  const hourOptions = Array.from(
    { length: maxHours - minHours + 1 },
    (_, i) => minHours + i
  );

  const getUnitLabel = (count: number) => {
    return count === 1 ? t('booking.hour') : t('booking.hours');
  };

  return (
    <View className='gap-2'>
      {/* Label */}
      <Text className='text-sm font-medium text-text-primary'>{label}</Text>

      {/* Badge Grid */}
      <View className='flex-row flex-wrap gap-3'>
        {hourOptions.map(hours => {
          const isSelected = hours === value;
          const isDisabled = disabled || hours > maxHours;

          return (
            <Pressable
              key={hours}
              onPress={() => !isDisabled && onChange(hours)}
              disabled={isDisabled}
              className={`rounded-full px-4 py-2.5 ${
                isDisabled
                  ? 'bg-neutral-lighter'
                  : isSelected
                    ? 'bg-primary-lighter'
                    : 'bg-background-secondary active:bg-primary-lighter/70'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  isDisabled
                    ? 'text-text-tertiary'
                    : isSelected
                      ? 'text-primary-main'
                      : 'text-text-secondary'
                }`}
              >
                {hours} {getUnitLabel(hours)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

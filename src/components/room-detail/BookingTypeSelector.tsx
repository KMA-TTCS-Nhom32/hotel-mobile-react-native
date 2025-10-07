import { Pressable, Text, View } from 'react-native';

import { useCommonTranslation } from '@/i18n/hooks';

export type BookingType = 'HOURLY' | 'NIGHTLY' | 'DAILY';

interface BookingTypeSelectorProps {
  selectedType: BookingType;
  onTypeChange: (type: BookingType) => void;
}

/**
 * Booking type selector with three tabs: Hourly, Nightly, Daily
 */
export function BookingTypeSelector({
  selectedType,
  onTypeChange,
}: BookingTypeSelectorProps) {
  const { t } = useCommonTranslation();

  const bookingTypes: {
    value: BookingType;
    label: string;
    description: string;
  }[] = [
    {
      value: 'HOURLY',
      label: t('bookingType.hourly'),
      description: t('bookingType.hourlyDescription'),
    },
    {
      value: 'NIGHTLY',
      label: t('bookingType.nightly'),
      description: t('bookingType.nightlyDescription'),
    },
    {
      value: 'DAILY',
      label: t('bookingType.daily'),
      description: t('bookingType.dailyDescription'),
    },
  ];

  return (
    <View className='border-b border-neutral-light px-4 py-6'>
      <Text className='mb-4 text-lg font-semibold text-text-primary'>
        {t('roomDetail.selectBookingType')}
      </Text>

      <View className='gap-3'>
        {bookingTypes.map(type => {
          const isSelected = selectedType === type.value;
          return (
            <Pressable
              key={type.value}
              onPress={() => onTypeChange(type.value)}
              className={`rounded-xl border p-4 active:opacity-70 ${
                isSelected
                  ? 'border-primary-main bg-primary-lighter'
                  : 'border-neutral-light bg-background-primary'
              }`}
            >
              <View className='flex-row items-center justify-between'>
                <View className='flex-1'>
                  <Text
                    className={`mb-1 text-base font-semibold ${
                      isSelected ? 'text-primary-main' : 'text-text-primary'
                    }`}
                  >
                    {type.label}
                  </Text>
                  <Text className='text-sm text-text-secondary'>
                    {type.description}
                  </Text>
                </View>

                {/* Radio Button */}
                <View
                  className={`ml-2 h-6 w-6 rounded-full border-2 ${
                    isSelected
                      ? 'border-primary-main bg-primary-main'
                      : 'border-neutral-main'
                  }`}
                >
                  {isSelected && (
                    <View className='m-auto h-2 w-2 rounded-full bg-white' />
                  )}
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

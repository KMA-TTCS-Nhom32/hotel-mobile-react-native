import type { Province } from '@ahomevilla-hotel/node-sdk';
import { MaterialIcons } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import { HEX_COLORS } from '@/config/colors';
import { useCommonTranslation } from '@/i18n/hooks';

interface BranchInfoSectionProps {
  name: string;
  description: string;
  address: string;
  phone: string;
  rating?: number | null;
  province: Province;
}

/**
 * Branch information section with name, description, rating, and contact details
 */
export function BranchInfoSection({
  name,
  description,
  address,
  phone,
  rating,
  province,
}: BranchInfoSectionProps) {
  const { t } = useCommonTranslation();

  const provinceDisplayName = province.translations?.[0]?.name || province.name;

  return (
    <View className='px-4 pb-6'>
      {/* Branch Name and Rating */}
      <View className='mb-3 flex-row items-start justify-between'>
        <View className='flex-1 pr-4'>
          <Text className='mb-1 text-2xl font-bold text-text-primary'>
            {name}
          </Text>
          <Text className='text-sm text-text-tertiary'>
            {provinceDisplayName}
          </Text>
        </View>

        {rating && (
          <View className='flex-row items-center gap-1 rounded-lg bg-yellow-500/10 px-3 py-1.5'>
            <MaterialIcons name='star' size={18} color='#eab308' />
            <Text className='text-base font-semibold text-yellow-600'>
              {rating.toFixed(1)}
            </Text>
          </View>
        )}
      </View>

      {/* Description */}
      {description && (
        <View className='mb-4'>
          <Text className='mb-2 text-lg font-semibold text-text-primary'>
            {t('branchDetail.about')}
          </Text>
          <Text className='text-sm leading-6 text-text-secondary'>
            {description}
          </Text>
        </View>
      )}

      {/* Address */}
      <View className='mb-3 flex-row gap-3'>
        <MaterialIcons
          name='location-on'
          size={20}
          color={HEX_COLORS.text.secondary}
        />
        <Text className='flex-1 text-sm text-text-secondary'>{address}</Text>
      </View>

      {/* Phone */}
      <View className='flex-row gap-3'>
        <MaterialIcons
          name='phone'
          size={20}
          color={HEX_COLORS.text.secondary}
        />
        <Text className='flex-1 text-sm text-text-secondary'>{phone}</Text>
      </View>
    </View>
  );
}

import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCommonTranslation } from '@/i18n/hooks';

interface BookNowButtonProps {
  onPress: () => void;
}

/**
 * Fixed bottom "Book Now" button with safe area support
 */
export function BookNowButton({ onPress }: BookNowButtonProps) {
  const { t } = useCommonTranslation();
  const insets = useSafeAreaInsets();

  return (
    <View
      className='absolute bottom-0 left-0 right-0 border-t border-neutral-light bg-background-primary px-4'
      style={{
        paddingBottom: Math.max(insets.bottom, 16),
        paddingTop: 16,
      }}
    >
      <Pressable
        onPress={onPress}
        className='w-full items-center justify-center rounded-xl bg-primary-main py-4 active:bg-primary-dark'
      >
        <Text className='text-lg font-semibold text-primary-foreground'>
          {t('branchDetail.bookNow')}
        </Text>
      </Pressable>
    </View>
  );
}
